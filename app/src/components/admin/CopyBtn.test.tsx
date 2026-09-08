// @vitest-environment jsdom

import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { CopyBtn } from './CopyBtn'

let language = 'en'

// Mock @payloadcms/ui
vi.mock('@payloadcms/ui', () => ({
  useTranslation: (): { i18n: { language: string } } => ({
    i18n: {
      get language(): string {
        return language
      },
    },
  }),
}))

afterEach(() => {
  cleanup()
  vi.clearAllMocks()
  language = 'en'
})

describe('CopyBtn', () => {
  it('renders the button with English text and aria-label with token substitution', () => {
    const onCopy = vi.fn()
    render(<CopyBtn copiedKey={null} id="price" onCopy={onCopy} text="25000" />)

    const button = screen.getByRole('button')
    expect(button).toHaveTextContent('Copy')
    expect(button).toHaveAttribute('aria-label', 'Copy price to clipboard')
  })

  it('renders in Spanish when the admin language is es', () => {
    language = 'es'
    render(
      <CopyBtn copiedKey={null} id="price" onCopy={vi.fn()} text="25000" />
    )

    const button = screen.getByRole('button')
    expect(button).toHaveTextContent('Copiar')
    expect(button).toHaveAttribute('aria-label', 'Copiar price al portapapeles')
  })

  it('shows the copied state in Spanish', () => {
    language = 'es'
    render(
      <CopyBtn copiedKey="price" id="price" onCopy={vi.fn()} text="25000" />
    )

    expect(screen.getByRole('button')).toHaveTextContent('✓ Copiado')
  })

  it('shows "✓ Copied" when the button matches copiedKey', () => {
    const onCopy = vi.fn()
    render(
      <CopyBtn copiedKey="price" id="price" onCopy={onCopy} text="25000" />
    )

    const button = screen.getByRole('button')
    expect(button).toHaveTextContent('✓ Copied')
  })

  it('is disabled when text is empty', () => {
    const onCopy = vi.fn()
    render(<CopyBtn copiedKey={null} id="price" onCopy={onCopy} text="" />)

    const button = screen.getByRole('button')
    expect(button).toBeDisabled()
  })
})
