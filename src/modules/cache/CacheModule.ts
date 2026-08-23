import type { LayerContext } from "../../foundation/types/LayerContext";
import type { CacheStore } from "../../foundation/cache/CacheStore";

import { MemoryStore } from "../../foundation/cache/stores/MemoryStore";
import { CacheManager } from "./CacheManager";

export interface CacheModuleOptions {
  store?: CacheStore;
}

export function CacheModule(options: CacheModuleOptions = {}) {
  return {
    name: "cache",

    install(context: LayerContext) {
      const store = options.store ?? new MemoryStore();

      const cache = new CacheManager(store);

      context.set("cache", cache);
    },
  };
}
