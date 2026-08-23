import { describe, expect, it } from "vitest";

import { createLayer } from "../src";
import { CacheModule } from "../src/modules/cache/CacheModule";

describe("Layer network-only cache", () => {
  it("should execute even when cache exists", async () => {
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
          strategy: "network-only",
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
      users: ["network"],
    });

    expect(count).toBe(1);

    expect(await cache?.get("users")).toEqual({
      users: ["cached"],
    });
  });

  it("should throw when network fails", async () => {
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
          strategy: "network-only",
        },

        execute: async () => {
          count++;

          throw new Error("Network failed");
        },
      });

    await expect(action()).rejects.toThrow("Network failed");

    expect(count).toBe(1);

    expect(await cache?.get("users")).toEqual({
      users: ["cached"],
    });
  });
});