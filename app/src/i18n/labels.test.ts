import { describe, expect, it } from 'vitest'

import { Brands } from '../collections/Brands'
import { CarModels } from '../collections/CarModels'
import { CarVersions } from '../collections/CarVersions'
import { Colors } from '../collections/Colors'
import { Media } from '../collections/Media'
import { Users } from '../collections/Users'

import type { Translated } from './locales'

import * as catalog from './labels'
import { LOCALES } from './locales'

// Rutas donde el inglés y el español coinciden legítimamente.
const IDENTICAL = new Set([
  'brands.fields.slug.label',
  'cars.options.bodyType.convertible',
  'cars.options.bodyType.hatchback',
  'cars.options.bodyType.minivan',
  'cars.options.bodyType.suv',
  'cars.options.transmission.manual',
  'cars.tabs.facebookMarketplace.label',
  'cars.tabs.general.label',
  'colors.fields.name.label',
  'colors.labels.singular',
  'common.whatsapp',
  'contact.fields.social.fields.facebook.label',
  'contact.fields.social.fields.instagram.label',
  'contact.fields.social.fields.tiktok.label',
  'contact.fields.social.fields.youtube.label',
  'dealerships.tabs.general.label',
  'homepage.fields.heroSlides.labels.plural',
  'homepage.fields.heroSlides.labels.singular',
  'siteSettings.fields.media.fields.favicon.label',
  'siteSettings.fields.media.fields.logo.label',
  'siteSettings.fields.seo.label',
  'users.fields.roles.label',
  'users.fields.roles.options.editor',
])

// Palabras que en español SIEMPRE llevan tilde o eñe, en orden alfabético.
// No agregar aquí palabras que también existen sin tilde (mas, esta, aun,
// solo, publico como verbo): darían falsos positivos sobre texto correcto.
const NEEDS_ACCENT =
  /\b(ano|anos|aqui|area|articulo|asi|automatica|automaticamente|automatico|boton|camara|carroceria|catalogo|categoria|codigo|codigos|completalo|condicion|configuracion|credito|deposito|descripcion|despues|dia|dias|diesel|direccion|dueno|duenos|electrica|electrico|espanol|especifico|galeria|garantia|hibrido|imagenes|informacion|interes|linea|maximo|miercoles|minimo|numero|opcion|pagina|pais|proximo|sabado|seleccion|segun|tambien|tecnica|tecnico|telefono|titulo|transmision|ubicacion|ultima|ultimo|unica|unico|unicos|vacio|valido|vendio|version)\b/i

/**
 * Flatten catalog to [path, Translated] pairs.
 *
 * @param obj - The catalog object.
 * @param prefix - Current path prefix.
 */
function flattenCatalog(
  obj: unknown,
  prefix = ''
): Array<[string, Translated]> {
  const result: Array<[string, Translated]> = []

  if (
    obj &&
    typeof obj === 'object' &&
    'en' in obj &&
    'es' in obj &&
    typeof obj.en === 'string' &&
    typeof obj.es === 'string'
  ) {
    result.push([prefix, obj as Translated])
  } else if (obj && typeof obj === 'object') {
    for (const key of Object.keys(obj)) {
      const path = prefix ? `${prefix}.${key}` : key
      result.push(
        ...flattenCatalog((obj as Record<string, unknown>)[key], path)
      )
    }
  }

  return result
}

describe('i18n labels', () => {
  const entries = flattenCatalog(catalog)

  it('has both locales present and non-empty for all entries', () => {
    expect(LOCALES).toEqual(['en', 'es'])

    for (const [path, translated] of entries) {
      for (const locale of LOCALES) {
        const text = translated[locale]
        expect(
          text && text.trim().length > 0,
          `${path}.${locale} should be non-empty`
        ).toBe(true)
      }
    }
  })

  it('has en !== es except for allowlisted paths', () => {
    for (const [path, translated] of entries) {
      if (IDENTICAL.has(path)) {
        expect(
          translated.en,
          `${path} is in IDENTICAL, so en should equal es`
        ).toBe(translated.es)
      } else {
        expect(
          translated.en,
          `${path} is not in IDENTICAL, so en should differ from es`
        ).not.toBe(translated.es)
      }
    }

    // Verify IDENTICAL paths exist in catalog
    for (const path of IDENTICAL) {
      const found = entries.some(([p]) => p === path)
      expect(found, `IDENTICAL path ${path} should exist in catalog`).toBe(true)
    }
  })

  it('Spanish text does not contain unaccented words that need accents', () => {
    for (const [path, translated] of entries) {
      const match = translated.es.match(NEEDS_ACCENT)
      expect(
        match,
        `${path}.es contains unaccented word(s) that need tilde: ${match ? match[0] : ''}`
      ).toBeNull()
    }
  })

  it('wires Colors collection labels and descriptions from i18n labels', () => {
    expect(Colors.admin?.group).toEqual(catalog.groups.settings)
    expect(Colors.admin?.description).toEqual(catalog.colors.description)
    expect(Colors.labels).toEqual(catalog.colors.labels)

    const colorFields = Colors.fields as Array<{
      admin?: { description?: unknown }
      label?: unknown
      name?: string
    }>
    const hexField = colorFields.find((field) => field.name === 'hex')
    const nameField = colorFields.find((field) => field.name === 'name')

    expect(nameField?.label).toEqual(catalog.colors.fields.name.label)
    expect(nameField?.admin?.description).toEqual(
      catalog.colors.fields.name.description
    )
    expect(hexField?.label).toEqual(catalog.colors.fields.hex.label)
    expect(hexField?.admin?.description).toEqual(
      catalog.colors.fields.hex.description
    )
  })

  it('wires Users collection labels, group and role options from i18n labels', () => {
    expect(Users.admin?.group).toEqual(catalog.groups.settings)
    expect(Users.labels).toEqual(catalog.users.labels)

    const userFields = Users.fields as Array<{
      label?: unknown
      name?: string
      options?: Array<{ label: unknown; value: string }>
    }>
    const rolesField = userFields.find((field) => field.name === 'roles')

    expect(rolesField?.label).toEqual(catalog.users.fields.roles.label)
    expect(rolesField?.options).toEqual([
      {
        label: catalog.users.fields.roles.options.admin,
        value: 'admin',
      },
      {
        label: catalog.users.fields.roles.options.editor,
        value: 'editor',
      },
      {
        label: catalog.users.fields.roles.options.user,
        value: 'user',
      },
    ])
  })

  it('wires Brands collection labels and field labels from i18n labels', () => {
    expect(Brands.admin?.group).toEqual(catalog.groups.settings)
    expect(Brands.labels).toEqual(catalog.brands.labels)

    const brandFields = Brands.fields as Array<{
      admin?: { description?: unknown }
      label?: unknown
      name?: string
    }>
    const nameField = brandFields.find((field) => field.name === 'name')
    const slugField = brandFields.find((field) => field.name === 'slug')

    expect(nameField?.label).toEqual(catalog.common.name)
    expect(slugField?.label).toEqual(catalog.brands.fields.slug.label)
    expect(slugField?.admin?.description).toEqual(
      catalog.brands.fields.slug.description
    )
  })

  it('wires CarModels collection labels and descriptions from i18n labels', () => {
    expect(CarModels.admin?.group).toEqual(catalog.groups.settings)
    expect(CarModels.labels).toEqual(catalog.carModels.labels)

    const modelFields = CarModels.fields as Array<{
      admin?: { description?: unknown }
      label?: unknown
      name?: string
    }>
    const brandField = modelFields.find((field) => field.name === 'brand')
    const nameField = modelFields.find((field) => field.name === 'name')

    expect(brandField?.label).toEqual(catalog.common.brand)
    expect(brandField?.admin?.description).toEqual(
      catalog.carModels.fields.brand.description
    )
    expect(nameField?.label).toEqual(catalog.common.name)
  })

  it('wires CarVersions collection labels and descriptions from i18n labels', () => {
    expect(CarVersions.admin?.group).toEqual(catalog.groups.settings)
    expect(CarVersions.labels).toEqual(catalog.carVersions.labels)

    const versionFields = CarVersions.fields as Array<{
      admin?: { description?: unknown }
      label?: unknown
      name?: string
    }>
    const claveField = versionFields.find((field) => field.name === 'clave')
    const descriptionField = versionFields.find(
      (field) => field.name === 'description'
    )
    const modelField = versionFields.find((field) => field.name === 'model')
    const yearsField = versionFields.find((field) => field.name === 'years')

    expect(claveField?.label).toEqual(catalog.carVersions.fields.clave.label)
    expect(claveField?.admin?.description).toEqual(
      catalog.carVersions.fields.clave.description
    )
    expect(descriptionField?.label).toEqual(catalog.common.description)
    expect(modelField?.label).toEqual(catalog.common.model)
    expect(modelField?.admin?.description).toEqual(
      catalog.carVersions.fields.model.description
    )
    expect(yearsField?.label).toEqual(catalog.carVersions.fields.years.label)
    expect(yearsField?.admin?.description).toEqual(
      catalog.carVersions.fields.years.description
    )
  })

  it('wires Media collection labels and field labels from i18n labels', () => {
    expect(Media.admin?.group).toEqual(catalog.groups.content)
    expect(Media.labels).toEqual(catalog.media.labels)

    const mediaFields = Media.fields as Array<{
      admin?: { description?: unknown }
      label?: unknown
      name?: string
    }>
    const altField = mediaFields.find((field) => field.name === 'alt')

    expect(altField?.label).toEqual(catalog.media.fields.alt.label)
    expect(altField?.admin?.description).toEqual(
      catalog.media.fields.alt.description
    )
  })
})
