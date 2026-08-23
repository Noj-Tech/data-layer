export interface CacheService {
  has(key: string): Promise<boolean>;

  get<T>(key: string): Promise<T | undefined>;

  set<T>(
    key: string,
    value: T,
    ttl?: number,
  ): Promise<void>;

  remove(key: string): Promise<boolean>;

  clear(): Promise<void>;
}