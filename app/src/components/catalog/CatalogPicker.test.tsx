// @vitest-environment jsdom

import { afterEach, describe, expect, it, vi } from 'vitest'
import { cleanup, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import type { Brand } from '../../types/car'

import { CatalogPicker } from './CatalogPicker'

const mockGetCatalogModels = vi.fn()
const mockGetCatalogVersions = vi.fn()

vi.mock('../../lib/catalog-actions', () => ({
  getCatalogModels: (...args: unknown[]) => mockGetCatalogModels(...args),
  getCatalogVersions: (...args: unknown[]) => mockGetCatalogVersions(...args),
}))

const BRANDS: Brand[] = [
  { id: '1', name: 'Nissan', slug: 'nissan' },
  { id: '2', name: 'Toyota', slug: 'toyota' },
]

afterEach(() => {
  cleanup()
  mockGetCatalogModels.mockReset()
  mockGetCatalogVersions.mockReset()
})

describe('CatalogPicker', () => {
  it('renders all four selects', () => {
    render(<CatalogPicker brands={BRANDS} />)
    expect(screen.getByLabelText('Año')).toBeInTheDocument()
    expect(screen.getByLabelText('Marca')).toBeInTheDocument()
    expect(screen.getByLabelText('Modelo')).toBeInTheDocument()
    expect(screen.getByLabelText('Versión')).toBeInTheDocument()
  })

  it('disables model select when no brand is selected', () => {
    render(<CatalogPicker brands={BRANDS} />)
    expect(screen.getByLabelText('Modelo')).toBeDisabled()
  })

  it('disables version select when no model is selected', () => {
    render(<CatalogPicker brands={BRANDS} />)
    expect(screen.getByLabelText('Versión')).toBeDisabled()
  })

  it('loads models when a brand is selected', async () => {
    mockGetCatalogModels.mockResolvedValue([
      { id: 10, name: 'Versa' },
      { id: 11, name: 'Sentra' },
    ])
    const user = userEvent.setup()
    render(<CatalogPicker brands={BRANDS} />)

    await user.selectOptions(screen.getByLabelText('Marca'), 'nissan')

    await waitFor(() => {
      expect(mockGetCatalogModels).toHaveBeenCalledWith({ brandSlug: 'nissan' })
    })

    await waitFor(() => {
      expect(screen.getByText('Versa')).toBeInTheDocument()
      expect(screen.getByText('Sentra')).toBeInTheDocument()
    })
  })

  it('loads versions when model and year are selected', async () => {
    mockGetCatalogModels.mockResolvedValue([{ id: 10, name: 'Versa' }])
    mockGetCatalogVersions.mockResolvedValue([
      { clave: 'A', description: 'Sense CVT', id: 100 },
    ])
    const user = userEvent.setup()
    render(<CatalogPicker brands={BRANDS} />)

    await user.selectOptions(screen.getByLabelText('Año'), '2024')
    await user.selectOptions(screen.getByLabelText('Marca'), 'nissan')

    await waitFor(() => {
      expect(screen.getByText('Versa')).toBeInTheDocument()
    })

    await user.selectOptions(screen.getByLabelText('Modelo'), '10')

    await waitFor(() => {
      expect(mockGetCatalogVersions).toHaveBeenCalledWith({
        modelId: '10',
        year: 2024,
      })
    })

    await waitFor(() => {
      expect(screen.getByText('Sense CVT')).toBeInTheDocument()
    })
  })

  it('resets model and version when brand changes', async () => {
    mockGetCatalogModels.mockResolvedValue([{ id: 10, name: 'Versa' }])
    const user = userEvent.setup()
    render(<CatalogPicker brands={BRANDS} />)

    await user.selectOptions(screen.getByLabelText('Marca'), 'nissan')
    await waitFor(() => {
      expect(screen.getByText('Versa')).toBeInTheDocument()
    })

    mockGetCatalogModels.mockResolvedValue([{ id: 20, name: 'Corolla' }])

    await user.selectOptions(screen.getByLabelText('Marca'), 'toyota')

    await waitFor(() => {
      expect(screen.getByLabelText('Modelo')).toHaveValue('')
    })
  })

  it('shows loading state while fetching models', async () => {
    let resolveModels: (v: Array<{ id: number; name: string }>) => void
    mockGetCatalogModels.mockReturnValue(
      new Promise((resolve) => {
        resolveModels = resolve
      })
    )
    const user = userEvent.setup()
    render(<CatalogPicker brands={BRANDS} />)

    await user.selectOptions(screen.getByLabelText('Marca'), 'nissan')

    await waitFor(() => {
      expect(screen.getByText('Cargando…')).toBeInTheDocument()
    })

    resolveModels!([])
    await waitFor(() => {
      expect(screen.queryByText('Cargando…')).not.toBeInTheDocument()
    })
  })

  it('calls onSelect when a full selection is made', async () => {
    mockGetCatalogModels.mockResolvedValue([{ id: 10, name: 'Versa' }])
    mockGetCatalogVersions.mockResolvedValue([
      { clave: 'A', description: 'Sense CVT', id: 100 },
    ])
    const onSelect = vi.fn()
    const user = userEvent.setup()
    render(<CatalogPicker brands={BRANDS} onSelect={onSelect} />)

    await user.selectOptions(screen.getByLabelText('Año'), '2024')
    await user.selectOptions(screen.getByLabelText('Marca'), 'nissan')

    await waitFor(() => {
      expect(screen.getByText('Versa')).toBeInTheDocument()
    })

    await user.selectOptions(screen.getByLabelText('Modelo'), '10')

    await waitFor(() => {
      expect(screen.getByText('Sense CVT')).toBeInTheDocument()
    })

    await user.selectOptions(screen.getByLabelText('Versión'), '100')

    await waitFor(() => {
      expect(onSelect).toHaveBeenCalledWith({
        brand: BRANDS[0],
        model: { id: 10, name: 'Versa' },
        version: { clave: 'A', description: 'Sense CVT', id: 100 },
        year: 2024,
      })
    })
  })
})
