# Inés & Guille — Wedding website

Bilingual, single-page wedding website for Inés and Guille's celebration at Finca El Venero in Navaluenga, Ávila.

Live site: [inesyguille.guillertal.workers.dev](https://inesyguille.guillertal.workers.dev/)

## Local development

Requires Node.js 22.13 or newer.

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Editing the wedding information

All guest-facing wedding details and bilingual copy live in [`app/content.ts`](app/content.ts). This includes the schedule, venue, dress code, practical information and gift details.

## Validation

```bash
npm run build
npm run lint
npx tsc --noEmit
```

## Architecture

- Vinext / React
- TypeScript
- Responsive one-page experience
- Cloudflare Worker for the website and `/api/*` routes
- Cloudflare D1 for guest identities, rides and seat requests
- Private, server-validated guest tokens stored in secure cookies
- No third-party backend, authentication provider or tracking

## Car sharing

Guests identify themselves with a unique name and four-digit PIN, then they can offer independent outbound or return journeys, request seats, edit or cancel their own rides, and accept or reject passenger requests. The same name and PIN restore the same account on any device. Only approximate areas are visible. Phone numbers are optional and are only returned to the participants after a request is accepted.

The database schema lives in [`db/schema.ts`](db/schema.ts) and generated migrations are stored in [`drizzle/`](drizzle/).

```bash
npm run db:generate
npm run build
npm run deploy
```

The deployment continues to use the existing `inesyguille.guillertal.workers.dev` Worker and the free `wedding-guines-rides` D1 database.

The invitation artwork remains outside this repository and is not modified or redistributed by the site.
