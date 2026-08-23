import { describe, expect, it } from "vitest";

import type { CacheStore } from "../src/foundation/cache/CacheStore";
import { CacheManager } from "../src/modules/cache/CacheManager";

class FakeStore implements CacheStore {
  private readonly data = new Map<string, unknown>();

  has(key: string): boolean {
    return this.data.has(key);
  }

  get<T>(key: string): T | undefined {
    return this.data.get(key) as T | undefined;
  }

  set<T>(key: string, value: T): void {
    this.data.set(key, value);
  }

  remove(key: string): boolean {
    return this.data.delete(key);
  }

  clear(): void {
    this.data.clear();
  }
}

describe("CacheManager with custom store", () => {
  it("should work with any CacheStore implementation", async () => {
    const store = new FakeStore();
    const cache = new CacheManager(store);

    await cache.set("user", {
      id: 1,
    });

    expect(await cache.get("user")).toEqual({
      id: 1,
    });
  });
});
