export interface LayerContext {
  set<T>(key: string, value: T): void;

  get<T>(key: string): T | undefined;

  has(key: string): boolean;
}