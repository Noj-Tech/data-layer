import { describe, expect, it, vi } from "vitest";

import { MemoryStore } from "../src/foundation/cache/stores/MemoryStore";
import { CacheManager } from "../src/modules/cache/CacheManager";

describe("CacheManager", () => {
  it("should return undefined after TTL expires", async () => {
    vi.useFakeTimers();

    try {
      vi.setSystemTime(new Date("2026-01-01T00:00:00.000Z"));

      const cache = new CacheManager(new MemoryStore());

      await cache.set(
        "user",
        {
          id: 1,
        },
        1000,
      );

      expect(await cache.get("user")).toEqual({
        id: 1,
      });

      vi.setSystemTime(new Date("2026-01-01T00:00:01.001Z"));

      expect(await cache.get("user")).toBeUndefined();
    } finally {
      vi.useRealTimers();
    }
  });
});
