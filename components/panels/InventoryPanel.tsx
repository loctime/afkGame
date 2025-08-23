import React from 'react';
import { Sword, Shield, Zap, Package, Crown, Heart, Gem, Sparkles, Circle, Square, Star } from 'lucide-react';
import { useGameStore } from '../../stores/gameStore';
import { Item } from '../../types/game';

export const InventoryPanel: React.FC = () => {
  const { inventory, equipment, equipItem, unequipItem } = useGameStore();
  
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
      helmet: Crown,
      necklace: Heart,
      wings: Sparkles,
      bracelet: Circle,
      chest: Shield,
      shield: Shield,
      gloves: Square,
      ring: Circle,
      pants: Square,
      boots: Square,
      artifact: Gem,
      pet: Star,
    };
    return icons[type as keyof typeof icons] || Package;
  };

  const getSlotLabel = (slotKey: string) => {
    const labels = {
      pet: 'Pet',
      necklace: 'Necklace',
      helmet: 'Helmet',
      wings: 'Wings',
      weapon: 'Weapon',
      bracelet1: 'Bracelet',
      chest: 'Chest',
      bracelet2: 'Bracelet',
      shield: 'Shield',
      gloves: 'Gloves',
      ring1: 'Ring',
      pants: 'Pants',
      ring2: 'Ring',
      boots: 'Boots',
      artifact1: 'Artifact',
      artifact2: 'Artifact',
    };
    return labels[slotKey as keyof typeof labels] || 'Slot';
  };
  
  const renderEquipmentSlot = (slotKey: keyof typeof equipment, item?: Item, isSpecial = false) => {
    const Icon = item ? getItemIcon(item.type) : getItemIcon(slotKey.replace(/[0-9]/g, '') as any);
    const isArtifact = slotKey.includes('artifact');
    
    const handleSlotClick = () => {
      if (item) {
        // Si hay un item equipado, desequiparlo
        unequipItem(slotKey);
      }
    };
    
    return (
      <div className="flex flex-col items-center">
        <div
          onClick={handleSlotClick}
          className={`aspect-square border-2 rounded-lg p-2 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-600 ${
            item ? getRarityColor(item.rarity) : 'border-gray-600 bg-gray-700'
          } ${isArtifact ? 'bg-gradient-to-br from-yellow-900/30 to-orange-900/30 border-yellow-500' : ''}`}
        >
          {item ? (
            <>
              <Icon className="w-6 h-6 text-white mb-1" />
              <span className="text-xs text-white text-center leading-tight">{item.name}</span>
            </>
          ) : (
            <>
              <Icon className="w-6 h-6 text-gray-400 mb-1" />
              <span className="text-xs text-gray-400 text-center leading-tight">{getSlotLabel(slotKey)}</span>
            </>
          )}
        </div>
        {isSpecial && (
          <span className="text-xs text-gray-400 mt-1">Artifact</span>
        )}
      </div>
    );
  };
  
  return (
    <div className="p-3 space-y-3">
      {/* Equipment Section */}
      <div className="bg-gray-800 rounded-lg p-4">
        <h3 className="text-white font-bold mb-4 text-sm">Equipment</h3>
        
        {/* Primera fila: Pet, Necklace, Helmet, Wings, (vacío) */}
        <div className="grid grid-cols-5 gap-3 mb-3">
          {renderEquipmentSlot('pet', equipment.pet)}
          {renderEquipmentSlot('necklace', equipment.necklace)}
          {renderEquipmentSlot('helmet', equipment.helmet)}
          {renderEquipmentSlot('wings', equipment.wings)}
          <div className="aspect-square border-2 border-gray-600 bg-gray-700 rounded-lg p-2 flex flex-col items-center justify-center">
            <div className="w-6 h-6 border border-gray-500 border-dashed rounded" />
          </div>
        </div>
        
        {/* Segunda fila: Weapon, Bracelet1, Chest, Bracelet2, Shield */}
        <div className="grid grid-cols-5 gap-3 mb-3">
          {renderEquipmentSlot('weapon', equipment.weapon)}
          {renderEquipmentSlot('bracelet1', equipment.bracelet1)}
          {renderEquipmentSlot('chest', equipment.chest)}
          {renderEquipmentSlot('bracelet2', equipment.bracelet2)}
          {renderEquipmentSlot('shield', equipment.shield)}
        </div>
        
        {/* Tercera fila: Gloves, Ring1, Pants, Ring2, Boots */}
        <div className="grid grid-cols-5 gap-3 mb-3">
          {renderEquipmentSlot('gloves', equipment.gloves)}
          {renderEquipmentSlot('ring1', equipment.ring1)}
          {renderEquipmentSlot('pants', equipment.pants)}
          {renderEquipmentSlot('ring2', equipment.ring2)}
          {renderEquipmentSlot('boots', equipment.boots)}
        </div>
        
        {/* Cuarta fila: Artifact1, (vacío), (vacío), (vacío), Artifact2 */}
        <div className="grid grid-cols-5 gap-3">
          {renderEquipmentSlot('artifact1', equipment.artifact1, true)}
          <div className="aspect-square border-2 border-gray-600 bg-gray-700 rounded-lg p-2 flex flex-col items-center justify-center">
            <div className="w-6 h-6 border border-gray-500 border-dashed rounded" />
          </div>
          <div className="aspect-square border-2 border-gray-600 bg-gray-700 rounded-lg p-2 flex flex-col items-center justify-center">
            <div className="w-6 h-6 border border-gray-500 border-dashed rounded" />
          </div>
          <div className="aspect-square border-2 border-gray-600 bg-gray-700 rounded-lg p-2 flex flex-col items-center justify-center">
            <div className="w-6 h-6 border border-gray-500 border-dashed rounded" />
          </div>
          {renderEquipmentSlot('artifact2', equipment.artifact2, true)}
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
