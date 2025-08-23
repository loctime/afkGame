// Utilidades para el sistema del juego

import { GAME_CONFIG, ITEM_RARITIES } from '../balance/game-config';

/**
 * Genera un número aleatorio entre min y max
 */
export function random(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}

/**
 * Genera un número entero aleatorio entre min y max (inclusive)
 */
export function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Calcula si un evento ocurre basado en una probabilidad
 */
export function rollChance(probability: number): boolean {
  return Math.random() < probability;
}

/**
 * Calcula el daño del jugador basado en sus stats y equipamiento
 */
export function calculatePlayerDamage(player: any, equipment: any): number {
  const baseDamage = 10;
  const strDamage = player.stats.str * GAME_CONFIG.STATS.STR_DAMAGE_MULTIPLIER;
  const weaponDamage = equipment.weapon?.damage || 0;
  
  let totalDamage = baseDamage + strDamage + weaponDamage;
  
  // Aplicar crítico
  if (rollChance(GAME_CONFIG.COMBAT.BASE_CRIT_CHANCE)) {
    totalDamage *= GAME_CONFIG.COMBAT.BASE_CRIT_MULTIPLIER;
  }
  
  return Math.floor(totalDamage);
}

/**
 * Calcula la velocidad de ataque del jugador
 */
export function calculateAttackSpeed(player: any, equipment: any): number {
  const baseSpeed = GAME_CONFIG.COMBAT.BASE_ATTACK_SPEED;
  const dexSpeed = player.stats.dex * GAME_CONFIG.STATS.DEX_ATTACK_SPEED_MULTIPLIER;
  
  return baseSpeed + dexSpeed;
}

/**
 * Calcula la XP necesaria para el siguiente nivel
 */
export function calculateXpForLevel(level: number): number {
  return Math.floor(GAME_CONFIG.XP.BASE_XP_PER_LEVEL * Math.pow(GAME_CONFIG.XP.XP_SCALING, level - 1));
}

/**
 * Calcula las recompensas offline basadas en el tiempo transcurrido
 */
export function calculateOfflineRewards(
  timeOffline: number,
  playerLevel: number,
  isAfk: boolean
): { xp: number; gold: number; items: any[] } {
  if (!isAfk || timeOffline <= 0) {
    return { xp: 0, gold: 0, items: [] };
  }
  
  const maxTime = GAME_CONFIG.OFFLINE.MAX_OFFLINE_HOURS * 60 * 60 * 1000; // 2 horas en ms
  const actualTime = Math.min(timeOffline, maxTime);
  const efficiency = GAME_CONFIG.OFFLINE.OFFLINE_EFFICIENCY;
  
  // Calcular XP y oro basado en tiempo offline
  const xpPerSecond = playerLevel * 0.1; // 0.1 XP por segundo por nivel
  const goldPerSecond = playerLevel * 0.05; // 0.05 oro por segundo por nivel
  
  const xp = Math.floor(xpPerSecond * (actualTime / 1000) * efficiency);
  const gold = Math.floor(goldPerSecond * (actualTime / 1000) * efficiency);
  
  // Calcular drops basados en tiempo offline
  const items: any[] = [];
  const dropChance = GAME_CONFIG.DROPS.BASE_DROP_RATE * efficiency;
  const totalSeconds = actualTime / 1000;
  
  // Simular drops basados en tiempo
  for (let i = 0; i < totalSeconds; i++) {
    if (rollChance(dropChance)) {
      // Generar item aleatorio (placeholder)
      items.push({
        id: `offline_item_${Date.now()}_${i}`,
        name: 'Offline Drop',
        type: 'consumable',
        rarity: 'common',
        value: 10,
      });
    }
  }
  
  return { xp, gold, items };
}

/**
 * Genera un enemigo basado en la oleada actual
 */
export function generateEnemy(wave: number, isBoss: boolean = false): any {
  const enemyTypes = ['goblin', 'orc', 'troll'];
  const type = isBoss ? 'boss' : enemyTypes[wave % enemyTypes.length];
  
  const baseStats = {
    goblin: { hp: 50, damage: 10, xp: 15, gold: 5 },
    orc: { hp: 80, damage: 15, xp: 25, gold: 8 },
    troll: { hp: 120, damage: 20, xp: 40, gold: 12 },
    boss: { hp: 500, damage: 50, xp: 200, gold: 100 },
  };
  
  const stats = baseStats[type as keyof typeof baseStats];
  const scaling = Math.pow(GAME_CONFIG.WAVES.ENEMY_HP_SCALING, wave - 1);
  
  return {
    id: `enemy_${wave}_${Date.now()}`,
    name: `${type.charAt(0).toUpperCase() + type.slice(1)} Lv.${wave}`,
    level: wave,
    hp: Math.floor(stats.hp * scaling),
    maxHp: Math.floor(stats.hp * scaling),
    damage: Math.floor(stats.damage * Math.pow(GAME_CONFIG.WAVES.ENEMY_DAMAGE_SCALING, wave - 1)),
    xpReward: Math.floor(stats.xp * (isBoss ? GAME_CONFIG.XP.BOSS_XP_MULTIPLIER : 1)),
    goldReward: stats.gold,
    type,
    x: 0,
    y: 0,
    isDead: false,
  };
}

/**
 * Genera un item aleatorio basado en las probabilidades
 */
export function generateRandomItem(playerLevel: number): any {
  const rarityRoll = Math.random();
  let rarity: string;
  
  if (rarityRoll < GAME_CONFIG.DROPS.LEGENDARY_DROP_RATE) {
    rarity = 'legendary';
  } else if (rarityRoll < GAME_CONFIG.DROPS.EPIC_DROP_RATE) {
    rarity = 'epic';
  } else if (rarityRoll < GAME_CONFIG.DROPS.RARE_DROP_RATE) {
    rarity = 'rare';
  } else {
    rarity = 'common';
  }
  
  const itemTypes = ['weapon', 'armor', 'rune'];
  const type = itemTypes[Math.floor(Math.random() * itemTypes.length)];
  
  const baseStats = {
    weapon: { damage: 10, value: 50 },
    armor: { defense: 10, value: 40 },
    rune: { value: 30 },
  };
  
  const stats = baseStats[type as keyof typeof baseStats];
  const rarityMultiplier = ITEM_RARITIES[rarity as keyof typeof ITEM_RARITIES]?.statMultiplier || 1;
  
  return {
    id: `item_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    name: `${rarity.charAt(0).toUpperCase() + rarity.slice(1)} ${type.charAt(0).toUpperCase() + type.slice(1)}`,
    type,
    rarity,
    ...stats,
    value: Math.floor(stats.value * rarityMultiplier),
    description: `A ${rarity} ${type} item.`,
  };
}

/**
 * Formatea un número para mostrar en la UI
 */
export function formatNumber(num: number): string {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  } else if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toString();
}

/**
 * Formatea el tiempo en formato legible
 */
export function formatTime(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  
  if (hours > 0) {
    return `${hours}h ${minutes}m ${secs}s`;
  } else if (minutes > 0) {
    return `${minutes}m ${secs}s`;
  } else {
    return `${secs}s`;
  }
}
