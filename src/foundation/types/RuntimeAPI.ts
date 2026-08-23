import { Registry } from "../registry/Registry";
import type { LayerModule } from "./Module";

export interface RuntimeAPI {
  modules: Registry<LayerModule>;

  // Future
  // policies: Registry<Policy>;
  // hooks: Registry<Hook>;
}