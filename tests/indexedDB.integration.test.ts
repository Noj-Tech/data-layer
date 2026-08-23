import { describe, expect, it } from "vitest";
import { IndexedDBStore } from "../src/foundation/cache/stores/IndexedDBStore";

describe("IndexedDBStore integration", () => {
  it("should persist a value", async () => {
    const store = new IndexedDBStore();

    await store.set("users", {
      users: ["ali", "reza"],
    });

    const result = await store.get("users");

    expect(result).toEqual({
      users: ["ali", "reza"],
    });
  });

  it("should keep values after creating a new store instance", async () => {
    const store1 = new IndexedDBStore();

    await store1.set("users", {
      users: ["ali", "reza"],
    });

    const store2 = new IndexedDBStore();

    const result = await store2.get("users");

    expect(result).toEqual({
      users: ["ali", "reza"],
    });
  });

  it("should remove values", async () => {
    const store = new IndexedDBStore();

    await store.set("users", ["ali"]);

    expect(await store.remove("users")).toBe(true);
    expect(await store.get("users")).toBeUndefined();
  });

  it("should clear all values", async () => {
    const store = new IndexedDBStore();

    await store.set("users", ["ali"]);
    await store.set("posts", ["post-1"]);

    await store.clear();

    expect(await store.get("users")).toBeUndefined();
    expect(await store.get("posts")).toBeUndefined();
  });
});