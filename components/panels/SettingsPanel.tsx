import React from 'react';
import { useGameStore } from '../../stores/gameStore';
import { BackgroundSelector } from '../ui/BackgroundSelector';

export const SettingsPanel: React.FC = () => {
  const { player, saveGame, loadGame, gameState } = useGameStore();
  
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
          unallocatedPoints: 0,
        },
        gameState: {
          ...state.gameState,
          currentWave: 1,
          currentPhase: 1,
          isInBossWave: false,
          isFighting: false,
          isAfk: false,
        },
        // enemies live in renderState, not gameState
        renderState: {
          ...state.renderState,
          enemies: [],
        },
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
      {/* Background Selector */}
      <BackgroundSelector 
        currentBackground={gameState.currentBackground || 1}
        onBackgroundChange={(backgroundNumber) => {
          useGameStore.setState((state) => ({
            gameState: {
              ...state.gameState,
              currentBackground: backgroundNumber
            }
          }));
        }}
      />
      
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
