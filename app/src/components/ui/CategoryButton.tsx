'use client'

import type { LucideIcon } from 'lucide-react'

type CategoryFilter = 'all' | 'exterior' | 'interior'

/**
 * CategoryButton
 *
 * @param props - Component props.
 * @param props.icon - LucideIcon
 * @param props.isActive - Whether this filter is currently selected.
 * @param props.label - string
 * @param props.onSelect - Callback invoked with the selected filter value.
 * @param props.value - CategoryFilter
 */
export function CategoryButton({
  icon: Icon,
  isActive,
  label,
  onSelect,
  value,
}: {
  icon: LucideIcon
  isActive: boolean
  label: string
  onSelect: (value: CategoryFilter) => void
  value: CategoryFilter
}): React.JSX.Element {
  return (
    <button
      className={`inline-flex cursor-pointer items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-colors ${
        isActive
          ? 'bg-slate-900 text-white'
          : 'border border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:text-slate-900'
      }`}
      onClick={() => onSelect(value)}
      type="button"
    >
      <Icon aria-hidden="true" className="h-4 w-4" />
      {label}
    </button>
  )
}
