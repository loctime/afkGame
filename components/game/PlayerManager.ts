import * as PIXI from 'pixi.js';

const ENABLE_FILTERS = false;

export class PlayerManager {
  private player: PIXI.AnimatedSprite | null = null;
  private playerAnimations: Map<string, PIXI.Texture[]> = new Map();
  private currentAnimation: string = 'idle';
  private pulseEffect: NodeJS.Timeout | null = null;
  private blinkTimeout: NodeJS.Timeout | null = null;
  private facing: 1 | -1 = 1;
  private gameContainer: PIXI.Container;
  private app: PIXI.Application;

  constructor(app: PIXI.Application, gameContainer: PIXI.Container) {
    this.app = app;
    this.gameContainer = gameContainer;
    this.setupPlayer();
    this.loadPlayerAnimations();
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
    this.player.width = 80;
    this.player.height = 80;
    this.player.x = this.app.screen.width / 2;
    this.player.y = this.app.screen.height / 2;
    this.player.anchor.set(0.5);
    
    // Aplicar efectos de color para hacerlo más brillante
    this.player.tint = 0x44aaff;
    this.player.alpha = 1.0;
    
    // Agregar filtro de brillo más potente
    if (ENABLE_FILTERS) {
      const brightnessFilter = new PIXI.ColorMatrixFilter();
      brightnessFilter.brightness(1.8, true);
      this.player.filters = [brightnessFilter];
    } else {
      this.player.filters = [];
    }
    
    // Agregar fondo circular claro detrás del alien
    this.addPlayerBackground();
    
    // Agregar efecto de resplandor más potente
    this.addGlowEffect();
    
    this.gameContainer.addChild(this.player);
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

    // Cargar animación de blink
    const blinkFrames = [];
    for (let i = 1; i <= 2; i++) {
      blinkFrames.push(PIXI.Texture.from(`/assets/sprites/Alien/Without Light Outline/Fames/Alien_BLINK_${i}.png`));
    }
    this.playerAnimations.set('blink', blinkFrames);

    // Cargar animación de fall
    const fallFrames = [];
    for (let i = 1; i <= 2; i++) {
      fallFrames.push(PIXI.Texture.from(`/assets/sprites/Alien/Without Light Outline/Fames/Alien_FALL_${i}.png`));
    }
    this.playerAnimations.set('fall', fallFrames);

    // Cargar animación de jump
    const jumpFrames = [];
    jumpFrames.push(PIXI.Texture.from(`/assets/sprites/Alien/Without Light Outline/Fames/Alien_JUMP.png`));
    this.playerAnimations.set('jump', jumpFrames);
  }

  public changeAnimation(animationName: string) {
    if (!this.player || this.currentAnimation === animationName) return;
    
    const frames = this.playerAnimations.get(animationName);
    if (frames) {
      this.player.textures = frames;
      this.player.play();
      this.currentAnimation = animationName;
      
      // Aplicar efectos de color según la animación
      switch (animationName) {
        case 'idle':
          this.player.tint = 0x44aaff;
          this.player.alpha = 1.0;
          break;
        case 'run':
          this.player.tint = 0x00ff00;
          this.player.alpha = 1.0;
          break;
        case 'hit':
          this.player.tint = 0xff0000;
          this.player.alpha = 1.0;
          break;
        case 'dead':
          this.player.tint = 0x888888;
          this.player.alpha = 0.8;
          break;
        case 'blink':
          this.player.tint = 0x44aaff;
          this.player.alpha = 1.0;
          break;
        case 'fall':
          this.player.tint = 0xff8800;
          this.player.alpha = 1.0;
          break;
        case 'jump':
          this.player.tint = 0x44aaff;
          this.player.alpha = 1.0;
          break;
      }
    }
  }

  private addGlowEffect() {
    if (!this.player) return;
    if (!ENABLE_FILTERS) return;
    
    // Crear un contenedor para el efecto de resplandor
    const glowContainer = new PIXI.Container();
    
    // Crear una copia del sprite para el resplandor
    const glowSprite = new PIXI.Sprite(this.player.texture);
    glowSprite.width = this.player.width + 30;
    glowSprite.height = this.player.height + 30;
    glowSprite.anchor.set(0.5);
    glowSprite.tint = 0x44aaff;
    glowSprite.alpha = 0.5;
    
    // Agregar filtro de desenfoque para el resplandor
    const blurFilter = new PIXI.BlurFilter(6, 6);
    glowSprite.filters = [blurFilter];
    
    glowContainer.addChild(glowSprite);
    glowContainer.x = this.player.x;
    glowContainer.y = this.player.y;
    
    this.gameContainer.addChildAt(glowContainer, 0);
  }

  private addPlayerBackground() {
    // Crear un círculo claro detrás del alien
    const backgroundCircle = new PIXI.Graphics();
    backgroundCircle.beginFill(0x5a5a7a, 0.3);
    backgroundCircle.drawCircle(0, 0, 60);
    backgroundCircle.endFill();
    
    backgroundCircle.x = this.app.screen.width / 2;
    backgroundCircle.y = this.app.screen.height / 2;
    
    this.gameContainer.addChildAt(backgroundCircle, 0);
  }

  public startPulseEffect() {
    if (!this.player) return;
    
    const pulse = () => {
      if (this.player && this.currentAnimation === 'idle') {
        this.player.scale.x = this.facing * (1.0 + Math.sin(Date.now() * 0.003) * 0.05);
        this.player.scale.y = 1.0 + Math.sin(Date.now() * 0.003) * 0.05;
      }
    };
    
    this.pulseEffect = setInterval(pulse, 16);
  }

  public startBlinkRoutine() {
    const schedule = () => {
      const delay = 4000 + Math.random() * 3000;
      this.blinkTimeout = setTimeout(() => {
        if (this.currentAnimation === 'idle') {
          this.changeAnimation('blink');
          setTimeout(() => {
            if (this.currentAnimation === 'blink') {
              this.changeAnimation('idle');
            }
            schedule();
          }, 400);
        } else {
          schedule();
        }
      }, delay);
    };
    schedule();
  }

  public stopBlinkRoutine() {
    if (this.blinkTimeout) {
      clearTimeout(this.blinkTimeout);
      this.blinkTimeout = null;
    }
  }

  public stopPulseEffect() {
    if (this.pulseEffect) {
      clearInterval(this.pulseEffect);
      this.pulseEffect = null;
    }
    
    if (this.player) {
      this.player.scale.x = this.facing * 1.0;
      this.player.scale.y = 1.0;
    }
  }

  public enhanceVisibility() {
    if (!this.player) return;
    
    this.player.tint = 0x66ccff;
    this.player.alpha = 1.0;
    
    if (ENABLE_FILTERS) {
      const brightnessFilter = new PIXI.ColorMatrixFilter();
      brightnessFilter.brightness(2.0, true);
      this.player.filters = [brightnessFilter];
    } else {
      this.player.filters = [];
    }
  }

  public resetVisibility() {
    if (!this.player) return;
    
    this.player.tint = 0x44aaff;
    this.player.alpha = 1.0;
    
    if (ENABLE_FILTERS) {
      const brightnessFilter = new PIXI.ColorMatrixFilter();
      brightnessFilter.brightness(1.8, true);
      this.player.filters = [brightnessFilter];
    } else {
      this.player.filters = [];
    }
  }

  public getPlayer() {
    return this.player;
  }

  public faceTarget(targetX: number) {
    if (!this.player) return;
    const dx = targetX - this.player.x;
    if (Math.abs(dx) < 1) return;
    this.facing = dx >= 0 ? 1 : -1;
    const absScaleX = Math.abs(this.player.scale.x) || 1;
    this.player.scale.x = absScaleX * this.facing;
  }

  public updatePosition(x: number, y: number) {
    if (this.player) {
      this.player.x = x;
      this.player.y = y;
    }
  }

  public destroy() {
    this.stopBlinkRoutine();
    if (this.pulseEffect) {
      clearInterval(this.pulseEffect);
    }
  }
}
