import React from 'react';
import { useGameStore } from '../../stores/gameStore';
import { Stats } from '../../types/game';
import { SkillsPanel } from '../ui/SkillsPanel';

export const CharacterPanel: React.FC = () => {
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
    <div className="p-3 space-y-3">
      <div className="bg-gray-800 rounded-lg p-3">
        <h3 className="text-white font-bold mb-3 text-sm">Character Stats</h3>
        
        <div className="grid grid-cols-2 gap-3">
          <div className="text-center">
            <div className="text-xl font-bold text-white">{player.level}</div>
            <div className="text-xs text-gray-400">Level</div>
          </div>
          <div className="text-center">
            <div className="text-xl font-bold text-yellow-500">{player.unallocatedPoints}</div>
            <div className="text-xs text-gray-400">Points</div>
          </div>
        </div>
        
        <div className="mt-4 space-y-2">
          {Object.entries(player.stats).map(([stat, value]) => (
            <div key={stat} className="flex items-center justify-between">
              <span className="text-white capitalize text-sm">{stat}</span>
              <div className="flex items-center space-x-2">
                <span className="text-white font-bold w-6 text-sm">{value}</span>
                <button
                  onClick={() => allocatePoint(stat as keyof Stats)}
                  disabled={player.unallocatedPoints === 0}
                  className="w-9 h-9 bg-blue-600 text-white rounded-full disabled:bg-gray-600 disabled:cursor-not-allowed text-sm font-bold flex items-center justify-center flex-shrink-0"
                >
                  +
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Skills Panel */}
      <SkillsPanel />
    </div>
  );
};
