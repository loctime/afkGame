import * as PIXI from 'pixi.js';

const ENABLE_FILTERS = false;
const MAX_ACTIVE_EFFECTS = 20;

interface SkillEffect {
  id: string;
  sprite: PIXI.Sprite;
  targetX: number;
  targetY: number;
  speed: number;
  damage: number;
  type: string;
}

interface DamageNumber {
  text: PIXI.Text;
  vy: number;
  life: number;
}

export class SkillEffectManager {
  private skillEffects: SkillEffect[] = [];
  private skillEffectId: number = 0;
  private gameContainer: PIXI.Container;
  private damageNumbers: DamageNumber[] = [];

  constructor(gameContainer: PIXI.Container) {
    this.gameContainer = gameContainer;
  }

  private canSpawnEffect() {
    return this.skillEffects.length < MAX_ACTIVE_EFFECTS;
  }

  public createBasicAttackEffect(playerX: number, playerY: number, targetX: number, targetY: number) {
    if (!this.canSpawnEffect()) return;
    const projectile = new PIXI.Graphics();
    projectile.beginFill(0xffff00);
    projectile.drawCircle(0, 0, 8);
    projectile.endFill();

    const glow = new PIXI.Graphics();
    glow.beginFill(0xffff00, 0.5);
    glow.drawCircle(0, 0, 12);
    glow.endFill();
    if (ENABLE_FILTERS) {
      glow.filters = [new PIXI.BlurFilter(2, 2)];
    }

    const container = new PIXI.Container();
    container.addChild(glow);
    container.addChild(projectile);
    container.x = playerX;
    container.y = playerY;

    this.gameContainer.addChild(container);

    this.skillEffects.push({
      id: `basic_attack_${this.skillEffectId++}`,
      sprite: container as any,
      targetX,
      targetY,
      speed: 300,
      damage: 0,
      type: 'basic_attack',
    });
  }

  public createFireballEffect(playerX: number, playerY: number, targetX: number, targetY: number) {
    if (!this.canSpawnEffect()) return;
    const fireball = new PIXI.Graphics();
    fireball.beginFill(0xff4400);
    fireball.drawCircle(0, 0, 12);
    fireball.endFill();

    const glow = new PIXI.Graphics();
    glow.beginFill(0xff8800, 0.6);
    glow.drawCircle(0, 0, 18);
    glow.endFill();
    if (ENABLE_FILTERS) {
      glow.filters = [new PIXI.BlurFilter(3, 3)];
    }

    const particles = new PIXI.Graphics();
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2;
      const radius = 15 + Math.random() * 5;
      particles.beginFill(0xffaa00, 0.8);
      particles.drawCircle(Math.cos(angle) * radius, Math.sin(angle) * radius, 3);
      particles.endFill();
    }

    const container = new PIXI.Container();
    container.addChild(glow);
    container.addChild(fireball);
    container.addChild(particles);
    container.x = playerX;
    container.y = playerY;

    this.gameContainer.addChild(container);

    this.skillEffects.push({
      id: `fireball_${this.skillEffectId++}`,
      sprite: container as any,
      targetX,
      targetY,
      speed: 250,
      damage: 0,
      type: 'fireball',
    });
  }

  public createHealEffect(playerX: number, playerY: number) {
    // Crear efecto de curación
    const healEffect = new PIXI.Graphics();
    healEffect.beginFill(0x00ff00, 0.7); // Verde
    healEffect.drawCircle(0, 0, 20);
    healEffect.endFill();
    
    // Agregar resplandor
    const glow = new PIXI.Graphics();
    glow.beginFill(0x00ff00, 0.4);
    glow.drawCircle(0, 0, 30);
    glow.endFill();
    if (ENABLE_FILTERS) {
      glow.filters = [new PIXI.BlurFilter(4, 4)];
    }
    
    const container = new PIXI.Container();
    container.addChild(glow);
    container.addChild(healEffect);
    
    container.x = playerX;
    container.y = playerY;
    
    this.gameContainer.addChild(container);
    
    // Animar el efecto de curación
    let scale = 0.5;
    const animate = () => {
      scale += 0.05;
      container.scale.set(scale);
      container.alpha = 1 - (scale - 0.5) * 2;
      
      if (scale < 2) {
        requestAnimationFrame(animate);
      } else {
        this.gameContainer.removeChild(container);
      }
    };
    animate();
  }

  public createIceShardEffect(playerX: number, playerY: number, targetX: number, targetY: number) {
    if (!this.canSpawnEffect()) return;
    const iceShard = new PIXI.Graphics();
    iceShard.beginFill(0x00ffff);
    iceShard.drawPolygon([-8, 0, 8, -6, 4, 0, 8, 6, -8, 0]);
    iceShard.endFill();

    const glow = new PIXI.Graphics();
    glow.beginFill(0x88ffff, 0.5);
    glow.drawCircle(0, 0, 15);
    glow.endFill();
    if (ENABLE_FILTERS) {
      glow.filters = [new PIXI.BlurFilter(2, 2)];
    }

    const particles = new PIXI.Graphics();
    for (let i = 0; i < 6; i++) {
      const angle = (i / 6) * Math.PI * 2;
      const radius = 12 + Math.random() * 4;
      particles.beginFill(0xffffff, 0.9);
      particles.drawCircle(Math.cos(angle) * radius, Math.sin(angle) * radius, 2);
      particles.endFill();
    }

    const container = new PIXI.Container();
    container.addChild(glow);
    container.addChild(iceShard);
    container.addChild(particles);
    container.x = playerX;
    container.y = playerY;

    this.gameContainer.addChild(container);

    this.skillEffects.push({
      id: `ice_shard_${this.skillEffectId++}`,
      sprite: container as any,
      targetX,
      targetY,
      speed: 280,
      damage: 0,
      type: 'ice_shard',
    });
  }

  public createLightningBoltEffect(playerX: number, playerY: number, targetX: number, targetY: number) {
    const lightning = new PIXI.Graphics();
    lightning.lineStyle(4, 0xffff00, 1);
    lightning.moveTo(0, 0);

    const points: number[] = [];
    const distance = Math.sqrt(Math.pow(targetX - playerX, 2) + Math.pow(targetY - playerY, 2));
    const segments = Math.floor(distance / 20);

    for (let i = 0; i <= segments; i++) {
      const t = i / segments;
      const x = t * (targetX - playerX);
      const y = t * (targetY - playerY);
      const offset = Math.sin(t * Math.PI * 4) * 10;
      points.push(x + offset, y);
    }

    lightning.drawPolygon(points);

    const glow = new PIXI.Graphics();
    glow.lineStyle(8, 0xffff00, 0.3);
    glow.drawPolygon(points);

    const container = new PIXI.Container();
    container.addChild(glow);
    container.addChild(lightning);
    container.x = playerX;
    container.y = playerY;

    this.gameContainer.addChild(container);

    setTimeout(() => {
      this.createLightningHitEffect(targetX, targetY);
      this.gameContainer.removeChild(container);
    }, 100);
  }

  private createLightningHitEffect(x: number, y: number) {
    // Crear múltiples rayos de impacto
    for (let i = 0; i < 5; i++) {
      const lightning = new PIXI.Graphics();
      lightning.lineStyle(3, 0xffff00, 0.8);
      
      const startX = x + (Math.random() - 0.5) * 40;
      const startY = y + (Math.random() - 0.5) * 40;
      const endX = x + (Math.random() - 0.5) * 60;
      const endY = y + (Math.random() - 0.5) * 60;
      
      lightning.moveTo(startX, startY);
      lightning.lineTo(endX, endY);
      
      this.gameContainer.addChild(lightning);
      
      // Remover después de un tiempo
      setTimeout(() => {
        this.gameContainer.removeChild(lightning);
      }, 200);
    }
    
    // Efecto de explosión eléctrica
    const explosion = new PIXI.Graphics();
    explosion.beginFill(0xffff00, 0.6);
    explosion.drawCircle(x, y, 30);
    explosion.endFill();
    
    this.gameContainer.addChild(explosion);
    
    // Animar la explosión
    let scale = 0.5;
    const animate = () => {
      scale += 0.2;
      explosion.scale.set(scale);
      explosion.alpha = 1 - (scale - 0.5) * 2;
      
      if (scale < 1.5) {
        requestAnimationFrame(animate);
      } else {
        this.gameContainer.removeChild(explosion);
      }
    };
    animate();
  }

  public createDamageNumber(x: number, y: number, amount: number, isCritical: boolean = false) {
    const label = isCritical ? `!${amount}` : `${amount}`;
    const style = new PIXI.TextStyle({
      fontSize: isCritical ? 22 : 16,
      fill: isCritical ? '#ff4400' : '#ffffff',
      fontWeight: 'bold',
      stroke: '#000000',
      strokeThickness: 3,
    });
    const text = new PIXI.Text(label, style);
    text.anchor.set(0.5);
    text.x = x;
    text.y = y;
    this.gameContainer.addChild(text);
    this.damageNumbers.push({ text, vy: 50, life: 0.8 });
  }

  public updateSkillEffects(deltaTime: number) {
    for (let i = this.damageNumbers.length - 1; i >= 0; i--) {
      const dn = this.damageNumbers[i];
      dn.life -= deltaTime;
      dn.text.y -= dn.vy * deltaTime;
      dn.text.alpha = Math.max(0, dn.life / 0.8);
      if (dn.life <= 0) {
        this.gameContainer.removeChild(dn.text);
        this.damageNumbers.splice(i, 1);
      }
    }

    for (let i = this.skillEffects.length - 1; i >= 0; i--) {
      const effect = this.skillEffects[i];
      
      // Calcular dirección hacia el objetivo
      const dx = effect.targetX - effect.sprite.x;
      const dy = effect.targetY - effect.sprite.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      if (distance < 10) {
        // Efecto llegó al objetivo
        this.createHitEffect(effect.sprite.x, effect.sprite.y, effect.type);
        this.gameContainer.removeChild(effect.sprite);
        this.skillEffects.splice(i, 1);
      } else {
        // Mover el efecto hacia el objetivo
        const speed = effect.speed * deltaTime;
        effect.sprite.x += (dx / distance) * speed;
        effect.sprite.y += (dy / distance) * speed;
        
        // Rotar el efecto para que apunte hacia el objetivo
        effect.sprite.rotation = Math.atan2(dy, dx);
      }
    }
  }

  private createHitEffect(x: number, y: number, type: string) {
    const hitEffect = new PIXI.Graphics();
    
    if (type === 'fireball') {
      // Efecto de explosión de fuego
      hitEffect.beginFill(0xff6600);
      hitEffect.drawCircle(0, 0, 25);
      hitEffect.endFill();
      
      const glow = new PIXI.Graphics();
      glow.beginFill(0xffaa00, 0.6);
      glow.drawCircle(0, 0, 35);
      glow.endFill();
      if (ENABLE_FILTERS) {
        glow.filters = [new PIXI.BlurFilter(5, 5)];
      }
      
      const container = new PIXI.Container();
      container.addChild(glow);
      container.addChild(hitEffect);
      container.x = x;
      container.y = y;
      
      this.gameContainer.addChild(container);
      
      // Animar la explosión
      let scale = 0.5;
      const animate = () => {
        scale += 0.1;
        container.scale.set(scale);
        container.alpha = 1 - (scale - 0.5) * 2;
        
        if (scale < 2) {
          requestAnimationFrame(animate);
        } else {
          this.gameContainer.removeChild(container);
        }
      };
      animate();
    } else if (type === 'ice_shard') {
      // Efecto de congelación
      hitEffect.beginFill(0x00ffff);
      hitEffect.drawCircle(0, 0, 20);
      hitEffect.endFill();
      
      const glow = new PIXI.Graphics();
      glow.beginFill(0x88ffff, 0.5);
      glow.drawCircle(0, 0, 30);
      glow.endFill();
      glow.filters = [new PIXI.BlurFilter(3, 3)];
      
      // Agregar cristales de hielo
      const crystals = new PIXI.Graphics();
      for (let i = 0; i < 8; i++) {
        const angle = (i / 8) * Math.PI * 2;
        const radius = 25 + Math.random() * 10;
        crystals.beginFill(0xffffff, 0.8);
        crystals.drawPolygon([
          Math.cos(angle) * radius, Math.sin(angle) * radius,
          Math.cos(angle + 0.2) * (radius + 5), Math.sin(angle + 0.2) * (radius + 5),
          Math.cos(angle - 0.2) * (radius + 5), Math.sin(angle - 0.2) * (radius + 5)
        ]);
        crystals.endFill();
      }
      
      const container = new PIXI.Container();
      container.addChild(glow);
      container.addChild(hitEffect);
      container.addChild(crystals);
      container.x = x;
      container.y = y;
      
      this.gameContainer.addChild(container);
      
      // Animar la congelación
      let scale = 0.5;
      const animate = () => {
        scale += 0.08;
        container.scale.set(scale);
        container.alpha = 1 - (scale - 0.5) * 2;
        
        if (scale < 2.5) {
          requestAnimationFrame(animate);
        } else {
          this.gameContainer.removeChild(container);
        }
      };
      animate();
    } else {
      // Efecto de impacto básico
      hitEffect.beginFill(0xffff00);
      hitEffect.drawCircle(0, 0, 15);
      hitEffect.endFill();
      
      const container = new PIXI.Container();
      container.addChild(hitEffect);
      container.x = x;
      container.y = y;
      
      this.gameContainer.addChild(container);
      
      // Animar el impacto
      let scale = 0.5;
      const animate = () => {
        scale += 0.15;
        container.scale.set(scale);
        container.alpha = 1 - (scale - 0.5) * 2;
        
        if (scale < 1.5) {
          requestAnimationFrame(animate);
        } else {
          this.gameContainer.removeChild(container);
        }
      };
      animate();
    }
  }

  public clearAllEffects() {
    this.skillEffects.forEach(effect => {
      if (effect.sprite.parent) {
        effect.sprite.parent.removeChild(effect.sprite);
      }
    });
    this.skillEffects = [];

    this.damageNumbers.forEach(dn => {
      if (dn.text.parent) {
        dn.text.parent.removeChild(dn.text);
      }
    });
    this.damageNumbers = [];
  }
}
