import { describe, expect, it } from "vitest";

import { CacheModule } from "../src/modules/cache/CacheModule";
import { CacheManager } from "../src/modules/cache/CacheManager";
import { MemoryStore } from "../src/foundation/cache/stores/MemoryStore";
import { createLayer } from "../src";

describe("CacheModule", () => {
  it("should use the provided store", async () => {
    const layer = createLayer();

    const store = new MemoryStore();

    layer.use(
      CacheModule({
        store,
      }),
    );

    const cache = layer.get<CacheManager>("cache");

    expect(cache).toBeDefined();

    cache?.set("user", {
      id: 1,
    });

    expect(await store.get("user")).toEqual({
      value: {
        id: 1,
      },
      createdAt: expect.any(Number),
      expiresAt: undefined,
    });
  });
});
