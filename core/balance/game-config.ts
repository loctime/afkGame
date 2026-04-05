// Configuración de balance del juego
import { MonsterDefinition } from '../../types/game';

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

export const MONSTER_CATALOG: Record<string, MonsterDefinition> = {
  Icon1: {
    iconIndex: 1,
    name: 'Abeja de Barrio',
    behavior: 'ranged',
    minWave: 1,
  },
  Icon2: {
    iconIndex: 2,
    name: 'Alien de Heladera',
    behavior: 'tank',
    minWave: 1,
  },
  Icon3: {
    iconIndex: 3,
    name: 'Aracnida de Lujo',
    behavior: 'aggressive',
    minWave: 20,
  },
  Icon4: {
    iconIndex: 4,
    name: 'Araña Pyromaniaca',
    behavior: 'aggressive',
    minWave: 20,
  },
  Icon5: {
    iconIndex: 5,
    name: 'Bicho del Bajo Presupuesto',
    behavior: 'melee',
    minWave: 20,
  },
  Icon6: {
    iconIndex: 6,
    name: 'Brocoli del Mal',
    behavior: 'aggressive',
    minWave: 30,
  },
  Icon7: {
    iconIndex: 7,
    name: 'Bugs Bunny Loco',
    behavior: 'aggressive',
    minWave: 30,
  },
  Icon8: {
    iconIndex: 8,
    name: 'Cabezón Psicópata',
    behavior: 'tank',
    minWave: 30,
  },
  Icon9: {
    iconIndex: 9,
    name: 'Calabacita Rabiossa',
    behavior: 'ranged',
    minWave: 30,
  },
  Icon10: {
    iconIndex: 10,
    name: 'Canguro Depresivo',
    behavior: 'aggressive',
    minWave: 30,
  },
  Icon11: {
    iconIndex: 11,
    name: 'Cerberito de Patio',
    behavior: 'melee',
    minWave: 30,
  },
  Icon12: {
    iconIndex: 12,
    name: 'Cucaracha Premium',
    behavior: 'tank',
    minWave: 40,
  },
  Icon13: {
    iconIndex: 13,
    name: 'Culebra con Hambre Existencial',
    behavior: 'ranged',
    minWave: 40,
  },
  Icon14: {
    iconIndex: 14,
    name: 'Demonio Low Cost',
    behavior: 'tank',
    minWave: 40,
  },
  Icon15: {
    iconIndex: 15,
    name: 'Dentón Incomible',
    behavior: 'aggressive',
    minWave: 40,
  },
  Icon16: {
    iconIndex: 16,
    name: 'Diablillo Burnout',
    behavior: 'ranged',
    minWave: 40,
  },
  Icon17: {
    iconIndex: 17,
    name: 'Dracofóbico',
    behavior: 'aggressive',
    minWave: 40,
  },
  Icon18: {
    iconIndex: 18,
    name: 'El Calvito Venennus',
    behavior: 'tank',
    minWave: 40,
  },
  Icon19: {
    iconIndex: 19,
    name: 'Enanito del Bosque Sangriento',
    behavior: 'ranged',
    minWave: 50,
  },
  Icon20: {
    iconIndex: 20,
    name: 'Escorpio Express',
    behavior: 'aggressive',
    minWave: 50,
  },
  Icon21: {
    iconIndex: 21,
    name: 'Fantasma de tu Ex',
    behavior: 'tank',
    minWave: 50,
  },
  Icon22: {
    iconIndex: 22,
    name: 'Florcita Depresiva Power',
    behavior: 'ranged',
    minWave: 50,
  },
  Icon23: {
    iconIndex: 23,
    name: 'Fénix de Descuento',
    behavior: 'ranged',
    minWave: 50,
  },
  Icon24: {
    iconIndex: 24,
    name: 'Gato Pirata del Inframundo',
    behavior: 'melee',
    minWave: 50,
  },
  Icon25: {
    iconIndex: 25,
    name: 'Gelatina con Ansiedad',
    behavior: 'tank',
    minWave: 50,
  },
  Icon26: {
    iconIndex: 26,
    name: 'Gelatinoso Depresivo',
    behavior: 'aggressive',
    minWave: 60,
  },
  Icon27: {
    iconIndex: 27,
    name: 'Ghost Rider de Barrio',
    behavior: 'tank',
    minWave: 60,
  },
  Icon28: {
    iconIndex: 28,
    name: 'Honguito Le Suicide',
    behavior: 'tank',
    minWave: 60,
  },
  Icon29: {
    iconIndex: 29,
    name: 'Honguito Vagabundo',
    behavior: 'melee',
    minWave: 60,
  },
  Icon30: {
    iconIndex: 30,
    name: 'Jack el Resacoso',
    behavior: 'aggressive',
    minWave: 60,
  },
  Icon31: {
    iconIndex: 31,
    name: 'Kraken de Tierra',
    behavior: 'ranged',
    minWave: 60,
  },
  Icon32: {
    iconIndex: 32,
    name: 'Mandarina del Mal',
    behavior: 'ranged',
    minWave: 60,
  },
  Icon33: {
    iconIndex: 33,
    name: 'Margarita del Inframundo',
    behavior: 'ranged',
    minWave: 60,
  },
  Icon34: {
    iconIndex: 34,
    name: 'Mineral Alucinante',
    behavior: 'aggressive',
    minWave: 60,
  },
  Icon35: {
    iconIndex: 35,
    name: 'Murciélago Emo',
    behavior: 'ranged',
    minWave: 60,
  },
  Icon36: {
    iconIndex: 36,
    name: 'Osito Hongocida',
    behavior: 'aggressive',
    minWave: 60,
  },
  Icon37: {
    iconIndex: 37,
    name: 'Peludo del Subsuelo',
    behavior: 'melee',
    minWave: 60,
  },
  Icon38: {
    iconIndex: 38,
    name: 'Petunia Poseída',
    behavior: 'ranged',
    minWave: 60,
  },
  Icon39: {
    iconIndex: 39,
    name: 'Pollo Resucitado',
    behavior: 'tank',
    minWave: 60,
  },
  Icon40: {
    iconIndex: 40,
    name: 'Pumpkin-chan Poseido',
    behavior: 'tank',
    minWave: 60,
  },
  Icon41: {
    iconIndex: 41,
    name: 'Pájaro Traumado',
    behavior: 'melee',
    minWave: 60,
  },
  Icon42: {
    iconIndex: 42,
    name: 'Seta con Trauma',
    behavior: 'ranged',
    minWave: 60,
  },
  Icon43: {
    iconIndex: 43,
    name: 'Slime Tragón',
    behavior: 'melee',
    minWave: 60,
  },
  Icon44: {
    iconIndex: 44,
    name: 'Slime con Sombrero',
    behavior: 'tank',
    minWave: 60,
  },
  Icon45: {
    iconIndex: 45,
    name: 'Tanque con Ansiedad',
    behavior: 'aggressive',
    minWave: 60,
  },
  Icon46: {
    iconIndex: 46,
    name: 'Tentaculín el Sensible',
    behavior: 'ranged',
    minWave: 60,
  },
  Icon47: {
    iconIndex: 47,
    name: 'Viejo Trippy',
    behavior: 'tank',
    minWave: 60,
  },
  Icon48: {
    iconIndex: 48,
    name: 'Yeti de Heladera',
    behavior: 'tank',
    minWave: 60,
  },
};

export const BEHAVIOR_MODIFIERS = {
  MELEE: {
    hp: 1,
    damage: 1,
    speed: 1,
    attackSpeed: 1,
    xp: 1,
    dodgeChance: 0,
    statusEffect: null,
  },
  AGGRESSIVE: {
    hp: 1,
    damage: 1.5,
    speed: 1.5,
    attackSpeed: 1.5,
    xp: 1,
    dodgeChance: 0,
    statusEffect: 'reflect',
  },
  TANK: {
    hp: 2,
    damage: 1,
    speed: 0.5,
    attackSpeed: 0.5,
    xp: 1,
    dodgeChance: 0,
    statusEffect: 'taunt',
  },
  RANGED: {
    hp: 1,
    damage: 1,
    speed: 1,
    attackSpeed: 1,
    xp: 1.3,
    dodgeChance: 0.5,
    statusEffect: 'poison',
  },
};
