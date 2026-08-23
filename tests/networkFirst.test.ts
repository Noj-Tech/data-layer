import { describe, expect, it } from "vitest";

import { createLayer } from "../src";
import { CacheModule } from "../src/modules/cache/CacheModule";

describe("Layer network-first cache", () => {
  it("should execute and cache the result", async () => {
    const layer = createLayer();

    layer.use(CacheModule());

    let count = 0;

    const action = () =>
      layer.run({
        key: "users",

        cache: {
          strategy: "network-first",
        },

        execute: async () => {
          count++;

          return {
            users: [count],
          };
        },
      });

    const first = await action();

    expect(first).toEqual({
      users: [1],
    });

    expect(count).toBe(1);

    const cache = layer.get("cache");

    expect(await cache?.get("users")).toEqual({
      users: [1],
    });
  });

  it("should execute again even when cache exists", async () => {
    const layer = createLayer();

    layer.use(CacheModule());

    let count = 0;

    const action = () =>
      layer.run({
        key: "users",

        cache: {
          strategy: "network-first",
        },

        execute: async () => {
          count++;

          return {
            users: [count],
          };
        },
      });

    await action();
    const second = await action();

    expect(second).toEqual({
      users: [2],
    });

    expect(count).toBe(2);
  });

  it("should return cached value when network fails", async () => {
    const layer = createLayer();

    layer.use(CacheModule());

    const cache = layer.get("cache");

    await cache?.set("users", {
      users: ["cached"],
    });

    const action = () =>
      layer.run({
        key: "users",

        cache: {
          strategy: "network-first",
        },

        execute: async () => {
          throw new Error("Network failed");
        },
      });

    const result = await action();

    expect(result).toEqual({
      users: ["cached"],
    });
  });

  it("should throw when network fails and cache is empty", async () => {
    const layer = createLayer();

    layer.use(CacheModule());

    const action = () =>
      layer.run({
        key: "users",

        cache: {
          strategy: "network-first",
        },

        execute: async () => {
          throw new Error("Network failed");
        },
      });

    await expect(action()).rejects.toThrow("Network failed");
  });
});
