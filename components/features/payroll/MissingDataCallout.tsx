"use client";

import React from "react";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import { Employee, PayrollRun } from "@/types/models";

interface MissingField {
  field: string;
  label: string;
  severity: "warning" | "error";
  suggestion?: string;
}

interface MissingDataCalloutProps {
  missingFields: MissingField[];
  entityType: "employee" | "payroll";
  entityName?: string;
  onDismiss?: () => void;
}

export function MissingDataCallout({
  missingFields,
  entityType,
  entityName,
  onDismiss,
}: MissingDataCalloutProps) {
  if (missingFields.length === 0) {
    return null;
  }

  const hasErrors = missingFields.some((f) => f.severity === "error");
  const bgColor = hasErrors ? "bg-red-50" : "bg-amber-50";
  const borderColor = hasErrors ? "border-red-200" : "border-amber-200";
  const textColor = hasErrors ? "text-red-700" : "text-amber-700";
  const headerColor = hasErrors ? "text-red-900" : "text-amber-900";
  const icon = hasErrors ? AlertCircle : AlertCircle;

  const Icon = icon;

  return (
    <div className={`rounded-lg border ${borderColor} ${bgColor} p-4`}>
      <div className="flex items-start gap-3">
        <Icon className={`w-5 h-5 mt-0.5 flex-shrink-0 ${textColor}`} />
        <div className="flex-1 min-w-0">
          <h3 className={`font-semibold ${headerColor}`}>
            {hasErrors ? "Missing Required Data" : "Incomplete Configuration"}
            {entityName && ` - ${entityName}`}
          </h3>
          <p className={`text-sm mt-1 ${textColor}`}>
            {hasErrors
              ? "Please complete required fields before proceeding."
              : "Some fields are incomplete. Please review and update."}
          </p>

          <ul className="mt-3 space-y-2">
            {missingFields.map((field) => (
              <li key={field.field} className={`text-sm ${textColor}`}>
                <div className="flex items-start gap-2">
                  <span className="font-medium">{field.label}</span>
                  {field.severity === "error" && (
                    <span className="px-2 py-0.5 rounded text-xs font-semibold bg-red-200 text-red-900">
                      Required
                    </span>
                  )}
                </div>
                {field.suggestion && (
                  <p className={`text-xs mt-1 opacity-75 ml-0.5`}>{field.suggestion}</p>
                )}
              </li>
            ))}
          </ul>
        </div>
        {onDismiss && (
          <button
            onClick={onDismiss}
            className={`text-sm font-medium ${textColor} hover:underline flex-shrink-0`}
          >
            Dismiss
          </button>
        )}
      </div>
    </div>
  );
}

export function validateEmployeeData(employee: Employee): MissingField[] {
  const missing: MissingField[] = [];

  if (!employee.name || employee.name.trim() === "") {
    missing.push({
      field: "name",
      label: "Employee Name",
      severity: "error",
      suggestion: "Add the employee's full name to their profile.",
    });
  }

  if (!employee.address || employee.address.trim() === "") {
    missing.push({
      field: "address",
      label: "Stellar Address",
      severity: "error",
      suggestion: "Provide the employee's Stellar wallet address for payment.",
    });
  }

  if (!employee.salary || employee.salary <= 0) {
    missing.push({
      field: "salary",
      label: "Salary Amount",
      severity: "error",
      suggestion: "Set the employee's compensation amount.",
    });
  }

  if (!employee.salaryCommitment || employee.salaryCommitment.trim() === "") {
    missing.push({
      field: "salaryCommitment",
      label: "Salary Commitment",
      severity: "error",
      suggestion: "Record the salary commitment hash for audit trail.",
    });
  }

  if (!employee.email || employee.email.trim() === "") {
    missing.push({
      field: "email",
      label: "Email Address",
      severity: "warning",
      suggestion: "Add email for notifications and communications.",
    });
  }

  if (!employee.startDate || employee.startDate.trim() === "") {
    missing.push({
      field: "startDate",
      label: "Start Date",
      severity: "warning",
      suggestion: "Record when the employee started for payroll history.",
    });
  }

  return missing;
}

export function validatePayrollRunData(payroll: PayrollRun): MissingField[] {
  const missing: MissingField[] = [];

  if (!payroll.employeeIds || payroll.employeeIds.length === 0) {
    missing.push({
      field: "employeeIds",
      label: "Employees",
      severity: "error",
      suggestion: "Add at least one employee to the payroll run.",
    });
  }

  if (!payroll.proof || payroll.proof.trim() === "") {
    missing.push({
      field: "proof",
      label: "ZK Proof",
      severity: "error",
      suggestion: "Generate a zero-knowledge proof before submission.",
    });
  }

  if (!payroll.totalAmount || payroll.totalAmount <= 0) {
    missing.push({
      field: "totalAmount",
      label: "Total Amount",
      severity: "error",
      suggestion: "Calculate the total payment amount for this run.",
    });
  }

  if (!payroll.companyId || payroll.companyId.trim() === "") {
    missing.push({
      field: "companyId",
      label: "Company",
      severity: "error",
      suggestion: "Associate this payroll run with a company.",
    });
  }

  if (payroll.reconciliationStatus === undefined) {
    missing.push({
      field: "reconciliationStatus",
      label: "Reconciliation Status",
      severity: "warning",
      suggestion: "Mark reconciliation status after settlement.",
    });
  }

  return missing;
}
