import { describe, expect, it } from 'vitest'

import type { SearchSuggestion } from '../types/car'

import {
  correctSearchTerms,
  editDistance,
  filterSuggestions,
  normalize,
  phoneticKey,
  tokenize,
} from './fuzzy-search'

const VOCABULARY = [
  'Mazda',
  'Nissan',
  'Chevrolet',
  'Toyota',
  'Hyundai',
  'Volkswagen',
  'Citroën',
  'BMW',
  '3',
  'Versa',
  'Corolla',
  'CX-5',
]

describe('normalize', () => {
  it('strips accents, case and punctuation', () => {
    expect(normalize('Citroën  C4!')).toBe('citroen c4')
  })

  it('returns an empty string for blank input', () => {
    expect(normalize('   ')).toBe('')
  })
})

describe('phoneticKey', () => {
  it('reads z and s the same', () => {
    expect(phoneticKey('masda')).toBe(phoneticKey('mazda'))
  })

  it('collapses doubled letters', () => {
    expect(phoneticKey('nisan')).toBe(phoneticKey('nissan'))
  })

  it('reads v and b the same', () => {
    expect(phoneticKey('chebrolet')).toBe(phoneticKey('chevrolet'))
  })

  it('keeps different brands apart', () => {
    expect(phoneticKey('mazda')).not.toBe(phoneticKey('honda'))
  })
})

describe('editDistance', () => {
  it('is zero for identical words', () => {
    expect(editDistance('mazda', 'mazda')).toBe(0)
  })

  it('counts a single substitution', () => {
    expect(editDistance('toyata', 'toyota')).toBe(1)
  })

  it('counts a deletion', () => {
    expect(editDistance('corola', 'corolla')).toBe(1)
  })
})

describe('tokenize', () => {
  it('splits on whitespace', () => {
    expect(tokenize('Mazda 3')).toEqual(['mazda', '3'])
  })

  it('returns nothing for blank input', () => {
    expect(tokenize('  ')).toEqual([])
  })
})

describe('correctSearchTerms', () => {
  it('fixes a phonetic misspelling', () => {
    expect(correctSearchTerms('masda', VOCABULARY)).toEqual(['Mazda'])
  })

  it('fixes a missing doubled letter', () => {
    expect(correctSearchTerms('nisan', VOCABULARY)).toEqual(['Nissan'])
  })

  it('fixes a typo through edit distance', () => {
    expect(correctSearchTerms('toyata', VOCABULARY)).toEqual(['Toyota'])
  })

  it('restores the accent so the query matches the CMS value', () => {
    expect(correctSearchTerms('citroen', VOCABULARY)).toEqual(['Citroën'])
  })

  it('splits a brand and model query into separate terms', () => {
    expect(correctSearchTerms('masda 3', VOCABULARY)).toEqual(['Mazda', '3'])
  })

  it('leaves a prefix alone so typing still matches', () => {
    expect(correctSearchTerms('maz', VOCABULARY)).toEqual(['maz'])
  })

  it('never rewrites short tokens', () => {
    expect(correctSearchTerms('bmz', VOCABULARY)).toEqual(['bmz'])
  })

  it('leaves a word with no close match untouched', () => {
    expect(correctSearchTerms('helicoptero', VOCABULARY)).toEqual([
      'helicoptero',
    ])
  })

  it('returns nothing for a blank query', () => {
    expect(correctSearchTerms('   ', VOCABULARY)).toEqual([])
  })
})

describe('filterSuggestions', () => {
  const SUGGESTIONS: SearchSuggestion[] = [
    { count: 12, label: 'Mazda' },
    { count: 4, label: 'Mazda 3' },
    { count: 3, label: 'Mazda CX-5' },
    { count: 7, label: 'Nissan' },
    { count: 5, label: 'Nissan Versa' },
  ]

  it('suggests through a misspelling', () => {
    expect(
      filterSuggestions('masda', SUGGESTIONS, 6).map((s) => s.label)
    ).toEqual(['Mazda', 'Mazda 3', 'Mazda CX-5'])
  })

  it('narrows as more words are typed', () => {
    expect(
      filterSuggestions('masda cx', SUGGESTIONS, 6).map((s) => s.label)
    ).toEqual(['Mazda CX-5'])
  })

  it('honours the limit', () => {
    expect(filterSuggestions('masda', SUGGESTIONS, 2)).toHaveLength(2)
  })

  it('suggests nothing for a blank query', () => {
    expect(filterSuggestions('  ', SUGGESTIONS, 6)).toEqual([])
  })

  it('suggests nothing when the inventory has no match', () => {
    expect(filterSuggestions('helicoptero', SUGGESTIONS, 6)).toEqual([])
  })
})
