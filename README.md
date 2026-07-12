# SE2 — Order Management API

A TypeScript/Express backend built as coursework for **SE2 (Software Engineering 2)**, used as a hands-on playground for **SOLID principles**, classic **GoF design patterns**, and **layered architecture** in a real HTTP service. The domain is an order-management system for a multi-category store (cakes, books, toys) with pluggable storage backends.

> **Work in progress.** This is a learning project and is still being actively implemented — expect gaps between what's modeled and what's exposed over HTTP. See [Known Limitations](#known-limitations--roadmap) for current gaps and [Next Steps](#next-steps) for what's planned.

## Table of Contents

- [Why this project exists](#why-this-project-exists)
- [Tech stack](#tech-stack)
- [Architecture](#architecture)
- [Design patterns in use](#design-patterns-in-use)
- [Project layout](#project-layout)
- [Getting started](#getting-started)
- [Configuration](#configuration)
- [API reference](#api-reference)
- [Error handling](#error-handling)
- [Logging](#logging)
- [Testing](#testing)
- [Known limitations / roadmap](#known-limitations--roadmap)

## Why this project exists

This repo is where I'm learning to apply object-oriented design principles instead of just writing code that works. Every layer exists to demonstrate a specific idea:

- **Single Responsibility** — controllers only translate HTTP ↔ domain objects, services hold business rules, repositories hold persistence.
- **Open/Closed** — adding a new item category (say, `toy`) means adding a new model/builder/validator/mapper/repository, not editing existing ones.
- **Liskov Substitution** — every storage backend (Postgres, SQLite, flat files) implements the same `IRepository<T>` contract and is interchangeable.
- **Interface Segregation** — small, focused interfaces (`IItem`, `IOrder`, `ID`, `Initializable`) instead of one bloated contract.
- **Dependency Inversion** — services and controllers depend on interfaces (`IRepository`, `IMapper`) resolved through factories, never on concrete DB clients directly.

## Tech stack

| Layer                  | Choice                                                           |
| ---------------------- | ---------------------------------------------------------------- |
| Language               | TypeScript (strict mode)                                         |
| Runtime                | Node.js                                                          |
| HTTP framework         | Express 5                                                        |
| Primary database       | PostgreSQL (`pg`)                                                |
| Secondary database     | SQLite (`sqlite` / `sqlite3`) — cake orders only                 |
| File formats supported | CSV (`csv-parse`/`csv-stringify`), JSON, XML (`fast-xml-parser`) |
| Logging                | Winston (file + console transports, request logging middleware)  |
| Security middleware    | Helmet, CORS                                                     |
| Validation             | Hand-rolled per-model validators                                 |
| Testing                | Jest + ts-jest                                                   |
| Linting/formatting     | ESLint (flat config, typescript-eslint) + Prettier               |
| API spec               | OpenAPI 3.0 (`swaggercrud.yaml`, `swagger.yaml`)                 |

## Architecture

Requests flow through a strict layered pipeline:

```
HTTP request
   │
   ▼
routes/            (Express routers — wire URLs to controller methods)
   │
   ▼
controllers/        (parse & validate HTTP input, map to domain objects, shape HTTP responses)
   │
   ▼
services/            (business rules: create/update/delete/list orders, analytics aggregation)
   │
   ▼
RepositoryFactory     (picks a concrete repository per DBMode + ItemCategory)
   │
   ▼
repository/*          (Postgres / SQLite implementations of IRepository<T>)
   │
   ▼
mappers/*             (translate between DB rows / request bodies / files and domain models)
```

### Order/Item composition

An **Order** is deliberately decoupled from what's being ordered. `Order` holds `id`, `price`, `quantity`, and an `IItem`; the concrete item (`Cake`, `Book`, `Toy`) is a separate hierarchy that only knows its own fields plus `getCategory()`. This means the order domain never needs to change when a new product type is added — see [src/model/Order.model.ts](src/model/Order.model.ts) and [src/model/IItem.ts](src/model/IItem.ts).

Persistence mirrors this split: the `orders` table stores order-level fields plus a foreign `item_id` + `item_category`, while each category (`cake`, `book`, `toy`) gets its own table. `OrderRepository` composes an injected item-specific repository (`CakeRepository`, `BookRepository`, `ToyRepository`) to assemble the full object graph on read/write — see [src/repository/postgresql/Order.repository.ts](src/repository/postgresql/Order.repository.ts).

## Design patterns in use

| Pattern                                | Where                                                                                                                                                 | Purpose                                                                                                                                                                                                                                                        |
| -------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Builder**                            | [src/model/builders/](src/model/builders/) (`CakeBuilder`, `OrderBuilder`, `BookBuilder`, `ToyBuilder`)                                               | Construct complex, many-field domain objects step by step; runs the matching validator before `build()` returns.                                                                                                                                               |
| **Factory Method**                     | [RepositoryFactory](src/repository/Repository.factory.ts), [MapperFactory](src/mappers/Mapper.factory.ts), [JsonRequestFactory](src/mappers/index.ts) | Select a concrete implementation (DB backend, mapper) at runtime based on config/category, hiding construction details from callers.                                                                                                                           |
| **Repository**                         | [src/repository/](src/repository/)                                                                                                                    | Abstracts persistence behind `IRepository<T>` so services never talk SQL.                                                                                                                                                                                      |
| ** Mapper**                            | [src/mappers/](src/mappers/)                                                                                                                          | Translate between external shapes (Postgres rows, JSON request bodies, CSV/XML files) and internal domain models, each via `IMapper<Input, Output>`.                                                                                                           |
| **Strategy**                           | Per-category validators ([src/model/validators/](src/model/validators/)) and mappers                                                                  | Swap validation/mapping behavior per item category without branching in the caller.                                                                                                                                                                            |
| **Dependency Injection (constructor)** | `OrderController(orderService)`, `OrderRepository(itemRepository)`                                                                                    | Dependencies passed in rather than instantiated internally, keeping units testable and substitutable.                                                                                                                                                          |
| **Middleware / Decorator**             | [asyncHandler](src/middleware/asyncHandler.ts), [requestLogger](src/middleware/requestLogger.ts)                                                      | Wrap route handlers to add cross-cutting behavior (error forwarding, timing/logging) without touching handler logic.                                                                                                                                           |
| **Custom exception hierarchy**         | [src/util/exceptions/](src/util/exceptions/)                                                                                                          | `HttpException` subclasses (`BadRequestException`, `NotFoundException`) carry a status code to a single Express error handler; repository-layer exceptions (`ItemNotFoundException`, `DbException`, `InitializationException`) are translated at the boundary. |

## Project layout

```
src/
├── app.ts                    # Express app: middleware, routes, error handler
├── index.ts                  # Standalone SOLID-principles demo (OrderManagement, Validator strategy chain)
├── config/                   # Environment-driven config (port, host, DB mode, log dir)
├── controllers/               # HTTP-facing request/response handling
├── routes/                    # Express routers
├── services/                  # Business logic (OrderManagementService, OrderAnalyticsService)
├── model/                     # Domain entities, builders, and validators
│   ├── builders/
│   └── validators/
├── mappers/                    # IMapper<In, Out> implementations per format/category
├── repository/                 # IRepository<T> + Postgres/SQLite implementations
│   ├── postgresql/
│   └── sqlite/
├── parsers/                    # Raw CSV/JSON/XML file readers
├── middleware/                  # asyncHandler, requestLogger
└── util/                        # logger, exceptions, repo lookup helper

tests/                          # Jest test suites (mirrors src/ structure)
swagger.yaml                    # OpenAPI spec — analytics endpoints (planned)
swaggercrud.yaml                # OpenAPI spec — order CRUD endpoints (implemented)
```

## Getting started

### Prerequisites

- Node.js 20+
- A reachable PostgreSQL database (default `dbMode`, see [Configuration](#configuration))

### Install

```bash
npm install
```

### Configure environment

Create a `.env` file in the project root:

```env
NODE_ENV=development
DATABASE_URL=postgres://<user>:<password>@<host>:<port>/<database>
PORT=3000
HOST=localhost
LOG_DIR=./logs
```

### Run in development (hot reload)

```bash
npm run dev
```

### Build & run for production

```bash
npm run build   # lints, cleans build/, compiles TypeScript
npm start        # runs build/index.js
```

The server prints `Server is running on http://<host>:<port>` once started (default `http://localhost:3000`).

## Configuration

All runtime config lives in [src/config/index.ts](src/config/index.ts), sourced from environment variables via `dotenv`:

| Variable       | Default     | Purpose                                                             |
| -------------- | ----------- | ------------------------------------------------------------------- |
| `PORT`         | `3000`      | HTTP port                                                           |
| `HOST`         | `localhost` | Bind address                                                        |
| `NODE_ENV`     | —           | `development` enables verbose console logging                       |
| `LOG_DIR`      | `./logs`    | Winston log file directory                                          |
| `DATABASE_URL` | —           | PostgreSQL connection string (required when `dbMode` is `POSTGRES`) |

Storage backend is selected in code via `DBMode` ([src/config/types.ts](src/config/types.ts)):

- `DBMode.POSTGRES` (current default) — full support for cake, book, and toy orders.
- `DBMode.SQLITE` — cake orders only.
- `DBMode.FILE` — deprecated, throws at runtime.

## API reference

Base URL: `http://localhost:3000`

Full OpenAPI 3.0 spec for the implemented endpoints: [swaggercrud.yaml](swaggercrud.yaml).

| Method   | Path          | Description                                |
| -------- | ------------- | ------------------------------------------ |
| `GET`    | `/`           | Health/hello check                         |
| `GET`    | `/orders`     | List all orders across every item category |
| `POST`   | `/orders`     | Create a new order                         |
| `GET`    | `/orders/:id` | Fetch a single order by id                 |
| `PUT`    | `/orders/:id` | Update an existing order                   |
| `DELETE` | `/orders/:id` | Delete an order                            |

### Create an order — example payload

```json
POST /orders
Content-Type: application/json

{
  "price": 45.99,
  "quantity": 2,
  "item": {
    "category": "cake",
    "type": "Birthday",
    "flavor": "Chocolate",
    "filling": "Cream",
    "size": 10,
    "layers": 2,
    "frostingType": "Buttercream",
    "frostingFlavor": "Vanilla",
    "decorationType": "Sprinkles",
    "decorationColor": "Red",
    "customMessage": "Happy Birthday!",
    "shape": "Round",
    "allergies": "None",
    "specialIngredients": "None",
    "packagingType": "Box"
  }
}
```

Response: `201 Created` with the persisted order, including a generated `id`.

> Only `category: "cake"` is currently accepted by `POST`/`PUT /orders` — see [Known Limitations](#known-limitations--roadmap).

## Error handling

All handlers are wrapped in [asyncHandler](src/middleware/asyncHandler.ts), forwarding rejected promises to a single centralized error middleware in [src/app.ts](src/app.ts):

- Errors extending `HttpException` (`BadRequestException` → 400, `NotFoundException` → 404) return their status code and message as `{ "error": "..." }`.
- Anything else is logged and returned as a generic `500 { "error": "Internal Server Error" }`, so internals never leak to clients.
- Unmatched routes return `404 { "error": "Not Found" }`.

## Logging# SE2 — Order Management API

A TypeScript/Express backend built as coursework for **SE2 (Software Engineering 2)**, used as a hands-on playground for **SOLID principles**, classic **GoF design patterns**, and **layered architecture** in a real HTTP service. The domain is an order-management system for a multi-category store (cakes, books, toys) with pluggable storage backends.

> **Work in progress.** This is a learning project and is still being actively implemented — expect gaps between what's modeled and what's exposed over HTTP. See [Known Limitations](#known-limitations--roadmap) for current gaps and [Next Steps](#next-steps) for what's planned.

## Table of Contents

- [Why this project exists](#why-this-project-exists)
- [Tech stack](#tech-stack)
- [Architecture](#architecture)
- [Design patterns in use](#design-patterns-in-use)
- [Project layout](#project-layout)
- [Getting started](#getting-started)
- [Configuration](#configuration)
- [API reference](#api-reference)
- [Error handling](#error-handling)
- [Logging](#logging)
- [Testing](#testing)
- [Known limitations / roadmap](#known-limitations--roadmap)

## Why this project exists

This repo is where I'm learning to apply object-oriented design principles instead of just writing code that works. Every layer exists to demonstrate a specific idea:

- **Single Responsibility** — controllers only translate HTTP ↔ domain objects, services hold business rules, repositories hold persistence.
- **Open/Closed** — adding a new item category (say, `toy`) means adding a new model/builder/validator/mapper/repository, not editing existing ones.
- **Liskov Substitution** — every storage backend (Postgres, SQLite, flat files) implements the same `IRepository<T>` contract and is interchangeable.
- **Interface Segregation** — small, focused interfaces (`IItem`, `IOrder`, `ID`, `Initializable`) instead of one bloated contract.
- **Dependency Inversion** — services and controllers depend on interfaces (`IRepository`, `IMapper`) resolved through factories, never on concrete DB clients directly.

## Tech stack

| Layer                  | Choice                                                           |
| ---------------------- | ---------------------------------------------------------------- |
| Language               | TypeScript (strict mode)                                         |
| Runtime                | Node.js                                                          |
| HTTP framework         | Express 5                                                        |
| Primary database       | PostgreSQL (`pg`)                                                |
| Secondary database     | SQLite (`sqlite` / `sqlite3`) — cake orders only                 |
| File formats supported | CSV (`csv-parse`/`csv-stringify`), JSON, XML (`fast-xml-parser`) |
| Logging                | Winston (file + console transports, request logging middleware)  |
| Security middleware    | Helmet, CORS                                                     |
| Validation             | Hand-rolled per-model validators                                 |
| Testing                | Jest + ts-jest                                                   |
| Linting/formatting     | ESLint (flat config, typescript-eslint) + Prettier               |
| API spec               | OpenAPI 3.0 (`swaggercrud.yaml`, `swagger.yaml`)                 |

## Architecture

Requests flow through a strict layered pipeline:

```
HTTP request
   │
   ▼
routes/            (Express routers — wire URLs to controller methods)
   │
   ▼
controllers/        (parse & validate HTTP input, map to domain objects, shape HTTP responses)
   │
   ▼
services/            (business rules: create/update/delete/list orders, analytics aggregation)
   │
   ▼
RepositoryFactory     (picks a concrete repository per DBMode + ItemCategory)
   │
   ▼
repository/*          (Postgres / SQLite implementations of IRepository<T>)
   │
   ▼
mappers/*             (translate between DB rows / request bodies / files and domain models)
```

Cross-cutting concerns (Helmet, CORS, body parsing, request logging, centralized error handling) are wired once in [src/app.ts](src/app.ts).

### Order/Item composition

An **Order** is deliberately decoupled from what's being ordered. `Order` holds `id`, `price`, `quantity`, and an `IItem`; the concrete item (`Cake`, `Book`, `Toy`) is a separate hierarchy that only knows its own fields plus `getCategory()`. This means the order domain never needs to change when a new product type is added — see [src/model/Order.model.ts](src/model/Order.model.ts) and [src/model/IItem.ts](src/model/IItem.ts).

Persistence mirrors this split: the `orders` table stores order-level fields plus a foreign `item_id` + `item_category`, while each category (`cake`, `book`, `toy`) gets its own table. `OrderRepository` composes an injected item-specific repository (`CakeRepository`, `BookRepository`, `ToyRepository`) to assemble the full object graph on read/write — see [src/repository/postgresql/Order.repository.ts](src/repository/postgresql/Order.repository.ts).

## Design patterns in use

| Pattern                                | Where                                                                                                                                                 | Purpose                                                                                                                                                                                                                                                        |
| -------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Builder**                            | [src/model/builders/](src/model/builders/) (`CakeBuilder`, `OrderBuilder`, `BookBuilder`, `ToyBuilder`)                                               | Construct complex, many-field domain objects step by step; runs the matching validator before `build()` returns.                                                                                                                                               |
| **Factory Method**                     | [RepositoryFactory](src/repository/Repository.factory.ts), [MapperFactory](src/mappers/Mapper.factory.ts), [JsonRequestFactory](src/mappers/index.ts) | Select a concrete implementation (DB backend, mapper) at runtime based on config/category, hiding construction details from callers.                                                                                                                           |
| **Repository**                         | [src/repository/](src/repository/)                                                                                                                    | Abstracts persistence behind `IRepository<T>` so services never talk SQL.                                                                                                                                                                                      |
| ** Mapper**                            | [src/mappers/](src/mappers/)                                                                                                                          | Translate between external shapes (Postgres rows, JSON request bodies, CSV/XML files) and internal domain models, each via `IMapper<Input, Output>`.                                                                                                           |
| **Strategy**                           | Per-category validators ([src/model/validators/](src/model/validators/)) and mappers                                                                  | Swap validation/mapping behavior per item category without branching in the caller.                                                                                                                                                                            |
| **Dependency Injection (constructor)** | `OrderController(orderService)`, `OrderRepository(itemRepository)`                                                                                    | Dependencies passed in rather than instantiated internally, keeping units testable and substitutable.                                                                                                                                                          |
| **Middleware / Decorator**             | [asyncHandler](src/middleware/asyncHandler.ts), [requestLogger](src/middleware/requestLogger.ts)                                                      | Wrap route handlers to add cross-cutting behavior (error forwarding, timing/logging) without touching handler logic.                                                                                                                                           |
| **Custom exception hierarchy**         | [src/util/exceptions/](src/util/exceptions/)                                                                                                          | `HttpException` subclasses (`BadRequestException`, `NotFoundException`) carry a status code to a single Express error handler; repository-layer exceptions (`ItemNotFoundException`, `DbException`, `InitializationException`) are translated at the boundary. |

## Project layout

```
src/
├── app.ts                    # Express app: middleware, routes, error handler
├── index.ts                  # Standalone SOLID-principles demo (OrderManagement, Validator strategy chain)
├── config/                   # Environment-driven config (port, host, DB mode, log dir)
├── controllers/               # HTTP-facing request/response handling
├── routes/                    # Express routers
├── services/                  # Business logic (OrderManagementService, OrderAnalyticsService)
├── model/                     # Domain entities, builders, and validators
│   ├── builders/
│   └── validators/
├── mappers/                    # IMapper<In, Out> implementations per format/category
├── repository/                 # IRepository<T> + Postgres/SQLite implementations
│   ├── postgresql/
│   └── sqlite/
├── parsers/                    # Raw CSV/JSON/XML file readers
├── middleware/                  # asyncHandler, requestLogger
└── util/                        # logger, exceptions, repo lookup helper

tests/                          # Jest test suites (mirrors src/ structure)
swagger.yaml                    # OpenAPI spec — analytics endpoints (planned)
swaggercrud.yaml                # OpenAPI spec — order CRUD endpoints (implemented)
```

## Getting started

### Prerequisites

- Node.js 20+
- A reachable PostgreSQL database (default `dbMode`, see [Configuration](#configuration))

### Install

```bash
npm install
```

### Configure environment

Create a `.env` file in the project root:

```env
NODE_ENV=development
DATABASE_URL=postgres://<user>:<password>@<host>:<port>/<database>
PORT=3000
HOST=localhost
LOG_DIR=./logs
```

### Run in development (hot reload)

```bash
npm run dev
```

### Build & run for production

```bash
npm run build   # lints, cleans build/, compiles TypeScript
npm start        # runs build/index.js
```

The server prints `Server is running on http://<host>:<port>` once started (default `http://localhost:3000`).

## Configuration

All runtime config lives in [src/config/index.ts](src/config/index.ts), sourced from environment variables via `dotenv`:

| Variable       | Default     | Purpose                                                             |
| -------------- | ----------- | ------------------------------------------------------------------- |
| `PORT`         | `3000`      | HTTP port                                                           |
| `HOST`         | `localhost` | Bind address                                                        |
| `NODE_ENV`     | —           | `development` enables verbose console logging                       |
| `LOG_DIR`      | `./logs`    | Winston log file directory                                          |
| `DATABASE_URL` | —           | PostgreSQL connection string (required when `dbMode` is `POSTGRES`) |

Storage backend is selected in code via `DBMode` ([src/config/types.ts](src/config/types.ts)):

- `DBMode.POSTGRES` (current default) — full support for cake, book, and toy orders.
- `DBMode.SQLITE` — cake orders only.
- `DBMode.FILE` — deprecated, throws at runtime.

## API reference

Base URL: `http://localhost:3000`

Full OpenAPI 3.0 spec for the implemented endpoints: [swaggercrud.yaml](swaggercrud.yaml).

| Method   | Path          | Description                                |
| -------- | ------------- | ------------------------------------------ |
| `GET`    | `/`           | Health/hello check                         |
| `GET`    | `/orders`     | List all orders across every item category |
| `POST`   | `/orders`     | Create a new order                         |
| `GET`    | `/orders/:id` | Fetch a single order by id                 |
| `PUT`    | `/orders/:id` | Update an existing order                   |
| `DELETE` | `/orders/:id` | Delete an order                            |

### Create an order — example payload

```json
POST /orders
Content-Type: application/json

{
  "price": 45.99,
  "quantity": 2,
  "item": {
    "category": "cake",
    "type": "Birthday",
    "flavor": "Chocolate",
    "filling": "Cream",
    "size": 10,
    "layers": 2,
    "frostingType": "Buttercream",
    "frostingFlavor": "Vanilla",
    "decorationType": "Sprinkles",
    "decorationColor": "Red",
    "customMessage": "Happy Birthday!",
    "shape": "Round",
    "allergies": "None",
    "specialIngredients": "None",
    "packagingType": "Box"
  }
}
```

Response: `201 Created` with the persisted order, including a generated `id`.

> Only `category: "cake"` is currently accepted by `POST`/`PUT /orders` — see [Known Limitations](#known-limitations--roadmap).

## Error handling

All handlers are wrapped in [asyncHandler](src/middleware/asyncHandler.ts), forwarding rejected promises to a single centralized error middleware in [src/app.ts](src/app.ts):

- Errors extending `HttpException` (`BadRequestException` → 400, `NotFoundException` → 404) return their status code and message as `{ "error": "..." }`.
- Anything else is logged and returned as a generic `500 { "error": "Internal Server Error" }`, so internals never leak to clients.
- Unmatched routes return `404 { "error": "Not Found" }`.

## Logging

Winston-based structured logging ([src/util/logger.ts](src/util/logger.ts)):

- `logs/all.log` — every log line (JSON, with timestamps)
- `logs/error.log` — error-level only
- `logs/exceptions.log` — uncaught exceptions
- Console output (colorized, human-readable) is added automatically when `NODE_ENV=development`.

Every request is also logged with method, status, path, and response time via [requestLogger](src/middleware/requestLogger.ts).

## Testing

```bash
npm test
```

Runs the Jest suite (`tests/**/*.test.ts`) with `ts-jest`, covering builders, mappers, parsers (CSV/JSON/XML), factories, Postgres repositories, and analytics service logic. Coverage output is written to `coverage/` (enforced minimums: 85% functions, 75% statements — see [jest.config.ts](jest.config.ts)).

Other useful scripts:

```bash
npm run lint           # ESLint over src/
npm run format          # Prettier write
npm run format:check     # Prettier check only
```

## Known limitations / roadmap

- **Book & Toy orders aren't creatable over HTTP yet.** The models, builders, validators, Postgres repositories, and file mappers (CSV/JSON/XML) all exist for `Book` and `Toy`, but `JsonRequestFactory` ([src/mappers/index.ts](src/mappers/index.ts)) only has a case for `cake`, so `POST`/`PUT /orders` currently reject other categories at the controller boundary. Extending it is a matter of adding `JsonRequestBookMapper`/`JsonRequestToyMapper`.
- **Analytics endpoints are speced but not routed.** `OrderAnalyticsService` ([src/services/orderAnalytics.service.ts](src/services/orderAnalytics.service.ts)) already computes total orders, revenue, and per-category breakdowns, and [swagger.yaml](swagger.yaml) documents the intended `/api/orders/analytics/*` routes — no controller/router wires it up yet.
- **SQLite backend only supports cakes**, and the file-based (`DBMode.FILE`) backend has been deprecated in favor of Postgres/SQLite.
- [src/index.ts](src/index.ts) is a standalone, self-contained demo of SOLID principles (validation strategy chain, revenue calculator) kept for reference — it is not part of the running server.

## Next Steps

Planned for upcoming iterations:

- **User management** — accounts, roles, and ownership on orders (exploring AI-agent-assisted scaffolding for this).
- **Auth & security** — authentication/authorization on top of the current Helmet/CORS baseline.
- **CI/CD** — automated lint/test/build pipeline on push.
- **Deployment** — moving off local dev to a hosted server environment.

Winston-based structured logging ([src/util/logger.ts](src/util/logger.ts)):

- `logs/all.log` — every log line (JSON, with timestamps)
- `logs/error.log` — error-level only
- `logs/exceptions.log` — uncaught exceptions
- Console output (colorized, human-readable) is added automatically when `NODE_ENV=development`.

Every request is also logged with method, status, path, and response time via [requestLogger](src/middleware/requestLogger.ts).

## Testing

```bash
npm test
```

Runs the Jest suite (`tests/**/*.test.ts`) with `ts-jest`, covering builders, mappers, parsers (CSV/JSON/XML), factories, Postgres repositories, and analytics service logic. Coverage output is written to `coverage/` (enforced minimums: 85% functions, 75% statements — see [jest.config.ts](jest.config.ts)).

Other useful scripts:

```bash
npm run lint           # ESLint over src/
npm run format          # Prettier write
npm run format:check     # Prettier check only
```

## Known limitations / roadmap

- **Book & Toy orders aren't creatable over HTTP yet.** The models, builders, validators, Postgres repositories, and file mappers (CSV/JSON/XML) all exist for `Book` and `Toy`, but `JsonRequestFactory` ([src/mappers/index.ts](src/mappers/index.ts)) only has a case for `cake`, so `POST`/`PUT /orders` currently reject other categories at the controller boundary. Extending it is a matter of adding `JsonRequestBookMapper`/`JsonRequestToyMapper`.
- **Analytics endpoints are speced but not routed.** `OrderAnalyticsService` ([src/services/orderAnalytics.service.ts](src/services/orderAnalytics.service.ts)) already computes total orders, revenue, and per-category breakdowns, and [swagger.yaml](swagger.yaml) documents the intended `/api/orders/analytics/*` routes — no controller/router wires it up yet.
- **SQLite backend only supports cakes**, and the file-based (`DBMode.FILE`) backend has been deprecated in favor of Postgres/SQLite.
- [src/index.ts](src/index.ts) is a standalone, self-contained demo of SOLID principles (validation strategy chain, revenue calculator) kept for reference — it is not part of the running server.

## Next Steps

Planned for upcoming iterations:

- **User management** — accounts, roles, and ownership on orders (exploring AI-agent-assisted scaffolding for this).
- **Auth & security** — authentication/authorization on top of the current Helmet/CORS baseline.
- **CI/CD** — automated lint/test/build pipeline on push.
- **Deployment** — moving off local dev to a hosted server environment.
