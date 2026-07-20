# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project overview

SE2 is a TypeScript/Express order-management API for a multi-category store (Cakes, Books, Toys), built as an SOLID-principles / GoF-design-patterns coursework project. The core goal is strict decoupling of generic order processing from product-specific logic, so adding a new category means adding a model/validator/builder/mapper/repository, not touching existing order logic.

## Commands

```bash
npm run dev          # run with ts-node-dev (auto-restart), reads src/index.ts
npm run build        # clean + lint, then tsc -> build/
npm start             # build then run build/index.js
npm run lint          # eslint src
npm run format        # prettier --write on src/**/*.{ts,js,json,md}
npm run format:check  # prettier --check on the whole repo
npm test              # jest (see below)
```

Running a single test file or test case:
```bash
npx jest tests/cake.builder.test.ts
npx jest -t "name of test case"
```

Jest config (`jest.config.ts`): roots at `tests/`, matches `**/*.test.ts`, uses `ts-jest`. Coverage is collected from `src/**/*.ts` on every run with an enforced threshold of **85% functions / 75% statements** — `npm test` fails if coverage drops below this.

### Environment

Config is loaded via `dotenv` from a `.env` file at the repo root (`src/config/index.ts`). Relevant vars:
- `DATABASE_URL` — Postgres connection string (required when `dbMode` is `POSTGRES`; see `src/repository/postgresql/ConnectionManager.ts`)
- `PORT`, `HOST` — server bind address (default `3000` / `localhost`)
- `LOG_DIR` — winston log file directory (default `./logs`)
- `NODE_ENV` — `development` enables console logging and debug log level

The active storage backend is a hardcoded value in `src/config/index.ts` (`dbMode: DBMode.POSTGRES`) — change this constant to switch between `POSTGRES`, `SQLITE`, or the deprecated `FILE` mode.

## Architecture

### Request pipeline

```
Express Routes -> Controllers -> Services -> Repository Factory -> Repositories -> Mappers
```

- `src/index.ts` is the actual app entry point (Express setup: helmet, cors, body-parser, request logger, routes, 404 handler, centralized error handler, `app.listen`).
- `src/app.ts` is a self-contained SOLID-principles teaching example (`OrderManagement`, `Validator`, `FinancialCalculator`, etc.) — it is **not** wired into the running server. Don't confuse it with the real bootstrap in `index.ts`.
- Routes (`src/routes/`) wrap every controller method in `asyncHandler` (`src/middleware/asyncHandler.ts`) so rejected promises are forwarded to Express's error handler instead of crashing.
- The centralized error handler in `src/index.ts` distinguishes `HttpException` (has a `status`, sent as-is) from any other thrown `Error` (mapped to a generic 500).

### Category abstraction (Cake / Book / Toy)

Each product category has a parallel, independent stack of classes rather than shared inheritance:
- **Model** (`src/model/*.model.ts`) — plain data class implementing `IItem`/`IIdentifiableItem` (`src/model/IItem.ts`).
- **Builder** (`src/model/builders/*.builder.ts`) — fluent step-by-step construction; `build()` runs the matching validator before constructing the model. There is a plain builder (e.g. `CakeBuilder`) and an "Identifiable" variant (e.g. `IdentifiableCakeBuilder`) that assigns/generates an `id`.
- **Validator** (`src/model/validators/*.validator.ts`) — static `validate()` using shared helpers in `ValidationUtils` (`requireNonEmptyString`, `requirePositiveNumber`, etc.).
- **Mapper** (`src/mappers/*.mapper.ts`) — implements `IMapper<T, U>` (`map`/`reverse`) to convert between an external representation (Postgres row, CSV row, XML node, JSON request body) and the domain model. Each category typically has several mapper classes for different formats (e.g. `PostgresCakeMapper`, `JsonRequestCakeMapper`).
- **Repository** (`src/repository/{postgresql,sqlite,file}/`) — implements `IRepository<T>` + `Initializable` (`src/repository/IRepository.ts`); `init()` creates tables if needed. SQL is raw parameterized queries via `pg`/`sqlite3`, no ORM.

The generic `Order` (`src/model/Order.model.ts`, `IOrder`/`IIdentifiableOrderItem` in `src/model/IOrder.ts`) wraps an `IItem`/`IIdentifiableItem` — it holds price/quantity/id and delegates category-specific data to the wrapped item. `OrderRepository` (per backend) persists the order row and delegates item persistence to the category-specific item repository it's constructed with.

### Factories select the concrete implementation at runtime

- `RepositoryFactory.create(dbMode, category)` (`src/repository/Repository.factory.ts`) picks the storage backend (`DBMode.POSTGRES`/`SQLITE`/`FILE`) and wraps the matching category repository in an `OrderRepository`, then calls `.init()`. `FILE` mode is deprecated and throws. SQLite currently only supports `CAKE`.
- `MapperFactory.create(category)` (`src/mappers/Mapper.factory.ts`) picks the Postgres row<->model mapper for a category.
- `JsonRequestFactory.create(type)` (`src/mappers/index.ts`) picks the JSON-request<->model mapper for a category; currently only `CAKE` is wired up end-to-end for the HTTP layer (Book/Toy have models/mappers/repositories but no HTTP request mapper yet — see README roadmap).
- `getRepo(category)` (`src/util/index.ts`) is the common entry point services use to obtain a ready repository: `RepositoryFactory.create(config.dbMode, category)`.

### Services

- `OrderManagementService` (`src/services/orderManagement.service.ts`) — CRUD. Since orders aren't tagged with category in the generic lookup path, `getOrder`/`deleteOrder` iterate over all `ItemCategory` values and try each repository until one succeeds, throwing `NotFoundException` if none match.
- `OrderAnalyticsService` (`src/services/orderAnalytics.service.ts`) — read-only aggregates (counts/revenue, total and by-category) computed by fetching all orders per category. Not yet exposed via HTTP routes (see README roadmap).

### Exceptions

- `src/util/exceptions/http/` — `HttpException` (base, carries `status` + optional `details`), `BadRequestException` (400), `NotFoundException` (404). These are the only ones the top-level Express error handler treats specially.
- `src/util/exceptions/repostiroyException.ts` (filename typo, preserved) — repository-layer exceptions: `ItemNotFoundException`, `InvalidItemException`, `InitializationException`, `DbException`. Repositories catch driver errors and rewrap them as `DbException`/`InitializationException` (preserving the original stack), and throw `ItemNotFoundException` on missing rows — services translate that into `NotFoundException` at the HTTP boundary.
- `src/util/exceptions/ServiceException.ts` — generic service-layer exception.

### Logging

`src/util/logger.ts` is a winston logger writing structured JSON to `logs/error.log` and `logs/all.log` (plus `logs/exceptions.log` for uncaught exceptions). Console transport with colorized, human-readable output is added only when `NODE_ENV=development`. `requestLogger` middleware (`src/middleware/requestLogger.ts`) logs every request's method/status/URL/duration at a level derived from the response status code.

### Parsers

`src/parsers/{csv,json,xml}Parser.ts` are low-level file-format readers/writers used by mappers for the file-backed formats (independent of the parser's target category).
