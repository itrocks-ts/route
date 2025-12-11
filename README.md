[![npm version](https://img.shields.io/npm/v/@itrocks/route?logo=npm)](https://www.npmjs.org/package/@itrocks/route)
[![npm downloads](https://img.shields.io/npm/dm/@itrocks/route)](https://www.npmjs.org/package/@itrocks/route)
[![GitHub](https://img.shields.io/github/last-commit/itrocks-ts/route?color=2dba4e&label=commit&logo=github)](https://github.com/itrocks-ts/route)
[![issues](https://img.shields.io/github/issues/itrocks-ts/route)](https://github.com/itrocks-ts/route/issues)
[![discord](https://img.shields.io/discord/1314141024020467782?color=7289da&label=discord&logo=discord&logoColor=white)](https://25.re/ditr)

# route

Domain-driven route manager with automatic generation, decorators, and static routes.

*This documentation was written by an artificial intelligence and may contain errors or approximations.
It has not yet been fully reviewed by a human. If anything seems unclear or incomplete,
please feel free to contact the author of this package.*

## Installation

```bash
npm i @itrocks/route
```

## Usage

`@itrocks/route` centralises how routes are declared and resolved in an
it.rocks application. It gives you:

- a `@Route()` decorator to attach a route path to a class or action,
- helpers like `routeOf()` to compute routes from classes instead of
  hard-coding strings,
- a `Routes` tree that can be populated from a static configuration via
  `loadRoutes()`.

You typically combine it with
[@itrocks/action](https://github.com/itrocks-ts/action) and
[@itrocks/framework](https://github.com/itrocks-ts/framework): actions
are decorated with `@Route()`, and the framework uses `routeOf()` and
the route tree to generate navigation, breadcrumbs, links, etc.

### Minimal example with the `@Route` decorator

```ts
import { Action } from '@itrocks/action'
import { Route } from '@itrocks/route'
import type { Request } from '@itrocks/action-request'

@Route('/users')
export class ListUsers extends Action<object> {
  async html (request: Request<object>) {
    // build and return an HtmlResponse
  }
}
```

The `@Route('/users')` decorator registers the `ListUsers` action as the
handler for the `/users` route in the global route tree.

### Building links with `routeOf`

Instead of writing `'/users'` everywhere, you can ask `@itrocks/route`
for the current path associated with a class or object:

```ts
import { routeOf } from '@itrocks/route'
import { ListUsers } from './actions/list-users.js'

const url = routeOf(ListUsers)
// url === '/users' (with the example above)
```

If your type exposes multiple actions (for example `list`, `edit`,
`delete`), you can pass the action name as a second parameter:

```ts
const editUrl = routeOf(ListUsers, 'edit')
```

This keeps your navigation resilient to route refactors: change the
`@Route()` declaration, and all links built via `routeOf()` will pick it
up automatically.

### Loading static routes from a configuration

In addition to decorators, you can register routes from a static
configuration (for example JSON or YAML parsed as a plain object)
through `loadRoutes()`:

```ts
import { loadRoutes, routes } from '@itrocks/route'

// For example loaded from a YAML or JSON file
const config = {
  '/':        './actions/Home.js',
  '/users':   './actions/ListUsers.js',
  '/users/*': './actions/UserRouter.js'
}

await loadRoutes(routes, config)

// The global `routes` tree can now resolve these destinations
```

Each destination is a string that will later be resolved to a function
or class (typically an action) when the route is invoked.

## API

`@itrocks/route` exposes the following public elements from its ESM
entry point (`esm/route.d.ts`):

- `Route` – class decorator for associating a route with an action or
  type.
- `routeOf` – helper to compute the route path of a target.
- `routeDependsOn` – configures how `routeOf` derives its value.
- `Destination`, `isDestination`, `resolveDestination` – low-level
  helpers for destinations.
- `RouteTree`, `Routes`, `routes` – in-memory tree structure for all
  routes.
- `loadRoutes(routes, config)` – helper to populate a `Routes` instance
  from a static configuration object.

### `Route(route: string)` decorator

```ts
import { Route } from '@itrocks/route'

@Route('/orders')
class ListOrders {
  // ...
}
```

Applies a route path (for example `'/orders'`) to a class or action.
This metadata is picked up by the framework and by `routeOf()` when
resolving the URL to use.

Typical use cases:

- declaring routes directly on actions or controllers,
- keeping route declaration close to the code that handles it.

### `routeOf(target, action?)`

```ts
import { routeOf } from '@itrocks/route'

const listRoute = routeOf(ListUsers)
const editRoute = routeOf(ListUsers, 'edit')
```

Returns the route string previously assigned to the target by
`@Route()` (and, optionally, by additional conventions for the
specified `action`).

`target` can be either:

- a class (constructor),
- an instance of a class.

This is particularly convenient in templates or navigation builders
where you only know the type you want to link to.

### `routeDependsOn(dependencies)`

```ts
import { routeDependsOn } from '@itrocks/route'

routeDependsOn({
  calculate (target) {
    // return a string key that influences how routeOf() resolves
    return target.constructor.name
  }
})
```

Configures additional dependencies for route calculation. The
`calculate` callback receives the target and returns a string used as a
key when computing routes. This is an advanced feature used by higher
level frameworks to make `routeOf()` sensitive to context (for example
tenant, locale, or module).

### `type Destination = string`

Represents the "destination" of a route: a string describing where the
route should lead. In most applications this is a module path that will
be `require()`-d or `import()`-ed and then resolved to a function or
class.

You usually do not construct `Destination` values directly; instead, you
use them via `loadRoutes()` and the `Routes` API.

### `isDestination(value): value is Destination`

```ts
import { isDestination } from '@itrocks/route'

if (isDestination(value)) {
  // value is a string destination describing a target module/action
}
```

Runtime type guard to check whether a value is a valid `Destination`.
Mostly useful when walking a `RouteTree` structure.

### `resolveDestination(destination: Destination)`

```ts
import { resolveDestination } from '@itrocks/route'

const Target = resolveDestination('./actions/ListUsers.js')
// Target is the default export or first function/class-like export of the module
```

Loads the module referenced by the destination string and returns the
associated function or type. This is used internally by the routing
system when handling a request, but it can also be used directly if you
need to resolve a destination yourself.

### `type RouteTree`

```ts
import type { RouteTree } from '@itrocks/route'

const tree: RouteTree = {
  users: {
    '.': './actions/ListUsers.js',
    '*': './actions/UserRouter.js'
  }
}
```

Represents the internal tree structure used to store named routes.
Leaves of the tree are `Destination` strings; intermediate nodes are
nested `RouteTree` objects.

You normally do not build a `RouteTree` manually; instead, you interact
with the higher-level `Routes` class.

### `class Routes`

```ts
import { Routes } from '@itrocks/route'

const myRoutes = new Routes()
myRoutes.add('/users', './actions/ListUsers.js')
```

In-memory storage and helper methods for a set of routes.

#### Properties

- `routes: RouteTree` – underlying tree structure where routes are
  stored.

#### Methods

- `add(path: string, destination: Destination): void` – registers a
  route path and its destination.
- `destination(route: string): Destination | undefined` – looks up the
  raw `Destination` string for a given route.
- `resolve(route: string): Function | Type | undefined` – resolves the
  route to the actual function or type using `resolveDestination()`.
- `simplify(): void` – normalises the internal `RouteTree` (for
  example merging trivial branches). Mainly used internally.
- `summarize(route: string): string` – returns a human-readable summary
  for a route (for example for debugging or admin UIs).

### `routes: Routes`

```ts
import { routes } from '@itrocks/route'

routes.add('/users', './actions/ListUsers.js')
```

Singleton `Routes` instance used as the global route tree in most
applications. `loadRoutes()` populates this instance by default.

### `loadRoutes(routes, config)`

```ts
import { loadRoutes, routes } from '@itrocks/route'

const config = {
  '/':      './actions/Home.js',
  '/users': './actions/ListUsers.js'
}

await loadRoutes(routes, config)
```

Populates a `Routes` instance from a plain configuration object.

Parameters:

- `routes: Routes` – the `Routes` instance to mutate.
- `config: Record<string, string>` – mapping of path → destination
  (typically produced by parsing a YAML or JSON file).

This is the primary entry point when integrating static route
definitions into an it.rocks application at bootstrap time.

## Typical use cases

- Declare routes close to your action classes using the `@Route`
  decorator.
- Generate URLs from types using `routeOf()` instead of hard-coding
  paths in templates and code.
- Load a full route map from a YAML/JSON configuration into the global
  `routes` tree via `loadRoutes()`.
- Build admin/debug screens that inspect the `Routes` tree and summarise
  or resolve destinations.
