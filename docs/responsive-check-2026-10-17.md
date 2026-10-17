# Responsive template check — 17 October 2026

- Mobile itinerary enquiry bar now uses the reference's solid orange, white-text button, circular contact actions, divider and two-row layout. Prices remain specific to each itinerary, and the device safe-area inset is retained.
- Fixed long CMS titles overflowing the breadcrumb. Long city names, headings and day descriptions can wrap. Mobile gallery photos use proportional cover cropping rather than stretching.
- Mobile forms use 16px input text and stack their paired fields below 380px. The footer has clearance beneath the fixed enquiry bar.
- Mobile attraction/activity sections now respect the same CMS visibility settings as desktop.
- CMS information-page templates wrap long text/URLs, constrain embedded media, and keep wide tables scrollable within their own container.

Browser viewport checks:

- All 10 published itineraries at 320px: no document-level horizontal overflow.
- Home, About, Privacy, Contact, FAQ and Tour Packages at 320px: no document-level horizontal overflow.
- CMS-created Shimla itinerary, Golden Triangle, About, Contact, FAQ and Tour Packages at 390, 430, 768 and 1024px: no document-level horizontal overflow and expected page headings present.
- Mobile enquiry button opens the correct itinerary enquiry dialog. At 390 × 844 the long-title dialog fits horizontally and vertically without internal horizontal overflow.
- These changes apply to the shared itinerary and CMS page renderers, including future documents using those templates. New custom layouts/components still require their own responsive review.

These are browser viewport checks, not physical-device or every-browser certification. No customer data or CMS content was changed.
