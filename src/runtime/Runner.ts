import type { RunContext } from "../foundation/types/RunContext";
import type { LayerContext } from "../foundation/types/LayerContext";

export class Runner {
  constructor(private readonly layer: LayerContext) {}

  async run<T>(context: RunContext<T>): Promise<T> {
    const cache = this.layer.get("cache");
    const strategy = context.cache?.strategy;

    // cache-first
    if (strategy === "cache-first" && context.key && cache) {
      const cached = await cache.get<T>(context.key);

      if (cached !== undefined) {
        return cached;
      }

      const result = await context.execute();

      await cache.set(context.key, result, context.cache?.ttl);

      return result;
    }

    // network-first
    if (strategy === "network-first" && context.key && cache) {
      try {
        const result = await context.execute();

        await cache.set(context.key, result, context.cache?.ttl);

        return result;
      } catch (error) {
        const cached = await cache.get<T>(context.key);

        if (cached !== undefined) {
          return cached;
        }

        throw error;
      }
    }

    // cache-only
    if (context.cache?.strategy === "cache-only") {
      if (context.key && cache) {
        const cached = await cache.get<T>(context.key);

        if (cached !== undefined) {
          return cached;
        }

        throw new Error(`Cache miss for key: ${context.key}`);
      }

      // No cache key → fall through to normal execution
    }

    // network-only
    if (strategy === "network-only") {
      return context.execute();
    }

    // stale-while-revalidate
    if (strategy === "stale-while-revalidate" && context.key && cache) {
      const cached = await cache.get<T>(context.key);

      if (cached !== undefined) {
        void context
          .execute()
          .then(async (result) => {
            await cache.set(context.key!, result, context.cache?.ttl);
          })
          .catch(() => {
            // Background revalidation failure
            // must not affect the cached response.
          });

        return cached;
      }

      const result = await context.execute();

      await cache.set(context.key, result, context.cache?.ttl);

      return result;
    }

    // default / no cache strategy
    const result = await context.execute();

    return result;
  }
}
