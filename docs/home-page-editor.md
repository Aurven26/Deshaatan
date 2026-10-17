# Home Page editor

Open `/admin/globals/home-page` or **Website → Home Page** in the admin menu.
The tabs follow the page: Header, Hero banners, Categories, Popular trips, Travel guides,
Religious trips, Testimonials, Enquiry form, About & links, Airport transfer, Footer, SEO.
Save applies changes to the website. Versions retains earlier saved content.

The **Header → Website favicon** upload sets the browser tab icon across the website.
Use a square PNG (512 × 512 recommended). In **Hero banners**, turn off **Show hero
banners** to hide the full carousel, or **Show this banner** to hide an individual
slide. The images and text stay saved.

- Edit headings, body copy, buttons, destinations, links, labels and section visibility in these tabs.
- The original banner, category, background, logo and airport artwork is already selected in upload fields.
- Reorder hero banners and link rows by dragging their handles. New banners support either uploaded artwork alone or a photo with editable text and button.
- Keep **Use All** enabled to automatically show records from the corresponding collection. Turn it off to choose and order individual trips, guides or testimonials in **Items**.
- Trip titles, prices, duration and photos remain in Itineraries; guide details in Guides; traveller names, text, ratings and portraits in Testimonials. The content library links open those editors.
- Navigation and contact/social details are shared with other pages and remain in Navigation and Site Settings.
- Categories, header Guides and header Login start hidden, preserving the current site settings.
- Footer links support normal URLs or the existing corporate, hiring, partner and car-rental forms.

## Existing-content import

`node --env-file=.env.local --import tsx scripts/import-homepage.ts` fills missing upload
relationships from the original `public/figma` assets and initializes the Home Page global.
It preserves existing CMS images and already initialized homepage values. SVG logos are
imported as high-resolution PNG uploads because the Media collection accepts raster images.
The regular CMS seed and production migration also invoke the import.
