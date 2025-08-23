import * as PIXI from 'pixi.js';
import { Enemy } from '../../types/game';
import { GameStore } from '../../stores/gameStore';

export class GameEngine {
  private app: PIXI.Application;
  private gameContainer: PIXI.Container;
  private enemies: Map<string, PIXI.Sprite> = new Map();
  private player: PIXI.AnimatedSprite | null = null;
  private playerAnimations: Map<string, PIXI.Texture[]> = new Map();
  private currentAnimation: string = 'idle';
  private gameLoop: number = 0;
  private pulseEffect: NodeJS.Timeout | null = null;
  private store: GameStore;
  
  // Propiedades para fondos con parallax
  private backgroundLayers: PIXI.Sprite[] = [];
  private currentBackground: number = 1;
  private parallaxSpeed: number = 0.5;

  constructor(canvas: HTMLCanvasElement, store: GameStore) {
    this.store = store;
    
    // Initialize PIXI Application
    this.app = new PIXI.Application({
      view: canvas,
      width: window.innerWidth,
      height: window.innerHeight - 120, // Leave space for HUD
      backgroundColor: 0x2a2a4a, // Fondo más claro
      resolution: window.devicePixelRatio || 1,
      autoDensity: true,
    });
    
    this.gameContainer = new PIXI.Container();
    this.app.stage.addChild(this.gameContainer);
    
    // Cargar fondos con parallax
    this.loadBackground();
    
    this.setupPlayer();
    this.startGameLoop();
    this.handleResize();
  }
  
  private setupPlayer() {
    // Cargar sprites individuales para animación de idle
    const idleFrames = [];
    for (let i = 1; i <= 4; i++) {
      idleFrames.push(PIXI.Texture.from(`/assets/sprites/Alien/Without Light Outline/Fames/Alien_IDLE_${i}.png`));
    }
    
    // Crear animación de idle
    const idleAnimation = new PIXI.AnimatedSprite(idleFrames);
    idleAnimation.animationSpeed = 0.1;
    idleAnimation.play();
    
    this.player = idleAnimation;
    this.player.width = 80; // Hacer el alien más grande
    this.player.height = 80;
    this.player.x = this.app.screen.width / 2;
    this.player.y = this.app.screen.height / 2;
    this.player.anchor.set(0.5);
    
    // Aplicar efectos de color para hacerlo más brillante
    this.player.tint = 0x44aaff; // Azul más brillante
    this.player.alpha = 1.0; // Opacidad completa
    
    // Agregar filtro de brillo más potente
    const brightnessFilter = new PIXI.ColorMatrixFilter();
    brightnessFilter.brightness(1.8, true); // Hacer el alien 80% más brillante
    this.player.filters = [brightnessFilter];
    
    // Agregar fondo circular claro detrás del alien
    this.addPlayerBackground();
    
    // Agregar efecto de resplandor más potente
    this.addGlowEffect();
    
    this.gameContainer.addChild(this.player);
    
    // Cargar todas las animaciones
    this.loadPlayerAnimations();
  }
  
  private loadPlayerAnimations() {
    // Cargar animación de idle
    const idleFrames = [];
    for (let i = 1; i <= 4; i++) {
      idleFrames.push(PIXI.Texture.from(`/assets/sprites/Alien/Without Light Outline/Fames/Alien_IDLE_${i}.png`));
    }
    this.playerAnimations.set('idle', idleFrames);
    
    // Cargar animación de run
    const runFrames = [];
    for (let i = 1; i <= 4; i++) {
      runFrames.push(PIXI.Texture.from(`/assets/sprites/Alien/Without Light Outline/Fames/Alien_RUN_${i}.png`));
    }
    this.playerAnimations.set('run', runFrames);
    
    // Cargar animación de hit
    const hitFrames = [];
    for (let i = 1; i <= 2; i++) {
      hitFrames.push(PIXI.Texture.from(`/assets/sprites/Alien/Without Light Outline/Fames/Alien_HIT_${i}.png`));
    }
    this.playerAnimations.set('hit', hitFrames);
    
    // Cargar animación de dead
    const deadFrames = [];
    deadFrames.push(PIXI.Texture.from(`/assets/sprites/Alien/Without Light Outline/Fames/Alien_DEAD.png`));
    this.playerAnimations.set('dead', deadFrames);
  }
  
  private changePlayerAnimation(animationName: string) {
    if (!this.player || this.currentAnimation === animationName) return;
    
    const frames = this.playerAnimations.get(animationName);
    if (frames) {
      this.player.textures = frames;
      this.player.play();
      this.currentAnimation = animationName;
      
      // Aplicar efectos de color según la animación
      switch (animationName) {
        case 'idle':
          this.player.tint = 0x44aaff; // Azul brillante para idle
          this.player.alpha = 1.0;
          break;
        case 'run':
          this.player.tint = 0x00ff00; // Verde neón para ataque
          this.player.alpha = 1.0;
          break;
        case 'hit':
          this.player.tint = 0xff0000; // Rojo brillante para daño
          this.player.alpha = 1.0;
          break;
        case 'dead':
          this.player.tint = 0x888888; // Gris para muerte
          this.player.alpha = 0.8;
          break;
      }
    }
  }
  
  private createEnemy(enemy: Enemy): PIXI.Sprite {
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
  
  private spawnEnemiesForWave(wave: number) {
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
  
  private startGameLoop() {
    let lastTime = performance.now();
    const targetFPS = 60;
    const frameTime = 1000 / targetFPS;
    
    const gameLoop = (currentTime: number) => {
      const deltaTime = currentTime - lastTime;
      
      if (deltaTime >= frameTime) {
        this.update(deltaTime / 1000); // Convert to seconds
        lastTime = currentTime - (deltaTime % frameTime);
      }
      
      this.gameLoop = requestAnimationFrame(gameLoop);
    };
    
    this.gameLoop = requestAnimationFrame(gameLoop);
  }
  
  private update(deltaTime: number) {
    const gameState = this.store.gameState;
    
    if (gameState.isAfk && gameState.isFighting) {
      this.updateCombat(deltaTime);
    }
    
    // Update enemy positions (simple AI - move towards player)
    this.store.renderState.enemies.forEach((enemy) => {
      if (enemy.sprite && this.player) {
        const dx = this.player.x - enemy.sprite.x;
        const dy = this.player.y - enemy.sprite.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance > 50) {
          const speed = 30; // pixels per second
          enemy.sprite.x += (dx / distance) * speed * deltaTime;
          enemy.sprite.y += (dy / distance) * speed * deltaTime;
        }
      }
    });
    
    // Actualizar parallax del fondo basado en la posición del jugador
    if (this.player && this.backgroundLayers.length > 0) {
      this.updateParallax(this.player.x);
    }
  }
  
  private updateCombat(deltaTime: number) {
    const gameState = this.store.gameState;
    const player = this.store.player;
    
    // Simple combat simulation
    if (this.store.renderState.enemies.length > 0 && Math.random() < deltaTime) {
      const enemy = this.store.renderState.enemies[0];
      
      // Player attacks enemy - Mostrar animación de ataque
      this.changePlayerAnimation('run');
      const playerDamage = 20 + (player.stats.str * 2);
      enemy.hp -= playerDamage;
      
      // Volver a idle después del ataque
      setTimeout(() => {
        this.changePlayerAnimation('idle');
      }, 200);
      
      if (enemy.hp <= 0) {
        // Enemy defeated
        this.store.gainXp(enemy.xpReward);
        this.store.player.gold += enemy.goldReward;
        
        // Remove enemy
        if (enemy.sprite) {
          this.gameContainer.removeChild(enemy.sprite);
          this.enemies.delete(enemy.id);
        }
        
        this.store.renderState.enemies.shift();
        
        // Check if wave completed
        if (this.store.renderState.enemies.length === 0) {
          this.completeWave();
        }
      } else {
        // Enemy attacks player - Mostrar animación de hit
        this.store.takeDamage(enemy.damage);
        this.changePlayerAnimation('hit');
        
        // Volver a idle después de un tiempo
        setTimeout(() => {
          this.changePlayerAnimation('idle');
        }, 500);
        
        if (player.hp <= 0) {
          this.gameOver();
        }
      }
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
      const enemies = this.spawnEnemiesForWave(newWave);
      this.store.renderState.enemies = enemies;
    }
  }
  
  private gameOver() {
    this.store.gameState.isAfk = false;
    this.store.gameState.isFighting = false;
    
    // Mostrar animación de muerte
    this.changePlayerAnimation('dead');
    
    // Reset to safe state, heal player after a delay
    setTimeout(() => {
      this.store.heal(this.store.player.maxHp);
      this.changePlayerAnimation('idle');
    }, 2000);
  }
  
  public startWave(wave: number) {
    // Clear existing enemies
    this.enemies.forEach((sprite) => {
      this.gameContainer.removeChild(sprite);
    });
    this.enemies.clear();
    
    // Spawn new enemies
    const enemies = this.spawnEnemiesForWave(wave);
    this.store.renderState.enemies = enemies;
    this.store.gameState.isFighting = true;
  }
  
  private handleResize() {
    window.addEventListener('resize', () => {
      this.app.renderer.resize(window.innerWidth, window.innerHeight - 120);
      if (this.player) {
        this.player.x = this.app.screen.width / 2;
        this.player.y = this.app.screen.height / 2;
      }
      // Forzar renderizado después del resize
      this.forceRender();
    });
  }
  
  public destroy() {
    if (this.gameLoop) {
      cancelAnimationFrame(this.gameLoop);
    }
    if (this.pulseEffect) {
      clearInterval(this.pulseEffect);
    }
    this.app.destroy(true);
  }
  
  public setBackgroundColor(color: number) {
    this.app.renderer.background.color = color;
  }
  
  public setFullScreenMode(isFullScreen: boolean) {
    if (isFullScreen) {
      // Modo pantalla completa (MAP) - fondo más claro
      this.setBackgroundColor(0x4a4a6a); // Fondo aún más claro
      // Forzar renderizado en pantalla completa
      this.forceRender();
      // Activar el canvas
      this.activateCanvas();
      // Activar efecto de pulso para el alien
      this.startPulseEffect();
      // Hacer el alien más brillante
      this.enhancePlayerVisibility();
    } else {
      // Modo con panel lateral - fondo más oscuro
      this.setBackgroundColor(0x2a2a4a);
      // Detener efecto de pulso
      this.stopPulseEffect();
      // Resetear brillo del alien
      this.resetPlayerVisibility();
    }
  }
  
  private startPulseEffect() {
    if (!this.player) return;
    
    // Crear un efecto de pulso sutil
    const pulse = () => {
      if (this.player && this.currentAnimation === 'idle') {
        this.player.scale.x = 1.0 + Math.sin(Date.now() * 0.003) * 0.05;
        this.player.scale.y = 1.0 + Math.sin(Date.now() * 0.003) * 0.05;
      }
    };
    
    // Agregar el efecto de pulso al game loop
    this.pulseEffect = setInterval(pulse, 16); // ~60 FPS
  }
  
  private stopPulseEffect() {
    if (this.pulseEffect) {
      clearInterval(this.pulseEffect);
      this.pulseEffect = null;
    }
    
    // Resetear escala del alien
    if (this.player) {
      this.player.scale.x = 1.0;
      this.player.scale.y = 1.0;
    }
  }
  
  private activateCanvas() {
    // Asegurar que el canvas esté activo y visible
    if (this.app && this.app.view) {
      const canvas = this.app.view as HTMLCanvasElement;
      canvas.style.display = 'block';
      canvas.style.visibility = 'visible';
      canvas.style.opacity = '1';
    }
  }
  
  private forceRender() {
    // Forzar un renderizado del canvas
    if (this.app && this.app.renderer) {
      this.app.renderer.render(this.app.stage);
    }
  }

  private addGlowEffect() {
    if (!this.player) return;
    
    // Crear un contenedor para el efecto de resplandor
    const glowContainer = new PIXI.Container();
    
    // Crear una copia del sprite para el resplandor
    const glowSprite = new PIXI.Sprite(this.player.texture);
    glowSprite.width = this.player.width + 30; // Resplandor más grande
    glowSprite.height = this.player.height + 30;
    glowSprite.anchor.set(0.5);
    glowSprite.tint = 0x44aaff;
    glowSprite.alpha = 0.5; // Más opaco para mejor visibilidad
    
    // Agregar filtro de desenfoque para el resplandor
    const blurFilter = new PIXI.BlurFilter(6, 6); // Más desenfoque
    glowSprite.filters = [blurFilter];
    
    glowContainer.addChild(glowSprite);
    glowContainer.x = this.player.x;
    glowContainer.y = this.player.y;
    
    this.gameContainer.addChildAt(glowContainer, 0); // Agregar detrás del player
  }

  private addPlayerBackground() {
    // Crear un círculo claro detrás del alien
    const backgroundCircle = new PIXI.Graphics();
    backgroundCircle.beginFill(0x5a5a7a, 0.3); // Color más claro y menos opaco para no interferir con el fondo
    backgroundCircle.drawCircle(0, 0, 60); // Círculo más grande que el alien
    backgroundCircle.endFill();
    
    backgroundCircle.x = this.app.screen.width / 2;
    backgroundCircle.y = this.app.screen.height / 2;
    
    // Agregar después de las capas de fondo pero antes del player
    this.gameContainer.addChildAt(backgroundCircle, this.backgroundLayers.length);
  }

  private enhancePlayerVisibility() {
    if (!this.player) return;
    
    // Hacer el alien más brillante en modo MAP
    this.player.tint = 0x66ccff; // Azul más brillante
    this.player.alpha = 1.0;
    
    // Aumentar el filtro de brillo
    const brightnessFilter = new PIXI.ColorMatrixFilter();
    brightnessFilter.brightness(2.0, true); // Hacer el alien 100% más brillante
    this.player.filters = [brightnessFilter];
  }
  
  private resetPlayerVisibility() {
    if (!this.player) return;
    
    // Resetear el alien a su brillo normal
    this.player.tint = 0x44aaff;
    this.player.alpha = 1.0;
    
    // Resetear el filtro de brillo
    const brightnessFilter = new PIXI.ColorMatrixFilter();
    brightnessFilter.brightness(1.8, true);
    this.player.filters = [brightnessFilter];
  }

  // Métodos para manejar fondos con parallax
  private loadBackground() {
    // Limpiar fondos existentes
    this.clearBackground();
    
    // Cargar las capas del fondo actual
    const backgroundNumber = this.currentBackground;
    
    // Cargar capas de parallax (Plan 1 es el más lejano, Plan 5 el más cercano)
    for (let i = 1; i <= 5; i++) {
      try {
        const texture = PIXI.Texture.from(`/assets/background/PNG/background ${backgroundNumber}/Plan ${i}.png`);
        const sprite = new PIXI.Sprite(texture);
        
        // Configurar el sprite para que cubra toda la pantalla
        sprite.width = this.app.screen.width;
        sprite.height = this.app.screen.height;
        sprite.x = 0;
        sprite.y = 0;
        
        // Agregar a la lista de capas
        this.backgroundLayers.push(sprite);
        
        // Agregar al contenedor del juego (al fondo)
        this.gameContainer.addChildAt(sprite, 0);
      } catch (error) {
        console.warn(`No se pudo cargar Plan ${i} del background ${backgroundNumber}`);
      }
    }
  }

  private clearBackground() {
    // Remover todas las capas de fondo existentes
    this.backgroundLayers.forEach(layer => {
      if (layer.parent) {
        layer.parent.removeChild(layer);
      }
    });
    this.backgroundLayers = [];
  }

  public changeBackground(backgroundNumber: number) {
    if (backgroundNumber >= 1 && backgroundNumber <= 4 && backgroundNumber !== this.currentBackground) {
      this.currentBackground = backgroundNumber;
      this.loadBackground();
      
      // Recrear el fondo del jugador después de cambiar el fondo
      setTimeout(() => {
        this.addPlayerBackground();
        this.addGlowEffect();
      }, 100);
    }
  }

  public updateParallax(playerX: number) {
    // Aplicar efecto parallax basado en la posición del jugador
    this.backgroundLayers.forEach((layer, index) => {
      const speed = (index + 1) * this.parallaxSpeed * 0.1; // Velocidad diferente para cada capa
      layer.x = -(playerX * speed);
    });
  }

  public setParallaxSpeed(speed: number) {
    this.parallaxSpeed = Math.max(0, Math.min(2, speed)); // Limitar entre 0 y 2
  }
}
