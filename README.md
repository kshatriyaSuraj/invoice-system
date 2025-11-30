# Invoice System

> Lightweight invoice management app built with Next.js, Ant Design and MongoDB. Create, preview and download PDF invoices, search and paginate listings.

---

## Features

- Create invoices with multiple line items (qty, rate, IGST)
- Live totals and number-to-words conversion
- Invoice listing with debounced search (invoice number & client) and pagination
- Preview invoice in a professional printable layout
- Download invoice as PDF (server-generated)
- Server-side validation and MongoDB persistence

## Tech stack

- Frontend: Next.js (app router), React, Ant Design (`antd`), Tailwind CSS utilities
- Backend: Next.js API routes, Node.js, Mongoose (MongoDB)
- PDF: Server-side HTML template rendered to PDF

## Repository layout (important files)

- `app/` — Next.js app pages and API routes
  - `app/page.tsx` — Invoice listing (search + pagination)
  - `app/invoice/create/page.tsx` — Create invoice (Ant Design form)
  - `app/invoice/preview/page.tsx` — Invoice preview + PDF download
  - `app/api/invoice/` — API routes for create, list, pdf, etc.
- `lib/` — helpers
  - `lib/api.ts` — axios helper (uses `API_URL` env var)
  - `lib/db.ts` — mongoose connection helper
- `models/Invoice.ts` — mongoose schema (includes indexes)
- `utils/` — pdf/render helpers

## Quick start (development)

1. Clone the repo:

```bash
git clone <repo-url>
cd invoice-system
```

2. Install dependencies:

```bash
npm ci
```

3. Create a local env file by copying the example and updating values:

```bash
copy .env.example .env.local
# then edit .env.local and set MONGODB_URI and API_URL if needed
```

4. Run the development server:

```bash
npm run dev
```

Open http://localhost:3000

## Important environment variables

- `MONGODB_URI` — MongoDB connection string (required for API routes)
- `API_URL` — Optional base URL used by client-side `lib/api.ts` (defaults to `/api`). The previous fallback `API_URP` is still supported.

See `.env.example` for a sample.

## Scripts

- `npm run dev` — start development server
- `npm run build` — build for production
- `npm start` or `next start` — start built app

## Production checklist

1. Secrets & environment

   - Do NOT commit `.env.local`.
   - Provide a secure `MONGODB_URI` (use Atlas or managed DB) and configure `API_URL` if client runs on a different origin.

2. Security & validation

   - Add authentication / authorization if invoices are private.
   - Consider using a schema validator (`zod`/`joi`) to centralize validation on server and client.
   - Add rate-limiting and CORS configuration.

3. Database

   - Indexes already added for `invoiceNumber`, `clientName`, and `createdAt` (see `models/Invoice.ts`).
   - Add backups and monitor DB performance.

4. Observability

   - Add structured logging, error tracking (Sentry), and health checks.

5. CI/CD
   - Add lint, typecheck and tests to CI. Build and deploy with Vercel / Docker / Cloud Run as appropriate.

## Testing

- Unit tests are recommended for invoice calculations (totals, number-to-words) and API endpoints.
- Manual smoke tests: create an invoice, preview it, download PDF, search & paginate.

## Contributing

PRs and issues welcome. Please include a clear description and reproduction steps for bugs. Follow existing code style and run linters locally.

## License

Add your preferred license (for example: MIT).

---

If you'd like, I can also:

- Generate a `README.md` with badges (build, license) and usage screenshots.
- Add a `Dockerfile` and `docker-compose.yml` for local production-like testing.
- Create a simple CI workflow for build and tests (GitHub Actions).

Replace `<repo-url>` at the top with your repository address before publishing.
This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
