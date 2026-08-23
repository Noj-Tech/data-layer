دقیقاً. همین راه درستشه. کل README داخل **چهار بک‌تیک** و کدبلاک‌های داخلی با **سه بک‌تیک**.

این‌بار هم README رو کامل‌تر می‌کنیم و **هر ۵ استراتژی فعلی** رو توضیح می‌دیم: `cache-first`، `network-first`، `cache-only`، `network-only` و `stale-while-revalidate`، به‌همراه usage واقعی `layer.run`.

````
# @noj-tech/data-layer

A lightweight, framework-agnostic data layer for modern JavaScript and TypeScript applications.

## Features

- Lightweight and framework-agnostic
- TypeScript-first
- Modular and extensible architecture
- Built-in caching support
- Multiple cache execution strategies
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

A cache store can be registered on the layer:

```ts
const layer = createLayer();

layer.register("cache", cache);
```

The registered cache is then available to the runner during data operations.

A cache store implements the following interface:

```ts
export interface CacheStore {
  has(key: string): Promise<boolean>;

  get<T>(key: string): Promise<T | undefined>;

  set<T>(key: string, value: T): Promise<void>;

  remove(key: string): Promise<boolean>;

  clear(): Promise<void>;
}
```

The package currently includes cache stores such as:

- MemoryStore
- LocalStorageStore
- IndexedDBStore

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
   │             │
   │             ▼
   │          Store Result
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
4. The background request does not affect the already returned response if it fails.

When cached data does not exist:

1. Execute the operation normally.
2. Store the result.
3. Return the result.

This strategy is useful when fast responses are more important than waiting for fresh data.

---

## Cache TTL

The execution context can optionally provide a TTL value for cache implementations that support expiration.

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

The TTL value is expressed in milliseconds.

```ts
60_000 // 60 seconds
```

The cache store is responsible for deciding how TTL is handled.

---

## Complete Example

```ts
import {
  createLayer,
  MemoryStore,
} from "@noj-tech/data-layer";

const layer = createLayer();

const cache = new MemoryStore();

layer.register("cache", cache);

const users = await layer.run({
  key: "users",
  cache: {
    strategy: "cache-first",
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

The first request executes the network operation and stores the result.

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

Possible modules include:

- Cache
- Storage
- API clients
- Persistence
- Logging
- Authentication
- Custom execution strategies

The core remains intentionally small while applications can add only the functionality they need.

---

## Example

```ts
import { createLayer } from "@noj-tech/data-layer";

const layer = createLayer();

layer.register("cache", cache);

const result = await layer.run({
  key: "users",
  cache: {
    strategy: "cache-first",
  },
  execute: () => fetchUsers(),
});
```

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
7. Make the package reusable across different applications and environments.

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
````
