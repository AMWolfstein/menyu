# Blue Freeze — بلو فريز

Arabic (RTL) digital menu and ordering site for a frozen chicken/meat/fish/
sauces/spices supplier. Customers scan a QR code or open the site, browse the
live menu, add items to a cart, and check out straight to WhatsApp. The whole
catalog, storefront layout, and business settings are managed from a
password-protected admin dashboard — no redeploy needed to change anything.

Live at [bluefreeze.vercel.app](https://bluefreeze.vercel.app).

## Stack

- **Next.js 16** (App Router, Turbopack) + **React 19** + **TypeScript**
- **Tailwind CSS v4**
- **Firebase**: Firestore (data) + Auth (admin login) — Spark (free) plan
- **Cloudinary**: image hosting for product photos, restaurant logo, and
  auto-generated PWA/notification icons
- **web-push**: Web Push API notifications (VAPID)
- Installable **PWA** with a service worker (`public/sw.js`)

## Features

**Storefront**
- Live menu grid, independently configurable columns for mobile/desktop
- Search, category filters, supplier filter, discounts tab, best-sellers tab
  (real top-20 by actual order count)
- Sort by newest/oldest, price, or supplier
- Cart → checkout form (branches, delivery zones, payment methods, all
  admin-managed) → order sent as a formatted WhatsApp message
- Downloadable printable menu poster (`/menu`) and QR code page (`/qr`)
- Installable as a PWA; push notifications for new items and discounts

**Admin dashboard** (`/admin`)
- Categories, items (with price variants, discounts, badges, supplier
  assignment, images)
- Orders log with revenue/best-seller stats
- Branches, delivery zones, payment methods, poster footer links, hero banner
  images
- Homepage grid-column layout control (mobile/desktop independent)
- Automated + manual Firestore backups, with export to a local JSON file and
  restore from either a saved backup or an uploaded file

## Project structure

```
src/app/                    routes (App Router)
  page.tsx                  homepage (renders MenuLive)
  cart/page.tsx              cart + checkout page
  menu/page.tsx               printable/shareable menu poster
  qr/page.tsx                 downloadable QR code page
  admin/login, admin/dashboard   admin auth + dashboard
  api/send-notification/       sends a web push notification
  api/cron/backup/            daily scheduled Firestore backup (vercel.json)
src/components/              storefront UI (MenuLive, MenuItemCard, CartBar…)
src/components/admin/        dashboard panels and forms
src/context/CartContext.tsx  cart state
src/hooks/                   Firestore subscriptions, grid layout, push, etc.
src/lib/                     Firestore/Cloudinary/WhatsApp/backup/discount logic
src/types/                   shared TypeScript types
public/sw.js                 service worker (push + install)
firestore.rules              Firestore security rules
```

Everything is data-driven from Firestore — there is no local content file to
edit; all menu/business content is managed from `/admin`.

## Setup

Copy `.env.local.example` to `.env.local` and fill in:

- Firebase project keys (Console → Project settings → Your apps)
- Cloudinary cloud name + an **unsigned** upload preset
- VAPID keys for push notifications (`npx web-push generate-vapid-keys`)
- `BACKUP_ADMIN_EMAIL` / `BACKUP_ADMIN_PASSWORD` — an admin account used
  server-side by the notification and cron-backup routes
- `CRON_SECRET` — protects `/api/cron/backup` from unauthenticated calls
- `NEXT_PUBLIC_SITE_URL` — used in `sitemap.xml`/`robots.txt`

Then paste `firestore.rules` into the Firebase console (Firestore → Rules).

```bash
npm install
npm run dev      # http://localhost:3000
```

```bash
npm run build
npm run start
```

## Deploy

Deploys to Vercel with no extra configuration beyond the environment
variables above. `vercel.json` schedules the daily backup cron job.

## License

MIT — see [LICENSE](LICENSE).

---

Copyright (c) 2026 Mohammed Asghar edited with claude AI
