import React from 'react';
import { Sword, Shield, Zap, Package } from 'lucide-react';
import { useGameStore } from '../../stores/gameStore';
import { Item } from '../../types/game';

export const InventoryPanel: React.FC = () => {
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
    <div className="p-3 space-y-3">
      {/* Equipment Section */}
      <div className="bg-gray-800 rounded-lg p-3">
        <h3 className="text-white font-bold mb-3 text-sm">Equipment</h3>
        
        <div className="grid grid-cols-3 gap-2">
          {/* Weapon Slot */}
          <div className={`aspect-square border-2 rounded-lg p-1 flex flex-col items-center justify-center ${
            equipment.weapon ? getRarityColor(equipment.weapon.rarity) : 'border-gray-600 bg-gray-700'
          }`}>
            {equipment.weapon ? (
              <>
                <Sword className="w-6 h-6 text-white mb-1" />
                <span className="text-xs text-white text-center leading-tight">{equipment.weapon.name}</span>
              </>
            ) : (
              <>
                <Sword className="w-6 h-6 text-gray-400 mb-1" />
                <span className="text-xs text-gray-400">Weapon</span>
              </>
            )}
          </div>
          
          {/* Armor Slot */}
          <div className={`aspect-square border-2 rounded-lg p-1 flex flex-col items-center justify-center ${
            equipment.armor ? getRarityColor(equipment.armor.rarity) : 'border-gray-600 bg-gray-700'
          }`}>
            {equipment.armor ? (
              <>
                <Shield className="w-6 h-6 text-white mb-1" />
                <span className="text-xs text-white text-center leading-tight">{equipment.armor.name}</span>
              </>
            ) : (
              <>
                <Shield className="w-6 h-6 text-gray-400 mb-1" />
                <span className="text-xs text-gray-400">Armor</span>
              </>
            )}
          </div>
          
          {/* Rune Slots */}
          {equipment.runes.map((rune, index) => (
            <div key={index} className={`aspect-square border-2 rounded-lg p-1 flex flex-col items-center justify-center ${
              rune ? getRarityColor(rune.rarity) : 'border-gray-600 bg-gray-700'
            }`}>
              {rune ? (
                <>
                  <Zap className="w-6 h-6 text-white mb-1" />
                  <span className="text-xs text-white text-center leading-tight">{rune.name}</span>
                </>
              ) : (
                <>
                  <Zap className="w-6 h-6 text-gray-400 mb-1" />
                  <span className="text-xs text-gray-400">Rune</span>
                </>
              )}
            </div>
          ))}
        </div>
      </div>
      
      {/* Inventory Grid */}
      <div className="bg-gray-800 rounded-lg p-3">
        <h3 className="text-white font-bold mb-3 text-sm">Inventory ({inventory.length}/30)</h3>
        
        <div className="grid grid-cols-4 gap-1">
          {Array.from({ length: 30 }, (_, index) => {
            const item = inventory[index];
            const Icon = item ? getItemIcon(item.type) : Package;
            
            return (
              <div
                key={index}
                onClick={() => item && equipItem(item)}
                className={`aspect-square border-2 rounded-lg p-1 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-600 ${
                  item ? getRarityColor(item.rarity) : 'border-gray-600 bg-gray-700'
                }`}
              >
                {item ? (
                  <>
                    <Icon className="w-4 h-4 text-white mb-1" />
                    <span className="text-xs text-white text-center leading-tight">{item.name}</span>
                  </>
                ) : (
                  <div className="w-4 h-4 border border-gray-500 border-dashed rounded" />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
