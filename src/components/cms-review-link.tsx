'use client';
import {SectionLabel} from './section-menu-field';
export default function CMSReviewLink() {
  return <div style={{margin: '24px 0'}}><SectionLabel label="Reviews" visibilityPath="sectionVisibility.reviews"/><p>Manage the shared reviews and customer reviews for each itinerary. Publish approved submissions to display them on their itinerary page.</p><a href="/admin/collections/reviews">Manage reviews</a></div>;
}
