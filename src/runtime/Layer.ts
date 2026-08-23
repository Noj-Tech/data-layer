import { Registry } from "../foundation/registry/Registry";

import type { LayerModule } from "../foundation/types/Module";
import type { LayerContext } from "../foundation/types/LayerContext";
import type { RunContext } from "../foundation/types/RunContext";

import { Runner } from "./Runner";

export class Layer implements LayerContext {
  private readonly modules = new Registry<LayerModule>();

  private readonly services = new Map<string, unknown>();

  private readonly runner: Runner;

  constructor() {
    this.runner = new Runner(this);
  }

  use(module: LayerModule): this {
    this.modules.register(module);

    module.install(this);

    return this;
  }

  has(name: string): boolean {
    return this.modules.has(name);
  }

  set<T>(key: string, value: T): void {
    this.services.set(key, value);
  }

  get<T>(key: string): T | undefined {
    return this.services.get(key) as T | undefined;
  }

  async run<T>(context: RunContext<T>): Promise<T> {
    return this.runner.run(context);
  }
}
