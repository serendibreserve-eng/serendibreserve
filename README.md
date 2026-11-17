# Serendib Reserve (Pvt) Ltd — Web Application

Luxury dark-abstract web platform for **Serendib Reserve (Pvt) Ltd** (`serendibreserve.com`), showcasing fine Sri Lankan gemstones through procedural Three.js 3D gem cuts, interactive Sri Lanka region mapping, a 3D global trade globe, and tailored client inquiry workflows.

## Local Development

```bash
npm install
npm run dev
```

The development server runs at `http://localhost:3000`.

### Production Build

```bash
npm run build
npm run preview
```

### Unit Tests

```bash
npx --yes tsx --test src/utils/gemGeometryFactory.test.ts src/utils/formLogic.test.ts
```

## Editing Placeholders

All company-specific placeholders are centralized in **`src/content/siteConfig.ts`** under `PLACEHOLDERS`:

- `yearFounded`: `[YEAR FOUNDED]`
- `stonesCertified`: `[NUMBER OF STONES CERTIFIED]`
- `certificationPartner`: `[CERTIFICATION PARTNER]`
- `certificationPartnerLogos`: `[CERTIFICATION PARTNER LOGOS]`
- `yearsOfExpertise`: `[YEARS]`
- `countriesServed`: `[COUNTRIES]`
- `email`: `info@serendibreserve.com`
- `businessHours`: `[MON–FRI 9:00–17:30 SLST]`
- `formEndpoint`: `[FORMSPREE_OR_EMAILJS_ENDPOINT_URL]`
- `eventsWeAttend`: `[EVENTS WE ATTEND]`
- `founderMessage`, `paymentTerms`, `returnPolicy`, and `socialLinks`

Additional editable data lives in:
- **`src/content/images.ts`** — Swap photography paths (`REPLACE WITH SERENDIB RESERVE PHOTO`)
- **`src/content/products.ts`** — Replace `SAMPLE_CATALOGUE` (`SAMPLE DATA`) with live inventory
- **`src/content/jobs.ts`** — Edit `OPEN_ROLES` positions and requirements

## Connecting Forms

1. Create a form relay endpoint (e.g., Formspree, EmailJS webhook, or your own backend API).
2. Paste the `https://...` URL into `PLACEHOLDERS.formEndpoint` inside `src/content/siteConfig.ts`.
3. Until configured, all forms (`Inquiries`, `Careers`, `Contact`) validate inputs client-side and provide a structured `mailto:info@serendibreserve.com` fallback.

## Deploying to `serendibreserve.com`

The app uses `HashRouter`, so it deploys cleanly to any static host (Cloudflare Pages, Vercel, Netlify, AWS S3/CloudFront, or cPanel):

1. Run `npm run build` to generate the `dist/` directory.
2. Upload the contents of `dist/` to your web host or connect your Git repository with build command `npm run build` and output directory `dist`.
3. Point the `serendibreserve.com` DNS records (`A` / `CNAME`) to your hosting provider with HTTPS enabled.
