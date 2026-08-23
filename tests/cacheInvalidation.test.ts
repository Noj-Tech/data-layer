import { describe, expect, it } from "vitest";

import { createLayer } from "../src";
import { CacheModule } from "../src/modules/cache/CacheModule";

describe("Layer cache invalidation", () => {
  it("should execute again after cache is removed", async () => {
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

          return {
            users: [],
          };
        },
      });

    await action();

    expect(count).toBe(1);

    await action();

    expect(count).toBe(1);

    const cache = layer.get("cache");

    await cache?.remove("users");

    await action();

    expect(count).toBe(2);
  });

  it("should execute again after cache is cleared", async () => {
    const layer = createLayer();

    layer.use(CacheModule());

    let count = 0;

    const action = (key: string) =>
      layer.run({
        key,

        cache: {
          strategy: "cache-first",
        },

        execute: async () => {
          count++;

          return key;
        },
      });

    await action("users");
    await action("posts");

    expect(count).toBe(2);

    await action("users");
    await action("posts");

    expect(count).toBe(2);

    const cache = layer.get("cache");

    await cache?.clear();

    await action("users");
    await action("posts");

    expect(count).toBe(4);
  });
});
