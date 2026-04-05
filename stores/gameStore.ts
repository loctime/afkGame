import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { get as getFromDB, set as setToDB, del as delFromDB } from 'idb-keyval';
import { GameStore } from './types';
import { 
  initialPlayer, 
  initialGameState, 
  initialRenderState, 
  initialEquipment, 
  initialSkills 
} from './initialState';
import { createPlayerActions } from './playerActions';
import { createGameStateActions } from './gameStateActions';
import { createInventoryActions } from './inventoryActions';
import { createSkillsActions } from './skillsActions';
import { createPersistenceActions } from './persistenceActions';

// Re-export the GameStore type for backward compatibility
export type { GameStore } from './types';

// Storage manager to handle IndexedDB fallback
const storageManager = {
  useLocalStorage: false,
  checked: false,
  
  async getItem(key: string) {
    if (!this.checked) {
      try {
        await getFromDB('test-key');
        this.checked = true;
      } catch (error) {
        console.warn('IndexedDB not available, using localStorage:', error);
        this.useLocalStorage = true;
        this.checked = true;
      }
    }
    
    try {
      if (!this.useLocalStorage) {
        const value = await getFromDB(key);
        return value || null;
      }
    } catch (error) {
      console.warn('IndexedDB getItem failed, switching to localStorage:', error);
      this.useLocalStorage = true;
    }
    
    // Fallback to localStorage
    try {
      const value = localStorage.getItem(`afk-rpg-storage-${key}`);
      return value ? JSON.parse(value) : null;
    } catch (e) {
      console.error('localStorage also failed:', e);
      return null;
    }
  },
  
  async setItem(key: string, value: any) {
    try {
      if (!this.useLocalStorage) {
        await setToDB(key, value);
        return;
      }
    } catch (error) {
      console.warn('IndexedDB setItem failed, switching to localStorage:', error);
      this.useLocalStorage = true;
    }
    
    // Fallback to localStorage
    try {
      localStorage.setItem(`afk-rpg-storage-${key}`, JSON.stringify(value));
    } catch (e) {
      console.error('localStorage setItem also failed:', e);
      // Silently fail to prevent game crash
    }
  },
  
  async removeItem(key: string) {
    try {
      if (!this.useLocalStorage) {
        await delFromDB(key);
        return;
      }
    } catch (error) {
      console.warn('IndexedDB removeItem failed, switching to localStorage:', error);
      this.useLocalStorage = true;
    }
    
    // Fallback to localStorage
    try {
      localStorage.removeItem(`afk-rpg-storage-${key}`);
    } catch (e) {
      console.error('localStorage removeItem also failed:', e);
    }
  }
};

export const useGameStore = create<GameStore>()(
  persist(
    (set, get) => ({
      // Initial State
      player: initialPlayer,
      gameState: initialGameState,
      renderState: initialRenderState,
      inventory: [],
      equipment: initialEquipment,
      skills: initialSkills,
      offlineRewards: null,
      showLevelUp: false,
      
      // Actions
      ...createPlayerActions(set, get),
      ...createGameStateActions(set, get),
      ...createInventoryActions(set),
      ...createSkillsActions(set, get),
      ...createPersistenceActions(set, get),
    }),
    {
      name: 'afk-rpg-storage',
      version: 1,
      migrate: (persistedState: any, version: number) => {
        const gs = persistedState?.gameState || {};
        persistedState.gameState = {
          currentWave: gs.currentWave ?? 1,
          currentPhase: gs.currentPhase ?? 1,
          isInBossWave: gs.isInBossWave ?? false,
          isFighting: false,
          isAfk: gs.isAfk ?? true,
          lastPlayTime: gs.lastPlayTime ?? Date.now(),
          totalPlayTime: gs.totalPlayTime ?? 0,
          currentBackground: gs.currentBackground ?? 1,
          activeStatusEffects: gs.activeStatusEffects ?? [],
        };
        return persistedState;
      },
      // Exclude renderState from persistence: enemies contain runtime-only data
      // (HP mid-combat, spawn positions) that should reset each session.
      // This also prevents any accidental PIXI object reference from reaching JSON.stringify.
      partialize: (state) => ({
        player: state.player,
        gameState: state.gameState,
        inventory: state.inventory,
        equipment: state.equipment,
        skills: state.skills,
      }),
      storage: createJSONStorage(() => ({
        getItem: async (key) => storageManager.getItem(key),
        setItem: async (key, value) => storageManager.setItem(key, value),
        removeItem: async (key) => storageManager.removeItem(key),
      })),
    }
  )
);
