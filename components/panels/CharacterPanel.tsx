import React from 'react';
import { useGameStore } from '../../stores/gameStore';
import { Stats } from '../../types/game';
import { SkillsPanel } from '../ui/SkillsPanel';
import { computeEquipmentBonuses } from '../../stores/equipmentUtils';

export const CharacterPanel: React.FC = () => {
  const { player, equipment, updatePlayerStats } = useGameStore();
  const equipBonus = computeEquipmentBonuses(equipment);

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

  const statLabels: Record<keyof Stats, string> = {
    str: 'STR',
    dex: 'DEX',
    int: 'INT',
    vit: 'VIT',
  };

  return (
    <div className="p-3 space-y-3">
      {/* Base Stats */}
      <div className="bg-gray-800 rounded-lg p-3">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-white font-bold text-sm">Personaje</h3>
          {player.unallocatedPoints > 0 && (
            <span className="px-2 py-0.5 bg-yellow-600/40 border border-yellow-500 rounded text-xs text-yellow-400 font-bold">
              {player.unallocatedPoints} pts libres
            </span>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="text-center bg-gray-700 rounded-lg py-2">
            <div className="text-xl font-bold text-white">{player.level}</div>
            <div className="text-xs text-gray-400">Nivel</div>
          </div>
          <div className="text-center bg-gray-700 rounded-lg py-2">
            <div className="text-xl font-bold text-yellow-400">{player.gold}</div>
            <div className="text-xs text-gray-400">Oro</div>
          </div>
        </div>

        <div className="space-y-2">
          {(Object.keys(player.stats) as (keyof Stats)[]).map((stat) => {
            const base = player.stats[stat];
            const bonus = equipBonus.stats[stat];
            return (
              <div key={stat} className="flex items-center justify-between">
                <span className="text-gray-300 text-sm w-10">{statLabels[stat]}</span>
                <div className="flex items-center gap-1.5 flex-1">
                  <span className="text-white font-bold text-sm tabular-nums">{base}</span>
                  {bonus > 0 && (
                    <span className="text-green-400 text-xs font-semibold">+{bonus}</span>
                  )}
                  <span className="text-gray-500 text-xs">= {base + bonus}</span>
                </div>
                <button
                  onClick={() => allocatePoint(stat)}
                  disabled={player.unallocatedPoints === 0}
                  className="w-9 h-9 bg-blue-600 text-white rounded-full disabled:bg-gray-600 disabled:cursor-not-allowed text-sm font-bold flex items-center justify-center flex-shrink-0"
                >
                  +
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Equipment Bonuses Summary */}
      {(equipBonus.damage > 0 || equipBonus.defense > 0) && (
        <div className="bg-gray-800 rounded-lg p-3">
          <h3 className="text-white font-bold text-sm mb-2">Bonuses de equipo</h3>
          <div className="flex gap-4 text-sm">
            {equipBonus.damage > 0 && (
              <div>
                <span className="text-gray-400">Daño: </span>
                <span className="text-red-400 font-bold">+{equipBonus.damage}</span>
              </div>
            )}
            {equipBonus.defense > 0 && (
              <div>
                <span className="text-gray-400">Defensa: </span>
                <span className="text-blue-400 font-bold">+{equipBonus.defense}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Skills Panel */}
      <SkillsPanel />
    </div>
  );
};
