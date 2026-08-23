import type { CacheStore } from "../CacheStore";

export class LocalStorageStore implements CacheStore {
  async has(key: string): Promise<boolean> {
    return localStorage.getItem(key) !== null;
  }

  async get<T>(key: string): Promise<T | undefined> {
    const value = localStorage.getItem(key);

    if (value === null) {
      return undefined;
    }

    return JSON.parse(value) as T;
  }

  async set<T>(key: string, value: T): Promise<void> {
    localStorage.setItem(key, JSON.stringify(value));
  }

  async remove(key: string): Promise<boolean> {
    if (!localStorage.getItem(key)) {
      return false;
    }

    localStorage.removeItem(key);

    return true;
  }

  async clear(): Promise<void> {
    localStorage.clear();
  }
}