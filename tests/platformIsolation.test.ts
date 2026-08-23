import { describe, expect, it } from "vitest";

import { createLayer } from "../src";
import { CacheModule } from "../src/modules/cache/CacheModule";

import type { CacheService } from "../src/foundation/services/CacheService";

describe("Layer isolation", () => {
  it("should keep cache isolated between layer instances", async () => {
    const LayerA = createLayer();
    const LayerB = createLayer();

    LayerA.use(CacheModule());
    LayerB.use(CacheModule());

    const cacheA = LayerA.get<CacheService>("cache");
    const cacheB = LayerB.get<CacheService>("cache");

    await cacheA?.set("users", {
      users: ["A"],
    });

    expect(await cacheA?.get("users")).toEqual({
      users: ["A"],
    });

    expect(await cacheB?.get("users")).toBeUndefined();
  });
});