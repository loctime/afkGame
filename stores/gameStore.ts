import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { get as getFromDB, set as setToDB, del as delFromDB } from 'idb-keyval';
import { Player, Stats, GameState, RenderState, Item, Equipment, Skill } from '../types/game';

export interface GameStore {
  // Player
  player: Player;
  updatePlayerStats: (stats: Partial<Stats>) => void;
  levelUp: () => void;
  gainXp: (amount: number) => void;
  takeDamage: (amount: number) => void;
  heal: (amount: number) => void;
  
  // Game State
  gameState: GameState;
  renderState: RenderState;
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
}

export const useGameStore = create<GameStore>()(
  persist(
    (set, get) => ({
      // Initial Player State
      player: {
        id: 'player1',
        level: 1,
        xp: 0,
        xpToNext: 100,
        hp: 100,
        maxHp: 100,
        mp: 50,
        maxMp: 50,
        gold: 0,
        stats: { str: 10, dex: 10, int: 10, vit: 10 },
        unallocatedPoints: 0,
      },
      
      // Player Actions
      updatePlayerStats: (newStats) => set((state) => ({
        player: {
          ...state.player,
          stats: { ...state.player.stats, ...newStats }
        }
      })),
      
      levelUp: () => set((state) => {
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
      
      gainXp: (amount) => set((state) => {
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
      
      takeDamage: (amount) => set((state) => ({
        player: {
          ...state.player,
          hp: Math.max(0, state.player.hp - amount)
        }
      })),
      
      heal: (amount) => set((state) => ({
        player: {
          ...state.player,
          hp: Math.min(state.player.maxHp, state.player.hp + amount)
        }
      })),
      
      // Game State
      gameState: {
        currentWave: 1,
        currentPhase: 1,
        isInBossWave: false,
        isFighting: false,
        isAfk: false,
        lastPlayTime: Date.now(),
        totalPlayTime: 0,
        currentBackground: 1, // Fondo por defecto
      },
      
      // Render State (no serializable)
      renderState: {
        enemies: [],
      },
      
      setWave: (wave) => set((state) => ({
        gameState: {
          ...state.gameState,
          currentWave: wave,
          isInBossWave: wave % 10 === 0,
        }
      })),
      
      startBossFight: () => set((state) => ({
        gameState: {
          ...state.gameState,
          isFighting: true,
        }
      })),
      
      winBossFight: () => set((state) => {
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
      
      loseBossFight: () => set((state) => {
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
      
      toggleAfk: () => set((state) => ({
        gameState: {
          ...state.gameState,
          isAfk: !state.gameState.isAfk,
          lastPlayTime: Date.now(),
        }
      })),
      
      // Inventory
      inventory: [],
      equipment: {
        // Primera fila
        pet: undefined,
        necklace: undefined,
        helmet: undefined,
        wings: undefined,
        
        // Segunda fila
        weapon: undefined,
        bracelet1: undefined,
        chest: undefined,
        bracelet2: undefined,
        shield: undefined,
        
        // Tercera fila
        gloves: undefined,
        ring1: undefined,
        pants: undefined,
        ring2: undefined,
        boots: undefined,
        
        // Cuarta fila
        artifact1: undefined,
        artifact2: undefined,
      },
      
      // Skills
      skills: [
        {
          id: 'basic_attack',
          name: 'Ataque Básico',
          icon: '/assets/skills/Icon1.png',
          type: 'attack',
          damage: 25,
          manaCost: 0,
          cooldown: 0,
          currentCooldown: 0,
          description: 'Un ataque básico con tu arma',
          level: 1,
          maxLevel: 10
        },
        {
          id: 'fire_ball',
          name: 'Bola de Fuego',
          icon: '/assets/skills/Icon2.png',
          type: 'attack',
          damage: 50,
          manaCost: 20,
          cooldown: 3,
          currentCooldown: 0,
          description: 'Lanza una bola de fuego que quema a los enemigos',
          level: 1,
          maxLevel: 5
        },
        {
          id: 'heal',
          name: 'Curación',
          icon: '/assets/skills/Icon3.png',
          type: 'heal',
          heal: 30,
          manaCost: 25,
          cooldown: 5,
          currentCooldown: 0,
          description: 'Restaura tu salud',
          level: 1,
          maxLevel: 5
        }
      ],
      
      addItem: (item) => set((state) => ({
        inventory: [...state.inventory, item]
      })),
      
      equipItem: (item) => set((state) => {
        const newInventory = state.inventory.filter(i => i.id !== item.id);
        const newEquipment = { ...state.equipment };
        
        // Función helper para equipar un item en un slot específico
        const equipToSlot = (slotKey: keyof Equipment) => {
          if (newEquipment[slotKey]) {
            newInventory.push(newEquipment[slotKey]!);
          }
          newEquipment[slotKey] = item;
        };
        
        // Mapear tipos de items a slots específicos
        switch (item.type) {
          case 'weapon':
            equipToSlot('weapon');
            break;
          case 'chest':
            equipToSlot('chest');
            break;
          case 'helmet':
            equipToSlot('helmet');
            break;
          case 'necklace':
            equipToSlot('necklace');
            break;
          case 'wings':
            equipToSlot('wings');
            break;
          case 'bracelet':
            // Equipar en el primer slot de pulsera disponible
            if (!newEquipment.bracelet1) {
              newEquipment.bracelet1 = item;
            } else if (!newEquipment.bracelet2) {
              newEquipment.bracelet2 = item;
            } else {
              // Si ambos están ocupados, reemplazar el primero
              newInventory.push(newEquipment.bracelet1);
              newEquipment.bracelet1 = item;
            }
            break;
          case 'shield':
            equipToSlot('shield');
            break;
          case 'gloves':
            equipToSlot('gloves');
            break;
          case 'ring':
            // Equipar en el primer slot de anillo disponible
            if (!newEquipment.ring1) {
              newEquipment.ring1 = item;
            } else if (!newEquipment.ring2) {
              newEquipment.ring2 = item;
            } else {
              // Si ambos están ocupados, reemplazar el primero
              newInventory.push(newEquipment.ring1);
              newEquipment.ring1 = item;
            }
            break;
          case 'pants':
            equipToSlot('pants');
            break;
          case 'boots':
            equipToSlot('boots');
            break;
          case 'artifact':
            // Equipar en el primer slot de artefacto disponible
            if (!newEquipment.artifact1) {
              newEquipment.artifact1 = item;
            } else if (!newEquipment.artifact2) {
              newEquipment.artifact2 = item;
            } else {
              // Si ambos están ocupados, reemplazar el primero
              newInventory.push(newEquipment.artifact1);
              newEquipment.artifact1 = item;
            }
            break;
          case 'pet':
            equipToSlot('pet');
            break;
          default:
            // Para tipos legacy, mantener compatibilidad
            if (item.type === 'armor') {
              equipToSlot('chest');
            } else if (item.type === 'rune') {
              // Los runes ahora van a los slots de artefactos
              if (!newEquipment.artifact1) {
                newEquipment.artifact1 = item;
              } else if (!newEquipment.artifact2) {
                newEquipment.artifact2 = item;
              } else {
                newInventory.push(newEquipment.artifact1);
                newEquipment.artifact1 = item;
              }
            }
            break;
        }
        
        return {
          inventory: newInventory,
          equipment: newEquipment,
        };
      }),
      
      unequipItem: (slotKey) => set((state) => {
        const newInventory = [...state.inventory];
        const newEquipment = { ...state.equipment };

        if (newEquipment[slotKey]) {
          newInventory.push(newEquipment[slotKey]);
          newEquipment[slotKey] = undefined;
        }

        return {
          inventory: newInventory,
          equipment: newEquipment,
        };
      }),

      autoEquipAll: () => set((state) => {
        const newInventory = [...state.inventory];
        const newEquipment = { ...state.equipment };
        
        // Ordenar items por rareza (legendary > epic > rare > common)
        const rarityOrder = { legendary: 4, epic: 3, rare: 2, common: 1 };
        const sortedItems = newInventory.sort((a, b) => 
          (rarityOrder[b.rarity as keyof typeof rarityOrder] || 0) - 
          (rarityOrder[a.rarity as keyof typeof rarityOrder] || 0)
        );
        
        // Intentar equipar cada item
        sortedItems.forEach(item => {
          const equipToSlot = (slotKey: keyof Equipment) => {
            if (!newEquipment[slotKey]) {
              newEquipment[slotKey] = item;
              return true; // Equipado exitosamente
            }
            return false; // Slot ocupado
          };
          
          let equipped = false;
          
          switch (item.type) {
            case 'weapon':
              equipped = equipToSlot('weapon');
              break;
            case 'chest':
              equipped = equipToSlot('chest');
              break;
            case 'helmet':
              equipped = equipToSlot('helmet');
              break;
            case 'necklace':
              equipped = equipToSlot('necklace');
              break;
            case 'wings':
              equipped = equipToSlot('wings');
              break;
            case 'bracelet':
              if (!equipped) equipped = equipToSlot('bracelet1');
              if (!equipped) equipped = equipToSlot('bracelet2');
              break;
            case 'shield':
              equipped = equipToSlot('shield');
              break;
            case 'gloves':
              equipped = equipToSlot('gloves');
              break;
            case 'ring':
              if (!equipped) equipped = equipToSlot('ring1');
              if (!equipped) equipped = equipToSlot('ring2');
              break;
            case 'pants':
              equipped = equipToSlot('pants');
              break;
            case 'boots':
              equipped = equipToSlot('boots');
              break;
            case 'artifact':
              if (!equipped) equipped = equipToSlot('artifact1');
              if (!equipped) equipped = equipToSlot('artifact2');
              break;
            case 'pet':
              equipped = equipToSlot('pet');
              break;
          }
          
          // Si se equipó, remover del inventario
          if (equipped) {
            const index = newInventory.findIndex(i => i.id === item.id);
            if (index !== -1) {
              newInventory.splice(index, 1);
            }
          }
        });
        
        return {
          inventory: newInventory,
          equipment: newEquipment,
        };
      }),
      
      // Skills
      addSkill: (skill) => set((state) => ({
        skills: [...state.skills, skill]
      })),
      
      upgradeSkill: (skillId) => set((state) => {
        const skillIndex = state.skills.findIndex(s => s.id === skillId);
        if (skillIndex === -1) return {};
        
        const skill = state.skills[skillIndex];
        if (skill.level >= skill.maxLevel) return {};
        
        const newSkills = [...state.skills];
        newSkills[skillIndex] = {
          ...skill,
          level: skill.level + 1,
          damage: skill.damage ? skill.damage + (skill.damage * 0.2) : skill.damage,
          heal: skill.heal ? skill.heal + (skill.heal * 0.2) : skill.heal,
          manaCost: skill.manaCost + (skill.manaCost * 0.1)
        };
        
        return { skills: newSkills };
      }),
      
      useSkill: (skillId) => {
        const state = get();
        const skill = state.skills.find(s => s.id === skillId);
        if (!skill || skill.currentCooldown > 0) return false;
        
        if (state.player.mp < skill.manaCost) return false;
        
        set((state) => {
          const skillIndex = state.skills.findIndex(s => s.id === skillId);
          if (skillIndex === -1) return {};
          
          const newSkills = [...state.skills];
          newSkills[skillIndex] = {
            ...skill,
            currentCooldown: skill.cooldown
          };
          
          let playerUpdate = {
            mp: state.player.mp - skill.manaCost
          };
          
          // Aplicar efectos del skill
          if (skill.type === 'heal' && skill.heal) {
            playerUpdate = {
              ...playerUpdate,
              hp: Math.min(state.player.maxHp, state.player.hp + skill.heal)
            };
          }
          
          return {
            skills: newSkills,
            player: {
              ...state.player,
              ...playerUpdate
            }
          };
        });
        
        return true;
      },
      
      updateSkillCooldowns: (deltaTime) => set((state) => {
        const newSkills = state.skills.map(skill => ({
          ...skill,
          currentCooldown: Math.max(0, skill.currentCooldown - deltaTime)
        }));
        
        return { skills: newSkills };
      }),
      
      // Persistence
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
              skills: savedData.skills || [
                {
                  id: 'basic_attack',
                  name: 'Ataque Básico',
                  icon: '/assets/skills/Icon1.png',
                  type: 'attack',
                  damage: 25,
                  manaCost: 0,
                  cooldown: 0,
                  currentCooldown: 0,
                  description: 'Un ataque básico con tu arma',
                  level: 1,
                  maxLevel: 10
                },
                {
                  id: 'fire_ball',
                  name: 'Bola de Fuego',
                  icon: '/assets/skills/Icon2.png',
                  type: 'attack',
                  damage: 50,
                  manaCost: 20,
                  cooldown: 3,
                  currentCooldown: 0,
                  description: 'Lanza una bola de fuego que quema a los enemigos',
                  level: 1,
                  maxLevel: 5
                },
                {
                  id: 'heal',
                  name: 'Curación',
                  icon: '/assets/skills/Icon3.png',
                  type: 'heal',
                  heal: 30,
                  manaCost: 25,
                  cooldown: 5,
                  currentCooldown: 0,
                  description: 'Restaura tu salud',
                  level: 1,
                  maxLevel: 5
                }
              ],
              equipment: savedData.equipment || {
                // Primera fila
                pet: undefined,
                necklace: undefined,
                helmet: undefined,
                wings: undefined,
                
                // Segunda fila
                weapon: undefined,
                bracelet1: undefined,
                chest: undefined,
                bracelet2: undefined,
                shield: undefined,
                
                // Tercera fila
                gloves: undefined,
                ring1: undefined,
                pants: undefined,
                ring2: undefined,
                boots: undefined,
                
                // Cuarta fila
                artifact1: undefined,
                artifact2: undefined,
              },
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
          
          set((state) => ({
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
    }),
    {
      name: 'afk-rpg-storage',
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
