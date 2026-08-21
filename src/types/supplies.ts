/**
 * One project's standing in one junction table, as the kitting rule reads it.
 *
 * `acquired` is `Σ min(quantityAcquired, quantityRequired)` — capped per row, never against the
 * project total, so a surplus of one supply cannot cover a shortfall in another. A bare
 * `_sum: { quantityAcquired: true }` does not reproduce it.
 */
export type SupplyRollup = {
  count: number;
  required: number;
  acquired: number;
  allFulfilled: boolean;
  anyAcquired: boolean;
};

export type ProjectSupplies = {
  threads: SupplyRollup;
  beads: SupplyRollup;
  specialty: SupplyRollup;
};
