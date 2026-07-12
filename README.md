# SE2 — Order Management API

A TypeScript/Express backend built for **SE2 (Software Engineering 2)**. This project serves as a hands-on playground for practicing **SOLID principles**, classic **GoF design patterns**, and **layered architecture** within a production-like HTTP service.

---

## 💡 The Big Idea

The domain is an order-management system for a multi-category store (Cakes, Books, Toys) featuring pluggable storage backends.

Instead of just writing quick code that works, the goal here is **strict object-oriented design**. The system completely decouples generic order processing from the product types themselves.

By separating concerns, adding a brand-new product category (e.g., `Toy`) means creating a new model, validator, and repository, rather than rewriting or hacking existing core order logic.

---

## 🛠️ The Tech Stack

- **Language & Runtime:** TypeScript (Strict Mode) & Node.js
- **HTTP Framework:** Express 5 (with Helmet & CORS)
- **Pluggable Databases:** PostgreSQL (Primary) & SQLite (Secondary, Cake orders only)
- **Supported Formats:** JSON payloads, alongside CSV and XML file processing
- **Logging:** Winston-based structured logger (Console & Local Files)
- **Testing Suite:** Jest + `ts-jest` (with an enforced 85% function coverage threshold)

---

## 🏗️ Architecture & Patterns Inside

Requests pass through a strict layered pipeline, isolating business logic from external protocols and persistence frameworks:

`Express Routes` ➔ `Controllers` ➔ `Services (Business Logic)` ➔ `Repository Factory` ➔ `Database Repositories` ➔ `Format Mappers`

### Applied Design Patterns

- **Builder:** Assembles complex, multi-field domain entities (like a custom 12-property cake) step-by-step, running encapsulated domain validators before generating the final object.
- **Factory Method:** Dynamically resolves concrete components (like switching between PostgreSQL or SQLite repositories, or selecting CSV/XML data mappers) at runtime based on configuration.
- **Strategy:** Encapsulates parsing and validation behavior per product category, allowing handlers to scale out without nesting conditional `if/else` checks.
- **Dependency Injection:** Components structurally interact through clean contracts (`IRepository`, `IMapper`). Concrete database drivers are injected via constructors, ensuring high isolation for unit testing.

---

## 🚧 Current Status & Roadmap

This project is an active work-in-progress coursework repository.

- **What's Working:** Core domain decoupling is fully operational. Full HTTP CRUD operations are live for **Cakes** backed by PostgreSQL and SQLite. Data layers, file parsers, and unit tests are complete for Books and Toys.
- **What's Next:** Exposing Book and Toy CRUD endpoints across the HTTP layer and routing the pre-calculated metrics in the `OrderAnalyticsService` to live endpoints.

---

## 🚀 Upcoming Iterations

- **User Management via AI Agents:** Exploring AI-agent-assisted engineering to scaffold out robust user accounts, role-based access control (RBAC), and order ownership patterns.
- **Auth & Security:** Layering secure token-based authentication and route authorization mechanisms on top of the existing security baseline.
- **CI/CD Pipeline:** Automating building, strict linting checks, and the Jest testing suite on every branch push.
- **Server Deployment:** Transitioning the service from a local development environment to a fully hosted, production-ready cloud server.
