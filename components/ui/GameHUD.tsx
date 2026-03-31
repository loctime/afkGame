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
    <div className="fixed top-0 left-0 right-0 bg-gray-900/95 backdrop-blur-sm z-50"
      style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }}
    >
      <div className="flex items-center gap-2 px-2 py-1 max-w-screen-xl mx-auto">

        {/* Bars — stacked vertically, fill available space */}
        <div className="flex-1 min-w-0 space-y-0.5">
          {/* HP */}
          <div className="flex items-center gap-1">
            <Heart className="w-3 h-3 text-red-500 shrink-0" />
            <div className="flex-1 bg-gray-700 rounded-full h-1.5">
              <div
                className="bg-red-500 h-1.5 rounded-full transition-all duration-300"
                style={{ width: `${hpPercentage}%` }}
              />
            </div>
            <span className="text-[10px] text-gray-300 shrink-0 w-14 text-right tabular-nums">
              {player.hp}/{player.maxHp}
            </span>
          </div>

          {/* MP */}
          <div className="flex items-center gap-1">
            <Zap className="w-3 h-3 text-blue-500 shrink-0" />
            <div className="flex-1 bg-gray-700 rounded-full h-1.5">
              <div
                className="bg-blue-500 h-1.5 rounded-full transition-all duration-300"
                style={{ width: `${mpPercentage}%` }}
              />
            </div>
            <span className="text-[10px] text-gray-300 shrink-0 w-14 text-right tabular-nums">
              {player.mp}/{player.maxMp}
            </span>
          </div>

          {/* XP */}
          <div className="flex items-center gap-1">
            <span className="text-[10px] text-yellow-500 shrink-0 w-3 text-center font-bold">XP</span>
            <div className="flex-1 bg-gray-700 rounded-full h-1.5">
              <div
                className="bg-yellow-500 h-1.5 rounded-full transition-all duration-300"
                style={{ width: `${xpPercentage}%` }}
              />
            </div>
            <span className="text-[10px] text-gray-300 shrink-0 w-14 text-right tabular-nums">
              {player.xp}/{player.xpToNext}
            </span>
          </div>
        </div>

        {/* Center Info */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Level + Gold */}
          <div className="text-center leading-none">
            <div className="text-white font-bold text-xs">Lv.{player.level}</div>
            <div className="text-[10px] text-yellow-400 mt-0.5">{player.gold}g</div>
          </div>

          {/* Wave + Info button */}
          <div className="text-center leading-none">
            <div className="text-white font-bold text-xs">
              {gameState.isInBossWave ? 'BOSS' : `W${gameState.currentWave}`}
            </div>
            <button
              onClick={() => setShowAreaInfo(!showAreaInfo)}
              className="text-[10px] text-gray-400 mt-0.5"
            >
              Info
            </button>
          </div>

          {/* AFK badge */}
          <div className="px-1.5 py-0.5 bg-green-800/60 border border-green-600 rounded text-[10px] text-green-400 font-bold">
            AFK
          </div>
        </div>

        {/* Status indicator */}
        <div className="shrink-0 text-right">
          <span className={`text-[10px] font-semibold ${gameState.isFighting ? 'text-green-400' : 'text-yellow-400'}`}>
            {gameState.isFighting ? '⚔️' : gameState.isInBossWave ? '⚠️ Boss' : '...'}
          </span>
        </div>
      </div>

      {/* Area Info Dropdown */}
      {showAreaInfo && (
        <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1 w-64 bg-gray-800 rounded-lg shadow-lg border border-gray-600 z-50">
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
                <div className="text-red-400 font-bold">¡Boss en puerta!</div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Click outside to close */}
      {showAreaInfo && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowAreaInfo(false)}
        />
      )}
    </div>
  );
};
