import { Registry } from "../foundation/registry/Registry";

import type { LayerModule } from "../foundation/types/Module";
import type { RuntimeAPI } from "../foundation/types/RuntimeAPI";

export class Runtime implements RuntimeAPI {
  readonly modules = new Registry<LayerModule>();
}