import React, { useState } from 'react';
import { X } from 'lucide-react';
import { useGameStore } from '../../stores/gameStore';
import { Item, Equipment } from '../../types/game';
import { getItemComparison } from '../../stores/inventoryActions';
import { getTotalStats } from '../../core/systems/utils';

// ─── Constantes de configuración ─────────────────────────────────────────────

const SLOT_ICONS: Partial<Record<keyof Equipment, string>> = {
  helmet: '👑', chest: '🛡️', gloves: '🧤', pants: '👖',
  boots: '🥾', shield: '🔰', weapon: '⚔️',
  necklace: '📿', bracelet1: '💍', bracelet2: '💍',
  ring1: '💎', ring2: '💎', pet: '⭐', wings: '✨',
  artifact1: '🔮', artifact2: '🔮',
};

const SLOT_LABELS: Partial<Record<keyof Equipment, string>> = {
  helmet: 'Helmet', chest: 'Chest', gloves: 'Gloves', pants: 'Pants',
  boots: 'Boots', shield: 'Shield', weapon: 'Weapon',
  necklace: 'Necklace', bracelet1: 'Bracelet', bracelet2: 'Bracelet',
  ring1: 'Ring', ring2: 'Ring', pet: 'Pet', wings: 'Wings',
  artifact1: 'Artifact', artifact2: 'Artifact',
};

/** Tipos de ítem compatibles con cada slot */
const SLOT_TYPES: Partial<Record<keyof Equipment, Item['type'][]>> = {
  weapon: ['weapon'], chest: ['chest', 'armor'], helmet: ['helmet'],
  necklace: ['necklace'], wings: ['wings'], bracelet1: ['bracelet'],
  bracelet2: ['bracelet'], shield: ['shield'], gloves: ['gloves'],
  ring1: ['ring'], ring2: ['ring'], pants: ['pants'], boots: ['boots'],
  artifact1: ['artifact', 'rune'], artifact2: ['artifact', 'rune'], pet: ['pet'],
};

type EquipmentTab = 'armor' | 'weapons' | 'jewelry' | 'other';

const TABS: Record<EquipmentTab, { label: string; slots: (keyof Equipment)[] }> = {
  armor:   { label: 'ARMOR',   slots: ['helmet', 'chest', 'gloves', 'pants', 'boots', 'shield'] },
  weapons: { label: 'WEAPONS', slots: ['weapon'] },
  jewelry: { label: 'JEWELRY', slots: ['necklace', 'bracelet1', 'bracelet2', 'ring1', 'ring2'] },
  other:   { label: 'OTHER',   slots: ['pet', 'wings', 'artifact1', 'artifact2'] },
};

const RARITY_BORDER: Record<string, string> = {
  common: 'border-gray-500', rare: 'border-blue-400',
  epic: 'border-purple-400', legendary: 'border-yellow-400',
};
const RARITY_BG: Record<string, string> = {
  common: 'bg-gray-600', rare: 'bg-blue-700',
  epic: 'bg-purple-700', legendary: 'bg-yellow-600',
};
const RARITY_CARD_BG: Record<string, string> = {
  common: 'bg-gray-700/40', rare: 'bg-blue-900/30',
  epic: 'bg-purple-900/30', legendary: 'bg-yellow-900/20',
};

// ─── Componente ───────────────────────────────────────────────────────────────

export const InventoryPanel: React.FC = () => {
  const { inventory, equipment, player, equipItem, unequipItem, autoEquipAll } = useGameStore();

  const [activeTab, setActiveTab]         = useState<EquipmentTab>('armor');
  const [selectedSlot, setSelectedSlot]   = useState<keyof Equipment | null>(null);
  const [selectedInvItem, setSelectedInvItem] = useState<Item | null>(null);
  const [filterType, setFilterType]       = useState<string>('all');

  const totalStats = getTotalStats(player, equipment);
  const currentEquipped = selectedSlot ? (equipment[selectedSlot] ?? null) : null;
  const slotKey = selectedSlot as keyof Equipment;
  const availableTypes: Item['type'][] = selectedSlot ? (SLOT_TYPES[slotKey] ?? []) : [];

  const compatibleItems: Item[] = selectedSlot
    ? inventory
        .filter((item: Item) => {
          const compat: Item['type'][] = SLOT_TYPES[slotKey] ?? [];
          return filterType === 'all' ? compat.indexOf(item.type) !== -1 : item.type === filterType;
        })
        .sort((a: Item, b: Item) => {
          const o: Record<string, number> = { legendary: 0, epic: 1, rare: 2, common: 3 };
          return (o[a.rarity] ?? 4) - (o[b.rarity] ?? 4);
        })
    : [];

  // ─── Handlers ─────────────────────────────────────────────────────────────

  const handleSlotClick = (slot: keyof Equipment) => {
    if (selectedSlot === slot) { setSelectedSlot(null); setSelectedInvItem(null); return; }
    setSelectedSlot(slot);
    setSelectedInvItem(null);
    setFilterType('all');
  };

  const handleEquip = () => {
    if (!selectedInvItem) return;
    equipItem(selectedInvItem);
    setSelectedSlot(null);
    setSelectedInvItem(null);
  };

  const handleUnequip = () => {
    if (!selectedSlot) return;
    unequipItem(selectedSlot);
    setSelectedSlot(null);
  };

  const closePanel = () => { setSelectedSlot(null); setSelectedInvItem(null); };

  // ─── Sidebar / bottom-sheet content ──────────────────────────────────────

  const SidebarContent = () => {
    if (!selectedSlot) return null;

    return (
      <div className="space-y-4">

        {/* Ítem actualmente equipado */}
        {currentEquipped ? (
          <div className={`rounded-lg p-3 border-2 ${RARITY_BORDER[currentEquipped.rarity]} ${RARITY_CARD_BG[currentEquipped.rarity]}`}>
            <p className="text-xs text-gray-400 mb-1">Currently Equipped</p>
            <p className="text-white font-bold text-sm">{currentEquipped.name}</p>
            <span className={`inline-block text-xs font-bold px-2 py-0.5 rounded mt-1 ${RARITY_BG[currentEquipped.rarity]} text-white`}>
              {currentEquipped.rarity.toUpperCase()}
            </span>
            {currentEquipped.stats && (
              <div className="mt-2 space-y-0.5">
                {(['str', 'dex', 'int', 'vit'] as const).map(stat => {
                  const val = currentEquipped.stats?.[stat];
                  return val ? (
                    <div key={stat} className="flex justify-between text-xs">
                      <span className="text-gray-400">{stat.toUpperCase()}</span>
                      <span className="text-cyan-400">+{val}</span>
                    </div>
                  ) : null;
                })}
                {currentEquipped.damage ? (
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-400">DMG</span>
                    <span className="text-orange-400">+{currentEquipped.damage}</span>
                  </div>
                ) : null}
                {currentEquipped.defense ? (
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-400">DEF</span>
                    <span className="text-blue-400">+{currentEquipped.defense}</span>
                  </div>
                ) : null}
              </div>
            )}
            <button
              onClick={handleUnequip}
              className="mt-3 w-full py-1.5 text-xs bg-gray-700 hover:bg-red-900/40 text-red-400 border border-red-900/50 hover:border-red-700 rounded-lg transition-colors"
            >
              Desequipar
            </button>
          </div>
        ) : (
          <p className="text-xs text-gray-500 text-center py-2">Slot vacío</p>
        )}

        {/* Filtro por tipo (solo cuando hay múltiples tipos compatibles) */}
        {availableTypes.length > 1 && (
          <div className="bg-gray-800 rounded-lg p-3">
            <p className="text-xs text-gray-400 mb-2 font-semibold">Filter by type:</p>
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() => setFilterType('all')}
                className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${
                  filterType === 'all'
                    ? 'bg-cyan-600 border-cyan-500 text-white'
                    : 'border-gray-600 text-gray-400 hover:border-gray-500'
                }`}
              >All</button>
              {availableTypes.map((type: Item['type']) => (
                <button key={type} onClick={() => setFilterType(type)}
                  className={`text-xs px-2.5 py-1 rounded-full border capitalize transition-colors ${
                    filterType === type
                      ? 'bg-cyan-600 border-cyan-500 text-white'
                      : 'border-gray-600 text-gray-400 hover:border-gray-500'
                  }`}
                >{type}</button>
              ))}
            </div>
          </div>
        )}

        {/* Lista de ítems disponibles */}
        <div>
          <p className="text-xs text-gray-400 font-semibold mb-2">
            Available Items ({compatibleItems.length})
          </p>
          {compatibleItems.length === 0 ? (
            <p className="text-xs text-gray-500 text-center py-6">No hay ítems disponibles</p>
          ) : (
            <div className="space-y-2">
              {compatibleItems.map(item => {
                const comp     = getItemComparison(item, selectedSlot!, player, equipment);
                const dmgDiff  = (item.damage  || 0) - (currentEquipped?.damage  || 0);
                const defDiff  = (item.defense || 0) - (currentEquipped?.defense || 0);
                const total    = comp.totalStatsDiff + dmgDiff + defDiff;
                const isSelected = selectedInvItem?.id === item.id;
                const indicator  = total > 0 ? '🔼' : total < 0 ? '🔽' : '〰️';

                const diffSpan = (label: string, n: number) => {
                  if (n === 0) return null;
                  return (
                    <span key={label} className={`text-xs font-semibold ${n > 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {label} {n > 0 ? '+' : ''}{n}
                    </span>
                  );
                };

                return (
                  <button
                    key={item.id}
                    onClick={() => setSelectedInvItem((prev: Item | null) => prev?.id === item.id ? null : item)}
                    className={`w-full text-left p-3 rounded-lg border-2 transition-all ${
                      isSelected
                        ? 'border-cyan-400 bg-cyan-900/30 ring-1 ring-cyan-400/50'
                        : `${RARITY_BORDER[item.rarity]} ${RARITY_CARD_BG[item.rarity]} hover:opacity-90`
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <p className="text-white font-semibold text-sm truncate">{item.name}</p>
                        <span className={`inline-block text-xs font-bold px-1.5 py-0.5 rounded mt-0.5 ${RARITY_BG[item.rarity]} text-white`}>
                          {item.rarity.toUpperCase()}
                        </span>
                      </div>
                      <span className="text-base ml-2 flex-shrink-0">{indicator}</span>
                    </div>
                    {/* Diffs vs. equipped */}
                    {currentEquipped && (
                      <div className="flex flex-wrap gap-x-3 gap-y-0.5 mt-2 pt-2 border-t border-gray-700/50">
                        {diffSpan('STR', comp.statsDiff.str ?? 0)}
                        {diffSpan('DEX', comp.statsDiff.dex ?? 0)}
                        {diffSpan('INT', comp.statsDiff.int ?? 0)}
                        {diffSpan('VIT', comp.statsDiff.vit ?? 0)}
                        {diffSpan('DMG', dmgDiff)}
                        {diffSpan('DEF', defDiff)}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Botón equipar */}
        {selectedInvItem && (
          <button
            onClick={handleEquip}
            className="w-full py-3 bg-green-600 hover:bg-green-700 text-white font-bold text-sm rounded-xl transition-colors"
          >
            Equipar — {selectedInvItem.name}
          </button>
        )}
      </div>
    );
  };

  // ─── Render principal ──────────────────────────────────────────────────────

  return (
    <div className="p-3 space-y-3">

      {/* Stats totales del jugador (base + equipo) */}
      <div className="grid grid-cols-4 gap-2">
        {(['str', 'dex', 'int', 'vit'] as const).map(stat => {
          const labels = { str: 'STR', dex: 'DEX', int: 'INT', vit: 'VIT' };
          return (
            <div key={stat} className="bg-gray-800 border border-gray-700 rounded-lg p-2 text-center">
              <p className="text-xs text-gray-500 uppercase tracking-wide">{labels[stat]}</p>
              <p className="text-xl font-bold text-white">{totalStats[stat]}</p>
            </div>
          );
        })}
      </div>

      {/* Sección de equipo */}
      <div className="bg-gray-800 rounded-lg overflow-hidden">

        {/* Tabs */}
        <div className="flex border-b border-gray-700">
          {(Object.keys(TABS) as EquipmentTab[]).map(tab => (
            <button
              key={tab}
              onClick={() => { setActiveTab(tab); setSelectedSlot(null); setSelectedInvItem(null); }}
              className={`flex-1 py-2.5 text-xs font-bold tracking-wider transition-colors ${
                activeTab === tab
                  ? 'text-cyan-400 border-b-2 border-cyan-400 -mb-px'
                  : 'text-gray-500 hover:text-gray-300'
              }`}
            >
              {TABS[tab].label}
            </button>
          ))}
        </div>

        {/* Grid de slots */}
        <div className="p-3 grid grid-cols-3 gap-2">
          {(TABS[activeTab as EquipmentTab].slots as (keyof Equipment)[]).map((slotKey: keyof Equipment) => {
            const item       = equipment[slotKey];
            const isSelected = selectedSlot === slotKey;
            const slotStr    = slotKey as string;
            return (
              <button
                key={slotStr}
                onClick={() => handleSlotClick(slotKey)}
                className={`rounded-lg border-2 p-2 flex flex-col items-center justify-center min-h-[80px] transition-all ${
                  item
                    ? `${RARITY_BORDER[item.rarity]} ${RARITY_CARD_BG[item.rarity]} hover:opacity-90`
                    : 'border-gray-600 bg-gray-700/30 hover:border-gray-500'
                } ${isSelected ? 'ring-2 ring-cyan-400 ring-offset-1 ring-offset-gray-800' : ''}`}
              >
                <span className="text-2xl mb-1">{SLOT_ICONS[slotKey] ?? '🔲'}</span>
                {item ? (
                  <>
                    <span className="text-xs font-semibold text-white text-center leading-tight line-clamp-2">
                      {item.name}
                    </span>
                    <span className={`text-xs font-bold px-1.5 py-0.5 rounded mt-1 ${RARITY_BG[item.rarity]} text-white`}>
                      {item.rarity}
                    </span>
                  </>
                ) : (
                  <span className="text-xs text-gray-500">{SLOT_LABELS[slotKey]}</span>
                )}
              </button>
            );
          })}
        </div>

        {/* Auto-equip */}
        <div className="px-3 pb-3 flex items-center justify-between gap-2">
          <span className="text-xs text-gray-500">Inventory: {inventory.length}/30</span>
          <button
            onClick={autoEquipAll}
            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg transition-colors"
          >
            Equipar Auto ✨
          </button>
        </div>
      </div>

      {/* ── Bottom sheet (mobile) ────────────────────────────────────── */}
      {selectedSlot && (
        <>
          <div className="fixed inset-0 bg-black/60 z-40" onClick={closePanel} />
          <div className="fixed bottom-0 left-0 right-0 bg-gray-900 border-t-2 border-gray-700 rounded-t-2xl z-50 flex flex-col"
            style={{ maxHeight: '75vh' }}
          >
            {/* Handle */}
            <div className="w-10 h-1 bg-gray-600 rounded-full mx-auto mt-3 mb-1 flex-shrink-0" />

            {/* Header */}
            <div className="flex items-center justify-between px-4 py-2 border-b border-gray-700 flex-shrink-0">
              <div>
                <p className="text-white font-bold text-sm">
                  {SLOT_ICONS[selectedSlot as keyof Equipment]} {SLOT_LABELS[selectedSlot as keyof Equipment]}
                </p>
                <p className="text-xs text-gray-400">
                  {currentEquipped ? 'Reemplazar o desequipar' : 'Selecciona un ítem para equipar'}
                </p>
              </div>
              <button onClick={closePanel} className="text-gray-400 hover:text-white p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable body */}
            <div className="flex-1 overflow-y-auto p-4">
              <SidebarContent />
            </div>
          </div>
        </>
      )}
    </div>
  );
};
