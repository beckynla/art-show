# Artshow

An online gallery for original paintings by Becky Klenk, live at **https://www.beckyklenk.com**.

Visitors browse the artwork and send an inquiry about any piece; there is no public checkout flow in the main experience. Everything visitors see — text, images, colors, fonts, layout options and gallery order — is managed from a built-in admin area, so day-to-day changes need no code.

## Features

### Public site
- **Homepage** — optional hero banner, a greeting section (photo, message, adjustable size, "View Paintings in Gallery" button) and a curated featured grid.
- **Gallery** (`/shop`) — masonry layout that shows every piece uncropped at its true proportions, reading left to right. Optional category filter.
- **Artwork page** (`/product/[slug]`) — full image with zoom lightbox, extra photos, size, and an **Inquire About This Piece** form.
- **About**, **Contact**, **Privacy**, **Terms**, **Returns** pages, with text edited in admin. The About page can be switched off entirely.
- **Site-wide theming** — primary/accent/background colors, Google Fonts, and an optional background image (fill or tiled, adjustable strength, parallax scrolling).
- Translucent navigation bar that blends into the page and frosts once scrolled.

### Admin (`/admin`)
- **Products** — add and edit artwork, images (upload or Google Photos picker), dimensions, and status:
  - `display` — shown, not for sale
  - `available` — for sale (small "available" marker in the gallery)
  - `reserved`, `sold` — shown with a marker
  - `hidden` — not shown publicly
- **Arrange Gallery** (`/admin/products/arrange`) — newest first, oldest first, or a drag-and-drop custom order; option to show available pieces first.
- **Inquiries** — messages sent from artwork pages.
- **Categories**, **Orders**.
- **Settings** — General, Homepage, Shop, Appearance, Contact, Payments, Shipping, Legal, Account (change password).

## Tech stack

| | |
|---|---|
| Framework | Next.js 14 (App Router), React 18, TypeScript |
| Styling | Tailwind CSS, theme colors/fonts as CSS variables generated from settings |
| Database | SQLite via Prisma |
| Images | Stored on disk, optimized by `next/image` (+ `sharp`) |
| Auth | Single admin account, bcrypt password, HMAC-signed session cookie |
| Optional | Stripe (keys stored encrypted in the database), Google Photos picker (OAuth) |
| Hosting | Railway (Hobby plan) with a persistent volume; DNS at Namecheap |

## Project structure

```
app/
  (public)/            Public pages; layout.tsx loads theme, header, footer, background
    page.tsx           Homepage
    shop/              Gallery
    product/[slug]/    Artwork page
    about/ contact/ privacy/ terms/ returns/ cart/ checkout/
  admin/
    (auth)/login/      Admin login
    (dashboard)/       Admin pages: products, products/arrange, inquiries, orders,
                       categories, settings/*
  api/                 Route handlers: auth, products, products/reorder, settings,
                       upload, inquiries, orders, categories, checkout, setup,
                       google-photos, webhooks/stripe
  uploads/[...path]/   Serves uploaded images from UPLOAD_DIR
  setup/               First-run setup wizard (creates the admin account)
components/
  public/              Site components (Header, Footer, ProductCard, MasonryGrid,
                       BackgroundLayer, ImageLightbox, InquiryButton, …)
  admin/               Admin components (ProductForm, SettingsForm, GalleryArranger, …)
  ui/                  Shared UI primitives (Button, Input, Select, Modal, …)
lib/
  settings.ts          Read/write settings (key/value rows, grouped; sensitive keys encrypted)
  theme.ts             Builds theme CSS, Google Fonts URL, background image settings
  gallery.ts           Gallery ordering (newest/oldest/custom, available first)
  storage.ts           Upload directory and allowed image types
  auth.ts              Password hashing and session cookies
  images.ts, products.ts, stripe.ts, google.ts, encryption.ts, db.ts
prisma/schema.prisma   Models: User, Product, Order, Inquiry, Category, Setting
middleware.ts          Redirects unauthenticated /admin requests to the login page
```

### How content is stored
Almost all editable content lives in the `Setting` table as key/value pairs grouped by settings page (`homepage`, `appearance`, `shop`, `contact`, …). Pages read these on every request (`export const dynamic = 'force-dynamic'` in the public layout), so admin edits appear immediately without a rebuild.

Artwork lives in `Product`. `sortOrder` holds the custom gallery arrangement; images are a JSON list of URLs such as `/uploads/1790463606824-j3ayeo.jpg`.

## Running locally

Requirements: Node.js 20+.

```bash
npm install                 # also generates the Prisma client
cp .env.example .env        # then fill in the values (see below)
npm run db:push             # create/update the SQLite database
npm run dev                 # http://localhost:3000
```

On a fresh database the site redirects to `/setup` to create the admin account.

> The local database (`prisma/dev.db`) and images (`public/uploads/`) are **not** in git and are **not** synced with the live site. Since launch, the live site is the source of truth for content — make content changes in the live admin.

### Environment variables

| Variable | Purpose |
|---|---|
| `DATABASE_URL` | SQLite file. Locally `file:./dev.db`; in production `file:/data/prod.db` |
| `UPLOAD_DIR` | Where uploaded images are saved. Unset locally (uses `public/uploads`); in production `/data/uploads` |
| `SESSION_SECRET` | Signs admin session cookies. Generate with `openssl rand -base64 32` |
| `ENCRYPTION_KEY` | Encrypts sensitive settings such as Stripe keys. `openssl rand -hex 32`. Changing it makes stored encrypted values unreadable |
| `NEXT_PUBLIC_APP_URL` | Public site URL (used for the Google OAuth redirect). Production: `https://beckyklenk.com` |
| `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` | Optional, for the Google Photos picker |

### Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Development server |
| `npm run build` | `prisma generate` + production build |
| `npm start` | `prisma db push` (sync schema) + production server |
| `npm run lint` | ESLint |
| `npm run db:push` | Apply `schema.prisma` to the database |
| `npm run db:studio` | Browse the database in Prisma Studio |

## Production

### Hosting (Railway)
- Project **art-show**, service **art-show**, environment **production**.
- Deploys automatically on every push to **`main`** of `github.com/beckynla/art-show`.
- Build: `npm run build`. Start: `npm start`, which runs `prisma db push` before starting, so schema changes are applied on deploy. Changes that would lose data will make the deploy fail rather than drop data.
- The app listens on port **8080** (Railway's `PORT`).
- Persistent volume **`art-show-volume`** mounted at **`/data`** holds `prod.db` and `uploads/`. **Never delete this volume** — it is all of the site's content. Everything outside `/data` is rebuilt on each deploy.
- Temporary Railway address: https://art-show-production.up.railway.app

### Domain (Namecheap → Advanced DNS)

| Type | Host | Value |
|---|---|---|
| ALIAS | `@` | `yd05lufa.up.railway.app` |
| CNAME | `www` | `bcwfuu4l.up.railway.app` |
| TXT | `_railway-verify` | `railway-verify=066d5a…` (Railway ownership check for `beckyklenk.com`) |
| TXT | `_railway-verify.www` | `railway-verify=68e93c…` (ownership check for `www.beckyklenk.com`) |

Keep both TXT records: Railway uses them to issue and renew the HTTPS certificates. If a domain is ever removed and re-added in Railway, it gets new CNAME and TXT values that must be copied into Namecheap. Namecheap's email-forwarding SPF record is managed under Mail Settings and does not appear in the host records list.

### Deploying a change
1. Make and test the change locally.
2. Commit and push to `main`.
3. Watch the deploy: `railway deployment list --service art-show` (or the Railway dashboard).

### Common tasks
- **Admin login:** https://www.beckyklenk.com/admin
- **Reset the admin password** (there is no "forgot password" link): run `railway ssh --service art-show` in Terminal, then on the server:
  ```bash
  DATABASE_URL=file:/data/prod.db node -e 'const b=require("bcryptjs");const {PrismaClient}=require("@prisma/client");const p=new PrismaClient();(async()=>{const u=await p.user.update({where:{email:process.argv[2]},data:{password:await b.hash(process.argv[1],12)}});console.log("Password updated for",u.email);await p.$disconnect()})()' 'NEW-PASSWORD' 'ADMIN-EMAIL'
  ```
  Avoid single quotes in the password.
- **Back up content:** the database and images exist only on the Railway volume. Check the volume's page in the Railway dashboard for backup options available on your plan.
- **Google Photos picker:** the Google Cloud OAuth client must list `https://beckyklenk.com/api/auth/google/callback` as an authorized redirect URI.

## Notes and gotchas
- Uploaded images are served by `app/uploads/[...path]/route.ts` rather than from `public/`, because a production Next.js server only serves files that were in `public/` at build time.
- Upload file extensions come from the verified image type, never from the original filename, and the image route only serves image types.
- `railway ssh` only opens an interactive shell: it drops quoting and cannot receive piped files.
- Public pages are rendered per request on purpose. Removing `dynamic = 'force-dynamic'` from `app/(public)/layout.tsx` would freeze admin-edited pages at build time.
