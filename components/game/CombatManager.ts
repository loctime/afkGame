import { EnemyData } from '../../types/game';
import { GameStore } from '../../stores/types';
import { SkillEffectManager } from './SkillEffectManager';
import { PlayerManager } from './PlayerManager';
import { EnemyManager } from './EnemyManager';

// Seconds between each combat round (player attacks + enemy counter-attacks)
const ATTACK_INTERVAL = 1.5;

export class CombatManager {
  private store: GameStore;
  private skillEffectManager: SkillEffectManager;
  private playerManager: PlayerManager;
  private enemyManager: EnemyManager;
  private onStartWave: (wave: number) => void;
  // Accumulates elapsed time; a combat round fires when it reaches ATTACK_INTERVAL
  private attackAccumulator = 0;

  constructor(
    store: GameStore,
    skillEffectManager: SkillEffectManager,
    playerManager: PlayerManager,
    enemyManager: EnemyManager,
    onStartWave: (wave: number) => void,
  ) {
    this.store = store;
    this.skillEffectManager = skillEffectManager;
    this.playerManager = playerManager;
    this.enemyManager = enemyManager;
    this.onStartWave = onStartWave;
  }

  public updateCombat(deltaTime: number) {
    const player = this.store.player;

    // Actualizar cooldowns de skills
    this.store.updateSkillCooldowns(deltaTime);

    if (this.store.renderState.enemies.length === 0) return;

    // Accumulate time; only trigger a combat round once per ATTACK_INTERVAL seconds
    this.attackAccumulator += deltaTime;
    if (this.attackAccumulator < ATTACK_INTERVAL) return;
    this.attackAccumulator -= ATTACK_INTERVAL;

    {
      const enemy = this.store.renderState.enemies[0];

      // Intentar usar skills automáticamente
      const skillUsed = this.tryUseSkill(enemy);

      if (!skillUsed) {
        // Usar ataque básico si no se usó ningún skill
        this.useBasicAttack(enemy);
      }

      if (enemy.hp <= 0) {
        // Enemy defeated — use store actions so Zustand triggers re-renders
        this.store.gainXp(enemy.xpReward);
        this.store.gainGold(enemy.goldReward);

        // Remove sprite via EnemyManager (it owns all PIXI objects)
        this.enemyManager.removeEnemy(enemy.id);

        // Remove data from store (triggers re-render)
        this.store.removeEnemy(enemy.id);

        // Check if wave completed (read fresh state after removal)
        if (this.store.renderState.enemies.length === 0) {
          this.completeWave();
        }
      } else {
        // Enemy attacks player — show hit animation
        this.store.takeDamage(enemy.damage);
        this.playerManager.changeAnimation('hit');

        setTimeout(() => {
          this.playerManager.changeAnimation('idle');
        }, 500);

        // Read fresh HP after damage
        if (this.store.player.hp <= 0) {
          this.gameOver();
        }
      }
    }
  }

  private tryUseSkill(enemy: EnemyData): boolean {
    const skills = this.store.skills;
    const player = this.store.player;
    const playerSprite = this.playerManager.getPlayer();

    if (!playerSprite) return false;

    // Get the enemy's current screen position from EnemyManager (owns all sprites)
    const enemyPos = this.enemyManager.getSpritePosition(enemy.id);

    // Priorizar skills de curación si la salud está baja
    if (player.hp < player.maxHp * 0.3) {
      const healSkill = skills.find(s => s.type === 'heal' && s.currentCooldown === 0);
      if (healSkill && player.mp >= healSkill.manaCost) {
        this.store.useSkill(healSkill.id);
        this.skillEffectManager.createHealEffect(playerSprite.x, playerSprite.y);
        this.playerManager.changeAnimation('run');
        setTimeout(() => this.playerManager.changeAnimation('idle'), 300);
        return true;
      }
    }

    // Usar skills de ataque si hay mana disponible
    const attackSkill = skills.find(s => s.type === 'attack' && s.currentCooldown === 0 && s.id !== 'basic_attack');
    if (attackSkill && player.mp >= attackSkill.manaCost) {
      this.store.useSkill(attackSkill.id);
      enemy.hp -= attackSkill.damage || 0;

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
    const basicAttack = this.store.skills.find(s => s.id === 'basic_attack');
    const playerSprite = this.playerManager.getPlayer();

    if (basicAttack && playerSprite) {
      this.store.useSkill(basicAttack.id);
      enemy.hp -= (basicAttack.damage || 0) + (this.store.player.stats.str * 2);

      const enemyPos = this.enemyManager.getSpritePosition(enemy.id);
      if (enemyPos) {
        this.skillEffectManager.createBasicAttackEffect(playerSprite.x, playerSprite.y, enemyPos.x, enemyPos.y);
      }

      this.playerManager.changeAnimation('run');
      setTimeout(() => this.playerManager.changeAnimation('idle'), 200);
    }
  }

  private completeWave() {
    const currentWave = this.store.gameState.currentWave;
    const nextWave = currentWave + 1;

    if (currentWave % 10 === 0) {
      // Boss derrotado — avanzar a la siguiente fase
      this.store.winBossFight();
      const afterBossWave = this.store.gameState.currentWave;
      setTimeout(() => this.onStartWave(afterBossWave), 1000);
    } else if (nextWave % 10 === 0) {
      // Siguiente wave es boss — pausar y esperar confirmación del jugador
      this.store.setWave(nextWave);       // isInBossWave = true
      this.store.setIsFighting(false);    // pausa; UI detecta isInBossWave && !isFighting
    } else {
      // Wave regular — auto-avanzar
      this.store.setWave(nextWave);
      setTimeout(() => this.onStartWave(nextWave), 500);
    }
  }

  private gameOver() {
    // Pausar combate
    this.store.setIsFighting(false);

    // Mostrar animación de muerte
    this.playerManager.changeAnimation('dead');

    // Revivir en la wave 1 de la fase actual después de 2 segundos
    setTimeout(() => {
      const currentWave = this.store.gameState.currentWave;
      const phaseIndex = Math.floor((currentWave - 1) / 10);
      const reviveWave = phaseIndex * 10 + 1;

      this.store.heal(this.store.player.maxHp);
      this.store.setWave(reviveWave);
      this.playerManager.changeAnimation('idle');

      // Reiniciar combate en la wave de inicio de fase
      setTimeout(() => this.onStartWave(reviveWave), 500);
    }, 2000);
  }
}
