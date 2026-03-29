import { Equipment, Stats } from '../types/game';

export interface EquipmentBonuses {
  stats: Stats;   // sum of all equipped items' stat bonuses
  damage: number; // sum of all equipped items' damage bonuses
  defense: number; // sum of all equipped items' defense bonuses
}

/**
 * Computes the total bonuses provided by all currently equipped items.
 * Returns additive bonuses to apply on top of the player's base stats.
 */
export function computeEquipmentBonuses(equipment: Equipment): EquipmentBonuses {
  const stats: Stats = { str: 0, dex: 0, int: 0, vit: 0 };
  let damage = 0;
  let defense = 0;

  for (const item of Object.values(equipment)) {
    if (!item) continue;
    if (item.stats) {
      stats.str += item.stats.str ?? 0;
      stats.dex += item.stats.dex ?? 0;
      stats.int += item.stats.int ?? 0;
      stats.vit += item.stats.vit ?? 0;
    }
    if (item.damage) damage += item.damage;
    if (item.defense) defense += item.defense;
  }

  return { stats, damage, defense };
}
