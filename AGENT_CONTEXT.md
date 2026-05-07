# Agent Context — base-symfony-react

> **READ THIS FIRST.**
> This document is intended for every AI agent working in this repository.
> It describes the purpose of the project, the technology stack, the architecture conventions and the testing requirements that **must** be respected in all future work.

---

## 1. Project Purpose

`base-symfony-react` is a **starter / boilerplate project**.  
It is **not** a finished product — it is the clean foundation from which **every new project is derived**.

When a new project begins, this repository is forked / cloned and domain-specific features are added on top of it.  
Therefore every change made here **propagates to all future projects**.  
Keep it generic, clean, and well-structured.

---

## 2. Technology Stack

### 2.1 Infrastructure & DevOps

| Tool | Version / Notes |
|---|---|
| **Docker** | All services run in containers via Docker Compose |
| **Docker Compose** | Orchestrates the multi-container setup (see `docker-compose.yml`) |
| **Nginx** | Reverse proxy / web server for the PHP app (`docker/nginx/`) |
| **MySQL** | `8.0` — primary relational database (`symfony_db` container) |
| **MailHog** | Local SMTP trap for email testing (ports `1025` / `8025`) |
| **Makefile** | Developer CLI — use `make <target>` for all common operations |

### 2.2 Backend

| Technology | Version / Notes |
|---|---|
| **PHP** | `>= 8.2` |
| **Symfony** | `7.4.*` (full webapp skeleton) |
| **Doctrine ORM** | `^3.6` — database abstraction |
| **Doctrine Migrations** | `^3.7` — schema version control |
| **Lexik JWT Authentication** | Stateless JWT-based API authentication |
| **Symfony Messenger** | Async message / event bus (consumed by the `worker` container) |
| **Symfony Mailer** | Email dispatch (routed through MailHog locally) |
| **Symfony Security** | Role-based access control |
| **Symfony Serializer / Validator** | Request deserialization and validation |
| **PHPUnit** | `^11.5` — test runner |
| **Symfony BrowserKit** | Functional HTTP test client |

### 2.3 Frontend

| Technology | Version / Notes |
|---|---|
| **Node.js** | `20` (Docker image) |
| **React** | `^19` — UI library |
| **React DOM** | `^19` |
| **React Router DOM** | `^7` — client-side routing |
| **Vite** | `^8` — dev server & bundler |
| **Bootstrap** | `^5.3` — CSS framework |
| **Bootstrap Icons** | `^1.13` — icon set |
| **SweetAlert2** | `^11` — modal / alert dialogs |
| **ESLint** | `^9` — linting |

---

## 3. Running the Project

All developer commands go through **Make**:

```bash
make setup        # Full first-time setup: build, init, up
make build        # Rebuild Docker images
make up           # Start all containers in detached mode
make down         # Stop all containers
make migrations   # Generate + run Doctrine migrations
make sh-php       # Shell into the PHP container
make sh-node      # Shell into the Node/frontend container
make fix-permissions  # Fix file ownership after Docker writes
make clean        # Destroy containers, volumes, and source directories (DESTRUCTIVE)
```

**Service URLs (local)**

| Service | URL |
|---|---|
| Frontend (React/Vite) | http://localhost:5174 |
| Backend API (Nginx → Symfony) | http://localhost:8080 |
| MailHog web UI | http://localhost:8025 |
| MySQL | `localhost:3307` |

**Environment Setup**

Copy `.env.example` to `.env` and fill in credentials before running `make setup`.

---

## 4. Architecture — Domain-Driven Design (DDD)

> **All features added to this project — and to every project derived from it — MUST adhere to Domain-Driven Design (DDD) principles.**

The backend source code (`backend/src/`) is organized by **Bounded Context**, currently:

```
backend/src/
├── Kernel.php
└── UserBundle/                  ← Bounded Context: User Management
    ├── UserBundle.php
    ├── Domain/                  ← Business rules, entities, value objects, repository interfaces
    │   ├── Entity/
    │   ├── Repository/
    │   └── Service/
    ├── Application/             ← Use Cases (one class per use case)
    │   ├── CreateUserUseCase.php
    │   ├── DeleteUserUseCase.php
    │   ├── GetUserUseCase.php
    │   ├── ListUsersUseCase.php
    │   ├── RequestPasswordResetUseCase.php
    │   ├── ResetPasswordUseCase.php
    │   └── UpdateUserUseCase.php
    ├── Infrastructure/          ← Concrete implementations (Doctrine, external services, console commands)
    │   ├── Console/
    │   ├── Persistence/
    │   └── Service/
    └── UI/                      ← Entry points (HTTP controllers)
        └── Http/
            ├── AdminUserController.php
            ├── AuthController.php
            ├── PasswordResetController.php
            └── TranslationController.php
```

### 4.1 Layer Responsibilities

| Layer | Responsibility | Dependencies |
|---|---|---|
| **Domain** | Pure business logic. Entities, Value Objects, Domain Events, Repository *interfaces*, Domain Services. No framework or infrastructure imports. | None (standalone PHP) |
| **Application** | Orchestrates domain objects to fulfil a use case. One class = one use case. Depends on Domain interfaces only. | Domain |
| **Infrastructure** | Implements Domain interfaces using concrete technologies (Doctrine, mailers, HTTP clients, queues). | Domain, Application |
| **UI** | Receives external input (HTTP request, CLI command) and delegates to Application use cases. Returns responses. | Application |

### 4.2 DDD Rules Every Agent Must Follow

1. **Never bypass the Application layer.** UI controllers call use cases; use cases call domain services/repositories. Controllers must not contain business logic.
2. **Domain layer is framework-agnostic.** No Symfony, Doctrine, or any infrastructure import inside `Domain/`. Entities may use Doctrine *attributes* for mapping, but their logic must remain pure.
3. **Use Cases are single-responsibility.** One use case per operation (`CreateUserUseCase`, not `UserUseCase`).
4. **New Bounded Contexts get their own Bundle.** If adding a new domain concept (e.g., `OrderBundle`, `ProductBundle`), mirror the four-layer structure (`Domain/`, `Application/`, `Infrastructure/`, `UI/`).
5. **Repository interfaces live in Domain; implementations in Infrastructure.** `Domain/Repository/UserRepositoryInterface.php` → `Infrastructure/Persistence/DoctrineUserRepository.php`.
6. **Domain Events & Symfony Messenger.** Cross-context communication must go through domain events dispatched via Symfony Messenger. Direct coupling between Bundles is forbidden.
7. **Value Objects over primitives.** Prefer typed Value Objects (e.g., `Email`, `UserId`) over raw `string` / `int` where they carry domain meaning.

---

## 5. Testing Requirements

> **Every feature must be covered by functional tests. This is non-negotiable.**

### 5.1 Framework

- **PHPUnit `^11.5`** configured in `backend/phpunit.dist.xml`.
- Tests live in `backend/tests/`.
- The test environment is `APP_ENV=test` (set automatically by PHPUnit config).
- Use **`symfony/browser-kit`** for functional HTTP tests that hit the full Symfony kernel.

### 5.2 Test Taxonomy

| Type | What to test | Location example |
|---|---|---|
| **Functional / HTTP** | Full request → response cycle through the Symfony kernel. Assert HTTP status codes, response body, side effects (DB state). | `tests/UserBundle/UI/Http/` |
| **Application** | Use case logic. Mock repository interfaces. | `tests/UserBundle/Application/` |
| **Domain** | Domain entities, value objects, domain services — pure PHP, no framework. | `tests/UserBundle/Domain/` |

### 5.3 Testing Rules

1. **Every new Use Case requires at least one functional test** that exercises it over HTTP.
2. **Every new API endpoint must have functional tests** covering the happy path AND key error scenarios (invalid input, unauthorized access, not found, etc.).
3. **Test the contract, not the implementation.** Functional tests should assert on HTTP status codes, JSON structure, and DB state — not on internal class interactions.
4. **Use a dedicated test database.** Configure `DATABASE_URL` for `APP_ENV=test` in `backend/.env.test` to point to a separate schema. Never run tests against the development database.
5. **Tests must pass before any code is merged / delivered.** Run the suite with:
   ```bash
   docker compose exec php php /var/www/html/backend/bin/phpunit
   ```

---

## 6. Frontend Architecture

The React application (`frontend/src/`) follows this structure:

```
src/
├── api/          ← All HTTP calls to the Symfony API (Axios/fetch wrappers)
├── assets/       ← Static assets (images, fonts)
├── components/   ← Reusable UI components
├── contexts/     ← React Contexts (e.g., AuthContext)
├── pages/        ← Route-level page components
├── App.jsx       ← Root component with React Router routes
├── App.css
├── index.css
└── main.jsx      ← Entry point
```

- **All API calls** must be isolated in `src/api/` — no `fetch`/`axios` calls directly inside components or pages.
- **Authentication** is handled via JWT; the token is managed through the `AuthContext`.
- **Routing** uses React Router DOM v7.

---

## 7. Key Conventions Summary

| Convention | Rule |
|---|---|
| New backend domain feature | Create a new Bundle with `Domain/Application/Infrastructure/UI` layers |
| New API endpoint | Controller in `UI/Http/`, delegates to a Use Case, covered by a functional test |
| New use case | Single-responsibility class in `Application/`, mocked in unit tests |
| Database changes | Doctrine migration generated via `make migrations` — never edit the DB schema manually |
| Async operations | Dispatch domain events through Symfony Messenger; consume via the `worker` container |
| Frontend API call | Must be isolated in `src/api/` |
| Testing | Functional tests are mandatory; run inside the Docker PHP container |
| Environment secrets | Never commit `.env` files; use `.env.example` as the template |
