export interface CacheEntry<T = unknown> {
  value: T;
  createdAt: number;
  expiresAt?: number;
}