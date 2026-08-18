import type { Financing } from '../types/car'

export interface FinancingDefaults {
  availableTerms: number[]
  defaultDown: number
  defaultTerm: number
  interestRate: number
  maxDown: number
  minDown: number
}

/**
 * Resolve financing configuration with fallback defaults when the CMS record
 * is incomplete or undefined.
 *
 * @param financing - the optional Financing record from Payload.
 */
export function resolveFinancingDefaults(
  financing: Financing | undefined
): FinancingDefaults {
  const minDown = financing?.minDownPaymentPercentage ?? 20
  const maxDown = financing?.maxDownPaymentPercentage ?? 80
  const defaultDown = financing?.defaultDownPaymentPercentage ?? 20
  const defaultTerm = financing?.defaultLoanTerm ?? 36
  const interestRate = financing?.interestRate ?? 8.5

  const availableTerms =
    financing?.availableLoanTerms && financing.availableLoanTerms.length > 0
      ? financing.availableLoanTerms
          .map((t) => t.months)
          .sort((a, b) => a - b)
      : [6, 12, 24, 36, 48, 60]

  return {
    availableTerms,
    defaultDown,
    defaultTerm,
    interestRate,
    maxDown,
    minDown,
  }
}

/**
 * Calculate the monthly payment for a car loan using the standard amortization
 * formula.
 *
 * @param props - loan parameters.
 * @param props.downPaymentPercentage - down payment as a percentage of price.
 * @param props.interestRate - annual interest rate (e.g. 8.5 for 8.5%).
 * @param props.loanTermMonths - loan term in months.
 * @param props.price - total vehicle price.
 */
export function calculateMonthlyPayment(props: {
  downPaymentPercentage: number
  interestRate: number
  loanTermMonths: number
  price: number
}): number {
  const { downPaymentPercentage, interestRate, loanTermMonths, price } = props
  const downPaymentAmount = price * (downPaymentPercentage / 100)
  const loanAmount = price - downPaymentAmount
  const monthlyRate = interestRate / 100 / 12

  if (monthlyRate === 0) return loanAmount / loanTermMonths

  return (
    (loanAmount * monthlyRate * Math.pow(1 + monthlyRate, loanTermMonths)) /
    (Math.pow(1 + monthlyRate, loanTermMonths) - 1)
  )
}

/**
 * Compute the slider thumb position as a percentage between min and max.
 *
 * @param props - slider parameters.
 * @param props.max - maximum slider value.
 * @param props.min - minimum slider value.
 * @param props.value - current slider value.
 */
export function sliderPercentage(props: {
  max: number
  min: number
  value: number
}): number {
  const { max, min, value } = props
  if (max === min) return 0
  return ((value - min) / (max - min)) * 100
}
