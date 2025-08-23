import { Item } from '../types/game';

export const generateInitialItems = (): Item[] => {
  const items: Item[] = [];
  
  // Weapons
  items.push(
    {
      id: 'sword_1',
      name: 'Iron Sword',
      type: 'weapon',
      rarity: 'common',
      damage: 15,
      stats: { str: 2 },
      value: 50,
    },
    {
      id: 'sword_2',
      name: 'Steel Blade',
      type: 'weapon',
      rarity: 'rare',
      damage: 25,
      stats: { str: 4, dex: 1 },
      value: 150,
    }
  );
  
  // Armor
  items.push(
    {
      id: 'armor_1',
      name: 'Leather Armor',
      type: 'armor',
      rarity: 'common',
      defense: 10,
      stats: { vit: 2 },
      value: 40,
    },
    {
      id: 'armor_2',
      name: 'Chain Mail',
      type: 'armor',
      rarity: 'rare',
      defense: 18,
      stats: { vit: 4, str: 1 },
      value: 120,
    }
  );
  
  // Runes
  items.push(
    {
      id: 'rune_1',
      name: 'Power Rune',
      type: 'rune',
      rarity: 'epic',
      stats: { str: 3, int: 2 },
      value: 200,
    }
  );
  
  return items;
};
