import { describe, expect, it } from 'vitest'

import { Brands } from '../collections/Brands'
import { CarModels } from '../collections/CarModels'
import { CarVersions } from '../collections/CarVersions'
import { Cars } from '../collections/Cars'
import { Colors } from '../collections/Colors'
import { Dealerships } from '../collections/Dealerships'
import { Media } from '../collections/Media'
import { Users } from '../collections/Users'
import { Contact } from '../globals/Contact'
import { Homepage } from '../globals/Homepage'
import { SiteSettings } from '../globals/SiteSettings'

interface EntityLike {
  admin?: { description?: unknown; group?: unknown }
  fields?: unknown
  label?: unknown
  labels?: { plural?: unknown; singular?: unknown }
  slug?: string
}

interface FieldLike {
  admin?: { description?: unknown }
  description?: unknown
  fields?: unknown
  label?: unknown
  labels?: { plural?: unknown; singular?: unknown }
  name?: string
  options?: unknown
  tabs?: unknown
}

const ENTITIES: Array<[string, EntityLike]> = [
  ['brands', Brands],
  ['carModels', CarModels],
  ['carVersions', CarVersions],
  ['cars', Cars],
  ['colors', Colors],
  ['contact', Contact],
  ['dealerships', Dealerships],
  ['homepage', Homepage],
  ['media', Media],
  ['siteSettings', SiteSettings],
  ['users', Users],
]

/**
 * Check whether a value is a translated record instead of a raw string.
 *
 * @param value - The value to check.
 */
function isTranslated(value: unknown): boolean {
  return (
    typeof value === 'object' &&
    value !== null &&
    'en' in value &&
    'es' in value
  )
}

/**
 * Record a violation when a translatable slot holds something other than a
 * translated record.
 *
 * @param value - The slot value.
 * @param path - Human readable path of the slot.
 * @param out - Accumulator of violations.
 */
function check(value: unknown, path: string, out: string[]): void {
  if (value === undefined || value === false) return
  if (!isTranslated(value)) out.push(`${path} → ${JSON.stringify(value)}`)
}

/**
 * Walk a field array and collect every untranslated slot.
 *
 * @param fields - The field array.
 * @param path - Path of the parent node.
 * @param out - Accumulator of violations.
 */
function walkFields(fields: unknown, path: string, out: string[]): void {
  if (!Array.isArray(fields)) return

  fields.forEach((raw, index) => {
    const field = raw as FieldLike
    const here = field.name ? `${path}.${field.name}` : `${path}[${index}]`

    check(field.label, `${here}.label`, out)
    check(field.admin?.description, `${here}.admin.description`, out)

    if (field.labels) {
      check(field.labels.plural, `${here}.labels.plural`, out)
      check(field.labels.singular, `${here}.labels.singular`, out)
    }

    if (Array.isArray(field.options)) {
      field.options.forEach((option, optionIndex) => {
        if (
          typeof option === 'object' &&
          option !== null &&
          'label' in option
        ) {
          check(
            (option as { label: unknown }).label,
            `${here}.options[${optionIndex}].label`,
            out
          )
        }
      })
    }

    walkFields(field.fields, here, out)

    if (Array.isArray(field.tabs)) {
      field.tabs.forEach((rawTab, tabIndex) => {
        const tab = rawTab as FieldLike
        const tabPath = `${here}.tabs[${tabIndex}]`

        check(tab.label, `${tabPath}.label`, out)
        check(tab.admin?.description, `${tabPath}.admin.description`, out)
        check(tab.description, `${tabPath}.description`, out)
        walkFields(tab.fields, tabPath, out)
      })
    }
  })
}

/**
 * Collect every untranslated slot of a collection or global.
 *
 * @param name - Key of the entity.
 * @param entity - The collection or global config.
 */
function violationsOf(name: string, entity: EntityLike): string[] {
  const out: string[] = []

  check(entity.label, `${name}.label`, out)
  check(entity.admin?.description, `${name}.admin.description`, out)
  check(entity.admin?.group, `${name}.admin.group`, out)

  if (entity.labels) {
    check(entity.labels.plural, `${name}.labels.plural`, out)
    check(entity.labels.singular, `${name}.labels.singular`, out)
  }

  walkFields(entity.fields, name, out)

  return out
}

describe('i18n wiring', () => {
  for (const [name, entity] of ENTITIES) {
    it(`${name} reads every label and description from the catalog`, () => {
      expect(violationsOf(name, entity)).toEqual([])
    })
  }
})
