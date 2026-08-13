'use client'

import { Banknote, CreditCard, Tag } from 'lucide-react'
import { useState } from 'react'

import type { Financing } from '../../types/car'

interface FinancingCalculatorProps {
  price: number
  financing?: Financing
}

type Tab = 'credit' | 'reserve' | 'cash'

/**
 * currency
 *
 * @param value - number
 */
const currency = (value: number): string =>
  new Intl.NumberFormat('en-US', {
    currency: 'USD',
    minimumFractionDigits: 0,
    style: 'currency',
  }).format(value)

/**
 * FinancingCalculator
 *
 * @param props - FinancingCalculatorProps
 * @param props.financing - Financing | undefined
 * @param props.price - number
 */
export function FinancingCalculator({
  financing,
  price,
}: FinancingCalculatorProps): React.JSX.Element {
  const [activeTab, setActiveTab] = useState<Tab>('credit')

  const minDown = financing?.minDownPaymentPercentage ?? 20
  const maxDown = financing?.maxDownPaymentPercentage ?? 80
  const defaultDown = financing?.defaultDownPaymentPercentage ?? 20
  const defaultTerm = financing?.defaultLoanTerm ?? 36
  const interestRate = financing?.interestRate ?? 8.5

  const availableTerms =
    financing?.availableLoanTerms && financing.availableLoanTerms.length > 0
      ? financing.availableLoanTerms.map((t) => t.months).sort((a, b) => a - b)
      : [6, 12, 24, 36, 48, 60]

  const [downPaymentPercentage, setDownPaymentPercentage] =
    useState(defaultDown)
  const [loanTermMonths, setLoanTermMonths] = useState(defaultTerm)

  /**
   * calculateMonthlyPayment
   */
  const calculateMonthlyPayment = (): number => {
    const downPaymentAmount = price * (downPaymentPercentage / 100)
    const loanAmount = price - downPaymentAmount
    const monthlyRate = interestRate / 100 / 12
    const numberOfPayments = loanTermMonths

    if (monthlyRate === 0) return loanAmount / numberOfPayments

    return (
      (loanAmount * monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments)) /
      (Math.pow(1 + monthlyRate, numberOfPayments) - 1)
    )
  }

  const monthlyPayment = calculateMonthlyPayment()
  const downPaymentAmount = price * (downPaymentPercentage / 100)

  const downPct =
    ((downPaymentPercentage - minDown) / (maxDown - minDown)) * 100
  const minTerm = Math.min(...availableTerms)
  const maxTerm = Math.max(...availableTerms)
  const termPct =
    maxTerm === minTerm
      ? 0
      : ((loanTermMonths - minTerm) / (maxTerm - minTerm)) * 100

  const sliderClass =
    'h-2 w-full cursor-pointer appearance-none rounded-lg bg-slate-200 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-red-600 [&::-webkit-slider-thumb]:shadow-lg [&::-webkit-slider-thumb]:transition [&::-webkit-slider-thumb]:hover:scale-110 [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:bg-red-600 [&::-moz-range-thumb]:shadow-lg [&::-moz-range-thumb]:transition [&::-moz-range-thumb]:hover:scale-110'

  /**
   * trackStyle
   *
   * @param pct - number
   */
  const trackStyle = (pct: number): React.CSSProperties => ({
    background: `linear-gradient(to right, rgb(220 38 38) 0%, rgb(220 38 38) ${pct}%, rgb(226 232 240) ${pct}%, rgb(226 232 240) 100%)`,
  })

  const tabs: { id: Tab; label: string; icon: typeof CreditCard }[] = [
    { icon: CreditCard, id: 'credit', label: 'Crédito', },
    { icon: Tag, id: 'reserve', label: 'Apártalo', },
    { icon: Banknote, id: 'cash', label: 'Contado', },
  ]

  return (
    <div className="shadow-soft rounded-2xl border border-slate-200 bg-white p-6">
      <h3 className="mb-6 text-xl font-bold text-slate-900">
        Calculadora de pagos
      </h3>

      {/* Tabs */}
      <div className="mb-6 grid grid-cols-3 gap-1 rounded-xl bg-slate-100 p-1">
        {tabs.map(({ icon: Icon, id, label }) => (
          <button
            className={`flex items-center justify-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium transition ${activeTab === id
              ? 'bg-white text-slate-900 shadow-sm'
              : 'cursor-pointer text-slate-500 hover:text-slate-900'
              }`}
            key={id}
            onClick={() => setActiveTab(id)}
            type="button"
          >
            <Icon aria-hidden="true" className="h-4 w-4" />
            {label}
          </button>
        ))}
      </div>

      {/* Credit */}
      {activeTab === 'credit' && (
        <div className="space-y-6">
          <div className="rounded-xl bg-gradient-to-br from-red-50 to-rose-100 p-6">
            <div className="mb-1 text-sm font-medium text-slate-600">
              Pago mensual estimado
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-bold text-red-600">
                {currency(monthlyPayment)}
              </span>
              <span className="text-sm text-slate-500">/mes</span>
            </div>
          </div>

          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <span className="text-sm text-slate-600">Precio contado</span>
            <span className="text-lg font-bold text-slate-900">
              {currency(price)}
            </span>
          </div>

          {/* Down payment */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-slate-900">
                Enganche
              </label>
              <span className="text-lg font-bold text-red-600">
                {currency(downPaymentAmount)}
              </span>
            </div>
            <input
              aria-label="Porcentaje de enganche"
              className={sliderClass}
              max={maxDown}
              min={minDown}
              onChange={(e) => setDownPaymentPercentage(Number(e.target.value))}
              style={trackStyle(downPct)}
              type="range"
              value={downPaymentPercentage}
            />
            <div className="flex justify-between text-xs text-slate-400">
              <span>{minDown}%</span>
              <span className="font-semibold text-red-600">
                {downPaymentPercentage}%
              </span>
              <span>{maxDown}%</span>
            </div>
          </div>

          {/* Loan term */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-slate-900">
                Plazo del crédito
              </label>
              <span className="text-lg font-bold text-red-600">
                {loanTermMonths}{' '}
                <span className="text-sm font-normal text-slate-500">
                  meses
                </span>
              </span>
            </div>
            <input
              aria-label="Plazo del crédito en meses"
              className={sliderClass}
              max={maxTerm}
              min={minTerm}
              onChange={(e) => {
                const value = Number(e.target.value)
                const nearest = availableTerms.reduce((prev, curr) =>
                  Math.abs(curr - value) < Math.abs(prev - value) ? curr : prev
                )
                setLoanTermMonths(nearest)
              }}
              step={1}
              style={trackStyle(termPct)}
              type="range"
              value={loanTermMonths}
            />
            <div className="flex justify-between text-xs text-slate-400">
              {availableTerms.map((term) => (
                <span
                  className={
                    loanTermMonths === term ? 'font-bold text-red-600' : ''
                  }
                  key={term}
                >
                  {term}
                </span>
              ))}
            </div>
          </div>

          <p className="text-center text-xs text-slate-400">
            * Cálculo estimado. Tasa de interés: {interestRate}% anual.
          </p>
        </div>
      )}

      {/* Reserve */}
      {activeTab === 'reserve' && (
        <div className="space-y-5 py-6 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-50">
            <Tag aria-hidden="true" className="h-7 w-7 text-red-600" />
          </div>
          <div>
            <h4 className="text-lg font-bold text-slate-900">
              Aparta este auto
            </h4>
            <p className="mt-1 text-sm text-slate-600">
              Reserva este vehículo con un depósito inicial.
            </p>
          </div>
        </div>
      )}

      {/* Cash */}
      {activeTab === 'cash' && (
        <div className="space-y-5">
          <div className="rounded-xl bg-gradient-to-br from-emerald-50 to-green-100 p-6">
            <div className="mb-1 text-sm font-medium text-slate-600">
              Precio de contado
            </div>
            <div className="text-4xl font-bold text-emerald-600">
              {currency(price)}
            </div>
            <div className="mt-2 text-sm text-slate-600">
              Mejor precio disponible.
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
