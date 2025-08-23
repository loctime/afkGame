import * as PIXI from 'pixi.js';
import { Enemy } from '../../types/game';

export class EnemyManager {
  private enemies: Map<string, PIXI.Sprite> = new Map();
  private gameContainer: PIXI.Container;
  private app: PIXI.Application;

  constructor(app: PIXI.Application, gameContainer: PIXI.Container) {
    this.app = app;
    this.gameContainer = gameContainer;
  }

  public createEnemy(enemy: Enemy): PIXI.Sprite {
    // Seleccionar un monstruo aleatorio basado en el nivel
    const monsterIndex = this.getMonsterIndexForWave(enemy.level);
    const monsterPath = `/assets/sprites/monsters/Icon${monsterIndex}.png`;
    
    try {
      // Crear sprite del monstruo
      const texture = PIXI.Texture.from(monsterPath);
      const sprite = new PIXI.Sprite(texture);
      
      // Configurar el sprite
      sprite.x = enemy.x;
      sprite.y = enemy.y;
      sprite.anchor.set(0.5);
      
      // Ajustar tamaño según el nivel (monstruos más grandes en niveles altos)
      const baseSize = 40;
      const sizeMultiplier = 1 + (enemy.level * 0.1);
      sprite.width = baseSize * sizeMultiplier;
      sprite.height = baseSize * sizeMultiplier;
      
      // Aplicar efectos visuales según el nivel
      if (enemy.level > 20) {
        // Monstruos de alto nivel más brillantes
        sprite.tint = 0xffaa00; // Dorado
        sprite.alpha = 0.9;
      } else if (enemy.level > 10) {
        // Monstruos de nivel medio
        sprite.tint = 0xff4444; // Rojo
        sprite.alpha = 0.8;
      } else {
        // Monstruos de bajo nivel
        sprite.tint = 0x888888; // Gris
        sprite.alpha = 0.7;
      }
      
      this.gameContainer.addChild(sprite);
      return sprite;
    } catch (error) {
      // Fallback a rectángulo rojo si no se puede cargar el sprite
      console.warn(`No se pudo cargar el monstruo ${monsterIndex}, usando fallback`);
      const graphics = new PIXI.Graphics();
      graphics.beginFill(0xff0000);
      graphics.drawRect(0, 0, 28, 28);
      graphics.endFill();
      
      const texture = this.app.renderer.generateTexture(graphics);
      const sprite = new PIXI.Sprite(texture);
      sprite.x = enemy.x;
      sprite.y = enemy.y;
      sprite.anchor.set(0.5);
      
      this.gameContainer.addChild(sprite);
      return sprite;
    }
  }

  private getMonsterIndexForWave(wave: number): number {
    // Seleccionar monstruo basado en el nivel
    if (wave <= 5) {
      // Niveles 1-5: Monstruos básicos (1-10)
      return Math.floor(Math.random() * 10) + 1;
    } else if (wave <= 15) {
      // Niveles 6-15: Monstruos intermedios (11-25)
      return Math.floor(Math.random() * 15) + 11;
    } else if (wave <= 30) {
      // Niveles 16-30: Monstruos avanzados (26-40)
      return Math.floor(Math.random() * 15) + 26;
    } else {
      // Niveles 31+: Monstruos élite (41-50)
      return Math.floor(Math.random() * 10) + 41;
    }
  }

  private getEnemyName(wave: number): string {
    const enemyTypes = [
      // Niveles 1-5: Criaturas básicas
      'Slime', 'Goblin', 'Orc', 'Skeleton', 'Zombie',
      // Niveles 6-15: Criaturas intermedias
      'Troll', 'Ogre', 'Demon', 'Vampire', 'Werewolf',
      // Niveles 16-30: Criaturas avanzadas
      'Dragon', 'Giant', 'Witch', 'Necromancer', 'Dark Knight',
      // Niveles 31+: Criaturas élite
      'Ancient Dragon', 'Demon Lord', 'Dark God', 'Chaos Beast', 'Void Creature'
    ];
    
    const typeIndex = Math.min(Math.floor(wave / 5), enemyTypes.length - 1);
    const enemyType = enemyTypes[typeIndex];
    
    // Agregar sufijos según el nivel
    if (wave > 30) {
      return `${enemyType} Lord Lv.${wave}`;
    } else if (wave > 20) {
      return `${enemyType} Elite Lv.${wave}`;
    } else if (wave > 10) {
      return `${enemyType} Warrior Lv.${wave}`;
    } else {
      return `${enemyType} Lv.${wave}`;
    }
  }

  public spawnEnemiesForWave(wave: number): Enemy[] {
    const enemyCount = Math.min(wave, 9);
    const newEnemies: Enemy[] = [];
    
    for (let i = 0; i < enemyCount; i++) {
      const angle = (i / enemyCount) * Math.PI * 2;
      const distance = 150 + Math.random() * 100;
      const x = this.app.screen.width / 2 + Math.cos(angle) * distance;
      const y = this.app.screen.height / 2 + Math.sin(angle) * distance;
      
      const enemy: Enemy = {
        id: `enemy_${wave}_${i}`,
        name: this.getEnemyName(wave),
        level: wave,
        hp: 50 + (wave * 10),
        maxHp: 50 + (wave * 10),
        damage: 10 + (wave * 2),
        xpReward: 15 * wave,
        goldReward: 5 * wave,
        x,
        y,
      };
      
      enemy.sprite = this.createEnemy(enemy);
      this.enemies.set(enemy.id, enemy.sprite);
      newEnemies.push(enemy);
    }
    
    return newEnemies;
  }

  public updateEnemyPositions(enemies: Enemy[], playerX: number, playerY: number, deltaTime: number) {
    enemies.forEach((enemy) => {
      if (enemy.sprite) {
        const dx = playerX - enemy.sprite.x;
        const dy = playerY - enemy.sprite.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance > 50) {
          const speed = 30; // pixels per second
          enemy.sprite.x += (dx / distance) * speed * deltaTime;
          enemy.sprite.y += (dy / distance) * speed * deltaTime;
        }
      }
    });
  }

  public removeEnemy(enemyId: string) {
    const sprite = this.enemies.get(enemyId);
    if (sprite) {
      this.gameContainer.removeChild(sprite);
      this.enemies.delete(enemyId);
    }
  }

  public clearAllEnemies() {
    this.enemies.forEach((sprite) => {
      this.gameContainer.removeChild(sprite);
    });
    this.enemies.clear();
  }

  public getEnemies() {
    return this.enemies;
  }
}
