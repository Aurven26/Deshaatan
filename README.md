# Deshaatan

Next.js App Router, React, TypeScript, and responsive CSS implementation of the supplied Deshaatan Figma homepage (node 2061:2781).

## Run

Use Node.js 20.9 or newer.

```sh
npm install
npm run dev
```

Open http://localhost:3000.

```sh
npm run build
npm start
```

The project also includes a pnpm lockfile; pnpm can be used instead of npm.

## Design

- Original Figma raster images and SVGs are stored in public/figma.
- Plus Jakarta Sans and Inter are served locally.
- The desktop layout follows node 2061:2781 at 1512px; mobile follows node 2094:2162 at 375px, excluding the 90px mock phone/browser chrome. Tablet widths interpolate between them.
- Mobile has its own hero artwork, horizontally scrollable package/guide rows, and accessible city/footer accordions. The desktop airport-transfer banner opens an enquiry.
- Char Dham's normal/hover states follow node 2102:10785: copy rises 70px and the outlined callback appears, without lifting or zooming the photo. Keyboard focus exposes the same action. Figma returned no timeline animation data for these variants, so no unprovided timing was invented.
- Package photographs use Next.js image optimization.
- Main implementation: src/components/home.tsx, src/components/mobile-hero.tsx, src/app/globals.css, and src/app/responsive-design.css.

## Interactions and integrations

The banner controls, optional autoplay, destination search, travel categories, duration selection, package enquiry dialogs, guide previews, share links, mobile navigation, and form validation work locally.

The itinerary and callback forms prepare an email to the contact address supplied by the design. They do not claim to store or send leads. Connect a CRM/email API to submitEnquiry when credentials and the intended provider are available.

Login, legal, and social pages were not provided in the Figma frame; their controls display contact information rather than fabricated account or policy content. Only one testimonial was supplied.

The WhatsApp link currently opens WhatsApp's recipient chooser with a prefilled enquiry because no verified WhatsApp business number was supplied. Replace its URL with the business's verified wa.me number before production launch.

Copy, prices, dates, contact details, and the repeated Kerala link section intentionally follow the Figma reference, including its sample text.

## Verification

Production build and TypeScript checks pass. Browser checks cover desktop section geometry, loaded images, mobile overflow, search, enquiry dialogs, navigation, and form validation.

## Homepage motion

The site uses IntersectionObserver and CSS, without an animation dependency.
The page and layout remain server components; the existing client homepage mounts
HomepageMotion, which registers existing elements with useReveal. No reveal
wrappers are inserted into the grids.

To animate a new section, add a target to the stable reveals array in
src/components/homepage-motion.tsx:

```tsx
{ selector: ".new-section", variant: "slide-left" },
{ selector: ".new-grid > *", variant: "fade-up", stagger: 90 },
```

Supported variants: fade-up (default), fade-in, slide-left, slide-right, zoom-in.
Other client components can import useReveal and pass a stable array of targets.
Reveal animations last 650ms, start at 15% visibility, and run once per mounted
element. Content stays visible before JavaScript/IntersectionObserver is ready;
there is no permanently hidden initial state. Reduced motion disables animation
and scrolling effects, including if the preference changes while the page is open.
Keyboard focus cancels a running reveal so focused controls are immediately visible.

All motion styles live in src/app/animations.css. Hover effects are scoped to
hover-capable devices and have keyboard focus counterparts. The guide image
wrapper preserves its original dimensions while clipping the hover zoom.
The sticky header remains in document flow; anchor offsets account for its height.

Run focused reveal lifecycle checks with:

```sh
node scripts/check-reveal.mjs
```

There is no existing lint script or ESLint installation in this project. No linter
dependency was added; production TypeScript validation and the focused motion
checks are available.

The home page custom itinerary form submits to `POST /api/itinerary-requests`.
Validated requests are saved as private JSON files in `.data/itinerary-requests/`
(excluded from Git). Set `ITINERARY_REQUESTS_DIR` to a persistent storage directory
when running on a Node server. Before deploying on a serverless host, replace this
file storage with a database or CRM integration. This endpoint stores requests;
it does not send email notifications.

Airport transfer enquiries use `POST /api/airport-transfer-requests` and the
shared Adults/Children picker. Requests are saved privately in
`.data/airport-transfer-requests/`, or `AIRPORT_TRANSFER_REQUESTS_DIR` if set.
The same persistent storage and email/CRM integration requirements apply.

The shared footer's Rent A Car action opens the rental variant of the vehicle
enquiry form on every page. It submits to `POST /api/car-rental-requests`, storing
requests in `.data/car-rental-requests/` (or `CAR_RENTAL_REQUESTS_DIR`). Rental and
airport enquiries share validation, storage, layout, and traveller controls.
