# Footer forms

The shared footer opens partnership, hiring and corporate-tour forms via `SiteDialog`.
Submissions use `POST /api/contact-requests`. Hiring accepts PDF resumes up to 2 MB.
Records now use the Payload `leads` and `applications` collections in PostgreSQL.
Resumes use the protected `private-files` collection. Local files remain outside the public directory;
production files use a private Vercel Blob store. See [payload-backend.md](payload-backend.md).
Success means the database saved the record. SMTP delivery is configured separately.

Vercel resume submissions fail explicitly until private storage is configured. Request rate limiting
uses PostgreSQL counters. Staff can review submissions in the CMS admin with access restrictions.

Facebook, X/Twitter and YouTube entries are commented out in `src/components/site-footer.tsx`.
Uncomment those entries to restore them. Instagram remains visible.

The two India link grids use the requested labels and open destination-specific enquiries;
dedicated itinerary pages for all nine destinations do not currently exist.
