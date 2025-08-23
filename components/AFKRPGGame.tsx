'use client';

import React, { useEffect, useState } from 'react';
import { Play, Home, Package, User, Heart, Settings, Sword, Shield, Zap } from 'lucide-react';
import * as PIXI from 'pixi.js';
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { get as getFromDB, set as setToDB, del as delFromDB } from 'idb-keyval';

// =============================================================================
// TYPES & INTERFACES
// =============================================================================
interface Stats {
  str: number;
  dex: number;
  int: number;
  vit: number;
}

interface Player {
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

interface Enemy {
  id: string;
  name: string;
  level: number;
  hp: number;
  maxHp: number;
  damage: number;
  xpReward: number;
  goldReward: number;
  sprite?: PIXI.Sprite;
  x: number;
  y: number;
}

interface Item {
  id: string;
  name: string;
  type: 'weapon' | 'armor' | 'rune' | 'consumable';
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  stats?: Partial<Stats>;
  damage?: number;
  defense?: number;
  value: number;
}

interface GameState {
  currentWave: number;
  currentPhase: number; // 1-10, 11-20, etc.
  isInBossWave: boolean;
  isFighting: boolean;
  isAfk: boolean;
  lastPlayTime: number;
  totalPlayTime: number;
}

interface RenderState {
  enemies: Enemy[];
}

// =============================================================================
// ZUSTAND STORE
// =============================================================================
interface GameStore {
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
  equipment: {
    weapon?: Item;
    armor?: Item;
    runes: (Item | null)[];
  };
  addItem: (item: Item) => void;
  equipItem: (item: Item) => void;
  
  // Persistence
  saveGame: () => Promise<void>;
  loadGame: () => Promise<void>;
  calculateOfflineRewards: () => void;
}

const useGameStore = create<GameStore>()(
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
        weapon: undefined,
        armor: undefined,
        runes: [null, null, null],
      },
      
      addItem: (item) => set((state) => ({
        inventory: [...state.inventory, item]
      })),
      
      equipItem: (item) => set((state) => {
        const newInventory = state.inventory.filter(i => i.id !== item.id);
        const newEquipment = { ...state.equipment };
        
        if (item.type === 'weapon') {
          if (newEquipment.weapon) {
            newInventory.push(newEquipment.weapon);
          }
          newEquipment.weapon = item;
        } else if (item.type === 'armor') {
          if (newEquipment.armor) {
            newInventory.push(newEquipment.armor);
          }
          newEquipment.armor = item;
        } else if (item.type === 'rune') {
          const emptySlot = newEquipment.runes.findIndex(r => r === null);
          if (emptySlot !== -1) {
            newEquipment.runes[emptySlot] = item;
          }
        }
        
        return {
          inventory: newInventory,
          equipment: newEquipment,
        };
      }),
      
      // Persistence
      saveGame: async () => {
        const state = get();
        await setToDB('gameData', {
          player: state.player,
          gameState: { ...state.gameState, lastPlayTime: Date.now() },
          inventory: state.inventory,
          equipment: state.equipment,
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
              equipment: savedData.equipment || { weapon: undefined, armor: undefined, runes: [null, null, null] },
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

// =============================================================================
// GAME ENGINE - PIXI.JS INTEGRATION
// =============================================================================
class GameEngine {
  private app: PIXI.Application;
  private gameContainer: PIXI.Container;
  private enemies: Map<string, PIXI.Sprite> = new Map();
  private player: PIXI.Sprite | null = null;
  private gameLoop: number = 0;
  private store: GameStore;

  constructor(canvas: HTMLCanvasElement, store: GameStore) {
    this.store = store;
    
    // Initialize PIXI Application
    this.app = new PIXI.Application({
      view: canvas,
      width: window.innerWidth,
      height: window.innerHeight - 120, // Leave space for HUD
      backgroundColor: 0x1a1a2e,
      resolution: window.devicePixelRatio || 1,
      autoDensity: true,
    });
    
    this.gameContainer = new PIXI.Container();
    this.app.stage.addChild(this.gameContainer);
    
    this.setupPlayer();
    this.startGameLoop();
    this.handleResize();
  }
  
  private setupPlayer() {
    // Create player sprite (simple colored rectangle for now)
    const graphics = new PIXI.Graphics();
    graphics.beginFill(0x00ff00);
    graphics.drawRect(0, 0, 32, 32);
    graphics.endFill();
    
    const texture = this.app.renderer.generateTexture(graphics);
    this.player = new PIXI.Sprite(texture);
    this.player.x = this.app.screen.width / 2;
    this.player.y = this.app.screen.height / 2;
    this.player.anchor.set(0.5);
    
    this.gameContainer.addChild(this.player);
  }
  
  private createEnemy(enemy: Enemy): PIXI.Sprite {
    // Create enemy sprite (red rectangle)
    const graphics = new PIXI.Graphics();
    graphics.beginFill(0xff0000);
    graphics.drawRect(0, 0, 28, 28);
    graphics.endFill();
    
    const texture = this.app.renderer.generateTexture(graphics);
    const sprite = new PIXI.Sprite(texture);
    sprite.x = enemy.x;
    sprite.y = enemy.y;
    sprite.anchor.set(0.5);
    
    this.gameContainer.addChild(sprite);
    return sprite;
  }
  
  private spawnEnemiesForWave(wave: number) {
    const enemyCount = Math.min(wave, 9);
    const newEnemies: Enemy[] = [];
    
    for (let i = 0; i < enemyCount; i++) {
      const angle = (i / enemyCount) * Math.PI * 2;
      const distance = 150 + Math.random() * 100;
      const x = this.app.screen.width / 2 + Math.cos(angle) * distance;
      const y = this.app.screen.height / 2 + Math.sin(angle) * distance;
      
      const enemy: Enemy = {
        id: `enemy_${wave}_${i}`,
        name: `Goblin Lv.${wave}`,
        level: wave,
        hp: 50 + (wave * 10),
        maxHp: 50 + (wave * 10),
        damage: 10 + (wave * 2),
        xpReward: 15 * wave,
        goldReward: 5 * wave,
        x,
        y,
      };
      
      enemy.sprite = this.createEnemy(enemy);
      this.enemies.set(enemy.id, enemy.sprite);
      newEnemies.push(enemy);
    }
    
    return newEnemies;
  }
  
  private startGameLoop() {
    let lastTime = performance.now();
    const targetFPS = 60;
    const frameTime = 1000 / targetFPS;
    
    const gameLoop = (currentTime: number) => {
      const deltaTime = currentTime - lastTime;
      
      if (deltaTime >= frameTime) {
        this.update(deltaTime / 1000); // Convert to seconds
        lastTime = currentTime - (deltaTime % frameTime);
      }
      
      this.gameLoop = requestAnimationFrame(gameLoop);
    };
    
    this.gameLoop = requestAnimationFrame(gameLoop);
  }
  
  private update(deltaTime: number) {
    const gameState = this.store.gameState;
    
    if (gameState.isAfk && gameState.isFighting) {
      this.updateCombat(deltaTime);
    }
    
    // Update enemy positions (simple AI - move towards player)
    this.store.renderState.enemies.forEach((enemy) => {
      if (enemy.sprite && this.player) {
        const dx = this.player.x - enemy.sprite.x;
        const dy = this.player.y - enemy.sprite.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance > 50) {
          const speed = 30; // pixels per second
          enemy.sprite.x += (dx / distance) * speed * deltaTime;
          enemy.sprite.y += (dy / distance) * speed * deltaTime;
        }
      }
    });
  }
  
  private updateCombat(deltaTime: number) {
    const gameState = this.store.gameState;
    const player = this.store.player;
    
    // Simple combat simulation
    if (this.store.renderState.enemies.length > 0 && Math.random() < deltaTime) {
      const enemy = this.store.renderState.enemies[0];
      
      // Player attacks enemy
      const playerDamage = 20 + (player.stats.str * 2);
      enemy.hp -= playerDamage;
      
      if (enemy.hp <= 0) {
        // Enemy defeated
        this.store.gainXp(enemy.xpReward);
        this.store.player.gold += enemy.goldReward;
        
        // Remove enemy
        if (enemy.sprite) {
          this.gameContainer.removeChild(enemy.sprite);
          this.enemies.delete(enemy.id);
        }
        
        this.store.renderState.enemies.shift();
        
        // Check if wave completed
        if (this.store.renderState.enemies.length === 0) {
          this.completeWave();
        }
      } else {
        // Enemy attacks player
        this.store.takeDamage(enemy.damage);
        
        if (player.hp <= 0) {
          this.gameOver();
        }
      }
    }
  }
  
  private completeWave() {
    const currentWave = this.store.gameState.currentWave;
    
    if (currentWave % 10 === 9) {
      // Completed wave 9, 19, 29, etc. - show boss button
      this.store.setWave(currentWave + 1);
    } else if (currentWave % 10 === 0) {
      // This was a boss fight - handled by UI
      return;
    } else {
      // Regular wave - auto advance
      const newWave = currentWave + 1;
      this.store.setWave(newWave);
          const enemies = this.spawnEnemiesForWave(newWave);
    this.store.renderState.enemies = enemies;
    }
  }
  
  private gameOver() {
    this.store.gameState.isAfk = false;
    this.store.gameState.isFighting = false;
    // Reset to safe state, heal player
    this.store.heal(this.store.player.maxHp);
  }
  
  public startWave(wave: number) {
    // Clear existing enemies
    this.enemies.forEach((sprite) => {
      this.gameContainer.removeChild(sprite);
    });
    this.enemies.clear();
    
    // Spawn new enemies
    const enemies = this.spawnEnemiesForWave(wave);
    this.store.renderState.enemies = enemies;
    this.store.gameState.isFighting = true;
  }
  
  private handleResize() {
    window.addEventListener('resize', () => {
      this.app.renderer.resize(window.innerWidth, window.innerHeight - 120);
      if (this.player) {
        this.player.x = this.app.screen.width / 2;
        this.player.y = this.app.screen.height / 2;
      }
    });
  }
  
  public destroy() {
    if (this.gameLoop) {
      cancelAnimationFrame(this.gameLoop);
    }
    this.app.destroy(true);
  }
}

// =============================================================================
// REACT COMPONENTS
// =============================================================================

// HUD Component
const GameHUD: React.FC = () => {
  const { player, gameState, toggleAfk, startBossFight } = useGameStore();
  const [showAreaInfo, setShowAreaInfo] = useState(false);
  
  const hpPercentage = (player.hp / player.maxHp) * 100;
  const mpPercentage = (player.mp / player.maxMp) * 100;
  const xpPercentage = (player.xp / player.xpToNext) * 100;
  
  return (
    <div className="fixed top-0 left-0 right-0 bg-gray-900/95 backdrop-blur-sm p-2 z-50">
      <div className="flex items-center justify-between max-w-screen-xl mx-auto">
        {/* Player Stats */}
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Heart className="w-4 h-4 text-red-500" />
            <div className="w-16 bg-gray-700 rounded-full h-2">
              <div 
                className="bg-red-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${hpPercentage}%` }}
              />
            </div>
            <span className="text-xs text-white">{player.hp}/{player.maxHp}</span>
          </div>
          
          <div className="flex items-center space-x-2">
            <Zap className="w-4 h-4 text-blue-500" />
            <div className="w-16 bg-gray-700 rounded-full h-2">
              <div 
                className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${mpPercentage}%` }}
              />
            </div>
            <span className="text-xs text-white">{player.mp}/{player.maxMp}</span>
          </div>
          
          <div className="flex items-center space-x-2">
            <span className="text-xs text-yellow-500">XP</span>
            <div className="w-16 bg-gray-700 rounded-full h-2">
              <div 
                className="bg-yellow-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${xpPercentage}%` }}
              />
            </div>
            <span className="text-xs text-white">{player.xp}/{player.xpToNext}</span>
          </div>
        </div>
        
        {/* Center Info */}
        <div className="flex items-center space-x-4">
          <div className="text-center">
            <div className="text-white font-bold text-sm">Lv.{player.level}</div>
            <div className="text-xs text-gray-300">{player.gold} Gold</div>
          </div>
          
          <div className="text-center">
            <div className="text-white font-bold text-sm">
              {gameState.isInBossWave ? 'BOSS' : `Wave ${gameState.currentWave}`}
            </div>
            <button
              onClick={() => setShowAreaInfo(!showAreaInfo)}
              className="text-xs text-gray-400 hover:text-white transition-colors"
            >
              Area Info
            </button>
          </div>
        </div>
        
        {/* Action Buttons */}
        <div className="flex space-x-2">
          {gameState.isInBossWave && !gameState.isFighting && (
            <button
              onClick={startBossFight}
              className="px-3 py-1 bg-red-600 text-white rounded text-sm font-bold"
            >
              BOSS
            </button>
          )}
          
          <button
            onClick={toggleAfk}
            className={`px-3 py-1 rounded text-sm font-bold ${
              gameState.isAfk 
                ? 'bg-green-600 text-white' 
                : 'bg-gray-600 text-gray-300'
            }`}
          >
            {gameState.isAfk ? 'AFK ON' : 'AFK OFF'}
          </button>
        </div>
      </div>
      
      {/* Area Info Dropdown */}
      {showAreaInfo && (
        <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 w-64 bg-gray-800 rounded-lg shadow-lg border border-gray-600 z-50">
          <div className="p-3">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-white font-semibold text-sm">Darkwood Forest</h4>
              <span className="text-xs text-gray-400">Lv. 1-50</span>
            </div>
            
            <div className="text-xs text-gray-300 mb-2">
              A mysterious forest filled with goblins and other creatures.
            </div>
            
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-gray-400">Wave:</span>
                <span className="text-white ml-1 font-bold">{gameState.currentWave}</span>
              </div>
              <div>
                <span className="text-gray-400">Phase:</span>
                <span className="text-white ml-1 font-bold">{Math.floor((gameState.currentWave - 1) / 10) + 1}</span>
              </div>
              <div>
                <span className="text-gray-400">Status:</span>
                <span className={`ml-1 font-bold ${gameState.isAfk ? 'text-green-400' : 'text-red-400'}`}>
                  {gameState.isAfk ? 'Farming' : 'Idle'}
                </span>
              </div>
              <div>
                <span className="text-gray-400">Enemies:</span>
                <span className="text-white ml-1 font-bold">{useGameStore.getState().renderState.enemies.length}</span>
              </div>
            </div>
            
            {gameState.isInBossWave && (
              <div className="mt-2 p-1 bg-red-900/20 border border-red-500 rounded text-xs">
                <div className="text-red-400 font-bold">⚠️ Boss Wave Available!</div>
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* Click outside to close dropdown */}
      {showAreaInfo && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setShowAreaInfo(false)}
        />
      )}
    </div>
  );
};

// Bottom Navigation
const BottomNav: React.FC<{ activeTab: string; setActiveTab: (tab: string) => void }> = ({ activeTab, setActiveTab }) => {
  const tabs = [
    { id: 'map', label: 'Map', icon: Home },
    { id: 'inventory', label: 'Inventory', icon: Package },
    { id: 'character', label: 'Character', icon: User },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];
  
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-gray-900/95 backdrop-blur-sm">
      <div className="flex justify-around items-center py-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex flex-col items-center space-y-1 p-2 rounded-lg ${
                activeTab === tab.id 
                  ? 'text-blue-400' 
                  : 'text-gray-500'
              }`}
            >
              <Icon className="w-6 h-6" />
              <span className="text-xs">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

// Character Panel
const CharacterPanel: React.FC = () => {
  const { player, updatePlayerStats } = useGameStore();
  
  const allocatePoint = (stat: keyof Stats) => {
    if (player.unallocatedPoints > 0) {
      updatePlayerStats({ [stat]: player.stats[stat] + 1 });
      useGameStore.setState((state) => ({
        player: {
          ...state.player,
          unallocatedPoints: state.player.unallocatedPoints - 1,
        }
      }));
    }
  };
  
  return (
    <div className="p-4 space-y-4">
      <div className="bg-gray-800 rounded-lg p-4">
        <h3 className="text-white font-bold mb-4">Character Stats</h3>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-white">{player.level}</div>
            <div className="text-sm text-gray-400">Level</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-500">{player.unallocatedPoints}</div>
            <div className="text-sm text-gray-400">Points</div>
          </div>
        </div>
        
        <div className="mt-6 space-y-3">
          {Object.entries(player.stats).map(([stat, value]) => (
            <div key={stat} className="flex items-center justify-between">
              <span className="text-white capitalize">{stat}</span>
              <div className="flex items-center space-x-2">
                <span className="text-white font-bold w-8">{value}</span>
                <button
                  onClick={() => allocatePoint(stat as keyof Stats)}
                  disabled={player.unallocatedPoints === 0}
                  className="w-8 h-8 bg-blue-600 text-white rounded-full disabled:bg-gray-600 disabled:cursor-not-allowed"
                >
                  +
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Main Game Component
const AFKRPGGame: React.FC = () => {
  const [activeTab, setActiveTab] = useState('map');
  const [gameEngine, setGameEngine] = useState<GameEngine | null>(null);
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const gameStore = useGameStore();
  const { gameState } = useGameStore();
  
  useEffect(() => {
    // Load saved game on mount
    gameStore.loadGame();
  }, []);
  
  useEffect(() => {
    if (canvasRef.current && !gameEngine) {
      const engine = new GameEngine(canvasRef.current, gameStore);
      setGameEngine(engine);
    }
    
    return () => {
      if (gameEngine) {
        gameEngine.destroy();
      }
    };
  }, []);
  
  // Auto-save every 30 seconds
  useEffect(() => {
    const saveInterval = setInterval(() => {
      gameStore.saveGame();
    }, 30000);
    
    return () => clearInterval(saveInterval);
  }, []);
  
  const startNewWave = () => {
    if (gameEngine) {
      gameEngine.startWave(gameStore.gameState.currentWave);
    }
  };
  
  return (
    <div className="w-full h-screen bg-gray-900 relative overflow-hidden">
      {/* Game HUD */}
      <GameHUD />
      
      {/* PIXI.js Canvas */}
      <canvas
        ref={canvasRef}
        className="absolute top-12 left-0 w-full"
        style={{ height: 'calc(100vh - 120px)' }}
      />
      
      {/* Game Controls Overlay */}
      <div className="absolute top-16 right-4 z-40">
        <button
          onClick={startNewWave}
          className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-bold mb-2"
        >
          Start Wave
        </button>
      </div>
      
      {/* Tab Content */}
      <div className="absolute top-12 left-0 right-0 bottom-16 overflow-y-auto bg-gray-900/90">
        {activeTab === 'character' && <CharacterPanel />}
        {activeTab === 'inventory' && <InventoryPanel />}
        {activeTab === 'map' && <MapPanel />}
        {activeTab === 'settings' && <SettingsPanel />}
      </div>
      
      {/* Bottom Navigation */}
      <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} />
    </div>
  );
};

// Inventory Panel
const InventoryPanel: React.FC = () => {
  const { inventory, equipment, equipItem } = useGameStore();
  
  const getRarityColor = (rarity: string) => {
    const colors = {
      common: 'border-gray-500 bg-gray-700',
      rare: 'border-blue-500 bg-blue-900/20',
      epic: 'border-purple-500 bg-purple-900/20',
      legendary: 'border-yellow-500 bg-yellow-900/20',
    };
    return colors[rarity as keyof typeof colors] || colors.common;
  };
  
  const getItemIcon = (type: string) => {
    const icons = {
      weapon: Sword,
      armor: Shield,
      rune: Zap,
      consumable: Package,
    };
    return icons[type as keyof typeof icons] || Package;
  };
  
  return (
    <div className="p-4 space-y-4">
      {/* Equipment Section */}
      <div className="bg-gray-800 rounded-lg p-4">
        <h3 className="text-white font-bold mb-4">Equipment</h3>
        
        <div className="grid grid-cols-3 gap-4">
          {/* Weapon Slot */}
          <div className={`aspect-square border-2 rounded-lg p-2 flex flex-col items-center justify-center ${
            equipment.weapon ? getRarityColor(equipment.weapon.rarity) : 'border-gray-600 bg-gray-700'
          }`}>
            {equipment.weapon ? (
              <>
                <Sword className="w-8 h-8 text-white mb-1" />
                <span className="text-xs text-white text-center">{equipment.weapon.name}</span>
              </>
            ) : (
              <>
                <Sword className="w-8 h-8 text-gray-400 mb-1" />
                <span className="text-xs text-gray-400">Weapon</span>
              </>
            )}
          </div>
          
          {/* Armor Slot */}
          <div className={`aspect-square border-2 rounded-lg p-2 flex flex-col items-center justify-center ${
            equipment.armor ? getRarityColor(equipment.armor.rarity) : 'border-gray-600 bg-gray-700'
          }`}>
            {equipment.armor ? (
              <>
                <Shield className="w-8 h-8 text-white mb-1" />
                <span className="text-xs text-white text-center">{equipment.armor.name}</span>
              </>
            ) : (
              <>
                <Shield className="w-8 h-8 text-gray-400 mb-1" />
                <span className="text-xs text-gray-400">Armor</span>
              </>
            )}
          </div>
          
          {/* Rune Slots */}
          {equipment.runes.map((rune, index) => (
            <div key={index} className={`aspect-square border-2 rounded-lg p-2 flex flex-col items-center justify-center ${
              rune ? getRarityColor(rune.rarity) : 'border-gray-600 bg-gray-700'
            }`}>
              {rune ? (
                <>
                  <Zap className="w-8 h-8 text-white mb-1" />
                  <span className="text-xs text-white text-center">{rune.name}</span>
                </>
              ) : (
                <>
                  <Zap className="w-8 h-8 text-gray-400 mb-1" />
                  <span className="text-xs text-gray-400">Rune</span>
                </>
              )}
            </div>
          ))}
        </div>
      </div>
      
      {/* Inventory Grid */}
      <div className="bg-gray-800 rounded-lg p-4">
        <h3 className="text-white font-bold mb-4">Inventory ({inventory.length}/30)</h3>
        
        <div className="grid grid-cols-6 gap-2">
          {Array.from({ length: 30 }, (_, index) => {
            const item = inventory[index];
            const Icon = item ? getItemIcon(item.type) : Package;
            
            return (
              <div
                key={index}
                onClick={() => item && equipItem(item)}
                className={`aspect-square border-2 rounded-lg p-2 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-600 ${
                  item ? getRarityColor(item.rarity) : 'border-gray-600 bg-gray-700'
                }`}
              >
                {item ? (
                  <>
                    <Icon className="w-6 h-6 text-white mb-1" />
                    <span className="text-xs text-white text-center leading-tight">{item.name}</span>
                  </>
                ) : (
                  <div className="w-6 h-6 border border-gray-500 border-dashed rounded" />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

// Map Panel
const MapPanel: React.FC = () => {
  const { gameState } = useGameStore();
  
  return (
    <div className="p-4">
      <div className="bg-gray-800 rounded-lg p-4">
        <h3 className="text-white font-bold mb-4">Game Info</h3>
        
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-400">Current Phase:</span>
              <span className="text-white ml-2 font-bold">{Math.floor((gameState.currentWave - 1) / 10) + 1}</span>
            </div>
            <div>
              <span className="text-gray-400">Total Waves:</span>
              <span className="text-white ml-2 font-bold">{gameState.currentWave}</span>
            </div>
            <div>
              <span className="text-gray-400">Status:</span>
              <span className={`ml-2 font-bold ${gameState.isAfk ? 'text-green-400' : 'text-red-400'}`}>
                {gameState.isAfk ? 'Farming' : 'Idle'}
              </span>
            </div>
            <div>
              <span className="text-gray-400">Enemies:</span>
              <span className="text-white ml-2 font-bold">{useGameStore.getState().renderState.enemies.length}</span>
            </div>
          </div>
          
          {gameState.isInBossWave && (
            <div className="p-3 bg-red-900/20 border border-red-500 rounded-lg">
              <div className="text-red-400 text-sm font-bold">⚠️ Boss Wave Available!</div>
              <div className="text-red-300 text-xs">Defeat the boss to advance to the next phase.</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Settings Panel
const SettingsPanel: React.FC = () => {
  const { player, saveGame, loadGame } = useGameStore();
  
  const resetProgress = () => {
    if (confirm('Are you sure you want to reset your progress? This cannot be undone.')) {
      // Reset player to level 1 but keep some stats
      useGameStore.setState((state) => ({
        player: {
          ...state.player,
          level: Math.max(1, state.player.level - 100),
          xp: 0,
          xpToNext: 100,
          hp: 100,
          maxHp: 100,
          mp: 50,
          maxMp: 50,
          // Keep allocated stats but reset unallocated points
          unallocatedPoints: 0,
        },
        gameState: {
          ...state.gameState,
          currentWave: 1,
          currentPhase: 1,
          isInBossWave: false,
          isFighting: false,
          enemies: [],
        }
      }));
    }
  };
  
  const exportSave = () => {
    const gameData = {
      player: useGameStore.getState().player,
      gameState: useGameStore.getState().gameState,
      inventory: useGameStore.getState().inventory,
      equipment: useGameStore.getState().equipment,
      exportedAt: new Date().toISOString(),
    };
    
    const dataStr = JSON.stringify(gameData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `afk-rpg-save-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    
    URL.revokeObjectURL(url);
  };
  
  return (
    <div className="p-4 space-y-4">
      <div className="bg-gray-800 rounded-lg p-4">
        <h3 className="text-white font-bold mb-4">Game Settings</h3>
        
        <div className="space-y-4">
          {/* Save/Load */}
          <div className="space-y-2">
            <button
              onClick={() => saveGame()}
              className="w-full px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-bold"
            >
              Save Game
            </button>
            <button
              onClick={() => loadGame()}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-bold"
            >
              Load Game
            </button>
            <button
              onClick={exportSave}
              className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-bold"
            >
              Export Save
            </button>
          </div>
          
          <hr className="border-gray-600" />
          
          {/* Reset Options */}
          <div className="space-y-2">
            <button
              onClick={resetProgress}
              className="w-full px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-bold"
            >
              Reset (-100 Levels)
            </button>
            <p className="text-xs text-gray-400">
              Removes 100 levels but keeps your allocated stat points. 
              Use this for prestige-style progression.
            </p>
          </div>
          
          <hr className="border-gray-600" />
          
          {/* Game Info */}
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-400">Version:</span>
              <span className="text-white">1.0.0</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Total Play Time:</span>
              <span className="text-white">{Math.floor(useGameStore.getState().gameState.totalPlayTime / 60000)}m</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Total Gold Earned:</span>
              <span className="text-white">{player.gold}</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Game Instructions */}
      <div className="bg-gray-800 rounded-lg p-4">
        <h3 className="text-white font-bold mb-4">How to Play</h3>
        
        <div className="space-y-3 text-sm text-gray-300">
          <div>
            <strong className="text-white">AFK Mode:</strong> Toggle AFK to start automatic combat. 
            Your character will fight enemies and gain XP while you&apos;re away.
          </div>
          <div>
            <strong className="text-white">Waves:</strong> Complete waves 1-9, then face a boss at wave 10. 
            Defeat bosses to progress to higher phases.
          </div>
          <div>
            <strong className="text-white">Stats:</strong> Allocate stat points to increase your power:
            <ul className="ml-4 mt-1 text-xs space-y-1">
              <li>• STR: Increases damage output</li>
              <li>• DEX: Improves attack speed and dodge</li>
              <li>• INT: Boosts mana and magic damage</li>
              <li>• VIT: Increases health and regeneration</li>
            </ul>
          </div>
          <div>
            <strong className="text-white">Equipment:</strong> Equip weapons, armor, and runes 
            to boost your stats and combat effectiveness.
          </div>
          <div>
            <strong className="text-white">Offline Rewards:</strong> The game calculates up to 2 hours 
            of offline progress when you return.
          </div>
        </div>
      </div>
    </div>
  );
};

// Generate some initial items for testing
const generateInitialItems = (): Item[] => {
  const items: Item[] = [];
  
  // Weapons
  items.push(
    {
      id: 'sword_1',
      name: 'Iron Sword',
      type: 'weapon',
      rarity: 'common',
      damage: 15,
      stats: { str: 2 },
      value: 50,
    },
    {
      id: 'sword_2',
      name: 'Steel Blade',
      type: 'weapon',
      rarity: 'rare',
      damage: 25,
      stats: { str: 4, dex: 1 },
      value: 150,
    }
  );
  
  // Armor
  items.push(
    {
      id: 'armor_1',
      name: 'Leather Armor',
      type: 'armor',
      rarity: 'common',
      defense: 10,
      stats: { vit: 2 },
      value: 40,
    },
    {
      id: 'armor_2',
      name: 'Chain Mail',
      type: 'armor',
      rarity: 'rare',
      defense: 18,
      stats: { vit: 4, str: 1 },
      value: 120,
    }
  );
  
  // Runes
  items.push(
    {
      id: 'rune_1',
      name: 'Power Rune',
      type: 'rune',
      rarity: 'epic',
      stats: { str: 3, int: 2 },
      value: 200,
    }
  );
  
  return items;
};

// Add initial items to store on first load
const initializeGame = () => {
  const items = generateInitialItems();
  items.forEach(item => useGameStore.getState().addItem(item));
};

export default function AFKRPGApp() {
  const [isInitialized, setIsInitialized] = useState(false);
  
  useEffect(() => {
    if (!isInitialized) {
      // Add some initial items for testing
      setTimeout(() => {
        initializeGame();
        setIsInitialized(true);
      }, 1000);
    }
  }, [isInitialized]);
  
  return (
    <div className="min-h-screen bg-gray-900">
      <AFKRPGGame />
    </div>
  );
}