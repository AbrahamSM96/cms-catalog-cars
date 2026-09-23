import * as migration_20260824_160008_initial from './20260824_160008_initial';
import * as migration_20260826_152034_site_settings_show_name from './20260826_152034_site_settings_show_name';
import * as migration_20260831_035511 from './20260831_035511';
import * as migration_20260904_194504_seminuevos_cities from './20260904_194504_seminuevos_cities';
import * as migration_20260909_193405_vin_decodes from './20260909_193405_vin_decodes';
import * as migration_20260909_201555_version_optional from './20260909_201555_version_optional';
import * as migration_20260915_061419_leads from './20260915_061419_leads';
import * as migration_20260923_211519 from './20260923_211519';

export const migrations = [
  {
    up: migration_20260824_160008_initial.up,
    down: migration_20260824_160008_initial.down,
    name: '20260824_160008_initial',
  },
  {
    up: migration_20260826_152034_site_settings_show_name.up,
    down: migration_20260826_152034_site_settings_show_name.down,
    name: '20260826_152034_site_settings_show_name',
  },
  {
    up: migration_20260831_035511.up,
    down: migration_20260831_035511.down,
    name: '20260831_035511',
  },
  {
    up: migration_20260904_194504_seminuevos_cities.up,
    down: migration_20260904_194504_seminuevos_cities.down,
    name: '20260904_194504_seminuevos_cities',
  },
  {
    up: migration_20260909_193405_vin_decodes.up,
    down: migration_20260909_193405_vin_decodes.down,
    name: '20260909_193405_vin_decodes',
  },
  {
    up: migration_20260909_201555_version_optional.up,
    down: migration_20260909_201555_version_optional.down,
    name: '20260909_201555_version_optional',
  },
  {
    up: migration_20260915_061419_leads.up,
    down: migration_20260915_061419_leads.down,
    name: '20260915_061419_leads',
  },
  {
    up: migration_20260923_211519.up,
    down: migration_20260923_211519.down,
    name: '20260923_211519'
  },
];
