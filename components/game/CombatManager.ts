import { Enemy } from '../../types/game';
import { GameStore } from '../../stores/types';
import { SkillEffectManager } from './SkillEffectManager';
import { PlayerManager } from './PlayerManager';

export class CombatManager {
  private store: GameStore;
  private skillEffectManager: SkillEffectManager;
  private playerManager: PlayerManager;

  constructor(store: GameStore, skillEffectManager: SkillEffectManager, playerManager: PlayerManager) {
    this.store = store;
    this.skillEffectManager = skillEffectManager;
    this.playerManager = playerManager;
  }

  public updateCombat(deltaTime: number) {
    const gameState = this.store.gameState;
    const player = this.store.player;
    
    // Actualizar cooldowns de skills
    this.store.updateSkillCooldowns(deltaTime);
    
    // Simple combat simulation
    if (this.store.renderState.enemies.length > 0 && Math.random() < deltaTime) {
      const enemy = this.store.renderState.enemies[0];
      
      // Intentar usar skills automáticamente
      const skillUsed = this.tryUseSkill(enemy);
      
      if (!skillUsed) {
        // Usar ataque básico si no se usó ningún skill
        this.useBasicAttack(enemy);
      }
      
      if (enemy.hp <= 0) {
        // Enemy defeated
        this.store.gainXp(enemy.xpReward);
        this.store.player.gold += enemy.goldReward;
        
        // Remove enemy
        this.store.renderState.enemies.shift();
        
        // Check if wave completed
        if (this.store.renderState.enemies.length === 0) {
          this.completeWave();
        }
      } else {
        // Enemy attacks player - Mostrar animación de hit
        this.store.takeDamage(enemy.damage);
        this.playerManager.changeAnimation('hit');
        
        // Volver a idle después de un tiempo
        setTimeout(() => {
          this.playerManager.changeAnimation('idle');
        }, 500);
        
        if (player.hp <= 0) {
          this.gameOver();
        }
      }
    }
  }

  private tryUseSkill(enemy: Enemy): boolean {
    const skills = this.store.skills;
    const player = this.store.player;
    const playerSprite = this.playerManager.getPlayer();
    
    if (!playerSprite) return false;
    
    // Priorizar skills de curación si la salud está baja
    if (player.hp < player.maxHp * 0.3) {
      const healSkill = skills.find(s => s.type === 'heal' && s.currentCooldown === 0);
      if (healSkill && player.mp >= healSkill.manaCost) {
        this.store.useSkill(healSkill.id);
        
        // Crear efecto visual de curación
        this.skillEffectManager.createHealEffect(playerSprite.x, playerSprite.y);
        
        this.playerManager.changeAnimation('run');
        setTimeout(() => {
          this.playerManager.changeAnimation('idle');
        }, 300);
        return true;
      }
    }
    
    // Usar skills de ataque si hay mana disponible
    const attackSkill = skills.find(s => s.type === 'attack' && s.currentCooldown === 0 && s.id !== 'basic_attack');
    if (attackSkill && player.mp >= attackSkill.manaCost) {
      this.store.useSkill(attackSkill.id);
      const skillDamage = attackSkill.damage || 0;
      enemy.hp -= skillDamage;
      
      // Crear efecto visual según el tipo de skill
      if (attackSkill.id === 'fire_ball') {
        this.skillEffectManager.createFireballEffect(playerSprite.x, playerSprite.y, enemy);
      } else if (attackSkill.id === 'ice_shard') {
        this.skillEffectManager.createIceShardEffect(playerSprite.x, playerSprite.y, enemy);
      } else if (attackSkill.id === 'lightning_bolt') {
        this.skillEffectManager.createLightningBoltEffect(playerSprite.x, playerSprite.y, enemy);
      } else {
        // Para otros skills de ataque, usar efecto básico
        this.skillEffectManager.createBasicAttackEffect(playerSprite.x, playerSprite.y, enemy);
      }
      
      this.playerManager.changeAnimation('run');
      setTimeout(() => {
        this.playerManager.changeAnimation('idle');
      }, 300);
      return true;
    }
    
    return false;
  }

  private useBasicAttack(enemy: Enemy) {
    const basicAttack = this.store.skills.find(s => s.id === 'basic_attack');
    const playerSprite = this.playerManager.getPlayer();
    
    if (basicAttack && playerSprite) {
      this.store.useSkill(basicAttack.id);
      const playerDamage = (basicAttack.damage || 0) + (this.store.player.stats.str * 2);
      enemy.hp -= playerDamage;
      
      // Crear efecto visual de ataque básico
      this.skillEffectManager.createBasicAttackEffect(playerSprite.x, playerSprite.y, enemy);
      
      this.playerManager.changeAnimation('run');
      setTimeout(() => {
        this.playerManager.changeAnimation('idle');
      }, 200);
    }
  }

  private completeWave() {
    const currentWave = this.store.gameState.currentWave;
    
    if (currentWave % 10 === 9) {
      // Completed wave 9, 19, 29, etc. - show boss button
      this.store.setWave(currentWave + 1);
    } else if (currentWave % 10 === 0) {
      // This was a boss fight - handled by UI
      return;
    } else {
      // Regular wave - auto advance
      const newWave = currentWave + 1;
      this.store.setWave(newWave);
    }
  }

  private gameOver() {
    this.store.gameState.isAfk = false;
    this.store.gameState.isFighting = false;
    
    // Mostrar animación de muerte
    this.playerManager.changeAnimation('dead');
    
    // Reset to safe state, heal player after a delay
    setTimeout(() => {
      this.store.heal(this.store.player.maxHp);
      this.playerManager.changeAnimation('idle');
    }, 2000);
  }
}
