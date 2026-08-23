import { describe, expect, it } from "vitest";

import layer, {
  createLayer,
  CacheModule,
  MemoryStore,
  IndexedDBStore,
} from "../src";

describe("Public API", () => {
  it("should expose the layer factory", () => {
    expect(createLayer).toBeTypeOf("function");
  });

  it("should expose the default layer", () => {
    expect(layer).toBeDefined();
    expect(layer.run).toBeTypeOf("function");
  });

  it("should expose CacheModule", () => {
    expect(CacheModule).toBeTypeOf("function");
  });

  it("should expose MemoryStore", () => {
    expect(MemoryStore).toBeTypeOf("function");
  });

  it("should expose IndexedDBStore", () => {
    expect(IndexedDBStore).toBeTypeOf("function");
  });
});