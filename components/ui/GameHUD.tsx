import React, { useState } from 'react';
import { Heart, Zap } from 'lucide-react';
import { useGameStore } from '../../stores/gameStore';

export const GameHUD: React.FC = () => {
  const { player, gameState } = useGameStore();
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

          {/* AFK indicator — always active */}
          <div className="px-2 py-1 bg-green-800/60 border border-green-600 rounded text-xs text-green-400 font-bold">
            AFK
          </div>
        </div>

        {/* Status indicator */}
        <div className="flex items-center">
          <span className={`text-xs font-semibold ${gameState.isFighting ? 'text-green-400' : 'text-yellow-400'}`}>
            {gameState.isFighting ? 'Combate activo' : gameState.isInBossWave ? 'Boss esperando...' : 'Iniciando...'}
          </span>
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
                <span className="ml-1 font-bold text-green-400">Farming</span>
              </div>
              <div>
                <span className="text-gray-400">Enemies:</span>
                <span className="text-white ml-1 font-bold">{useGameStore.getState().renderState.enemies.length}</span>
              </div>
            </div>

            {gameState.isInBossWave && (
              <div className="mt-2 p-1 bg-red-900/20 border border-red-500 rounded text-xs">
                <div className="text-red-400 font-bold">Boss en puerta!</div>
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
