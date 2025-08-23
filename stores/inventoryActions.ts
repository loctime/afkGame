import { Item, Equipment } from '../types/game';
import { GameStore } from './types';

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
    
    // Ordenar items por rareza (legendary > epic > rare > common)
    const rarityOrder = { legendary: 4, epic: 3, rare: 2, common: 1 };
    const sortedItems = newInventory.sort((a, b) => 
      (rarityOrder[b.rarity as keyof typeof rarityOrder] || 0) - 
      (rarityOrder[a.rarity as keyof typeof rarityOrder] || 0)
    );
    
    // Intentar equipar cada item
    sortedItems.forEach(item => {
      const equipToSlot = (slotKey: keyof Equipment) => {
        if (!newEquipment[slotKey]) {
          newEquipment[slotKey] = item;
          return true; // Equipado exitosamente
        }
        return false; // Slot ocupado
      };
      
      let equipped = false;
      
      switch (item.type) {
        case 'weapon':
          equipped = equipToSlot('weapon');
          break;
        case 'chest':
          equipped = equipToSlot('chest');
          break;
        case 'helmet':
          equipped = equipToSlot('helmet');
          break;
        case 'necklace':
          equipped = equipToSlot('necklace');
          break;
        case 'wings':
          equipped = equipToSlot('wings');
          break;
        case 'bracelet':
          if (!equipped) equipped = equipToSlot('bracelet1');
          if (!equipped) equipped = equipToSlot('bracelet2');
          break;
        case 'shield':
          equipped = equipToSlot('shield');
          break;
        case 'gloves':
          equipped = equipToSlot('gloves');
          break;
        case 'ring':
          if (!equipped) equipped = equipToSlot('ring1');
          if (!equipped) equipped = equipToSlot('ring2');
          break;
        case 'pants':
          equipped = equipToSlot('pants');
          break;
        case 'boots':
          equipped = equipToSlot('boots');
          break;
        case 'artifact':
          if (!equipped) equipped = equipToSlot('artifact1');
          if (!equipped) equipped = equipToSlot('artifact2');
          break;
        case 'pet':
          equipped = equipToSlot('pet');
          break;
      }
      
      // Si se equipó, remover del inventario
      if (equipped) {
        const index = newInventory.findIndex(i => i.id === item.id);
        if (index !== -1) {
          newInventory.splice(index, 1);
        }
      }
    });
    
    return {
      inventory: newInventory,
      equipment: newEquipment,
    };
  }),
});
