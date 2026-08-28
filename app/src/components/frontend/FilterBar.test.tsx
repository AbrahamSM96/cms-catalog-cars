// @vitest-environment jsdom

import { afterEach, describe, expect, it, vi } from 'vitest'
import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import type { Brand } from '../../types/car'

import { FilterBar } from './FilterBar'

const mockPush = vi.fn()
const mockGet = vi.fn()

vi.mock('next/navigation', () => ({
  usePathname: () => '/catalogo',
  useRouter: () => ({ push: mockPush }),
  useSearchParams: () => ({
    get: (key: string) => mockGet(key),
    toString: () => '',
  }),
}))

const BRANDS: Brand[] = [
  { id: '1', name: 'Nissan', slug: 'nissan' },
  { id: '2', name: 'Toyota', slug: 'toyota' },
]

afterEach(() => {
  cleanup()
  mockPush.mockClear()
  mockGet.mockReset()
})

describe('FilterBar', () => {
  it('renders all filter selects', () => {
    render(<FilterBar brands={BRANDS} />)
    expect(screen.getByLabelText('Marca')).toBeInTheDocument()
    expect(screen.getByLabelText('Estado')).toBeInTheDocument()
    expect(screen.getByLabelText('Transmisión')).toBeInTheDocument()
    expect(screen.getByLabelText('Año mínimo')).toBeInTheDocument()
  })

  it('renders brand options from props', () => {
    render(<FilterBar brands={BRANDS} />)
    expect(screen.getByLabelText('Marca')).toHaveValue('all')
    const brandSelect = screen.getByLabelText('Marca')
    expect(brandSelect.querySelectorAll('option')).toHaveLength(3)
  })

  it('navigates with brand filter on change', async () => {
    const user = userEvent.setup()
    render(<FilterBar brands={BRANDS} />)
    await user.selectOptions(screen.getByLabelText('Marca'), 'nissan')
    expect(mockPush).toHaveBeenCalledWith('/catalogo?brand=nissan', {
      scroll: false,
    })
  })

  it('navigates with status filter on change', async () => {
    const user = userEvent.setup()
    render(<FilterBar brands={BRANDS} />)
    await user.selectOptions(screen.getByLabelText('Estado'), 'available')
    expect(mockPush).toHaveBeenCalledWith('/catalogo?status=available', {
      scroll: false,
    })
  })

  it('navigates with transmission filter on change', async () => {
    const user = userEvent.setup()
    render(<FilterBar brands={BRANDS} />)
    await user.selectOptions(screen.getByLabelText('Transmisión'), 'manual')
    expect(mockPush).toHaveBeenCalledWith('/catalogo?transmission=manual', {
      scroll: false,
    })
  })

  it('hides clear button when no filters are active', () => {
    mockGet.mockReturnValue(null)
    render(<FilterBar brands={BRANDS} />)
    expect(screen.queryByRole('button', { name: /limpiar/i })).toBeNull()
  })

  it('shows clear button when filters are active', () => {
    mockGet.mockImplementation((key: string) =>
      key === 'brand' ? 'nissan' : null
    )
    render(<FilterBar brands={BRANDS} />)
    expect(screen.getByRole('button', { name: /limpiar/i })).toBeInTheDocument()
  })

  it('navigates to clean pathname when clearing all', async () => {
    mockGet.mockImplementation((key: string) =>
      key === 'brand' ? 'nissan' : null
    )
    const user = userEvent.setup()
    render(<FilterBar brands={BRANDS} />)
    await user.click(screen.getByRole('button', { name: /limpiar/i }))
    expect(mockPush).toHaveBeenCalledWith('/catalogo', { scroll: false })
  })
})
