"use client";

import { useMemo } from "react";
import { AlertTriangle, ArrowRight, Wallet, DollarSign, ShieldAlert } from "lucide-react";
import { useEmployeeStore } from "@/stores/employees";
import { MOCK_EMPLOYEES } from "@/lib/api/mockData";

export default function OnboardingChecklistPanel() {
  const { employees: storedEmployees } = useEmployeeStore();
  const employees = storedEmployees.length > 0 ? storedEmployees : MOCK_EMPLOYEES;

  const incompleteEmployees = useMemo(() => {
    return employees
      .map((emp) => {
        const missingSteps = [];

        // Check wallet address
        if (!emp.address || emp.address.length !== 56 || !emp.address.startsWith("G")) {
          missingSteps.push({
            id: "address",
            label: "Missing Wallet Address",
            icon: Wallet,
          });
        }

        // Check salary
        if (!emp.salary || emp.salary <= 0) {
          missingSteps.push({
            id: "salary",
            label: "Salary Not Set",
            icon: DollarSign,
          });
        }

        // Check ZK Commitment
        if (!emp.salaryCommitment || !emp.salaryCommitment.startsWith("0x")) {
          missingSteps.push({
            id: "commitment",
            label: "ZK Commitment Missing",
            icon: ShieldAlert,
          });
        }

        return {
          ...emp,
          missingSteps,
        };
      })
      .filter((emp) => emp.missingSteps.length > 0 && emp.isActive !== false);
  }, [employees]);

  if (incompleteEmployees.length === 0) {
    return null;
  }

  return (
    <section aria-labelledby="onboarding-checklist-heading">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 id="onboarding-checklist-heading" className="text-lg font-semibold text-gray-900">
            Action Required: Onboarding Setup
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            Resolve missing setup steps before next payroll run
          </p>
        </div>
      </div>

      <div className="bg-white border rounded-lg shadow-sm overflow-hidden">
        <ul className="divide-y divide-gray-100">
          {incompleteEmployees.map((emp) => (
            <li key={emp.id} className="p-4 sm:p-5 hover:bg-gray-50 transition-colors">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="mt-1">
                    <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center">
                      <AlertTriangle className="w-4 h-4 text-amber-600" aria-hidden="true" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">{emp.name}</h3>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {emp.missingSteps.map((step) => {
                        const Icon = step.icon;
                        return (
                          <span
                            key={step.id}
                            className="inline-flex items-center gap-1.5 px-2 py-1 rounded text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200"
                          >
                            <Icon className="w-3.5 h-3.5" aria-hidden="true" />
                            {step.label}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                </div>
                
                <div className="flex shrink-0 sm:ml-4 mt-2 sm:mt-0">
                  <a
                    href="/employees"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-white border border-gray-300 text-xs font-medium text-gray-700 hover:bg-gray-50 transition-colors shadow-sm"
                  >
                    Resolve in Directory
                    <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
                  </a>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
