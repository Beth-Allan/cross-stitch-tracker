import {
  createSearchParamsCache,
  parseAsArrayOf,
  parseAsInteger,
  parseAsString,
  parseAsStringLiteral,
} from "nuqs/server";
import { STATUS_GROUPS } from "@/lib/utils/status-groups";

export const SORT_FIELDS = ["date", "stitches", "time"] as const;
export const SORT_DIRS = ["asc", "desc"] as const;

export const statsSearchParamsCache = createSearchParamsCache({
  page: parseAsInteger.withDefault(1),
  sort: parseAsStringLiteral(SORT_FIELDS).withDefault("date"),
  dir: parseAsStringLiteral(SORT_DIRS).withDefault("desc"),
  project: parseAsString.withDefault("all"),
  status: parseAsArrayOf(parseAsStringLiteral([...STATUS_GROUPS]), ",").withDefault([]),
});
