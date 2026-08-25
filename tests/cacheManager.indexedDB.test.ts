import { describe, expect, it } from "vitest";
import { CacheManager } from "../src/modules/cache/CacheManager";
import { IndexedDBStore } from "../src/foundation/cache/stores/IndexedDBStore";

function createCache() {
  return new CacheManager(
    new IndexedDBStore(`cache-manager-${crypto.randomUUID()}`),
  );
}

describe("CacheManager + IndexedDBStore", () => {
  it("should store and retrieve a value", async () => {
    const cache = createCache();

    await cache.set("users", {
      users: ["Daniyal", "Mahdis"],
    });

    expect(await cache.get("users")).toEqual({
      users: ["Daniyal", "Mahdis"],
    });
  });

  it("should return undefined for an expired value", async () => {
    const cache = createCache();

    await cache.set("users", ["Daniyal"], 20);

    await new Promise((resolve) => setTimeout(resolve, 30));

    expect(await cache.get("users")).toBeUndefined();
  });

  it("should report false for an expired value", async () => {
    const cache = createCache();

    await cache.set("users", ["Daniyal"], 20);

    await new Promise((resolve) => setTimeout(resolve, 30));

    expect(await cache.has("users")).toBe(false);
  });

  it("should keep a value without TTL", async () => {
    const cache = createCache();

    await cache.set("users", ["Daniyal"]);

    expect(await cache.get("users")).toEqual(["Daniyal"]);
  });

  it("should remove an expired entry from IndexedDB", async () => {
    const store = new IndexedDBStore(
      `cache-manager-${crypto.randomUUID()}`,
    );

    const cache = new CacheManager(store);

    await cache.set("users", ["Daniyal"], 20);

    await new Promise((resolve) => setTimeout(resolve, 30));

    expect(await cache.get("users")).toBeUndefined();
    expect(await store.get("users")).toBeUndefined();
  });
});