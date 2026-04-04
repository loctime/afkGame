import { Player, Stats, GameState, RenderState, Item, Equipment, Skill, EnemyData } from '../types/game';

export interface GameStore {
  // Player
  player: Player;
  updatePlayerStats: (stats: Partial<Stats>) => void;
  levelUp: () => void;
  gainXp: (amount: number) => void;
  gainGold: (amount: number) => void;
  takeDamage: (amount: number) => void;
  heal: (amount: number) => void;
  regenerateMana: (deltaTime: number) => void;

  // Game State
  gameState: GameState;
  renderState: RenderState;
  setWave: (wave: number) => void;
  startBossFight: () => void;
  winBossFight: () => void;
  loseBossFight: () => void;
  toggleAfk: () => void;
  setAfkActive: (value: boolean) => void;
  setIsFighting: (value: boolean) => void;
  setEnemies: (enemies: EnemyData[]) => void;
  removeEnemy: (enemyId: string) => void;
  
  // Inventory
  inventory: Item[];
  equipment: Equipment;
  addItem: (item: Item) => void;
  equipItem: (item: Item) => void;
  unequipItem: (slotKey: keyof Equipment) => void;
  autoEquipAll: () => void;
  
  // Skills
  skills: Skill[];
  addSkill: (skill: Skill) => void;
  upgradeSkill: (skillId: string) => void;
  useSkill: (skillId: string) => boolean;
  updateSkillCooldowns: (deltaTime: number) => void;
  
  // Persistence
  saveGame: () => Promise<void>;
  loadGame: () => Promise<void>;
  calculateOfflineRewards: () => void;

  // Offline rewards
  offlineRewards: { xp: number; gold: number } | null;
  setOfflineRewards: (rewards: { xp: number; gold: number } | null) => void;

  // Level up notification
  showLevelUp: boolean;
  setShowLevelUp: (value: boolean) => void;
}
