import { describe, expect, it } from "vitest";
import { IndexedDBStore } from "../src/foundation/cache/stores/IndexedDBStore";

describe("IndexedDBStore integration", () => {
  it("should persist a value", async () => {
    const store = new IndexedDBStore();

    await store.set("users", {
      users: ["Daniyal", "Mahdis"],
    });

    const result = await store.get("users");

    expect(result).toEqual({
      users: ["Daniyal", "Mahdis"],
    });
  });

  it("should keep values after creating a new store instance", async () => {
    const store1 = new IndexedDBStore();

    await store1.set("users", {
      users: ["Daniyal", "Mahdis"],
    });

    const store2 = new IndexedDBStore();

    const result = await store2.get("users");

    expect(result).toEqual({
      users: ["Daniyal", "Mahdis"],
    });
  });

  it("should remove values", async () => {
    const store = new IndexedDBStore();

    await store.set("users", ["Daniyal"]);

    expect(await store.remove("users")).toBe(true);
    expect(await store.get("users")).toBeUndefined();
  });

  it("should clear all values", async () => {
    const store = new IndexedDBStore();

    await store.set("users", ["Daniyal"]);
    await store.set("posts", ["post-1"]);

    await store.clear();

    expect(await store.get("users")).toBeUndefined();
    expect(await store.get("posts")).toBeUndefined();
  });
});