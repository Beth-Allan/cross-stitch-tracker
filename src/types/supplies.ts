/**
 * One project's standing in one junction table, as the kitting rule reads it.
 *
 * `acquired` is `Σ min(quantityAcquired, quantityRequired)` — capped per row, never against the
 * project total, so a surplus of one supply cannot cover a shortfall in another. A bare
 * `_sum: { quantityAcquired: true }` does not reproduce it.
 *
 * `unknown` counts the rows whose need cannot be worked out (`quantityRequired` null — a thread
 * line with no known skein length or strand structure, THR-011). They have no figure, so they add
 * nothing to `required` or `acquired`; they are still to buy, so `allFulfilled` is false while any
 * exists. Only threads can have one; beads and specialty always report 0.
 */
export type SupplyRollup = {
  count: number;
  required: number;
  acquired: number;
  unknown: number;
  allFulfilled: boolean;
  anyAcquired: boolean;
};

export type ProjectSupplies = {
  threads: SupplyRollup;
  beads: SupplyRollup;
  specialty: SupplyRollup;
};
