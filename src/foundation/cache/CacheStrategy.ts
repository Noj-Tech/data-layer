export type CacheStrategy =
  | "cache-first"
  | "network-first"
  | "cache-only"
  | "network-only"
  | "stale-while-revalidate";
