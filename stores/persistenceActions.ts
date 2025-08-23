import { get as getFromDB, set as setToDB, del as delFromDB } from 'idb-keyval';
import { GameStore } from './types';
import { initialSkills, initialEquipment } from './initialState';

export const createPersistenceActions = (set: any, get: () => GameStore) => ({
  saveGame: async () => {
    const state = get();
    await setToDB('gameData', {
      player: state.player,
      gameState: { ...state.gameState, lastPlayTime: Date.now() },
      inventory: state.inventory,
      equipment: state.equipment,
      skills: state.skills,
    });
  },
  
  loadGame: async () => {
    try {
      const savedData = await getFromDB('gameData');
      if (savedData) {
        set({
          player: savedData.player,
          gameState: savedData.gameState,
          inventory: savedData.inventory || [],
          skills: savedData.skills || initialSkills,
          equipment: savedData.equipment || initialEquipment,
          renderState: {
            enemies: [],
          },
        });
        get().calculateOfflineRewards();
      }
    } catch (error) {
      console.error('Error loading game:', error);
    }
  },
  
  calculateOfflineRewards: () => {
    const state = get();
    const now = Date.now();
    const timeDiff = now - (state.gameState.lastPlayTime || now);
    const hoursOffline = Math.min(timeDiff / (1000 * 60 * 60), 2); // Cap at 2 hours
    
    if (hoursOffline > 0.1 && state.gameState.isAfk) {
      const xpGained = Math.floor(hoursOffline * state.player.level * 10);
      const goldGained = Math.floor(hoursOffline * state.player.level * 5);
      
      set((state: GameStore) => ({
        player: {
          ...state.player,
          gold: state.player.gold + goldGained,
        },
        gameState: {
          ...state.gameState,
          lastPlayTime: now,
        }
      }));
      
      get().gainXp(xpGained);
      
      // Show offline rewards modal (you can implement this)
      console.log(`Offline Rewards: ${xpGained} XP, ${goldGained} Gold`);
    }
  },
});
