import { describe, expect, it, vi } from "vitest";

import { createLayer } from "../src";
import { CacheModule } from "../src/modules/cache/CacheModule";

describe("Layer.run", () => {
  it("should execute normally without cache", async () => {
    const layer = createLayer();

    const execute = vi.fn().mockResolvedValue({
      id: 1,
    });

    const result = await layer.run({
      execute,
    });

    expect(result).toEqual({
      id: 1,
    });

    expect(execute).toHaveBeenCalledTimes(1);
  });

  it("should execute and cache on the first run", async () => {
    const layer = createLayer().use(
      CacheModule(),
    );

    const execute = vi.fn().mockResolvedValue({
      id: 1,
    });

    const result = await layer.run({
      key: "user",
      cache: {
        strategy: "cache-first",
      },
      execute,
    });

    expect(result).toEqual({
      id: 1,
    });

    expect(execute).toHaveBeenCalledTimes(1);
  });

  it("should return cached value on the second run", async () => {
    const layer = createLayer().use(
      CacheModule(),
    );

    const execute = vi.fn().mockResolvedValue({
      id: 1,
    });

    const first = await layer.run({
      key: "user",
      cache: {
        strategy: "cache-first",
      },
      execute,
    });

    const second = await layer.run({
      key: "user",
      cache: {
        strategy: "cache-first",
      },
      execute,
    });

    expect(first).toEqual({
      id: 1,
    });

    expect(second).toEqual({
      id: 1,
    });

    expect(execute).toHaveBeenCalledTimes(1);
  });

  it("should always execute with network-only", async () => {
    const layer = createLayer().use(
      CacheModule(),
    );

    const execute = vi
      .fn()
      .mockResolvedValueOnce({
        id: 1,
      })
      .mockResolvedValueOnce({
        id: 2,
      });

    const first = await layer.run({
      key: "user",
      cache: {
        strategy: "network-only",
      },
      execute,
    });

    const second = await layer.run({
      key: "user",
      cache: {
        strategy: "network-only",
      },
      execute,
    });

    expect(first).toEqual({
      id: 1,
    });

    expect(second).toEqual({
      id: 2,
    });

    expect(execute).toHaveBeenCalledTimes(2);
  });

  it("should execute again after cache expires", async () => {
    const layer = createLayer().use(
      CacheModule(),
    );

    const execute = vi
      .fn()
      .mockResolvedValueOnce({
        id: 1,
      })
      .mockResolvedValueOnce({
        id: 2,
      });

    const first = await layer.run({
      key: "user",
      cache: {
        strategy: "cache-first",
        ttl: 20,
      },
      execute,
    });

    await new Promise((resolve) =>
      setTimeout(resolve, 30),
    );

    const second = await layer.run({
      key: "user",
      cache: {
        strategy: "cache-first",
        ttl: 20,
      },
      execute,
    });

    expect(first).toEqual({
      id: 1,
    });

    expect(second).toEqual({
      id: 2,
    });

    expect(execute).toHaveBeenCalledTimes(2);
  });
});