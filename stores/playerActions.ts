import { Stats } from '../types/game';
import { GameStore } from './types';

export const createPlayerActions = (set: any, get: () => GameStore) => ({
  updatePlayerStats: (newStats: Partial<Stats>) => set((state: GameStore) => ({
    player: {
      ...state.player,
      stats: { ...state.player.stats, ...newStats }
    }
  })),
  
  levelUp: () => set((state: GameStore) => {
    const newLevel = state.player.level + 1;
    const newMaxHp = 100 + (newLevel * 10);
    const newMaxMp = 50 + (newLevel * 5);
    return {
      player: {
        ...state.player,
        level: newLevel,
        xp: 0,
        xpToNext: newLevel * 100,
        maxHp: newMaxHp,
        hp: newMaxHp,
        maxMp: newMaxMp,
        mp: newMaxMp,
        unallocatedPoints: state.player.unallocatedPoints + 5,
      }
    };
  }),
  
  gainXp: (amount: number) => set((state: GameStore) => {
    const newXp = state.player.xp + amount;
    const shouldLevelUp = newXp >= state.player.xpToNext;
    
    if (shouldLevelUp) {
      get().levelUp();
      return {};
    } else {
      return {
        player: { ...state.player, xp: newXp }
      };
    }
  }),
  
  takeDamage: (amount: number) => set((state: GameStore) => ({
    player: {
      ...state.player,
      hp: Math.max(0, state.player.hp - amount)
    }
  })),
  
  heal: (amount: number) => set((state: GameStore) => ({
    player: {
      ...state.player,
      hp: Math.min(state.player.maxHp, state.player.hp + amount)
    }
  })),
});
