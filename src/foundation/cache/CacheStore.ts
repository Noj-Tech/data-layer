export interface CacheStore {
  has(key: string): Promise<boolean>;

  get<T>(key: string): Promise<T | undefined>;

  set<T>(key: string, value: T): Promise<void>;

  remove(key: string): Promise<boolean>;

  clear(): Promise<void>;
}