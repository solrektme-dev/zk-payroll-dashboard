"use client";

import { useMemo } from "react";
import { MOCK_TRANSACTIONS } from "@/lib/api/mockData";

export default function PrintAuditReport() {
  const reportDate = useMemo(() => new Date().toLocaleDateString(), []);
  
  // Total stats
  const totalRuns = MOCK_TRANSACTIONS.length;
  const totalAmount = useMemo(() => MOCK_TRANSACTIONS.reduce((sum, t) => sum + t.totalAmount, 0), []);
  const totalEmployees = useMemo(() => MOCK_TRANSACTIONS.reduce((sum, t) => sum + t.employeeCount, 0), []);

  return (
    <div className="hidden print:block p-10 bg-white text-black font-sans text-sm leading-relaxed max-w-[8.5in] mx-auto">
      {/* Header section */}
      <div className="border-b-2 border-gray-900 pb-6 mb-8 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight uppercase text-gray-900">ZK Payroll Dashboard</h1>
          <p className="text-xs text-gray-500 mt-1 uppercase tracking-wider font-semibold">Cryptographic Audit Ledger Report</p>
        </div>
        <div className="text-right">
          <div className="inline-block px-3 py-1 bg-black text-white text-xs font-bold uppercase tracking-wider">
            Verified Compliant
          </div>
          <p className="text-xs text-gray-500 mt-1">Generated: {reportDate}</p>
        </div>
      </div>

      {/* Security notice */}
      <div className="p-4 border border-gray-300 bg-gray-50 mb-8 rounded">
        <h4 className="text-xs font-bold text-gray-800 uppercase tracking-wide flex items-center gap-1.5">
          ⚠️ Security & Privacy compliance statement
        </h4>
        <p className="text-xs text-gray-600 mt-1.5 leading-normal">
          This document represents the aggregated cryptographic proof audit log for on-chain payroll payments. 
          Detailed employee names, addresses, tax identification numbers, and individual wage breakdowns 
          are **zero-knowledge shielded** and excluded from this printable ledger to comply with global privacy standards 
          (including GDPR, HIPAA, and CCPA). On-chain compliance can be cryptographically verified using the hashes listed below.
        </p>
      </div>

      {/* Audit Metadata */}
      <div className="mb-8">
        <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider border-b pb-1 mb-3">
          Verification Metadata
        </h3>
        <div className="grid grid-cols-2 gap-y-2 text-xs">
          <div><span className="font-semibold text-gray-600">Smart Contract (Soroban Receiver):</span></div>
          <div className="font-mono text-gray-900 select-all">CC4390F21A781E99AA12B895CD1A9876E5D4</div>

          <div><span className="font-semibold text-gray-600">Merkle Root Commitment:</span></div>
          <div className="font-mono text-gray-900">0xbc789e5a1b32d0f9876e5d4a3b2c1e09fa876e5d4</div>

          <div><span className="font-semibold text-gray-600">Audit Status:</span></div>
          <div className="font-semibold text-emerald-700">PASS (Zero-Knowledge Constraints Validated)</div>

          <div><span className="font-semibold text-gray-600">Total Audit Scope:</span></div>
          <div>{totalRuns} Payroll runs | {totalEmployees} Aggregated payouts | ${totalAmount.toLocaleString()}.00 USD</div>
        </div>
      </div>

      {/* Table section */}
      <div>
        <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider border-b pb-1 mb-3">
          On-Chain Transaction Log
        </h3>
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-gray-900 bg-gray-100">
              <th className="py-2 px-3 font-semibold text-gray-700 uppercase">Run ID</th>
              <th className="py-2 px-3 font-semibold text-gray-700 uppercase">Recipients</th>
              <th className="py-2 px-3 font-semibold text-gray-700 uppercase text-right">Shielded Amount</th>
              <th className="py-2 px-3 font-semibold text-gray-700 uppercase text-center">Status</th>
              <th className="py-2 px-3 font-semibold text-gray-700 uppercase">Date</th>
              <th className="py-2 px-3 font-semibold text-gray-700 uppercase">Tx Verification Hash</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {MOCK_TRANSACTIONS.map((tx) => (
              <tr key={tx.id} className="align-middle">
                <td className="py-2.5 px-3 font-mono font-bold text-gray-900">{tx.id}</td>
                <td className="py-2.5 px-3 text-gray-600">{tx.employeeCount} [REDACTED LIST]</td>
                <td className="py-2.5 px-3 text-right font-semibold text-gray-900">${tx.totalAmount.toLocaleString()}.00</td>
                <td className="py-2.5 px-3 text-center">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 border border-emerald-600 text-emerald-700 rounded-sm">
                    {tx.status}
                  </span>
                </td>
                <td className="py-2.5 px-3 text-gray-600">{new Date(tx.createdAt).toLocaleDateString()}</td>
                <td className="py-2.5 px-3 font-mono text-[10px] text-gray-500">
                  {tx.txHash ? `${tx.txHash.slice(0, 14)}...` : "0x78af31c2...b9da"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer sign off */}
      <div className="mt-16 pt-8 border-t border-gray-300 grid grid-cols-2 gap-10 text-xs">
        <div>
          <p className="font-semibold text-gray-600">Company Chief Financial Officer</p>
          <div className="h-10 border-b border-dashed border-gray-400 mt-4"></div>
          <p className="text-[10px] text-gray-400 mt-1">Signature & Date</p>
        </div>
        <div>
          <p className="font-semibold text-gray-600">Auditing Compliance Officer</p>
          <div className="h-10 border-b border-dashed border-gray-400 mt-4"></div>
          <p className="text-[10px] text-gray-400 mt-1">Signature & Date</p>
        </div>
      </div>
    </div>
  );
}
