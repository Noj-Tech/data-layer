import type { CacheStore } from "../cache/CacheStore";

export interface LayerOptions {
  cache?: {
    store?: CacheStore;
  };
}
