import type {Field} from 'payload';

const absoluteURL = (value: string | null | undefined) => {
  if (!value) return true;
  try { return ['http:', 'https:'].includes(new URL(value).protocol) || 'Enter an HTTP or HTTPS URL.'; }
  catch { return 'Enter a complete URL, including https://.'; }
};

export const itinerarySEO: Field = {name: 'seo', label: 'SEO Section', type: 'group', fields: [
  {name: 'title', label: 'Meta Title', type: 'text', maxLength: 70},
  {name: 'description', label: 'Meta Description', type: 'textarea', maxLength: 170},
  {name: 'keywords', label: 'Meta Keywords', type: 'text', admin: {description: 'Separate keywords with commas.'}},
  {name: 'robots', label: 'Robots Tag', type: 'select', options: [
    {label: 'index, follow', value: 'index-follow'}, {label: 'noindex, follow', value: 'noindex-follow'},
    {label: 'index, nofollow', value: 'index-nofollow'}, {label: 'noindex, nofollow', value: 'noindex-nofollow'},
  ], admin: {description: 'Defaults to index, follow.'}},
  {name: 'canonicalURL', label: 'Canonical URL', type: 'text', validate: absoluteURL},
  {name: 'hreflang', label: 'Hreflang Tag', type: 'array', fields: [
    {name: 'language', type: 'text', required: true, validate: (value: string | null | undefined) => !!value && /^(x-default|[a-z]{2,3}(?:-[A-Za-z0-9]{2,8})*)$/.test(value) || 'Use a language code such as en-IN or x-default.'},
    {name: 'url', label: 'URL', type: 'text', required: true, validate: absoluteURL},
  ]},
  {name: 'image', label: 'Social sharing image', type: 'upload', relationTo: 'media'},
  {name: 'noIndex', type: 'checkbox', defaultValue: false, admin: {hidden: true}},
]};
