'use client'

import { useState } from 'react'

import type { Brand } from '../../types/car'

import { CatalogPicker } from './CatalogPicker'
import type { CatalogSelection } from './CatalogPicker'

interface CatalogFinderProps {
  brands: Brand[]
}

/**
 * Public "encuentra tu versión" finder: wraps the cascading picker and shows a
 * summary card once a full año → marca → modelo → versión selection is made.
 *
 * @param props - Component props.
 */
export function CatalogFinder(props: CatalogFinderProps): React.JSX.Element {
  const { brands } = props
  const [selection, setSelection] = useState<CatalogSelection | null>(null)

  return (
    <div className="space-y-4">
      <CatalogPicker brands={brands} onSelect={setSelection} />

      {selection && (
        <div className="shadow-soft rounded-2xl border border-slate-200 bg-white p-5">
          <p className="text-xs font-medium tracking-wide text-slate-500 uppercase">
            Tu vehículo
          </p>
          <p className="mt-1 text-lg font-semibold text-slate-900">
            {selection.brand.name} {selection.model.name} {selection.year}
          </p>
          <p className="mt-1 text-sm text-slate-600">
            {selection.version.description}
          </p>
          <p className="mt-2 text-xs text-slate-400">
            Clave: {selection.version.clave}
          </p>
        </div>
      )}
    </div>
  )
}
