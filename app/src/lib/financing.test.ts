import { describe, expect, it } from 'vitest'

import type { Financing } from '../types/car'

import {
  calculateMonthlyPayment,
  resolveFinancingDefaults,
  sliderPercentage,
} from './financing'

describe('resolveFinancingDefaults', () => {
  it('returns defaults when financing is undefined', () => {
    const d = resolveFinancingDefaults(undefined)
    expect(d.minDown).toBe(20)
    expect(d.maxDown).toBe(80)
    expect(d.defaultDown).toBe(20)
    expect(d.defaultTerm).toBe(36)
    expect(d.interestRate).toBe(8.5)
    expect(d.availableTerms).toEqual([6, 12, 24, 36, 48, 60])
  })

  it('uses financing values when provided', () => {
    const financing: Financing = {
      availableLoanTerms: [{ months: 48 }, { months: 24 }, { months: 12 }],
      defaultDownPaymentPercentage: 30,
      defaultLoanTerm: 24,
      interestRate: 7.2,
      maxDownPaymentPercentage: 70,
      minDownPaymentPercentage: 10,
    }
    const d = resolveFinancingDefaults(financing)
    expect(d.minDown).toBe(10)
    expect(d.maxDown).toBe(70)
    expect(d.defaultDown).toBe(30)
    expect(d.defaultTerm).toBe(24)
    expect(d.interestRate).toBe(7.2)
    expect(d.availableTerms).toEqual([12, 24, 48])
  })

  it('falls back to default terms when availableLoanTerms is empty', () => {
    const financing: Financing = { availableLoanTerms: [] }
    const d = resolveFinancingDefaults(financing)
    expect(d.availableTerms).toEqual([6, 12, 24, 36, 48, 60])
  })
})

describe('calculateMonthlyPayment', () => {
  it('calculates payment with standard parameters', () => {
    const payment = calculateMonthlyPayment({
      downPaymentPercentage: 20,
      interestRate: 8.5,
      loanTermMonths: 36,
      price: 300000,
    })
    expect(payment).toBeGreaterThan(0)
    expect(payment).toBeCloseTo(7576.21, 0)
  })

  it('returns equal split when interest rate is zero', () => {
    const payment = calculateMonthlyPayment({
      downPaymentPercentage: 20,
      interestRate: 0,
      loanTermMonths: 12,
      price: 120000,
    })
    expect(payment).toBe(8000)
  })

  it('handles 100% down payment (zero loan)', () => {
    const payment = calculateMonthlyPayment({
      downPaymentPercentage: 100,
      interestRate: 8.5,
      loanTermMonths: 36,
      price: 300000,
    })
    expect(payment).toBe(0)
  })

  it('higher down payment reduces monthly payment', () => {
    const low = calculateMonthlyPayment({
      downPaymentPercentage: 20,
      interestRate: 8.5,
      loanTermMonths: 36,
      price: 300000,
    })
    const high = calculateMonthlyPayment({
      downPaymentPercentage: 50,
      interestRate: 8.5,
      loanTermMonths: 36,
      price: 300000,
    })
    expect(high).toBeLessThan(low)
  })

  it('longer term reduces monthly payment', () => {
    const short = calculateMonthlyPayment({
      downPaymentPercentage: 20,
      interestRate: 8.5,
      loanTermMonths: 24,
      price: 300000,
    })
    const long = calculateMonthlyPayment({
      downPaymentPercentage: 20,
      interestRate: 8.5,
      loanTermMonths: 60,
      price: 300000,
    })
    expect(long).toBeLessThan(short)
  })
})

describe('sliderPercentage', () => {
  it('returns 0 when min equals max', () => {
    expect(sliderPercentage({ max: 50, min: 50, value: 50 })).toBe(0)
  })

  it('returns 0 at minimum', () => {
    expect(sliderPercentage({ max: 100, min: 0, value: 0 })).toBe(0)
  })

  it('returns 100 at maximum', () => {
    expect(sliderPercentage({ max: 100, min: 0, value: 100 })).toBe(100)
  })

  it('returns 50 at midpoint', () => {
    expect(sliderPercentage({ max: 100, min: 0, value: 50 })).toBe(50)
  })

  it('handles non-zero minimum', () => {
    expect(sliderPercentage({ max: 80, min: 20, value: 50 })).toBe(50)
  })
})
