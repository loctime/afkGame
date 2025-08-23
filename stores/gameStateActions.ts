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
});
