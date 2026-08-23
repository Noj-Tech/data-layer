import type { CacheOptions } from "../cache/CacheOptions";

export interface RunContext<T = unknown> {
  key?: string;

  cache?: CacheOptions;

  execute(): Promise<T>;
}