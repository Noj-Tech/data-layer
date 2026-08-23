import type { LayerContext } from "./LayerContext";

export interface LayerModule {
  name: string;

  install(
    context: LayerContext,
  ): void | Promise<void>;
}