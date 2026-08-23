import { describe, expect, it } from "vitest";

import { createLayer } from "../src";
import { Layer } from "../src/runtime/Layer";
import { CacheModule } from "../src/modules/cache/CacheModule";

describe("Layer cache", () => {
  it("should return cached value on second run", async () => {
    const layer = new Layer();

    layer.use(CacheModule());

    let count = 0;

    const action = () =>
      layer.run({
        key: "users",

        cache: {
          strategy: "cache-first",
        },

        execute: async () => {
          count++;

          return {
            users: [],
          };
        },
      });

    await action();
    await action();

    expect(count).toBe(1);
  });

  it("should not cache when execute fails", async () => {
    const layer = createLayer();

    layer.use(CacheModule());

    let count = 0;

    const action = () =>
      layer.run({
        key: "users",

        cache: {
          strategy: "cache-first",
        },

        execute: async () => {
          count++;

          throw new Error("Request failed");
        },
      });

    await expect(action()).rejects.toThrow("Request failed");
    await expect(action()).rejects.toThrow("Request failed");

    expect(count).toBe(2);
  });

  it("should execute normally when cache is not installed", async () => {
    const layer = new Layer();

    let count = 0;

    const action = () =>
      layer.run({
        key: "users",

        cache: {
          strategy: "cache-first",
        },

        execute: async () => {
          count++;

          return {
            users: [],
          };
        },
      });

    await action();
    await action();

    expect(count).toBe(2);
  });
});
