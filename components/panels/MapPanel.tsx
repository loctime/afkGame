import React from 'react';
import { useGameStore } from '../../stores/gameStore';

export const MapPanel: React.FC = () => {
  const { gameState } = useGameStore();
  
  return (
    <div className="p-4">
      <div className="bg-gray-800 rounded-lg p-4">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center space-x-4">
            <span className="text-white font-bold">Game Info</span>
            <div>
              <span className="text-gray-400">Phase:</span>
              <span className="text-white ml-1 font-bold">{Math.floor((gameState.currentWave - 1) / 10) + 1}</span>
            </div>
            <div>
              <span className="text-gray-400">Waves:</span>
              <span className="text-white ml-1 font-bold">{gameState.currentWave}</span>
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
            <div className="px-3 py-1 bg-red-900/20 border border-red-500 rounded text-xs">
              <span className="text-red-400 font-bold">⚠️ BOSS Available</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
