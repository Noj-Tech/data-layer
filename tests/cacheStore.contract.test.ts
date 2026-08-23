// @vitest-environment jsdom
import { beforeEach, describe, expect, it } from "vitest";
import { MemoryStore } from "../src/foundation/cache/stores/MemoryStore";

import { IndexedDBStore } from "../src/foundation/cache/stores/IndexedDBStore";

import { LocalStorageStore } from "../src/foundation/cache/stores/LocalStorageStore";

function runCacheStoreContract(
  createStore: () => {
    has(key: string): Promise<boolean>;
    get<T>(key: string): Promise<T | undefined>;
    set<T>(key: string, value: T): Promise<void>;
    remove(key: string): Promise<boolean>;
    clear(): Promise<void>;
  },
) {
  describe("CacheStore contract", () => {
    let store: ReturnType<typeof createStore>;

    beforeEach(async () => {
      store = createStore();
      await store.clear();
    });

    it("should store and retrieve a value", async () => {
      await store.set("users", {
        users: ["ali", "reza"],
      });

      expect(await store.get("users")).toEqual({
        users: ["ali", "reza"],
      });
    });

    it("should return undefined for a missing key", async () => {
      expect(await store.get("missing")).toBeUndefined();
    });

    it("should report whether a key exists", async () => {
      expect(await store.has("users")).toBe(false);

      await store.set("users", ["ali"]);

      expect(await store.has("users")).toBe(true);
    });

    it("should overwrite an existing value", async () => {
      await store.set("users", ["ali"]);
      await store.set("users", ["reza"]);

      expect(await store.get("users")).toEqual(["reza"]);
    });

    it("should remove a value", async () => {
      await store.set("users", ["ali"]);

      expect(await store.remove("users")).toBe(true);
      expect(await store.get("users")).toBeUndefined();
      expect(await store.has("users")).toBe(false);
    });

    it("should return false when removing a missing key", async () => {
      expect(await store.remove("missing")).toBe(false);
    });

    it("should clear all values", async () => {
      await store.set("users", ["ali"]);
      await store.set("posts", ["post-1"]);

      await store.clear();

      expect(await store.has("users")).toBe(false);
      expect(await store.has("posts")).toBe(false);
      expect(await store.get("users")).toBeUndefined();
      expect(await store.get("posts")).toBeUndefined();
    });

    it("should keep different keys isolated", async () => {
      await store.set("users", ["ali"]);
      await store.set("posts", ["post-1"]);

      await store.remove("users");

      expect(await store.get("users")).toBeUndefined();
      expect(await store.get("posts")).toEqual(["post-1"]);
    });
  });
}

runCacheStoreContract(() => new MemoryStore());
runCacheStoreContract(
  () => new IndexedDBStore(`contract-${crypto.randomUUID()}`),
);
runCacheStoreContract(() => new LocalStorageStore());
