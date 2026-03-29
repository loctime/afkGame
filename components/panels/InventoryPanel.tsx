import React, { useState } from 'react';
import { Sword, Shield, Zap, Package, Crown, Heart, Gem, Sparkles, Circle, Square, Star, X } from 'lucide-react';
import { useGameStore } from '../../stores/gameStore';
import { Item, Equipment } from '../../types/game';
import { getItemComparison } from '../../stores/inventoryActions';

export const InventoryPanel: React.FC = () => {
  const { inventory, equipment, player, equipItem, unequipItem, autoEquipAll } = useGameStore();
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);

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
    const map: Record<string, string> = {
      common: 'text-gray-400',
      rare: 'text-blue-400',
      epic: 'text-purple-400',
      legendary: 'text-yellow-400',
    };
    return map[rarity] || 'text-gray-400';
  };

  const getItemTypeColor = (type: string, isEquipped: boolean = false) => {
    const colors = {
      pet: isEquipped
        ? { borderColor: '#8b5cf6', backgroundColor: 'rgba(147, 51, 234, 0.5)' }
        : { borderColor: '#a78bfa', backgroundColor: 'rgba(147, 51, 234, 0.3)' },
      necklace: isEquipped
        ? { borderColor: '#eab308', backgroundColor: 'rgba(234, 179, 8, 0.5)' }
        : { borderColor: '#facc15', backgroundColor: 'rgba(234, 179, 8, 0.3)' },
      ring: isEquipped
        ? { borderColor: '#eab308', backgroundColor: 'rgba(234, 179, 8, 0.5)' }
        : { borderColor: '#facc15', backgroundColor: 'rgba(234, 179, 8, 0.3)' },
      helmet: isEquipped
        ? { borderColor: '#3b82f6', backgroundColor: 'rgba(59, 130, 246, 0.5)' }
        : { borderColor: '#60a5fa', backgroundColor: 'rgba(59, 130, 246, 0.3)' },
      wings: isEquipped
        ? { borderColor: '#ffffff', backgroundColor: 'rgba(255, 255, 255, 0.3)' }
        : { borderColor: '#d1d5db', backgroundColor: 'rgba(255, 255, 255, 0.2)' },
      weapon: isEquipped
        ? { borderColor: '#ef4444', backgroundColor: 'rgba(239, 68, 68, 0.5)' }
        : { borderColor: '#f87171', backgroundColor: 'rgba(239, 68, 68, 0.3)' },
      bracelet: isEquipped
        ? { borderColor: '#ec4899', backgroundColor: 'rgba(236, 72, 153, 0.5)' }
        : { borderColor: '#f9a8d4', backgroundColor: 'rgba(236, 72, 153, 0.3)' },
      chest: isEquipped
        ? { borderColor: '#6b7280', backgroundColor: 'rgba(126, 49, 170, 0.5)' }
        : { borderColor: '#9ca3af', backgroundColor: 'rgba(120, 79, 143, 0.5)' },
      shield: isEquipped
        ? { borderColor: '#22c55e', backgroundColor: 'rgba(34, 197, 94, 0.5)' }
        : { borderColor: '#4ade80', backgroundColor: 'rgba(34, 197, 94, 0.3)' },
      gloves: isEquipped
        ? { borderColor: '#f59e0b', backgroundColor: 'rgba(148, 95, 4, 0.13)' }
        : { borderColor: '#fbbf24', backgroundColor: 'rgba(245, 158, 11, 0.3)' },
      pants: isEquipped
        ? { borderColor: '#6b7280', backgroundColor: 'rgba(97, 114, 150, 0.5)' }
        : { borderColor: '#9ca3af', backgroundColor: 'rgba(107, 114, 128, 0.3)' },
      boots: isEquipped
        ? { borderColor: '#78716c', backgroundColor: 'rgba(120, 113, 108, 0.5)' }
        : { borderColor: '#a8a29e', backgroundColor: 'rgba(120, 113, 108, 0.3)' },
      artifact: isEquipped
        ? { borderColor: '#eab308', backgroundColor: 'rgba(234, 179, 8, 0.5)' }
        : { borderColor: '#facc15', backgroundColor: 'rgba(234, 179, 8, 0.3)' },
    };

    return colors[type as keyof typeof colors] || (isEquipped
      ? { borderColor: '#6b7280', backgroundColor: 'rgba(107, 114, 128, 0.5)' }
      : { borderColor: '#9ca3af', backgroundColor: 'rgba(107, 114, 128, 0.3)' }
    );
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

  // ─── Map item type to its primary equipment slot ──────────────────────────

  const getItemPrimarySlot = (type: Item['type']): keyof Equipment | null => {
    const map: Partial<Record<Item['type'], keyof Equipment>> = {
      weapon: 'weapon', chest: 'chest', armor: 'chest',
      helmet: 'helmet', necklace: 'necklace', wings: 'wings',
      shield: 'shield', gloves: 'gloves', pants: 'pants',
      boots: 'boots', pet: 'pet',
      bracelet: 'bracelet1', ring: 'ring1',
      artifact: 'artifact1', rune: 'artifact1',
    };
    return map[type] ?? null;
  };

  // ─── Green/red dot: is this item better than what's equipped? ─────────────

  const getUpgradeStatus = (item: Item): 'better' | 'worse' | 'neutral' => {
    const slot = getItemPrimarySlot(item.type);
    if (!slot) return 'neutral';
    const comp = getItemComparison(item, slot, player, equipment);
    const current = equipment[slot] ?? null;
    const total = comp.totalStatsDiff
      + (item.damage || 0) - (current?.damage || 0)
      + (item.defense || 0) - (current?.defense || 0);
    return total > 0 ? 'better' : total < 0 ? 'worse' : 'neutral';
  };

  // ─── Inventory item click: open comparison panel ──────────────────────────

  const handleInventoryItemClick = (item: Item) => {
    setSelectedItem((prev: Item | null) => prev?.id === item.id ? null : item);
  };

  const handleEquip = () => {
    if (selectedItem) {
      equipItem(selectedItem);
      setSelectedItem(null);
    }
  };

  // ─── Equipment slot render (unchanged) ───────────────────────────────────

  const renderEquipmentSlot = (slotKey: keyof typeof equipment, item?: Item, isSpecial = false) => {
    const slotKeyStr = slotKey as string;
    const Icon = item ? getItemIcon(item.type) : getItemIcon(slotKeyStr.replace(/[0-9]/g, '') as any);
    const isArtifact = slotKeyStr.includes('artifact');
    const itemType = slotKeyStr.replace(/[0-9]/g, '') as any;

    const handleSlotClick = () => {
      if (item) {
        unequipItem(slotKey);
      }
    };

    const getSlotStyle = () => {
      if (isArtifact) {
        return {
          background: 'linear-gradient(135deg, rgba(234, 179, 8, 0.3) 0%, rgba(251, 191, 36, 0.3) 100%)',
          borderColor: '#eab308'
        };
      }
      return getItemTypeColor(item ? item.type : itemType, !!item);
    };

    return (
      <div className="flex flex-col items-center">
        <div
          onClick={handleSlotClick}
          className="aspect-square border-2 rounded-lg p-2 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-600"
          style={getSlotStyle() as React.CSSProperties}
        >
          {item ? (
            <Icon className="w-6 h-6 text-white mb-1" />
          ) : (
            <Icon className="w-6 h-6 text-gray-400 mb-1" />
          )}
        </div>
        <span className="text-xs text-gray-400 mt-1 text-center">
          {getSlotLabel(slotKeyStr)}
        </span>
      </div>
    );
  };

  // ─── Comparison bottom sheet ──────────────────────────────────────────────

  const renderComparisonPanel = () => {
    if (!selectedItem) return null;

    const slot = getItemPrimarySlot(selectedItem.type);
    const comp = slot ? getItemComparison(selectedItem, slot, player, equipment) : null;
    const current = comp?.currentItem ?? null;
    const Icon = getItemIcon(selectedItem.type);

    const dmgDiff = (selectedItem.damage || 0) - (current?.damage || 0);
    const defDiff = (selectedItem.defense || 0) - (current?.defense || 0);
    const totalDiff = (comp?.totalStatsDiff ?? 0) + dmgDiff + defDiff;
    const isUpgrade = totalDiff > 0;

    const diffColor = (n: number) =>
      n > 0 ? 'text-green-400' : n < 0 ? 'text-red-400' : 'text-gray-500';

    const diffLabel = (n: number) =>
      n > 0 ? `+${n}` : n < 0 ? `${n}` : '—';

    const statLabels: Record<string, string> = {
      str: 'STR', dex: 'DEX', int: 'INT', vit: 'VIT',
    };

    return (
      <>
        {/* Backdrop */}
        <div
          className="fixed inset-0 bg-black/60 z-40"
          onClick={() => setSelectedItem(null)}
        />

        {/* Bottom sheet */}
        <div className="fixed bottom-0 left-0 right-0 bg-gray-900 border-t-2 border-gray-700 rounded-t-2xl z-50">
          <div className="p-4 max-h-[72vh] overflow-y-auto">

            {/* Handle bar */}
            <div className="w-10 h-1 bg-gray-600 rounded-full mx-auto mb-4" />

            {/* Item header */}
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <div
                  className="w-9 h-9 rounded-lg border-2 flex items-center justify-center flex-shrink-0"
                  style={getItemTypeColor(selectedItem.type, false)}
                >
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <div className="min-w-0">
                  <p className="text-white font-bold text-sm truncate">{selectedItem.name}</p>
                  <p className={`text-xs capitalize ${getRarityTextColor(selectedItem.rarity)}`}>
                    {selectedItem.rarity}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedItem(null)}
                className="ml-2 text-gray-400 hover:text-white p-1 flex-shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Comparison target label */}
            {current ? (
              <p className="text-xs text-gray-400 mb-3">
                vs <span className="text-gray-200 font-medium">{current.name}</span>
                <span className="text-gray-500"> (equipado)</span>
              </p>
            ) : slot ? (
              <p className="text-xs text-gray-500 mb-3">Slot vacío — primer equipo</p>
            ) : null}

            {/* Stats comparison table */}
            {slot && (
              <div className="bg-gray-800 rounded-xl px-3 py-2 mb-3">
                <div className="flex justify-between text-xs text-gray-500 mb-1 pb-1 border-b border-gray-700">
                  <span className="w-8">Stat</span>
                  <span>Actual → Nuevo</span>
                  <span className="w-8 text-right">Diff</span>
                </div>

                {/* STR / DEX / INT / VIT rows */}
                {(['str', 'dex', 'int', 'vit'] as const).map(stat => {
                  const candidateVal = selectedItem.stats?.[stat] || 0;
                  const currentVal = current?.stats?.[stat] || 0;
                  const diff = comp?.statsDiff[stat] ?? 0;
                  if (candidateVal === 0 && currentVal === 0) return null;
                  return (
                    <div key={stat} className="flex justify-between items-center py-0.5">
                      <span className="text-gray-400 text-xs w-8">{statLabels[stat]}</span>
                      <span className="text-gray-300 text-xs">{currentVal} → {candidateVal}</span>
                      <span className={`text-xs font-bold w-8 text-right ${diffColor(diff)}`}>
                        {diffLabel(diff)}
                      </span>
                    </div>
                  );
                })}

                {/* Damage row (weapons) */}
                {(selectedItem.damage || current?.damage) ? (
                  <div className="flex justify-between items-center py-0.5">
                    <span className="text-gray-400 text-xs w-8">DMG</span>
                    <span className="text-gray-300 text-xs">{current?.damage || 0} → {selectedItem.damage || 0}</span>
                    <span className={`text-xs font-bold w-8 text-right ${diffColor(dmgDiff)}`}>
                      {diffLabel(dmgDiff)}
                    </span>
                  </div>
                ) : null}

                {/* Defense row (armor) */}
                {(selectedItem.defense || current?.defense) ? (
                  <div className="flex justify-between items-center py-0.5">
                    <span className="text-gray-400 text-xs w-8">DEF</span>
                    <span className="text-gray-300 text-xs">{current?.defense || 0} → {selectedItem.defense || 0}</span>
                    <span className={`text-xs font-bold w-8 text-right ${diffColor(defDiff)}`}>
                      {diffLabel(defDiff)}
                    </span>
                  </div>
                ) : null}
              </div>
            )}

            {/* Verdict badge */}
            {slot && (
              <div className={`inline-flex items-center gap-1 text-xs font-semibold mb-3 px-2 py-1 rounded-full ${
                isUpgrade
                  ? 'bg-green-900/40 text-green-400'
                  : totalDiff < 0
                    ? 'bg-red-900/40 text-red-400'
                    : 'bg-gray-700 text-gray-400'
              }`}>
                {isUpgrade ? '▲ Mejora tu personaje' : totalDiff < 0 ? '▼ Peor que el actual' : '● Sin cambios de stats'}
              </div>
            )}

            {/* Gold value */}
            <p className="text-xs text-yellow-600 mb-4">Valor: {selectedItem.value}g</p>

            {/* Action buttons */}
            <div className="flex gap-3">
              <button
                onClick={() => setSelectedItem(null)}
                className="flex-1 py-2.5 bg-gray-700 hover:bg-gray-600 text-white text-sm rounded-xl transition-colors"
              >
                Cancelar
              </button>
              {slot && (
                <button
                  onClick={handleEquip}
                  className={`flex-1 py-2.5 text-white text-sm font-semibold rounded-xl transition-colors ${
                    isUpgrade ? 'bg-green-600 hover:bg-green-700' : 'bg-blue-600 hover:bg-blue-700'
                  }`}
                >
                  Equipar
                </button>
              )}
            </div>
          </div>
        </div>
      </>
    );
  };

  return (
    <div className="p-3 space-y-3">

      {/* Equipment Section */}
      <div className="bg-gray-800 rounded-lg p-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-white font-bold text-sm">Equipment</h3>
          <button
            onClick={autoEquipAll}
            className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded-lg transition-colors"
          >
            Equipar Auto
          </button>
        </div>

        {/* Fila 1: Pet, Necklace, Helmet, Wings, vacío */}
        <div className="grid grid-cols-5 gap-3 mb-3">
          {renderEquipmentSlot('pet', equipment.pet)}
          {renderEquipmentSlot('necklace', equipment.necklace)}
          {renderEquipmentSlot('helmet', equipment.helmet)}
          {renderEquipmentSlot('wings', equipment.wings)}
          <div className="aspect-square border-2 border-gray-600 bg-gray-700 rounded-lg p-2 flex flex-col items-center justify-center">
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
            const upgradeStatus = item ? getUpgradeStatus(item) : null;
            const isSelected = item ? selectedItem?.id === item.id : false;

            return (
              <div
                key={index}
                onClick={() => item && handleInventoryItemClick(item)}
                className={`relative aspect-square border-2 rounded-lg p-1 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-600 transition-all ${
                  isSelected ? 'ring-2 ring-white ring-offset-1 ring-offset-gray-800' : ''
                }`}
                style={
                  item
                    ? getItemTypeColor(item.type, false)
                    : { borderColor: '#6b7280', backgroundColor: '#374151' }
                }
              >
                {item ? (
                  <>
                    <Icon className="w-4 h-4 text-white mb-1" />
                    <span className="text-xs text-white text-center leading-tight">{item.name}</span>
                    {/* Upgrade status dot */}
                    {upgradeStatus === 'better' && (
                      <div className="absolute top-0.5 right-0.5 w-2 h-2 bg-green-400 rounded-full" />
                    )}
                    {upgradeStatus === 'worse' && (
                      <div className="absolute top-0.5 right-0.5 w-2 h-2 bg-red-500 rounded-full" />
                    )}
                  </>
                ) : (
                  <div className="w-4 h-4 border border-gray-500 border-dashed rounded" />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Comparison bottom sheet (portal-like fixed overlay) */}
      {selectedItem && renderComparisonPanel()}
    </div>
  );
};
