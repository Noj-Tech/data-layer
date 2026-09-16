# @noj-tech/data-layer

A lightweight, framework-agnostic data layer for modern JavaScript and TypeScript applications.

## Features

- Lightweight and framework-agnostic
- TypeScript-first
- Modular and extensible architecture
- Built-in caching support
- Multiple cache execution strategies
- Cache TTL support
- Built-in IndexedDB, LocalStorage, and Memory stores
- Independent from Axios, Fetch, or any specific HTTP client
- Supports Vue, React, Nuxt, Node.js, and other JavaScript environments
- Unit tested with Vitest

## Installation

```bash
npm install @noj-tech/data-layer
```

## Basic Usage

Create a data layer:

```ts
import { createLayer } from "@noj-tech/data-layer";

const layer = createLayer();
```

The layer can execute any asynchronous operation through the `run` API.

```ts
const result = await layer.run({
  execute: async () => {
    return fetchUsers();
  },
});
```

The data layer does not care how `fetchUsers()` is implemented.

It can use Fetch, Axios, GraphQL, WebSocket clients, database calls, or any custom data source.

---

## Default Export

The package also provides a ready-to-use default layer instance.

```ts
import layer from "@noj-tech/data-layer";

const result = await layer.run({
  execute: async () => {
    return fetchUsers();
  },
});
```

Use `createLayer()` when you need your own layer instance or custom configuration.

---

## TypeScript

`@noj-tech/data-layer` is TypeScript-first and exposes its public types from the package root.

```ts
import {
  createLayer,
  type LayerOptions,
  type LayerContext,
  type RunContext,
  type RuntimeAPI,
  type LayerModule,
  type CacheOptions,
  type CacheStore,
  type CacheStrategy,
} from "@noj-tech/data-layer";
```

This allows TypeScript applications to use the package without importing internal files.

For example:

```ts
const strategy: CacheStrategy = "cache-first";

const options: LayerOptions = {
  // ...
};
```

Custom modules can also use the public `LayerModule` type:

```ts
import type { LayerModule } from "@noj-tech/data-layer";

const myModule: LayerModule = {
  name: "my-module",

  install(context) {
    // ...
  },
};
```

Only types that are intended to be part of the public API are exported from the package root.

Internal implementation details such as the runner and registry are not part of the public API.

---

## Architecture

The package provides a small runtime for managing data-related operations.

```text
Application

    │
    ▼

┌─────────────────────┐
│     Data Layer      │
├─────────────────────┤
│       Runner        │
│      Registry       │
│      Modules        │
│       Cache         │
└─────────────────────┘

    │
    ├── API / HTTP
    ├── Cache
    ├── Storage
    └── Custom Modules
```

The core does not depend on a specific framework, HTTP client, or storage implementation.

---

## Cache

Caching is a first-class capability of the data layer.

The package provides a cache module and multiple cache stores.

The default cache store is IndexedDB.

Available stores include:

- `IndexedDBStore`
- `LocalStorageStore`
- `MemoryStore`

A cache can be accessed through the layer:

```ts
const cache = layer.get("cache");
```

The cache service provides:

```ts
await cache.set("users", users);

const users = await cache.get<User[]>("users");

await cache.remove("users");

await cache.clear();
```

---

## Cache Stores

### IndexedDBStore

`IndexedDBStore` provides persistent browser storage using IndexedDB.

It is the default storage used by the data layer.

```ts
import { IndexedDBStore } from "@noj-tech/data-layer";

const store = new IndexedDBStore();
```

### LocalStorageStore

`LocalStorageStore` uses the browser's Local Storage API.

```ts
import { LocalStorageStore } from "@noj-tech/data-layer";

const store = new LocalStorageStore();
```

### MemoryStore

`MemoryStore` keeps cached data in memory.

```ts
import { MemoryStore } from "@noj-tech/data-layer";

const store = new MemoryStore();
```

Memory storage is useful for temporary data and testing.

---

## Cache Strategies

The runner supports multiple execution strategies.

### Available Strategies

- `cache-first`
- `network-first`
- `cache-only`
- `network-only`
- `stale-while-revalidate`

---

## Cache-First

`cache-first` checks the cache before executing the underlying operation.

```text
Request

   │
   ▼

Check Cache

   │
   ├── Hit ──────► Return Cached Data
   │
   └── Miss
        │
        ▼

   Execute Operation
        │
        ▼

    Store Result
        │
        ▼

    Return Data
```

Usage:

```ts
const result = await layer.run({
  key: "users",

  cache: {
    strategy: "cache-first",
  },

  execute: () => fetchUsers(),
});
```

Behavior:

1. Check the cache.
2. If cached data exists, return it immediately.
3. If there is no cached data, execute the operation.
4. Store the result in the cache.
5. Return the result.

This strategy is useful when cached data should be preferred and network requests should only happen when necessary.

---

## Network-First

`network-first` tries the underlying operation first.

If the operation succeeds, the result is stored in the cache.

If the operation fails, the runner attempts to return cached data.

```text
Request

   │
   ▼

Execute Operation

   │
   ├── Success ─────► Store Result ─────► Return Data
   │
   └── Failure
        │
        ▼

    Check Cache

        │
        ├── Hit ─────► Return Cached Data
        │
        └── Miss ────► Throw Error
```

Usage:

```ts
const result = await layer.run({
  key: "users",

  cache: {
    strategy: "network-first",
  },

  execute: () => fetchUsers(),
});
```

Behavior:

1. Execute the operation.
2. If successful, store the result in the cache.
3. Return the fresh result.
4. If the operation fails, check the cache.
5. If cached data exists, return it.
6. If no cached data exists, rethrow the original error.

This strategy is useful when fresh data is preferred but cached data can act as a fallback.

---

## Cache-Only

`cache-only` never executes the underlying operation when a cache key and cache are available.

```text
Request

   │
   ▼

Check Cache

   │
   ├── Hit ──────► Return Cached Data
   │
   └── Miss ─────► Throw Cache Miss Error
```

Usage:

```ts
const result = await layer.run({
  key: "users",

  cache: {
    strategy: "cache-only",
  },

  execute: () => fetchUsers(),
});
```

If the cache does not contain the requested key, an error is thrown:

```text
Cache miss for key: users
```

This strategy is useful for offline-first scenarios or when network access must not be used.

---

## Network-Only

`network-only` always executes the underlying operation and does not use cached data.

```text
Request

   │
   ▼

Execute Operation

   │
   ▼

Return Result
```

Usage:

```ts
const result = await layer.run({
  key: "users",

  cache: {
    strategy: "network-only",
  },

  execute: () => fetchUsers(),
});
```

The cache is ignored.

This strategy is useful when the application always requires fresh data.

---

## Stale-While-Revalidate

`stale-while-revalidate` returns cached data immediately when available, while refreshing the data in the background.

```text
Request

   │
   ▼

Check Cache

   │
   ├── Hit
   │    │
   │    ├──► Return Cached Data
   │    │
   │    └──► Revalidate in Background
   │                 │
   │                 ▼
   │              Store Result
   │
   └── Miss
        │
        ▼

   Execute Operation
        │
        ▼

    Store Result
        │
        ▼

    Return Data
```

Usage:

```ts
const result = await layer.run({
  key: "users",

  cache: {
    strategy: "stale-while-revalidate",
  },

  execute: () => fetchUsers(),
});
```

Behavior when cached data exists:

1. Return cached data immediately.
2. Execute the operation in the background.
3. Store the fresh result in the cache.
4. A background request failure does not affect the already returned response.

When cached data does not exist:

1. Execute the operation normally.
2. Store the result.
3. Return the result.

This strategy is useful when fast responses are more important than waiting for fresh data.

---

## Cache TTL

Cache entries can optionally have a TTL.

TTL values are expressed in milliseconds.

```ts
const result = await layer.run({
  key: "users",

  cache: {
    strategy: "cache-first",
    ttl: 60_000,
  },

  execute: () => fetchUsers(),
});
```

```ts
60_000 // 60 seconds
```

The TTL is handled by the data layer's cache manager.

When an entry expires, it is treated as a cache miss and removed from the cache when accessed.

For example:

```ts
await cache.set(
  "access_token",
  token,
  7 * 24 * 60 * 60 * 1000,
);
```

An entry without a TTL does not expire automatically:

```ts
await cache.set("refresh_token", refreshToken);
```

It remains available until it is explicitly removed or the underlying storage is cleared.

---

## Custom Cache Stores

The cache system is based on the `CacheStore` interface.

```ts
import type { CacheStore } from "@noj-tech/data-layer";

const customStore: CacheStore = {
  async has(key) {
    // ...
  },

  async get(key) {
    // ...
  },

  async set(key, value) {
    // ...
  },

  async remove(key) {
    // ...
  },

  async clear() {
    // ...
  },
};
```

This allows applications to implement their own storage mechanism without changing the runner or cache architecture.

---

## Custom Modules

The package uses a modular architecture.

Custom modules can implement the public `LayerModule` interface:

```ts
import type { LayerModule } from "@noj-tech/data-layer";

const myModule: LayerModule = {
  name: "my-module",

  install(context) {
    // Register custom functionality
  },
};
```

Modules can be used to extend the data layer without coupling additional functionality to the core runtime.

Possible modules include:

- Cache
- Storage
- API clients
- Persistence
- Logging
- Authentication
- Custom functionality

---

## Complete Example

```ts
import {
  createLayer,
  type CacheStrategy,
} from "@noj-tech/data-layer";

const layer = createLayer();

const strategy: CacheStrategy = "cache-first";

const users = await layer.run({
  key: "users",

  cache: {
    strategy,
    ttl: 60_000,
  },

  execute: async () => {
    const response = await fetch("/api/users");

    if (!response.ok) {
      throw new Error("Failed to fetch users");
    }

    return response.json();
  },
});
```

The first request executes the underlying operation and stores the result.

Subsequent requests can return the cached result according to the selected strategy.

---

## Framework Agnostic

`@noj-tech/data-layer` does not depend on Vue, React, Nuxt, Axios, Fetch, or any other specific technology.

You can use any HTTP client or data source you prefer.

### Fetch

```ts
const api = {
  async getUsers() {
    const response = await fetch("/users");
    return response.json();
  },
};
```

### Axios

```ts
const api = {
  async getUsers() {
    const response = await axios.get("/users");
    return response.data;
  },
};
```

The data layer manages the execution and caching architecture without controlling how the actual request is performed.

---

## Extensibility

The architecture is based on modules and registries, allowing additional capabilities to be added without tightly coupling them to the core.

The core remains intentionally small while applications can add only the functionality they need.

---

## Testing

The project uses Vitest for unit testing.

Run the test suite:

```bash
npm test
```

Or:

```bash
npx vitest
```

Run tests in watch mode:

```bash
npm run test:watch
```

---

## Development

Clone the repository:

```bash
git clone https://github.com/Noj-Tech/data-layer.git
```

Install dependencies:

```bash
npm install
```

Run tests:

```bash
npm test
```

Build the package:

```bash
npm run build
```

---

## Design Goals

The main goals of `@noj-tech/data-layer` are:

1. Keep the core lightweight.
2. Remain framework-agnostic.
3. Avoid coupling data management to a specific HTTP client.
4. Make caching composable.
5. Provide predictable execution strategies.
6. Provide a modular and extensible architecture.
7. Support multiple storage implementations.
8. Provide a TypeScript-friendly public API.
9. Make the package reusable across different applications and environments.

---

## @noj-tech Ecosystem

`@noj-tech/data-layer` is part of the `@noj-tech` package ecosystem.

Related packages can follow the same naming convention:

```text
@noj-tech/data-layer

@noj-tech/...
```

Each package should have a focused responsibility and remain independently usable whenever possible.

---

## License

MIT