import { describe, expect, it, vi } from "vitest";

import { createLayer } from "../src";
import { CacheModule } from "../src/modules/cache/CacheModule";

describe("Layer stale-while-revalidate", () => {
  it("should return cached value immediately and revalidate in background", async () => {
    const layer = createLayer().use(
      CacheModule(),
    );

    const execute = vi
      .fn()
      .mockResolvedValueOnce({
        id: 1,
        name: "Ali",
      })
      .mockResolvedValueOnce({
        id: 2,
        name: "Reza",
      });

    // First request populates the cache.
    const first = await layer.run({
      key: "user",
      cache: {
        strategy: "stale-while-revalidate",
      },
      execute,
    });

    expect(first).toEqual({
      id: 1,
      name: "Ali",
    });

    // Second request should return the old cache.
    const second = await layer.run({
      key: "user",
      cache: {
        strategy: "stale-while-revalidate",
      },
      execute,
    });

    expect(second).toEqual({
      id: 1,
      name: "Ali",
    });

    expect(execute).toHaveBeenCalledTimes(2);

    // Wait for background revalidation.
    await vi.waitFor(async () => {
      const third = await layer.run({
        key: "user",
        cache: {
          strategy: "cache-first",
        },
        execute,
      });

      expect(third).toEqual({
        id: 2,
        name: "Reza",
      });
    });
  });

  it("should keep cached value when background revalidation fails", async () => {
    const layer = createLayer().use(
      CacheModule(),
    );

    const execute = vi
      .fn()
      .mockResolvedValueOnce({
        id: 1,
        name: "Ali",
      })
      .mockRejectedValueOnce(
        new Error("Network error"),
      );

    const first = await layer.run({
      key: "user",
      cache: {
        strategy: "stale-while-revalidate",
      },
      execute,
    });

    expect(first).toEqual({
      id: 1,
      name: "Ali",
    });

    const second = await layer.run({
      key: "user",
      cache: {
        strategy: "stale-while-revalidate",
      },
      execute,
    });

    expect(second).toEqual({
      id: 1,
      name: "Ali",
    });

    expect(execute).toHaveBeenCalledTimes(2);

    // Give the background promise time to settle.
    await new Promise((resolve) =>
      setTimeout(resolve, 0),
    );

    const cached = await layer.run({
      key: "user",
      cache: {
        strategy: "cache-first",
      },
      execute,
    });

    expect(cached).toEqual({
      id: 1,
      name: "Ali",
    });
  });

  it("should execute normally when cache is empty", async () => {
    const layer = createLayer().use(
      CacheModule(),
    );

    const execute = vi.fn().mockResolvedValue({
      id: 1,
      name: "Ali",
    });

    const result = await layer.run({
      key: "user",
      cache: {
        strategy: "stale-while-revalidate",
      },
      execute,
    });

    expect(result).toEqual({
      id: 1,
      name: "Ali",
    });

    expect(execute).toHaveBeenCalledTimes(1);
  });
});