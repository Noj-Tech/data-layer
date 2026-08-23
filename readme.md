# @noj-tech/data-layer

A lightweight, framework-agnostic data layer for modern JavaScript and TypeScript applications.

## Features

- Lightweight and framework-agnostic
- TypeScript-first
- Modular and extensible architecture
- Built-in caching support
- Cache-first execution strategy
- Independent from Axios, Fetch, or any specific HTTP client
- Designed for Vue, React, Nuxt, Node.js, and other JavaScript environments
- Unit tested with Vitest

## Installation

```bash
npm install @noj-tech/data-layer
```

## Basic Usage

```ts
import { createLayer } from "@noj-tech/data-layer";

const layer = createLayer();
```

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

The core does not depend on a specific framework, HTTP client, or storage solution.

## Cache

Caching is a first-class capability of the data layer.

A cache can be registered as a module:

```ts
const layer = createLayer();

layer.register("cache", cache);
```

The runner can then use the registered cache during data operations.

### Cache-First Strategy

The cache-first strategy checks the cache before executing the underlying operation.

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

This allows applications to reduce unnecessary requests and improve performance.

## Framework Agnostic

`@noj-tech/data-layer` does not depend on Vue, React, Nuxt, Axios, Fetch, or any other specific technology.

You can use any HTTP client or data source you prefer.

For example:

```ts
const api = {
  async getUsers() {
    return axios.get("/users");
  },
};
```

Or:

```ts
const api = {
  async getUsers() {
    const response = await fetch("/users");

    return response.json();
  },
};
```

The data layer manages the architecture around these operations without controlling how the actual request is performed.

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

## Example

```ts
import { createLayer } from "@noj-tech/data-layer";

const layer = createLayer();

layer.register("cache", cache);

const result = await layer.run({
  key: "users",
  execute: () => fetchUsers(),
});
```

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

## Design Goals

The main goals of `@noj-tech/data-layer` are:

1. Keep the core lightweight.
2. Remain framework-agnostic.
3. Avoid coupling data management to a specific HTTP client.
4. Make caching composable.
5. Provide a predictable and extensible API.
6. Make the package reusable across different applications and environments.

## @noj-tech Ecosystem

`@noj-tech/data-layer` is part of the `@noj-tech` package ecosystem.

Related packages can follow the same naming convention:

```text
@noj-tech/data-layer
@noj-tech/...
```

Each package should have a focused responsibility and remain independently usable whenever possible.

## License

MIT