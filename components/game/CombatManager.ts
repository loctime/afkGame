import { EnemyData } from '../../types/game';
import { GameStore } from '../../stores/types';
import { SkillEffectManager } from './SkillEffectManager';
import { PlayerManager } from './PlayerManager';
import { EnemyManager } from './EnemyManager';
import { computeEquipmentBonuses } from '../../stores/equipmentUtils';

// Seconds between each combat round (player attacks + enemy counter-attacks)
const ATTACK_INTERVAL = 1.5;

export class CombatManager {
  private getStore: () => GameStore;
  private skillEffectManager: SkillEffectManager;
  private playerManager: PlayerManager;
  private enemyManager: EnemyManager;
  private onStartWave: (wave: number) => void;
  // Accumulates elapsed time; a combat round fires when it reaches ATTACK_INTERVAL
  private attackAccumulator = 0;

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
    // DEBUG — quitar después
    const _gs = this.getStore();
    console.log('[CM] updateCombat called | isFighting:', _gs.gameState.isFighting, '| enemies:', _gs.renderState.enemies.length, '| deltaTime:', deltaTime.toFixed(4));

    const player = this.getStore().player;

    // Actualizar cooldowns de skills
    this.getStore().updateSkillCooldowns(deltaTime);

    if (this.getStore().renderState.enemies.length === 0) {
      console.log('[CM] BLOCKED: no enemies in store');
      return;
    }

    // Accumulate time; only trigger a combat round once per ATTACK_INTERVAL seconds
    this.attackAccumulator += deltaTime;
    console.log('[CM] attackAccumulator:', this.attackAccumulator.toFixed(4), '/ needed:', ATTACK_INTERVAL);
    if (this.attackAccumulator < ATTACK_INTERVAL) return;
    this.attackAccumulator -= ATTACK_INTERVAL;

    {
      const enemy = this.getStore().renderState.enemies[0];
      console.log('[CM] ATTACK ROUND | enemy hp:', enemy.hp, '| player hp:', player.hp);

      // Intentar usar skills automáticamente
      const skillUsed = this.tryUseSkill(enemy);
      console.log('[CM] tryUseSkill result:', skillUsed);

      if (!skillUsed) {
        console.log('[CM] falling back to useBasicAttack');
        // Usar ataque básico si no se usó ningún skill
        this.useBasicAttack(enemy);
      }

      if (enemy.hp <= 0) {
        // Enemy defeated — use store actions so Zustand triggers re-renders
        this.getStore().gainXp(enemy.xpReward);
        this.getStore().gainGold(enemy.goldReward);

        // Remove sprite via EnemyManager (it owns all PIXI objects)
        this.enemyManager.removeEnemy(enemy.id);

        // Remove data from store (triggers re-render)
        this.getStore().removeEnemy(enemy.id);

        // Check if wave completed (read fresh state after removal)
        if (this.getStore().renderState.enemies.length === 0) {
          this.completeWave();
        }
      } else {
        // Enemy attacks player — mitigate by equipment defense
        const equipBonus = computeEquipmentBonuses(this.getStore().equipment);
        const mitigatedDamage = Math.max(1, enemy.damage - equipBonus.defense);
        this.getStore().takeDamage(mitigatedDamage);
        this.playerManager.changeAnimation('hit');

        setTimeout(() => {
          this.playerManager.changeAnimation('idle');
        }, 500);

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
      const equipBonus = computeEquipmentBonuses(this.getStore().equipment);
      const totalStr = player.stats.str + equipBonus.stats.str;
      const totalInt = player.stats.int + equipBonus.stats.int;
      const skillDamage = (attackSkill.damage || 0) + totalStr + totalInt + equipBonus.damage;
      enemy.hp -= skillDamage;

      // Visual effects use screen position from EnemyManager; skip if sprite not found
      if (enemyPos) {
        if (attackSkill.id === 'fire_ball') {
          this.skillEffectManager.createFireballEffect(playerSprite.x, playerSprite.y, enemyPos.x, enemyPos.y);
        } else if (attackSkill.id === 'ice_shard') {
          this.skillEffectManager.createIceShardEffect(playerSprite.x, playerSprite.y, enemyPos.x, enemyPos.y);
        } else if (attackSkill.id === 'lightning_bolt') {
          this.skillEffectManager.createLightningBoltEffect(playerSprite.x, playerSprite.y, enemyPos.x, enemyPos.y);
        } else {
          this.skillEffectManager.createBasicAttackEffect(playerSprite.x, playerSprite.y, enemyPos.x, enemyPos.y);
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
      const equipBonus = computeEquipmentBonuses(this.getStore().equipment);
      const totalStr = this.getStore().player.stats.str + equipBonus.stats.str;
      const totalDamage = (basicAttack.damage || 0) + equipBonus.damage + (totalStr * 2);
      enemy.hp -= totalDamage;

      const enemyPos = this.enemyManager.getSpritePosition(enemy.id);
      if (enemyPos) {
        this.skillEffectManager.createBasicAttackEffect(playerSprite.x, playerSprite.y, enemyPos.x, enemyPos.y);
      }

      this.playerManager.changeAnimation('run');
      setTimeout(() => this.playerManager.changeAnimation('idle'), 200);
    }
  }

  private completeWave() {
    const currentWave = this.getStore().gameState.currentWave;
    const nextWave = currentWave + 1;

    if (currentWave % 10 === 0) {
      // Boss derrotado — avanzar a la siguiente fase
      this.getStore().winBossFight();
      const afterBossWave = this.getStore().gameState.currentWave;
      setTimeout(() => this.onStartWave(afterBossWave), 1000);
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
}
