import React, { useState } from 'react';
import { Sword, Shield, Zap, Package, Crown, Heart, Gem, Sparkles, Circle, Square, Star, X } from 'lucide-react';
import { useGameStore } from '../../stores/gameStore';
import { Item } from '../../types/game';

export const InventoryPanel: React.FC = () => {
  const { inventory, equipment, equipItem, unequipItem, autoEquipAll } = useGameStore();
  const [selectedItem, setSelectedItem] = useState<{ item: Item; source: 'inventory' | keyof typeof equipment } | null>(null);

  const getRarityColor = (rarity: string) => {
    const colors = {
      common: 'border-gray-500 bg-gray-700',
      rare: 'border-blue-500 bg-blue-900/20',
      epic: 'border-purple-500 bg-purple-900/20',
      legendary: 'border-yellow-500 bg-yellow-900/20',
    };
    return colors[rarity as keyof typeof colors] || colors.common;
  };

  const getRarityTextColor = (rarity: string) => {
    const colors = { common: 'text-gray-300', rare: 'text-blue-400', epic: 'text-purple-400', legendary: 'text-yellow-400' };
    return colors[rarity as keyof typeof colors] || 'text-gray-300';
  };

  const getItemTypeColor = (type: string, isEquipped: boolean = false) => {
    const colors = {
      pet: isEquipped ? { borderColor: '#8b5cf6', backgroundColor: 'rgba(147, 51, 234, 0.5)' } : { borderColor: '#a78bfa', backgroundColor: 'rgba(147, 51, 234, 0.3)' },
      necklace: isEquipped ? { borderColor: '#eab308', backgroundColor: 'rgba(234, 179, 8, 0.5)' } : { borderColor: '#facc15', backgroundColor: 'rgba(234, 179, 8, 0.3)' },
      ring: isEquipped ? { borderColor: '#eab308', backgroundColor: 'rgba(234, 179, 8, 0.5)' } : { borderColor: '#facc15', backgroundColor: 'rgba(234, 179, 8, 0.3)' },
      helmet: isEquipped ? { borderColor: '#3b82f6', backgroundColor: 'rgba(59, 130, 246, 0.5)' } : { borderColor: '#60a5fa', backgroundColor: 'rgba(59, 130, 246, 0.3)' },
      wings: isEquipped ? { borderColor: '#ffffff', backgroundColor: 'rgba(255, 255, 255, 0.3)' } : { borderColor: '#d1d5db', backgroundColor: 'rgba(255, 255, 255, 0.2)' },
      weapon: isEquipped ? { borderColor: '#ef4444', backgroundColor: 'rgba(239, 68, 68, 0.5)' } : { borderColor: '#f87171', backgroundColor: 'rgba(239, 68, 68, 0.3)' },
      bracelet: isEquipped ? { borderColor: '#ec4899', backgroundColor: 'rgba(236, 72, 153, 0.5)' } : { borderColor: '#f9a8d4', backgroundColor: 'rgba(236, 72, 153, 0.3)' },
      chest: isEquipped ? { borderColor: '#6b7280', backgroundColor: 'rgba(126, 49, 170, 0.5)' } : { borderColor: '#9ca3af', backgroundColor: 'rgba(120, 79, 143, 0.5)' },
      shield: isEquipped ? { borderColor: '#22c55e', backgroundColor: 'rgba(34, 197, 94, 0.5)' } : { borderColor: '#4ade80', backgroundColor: 'rgba(34, 197, 94, 0.3)' },
      gloves: isEquipped ? { borderColor: '#f59e0b', backgroundColor: 'rgba(148, 95, 4, 0.13)' } : { borderColor: '#fbbf24', backgroundColor: 'rgba(245, 158, 11, 0.3)' },
      pants: isEquipped ? { borderColor: '#6b7280', backgroundColor: 'rgba(97, 114, 150, 0.5)' } : { borderColor: '#9ca3af', backgroundColor: 'rgba(107, 114, 128, 0.3)' },
      boots: isEquipped ? { borderColor: '#78716c', backgroundColor: 'rgba(120, 113, 108, 0.5)' } : { borderColor: '#a8a29e', backgroundColor: 'rgba(120, 113, 108, 0.3)' },
      artifact: isEquipped ? { borderColor: '#eab308', backgroundColor: 'rgba(234, 179, 8, 0.5)' } : { borderColor: '#facc15', backgroundColor: 'rgba(234, 179, 8, 0.3)' },
    };
    return colors[type as keyof typeof colors] || (isEquipped
      ? { borderColor: '#6b7280', backgroundColor: 'rgba(107, 114, 128, 0.5)' }
      : { borderColor: '#9ca3af', backgroundColor: 'rgba(107, 114, 128, 0.3)' });
  };

  const getItemIcon = (type: string) => {
    const icons = {
      weapon: Sword, armor: Shield, rune: Zap, consumable: Package, helmet: Crown,
      necklace: Heart, wings: Sparkles, bracelet: Circle, chest: Shield, shield: Shield,
      gloves: Square, ring: Circle, pants: Square, boots: Square, artifact: Gem, pet: Star,
    };
    return icons[type as keyof typeof icons] || Package;
  };

  const getSlotLabel = (slotKey: string) => {
    const labels: Record<string, string> = {
      pet: 'Pet', necklace: 'Collar', helmet: 'Casco', wings: 'Alas',
      weapon: 'Arma', bracelet1: 'Pulsera', chest: 'Pecho', bracelet2: 'Pulsera',
      shield: 'Escudo', gloves: 'Guantes', ring1: 'Anillo', pants: 'Pantalón',
      ring2: 'Anillo', boots: 'Botas', artifact1: 'Artefacto', artifact2: 'Artefacto',
    };
    return labels[slotKey] || 'Slot';
  };

  const renderStatBonuses = (item: Item) => {
    const parts: string[] = [];
    if (item.damage) parts.push(`+${item.damage} Daño`);
    if (item.defense) parts.push(`+${item.defense} Defensa`);
    if (item.stats?.str) parts.push(`+${item.stats.str} STR`);
    if (item.stats?.dex) parts.push(`+${item.stats.dex} DEX`);
    if (item.stats?.int) parts.push(`+${item.stats.int} INT`);
    if (item.stats?.vit) parts.push(`+${item.stats.vit} VIT`);
    return parts;
  };

  const renderEquipmentSlot = (slotKey: keyof typeof equipment, item?: Item, isSpecial = false) => {
    const Icon = item ? getItemIcon(item.type) : getItemIcon(slotKey.replace(/[0-9]/g, ''));
    const isArtifact = slotKey.includes('artifact');

    const getSlotStyle = () => {
      if (isArtifact) {
        return { background: 'linear-gradient(135deg, rgba(234, 179, 8, 0.3) 0%, rgba(251, 191, 36, 0.3) 100%)', borderColor: '#eab308' };
      }
      return getItemTypeColor(item ? item.type : slotKey.replace(/[0-9]/g, '') as string, !!item);
    };

    return (
      <div className="flex flex-col items-center">
        <div
          onClick={() => item && setSelectedItem({ item, source: slotKey })}
          className="aspect-square border-2 rounded-lg p-2 flex flex-col items-center justify-center cursor-pointer active:opacity-70"
          style={getSlotStyle()}
        >
          <Icon className={`w-6 h-6 ${item ? 'text-white' : 'text-gray-400'} mb-1`} />
        </div>
        <span className="text-xs text-gray-400 mt-1 text-center">{getSlotLabel(slotKey)}</span>
      </div>
    );
  };

  const handleConfirmEquip = () => {
    if (!selectedItem) return;
    if (selectedItem.source === 'inventory') {
      equipItem(selectedItem.item);
    } else {
      unequipItem(selectedItem.source as keyof typeof equipment);
    }
    setSelectedItem(null);
  };

  return (
    <div className="p-3 space-y-3 pb-4">
      {/* Equipment Section */}
      <div className="bg-gray-800 rounded-lg p-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-white font-bold text-sm">Equipo</h3>
          <button
            onClick={autoEquipAll}
            className="px-3 py-1.5 bg-blue-600 active:bg-blue-800 text-white text-xs rounded-lg"
          >
            Equipar Auto
          </button>
        </div>

        {/* Fila 1: Pet, Necklace, Helmet, Wings */}
        <div className="grid grid-cols-5 gap-3 mb-3">
          {renderEquipmentSlot('pet', equipment.pet)}
          {renderEquipmentSlot('necklace', equipment.necklace)}
          {renderEquipmentSlot('helmet', equipment.helmet)}
          {renderEquipmentSlot('wings', equipment.wings)}
          <div className="aspect-square border-2 border-gray-600 bg-gray-700 rounded-lg flex items-center justify-center">
            <div className="w-6 h-6 border border-gray-500 border-dashed rounded" />
          </div>
        </div>

        {/* Fila 2: Weapon, Bracelet1, Chest, Bracelet2, Shield */}
        <div className="grid grid-cols-5 gap-3 mb-3">
          {renderEquipmentSlot('weapon', equipment.weapon)}
          {renderEquipmentSlot('bracelet1', equipment.bracelet1)}
          {renderEquipmentSlot('chest', equipment.chest)}
          {renderEquipmentSlot('bracelet2', equipment.bracelet2)}
          {renderEquipmentSlot('shield', equipment.shield)}
        </div>

        {/* Fila 3: Gloves, Ring1, Pants, Ring2, Boots */}
        <div className="grid grid-cols-5 gap-3 mb-3">
          {renderEquipmentSlot('gloves', equipment.gloves)}
          {renderEquipmentSlot('ring1', equipment.ring1)}
          {renderEquipmentSlot('pants', equipment.pants)}
          {renderEquipmentSlot('ring2', equipment.ring2)}
          {renderEquipmentSlot('boots', equipment.boots)}
        </div>

        {/* Fila 4: Artifact1, vacíos, Artifact2 */}
        <div className="grid grid-cols-5 gap-3">
          {renderEquipmentSlot('artifact1', equipment.artifact1, true)}
          {[0, 1, 2].map(i => (
            <div key={i} className="aspect-square border-2 border-gray-600 bg-gray-700 rounded-lg flex items-center justify-center">
              <div className="w-6 h-6 border border-gray-500 border-dashed rounded" />
            </div>
          ))}
          {renderEquipmentSlot('artifact2', equipment.artifact2, true)}
        </div>
      </div>

      {/* Inventory Grid */}
      <div className="bg-gray-800 rounded-lg p-3">
        <h3 className="text-white font-bold mb-3 text-sm">Inventario ({inventory.length}/30)</h3>
        <div className="grid grid-cols-4 gap-1">
          {Array.from({ length: 30 }, (_, index) => {
            const item = inventory[index];
            const Icon = item ? getItemIcon(item.type) : Package;
            return (
              <div
                key={index}
                onClick={() => item && setSelectedItem({ item, source: 'inventory' })}
                className="aspect-square border-2 rounded-lg p-1 flex flex-col items-center justify-center cursor-pointer active:opacity-70"
                style={item ? getItemTypeColor(item.type, false) : { borderColor: '#6b7280', backgroundColor: '#374151' }}
              >
                {item ? (
                  <>
                    <Icon className="w-4 h-4 text-white mb-0.5" />
                    <span className="text-[9px] text-white text-center leading-tight line-clamp-2">{item.name}</span>
                  </>
                ) : (
                  <div className="w-4 h-4 border border-gray-500 border-dashed rounded" />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Item Detail Modal */}
      {selectedItem && (
        <div
          className="fixed inset-0 z-40 flex items-end justify-center bg-black/60"
          onClick={() => setSelectedItem(null)}
        >
          <div
            className="w-full max-w-sm bg-gray-900 border border-gray-600 rounded-t-2xl p-5 pb-8"
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className={`font-bold text-lg ${getRarityTextColor(selectedItem.item.rarity)}`}>
                  {selectedItem.item.name}
                </h3>
                <span className="text-xs text-gray-400 capitalize">{selectedItem.item.type} · {selectedItem.item.rarity}</span>
              </div>
              <button onClick={() => setSelectedItem(null)} className="text-gray-400 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Stat bonuses */}
            <div className="space-y-1 mb-4">
              {renderStatBonuses(selectedItem.item).length > 0 ? (
                renderStatBonuses(selectedItem.item).map((bonus, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <span className="text-green-400 text-sm font-semibold">{bonus}</span>
                  </div>
                ))
              ) : (
                <span className="text-gray-400 text-sm">Sin bonificaciones</span>
              )}
            </div>

            {/* Action button */}
            {selectedItem.source === 'inventory' ? (
              <button
                onClick={handleConfirmEquip}
                className="w-full py-3 bg-blue-600 active:bg-blue-800 text-white font-bold rounded-xl"
              >
                Equipar
              </button>
            ) : (
              <button
                onClick={handleConfirmEquip}
                className="w-full py-3 bg-red-700 active:bg-red-900 text-white font-bold rounded-xl"
              >
                Desequipar
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
