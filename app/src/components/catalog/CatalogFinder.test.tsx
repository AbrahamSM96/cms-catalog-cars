// @vitest-environment jsdom

import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  cleanup,
  render,
  screen,
  waitFor,
  within,
} from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import type { Brand } from '../../types/car'

import { CatalogFinder } from './CatalogFinder'

const mockGetCatalogModels = vi.fn()
const mockGetCatalogVersions = vi.fn()

vi.mock('../../lib/catalog-actions', () => ({
  getCatalogModels: (...args: unknown[]) => mockGetCatalogModels(...args),
  getCatalogVersions: (...args: unknown[]) => mockGetCatalogVersions(...args),
}))

const BRANDS: Brand[] = [{ id: '1', name: 'Nissan', slug: 'nissan' }]

afterEach(() => {
  cleanup()
  mockGetCatalogModels.mockReset()
  mockGetCatalogVersions.mockReset()
})

describe('CatalogFinder', () => {
  it('renders the picker and no summary initially', () => {
    render(<CatalogFinder brands={BRANDS} />)
    expect(screen.getByText('Encuentra tu versión')).toBeInTheDocument()
    expect(screen.queryByText('Tu vehículo')).not.toBeInTheDocument()
  })

  it('shows summary card after a full selection', async () => {
    mockGetCatalogModels.mockResolvedValue([{ id: 10, name: 'Versa' }])
    mockGetCatalogVersions.mockResolvedValue([
      { clave: 'ABC-123', description: 'Sense CVT', id: 100 },
    ])
    const user = userEvent.setup()
    render(<CatalogFinder brands={BRANDS} />)

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
      const summary = screen
        .getByText('Tu vehículo')
        .closest('div')!.parentElement!
      expect(summary).toBeInTheDocument()
      expect(within(summary).getByText('Clave: ABC-123')).toBeInTheDocument()
    })
  })
})
