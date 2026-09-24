// @vitest-environment jsdom

import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'

import type { SearchSuggestion } from '../../types/car'

import { SearchBar } from './SearchBar'

const SUGGESTIONS: SearchSuggestion[] = [
  { count: 12, label: 'Mazda' },
  { count: 4, label: 'Mazda 3' },
  { count: 7, label: 'Nissan' },
]

const mockPush = vi.fn()
const mockGet = vi.fn()
const stableSearchParams = { get: mockGet }

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
  useSearchParams: () => stableSearchParams,
}))

afterEach(() => {
  cleanup()
  mockPush.mockClear()
  mockGet.mockReset()
})

describe('SearchBar', () => {
  it('renders the search input', () => {
    mockGet.mockReturnValue(null)
    render(<SearchBar />)
    expect(screen.getByPlaceholderText(/buscar por marca/i)).toBeInTheDocument()
  })

  it('renders the submit button', () => {
    mockGet.mockReturnValue(null)
    render(<SearchBar />)
    expect(screen.getByRole('button', { name: 'Buscar' })).toBeInTheDocument()
  })

  it('navigates with search query on submit', async () => {
    mockGet.mockReturnValue(null)
    const user = userEvent.setup()
    render(<SearchBar />)
    await user.type(screen.getByPlaceholderText(/buscar por marca/i), 'versa')
    await user.click(screen.getByRole('button', { name: 'Buscar' }))
    expect(mockPush).toHaveBeenCalledWith('/catalogo?search=versa', {
      scroll: false,
    })
  })

  it('navigates to clean path when submitting empty search', async () => {
    mockGet.mockReturnValue(null)
    const user = userEvent.setup()
    render(<SearchBar />)
    await user.click(screen.getByRole('button', { name: 'Buscar' }))
    expect(mockPush).toHaveBeenCalledWith('/catalogo', { scroll: false })
  })

  it('shows clear button when there is text', async () => {
    mockGet.mockReturnValue(null)
    const user = userEvent.setup()
    render(<SearchBar />)
    expect(screen.queryByRole('button', { name: /limpiar/i })).toBeNull()
    await user.type(screen.getByPlaceholderText(/buscar por marca/i), 'toyota')
    expect(screen.getByRole('button', { name: /limpiar/i })).toBeInTheDocument()
  })

  it('clears input and navigates on clear', async () => {
    mockGet.mockReturnValue(null)
    const user = userEvent.setup()
    render(<SearchBar />)
    await user.type(screen.getByPlaceholderText(/buscar por marca/i), 'corolla')
    await user.click(screen.getByRole('button', { name: /limpiar/i }))
    expect(screen.getByPlaceholderText(/buscar por marca/i)).toHaveValue('')
    expect(mockPush).toHaveBeenCalledWith('/catalogo', { scroll: false })
  })

  it('suggests published cars through a misspelling', async () => {
    mockGet.mockReturnValue(null)
    const user = userEvent.setup()
    render(<SearchBar suggestions={SUGGESTIONS} />)
    await user.type(screen.getByPlaceholderText(/buscar por marca/i), 'masda')
    expect(screen.getByRole('option', { name: /Mazda 3/ })).toBeInTheDocument()
  })

  it('searches the suggestion that was clicked, not what was typed', async () => {
    mockGet.mockReturnValue(null)
    const user = userEvent.setup()
    render(<SearchBar suggestions={SUGGESTIONS} />)
    await user.type(screen.getByPlaceholderText(/buscar por marca/i), 'masda')
    await user.click(screen.getByRole('option', { name: /Mazda 3/ }))
    expect(mockPush).toHaveBeenCalledWith('/catalogo?search=Mazda%203', {
      scroll: false,
    })
  })

  it('picks a suggestion with the keyboard', async () => {
    mockGet.mockReturnValue(null)
    const user = userEvent.setup()
    render(<SearchBar suggestions={SUGGESTIONS} />)
    await user.type(screen.getByPlaceholderText(/buscar por marca/i), 'masda')
    await user.keyboard('{ArrowDown}{Enter}')
    expect(mockPush).toHaveBeenCalledWith('/catalogo?search=Mazda', {
      scroll: false,
    })
  })

  it('suggests nothing when the inventory has no match', async () => {
    mockGet.mockReturnValue(null)
    const user = userEvent.setup()
    render(<SearchBar suggestions={SUGGESTIONS} />)
    await user.type(screen.getByPlaceholderText(/buscar por marca/i), 'ferrari')
    expect(screen.queryByRole('listbox')).toBeNull()
  })

  it('syncs input with URL search param', () => {
    mockGet.mockReturnValue('nissan')
    render(<SearchBar />)
    expect(screen.getByPlaceholderText(/buscar por marca/i)).toHaveValue(
      'nissan'
    )
  })
})
