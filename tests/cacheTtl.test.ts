// tests/cacheTtl.test.ts

import { describe, expect, it, vi } from "vitest";

import { createLayer } from "../src";
import { CacheModule } from "../src/modules/cache/CacheModule";

describe("Layer cache TTL", () => {
  it("should execute again after cache expires", async () => {
    vi.useFakeTimers();

    try {
      const layer = createLayer();

      layer.use(CacheModule());

      let count = 0;

      const action = () =>
        layer.run({
          key: "users",

          cache: {
            strategy: "cache-first",
            ttl: 1000,
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

      vi.advanceTimersByTime(1001);

      await action();

      expect(count).toBe(2);
    } finally {
      vi.useRealTimers();
    }
  });
});