import { createLayer } from "./runtime/createLayer";

export default createLayer();

export { createLayer };

export { CacheModule } from "./modules/cache/CacheModule";

export { MemoryStore } from "./foundation/cache/stores/MemoryStore";
export { IndexedDBStore } from "./foundation/cache/stores/IndexedDBStore";
export { LocalStorageStore } from "./foundation/cache/stores/LocalStorageStore";

export type { LayerOptions } from "./foundation/types/LayerOptions";
export type { LayerContext } from "./foundation/types/LayerContext";
export type { RunContext } from "./foundation/types/RunContext";
export type { RuntimeAPI } from "./foundation/types/RuntimeAPI";
export type { LayerModule } from "./foundation/types/Module";

export type { CacheOptions } from "./foundation/cache/CacheOptions";
export type { CacheStore } from "./foundation/cache/CacheStore";
export type { CacheStrategy } from "./foundation/cache/CacheStrategy";