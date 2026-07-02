/** Shared callback type for updating acquired supply quantities in the shopping cart. */
export type OnUpdateAcquired = (
  type: "thread" | "bead" | "specialty",
  junctionId: string,
  quantity: number,
) => void;
