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
  private store: GameStore;

  constructor(canvas: HTMLCanvasElement, store: GameStore) {
    this.store = store;
    
    // Initialize PIXI Application
    this.app = new PIXI.Application({
      view: canvas,
      width: window.innerWidth,
      height: window.innerHeight - 120, // Leave space for HUD
      backgroundColor: 0x1a1a2e,
      resolution: window.devicePixelRatio || 1,
      autoDensity: true,
    });
    
    this.gameContainer = new PIXI.Container();
    this.app.stage.addChild(this.gameContainer);
    
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
    this.player.width = 64; // Ajustar tamaño si es necesario
    this.player.height = 64;
    this.player.x = this.app.screen.width / 2;
    this.player.y = this.app.screen.height / 2;
    this.player.anchor.set(0.5);
    
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
    }
  }
  
  private createEnemy(enemy: Enemy): PIXI.Sprite {
    // Create enemy sprite (red rectangle)
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
        name: `Goblin Lv.${wave}`,
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
    });
  }
  
  public destroy() {
    if (this.gameLoop) {
      cancelAnimationFrame(this.gameLoop);
    }
    this.app.destroy(true);
  }
}
