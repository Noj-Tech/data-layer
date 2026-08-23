import type { CacheStore } from "../CacheStore";

export class MemoryStore implements CacheStore {
  private readonly storage = new Map<string, unknown>();

  async has(key: string): Promise<boolean> {
    return this.storage.has(key);
  }

  async get<T>(key: string): Promise<T | undefined> {
    return this.storage.get(key) as T | undefined;
  }

  async set<T>(key: string, value: T): Promise<void> {
    this.storage.set(key, value);
  }

  async remove(key: string): Promise<boolean> {
    return this.storage.delete(key);
  }

  async clear(): Promise<void> {
    this.storage.clear();
  }
}