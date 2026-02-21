# MedicalMap — Congress Directory

A public Congress Directory web app with Notion-like table UI and power filters.

## Architecture

| Layer     | Stack                                           | Deploy  |
| --------- | ----------------------------------------------- | ------- |
| Frontend  | Next.js (App Router) + TypeScript + TailwindCSS + TanStack Table v8 | Vercel  |
| Backend   | Fastify + TypeScript                            | Render  |
| Data      | JSON file (apps/api/data/congresses.json)        | Git     |
| Email     | Resend                                          | —       |

## Repo Structure

```
/
├── apps/
│   ├── api/          # Fastify API server
│   │   ├── data/     # congresses.json — single source of truth
│   │   ├── scripts/  # xlsx_to_json.ts — XLSX → JSON converter
│   │   └── seed/     # Data congress.xlsx — source Excel file
│   └── web/          # Next.js frontend
├── packages/
│   └── shared/       # Zod schemas + shared types + query helpers
├── pnpm-workspace.yaml
└── package.json
```

## Data Management

Congress data is stored as a committed JSON file: `apps/api/data/congresses.json`.

### Generate JSON from XLSX

To regenerate the JSON from the Excel source file:

```bash
pnpm --filter @medicalmap/api xlsx-to-json
git add apps/api/data/congresses.json
git commit -m "Update congresses dataset"
```

You can also specify custom input/output paths:

```bash
pnpm --filter @medicalmap/api xlsx-to-json -- /path/to/input.xlsx /path/to/output.json
```

## Local Development

### Prerequisites

- Node.js ≥ 18
- pnpm ≥ 8

### 1. Install dependencies

```bash
pnpm install
```

### 2. Environment variables

**API** — create `apps/api/.env`:

```env
RESEND_API_KEY=re_your_key
LEAD_NOTIFICATION_TO=team@yourcompany.com
ALLOWED_ORIGINS=http://localhost:3000
FROM_EMAIL=noreply@yourdomain.com
NODE_ENV=development
```

**Web** — create `apps/web/.env.local`:

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:4000
```

### 3. Run API locally

```bash
pnpm dev:api
```

- API runs at **http://localhost:4000**

### 4. Start development servers

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
# {"status":"ok","congresses":99}
```

### `GET /v1/congresses`

Fetch congresses with server-side pagination, sorting, and filtering.

**Query Parameters:**

| Param    | Type   | Description                                              |
| -------- | ------ | -------------------------------------------------------- |
| q        | string | Free-text search (name, city, country, organizer, tags)  |
| ind      | string | Comma-separated indications                              |
| tier     | string | Comma-separated tiers (1,2,3)                            |
| region   | string | Comma-separated regions (EU,NA,APAC,LATAM,MEA,International) |
| country  | string | Comma-separated countries                                |
| month    | string | Comma-separated months (1-12)                            |
| sort     | string | Sort column: name, start_date, tier, score               |
| dir      | string | Sort direction: asc, desc                                |
| page     | number | Page number (default: 1)                                 |
| pageSize | number | Page size (default: 25, max: 200)                        |

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

## Data Schema (congresses.json)

Each record in `apps/api/data/congresses.json` has:

| Field              | Type              | Notes                                          |
| ------------------ | ----------------- | ---------------------------------------------- |
| id                 | string            | Slug-based stable identifier                   |
| name               | string            | Congress name                                  |
| pillar             | string            | From "Pillar" column (e.g. "Kardiologie")      |
| indication         | string            | Same as pillar (API backward compat)           |
| indication_detail  | string \| null    | From "Indikation(en)" column                   |
| tier               | number (1\|2\|3)  | Congress importance tier                       |
| region             | string            | EU, NA, APAC, LATAM, MEA, International        |
| scope              | string            | International, European, National, Regional    |
| country            | string \| null    | Country name                                   |
| city               | string \| null    | City name                                      |
| location_text      | string \| null    | Raw "Üblicher Ort" value                       |
| start_date         | string \| null    | YYYY-MM-DD                                     |
| end_date           | string \| null    | YYYY-MM-DD                                     |
| typical_month      | number \| null    | 1-12                                           |
| website_url        | string            | Official URL                                   |
| deadlines_text     | string \| null    | Wichtige Deadlines                             |
| rationale          | string \| null    | Why this congress matters                      |
| organizer          | string \| null    | Gesellschaft/Organisator                       |
| tags               | string[]          | Split from Tags column                         |
| score              | number            | 90 (tier 1) / 75 (tier 2) / 60 (tier 3)       |
| updated_at         | string            | ISO 8601 timestamp of last JSON generation     |

## Deployment

### Vercel (Frontend)

1. Connect your GitHub repo to Vercel.
2. Set root directory to `apps/web`.
3. Set build command: `cd ../.. && pnpm install && pnpm --filter @medicalmap/shared build && pnpm --filter @medicalmap/web build`
4. Set environment variable: `NEXT_PUBLIC_API_BASE_URL=https://your-api.onrender.com`
5. **Redeploy after changing env vars** — Next.js bakes `NEXT_PUBLIC_*` values at build time.
6. To verify connectivity, visit `/congresses?debug=1` and click "Ping API /health". The debug panel also shows the resolved API base URL in the browser.

### Render (API)

1. Create a Web Service on Render, connected to your GitHub repo.
2. Set root directory: `apps/api`
3. Build command: `cd ../.. && pnpm install && pnpm --filter @medicalmap/shared build && pnpm --filter @medicalmap/api build`
4. Start command: `node dist/index.js`
5. Set environment variables:
   - `RESEND_API_KEY` — your Resend API key
   - `LEAD_NOTIFICATION_TO` — comma-separated notification emails
   - `ALLOWED_ORIGINS` — your Vercel domain(s), comma-separated (e.g. `https://yourapp.vercel.app`)
   - `FROM_EMAIL` — verified Resend sender address
   - `NODE_ENV=production`

> **No database required.** Congress data is served directly from `apps/api/data/congresses.json`.

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
