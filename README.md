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
- Static, responsive one-page experience
- Cloudflare Workers deployment
- No backend, database, authentication or tracking

The invitation artwork remains outside this repository and is not modified or redistributed by the site.
