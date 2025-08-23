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

export interface Enemy {
  id: string;
  name: string;
  level: number;
  hp: number;
  maxHp: number;
  damage: number;
  xpReward: number;
  goldReward: number;
  sprite?: any; // PIXI.Sprite
  x: number;
  y: number;
}

export interface Item {
  id: string;
  name: string;
  type: 'weapon' | 'armor' | 'rune' | 'consumable';
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
}

export interface RenderState {
  enemies: Enemy[];
}

export interface Equipment {
  weapon?: Item;
  armor?: Item;
  runes: (Item | null)[];
}
