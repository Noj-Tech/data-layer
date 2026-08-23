import { describe, expect, it } from "vitest";

import { MemoryStore } from "../src/foundation/cache/stores/MemoryStore";

describe("MemoryStore", () => {
  it("should store and retrieve value", async () => {
    const store = new MemoryStore();

    await store.set("user", {
      id: 1,
      name: "Daniyal",
    });

    const result = await store.get("user");

    expect(result).toEqual({
      id: 1,
      name: "Daniyal",
    });
  });

  it("should check if key exists", async () => {
    const store = new MemoryStore();

    await store.set("users", []);

    expect(await store.has("users")).toBe(true);
  });

  it("should remove value", async () => {
    const store = new MemoryStore();

    await store.set("token", "abc");

    await store.remove("token");

    expect(await store.has("token")).toBe(false);
  });

  it("should clear all values", async () => {
    const store = new MemoryStore();

    await store.set("a", 1);
    await store.set("b", 2);

    await store.clear();

    expect(await store.has("a")).toBe(false);
    expect(await store.has("b")).toBe(false);
  });
});
