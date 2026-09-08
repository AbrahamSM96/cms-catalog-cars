'use client'

import { useEffect, useState } from 'react'

import type {
  CatalogModelOption,
  CatalogVersionOption,
} from '../../lib/catalog-actions'
import { getCatalogModels, getCatalogVersions } from '../../lib/catalog-actions'
import type { Brand } from '../../types/car'

export interface CatalogSelection {
  brand: Brand
  model: CatalogModelOption
  version: CatalogVersionOption
  year: number
}

interface CatalogPickerProps {
  brands: Brand[]
  onSelect?: (selection: CatalogSelection) => void
}

const SELECT_CLASS =
  "w-full cursor-pointer appearance-none rounded-xl border border-slate-200 bg-white bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%2394a3b8%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpath%20d%3D%22M6%209l6%206%206-6%22/%3E%3C/svg%3E')] bg-[length:1.1rem] bg-[right_0.75rem_center] bg-no-repeat px-4 py-2.5 pr-10 text-sm font-medium text-slate-800 shadow-soft transition-colors hover:border-slate-300 focus:border-accent-500 focus:outline-none focus:ring-2 focus:ring-accent-500/20 disabled:cursor-not-allowed disabled:opacity-50"

const LABEL_CLASS =
  'mb-1.5 block text-xs font-medium tracking-wide text-slate-500 uppercase'

const START_YEAR = 2020

/**
 * Guided cascading picker: año → marca → modelo → versión. Each step loads the
 * next from the vehicle catalog, so a buyer who doesn't know their exact
 * version can drill down to it.
 *
 * @param props - Component props.
 */
export function CatalogPicker(props: CatalogPickerProps): React.JSX.Element {
  const { brands, onSelect } = props

  const currentYear = new Date().getFullYear()
  const years = Array.from(
    { length: currentYear - START_YEAR + 1 },
    (_, i) => currentYear - i
  )

  const [year, setYear] = useState<number | ''>('')
  const [brandSlug, setBrandSlug] = useState('')
  const [modelId, setModelId] = useState<number | string>('')
  const [versionId, setVersionId] = useState<number | string>('')

  const [models, setModels] = useState<CatalogModelOption[]>([])
  const [versions, setVersions] = useState<CatalogVersionOption[]>([])
  const [loadingModels, setLoadingModels] = useState(false)
  const [loadingVersions, setLoadingVersions] = useState(false)

  // Load models whenever the brand changes.
  useEffect((): (() => void) | void => {
    if (!brandSlug) return

    let active = true
    getCatalogModels({ brandSlug })
      .then((result): void => {
        if (active) setModels(result)
      })
      .finally((): void => {
        if (active) setLoadingModels(false)
      })
    return (): void => {
      active = false
    }
  }, [brandSlug])

  // Load versions whenever both a model and a year are selected.
  useEffect((): (() => void) | void => {
    if (!modelId || !year) return

    let active = true
    getCatalogVersions({ modelId, year })
      .then((result): void => {
        if (active) setVersions(result)
      })
      .finally((): void => {
        if (active) setLoadingVersions(false)
      })
    return (): void => {
      active = false
    }
  }, [modelId, year])

  /**
   * Emit the full selection once a version is chosen.
   *
   * @param nextVersionId - The selected version id.
   */
  const handleVersionChange = (nextVersionId: string): void => {
    setVersionId(nextVersionId)
    const brand = brands.find((b) => b.slug === brandSlug)
    const model = models.find((m) => String(m.id) === String(modelId))
    const version = versions.find((v) => String(v.id) === nextVersionId)
    if (brand && model && version && year !== '') {
      onSelect?.({ brand, model, version, year })
    }
  }

  return (
    <div className="shadow-soft rounded-2xl border border-slate-200 bg-white/70 p-4 backdrop-blur-sm sm:p-5">
      <h3 className="mb-3 text-base font-semibold text-slate-900">
        Encuentra tu versión
      </h3>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <label className={LABEL_CLASS} htmlFor="picker-year">
            Año
          </label>
          <select
            className={SELECT_CLASS}
            id="picker-year"
            onChange={(e) => {
              setYear(e.target.value ? Number(e.target.value) : '')
              setVersionId('')
              setVersions([])
              setLoadingVersions(true)
            }}
            value={year}
          >
            <option value="">Selecciona año</option>
            {years.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className={LABEL_CLASS} htmlFor="picker-brand">
            Marca
          </label>
          <select
            className={SELECT_CLASS}
            id="picker-brand"
            onChange={(e) => {
              setBrandSlug(e.target.value)
              setModelId('')
              setVersionId('')
              setModels([])
              setVersions([])
              setLoadingModels(true)
            }}
            value={brandSlug}
          >
            <option value="">Selecciona marca</option>
            {brands.map((brand) => (
              <option key={brand.id} value={brand.slug}>
                {brand.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className={LABEL_CLASS} htmlFor="picker-model">
            Modelo
          </label>
          <select
            className={SELECT_CLASS}
            disabled={!brandSlug || loadingModels}
            id="picker-model"
            onChange={(e) => {
              setModelId(e.target.value)
              setVersionId('')
              setVersions([])
              setLoadingVersions(true)
            }}
            value={modelId}
          >
            <option value="">
              {loadingModels ? 'Cargando…' : 'Selecciona modelo'}
            </option>
            {models.map((model) => (
              <option key={model.id} value={model.id}>
                {model.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className={LABEL_CLASS} htmlFor="picker-version">
            Versión
          </label>
          <select
            className={SELECT_CLASS}
            disabled={!modelId || !year || loadingVersions}
            id="picker-version"
            onChange={(e) => handleVersionChange(e.target.value)}
            value={versionId}
          >
            <option value="">
              {loadingVersions
                ? 'Cargando…'
                : versions.length === 0 && modelId && year
                  ? 'Sin versiones para este año'
                  : 'Selecciona versión'}
            </option>
            {versions.map((version) => (
              <option key={version.id} value={version.id}>
                {version.description}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  )
}
