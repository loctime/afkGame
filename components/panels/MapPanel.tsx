import React from 'react';
import { useGameStore } from '../../stores/gameStore';

export const MapPanel: React.FC = () => {
  const { gameState } = useGameStore();
  
  return (
    <div className="bg-gray-900/80 backdrop-blur-sm rounded-lg p-3 border border-gray-700 shadow-lg">
      <div className="flex items-center space-x-4 text-sm">
        <div className="flex items-center space-x-3">
          <span className="text-white font-bold text-xs">Game Info</span>
          <div>
            <span className="text-gray-400 text-xs">Phase:</span>
            <span className="text-white ml-1 font-bold text-xs">{Math.floor((gameState.currentWave - 1) / 10) + 1}</span>
          </div>
          <div>
            <span className="text-gray-400 text-xs">Waves:</span>
            <span className="text-white ml-1 font-bold text-xs">{gameState.currentWave}</span>
          </div>
          <div>
            <span className="text-gray-400 text-xs">Status:</span>
            <span className={`ml-1 font-bold text-xs ${gameState.isAfk ? 'text-green-400' : 'text-red-400'}`}>
              {gameState.isAfk ? 'Farming' : 'Idle'}
            </span>
          </div>
          <div>
            <span className="text-gray-400 text-xs">Enemies:</span>
            <span className="text-white ml-1 font-bold text-xs">{useGameStore.getState().renderState.enemies.length}</span>
          </div>
        </div>
        
        {gameState.isInBossWave && (
          <div className="px-2 py-1 bg-red-900/40 border border-red-500 rounded text-xs">
            <span className="text-red-400 font-bold text-xs">⚠️ BOSS</span>
          </div>
        )}
      </div>
    </div>
  );
};
