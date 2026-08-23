import type { CacheStore } from "../../foundation/cache/CacheStore";
import type { CacheEntry } from "../../foundation/cache/CacheEntry";
import type { CacheService } from "../../foundation/services/CacheService";

export class CacheManager implements CacheService {
  constructor(
    private readonly store: CacheStore,
  ) {}

  async has(key: string): Promise<boolean> {
    return (await this.getEntry(key)) !== undefined;
  }

  async get<T>(key: string): Promise<T | undefined> {
    const entry = await this.getEntry<T>(key);

    return entry?.value;
  }

  async set<T>(
    key: string,
    value: T,
    ttl?: number,
  ): Promise<void> {
    const now = Date.now();

    const entry: CacheEntry<T> = {
      value,
      createdAt: now,
      expiresAt:
        ttl !== undefined
          ? now + ttl
          : undefined,
    };

    await this.store.set(key, entry);
  }

  async remove(key: string): Promise<boolean> {
    return await this.store.remove(key);
  }

  async clear(): Promise<void> {
    await this.store.clear();
  }

  private async getEntry<T>(
    key: string,
  ): Promise<CacheEntry<T> | undefined> {
    const entry =
      await this.store.get<CacheEntry<T>>(key);

    if (!entry) {
      return undefined;
    }

    if (
      entry.expiresAt !== undefined &&
      Date.now() >= entry.expiresAt
    ) {
      await this.store.remove(key);

      return undefined;
    }

    return entry;
  }
}