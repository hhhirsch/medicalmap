# MedicalMap — Congress Directory

A public Congress Directory web app with Notion-like table UI and power filters.

## Architecture

| Layer     | Stack                                           | Deploy  |
| --------- | ----------------------------------------------- | ------- |
| Frontend  | Next.js (App Router) + TypeScript + TailwindCSS + TanStack Table v8 | Vercel  |
| Backend   | Fastify + TypeScript                            | Render  |
| Database  | PostgreSQL                                      | Render  |
| Email     | Resend                                          | —       |

## Repo Structure

```
/
├── apps/
│   ├── api/          # Fastify API server
│   └── web/          # Next.js frontend
├── packages/
│   └── shared/       # Zod schemas + shared types + query helpers
├── pnpm-workspace.yaml
└── package.json
```

## Local Development

### Prerequisites

- Node.js ≥ 18
- pnpm ≥ 8
- PostgreSQL (local or Docker)

### 1. Install dependencies

```bash
pnpm install
```

### 2. Environment variables

**API** — create `apps/api/.env`:

```env
DATABASE_URL=postgresql://user:pass@localhost:5432/medicalmap
RESEND_API_KEY=re_your_key
LEAD_NOTIFICATION_TO=team@yourcompany.com
ALLOWED_ORIGINS=http://localhost:3000
FROM_EMAIL=noreply@yourdomain.com
NODE_ENV=development
```

**Web** — create `apps/web/.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:4000
```

### 3. Run migrations

```bash
pnpm --filter @medicalmap/api migrate
```

This runs all SQL files in `apps/api/migrations/` against your database.

### 4. Import seed data

```bash
pnpm --filter @medicalmap/api seed
```

This imports the sample CSV from `apps/api/seed/congresses.csv`. To import a custom CSV:

```bash
pnpm --filter @medicalmap/api seed -- /path/to/your/file.csv
```

### 5. Start development servers

```bash
# Terminal 1: API
pnpm dev:api

# Terminal 2: Web
pnpm dev:web
```

- API runs at **http://localhost:4000**
- Web runs at **http://localhost:3000**

## API Endpoints

### `GET /health`

Health check endpoint.

```bash
curl http://localhost:4000/health
# {"status":"ok","db":"connected"}
```

### `GET /v1/congresses`

Fetch congresses with server-side pagination, sorting, and filtering.

**Query Parameters:**

| Param    | Type   | Description                                    |
| -------- | ------ | ---------------------------------------------- |
| q        | string | Free-text search (name, city, tags)            |
| ind      | string | Comma-separated indications                    |
| tier     | string | Comma-separated tiers (1,2,3)                  |
| region   | string | Comma-separated regions (EU,NA,APAC,LATAM,MEA) |
| country  | string | Comma-separated countries                      |
| month    | string | Comma-separated months (1-12)                  |
| sort     | string | Sort column: name, start_date, tier            |
| dir      | string | Sort direction: asc, desc                      |
| page     | number | Page number (default: 1)                       |
| pageSize | number | Page size (default: 25)                        |

**Example requests:**

```bash
# All congresses, page 1
curl "http://localhost:4000/v1/congresses"

# Oncology tier 1
curl "http://localhost:4000/v1/congresses?ind=Oncology&tier=1"

# Search by name
curl "http://localhost:4000/v1/congresses?q=ASCO"

# EU region, sorted by start date
curl "http://localhost:4000/v1/congresses?region=EU&sort=start_date&dir=asc"

# Multiple filters with pagination
curl "http://localhost:4000/v1/congresses?ind=Oncology,Hematology&region=EU,NA&page=1&pageSize=10"
```

**Response:**

```json
{
  "items": [{ "id": "...", "name": "...", "..." : "..." }],
  "total": 35,
  "page": 1,
  "pageSize": 25,
  "facets": {
    "tier": [{ "value": "1", "count": 15 }],
    "region": [{ "value": "EU", "count": 18 }],
    "country": [{ "value": "USA", "count": 10 }],
    "month": [{ "value": "6", "count": 5 }],
    "ind": [{ "value": "Oncology", "count": 10 }]
  }
}
```

### `POST /v1/exports`

Request a filtered export delivered by email.

```bash
curl -X POST http://localhost:4000/v1/exports \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "filters": {
      "ind": ["Oncology"],
      "tier": ["1"],
      "region": [],
      "country": [],
      "month": [],
      "sort": "name",
      "dir": "asc"
    },
    "exportType": "csv",
    "consentExport": true,
    "consentMarketing": false
  }'
# {"success":true,"message":"Export will be delivered by email."}
```

Rate limited to 5 requests per 15 minutes per IP.

## Data Model

### congresses

| Column        | Type        | Notes                                      |
| ------------- | ----------- | ------------------------------------------ |
| id            | uuid (PK)   | Auto-generated                             |
| name          | text        | NOT NULL                                   |
| indication    | text        | NOT NULL                                   |
| tier          | int         | 1, 2, or 3                                 |
| region        | text        | EU, NA, APAC, LATAM, MEA                   |
| scope         | text        | International, European, National, Regional |
| country       | text        | Nullable                                   |
| city          | text        | Nullable                                   |
| start_date    | date        | Nullable                                   |
| end_date      | date        | Nullable                                   |
| typical_month | int         | 1-12, nullable                             |
| website_url   | text        | NOT NULL                                   |
| tags          | jsonb       | Array of strings, nullable                 |
| updated_at    | timestamptz | Default now()                              |

Indexes: indication, tier, region, country, start_date, GIN on tags.

### leads

| Column            | Type        | Notes           |
| ----------------- | ----------- | --------------- |
| id                | uuid (PK)   | Auto-generated  |
| email             | text        | UNIQUE NOT NULL |
| created_at        | timestamptz | Default now()   |
| consent_export    | boolean     | NOT NULL        |
| consent_marketing | boolean     | Default false   |
| source            | jsonb       | Nullable        |

### export_requests

| Column      | Type        | Notes                        |
| ----------- | ----------- | ---------------------------- |
| id          | uuid (PK)   | Auto-generated               |
| lead_id     | uuid (FK)   | References leads(id)         |
| filters     | jsonb       | NOT NULL                     |
| export_type | text        | csv or xlsx                  |
| created_at  | timestamptz | Default now()                |
| status      | text        | pending, sent, or failed     |

## Deployment

### Vercel (Frontend)

1. Connect your GitHub repo to Vercel.
2. Set root directory to `apps/web`.
3. Set build command: `cd ../.. && pnpm install && pnpm --filter @medicalmap/shared build && pnpm --filter @medicalmap/web build`
4. Set environment variable: `NEXT_PUBLIC_API_URL=https://your-api.onrender.com`

### Render (API + Database)

**Database:**
1. Create a PostgreSQL instance on Render.
2. Note the connection string (Internal URL for the API service).

**API:**
1. Create a Web Service on Render, connected to your GitHub repo.
2. Set root directory: `apps/api`
3. Build command: `cd ../.. && pnpm install && pnpm --filter @medicalmap/shared build && pnpm --filter @medicalmap/api build`
4. Start command: `node dist/index.js`
5. Set environment variables:
   - `DATABASE_URL` — Render Postgres connection string
   - `RESEND_API_KEY` — your Resend API key
   - `LEAD_NOTIFICATION_TO` — comma-separated notification emails
   - `ALLOWED_ORIGINS` — your Vercel domain(s), comma-separated
   - `FROM_EMAIL` — verified Resend sender address
   - `NODE_ENV=production`

**Run migrations** after first deploy:
```bash
# From Render shell or local with prod DATABASE_URL
pnpm --filter @medicalmap/api migrate
pnpm --filter @medicalmap/api seed
```

## Frontend Pages

| Route        | Description                                                    |
| ------------ | -------------------------------------------------------------- |
| `/`          | Landing page with CTA to browse congresses                     |
| `/congresses`| Directory with table, sidebar filters, search, export          |
| `/privacy`   | Privacy policy (placeholder)                                   |
| `/imprint`   | Imprint (placeholder)                                          |

## Features

- **Notion-like table** with subtle borders, row hover, sticky header
- **TanStack Table v8** in manual mode (server-driven pagination, sorting, filtering)
- **URL as source of truth** — filter state reflected in query params
- **Faceted filters** — indication, tier, region, country, month with counts
- **Search** with 300ms debounce
- **Quick Views** — preset filter buttons (Oncology Tier 1, DACH National, etc.)
- **Row click drawer** — congress details with website link
- **Email-gated export** — CSV/XLSX delivered via Resend
- **Anti-spam** — honeypot field + rate limiting on exports
- **Internal lead notification** — team notified on each export request