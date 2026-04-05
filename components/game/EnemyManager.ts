import * as PIXI from 'pixi.js';
import { EnemyData } from '../../types/game';
import { MONSTER_CATALOG, BEHAVIOR_MODIFIERS } from '../../core/balance/game-config';

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
    // Get iconIndex from the selected monster based on enemy name
    const monster = Object.values(MONSTER_CATALOG).find(m => m.name === enemy.name);
    const monsterIndex = monster ? monster.iconIndex : this.getMonsterIndexForWave(enemy.level);
    
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
    // Filter monsters by minWave <= wave and choose one randomly
    const availableMonsters = Object.values(MONSTER_CATALOG).filter(
      monster => monster.minWave <= wave
    );
    
    if (availableMonsters.length === 0) {
      // Fallback to basic monsters if none available
      return Math.floor(Math.random() * 10) + 1;
    }
    
    const selectedMonster = availableMonsters[Math.floor(Math.random() * availableMonsters.length)];
    return selectedMonster.iconIndex;
  }

  private getEnemyBehavior(wave: number): 'melee' | 'ranged' | 'tank' | 'aggressive' {
    // Filter monsters by minWave <= wave and choose one randomly
    const availableMonsters = Object.values(MONSTER_CATALOG).filter(
      monster => monster.minWave <= wave
    );
    
    if (availableMonsters.length === 0) {
      // Fallback to random behavior if none available
      const behaviors = ['melee', 'ranged', 'tank', 'aggressive'];
      const behaviorIndex = Math.floor(Math.random() * behaviors.length);
      return behaviors[behaviorIndex] as 'melee' | 'ranged' | 'tank' | 'aggressive';
    }
    
    const selectedMonster = availableMonsters[Math.floor(Math.random() * availableMonsters.length)];
    return selectedMonster.behavior;
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
    // Filter monsters by minWave <= wave and choose one randomly
    const availableMonsters = Object.values(MONSTER_CATALOG).filter(
      monster => monster.minWave <= wave
    );
    
    if (availableMonsters.length === 0) {
      // Fallback to generic names if none available
      const enemyTypes = [
        'Slime', 'Goblin', 'Orc', 'Skeleton', 'Zombie',
        'Troll', 'Ogre', 'Demon', 'Vampire', 'Werewolf'
      ];
      const enemyType = enemyTypes[Math.floor(Math.random() * enemyTypes.length)];
      return `${enemyType} Lv.${wave}`;
    }
    
    const selectedMonster = availableMonsters[Math.floor(Math.random() * availableMonsters.length)];
    return selectedMonster.name;
  }

  public spawnEnemiesForWave(wave: number): EnemyData[] {
    const enemyCount = Math.min(wave, 9);
    const newEnemies: EnemyData[] = [];

    for (let i = 0; i < enemyCount; i++) {
      const angle = (i / enemyCount) * Math.PI * 2;
      const distance = 150 + Math.random() * 100;
      const x = this.app.screen.width / 2 + Math.cos(angle) * distance;
      const y = this.app.screen.height / 2 + Math.sin(angle) * distance;

      // Choose one monster consistently for this enemy
      const availableMonsters = Object.values(MONSTER_CATALOG).filter(
        monster => monster.minWave <= wave
      );
      
      let selectedMonster;
      if (availableMonsters.length === 0) {
        // Fallback to basic monster
        selectedMonster = {
          iconIndex: Math.floor(Math.random() * 10) + 1,
          name: `Basic Monster Lv.${wave}`,
          behavior: ['melee', 'ranged', 'tank', 'aggressive'][Math.floor(Math.random() * 4)] as 'melee' | 'ranged' | 'tank' | 'aggressive',
          minWave: 1
        };
      } else {
        selectedMonster = availableMonsters[Math.floor(Math.random() * availableMonsters.length)];
      }

      const behavior = selectedMonster.behavior;
      const speed = this.getEnemySpeed(behavior, wave);
      const preferredDistance = this.getPreferredDistance(behavior);

      // Get behavior modifiers
      const behaviorKey = behavior.toUpperCase() as keyof typeof BEHAVIOR_MODIFIERS;
      const modifiers = BEHAVIOR_MODIFIERS[behaviorKey];
      
      // Apply behavior modifiers to base stats
      const baseHp = 50 + (wave * 10);
      const baseDamage = 10 + (wave * 2);
      const baseXpReward = 15 * wave;
      
      const modifiedHp = Math.floor(baseHp * modifiers.hp);
      const modifiedDamage = Math.floor(baseDamage * modifiers.damage);
      const modifiedSpeed = Math.floor(speed * modifiers.speed);
      const modifiedXpReward = Math.floor(baseXpReward * modifiers.xp);

      // Pure data — no PIXI references
      const enemyData: EnemyData = {
        id: `enemy_${wave}_${i}`,
        name: selectedMonster.name,
        level: wave,
        hp: modifiedHp,
        maxHp: modifiedHp,
        damage: modifiedDamage,
        xpReward: modifiedXpReward,
        goldReward: 5 * wave,
        behavior,
        preferredDistance,
        speed: modifiedSpeed,
        dodgeChance: modifiers.dodgeChance,
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
