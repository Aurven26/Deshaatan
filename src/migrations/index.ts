import * as migration_20261012_110144_initial from './20261012_110144_initial';
import * as migration_20261012_111853_private_storage_and_legacy_import from './20261012_111853_private_storage_and_legacy_import';
import * as migration_20261015_132921_itinerary_page_sections from './20261015_132921_itinerary_page_sections';
import * as migration_20261015_140701_itinerary_policies_reviews_seo from './20261015_140701_itinerary_policies_reviews_seo';
import * as migration_20261015_144409_lead_table_fields from './20261015_144409_lead_table_fields';
import * as migration_20261017_095925_home_page_editor from './20261017_095925_home_page_editor';
import * as migration_20261017_100800_page_content_editor from './20261017_100800_page_content_editor';
import * as migration_20261017_101723_home_favicon_banner_visibility from './20261017_101723_home_favicon_banner_visibility';
import * as migration_20261017_113723_thumbnails_section_visibility from './20261017_113723_thumbnails_section_visibility';

export const migrations = [
  {
    up: migration_20261012_110144_initial.up,
    down: migration_20261012_110144_initial.down,
    name: '20261012_110144_initial',
  },
  {
    up: migration_20261012_111853_private_storage_and_legacy_import.up,
    down: migration_20261012_111853_private_storage_and_legacy_import.down,
    name: '20261012_111853_private_storage_and_legacy_import',
  },
  {
    up: migration_20261015_132921_itinerary_page_sections.up,
    down: migration_20261015_132921_itinerary_page_sections.down,
    name: '20261015_132921_itinerary_page_sections',
  },
  {
    up: migration_20261015_140701_itinerary_policies_reviews_seo.up,
    down: migration_20261015_140701_itinerary_policies_reviews_seo.down,
    name: '20261015_140701_itinerary_policies_reviews_seo',
  },
  {
    up: migration_20261015_144409_lead_table_fields.up,
    down: migration_20261015_144409_lead_table_fields.down,
    name: '20261015_144409_lead_table_fields',
  },
  {
    up: migration_20261017_095925_home_page_editor.up,
    down: migration_20261017_095925_home_page_editor.down,
    name: '20261017_095925_home_page_editor',
  },
  {
    up: migration_20261017_100800_page_content_editor.up,
    down: migration_20261017_100800_page_content_editor.down,
    name: '20261017_100800_page_content_editor',
  },
  {
    up: migration_20261017_101723_home_favicon_banner_visibility.up,
    down: migration_20261017_101723_home_favicon_banner_visibility.down,
    name: '20261017_101723_home_favicon_banner_visibility',
  },
  {
    up: migration_20261017_113723_thumbnails_section_visibility.up,
    down: migration_20261017_113723_thumbnails_section_visibility.down,
    name: '20261017_113723_thumbnails_section_visibility'
  },
];
