import * as PIXI from 'pixi.js';
import { EnemyData } from '../../types/game';

const MAX_ENEMY_SIZE = 64;
const IS_DEV = process.env.NODE_ENV === 'development';

export class EnemyManager {
  private enemies: Map<string, PIXI.AnimatedSprite> = new Map();
  private enemyAnimations: Map<string, PIXI.Texture[]> = new Map();
  private gameContainer: PIXI.Container;
  private app: PIXI.Application;

  constructor(app: PIXI.Application, gameContainer: PIXI.Container) {
    this.app = app;
    this.gameContainer = gameContainer;
    this.loadEnemyAnimations();
  }

  public createEnemy(enemy: EnemyData): PIXI.AnimatedSprite {
    // Seleccionar un monstruo aleatorio basado en el nivel
    const monsterIndex = this.getMonsterIndexForWave(enemy.level);
    
    try {
      // Crear animación del monstruo
      const animationKey = `monster_${monsterIndex}`;
      let frames = this.enemyAnimations.get(animationKey);
      
      if (!frames) {
        // Si no existe la animación, crearla
        frames = this.createEnemyAnimation(monsterIndex);
        this.enemyAnimations.set(animationKey, frames);
      }
      
      const animatedSprite = new PIXI.AnimatedSprite(frames);
      
      // Configurar el sprite animado
      animatedSprite.x = enemy.x;
      animatedSprite.y = enemy.y;
      animatedSprite.anchor.set(0.5);

      const baseSize = 32;
      const targetSize = Math.min(baseSize + enemy.level * 1.5, MAX_ENEMY_SIZE);
      const applyEnemyScaleFromTexture = () => {
        const w = animatedSprite.texture.width;
        if (w <= 0) return;
        const scale = targetSize / w;
        animatedSprite.scale.set(scale);
      };
      const baseTex = animatedSprite.texture.baseTexture;
      if (baseTex.valid) {
        applyEnemyScaleFromTexture();
      } else {
        baseTex.on('loaded', () => {
          applyEnemyScaleFromTexture();
        });
      }

      // Configurar animación más rápida para que sea visible
      animatedSprite.animationSpeed = 0.2;
      animatedSprite.play();
      
      // Aplicar efectos visuales según el nivel con colores más vibrantes
      if (enemy.level > 20) {
        // Monstruos de alto nivel más brillantes
        animatedSprite.tint = 0xffff00; // Amarillo brillante
        animatedSprite.alpha = 1.0;
      } else if (enemy.level > 10) {
        // Monstruos de nivel medio
        animatedSprite.tint = 0xff6666; // Rojo más claro
        animatedSprite.alpha = 0.95;
      } else {
        // Monstruos de bajo nivel
        animatedSprite.tint = 0xffffff; // Sin tinte, colores originales
        animatedSprite.alpha = 1.0;
      }
      
      // Agregar efecto de flotación solo para algunos enemigos para reducir la carga
      if (Math.random() < 0.2) { // Solo 20% de los enemigos tendrán flotación
        this.addFloatingEffect(animatedSprite);
      }
      
      this.gameContainer.addChild(animatedSprite);
      return animatedSprite;
    } catch (error) {
      // Fallback a rectángulo rojo animado si no se puede cargar el sprite
      if (IS_DEV) console.warn(`No se pudo cargar el monstruo ${monsterIndex}, usando fallback`);
      const graphics = new PIXI.Graphics();
      graphics.beginFill(0xff0000);
      graphics.drawRect(0, 0, 28, 28);
      graphics.endFill();
      
      const texture = this.app.renderer.generateTexture(graphics);
      const fallbackFrames = [texture, texture]; // Animación simple
      const animatedSprite = new PIXI.AnimatedSprite(fallbackFrames);
      animatedSprite.x = enemy.x;
      animatedSprite.y = enemy.y;
      animatedSprite.anchor.set(0.5);
      animatedSprite.scale.set(1);
      animatedSprite.animationSpeed = 0.2;
      animatedSprite.play();

      this.gameContainer.addChild(animatedSprite);
      return animatedSprite;
    }
  }

  private loadEnemyAnimations() {
    // Precargar algunas animaciones básicas
    for (let i = 1; i <= 10; i++) {
      this.createEnemyAnimation(i);
    }
  }

  private createEnemyAnimation(monsterIndex: number): PIXI.Texture[] {
    const frames: PIXI.Texture[] = [];
    
    try {
      // Cargar el sprite base - usar la ruta correcta
      const baseTexture = PIXI.Texture.from(`/assets/sprites/monsters/Icon${monsterIndex}.png`);
      
      // Crear una animación más visible con diferentes escalas
      frames.push(baseTexture); // Frame normal
      
      // Frame ligeramente más grande
      const scaledTexture1 = baseTexture.clone();
      frames.push(scaledTexture1);
      
      // Frame normal
      frames.push(baseTexture);
      
      // Frame ligeramente más pequeño
      const scaledTexture2 = baseTexture.clone();
      frames.push(scaledTexture2);
      
      // Frame normal
      frames.push(baseTexture);
      
    } catch (error) {
      if (IS_DEV) console.warn(`Error loading monster sprite ${monsterIndex}:`, error);
      // Crear un sprite de fallback
      const graphics = new PIXI.Graphics();
      graphics.beginFill(0xff0000);
      graphics.drawRect(0, 0, 32, 32);
      graphics.endFill();
      
      const fallbackTexture = this.app.renderer.generateTexture(graphics);
      frames.push(fallbackTexture);
      frames.push(fallbackTexture);
      frames.push(fallbackTexture);
      frames.push(fallbackTexture);
      frames.push(fallbackTexture);
    }
    
    return frames;
  }

  private addFloatingEffect(animatedSprite: PIXI.AnimatedSprite) {
    // Simplificar el efecto de flotación para evitar problemas de rendimiento
    const startTime = Date.now();
    const floatSpeed = 0.002;
    const floatAmplitude = 1.5;
    const originalY = animatedSprite.y;
    
    const animate = () => {
      if (animatedSprite.parent) {
        const time = Date.now() - startTime;
        const floatOffset = Math.sin(time * floatSpeed) * floatAmplitude;
        
        // Solo aplicar flotación vertical simple
        animatedSprite.y = originalY + floatOffset;
        
        // Usar setTimeout en lugar de requestAnimationFrame para reducir la frecuencia
        setTimeout(animate, 50); // 20 FPS en lugar de 60 FPS
      }
    };
    
    animate();
  }

  private addPatrolMovement(sprite: PIXI.AnimatedSprite, speed: number) {
    // Generar dirección aleatoria para patrulla
    const angle = Math.random() * Math.PI * 2;
    const patrolDistance = 20 + Math.random() * 30;

    const targetX = sprite.x + Math.cos(angle) * patrolDistance;
    const targetY = sprite.y + Math.sin(angle) * patrolDistance;

    const dx = targetX - sprite.x;
    const dy = targetY - sprite.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance > 5) {
      const patrolSpeed = speed * 0.3;
      sprite.x += (dx / distance) * patrolSpeed * 0.016;
      sprite.y += (dy / distance) * patrolSpeed * 0.016;
      sprite.animationSpeed = 0.25;
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

  private getEnemyBehavior(wave: number): 'melee' | 'ranged' | 'tank' | 'aggressive' {
    const behaviors = ['melee', 'ranged', 'tank', 'aggressive'];
    const behaviorIndex = Math.floor(Math.random() * behaviors.length);
    return behaviors[behaviorIndex] as 'melee' | 'ranged' | 'tank' | 'aggressive';
  }

  private getEnemySpeed(behavior: string, level: number): number {
    const baseSpeed = 30;
    switch (behavior) {
      case 'aggressive':
        return baseSpeed * 1.5; // Más rápido
      case 'ranged':
        return baseSpeed * 0.7; // Más lento
      case 'tank':
        return baseSpeed * 0.5; // Muy lento
      case 'melee':
      default:
        return baseSpeed; // Velocidad normal
    }
  }

  private getPreferredDistance(behavior: string): number {
    switch (behavior) {
      case 'melee':
        return 30; // Muy cerca
      case 'aggressive':
        return 40; // Cerca
      case 'tank':
        return 60; // Distancia media
      case 'ranged':
        return 100; // Lejos
      default:
        return 50;
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

  public spawnEnemiesForWave(wave: number): EnemyData[] {
    const enemyCount = Math.min(wave, 9);
    const newEnemies: EnemyData[] = [];

    for (let i = 0; i < enemyCount; i++) {
      const angle = (i / enemyCount) * Math.PI * 2;
      const distance = 150 + Math.random() * 100;
      const x = this.app.screen.width / 2 + Math.cos(angle) * distance;
      const y = this.app.screen.height / 2 + Math.sin(angle) * distance;

      const behavior = this.getEnemyBehavior(wave);
      const speed = this.getEnemySpeed(behavior, wave);
      const preferredDistance = this.getPreferredDistance(behavior);

      // Pure data — no PIXI references
      const enemyData: EnemyData = {
        id: `enemy_${wave}_${i}`,
        name: this.getEnemyName(wave),
        level: wave,
        hp: 50 + (wave * 10),
        maxHp: 50 + (wave * 10),
        damage: 10 + (wave * 2),
        xpReward: 15 * wave,
        goldReward: 5 * wave,
        behavior,
        preferredDistance,
        speed,
        x,
        y,
      };

      // Sprite lives only in the internal Map, never in the store
      const sprite = this.createEnemy(enemyData);
      this.enemies.set(enemyData.id, sprite);
      newEnemies.push(enemyData);
    }

    return newEnemies;
  }

  public updateEnemyPositions(enemies: EnemyData[], playerX: number, playerY: number, deltaTime: number) {
    enemies.forEach((enemy) => {
      // Look up the sprite from the internal Map — it never lives in the store
      const sprite = this.enemies.get(enemy.id);
      if (!sprite) return;

      const dx = playerX - sprite.x;
      const dy = playerY - sprite.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      switch (enemy.behavior) {
        case 'melee':
          if (distance > enemy.preferredDistance) {
            sprite.x += (dx / distance) * enemy.speed * deltaTime;
            sprite.y += (dy / distance) * enemy.speed * deltaTime;
          }
          break;

        case 'ranged':
          if (distance < enemy.preferredDistance - 20) {
            sprite.x -= (dx / distance) * enemy.speed * deltaTime;
            sprite.y -= (dy / distance) * enemy.speed * deltaTime;
          } else if (distance > enemy.preferredDistance + 20) {
            sprite.x += (dx / distance) * enemy.speed * deltaTime;
            sprite.y += (dy / distance) * enemy.speed * deltaTime;
          }
          break;

        case 'tank':
        case 'aggressive':
          if (distance > enemy.preferredDistance) {
            sprite.x += (dx / distance) * enemy.speed * deltaTime;
            sprite.y += (dy / distance) * enemy.speed * deltaTime;
          }
          break;
      }

      const isMoving = distance > enemy.preferredDistance;
      sprite.animationSpeed = isMoving ? 0.3 : 0.2;

      if (!isMoving && Math.random() < 0.01) {
        this.addPatrolMovement(sprite, enemy.speed);
      }
    });
  }

  /** Returns the current screen position of an enemy sprite, or null if not found. */
  public getSpritePosition(enemyId: string): { x: number; y: number } | null {
    const sprite = this.enemies.get(enemyId);
    return sprite ? { x: sprite.x, y: sprite.y } : null;
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
