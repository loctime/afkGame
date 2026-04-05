import { EnemyData } from '../../types/game';
import { GameStore } from '../../stores/types';
import { SkillEffectManager } from './SkillEffectManager';
import { PlayerManager } from './PlayerManager';
import { EnemyManager } from './EnemyManager';
import { getTotalStats } from '../../core/systems/utils';
import { GAME_CONFIG } from '../../core/balance/game-config';
import { generateDropItem } from '../../utils/itemGenerator';

// Seconds between each combat round (player attacks + enemy counter-attacks)
const ATTACK_INTERVAL = 2.5;

export class CombatManager {
  private getStore: () => GameStore;
  private skillEffectManager: SkillEffectManager;
  private playerManager: PlayerManager;
  private enemyManager: EnemyManager;
  private onStartWave: (wave: number) => void;
  // Accumulates elapsed time; a combat round fires when it reaches ATTACK_INTERVAL
  private attackAccumulator = 0;
  private postBossTimeout: ReturnType<typeof setTimeout> | null = null;
  private poisonTimeouts: ReturnType<typeof setTimeout>[] = [];

  constructor(
    getStore: () => GameStore,
    skillEffectManager: SkillEffectManager,
    playerManager: PlayerManager,
    enemyManager: EnemyManager,
    onStartWave: (wave: number) => void,
  ) {
    this.getStore = getStore;
    this.skillEffectManager = skillEffectManager;
    this.playerManager = playerManager;
    this.enemyManager = enemyManager;
    this.onStartWave = onStartWave;
  }

  public updateCombat(deltaTime: number) {
    if (!this.getStore().gameState.isFighting) return;
    if (this.getStore().renderState.enemies.length === 0) return;

    const player = this.getStore().player;

    // Actualizar cooldowns de skills
    this.getStore().updateSkillCooldowns(deltaTime);

    // Accumulate time; only trigger a combat round once per ATTACK_INTERVAL seconds
    this.attackAccumulator += deltaTime;
    if (this.attackAccumulator < ATTACK_INTERVAL) return;
    this.attackAccumulator -= ATTACK_INTERVAL;

    {
      // Taunt logic: prioritize enemies with taunt status
      const enemies = this.getStore().renderState.enemies;
      let enemy = enemies[0];
      
      const tauntedEnemy = enemies.find(e => e.statusEffect === 'taunt');
      if (tauntedEnemy) {
        enemy = tauntedEnemy;
        // Add taunt status effect if not already active
        if (!this.getStore().gameState.activeStatusEffects.includes('taunt')) {
          this.getStore().addStatusEffect('taunt');
        }
      } else {
        // Remove taunt status effect if no taunted enemies
        if (this.getStore().gameState.activeStatusEffects.includes('taunt')) {
          this.getStore().removeStatusEffect('taunt');
        }
      }

      // Intentar usar skills automáticamente
      const skillUsed = this.tryUseSkill(enemy);

      if (!skillUsed) {
        // Usar ataque básico si no se usó ningún skill
        this.useBasicAttack(enemy);
      }

      if (enemy.hp <= 0) {
        // Enemy defeated — use store actions so Zustand triggers re-renders
        this.getStore().gainXp(enemy.xpReward);
        this.getStore().gainGold(enemy.goldReward);

        // Drop check: 10% chance of item drop
        if (Math.random() < GAME_CONFIG.DROPS.BASE_DROP_RATE) {
          const currentWave = this.getStore().gameState.currentWave;
          const droppedItem = generateDropItem(currentWave);
          this.getStore().addItem(droppedItem);
        }

        // Remove sprite via EnemyManager (it owns all PIXI objects)
        this.enemyManager.removeEnemy(enemy.id);

        // Remove data from store (triggers re-render)
        this.getStore().removeEnemy(enemy.id);

        // Check if wave completed (read fresh state after removal)
        if (this.getStore().renderState.enemies.length === 0) {
          this.completeWave();
        }
      } else {
        // Enemy attacks player — mitigate with VIT (0.5 per point, min 1), then show hit animation
        const defStats = getTotalStats(this.getStore().player, this.getStore().equipment);
        const mitigated = Math.max(1, enemy.damage - Math.floor(defStats.vit * 0.5));
        
        // Poison logic: 40% chance for ranged enemies to apply poison
        if (enemy.statusEffect === 'poison' && Math.random() < 0.4) {
          // Check if poison is already active
          const currentEffects = this.getStore().gameState.activeStatusEffects;
          if (!currentEffects.includes('poison')) {
            this.getStore().addStatusEffect('poison');
            let poisonTicks = 0;
            
            const applyPoison = () => {
              if (poisonTicks < 3) {
                this.getStore().takeDamage(5);
                poisonTicks++;
                const t = setTimeout(applyPoison, 2000);
                this.poisonTimeouts.push(t);
              } else {
                this.getStore().removeStatusEffect('poison');
                this.poisonTimeouts = [];
              }
            };
            
            const t = setTimeout(applyPoison, 2000);
            this.poisonTimeouts.push(t);
          }
        }
        
        this.getStore().takeDamage(mitigated);

        // Delay hit animation so attack animation ('run'=verde) is visible first (~250ms)
        setTimeout(() => {
          this.playerManager.changeAnimation('hit');
          setTimeout(() => {
            this.playerManager.changeAnimation('idle');
          }, 500);
        }, 250);

        // Read fresh HP after damage
        if (this.getStore().player.hp <= 0) {
          this.gameOver();
        }
      }
    }
  }

  private tryUseSkill(enemy: EnemyData): boolean {
    const skills = this.getStore().skills;
    const player = this.getStore().player;
    const playerSprite = this.playerManager.getPlayer();

    if (!playerSprite) return false;

    // Get the enemy's current screen position from EnemyManager (owns all sprites)
    const enemyPos = this.enemyManager.getSpritePosition(enemy.id);

    // Priorizar skills de curación si la salud está baja
    if (player.hp < player.maxHp * 0.3) {
      const healSkill = skills.find(s => s.type === 'heal' && s.currentCooldown === 0);
      if (healSkill && player.mp >= healSkill.manaCost) {
        this.getStore().useSkill(healSkill.id);
        this.skillEffectManager.createHealEffect(playerSprite.x, playerSprite.y);
        this.playerManager.changeAnimation('run');
        setTimeout(() => this.playerManager.changeAnimation('idle'), 300);
        return true;
      }
    }

    // Usar skills de ataque si hay mana disponible
    const attackSkill = skills.find(s => s.type === 'attack' && s.currentCooldown === 0 && s.id !== 'basic_attack');
    if (attackSkill && player.mp >= attackSkill.manaCost) {
      this.getStore().useSkill(attackSkill.id);
      const skillDamage = attackSkill.damage || 0;
      
      // Check for dodge
      if (Math.random() < enemy.dodgeChance) {
        // Attack missed
        if (enemyPos) {
          this.playerManager.faceTarget(enemyPos.x);
          this.skillEffectManager.createDamageNumber(enemyPos.x, enemyPos.y - 20, 0, false);
        }
      } else {
        // Attack hit
        enemy.hp -= skillDamage;
        this.getStore().updateEnemyHp(enemy.id, enemy.hp);
        
        // Reflect logic: return 20% damage to player
        if (enemy.statusEffect === 'reflect') {
          const reflectDamage = Math.floor(skillDamage * 0.2);
          this.getStore().takeDamage(reflectDamage);
        }
        
        if (this.getStore().player.hp <= 0) {
          this.gameOver();
          return false;
        }
        
        if (enemyPos) {
          this.playerManager.faceTarget(enemyPos.x);
          if (attackSkill.id === 'fire_ball') {
            this.skillEffectManager.createFireballEffect(playerSprite.x, playerSprite.y, enemyPos.x, enemyPos.y);
          } else if (attackSkill.id === 'ice_shard') {
            this.skillEffectManager.createIceShardEffect(playerSprite.x, playerSprite.y, enemyPos.x, enemyPos.y);
          } else if (attackSkill.id === 'lightning_bolt') {
            this.skillEffectManager.createLightningBoltEffect(playerSprite.x, playerSprite.y, enemyPos.x, enemyPos.y);
          } else {
            this.skillEffectManager.createBasicAttackEffect(playerSprite.x, playerSprite.y, enemyPos.x, enemyPos.y);
          }
          this.skillEffectManager.createDamageNumber(enemyPos.x, enemyPos.y - 20, skillDamage, true);
        }
      }

      this.playerManager.changeAnimation('run');
      setTimeout(() => this.playerManager.changeAnimation('idle'), 300);
      return true;
    }

    return false;
  }

  private useBasicAttack(enemy: EnemyData) {
    const basicAttack = this.getStore().skills.find(s => s.id === 'basic_attack');
    const playerSprite = this.playerManager.getPlayer();

    if (basicAttack && playerSprite) {
      this.getStore().useSkill(basicAttack.id);
      const player = this.getStore().player;
      const equipment = this.getStore().equipment;
      const totalStats = getTotalStats(player, equipment);
      const weaponBonus = equipment.weapon?.damage || 0;
      const damageAmount = (basicAttack.damage || 0)
        + (totalStats.str * GAME_CONFIG.STATS.STR_DAMAGE_MULTIPLIER)
        + weaponBonus;
      
      // Check for dodge
      if (Math.random() < enemy.dodgeChance) {
        // Attack missed
        const enemyPos = this.enemyManager.getSpritePosition(enemy.id);
        if (enemyPos) {
          this.playerManager.faceTarget(enemyPos.x);
          this.skillEffectManager.createDamageNumber(enemyPos.x, enemyPos.y - 20, 0, false);
        }
      } else {
        // Attack hit
        enemy.hp -= damageAmount;
        this.getStore().updateEnemyHp(enemy.id, enemy.hp);
        
        // Reflect logic: return 20% damage to player
        if (enemy.statusEffect === 'reflect') {
          const reflectDamage = Math.floor(damageAmount * 0.2);
          this.getStore().takeDamage(reflectDamage);
        }
        
        if (this.getStore().player.hp <= 0) {
          this.gameOver();
          return;
        }
        
        const enemyPos = this.enemyManager.getSpritePosition(enemy.id);
        if (enemyPos) {
          this.playerManager.faceTarget(enemyPos.x);
          this.skillEffectManager.createBasicAttackEffect(playerSprite.x, playerSprite.y, enemyPos.x, enemyPos.y);
          this.skillEffectManager.createDamageNumber(enemyPos.x, enemyPos.y - 20, damageAmount);
        }
      }

      this.playerManager.changeAnimation('run');
      setTimeout(() => this.playerManager.changeAnimation('idle'), 200);
    }
  }

  private completeWave() {
    // Limpiar todos los status effects del jugador al terminar la wave
    this.getStore().removeStatusEffect('poison');
    this.getStore().removeStatusEffect('taunt');
    this.poisonTimeouts.forEach(t => clearTimeout(t));
    this.poisonTimeouts = [];
    
    const currentWave = this.getStore().gameState.currentWave;
    const nextWave = currentWave + 1;

    if (currentWave % 10 === 0) {
      // Boss derrotado — avanzar a la siguiente fase
      this.getStore().winBossFight();
      const afterBossWave = this.getStore().gameState.currentWave;
      this.postBossTimeout = setTimeout(() => {
        this.postBossTimeout = null;
        this.onStartWave(afterBossWave);
      }, 1000);
    } else if (nextWave % 10 === 0) {
      // Siguiente wave es boss — pausar y esperar confirmación del jugador
      this.getStore().setWave(nextWave);       // isInBossWave = true
      this.getStore().setIsFighting(false);    // pausa; UI detecta isInBossWave && !isFighting
    } else {
      // Wave regular — auto-avanzar
      this.getStore().setWave(nextWave);
      setTimeout(() => this.onStartWave(nextWave), 500);
    }
  }

  private gameOver() {
    // Cancelar veneno activo
    this.poisonTimeouts.forEach(t => clearTimeout(t));
    this.poisonTimeouts = [];
    this.getStore().removeStatusEffect('poison');
    
    // Pausar combate
    this.getStore().setIsFighting(false);

    // Mostrar animación de muerte
    this.playerManager.changeAnimation('dead');

    // Revivir en la wave 1 de la fase actual después de 2 segundos
    setTimeout(() => {
      const currentWave = this.getStore().gameState.currentWave;
      const phaseIndex = Math.floor((currentWave - 1) / 10);
      const reviveWave = phaseIndex * 10 + 1;

      this.getStore().heal(this.getStore().player.maxHp);
      this.getStore().setWave(reviveWave);
      this.playerManager.changeAnimation('idle');

      // Reiniciar combate en la wave de inicio de fase
      setTimeout(() => this.onStartWave(reviveWave), 500);
    }, 2000);
  }

  public resetAccumulator() {
    this.attackAccumulator = 0;
  }

  public destroy() {
    if (this.postBossTimeout) {
      clearTimeout(this.postBossTimeout);
      this.postBossTimeout = null;
    }
    this.poisonTimeouts.forEach(t => clearTimeout(t));
    this.poisonTimeouts = [];
  }
}
