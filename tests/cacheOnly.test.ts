import { describe, expect, it } from "vitest";

import { createLayer } from "../src";
import { CacheModule } from "../src/modules/cache/CacheModule";

describe("Layer cache-only", () => {
  it("should return cached value without executing", async () => {
    const layer = createLayer();

    layer.use(CacheModule());

    const cache = layer.get("cache");

    await cache?.set("users", {
      users: ["cached"],
    });

    let count = 0;

    const action = () =>
      layer.run({
        key: "users",

        cache: {
          strategy: "cache-only",
        },

        execute: async () => {
          count++;

          return {
            users: ["network"],
          };
        },
      });

    const result = await action();

    expect(result).toEqual({
      users: ["cached"],
    });

    expect(count).toBe(0);
  });

  it("should throw when cache is empty", async () => {
    const layer = createLayer();

    layer.use(CacheModule());

    let count = 0;

    const action = () =>
      layer.run({
        key: "users",

        cache: {
          strategy: "cache-only",
        },

        execute: async () => {
          count++;

          return {
            users: ["network"],
          };
        },
      });

    await expect(action()).rejects.toThrow();

    expect(count).toBe(0);
  });

  it("should not execute even when cache key is missing", async () => {
    const layer = createLayer();

    layer.use(CacheModule());

    let count = 0;

    const result = await layer.run({
      cache: {
        strategy: "cache-only",
      },

      execute: async () => {
        count++;

        return "network";
      },
    });

    expect(result).toBe("network");

    expect(count).toBe(1);
  });
});
