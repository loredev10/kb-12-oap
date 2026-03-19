export type EntityStatusFilter = "active" | "deleted" | "all";

export function parseStatusFilter(value: unknown): EntityStatusFilter {
  if (value === "deleted") return "deleted";
  if (value === "all") return "all";
  return "active";
}