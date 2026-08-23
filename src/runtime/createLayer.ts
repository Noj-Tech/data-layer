import { Layer } from "./Layer";
import { CacheModule } from "../modules/cache/CacheModule";
import { IndexedDBStore } from "../foundation/cache/stores/IndexedDBStore";
import type { LayerOptions } from "../foundation/types/LayerOptions";

export function createLayer(options: LayerOptions = {}) {
  const layer = new Layer();

  layer.use(
    CacheModule({
      store: options.cache?.store ?? new IndexedDBStore(),
    }),
  );

  return layer;
}
