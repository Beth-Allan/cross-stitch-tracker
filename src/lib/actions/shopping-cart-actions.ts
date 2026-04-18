"use server";

// Stub file for TDD RED phase - all functions throw "not implemented"

export async function getShoppingCartData() {
  throw new Error("Not implemented");
}

export async function updateSupplyAcquired(
  _type: "thread" | "bead" | "specialty",
  _junctionId: string,
  _acquiredQuantity: number,
) {
  throw new Error("Not implemented");
}
