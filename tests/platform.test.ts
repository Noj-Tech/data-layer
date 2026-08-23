import { describe, expect, it } from "vitest";

import { createLayer } from "../src";

describe("Layer", () => {
  it("should execute operation", async () => {
    const layer = createLayer();

    const result = await layer.run({
      execute: async () => {
        return "Hello";
      },
    });

    expect(result).toBe("Hello");
  });

  it("should register module", () => {
    const layer = createLayer();

    layer.use({
      name: "cache",

      install() {},
    });

    expect(layer.has("cache")).toBe(true);
  });

  it("should have cache module by default", () => {
    const layer = createLayer();

    expect(layer.has("cache")).toBe(true);
  });

  it("should execute async operation", async () => {
    const layer = createLayer();

    const result = await layer.run({
      execute: async () => {
        await new Promise((resolve) => setTimeout(resolve, 10));

        return 100;
      },
    });

    expect(result).toBe(100);
  });
  it("should return cached value on second request", async () => {
  // ...
});
});
