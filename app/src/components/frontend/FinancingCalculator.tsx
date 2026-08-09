"use client";

import { useState, useEffect } from "react";
import type { Financing } from "../../types/car";

interface FinancingCalculatorProps {
  price: number;
  financing?: Financing;
}

type Tab = "credit" | "reserve" | "cash";

export function FinancingCalculator({ price, financing }: FinancingCalculatorProps) {
  const [activeTab, setActiveTab] = useState<Tab>("credit");

  // Default values
  const minDown = financing?.minDownPaymentPercentage ?? 20;
  const maxDown = financing?.maxDownPaymentPercentage ?? 80;
  const defaultDown = financing?.defaultDownPaymentPercentage ?? 20;
  const defaultTerm = financing?.defaultLoanTerm ?? 36;
  const interestRate = financing?.interestRate ?? 8.5;

  // Get available loan terms from API or use defaults
  const availableTerms =
    financing?.availableLoanTerms && financing.availableLoanTerms.length > 0
      ? financing.availableLoanTerms.map((t) => t.months).sort((a, b) => a - b)
      : [6, 12, 24, 36, 48, 60];

  // State
  const [downPaymentPercentage, setDownPaymentPercentage] = useState(defaultDown);
  const [loanTermMonths, setLoanTermMonths] = useState(defaultTerm);

  // Calculate monthly payment
  const calculateMonthlyPayment = () => {
    const downPaymentAmount = price * (downPaymentPercentage / 100);
    const loanAmount = price - downPaymentAmount;
    const monthlyRate = interestRate / 100 / 12;
    const numberOfPayments = loanTermMonths;

    if (monthlyRate === 0) {
      return loanAmount / numberOfPayments;
    }

    const monthlyPayment =
      (loanAmount * monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments)) /
      (Math.pow(1 + monthlyRate, numberOfPayments) - 1);

    return monthlyPayment;
  };

  const monthlyPayment = calculateMonthlyPayment();
  const downPaymentAmount = price * (downPaymentPercentage / 100);

  return (
    <div className="sticky top-8 rounded-lg border border-zinc-200 bg-white p-6 shadow-lg dark:border-zinc-800 dark:bg-zinc-900">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-50">
          Calculadora
        </h3>
        <button className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300">
          Conoce más ⓘ
        </button>
      </div>

      {/* Tabs */}
      <div className="mb-6 flex gap-2 rounded-lg bg-zinc-100 p-1 dark:bg-zinc-800">
        <button
          onClick={() => setActiveTab("credit")}
          className={`flex flex-1 items-center justify-center gap-2 rounded-md px-4 py-2.5 text-sm font-medium transition ${
            activeTab === "credit"
              ? "bg-white text-zinc-900 shadow-sm dark:bg-zinc-700 dark:text-zinc-50"
              : "text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50"
          }`}
        >
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          Crédito
        </button>
        <button
          onClick={() => setActiveTab("reserve")}
          className={`flex flex-1 items-center justify-center gap-2 rounded-md px-4 py-2.5 text-sm font-medium transition ${
            activeTab === "reserve"
              ? "bg-white text-zinc-900 shadow-sm dark:bg-zinc-700 dark:text-zinc-50"
              : "text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50"
          }`}
        >
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
            />
          </svg>
          Apártalo
        </button>
        <button
          onClick={() => setActiveTab("cash")}
          className={`flex flex-1 items-center justify-center gap-2 rounded-md px-4 py-2.5 text-sm font-medium transition ${
            activeTab === "cash"
              ? "bg-white text-zinc-900 shadow-sm dark:bg-zinc-700 dark:text-zinc-50"
              : "text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50"
          }`}
        >
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
            />
          </svg>
          Contado
        </button>
      </div>

      {/* Credit Tab Content */}
      {activeTab === "credit" && (
        <div className="space-y-6">
          {/* Monthly Payment Display */}
          <div className="rounded-lg bg-gradient-to-br from-blue-50 to-blue-100 p-6 dark:from-blue-950 dark:to-blue-900">
            <div className="mb-2 text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Pago mensual estimado
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-bold text-blue-600 dark:text-blue-400">
                {new Intl.NumberFormat("en-US", {
                  style: "currency",
                  currency: "USD",
                  minimumFractionDigits: 0,
                }).format(monthlyPayment)}
              </span>
              <span className="text-sm text-zinc-600 dark:text-zinc-400">*</span>
            </div>
            <div className="mt-1 flex items-center gap-2">
              <span className="rounded-full bg-yellow-100 px-2 py-0.5 text-xs font-medium text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100">
                ⚡ 5% menor al mercado
              </span>
            </div>
          </div>

          {/* Cash Price */}
          <div className="flex items-center justify-between border-b border-zinc-200 pb-3 dark:border-zinc-700">
            <span className="text-sm text-zinc-600 dark:text-zinc-400">Precio contado</span>
            <span className="text-lg font-bold text-zinc-900 dark:text-zinc-50">
              {new Intl.NumberFormat("en-US", {
                style: "currency",
                currency: "USD",
                minimumFractionDigits: 0,
              }).format(price)}
            </span>
          </div>

          <button className="w-full text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300">
            Ver desglose de precio →
          </button>

          {/* Down Payment Slider */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-sm font-medium text-zinc-900 dark:text-zinc-50">
                Enganche
                <span className="text-zinc-500">ⓘ</span>
              </label>
              <span className="text-lg font-bold text-blue-600 dark:text-blue-400">
                {new Intl.NumberFormat("en-US", {
                  style: "currency",
                  currency: "USD",
                  minimumFractionDigits: 0,
                }).format(downPaymentAmount)}
              </span>
            </div>

            <input
              type="range"
              min={minDown}
              max={maxDown}
              value={downPaymentPercentage}
              onChange={(e) => setDownPaymentPercentage(Number(e.target.value))}
              className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-zinc-200 dark:bg-zinc-700 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-blue-600 [&::-webkit-slider-thumb]:shadow-lg [&::-webkit-slider-thumb]:transition [&::-webkit-slider-thumb]:hover:scale-110 [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:bg-blue-600 [&::-moz-range-thumb]:shadow-lg [&::-moz-range-thumb]:transition [&::-moz-range-thumb]:hover:scale-110"
              style={{
                background: `linear-gradient(to right, rgb(37 99 235) 0%, rgb(37 99 235) ${
                  ((downPaymentPercentage - minDown) / (maxDown - minDown)) * 100
                }%, rgb(228 228 231) ${
                  ((downPaymentPercentage - minDown) / (maxDown - minDown)) * 100
                }%, rgb(228 228 231) 100%)`,
              }}
            />

            {/* Percentage Labels */}
            <div className="flex justify-between text-xs text-zinc-500">
              {[20, 30, 40, 50, 60, 70, 80].map((percent) => (
                <span key={percent} className={downPaymentPercentage === percent ? "font-bold text-blue-600" : ""}>
                  {percent}%
                </span>
              ))}
            </div>
          </div>

          {/* Loan Term Slider */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-sm font-medium text-zinc-900 dark:text-zinc-50">
                Plazo del crédito
                <span className="text-zinc-500">ⓘ</span>
              </label>
              <span className="text-lg font-bold text-blue-600 dark:text-blue-400">
                {loanTermMonths} <span className="text-sm font-normal text-zinc-600 dark:text-zinc-400">Meses</span>
              </span>
            </div>

            <input
              type="range"
              min={Math.min(...availableTerms)}
              max={Math.max(...availableTerms)}
              step={1}
              value={loanTermMonths}
              onChange={(e) => {
                const value = Number(e.target.value);
                // Snap to nearest available term
                const nearest = availableTerms.reduce((prev, curr) =>
                  Math.abs(curr - value) < Math.abs(prev - value) ? curr : prev
                );
                setLoanTermMonths(nearest);
              }}
              className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-zinc-200 dark:bg-zinc-700 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-blue-600 [&::-webkit-slider-thumb]:shadow-lg [&::-webkit-slider-thumb]:transition [&::-webkit-slider-thumb]:hover:scale-110 [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:bg-blue-600 [&::-moz-range-thumb]:shadow-lg [&::-moz-range-thumb]:transition [&::-moz-range-thumb]:hover:scale-110"
              style={{
                background: `linear-gradient(to right, rgb(37 99 235) 0%, rgb(37 99 235) ${
                  ((loanTermMonths - Math.min(...availableTerms)) /
                    (Math.max(...availableTerms) - Math.min(...availableTerms))) *
                  100
                }%, rgb(228 228 231) ${
                  ((loanTermMonths - Math.min(...availableTerms)) /
                    (Math.max(...availableTerms) - Math.min(...availableTerms))) *
                  100
                }%, rgb(228 228 231) 100%)`,
              }}
            />

            {/* Month Labels */}
            <div className="flex justify-between text-xs text-zinc-500">
              {availableTerms.map((term) => (
                <span key={term} className={loanTermMonths === term ? "font-bold text-blue-600" : ""}>
                  {term}
                </span>
              ))}
            </div>
          </div>

          {/* CTA Button */}
          <button className="w-full rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white transition hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600">
            Solicitar crédito
          </button>

          <p className="text-center text-xs text-zinc-500 dark:text-zinc-400">
            * Cálculo estimado. Tasa de interés: {interestRate}% anual
          </p>
        </div>
      )}

      {/* Reserve Tab Content */}
      {activeTab === "reserve" && (
        <div className="space-y-6 py-8 text-center">
          <div className="text-6xl">🏷️</div>
          <div>
            <h4 className="text-xl font-bold text-zinc-900 dark:text-zinc-50">Aparta este auto</h4>
            <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
              Reserva este vehículo con un depósito inicial
            </p>
          </div>
          <button className="w-full rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white transition hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600">
            Más información
          </button>
        </div>
      )}

      {/* Cash Tab Content */}
      {activeTab === "cash" && (
        <div className="space-y-6">
          <div className="rounded-lg bg-gradient-to-br from-green-50 to-green-100 p-6 dark:from-green-950 dark:to-green-900">
            <div className="mb-2 text-sm font-medium text-zinc-700 dark:text-zinc-300">Precio de contado</div>
            <div className="text-4xl font-bold text-green-600 dark:text-green-400">
              {new Intl.NumberFormat("en-US", {
                style: "currency",
                currency: "USD",
                minimumFractionDigits: 0,
              }).format(price)}
            </div>
            <div className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
              ✨ Mejor precio disponible
            </div>
          </div>

          <button className="w-full rounded-lg bg-green-600 px-6 py-3 font-semibold text-white transition hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600">
            Contactar vendedor
          </button>
        </div>
      )}
    </div>
  );
}
