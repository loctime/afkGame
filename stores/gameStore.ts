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
      ...createGameStateActions(set),
      ...createInventoryActions(set),
      ...createSkillsActions(set, get),
      ...createPersistenceActions(set, get),
    }),
    {
      name: 'afk-rpg-storage',
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
        getItem: async (key) => {
          const value = await getFromDB(key);
          return value || null;
        },
        setItem: async (key, value) => {
          await setToDB(key, value);
        },
        removeItem: async (key) => {
          await delFromDB(key);
        },
      })),
    }
  )
);
