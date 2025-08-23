// Configuración de balance del juego
export const GAME_CONFIG = {
  // Configuración de combate
  COMBAT: {
    BASE_ATTACK_SPEED: 1.0, // ataques por segundo
    BASE_CRIT_CHANCE: 0.05, // 5% de probabilidad crítica
    BASE_CRIT_MULTIPLIER: 1.5,
    DODGE_CHANCE: 0.02, // 2% de probabilidad de esquivar
  },

  // Configuración de experiencia
  XP: {
    BASE_XP_PER_LEVEL: 100,
    XP_SCALING: 1.15, // multiplicador por nivel
    BOSS_XP_MULTIPLIER: 5, // 5x XP por derrotar boss
  },

  // Configuración de oleadas
  WAVES: {
    ENEMIES_PER_WAVE: 9, // enemigos por oleada normal
    BOSS_WAVE_INTERVAL: 10, // cada 10 oleadas hay un boss
    ENEMY_HP_SCALING: 1.1, // multiplicador de HP por oleada
    ENEMY_DAMAGE_SCALING: 1.05, // multiplicador de daño por oleada
  },

  // Configuración de drops
  DROPS: {
    BASE_DROP_RATE: 0.1, // 10% de probabilidad de drop
    RARE_DROP_RATE: 0.02, // 2% de probabilidad de item raro
    EPIC_DROP_RATE: 0.005, // 0.5% de probabilidad de item épico
    LEGENDARY_DROP_RATE: 0.001, // 0.1% de probabilidad de item legendario
  },

  // Configuración de stats
  STATS: {
    POINTS_PER_LEVEL: 5,
    STR_DAMAGE_MULTIPLIER: 2, // cada punto de STR = +2 daño
    DEX_ATTACK_SPEED_MULTIPLIER: 0.02, // cada punto de DEX = +2% velocidad de ataque
    INT_MANA_MULTIPLIER: 5, // cada punto de INT = +5 mana
    VIT_HP_MULTIPLIER: 10, // cada punto de VIT = +10 HP
  },

  // Configuración de offline rewards
  OFFLINE: {
    MAX_OFFLINE_HOURS: 2, // máximo 2 horas de recompensas offline
    OFFLINE_EFFICIENCY: 0.5, // 50% de eficiencia offline vs online
  },

  // Configuración de reset
  RESET: {
    LEVELS_LOST: 100, // niveles perdidos en reset
    STATS_PRESERVED: true, // mantener stats asignados
    GOLD_PRESERVED: true, // mantener oro
    EQUIPMENT_PRESERVED: true, // mantener equipamiento
  },
};

// Configuración de enemigos
export const ENEMY_TYPES = {
  GOBLIN: {
    name: 'Goblin',
    baseHP: 50,
    baseDamage: 10,
    baseXP: 15,
    baseGold: 5,
    dropRate: 0.1,
  },
  ORC: {
    name: 'Orc',
    baseHP: 80,
    baseDamage: 15,
    baseXP: 25,
    baseGold: 8,
    dropRate: 0.12,
  },
  TROLL: {
    name: 'Troll',
    baseHP: 120,
    baseDamage: 20,
    baseXP: 40,
    baseGold: 12,
    dropRate: 0.15,
  },
  BOSS: {
    name: 'Boss',
    baseHP: 500,
    baseDamage: 50,
    baseXP: 200,
    baseGold: 100,
    dropRate: 1.0, // siempre dropea algo
  },
};

// Configuración de items
export const ITEM_RARITIES = {
  COMMON: {
    name: 'Common',
    color: '#9ca3af',
    dropRate: 0.7,
    statMultiplier: 1,
  },
  RARE: {
    name: 'Rare',
    color: '#3b82f6',
    dropRate: 0.2,
    statMultiplier: 1.5,
  },
  EPIC: {
    name: 'Epic',
    color: '#8b5cf6',
    dropRate: 0.08,
    statMultiplier: 2,
  },
  LEGENDARY: {
    name: 'Legendary',
    color: '#f59e0b',
    dropRate: 0.02,
    statMultiplier: 3,
  },
};
