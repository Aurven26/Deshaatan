# Editing Pages

Open **Content → Pages** in `/admin` and choose a page, or create a new one.
Page sections contain the existing page text as normal form fields and rich text editors.
Add headings, text, lists, tables, divider lines, contact links and images with **Add Section**.
Drag section handles to reorder them. The optional Introduction editor appears above the sections.

Use **Save Draft** while editing and **Publish changes** to update the website.
The preview shows the draft without making it public. New page slugs open at `/<slug>`;
existing application routes such as `/contact-us`, `/faq`, `/tour-packages` and `/admin`
continue to use their dedicated screens.

SEO matches Itineraries: Meta Title, Meta Description, Meta Keywords, Robots Tag,
Canonical URL, Hreflang rows and a social sharing image. These values are used by
the public page's metadata.

Existing layouts are converted by `scripts/import-page-sections.ts`, called by the
production migration and CMS seed. The legacy JSON remains hidden for compatibility.
