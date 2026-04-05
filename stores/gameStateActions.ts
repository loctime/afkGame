import { EnemyData } from '../types/game';
import { GameStore } from './types';

export const createGameStateActions = (set: any) => ({
  setWave: (wave: number) => set((state: GameStore) => ({
    gameState: {
      ...state.gameState,
      currentWave: wave,
      isInBossWave: wave % 10 === 0,
    }
  })),
  
  startBossFight: () => set((state: GameStore) => ({
    gameState: {
      ...state.gameState,
      isFighting: true,
    }
  })),
  
  winBossFight: () => set((state: GameStore) => {
    const newPhase = Math.floor(state.gameState.currentWave / 10) + 1;
    const newWave = (newPhase - 1) * 10 + 1;
    return {
      gameState: {
        ...state.gameState,
        currentWave: newWave,
        currentPhase: newPhase,
        isInBossWave: false,
        isFighting: false,
      }
    };
  }),
  
  loseBossFight: () => set((state: GameStore) => {
    const currentPhase = Math.floor((state.gameState.currentWave - 1) / 10);
    const newWave = currentPhase * 10 + 1;
    return {
      gameState: {
        ...state.gameState,
        currentWave: newWave,
        isInBossWave: false,
        isFighting: false,
      }
    };
  }),
  
  toggleAfk: () => set((state: GameStore) => ({
    gameState: {
      ...state.gameState,
      isAfk: !state.gameState.isAfk,
      lastPlayTime: Date.now(),
    }
  })),

  setAfkActive: (value: boolean) => set((state: GameStore) => ({
    gameState: {
      ...state.gameState,
      isAfk: value,
    }
  })),

  setIsFighting: (value: boolean) => set((state: GameStore) => ({
    gameState: {
      ...state.gameState,
      isFighting: value,
    }
  })),

  setEnemies: (enemies: EnemyData[]) => set(() => ({
    renderState: { enemies },
  })),

  removeEnemy: (enemyId: string) => set((state: GameStore) => ({
    renderState: {
      ...state.renderState,
      enemies: state.renderState.enemies.filter((e) => e.id !== enemyId),
    },
  })),

  setOfflineRewards: (rewards: { xp: number; gold: number } | null) => set({ offlineRewards: rewards }),

  setShowLevelUp: (value: boolean) => set({ showLevelUp: value }),

  addStatusEffect: (effect: 'poison' | 'taunt') => set((state: GameStore) => ({
    gameState: {
      ...state.gameState,
      activeStatusEffects: state.gameState.activeStatusEffects.includes(effect) 
        ? state.gameState.activeStatusEffects 
        : [...state.gameState.activeStatusEffects, effect],
    }
  })),

  removeStatusEffect: (effect: 'poison' | 'taunt') => set((state: GameStore) => ({
    gameState: {
      ...state.gameState,
      activeStatusEffects: state.gameState.activeStatusEffects.filter(e => e !== effect),
    }
  })),

  updateEnemyHp: (enemyId: string, newHp: number) => set((state: GameStore) => ({
    renderState: {
      ...state.renderState,
      enemies: state.renderState.enemies.map(e =>
        e.id === enemyId ? { ...e, hp: newHp } : e
      ),
    },
  })),
});
