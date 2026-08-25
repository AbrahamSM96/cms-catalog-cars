import * as migration_20260824_160008_initial from './20260824_160008_initial';

export const migrations = [
  {
    up: migration_20260824_160008_initial.up,
    down: migration_20260824_160008_initial.down,
    name: '20260824_160008_initial'
  },
];
