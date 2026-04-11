/**
 * Natural sort comparator for color/product codes.
 *
 * DMC thread codes are stored as strings but are mostly numeric (310, 3761).
 * Some codes are text-only (Blanc, Ecru). Prisma's orderBy sorts alphabetically,
 * producing 334, 3761, 500 instead of 334, 500, 3761.
 *
 * Sort order: numeric codes ascending, then text codes alphabetically.
 */
export function naturalSortByCode(a: string, b: string): number {
  const aNum = Number(a);
  const bNum = Number(b);

  const aIsNumeric = !isNaN(aNum) && a.trim() !== "";
  const bIsNumeric = !isNaN(bNum) && b.trim() !== "";

  if (aIsNumeric && bIsNumeric) {
    return aNum - bNum;
  }

  if (aIsNumeric) return -1;
  if (bIsNumeric) return 1;

  return a.localeCompare(b);
}
