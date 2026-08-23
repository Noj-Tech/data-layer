import type { CacheStrategy } from "../cache/CacheStrategy";

export interface CacheOptions {
  strategy: CacheStrategy;

  ttl?: number;
}