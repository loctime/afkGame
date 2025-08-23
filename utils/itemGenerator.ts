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
  
  // Chest Armor
  items.push(
    {
      id: 'chest_1',
      name: 'Leather Armor',
      type: 'chest',
      rarity: 'common',
      defense: 10,
      stats: { vit: 2 },
      value: 40,
    },
    {
      id: 'chest_2',
      name: 'Chain Mail',
      type: 'chest',
      rarity: 'rare',
      defense: 18,
      stats: { vit: 4, str: 1 },
      value: 120,
    }
  );

  // Helmets
  items.push(
    {
      id: 'helmet_1',
      name: 'Iron Helmet',
      type: 'helmet',
      rarity: 'common',
      defense: 5,
      stats: { vit: 1 },
      value: 30,
    }
  );

  // Necklaces
  items.push(
    {
      id: 'necklace_1',
      name: 'Silver Necklace',
      type: 'necklace',
      rarity: 'rare',
      stats: { int: 3, dex: 1 },
      value: 100,
    }
  );

  // Wings
  items.push(
    {
      id: 'wings_1',
      name: 'Angel Wings',
      type: 'wings',
      rarity: 'epic',
      stats: { dex: 5, int: 2 },
      value: 300,
    }
  );

  // Bracelets
  items.push(
    {
      id: 'bracelet_1',
      name: 'Magic Bracelet',
      type: 'bracelet',
      rarity: 'rare',
      stats: { int: 2, dex: 1 },
      value: 80,
    }
  );

  // Shields
  items.push(
    {
      id: 'shield_1',
      name: 'Wooden Shield',
      type: 'shield',
      rarity: 'common',
      defense: 8,
      stats: { vit: 1 },
      value: 35,
    }
  );

  // Gloves
  items.push(
    {
      id: 'gloves_1',
      name: 'Leather Gloves',
      type: 'gloves',
      rarity: 'common',
      defense: 3,
      stats: { dex: 1 },
      value: 25,
    }
  );

  // Rings
  items.push(
    {
      id: 'ring_1',
      name: 'Magic Ring',
      type: 'ring',
      rarity: 'rare',
      stats: { int: 2, str: 1 },
      value: 90,
    }
  );

  // Pants
  items.push(
    {
      id: 'pants_1',
      name: 'Leather Pants',
      type: 'pants',
      rarity: 'common',
      defense: 4,
      stats: { vit: 1 },
      value: 30,
    }
  );

  // Boots
  items.push(
    {
      id: 'boots_1',
      name: 'Leather Boots',
      type: 'boots',
      rarity: 'common',
      defense: 3,
      stats: { dex: 1 },
      value: 25,
    }
  );

  // Artifacts
  items.push(
    {
      id: 'artifact_1',
      name: 'Ancient Rune',
      type: 'artifact',
      rarity: 'legendary',
      stats: { str: 5, dex: 5, int: 5, vit: 5 },
      value: 500,
    }
  );

  // Pets
  items.push(
    {
      id: 'pet_1',
      name: 'Fairy Companion',
      type: 'pet',
      rarity: 'epic',
      stats: { int: 3, dex: 2 },
      value: 250,
    }
  );
  
  return items;
};
