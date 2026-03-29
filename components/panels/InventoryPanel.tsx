import React, { useState } from 'react';
import { X } from 'lucide-react';
import { useGameStore } from '../../stores/gameStore';
import { Item, Equipment } from '../../types/game';
import { getItemComparison } from '../../stores/inventoryActions';
import { getTotalStats } from '../../core/systems/utils';

// ─── Constantes ───────────────────────────────────────────────────────────────

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

const ITEM_TYPE_ICONS: Record<string, string> = {
  weapon: '⚔️', chest: '🛡️', armor: '🛡️', helmet: '👑',
  necklace: '📿', wings: '✨', bracelet: '💍', shield: '🔰',
  gloves: '🧤', ring: '💎', pants: '👖', boots: '🥾',
  artifact: '🔮', rune: '🔮', pet: '⭐', consumable: '🧪',
};

const SLOT_TYPES: Partial<Record<keyof Equipment, Item['type'][]>> = {
  weapon: ['weapon'], chest: ['chest', 'armor'], helmet: ['helmet'],
  necklace: ['necklace'], wings: ['wings'], bracelet1: ['bracelet'],
  bracelet2: ['bracelet'], shield: ['shield'], gloves: ['gloves'],
  ring1: ['ring'], ring2: ['ring'], pants: ['pants'], boots: ['boots'],
  artifact1: ['artifact', 'rune'], artifact2: ['artifact', 'rune'], pet: ['pet'],
};

/** Slot primario de un tipo de ítem (para comparación cuando no hay slot seleccionado) */
const PRIMARY_SLOT: Partial<Record<Item['type'], keyof Equipment>> = {
  weapon: 'weapon', chest: 'chest', armor: 'chest', helmet: 'helmet',
  necklace: 'necklace', wings: 'wings', bracelet: 'bracelet1', shield: 'shield',
  gloves: 'gloves', ring: 'ring1', pants: 'pants', boots: 'boots',
  artifact: 'artifact1', rune: 'artifact1', pet: 'pet',
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
const RARITY_ROW_BG: Record<string, string> = {
  common: 'bg-gray-700/30', rare: 'bg-blue-900/20',
  epic: 'bg-purple-900/25', legendary: 'bg-yellow-900/15',
};

// ─── Componente ───────────────────────────────────────────────────────────────

export const InventoryPanel: React.FC = () => {
  const { inventory, equipment, player, equipItem, unequipItem, autoEquipAll } = useGameStore();

  const [activeTab, setActiveTab]       = useState<EquipmentTab>('armor');
  const [selectedSlot, setSelectedSlot] = useState<keyof Equipment | null>(null);

  // ─── Stats calculados ──────────────────────────────────────────────────────

  const totalStats = getTotalStats(player, equipment);
  const totalDef   = (Object.keys(equipment) as (keyof Equipment)[]).reduce(
    (sum, k) => sum + (equipment[k]?.defense || 0), 0,
  );

  // ─── Items del inventario filtrados / ordenados ─────────────────────────────

  const activeSlot    = selectedSlot as keyof Equipment;
  const currentEquipped = selectedSlot ? (equipment[activeSlot] ?? null) : null;

  const sortedInventory = [...inventory].sort((a: Item, b: Item) => {
    const o: Record<string, number> = { legendary: 0, epic: 1, rare: 2, common: 3 };
    return (o[a.rarity] ?? 4) - (o[b.rarity] ?? 4);
  });

  const displayedItems: Item[] = selectedSlot
    ? sortedInventory.filter((item: Item) => {
        const compat: Item['type'][] = SLOT_TYPES[activeSlot] ?? [];
        return compat.indexOf(item.type) !== -1;
      })
    : sortedInventory;

  // ─── Indicador de mejora ──────────────────────────────────────────────────

  const getUpgradeIndicator = (item: Item): string => {
    const slot = selectedSlot ?? (PRIMARY_SLOT[item.type] ?? null);
    if (!slot) return '';
    const comp    = getItemComparison(item, slot as keyof Equipment, player, equipment);
    const current = equipment[slot as keyof Equipment] ?? null;
    const dmgDiff = (item.damage  || 0) - (current?.damage  || 0);
    const defDiff = (item.defense || 0) - (current?.defense || 0);
    const total   = comp.totalStatsDiff + dmgDiff + defDiff;
    return total > 0 ? '🔼' : total < 0 ? '🔽' : '';
  };

  // ─── Stats inline de un ítem ──────────────────────────────────────────────

  const getItemStatsText = (item: Item): string => {
    const parts: string[] = [];
    if (item.stats?.str)  parts.push(`STR+${item.stats.str}`);
    if (item.stats?.dex)  parts.push(`DEX+${item.stats.dex}`);
    if (item.stats?.int)  parts.push(`INT+${item.stats.int}`);
    if (item.stats?.vit)  parts.push(`VIT+${item.stats.vit}`);
    if (item.damage)      parts.push(`DMG:${item.damage}`);
    if (item.defense)     parts.push(`DEF:${item.defense}`);
    return parts.join('  ');
  };

  // ─── Handlers ─────────────────────────────────────────────────────────────

  const handleSlotClick = (slot: keyof Equipment) => {
    setSelectedSlot((prev: keyof Equipment | null) => prev === slot ? null : slot);
  };

  const handleItemClick = (item: Item) => {
    // Si hay slot seleccionado y el ítem es compatible, equipa allí
    if (selectedSlot) {
      const compat: Item['type'][] = SLOT_TYPES[activeSlot] ?? [];
      if (compat.indexOf(item.type) !== -1) {
        equipItem(item);
        setSelectedSlot(null);
        return;
      }
    }
    // Sin slot seleccionado: equipa en el slot primario
    equipItem(item);
  };

  const handleUnequip = () => {
    if (selectedSlot) { unequipItem(selectedSlot); setSelectedSlot(null); }
  };

  // ─── JSX ──────────────────────────────────────────────────────────────────

  return (
    <div className="p-3 space-y-3">

      {/* ── Barra de stats totales (base + equipo) ─────────────────────── */}
      <div className="grid grid-cols-5 gap-1.5">
        {(['str', 'dex', 'int', 'vit'] as const).map(stat => (
          <div key={stat} className="bg-gray-800 border border-gray-700 rounded-lg py-1.5 text-center">
            <p className="text-xs text-gray-500">{stat.toUpperCase()}</p>
            <p className="text-lg font-bold text-white leading-tight">{totalStats[stat]}</p>
          </div>
        ))}
        <div className="bg-gray-800 border border-gray-700 rounded-lg py-1.5 text-center">
          <p className="text-xs text-gray-500">DEF</p>
          <p className="text-lg font-bold text-blue-300 leading-tight">{totalDef}</p>
        </div>
      </div>

      {/* ── Sección de equipamiento ────────────────────────────────────── */}
      <div className="bg-gray-800 rounded-lg overflow-hidden">

        {/* Tabs */}
        <div className="flex border-b border-gray-700">
          {(Object.keys(TABS) as EquipmentTab[]).map((tab: EquipmentTab) => (
            <button key={tab}
              onClick={() => { setActiveTab(tab); setSelectedSlot(null); }}
              className={`flex-1 py-2 text-xs font-bold tracking-wider transition-colors ${
                activeTab === tab
                  ? 'text-cyan-400 border-b-2 border-cyan-400 -mb-px'
                  : 'text-gray-500 hover:text-gray-300'
              }`}
            >{TABS[tab].label}</button>
          ))}
        </div>

        {/* Grid de slots — compacto */}
        <div className="p-2 grid grid-cols-3 gap-1.5">
          {(TABS[activeTab as EquipmentTab].slots as (keyof Equipment)[]).map((slotKey: keyof Equipment) => {
            const item       = equipment[slotKey];
            const slotStr    = slotKey as string;
            const isSelected = selectedSlot === slotKey;
            return (
              <button key={slotStr}
                onClick={() => handleSlotClick(slotKey)}
                className={`rounded-lg border-2 px-1.5 py-1.5 flex flex-col items-center justify-center h-[68px] transition-all ${
                  item
                    ? `${RARITY_BORDER[item.rarity]} ${RARITY_CARD_BG[item.rarity]} hover:opacity-90`
                    : 'border-gray-600 bg-gray-700/30 hover:border-gray-500'
                } ${isSelected ? 'ring-2 ring-cyan-400 ring-offset-1 ring-offset-gray-800' : ''}`}
              >
                <span className="text-lg leading-none">{SLOT_ICONS[slotKey] ?? '🔲'}</span>
                {item ? (
                  <>
                    <span className="text-xs font-medium text-white text-center leading-tight line-clamp-1 mt-0.5 w-full">{item.name}</span>
                    <span className={`text-xs font-bold px-1 rounded mt-0.5 ${RARITY_BG[item.rarity]} text-white leading-tight`}>
                      {item.rarity}
                    </span>
                  </>
                ) : (
                  <span className="text-xs text-gray-500 mt-0.5">{SLOT_LABELS[slotKey]}</span>
                )}
              </button>
            );
          })}
        </div>

        {/* Footer: desequipar + auto */}
        <div className="px-2 pb-2 flex items-center gap-2">
          {selectedSlot && currentEquipped ? (
            <button onClick={handleUnequip}
              className="flex items-center gap-1 px-2.5 py-1.5 bg-red-900/30 hover:bg-red-900/50 border border-red-800/50 text-red-400 text-xs rounded-lg transition-colors"
            >
              <X className="w-3 h-3" /> Desequipar
            </button>
          ) : (
            <span className="text-xs text-gray-600 flex-1">
              {selectedSlot ? `${SLOT_LABELS[activeSlot]} seleccionado` : ''}
            </span>
          )}
          <div className="flex-1" />
          <button onClick={autoEquipAll}
            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg transition-colors"
          >
            Auto ✨
          </button>
        </div>
      </div>

      {/* ── Inventario ─────────────────────────────────────────────────── */}
      <div className="bg-gray-800 rounded-lg overflow-hidden">

        {/* Header del inventario */}
        <div className="flex items-center justify-between px-3 py-2 border-b border-gray-700">
          {selectedSlot ? (
            <>
              <p className="text-xs font-semibold text-cyan-400">
                {SLOT_ICONS[activeSlot]} {SLOT_LABELS[activeSlot]}
                <span className="text-gray-400 font-normal ml-1">— {displayedItems.length} ítems</span>
              </p>
              <button onClick={() => setSelectedSlot(null)}
                className="text-xs text-gray-500 hover:text-gray-300 px-2 py-0.5 rounded-full border border-gray-600 transition-colors"
              >
                Ver todos
              </button>
            </>
          ) : (
            <p className="text-xs font-semibold text-gray-300">
              Inventario <span className="text-gray-500 font-normal">({inventory.length} ítems)</span>
            </p>
          )}
        </div>

        {/* Lista de ítems */}
        {displayedItems.length === 0 ? (
          <p className="text-xs text-gray-500 text-center py-6">No hay ítems disponibles</p>
        ) : (
          <div className="divide-y divide-gray-700/50">
            {displayedItems.map((item: Item) => {
              const indicator = getUpgradeIndicator(item);
              const statsText = getItemStatsText(item);
              return (
                <button key={item.id}
                  onClick={() => handleItemClick(item)}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 hover:bg-gray-700/60 transition-colors border-l-4 ${RARITY_BORDER[item.rarity]} ${RARITY_ROW_BG[item.rarity]}`}
                >
                  <span className="text-xl flex-shrink-0 w-7 text-center leading-none">
                    {ITEM_TYPE_ICONS[item.type] ?? '📦'}
                  </span>
                  <div className="flex-1 min-w-0 text-left">
                    <p className="text-white text-xs font-semibold truncate leading-tight">{item.name}</p>
                    {statsText ? (
                      <p className="text-gray-400 text-xs leading-tight mt-0.5 truncate">{statsText}</p>
                    ) : null}
                  </div>
                  {indicator ? (
                    <span className="text-sm flex-shrink-0">{indicator}</span>
                  ) : null}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
