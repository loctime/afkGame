export interface Stats {
  str: number;
  dex: number;
  int: number;
  vit: number;
}

export interface Player {
  id: string;
  level: number;
  xp: number;
  xpToNext: number;
  hp: number;
  maxHp: number;
  mp: number;
  maxMp: number;
  gold: number;
  stats: Stats;
  unallocatedPoints: number;
}

/** Serializable enemy data — safe to store in Zustand / IndexedDB. No PIXI references. */
export interface EnemyData {
  id: string;
  name: string;
  level: number;
  hp: number;
  maxHp: number;
  damage: number;
  xpReward: number;
  goldReward: number;
  behavior: 'melee' | 'ranged' | 'tank' | 'aggressive';
  preferredDistance: number;
  speed: number;
  dodgeChance: number;
  statusEffect: 'poison' | 'reflect' | 'taunt' | null;
  x: number;
  y: number;
}

/** @deprecated Use EnemyData for store state. Enemy kept for internal EnemyManager use only. */
export type Enemy = EnemyData;

export interface Item {
  id: string;
  name: string;
  type: 'weapon' | 'armor' | 'rune' | 'consumable' | 'helmet' | 'necklace' | 'wings' | 'bracelet' | 'chest' | 'shield' | 'gloves' | 'ring' | 'pants' | 'boots' | 'artifact' | 'pet';
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  stats?: Partial<Stats>;
  damage?: number;
  defense?: number;
  value: number;
}

export interface GameState {
  currentWave: number;
  currentPhase: number; // 1-10, 11-20, etc.
  isInBossWave: boolean;
  isFighting: boolean;
  isAfk: boolean;
  lastPlayTime: number;
  totalPlayTime: number;
  currentBackground: number; // 1-4 para los diferentes fondos
  activeStatusEffects: Array<'poison' | 'taunt'>;
}

export interface RenderState {
  enemies: EnemyData[];
}

export interface Skill {
  id: string;
  name: string;
  icon: string;
  type: 'attack' | 'buff' | 'heal' | 'debuff';
  damage?: number;
  heal?: number;
  manaCost: number;
  cooldown: number;
  currentCooldown: number;
  description: string;
  level: number;
  maxLevel: number;
}

export interface Equipment {
  // Primera fila
  pet?: Item;           // demonio/hada
  necklace?: Item;      // collar (joyeria)
  helmet?: Item;        // casco
  wings?: Item;         // alas / capa
  
  // Segunda fila
  weapon?: Item;        // arma
  bracelet1?: Item;     // pulsera
  chest?: Item;         // armadura pecho
  bracelet2?: Item;     // pulsera
  shield?: Item;        // escudo / arma
  
  // Tercera fila
  gloves?: Item;        // guantes
  ring1?: Item;         // anillo
  pants?: Item;         // pantalones
  ring2?: Item;         // anillo
  boots?: Item;         // botas
  
  // Cuarta fila
  artifact1?: Item;     // artefacto runico
  artifact2?: Item;     // artefacto runico
}

export interface MonsterDefinition {
  iconIndex: number;
  name: string;
  behavior: 'melee' | 'aggressive' | 'ranged' | 'tank';
  minWave: number;
  size: 'small' | 'medium' | 'large' | 'huge';
}
