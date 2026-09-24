'use client'

import clsx from 'clsx'
import { Banknote, CreditCard, Tag } from 'lucide-react'
import { useState } from 'react'

import { formatPriceMXN } from '../../lib/currency'
import {
  calculateMonthlyPayment,
  resolveFinancingDefaults,
  resolveReserveDefaults,
  sliderPercentage,
} from '../../lib/financing'
import type { Financing, Reserve } from '../../types/car'

interface FinancingCalculatorProps {
  price: number
  financing?: Financing
  reserve?: Reserve
  showFinancing?: boolean
  showReserve?: boolean
}

type Tab = 'credit' | 'reserve' | 'cash'

/**
 * currency
 *
 * @param value - number
 */
const currency = (value: number): string => formatPriceMXN(value)

/**
 * FinancingCalculator
 *
 * @param props - FinancingCalculatorProps
 * @param props.financing - Financing | undefined
 * @param props.price - number
 * @param props.reserve - Reserve | undefined
 * @param props.showFinancing - boolean | undefined
 * @param props.showReserve - boolean | undefined
 */
export function FinancingCalculator({
  financing,
  price,
  reserve,
  showFinancing,
  showReserve,
}: FinancingCalculatorProps): React.JSX.Element {
  const creditEnabled = showFinancing !== false
  const reserveEnabled = showReserve !== false

  const [activeTab, setActiveTab] = useState<Tab>(
    creditEnabled ? 'credit' : reserveEnabled ? 'reserve' : 'cash'
  )

  const {
    availableTerms,
    defaultDown,
    defaultTerm,
    interestRate,
    maxDown,
    minDown,
  } = resolveFinancingDefaults(financing)

  const [downPaymentPercentage, setDownPaymentPercentage] =
    useState(defaultDown)
  const [loanTermMonths, setLoanTermMonths] = useState(defaultTerm)

  const monthlyPayment = calculateMonthlyPayment({
    downPaymentPercentage,
    interestRate,
    loanTermMonths,
    price,
  })
  const downPaymentAmount = price * (downPaymentPercentage / 100)

  const minTerm = Math.min(...availableTerms)
  const maxTerm = Math.max(...availableTerms)
  const downPct = sliderPercentage({
    max: maxDown,
    min: minDown,
    value: downPaymentPercentage,
  })
  const termPct = sliderPercentage({
    max: maxTerm,
    min: minTerm,
    value: loanTermMonths,
  })

  const sliderClass =
    'h-2 w-full cursor-pointer appearance-none rounded-lg bg-slate-200 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-accent-600 [&::-webkit-slider-thumb]:shadow-lg [&::-webkit-slider-thumb]:transition [&::-webkit-slider-thumb]:hover:scale-110 [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:bg-accent-600 [&::-moz-range-thumb]:shadow-lg [&::-moz-range-thumb]:transition [&::-moz-range-thumb]:hover:scale-110'

  /**
   * trackStyle
   *
   * @param pct - number
   */
  const trackStyle = (pct: number): React.CSSProperties => ({
    background: `linear-gradient(to right, rgb(220 38 38) 0%, rgb(220 38 38) ${pct}%, rgb(226 232 240) ${pct}%, rgb(226 232 240) 100%)`,
  })

  const reserveCopy = resolveReserveDefaults(reserve)

  const tabs: { id: Tab; label: string; icon: typeof CreditCard }[] = [
    ...(creditEnabled
      ? [{ icon: CreditCard, id: 'credit' as const, label: 'Crédito' }]
      : []),
    ...(reserveEnabled
      ? [{ icon: Tag, id: 'reserve' as const, label: 'Apártalo' }]
      : []),
    { icon: Banknote, id: 'cash', label: 'Contado' },
  ]

  return (
    <div className="shadow-soft rounded-2xl border border-slate-200 bg-white p-6">
      <h3 className="mb-6 text-xl font-bold text-slate-900">
        Calculadora de pagos
      </h3>

      {/* Tabs */}
      <div
        className={clsx(
          'mb-6 grid gap-1 rounded-xl bg-slate-100 p-1',
          tabs.length === 1 && 'grid-cols-1',
          tabs.length === 2 && 'grid-cols-2',
          tabs.length === 3 && 'grid-cols-3'
        )}
      >
        {tabs.map(({ icon: Icon, id, label }) => (
          <button
            className={`flex items-center justify-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
              activeTab === id
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
      {creditEnabled && activeTab === 'credit' && (
        <div className="space-y-6">
          <div className="rounded-xl bg-gradient-to-br from-accent-50 to-rose-100 p-6">
            <div className="mb-1 text-sm font-medium text-slate-600">
              Pago mensual estimado
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-bold text-accent-600">
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
              <span className="text-lg font-bold text-accent-600">
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
              <span className="font-semibold text-accent-600">
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
              <span className="text-lg font-bold text-accent-600">
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
                    loanTermMonths === term ? 'font-bold text-accent-600' : ''
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
      {reserveEnabled && activeTab === 'reserve' && (
        <div className="space-y-5 py-6 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-accent-50">
            <Tag aria-hidden="true" className="h-7 w-7 text-accent-600" />
          </div>
          <div>
            <h4 className="text-lg font-bold text-slate-900">
              {reserveCopy.title}
            </h4>
            <p className="mt-1 text-sm text-slate-600">
              {reserveCopy.description}
            </p>
          </div>
          {reserveCopy.amount !== undefined && (
            <div className="rounded-xl bg-gradient-to-br from-accent-50 to-rose-100 p-6">
              <div className="mb-1 text-sm font-medium text-slate-600">
                Monto del apartado
              </div>
              <div className="text-4xl font-bold text-accent-600">
                {currency(reserveCopy.amount)}
              </div>
              <div className="mt-2 text-sm text-slate-600">
                Se descuenta del precio final.
              </div>
            </div>
          )}
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
