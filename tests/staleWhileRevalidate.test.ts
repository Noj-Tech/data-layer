import { describe, expect, it } from "vitest";

import { createLayer } from "../src";
import { CacheModule } from "../src/modules/cache/CacheModule";

describe("Layer stale-while-revalidate cache", () => {
  it("should return cached value immediately", async () => {
    const layer = createLayer();

    layer.use(CacheModule());

    const cache = layer.get("cache");

    await cache?.set("users", {
      users: ["cached"],
    });

    let count = 0;

    const result = await layer.run({
      key: "users",

      cache: {
        strategy: "stale-while-revalidate",
      },

      execute: async () => {
        count++;

        return {
          users: ["network"],
        };
      },
    });

    expect(result).toEqual({
      users: ["cached"],
    });

    expect(count).toBe(1);
  });

  it("should update cache in background", async () => {
    const layer = createLayer();

    layer.use(CacheModule());

    const cache = layer.get("cache");

    await cache?.set("users", {
      users: ["cached"],
    });

    const result = await layer.run({
      key: "users",

      cache: {
        strategy: "stale-while-revalidate",
      },

      execute: async () => {
        return {
          users: ["network"],
        };
      },
    });

    expect(result).toEqual({
      users: ["cached"],
    });

    // اجازه می‌دهیم revalidation اجرا شود
    await Promise.resolve();

    expect(await cache?.get("users")).toEqual({
      users: ["network"],
    });
  });

  it("should execute normally when cache is empty", async () => {
    const layer = createLayer();

    layer.use(CacheModule());

    let count = 0;

    const result = await layer.run({
      key: "users",

      cache: {
        strategy: "stale-while-revalidate",
      },

      execute: async () => {
        count++;

        return {
          users: ["network"],
        };
      },
    });

    expect(result).toEqual({
      users: ["network"],
    });

    expect(count).toBe(1);

    const cache = layer.get("cache");

    expect(await cache?.get("users")).toEqual({
      users: ["network"],
    });
  });
});