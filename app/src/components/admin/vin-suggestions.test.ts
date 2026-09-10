import { describe, expect, it } from 'vitest'

import { publishSuggestions, takeSuggestion } from './vin-suggestions'

describe('vin suggestion hand-off', () => {
  it('hands a value to the field it was published for', () => {
    publishSuggestions({ model: 'Jetta' }, 1000)

    expect(takeSuggestion('model', 1000)).toBe('Jetta')
  })

  it('is consumed by the first read', () => {
    publishSuggestions({ model: 'Jetta' }, 1000)

    takeSuggestion('model', 1000)

    expect(takeSuggestion('model', 1000)).toBeUndefined()
  })

  it('returns nothing for a field nobody published for', () => {
    expect(takeSuggestion('version', 1000)).toBeUndefined()
  })

  it('does not resurface a value the editor never applied', () => {
    publishSuggestions({ version: '2.0L GT' }, 1000)

    expect(takeSuggestion('version', 60_000)).toBeUndefined()
  })
})
