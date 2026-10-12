# Product Catalog API

Express REST API with PostgreSQL persistence for the Iqlifar concept catalog. Public product identifiers are **slugs** (for example, `iqlifar`); PostgreSQL uses UUID primary keys internally. The included price (Rp99.000) and stock (10 per combination) are simulations from the concept frontend, not verified commercial values. No actual product photo is available; the seed uses `url: null` and a placeholder alt text.

The `POST /api/v1/products` endpoint has no authentication in this local exercise. Do not expose it publicly until admin authentication and authorization are added.

## Requirements

- Node.js 24 LTS (`.nvmrc`; `engines` in `package.json`)
- Docker Desktop with Docker Compose, or a compatible PostgreSQL 17 database

## Local setup

Run commands from this directory:

```powershell
Copy-Item .env.example .env
```

Set a unique local `POSTGRES_PASSWORD` in `.env`, then set `DATABASE_URL` to `postgresql://product_api:<URL-encoded-password>@localhost:5432/product_catalog`. Keep `.env` local; it is excluded by `.gitignore`.

```powershell
docker compose up -d db
npm install
npm run migrate
npm run seed
npm start
```

The API connects from the host through `localhost:5432`; PostgreSQL is bound to loopback only and stores data in the `product_pgdata` named volume. The migration runner applies numbered SQL files once, serializes concurrent runs with an advisory lock, and verifies checksums of applied migrations. `npm run seed` is safe to repeat: it inserts Iqlifar only when the `iqlifar` slug does not already exist.

For a local frontend served by Live Server on another port, set `CORS_ORIGIN` in `.env` to the exact allowed origin(s), comma-separated. The defaults allow `localhost:5500` and `127.0.0.1:5500`; requests without an Origin header (for example, Postman) are accepted.

## Run and verify

```powershell
npm test
```

API base URL: `http://localhost:3000`

- `GET /health` — liveness response
- `GET /api/v1/products` — active products with `meta.count`
- `GET /api/v1/products/iqlifar` — detail by slug
- `POST /api/v1/products` — create a product; JSON body is limited to 100 KB
- `GET /api-docs` — interactive Swagger UI
- `GET /api-docs/openapi.yaml` — OpenAPI 3.1 contract

Success responses use `success`, `message`, `data`, and `meta`. Errors use `application/problem+json` (RFC 9457) with a stable `code`; request validation errors include `errors`. The server assigns request IDs and logs method, route, status, and duration without logging request bodies or secrets.

To stop PostgreSQL while retaining its data, run `docker compose down`. The named volume is retained.
