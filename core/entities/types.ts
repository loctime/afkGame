// Tipos base para las entidades del juego

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
  totalPlayTime: number;
  lastPlayTime: number;
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
  type: 'goblin' | 'orc' | 'troll' | 'boss';
  sprite?: any; // PIXI.Sprite
  x: number;
  y: number;
  isDead: boolean;
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
  description?: string;
  icon?: string;
}

export interface Equipment {
  weapon?: Item;
  armor?: Item;
  runes: (Item | null)[];
}

export interface Pet {
  id: string;
  name: string;
  level: number;
  type: 'damage' | 'support' | 'tank';
  stats: Partial<Stats>;
  abilities: PetAbility[];
  isActive: boolean;
  xp: number;
  xpToNext: number;
}

export interface PetAbility {
  id: string;
  name: string;
  description: string;
  cooldown: number;
  effect: (target: Player | Enemy) => void;
}

export interface Skill {
  id: string;
  name: string;
  description: string;
  manaCost: number;
  cooldown: number;
  lastUsed: number;
  effect: (target: Player | Enemy) => void;
}

export interface GameState {
  currentWave: number;
  currentPhase: number;
  isInBossWave: boolean;
  isFighting: boolean;
  isAfk: boolean;
  enemies: Enemy[];
  lastPlayTime: number;
  totalPlayTime: number;
  gameVersion: string;
}

export interface GameStore {
  // Player
  player: Player;
  updatePlayerStats: (stats: Partial<Stats>) => void;
  levelUp: () => void;
  gainXp: (amount: number) => void;
  takeDamage: (amount: number) => void;
  heal: (amount: number) => void;
  gainGold: (amount: number) => void;
  
  // Game State
  gameState: GameState;
  setWave: (wave: number) => void;
  startBossFight: () => void;
  winBossFight: () => void;
  loseBossFight: () => void;
  toggleAfk: () => void;
  
  // Inventory
  inventory: Item[];
  equipment: Equipment;
  addItem: (item: Item) => void;
  equipItem: (item: Item) => void;
  unequipItem: (slot: keyof Equipment) => void;
  
  // Pets
  pets: Pet[];
  activePet: Pet | null;
  addPet: (pet: Pet) => void;
  activatePet: (petId: string) => void;
  levelUpPet: (petId: string) => void;
  
  // Skills
  skills: Skill[];
  useSkill: (skillId: string, target?: Player | Enemy) => void;
  
  // Persistence
  saveGame: () => Promise<void>;
  loadGame: () => Promise<void>;
  calculateOfflineRewards: () => void;
  resetProgress: () => void;
  
  // Combat
  startCombat: () => void;
  stopCombat: () => void;
  processCombatTick: (deltaTime: number) => void;
}
