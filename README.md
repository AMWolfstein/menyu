# menyu

Digital QR menu for restaurants and cafes. Customers scan a code at the table
and the menu opens on their phone; prices and items update without reprinting.
Single-page, statically rendered, Arabic (RTL).

![desktop](docs/screenshots/desktop.jpg)

## Stack

- Next.js 16 (App Router) + React 19 + TypeScript
- Tailwind CSS v4
- `qrcode` for client-side QR generation

## Layout

```
src/app/layout.tsx          RTL + Arabic font (Cairo)
src/app/page.tsx            menu page (server component)
src/app/qr/page.tsx         downloadable QR code page (client)
src/app/globals.css         theme tokens
src/components/MenuHeader.tsx
src/components/CategoryNav.tsx   sticky nav, scroll-spy via IntersectionObserver
src/components/MenuItemCard.tsx
src/data/menu.ts            restaurant info + categories (all content lives here)
src/lib/format.ts           price formatting
```

The whole menu is data-driven: edit `src/data/menu.ts` (the `restaurant` and
`categories` exports) to change content — no component changes needed. Pages are
statically rendered, so there is no backend or database.

`CategoryNav` tracks the visible section with an `IntersectionObserver` and
scrolls to a section on click. `qr/page.tsx` renders the deployed URL to a
canvas with `qrcode` and exposes a PNG download for printing table cards.

## Run

```bash
npm install
npm run dev      # http://localhost:3000
```

```bash
npm run build
npm run start
```

## Screenshots

| desktop | mobile |
| --- | --- |
| ![menu](docs/screenshots/desktop-menu.jpg) | ![mobile](docs/screenshots/mobile.jpg) |

## Deploy

Static output; deploys to Vercel or Netlify with no configuration. After
deploying, open `/qr` to download the QR code that points at the live menu.

## License

MIT
