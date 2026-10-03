export type PremiumRequest = { requestId: string; revision: number } & (
  | { kind: 'crate'; rank: number }
  | { kind: 'upgrade'; key: string }
  | { kind: 'soundtrack'; track: string }
  | { kind: 'boatSkin'; skin: string }
);
export interface AquariumItem {
  instanceId: string;
  speciesId?: string;
  name?: string;
  type: string;
  [key: string]: unknown;
}
export interface AquariumSnapshot {
  aquarium?: { isUnlocked?: boolean; theme?: string; slottedItemIds?: string[] };
  upgrades?: { personalAquarium?: number };
  inventory?: AquariumItem[];
}
