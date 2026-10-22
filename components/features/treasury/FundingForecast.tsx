"use client";

import { AlertTriangle, Info, ArrowRight } from "lucide-react";
import { MOCK_FUNDING_FORECAST } from "@/lib/api/mockData";
import Link from "next/link";

function FundingForecast() {
  const forecast = MOCK_FUNDING_FORECAST;
  const isDeficit = forecast.fundingGap < 0;
  const surplusLabel = isDeficit ? "Funding gap" : "Projected surplus";
  const surplusValue = isDeficit
    ? `-$${Math.abs(forecast.fundingGap).toLocaleString()}`
    : `$${forecast.fundingGap.toLocaleString()}`;

  return (
    <section aria-labelledby="forecast-heading" className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-center justify-between mb-1">
        <h3 id="forecast-heading" className="text-base font-medium text-gray-900">
          Funding forecast
        </h3>
        <span className="text-xs text-gray-500">
          {new Date(forecast.cycleStart).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
          })}
          {" – "}
          {new Date(forecast.cycleEnd).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          })}
        </span>
      </div>

      <p className="text-xs text-gray-500 mb-4">
        Upcoming payroll cycle &middot; {forecast.employeeCount} employee
        {forecast.employeeCount > 1 ? "s" : ""}
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
        <div>
          <p className="text-sm text-gray-600">Estimated payroll</p>
          <p className="text-2xl font-bold text-gray-900">
            ${forecast.estimatedTotal.toLocaleString()}
          </p>
        </div>
        <div>
          <p className="text-sm text-gray-600">Current balance</p>
          <p className="text-2xl font-bold text-gray-900">
            ${forecast.currentBalance.toLocaleString()}
          </p>
        </div>
        <div>
          <p className="text-sm text-gray-600">{surplusLabel}</p>
          <p
            className={`text-2xl font-bold ${
              isDeficit ? "text-red-600" : "text-green-700"
            }`}
          >
            {surplusValue}
          </p>
          <div className="flex items-center gap-1 mt-1">
            {isDeficit ? (
              <AlertTriangle className="w-3.5 h-3.5 text-red-500" aria-hidden="true" />
            ) : (
              <Info className="w-3.5 h-3.5 text-green-500" aria-hidden="true" />
            )}
            <span className={`text-xs ${isDeficit ? "text-red-600" : "text-green-600"}`}>
              {isDeficit ? "Deficit – add funds before cycle" : "Sufficient funds"}
            </span>
          </div>
        </div>
      </div>

      <details className="group">
        <summary className="text-xs text-indigo-600 cursor-pointer hover:text-indigo-800 list-none flex items-center gap-1 select-none">
          <ArrowRight className="w-3 h-3 transition-transform group-open:rotate-90" aria-hidden="true" />
          Breakdown
        </summary>
        <div className="mt-3 space-y-1.5 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Payroll total</span>
            <span className="font-medium">${forecast.breakdown.payrollTotal.toLocaleString()}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Buffer reserve</span>
            <span className="font-medium">${forecast.breakdown.bufferReserve.toLocaleString()}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Miscellaneous</span>
            <span className="font-medium">${forecast.breakdown.miscellaneous.toLocaleString()}</span>
          </div>
          <div className="border-t pt-1.5 flex justify-between font-semibold">
            <span>Total</span>
            <span>${forecast.estimatedTotal.toLocaleString()}</span>
          </div>
        </div>
      </details>

      {forecast.confidence === "medium" || forecast.confidence === "low" ? (
        <div className="mt-4 p-3 rounded-lg bg-amber-50 border border-amber-200">
          <div className="flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" aria-hidden="true" />
            <div>
              <p className="text-xs font-medium text-amber-800">
                {forecast.confidence === "low" ? "Low confidence" : "Uncertainty detected"}
              </p>
              <ul className="mt-1 space-y-0.5">
                {forecast.uncertaintyFactors.map((factor, i) => (
                  <li key={i} className="text-xs text-amber-700 list-disc ml-4">
                    {factor}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      ) : null}

      <div className="mt-4 pt-4 border-t flex items-center justify-between">
        <Link
          href="/payroll/execute"
          className="text-xs text-indigo-600 hover:text-indigo-800 font-medium inline-flex items-center gap-1"
        >
          Review payroll wizard
          <ArrowRight className="w-3 h-3" aria-hidden="true" />
        </Link>
        <span className="text-xs text-gray-400">
          Updated {new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" })}
        </span>
      </div>
    </section>
  );
}

export default FundingForecast;
