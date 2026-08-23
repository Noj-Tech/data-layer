import { describe, expect, it } from "vitest";

import { IndexedDBStore } from "../src/foundation/cache/stores/IndexedDBStore";

describe("IndexedDBStore environment", () => {
  it("should require IndexedDB", async () => {
    const originalIndexedDB = globalThis.indexedDB;

    // @ts-expect-error - intentionally removing IndexedDB
    delete globalThis.indexedDB;

    const store = new IndexedDBStore();

    await expect(
      store.get("users"),
    ).rejects.toThrow();

    globalThis.indexedDB = originalIndexedDB;
  });
});