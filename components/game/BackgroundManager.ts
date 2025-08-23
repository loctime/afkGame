import * as PIXI from 'pixi.js';

export class BackgroundManager {
  private backgroundLayers: PIXI.Sprite[] = [];
  private currentBackground: number = 1;
  private parallaxSpeed: number = 0.5;
  private gameContainer: PIXI.Container;
  private app: PIXI.Application;

  constructor(app: PIXI.Application, gameContainer: PIXI.Container) {
    this.app = app;
    this.gameContainer = gameContainer;
    this.loadBackground();
  }

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

  public getCurrentBackground() {
    return this.currentBackground;
  }

  public getBackgroundLayers() {
    return this.backgroundLayers;
  }
}
