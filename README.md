# Freelance Console

A working freelance consultant CRM, built end-to-end in 30 minutes 
with [APIEngine](https://theapiengine.com) and Claude Code. Track 
clients, projects, and invoices — without writing backend code.

## What this is

This is a real working frontend for a freelance consulting business. 
It's powered entirely by APIEngine — no Postgres, no Django, no 
backend setup. The data model (clients, projects, invoices) was 
created via API calls; the React app reads and writes through the 
same API.

**Total build time:** ~30 minutes.  
**Total backend code written by hand:** zero.

## Features

- Dashboard with client/project/invoice summary cards
- Clients list with search, plus add/edit forms
- Projects list with status filter (Active / Completed / On Hold)
- Invoices list with paid/unpaid filtering
- Indian rupee formatting (₹3,02,500-style lakh separator)
- Skeleton loaders, empty states, real error handling
- Fully typed TypeScript against the OpenAPI spec
- React Query for caching and background refetches

> **Note on the live demo:** [freelance-consultant.vercel.app](https://freelance-consultant.vercel.app/) 
> uses my own APIEngine API key, so records you add there are visible to all 
> visitors and persist in my account. To run it cleanly with your own data, 
> follow the Quickstart below.


## Quickstart

You'll need:
- Node 18+
- An APIEngine account (free tier is enough — [sign up](https://theapiengine.com))
- Your APIEngine API key

```bash
git clone https://github.com/kunal-kejriwal/apiengine-consultant-app-demo
cd apiengine-consultant-app-demo
npm install
cp .env.example .env.local
# Edit .env.local and paste your APIEngine API key
npm run dev
```

Open `http://localhost:5173`. You should see the dashboard.

## How it was built

1. **Defined the schema via API.** Three custom objects (Client, 
   Project, Invoice) with relationships, created with 
   `POST /api/v1/custom/models/` and `POST /api/v1/custom/fields/` 
   calls — no dashboard work.

2. **Populated sample records via API.** 4 clients, 5 projects, 8 
   invoices — all with realistic data and proper relationships.

3. **Generated the frontend with Claude Code.** Using the OpenAPI 
   spec downloaded from `GET /api/v1/openapi.json`, Claude Code 
   produced this app — types, API client, pages, forms.

## What APIEngine is

[APIEngine](https://theapiengine.com) is a backend-as-a-service that 
ships with a complete data model on day one — 19 pre-modeled CRM 
objects plus the ability to define your own. Every account gets a 
personalized OpenAPI spec that AI tools and code generators can 
consume directly.

## Replace it with your own data model

1. Open your APIEngine dashboard
2. Create your own custom objects
3. Re-download your spec
4. Hand the spec to Claude Code with a prompt like  
   "Adapt this app to work with my new data model"

The whole frontend is ~1,500 lines. It's meant to be read, modified, 
and replaced.

## Tech stack

- **Frontend:** React 18, TypeScript, Vite, Tailwind CSS v3, React Router, TanStack Query
- **Backend:** APIEngine (Django/DRF/PostgreSQL/Redis under the hood)

## License

MIT — see [LICENSE](LICENSE).

## Built by

[Kunal Kejriwal](https://kunalkejriwal.com) — also building APIEngine.

## Questions

Open an issue here, or see [the docs](https://theapiengine.com/docs).
