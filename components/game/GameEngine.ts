import * as PIXI from 'pixi.js';
import { GameStore } from '../../stores/types';
import { PlayerManager } from './PlayerManager';
import { EnemyManager } from './EnemyManager';
import { SkillEffectManager } from './SkillEffectManager';
import { BackgroundManager } from './BackgroundManager';
import { CombatManager } from './CombatManager';

export class GameEngine {
  private app: PIXI.Application;
  private gameContainer: PIXI.Container;
  private gameLoop: number = 0;
  private store: GameStore;
  
  // Managers modulares
  private playerManager: PlayerManager;
  private enemyManager: EnemyManager;
  private skillEffectManager: SkillEffectManager;
  private backgroundManager: BackgroundManager;
  private combatManager: CombatManager;

  constructor(canvas: HTMLCanvasElement, store: GameStore) {
    this.store = store;
    
    // Initialize PIXI Application
    this.app = new PIXI.Application({
      view: canvas,
      width: window.innerWidth,
      height: window.innerHeight - 120, // Leave space for HUD
      backgroundColor: 0x2a2a4a,
      resolution: window.devicePixelRatio || 1,
      autoDensity: true,
    });
    
    this.gameContainer = new PIXI.Container();
    this.app.stage.addChild(this.gameContainer);
    
    // Inicializar managers
    this.backgroundManager = new BackgroundManager(this.app, this.gameContainer);
    this.playerManager = new PlayerManager(this.app, this.gameContainer);
    this.enemyManager = new EnemyManager(this.app, this.gameContainer);
    this.skillEffectManager = new SkillEffectManager(this.gameContainer);
    this.combatManager = new CombatManager(this.store, this.skillEffectManager, this.playerManager, this.enemyManager);
    
    this.startGameLoop();
    this.handleResize();
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
    const player = this.playerManager.getPlayer();
    
    if (gameState.isAfk && gameState.isFighting) {
      this.combatManager.updateCombat(deltaTime);
    }
    
    // Update enemy positions
    if (player) {
      this.enemyManager.updateEnemyPositions(
        this.store.renderState.enemies, 
        player.x, 
        player.y, 
        deltaTime
      );
    }
    
    // Actualizar efectos de habilidades
    this.skillEffectManager.updateSkillEffects(deltaTime);
    
    // Actualizar parallax del fondo basado en la posición del jugador
    if (player) {
      this.backgroundManager.updateParallax(player.x);
    }
  }
  
  public startWave(wave: number) {
    // Clear existing enemies
    this.enemyManager.clearAllEnemies();

    // Spawn new enemies and push them through the store so Zustand triggers re-renders
    const enemies = this.enemyManager.spawnEnemiesForWave(wave);
    this.store.setEnemies(enemies);
    this.store.setIsFighting(true);
  }
  
  private handleResize() {
    window.addEventListener('resize', () => {
      this.app.renderer.resize(window.innerWidth, window.innerHeight - 120);
      if (this.playerManager.getPlayer()) {
        this.playerManager.updatePosition(
          this.app.screen.width / 2,
          this.app.screen.height / 2
        );
      }
      // Forzar renderizado después del resize
      this.forceRender();
    });
  }
  
  public destroy() {
    if (this.gameLoop) {
      cancelAnimationFrame(this.gameLoop);
    }
    
    // Destruir managers
    this.playerManager.destroy();
    this.skillEffectManager.clearAllEffects();
    this.enemyManager.clearAllEnemies();
    
    this.app.destroy(true);
  }
  
  public setBackgroundColor(color: number) {
    this.app.renderer.background.color = color;
  }
  
  public setFullScreenMode(isFullScreen: boolean) {
    if (isFullScreen) {
      // Modo pantalla completa (MAP) - fondo más claro
      this.setBackgroundColor(0x4a4a6a);
      // Forzar renderizado en pantalla completa
      this.forceRender();
      // Activar el canvas
      this.activateCanvas();
      // Activar efecto de pulso para el alien
      this.playerManager.startPulseEffect();
      // Hacer el alien más brillante
      this.playerManager.enhanceVisibility();
    } else {
      // Modo con panel lateral - fondo más oscuro
      this.setBackgroundColor(0x2a2a4a);
      // Detener efecto de pulso
      this.playerManager.stopPulseEffect();
      // Resetear brillo del alien
      this.playerManager.resetVisibility();
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

  // Métodos públicos para acceder a los managers
  public changeBackground(backgroundNumber: number) {
    this.backgroundManager.changeBackground(backgroundNumber);
  }

  public setParallaxSpeed(speed: number) {
    this.backgroundManager.setParallaxSpeed(speed);
  }

  public getPlayerManager() {
    return this.playerManager;
  }

  public getEnemyManager() {
    return this.enemyManager;
  }

  public getSkillEffectManager() {
    return this.skillEffectManager;
  }

  public getBackgroundManager() {
    return this.backgroundManager;
  }
}
