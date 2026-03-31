import { Item, Equipment, Player, Stats } from '../types/game';
import { GameStore } from './types';
import { getTotalStats } from '../core/systems/utils';

// ─── Tipos públicos ───────────────────────────────────────────────────────────

export type ItemComparison = {
  currentItem: Item | null;
  statsDiff: Partial<Stats>;
  isBetter: boolean;
  totalStatsDiff: number;
};

// ─── Funciones puras exportadas ───────────────────────────────────────────────

/**
 * Calcula la diferencia de stats totales del jugador si se equipa `candidate`
 * en `slotKey`, comparado contra lo que hay actualmente en ese slot.
 * No modifica nada — solo calcula y retorna.
 */
export function getItemComparison(
  candidate: Item,
  slotKey: keyof Equipment,
  player: Player,
  equipment: Equipment,
): ItemComparison {
  const currentItem = equipment[slotKey] ?? null;
  const withCurrent = getTotalStats(player, equipment);
  const withCandidate = getTotalStats(player, { ...equipment, [slotKey]: candidate });

  const statsDiff: Partial<Stats> = {
    str: withCandidate.str - withCurrent.str,
    dex: withCandidate.dex - withCurrent.dex,
    int: withCandidate.int - withCurrent.int,
    vit: withCandidate.vit - withCurrent.vit,
  };
  const totalStatsDiff =
    (statsDiff.str ?? 0) + (statsDiff.dex ?? 0) +
    (statsDiff.int ?? 0) + (statsDiff.vit ?? 0);

  return { currentItem, statsDiff, isBetter: totalStatsDiff > 0, totalStatsDiff };
}

export const createInventoryActions = (set: any) => ({
  addItem: (item: Item) => set((state: GameStore) => ({
    inventory: [...state.inventory, item]
  })),
  
  equipItem: (item: Item) => set((state: GameStore) => {
    const newInventory = state.inventory.filter(i => i.id !== item.id);
    const newEquipment = { ...state.equipment };
    
    // Función helper para equipar un item en un slot específico
    const equipToSlot = (slotKey: keyof Equipment) => {
      if (newEquipment[slotKey]) {
        newInventory.push(newEquipment[slotKey]!);
      }
      newEquipment[slotKey] = item;
    };
    
    // Mapear tipos de items a slots específicos
    switch (item.type) {
      case 'weapon':
        equipToSlot('weapon');
        break;
      case 'chest':
        equipToSlot('chest');
        break;
      case 'helmet':
        equipToSlot('helmet');
        break;
      case 'necklace':
        equipToSlot('necklace');
        break;
      case 'wings':
        equipToSlot('wings');
        break;
      case 'bracelet':
        // Equipar en el primer slot de pulsera disponible
        if (!newEquipment.bracelet1) {
          newEquipment.bracelet1 = item;
        } else if (!newEquipment.bracelet2) {
          newEquipment.bracelet2 = item;
        } else {
          // Si ambos están ocupados, reemplazar el primero
          newInventory.push(newEquipment.bracelet1);
          newEquipment.bracelet1 = item;
        }
        break;
      case 'shield':
        equipToSlot('shield');
        break;
      case 'gloves':
        equipToSlot('gloves');
        break;
      case 'ring':
        // Equipar en el primer slot de anillo disponible
        if (!newEquipment.ring1) {
          newEquipment.ring1 = item;
        } else if (!newEquipment.ring2) {
          newEquipment.ring2 = item;
        } else {
          // Si ambos están ocupados, reemplazar el primero
          newInventory.push(newEquipment.ring1);
          newEquipment.ring1 = item;
        }
        break;
      case 'pants':
        equipToSlot('pants');
        break;
      case 'boots':
        equipToSlot('boots');
        break;
      case 'artifact':
        // Equipar en el primer slot de artefacto disponible
        if (!newEquipment.artifact1) {
          newEquipment.artifact1 = item;
        } else if (!newEquipment.artifact2) {
          newEquipment.artifact2 = item;
        } else {
          // Si ambos están ocupados, reemplazar el primero
          newInventory.push(newEquipment.artifact1);
          newEquipment.artifact1 = item;
        }
        break;
      case 'pet':
        equipToSlot('pet');
        break;
      default:
        // Para tipos legacy, mantener compatibilidad
        if (item.type === 'armor') {
          equipToSlot('chest');
        } else if (item.type === 'rune') {
          // Los runes ahora van a los slots de artefactos
          if (!newEquipment.artifact1) {
            newEquipment.artifact1 = item;
          } else if (!newEquipment.artifact2) {
            newEquipment.artifact2 = item;
          } else {
            newInventory.push(newEquipment.artifact1);
            newEquipment.artifact1 = item;
          }
        }
        break;
    }
    
    return {
      inventory: newInventory,
      equipment: newEquipment,
    };
  }),
  
  unequipItem: (slotKey: keyof Equipment) => set((state: GameStore) => {
    const newInventory = [...state.inventory];
    const newEquipment = { ...state.equipment };

    if (newEquipment[slotKey]) {
      newInventory.push(newEquipment[slotKey]);
      newEquipment[slotKey] = undefined;
    }

    return {
      inventory: newInventory,
      equipment: newEquipment,
    };
  }),

  autoEquipAll: () => set((state: GameStore) => {
    const newInventory = [...state.inventory];
    const newEquipment = { ...state.equipment };
    const player = state.player;

    // Helper: equipa en un slot único comparando stats. Retorna true si equipó.
    const tryEquipSingle = (item: Item, slotKey: keyof Equipment): boolean => {
      if (!newEquipment[slotKey]) {
        newEquipment[slotKey] = item;
        return true;
      }
      const comp = getItemComparison(item, slotKey, player, newEquipment);
      if (comp.isBetter) {
        newInventory.push(newEquipment[slotKey]!);
        newEquipment[slotKey] = item;
        return true;
      }
      return false;
    };

    // Helper: equipa en slots duales (bracelet, ring, artifact). Retorna true si equipó.
    const tryEquipDual = (
      item: Item,
      slot1: keyof Equipment,
      slot2: keyof Equipment,
    ): boolean => {
      if (!newEquipment[slot1]) { newEquipment[slot1] = item; return true; }
      if (!newEquipment[slot2]) { newEquipment[slot2] = item; return true; }
      // Ambos ocupados — reemplazar donde el candidato mejora más
      const comp1 = getItemComparison(item, slot1, player, newEquipment);
      const comp2 = getItemComparison(item, slot2, player, newEquipment);
      if (comp1.totalStatsDiff >= comp2.totalStatsDiff && comp1.isBetter) {
        newInventory.push(newEquipment[slot1]!);
        newEquipment[slot1] = item;
        return true;
      } else if (comp2.isBetter) {
        newInventory.push(newEquipment[slot2]!);
        newEquipment[slot2] = item;
        return true;
      }
      return false;
    };

    // Ordenar por rareza descendente para priorizar los mejores primero
    const rarityOrder = { legendary: 4, epic: 3, rare: 2, common: 1 };
    const sortedItems = [...newInventory].sort(
      (a, b) =>
        (rarityOrder[b.rarity as keyof typeof rarityOrder] || 0) -
        (rarityOrder[a.rarity as keyof typeof rarityOrder] || 0),
    );

    sortedItems.forEach(item => {
      let equipped = false;

      switch (item.type) {
        case 'weapon':   equipped = tryEquipSingle(item, 'weapon');   break;
        case 'chest':
        case 'armor':    equipped = tryEquipSingle(item, 'chest');    break;
        case 'helmet':   equipped = tryEquipSingle(item, 'helmet');   break;
        case 'necklace': equipped = tryEquipSingle(item, 'necklace'); break;
        case 'wings':    equipped = tryEquipSingle(item, 'wings');    break;
        case 'shield':   equipped = tryEquipSingle(item, 'shield');   break;
        case 'gloves':   equipped = tryEquipSingle(item, 'gloves');   break;
        case 'pants':    equipped = tryEquipSingle(item, 'pants');    break;
        case 'boots':    equipped = tryEquipSingle(item, 'boots');    break;
        case 'pet':      equipped = tryEquipSingle(item, 'pet');      break;
        case 'bracelet': equipped = tryEquipDual(item, 'bracelet1', 'bracelet2'); break;
        case 'ring':     equipped = tryEquipDual(item, 'ring1', 'ring2');         break;
        case 'artifact':
        case 'rune':     equipped = tryEquipDual(item, 'artifact1', 'artifact2'); break;
      }

      if (equipped) {
        const index = newInventory.findIndex(i => i.id === item.id);
        if (index !== -1) newInventory.splice(index, 1);
      }
    });

    return { inventory: newInventory, equipment: newEquipment };
  }),
});
