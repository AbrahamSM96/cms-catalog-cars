import * as migration_20260824_160008_initial from './20260824_160008_initial';
import * as migration_20260826_152034_site_settings_show_name from './20260826_152034_site_settings_show_name';

export const migrations = [
  {
    up: migration_20260824_160008_initial.up,
    down: migration_20260824_160008_initial.down,
    name: '20260824_160008_initial',
  },
  {
    up: migration_20260826_152034_site_settings_show_name.up,
    down: migration_20260826_152034_site_settings_show_name.down,
    name: '20260826_152034_site_settings_show_name'
  },
];
