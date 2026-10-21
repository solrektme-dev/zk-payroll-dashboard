"use client";

import { useState, useMemo } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { AssetSymbolInput } from "@/components/features/assets/AssetSymbolInput";
import BatchReferenceInput from "@/components/features/payroll/BatchReferenceInput";
import { normalizeAssetSymbol } from "@/lib/assets/normalizeAssetSymbol";
import { validateBatchReferenceWithDuplicateCheck } from "@/lib/validation/batchReference";
import DraftDescriptionInput from "@/components/payroll/DraftDescriptionInput";
import { validateDraftDescription } from "@/lib/validation/draftDescription";
import { MOCK_PAYROLL_RUNS } from "@/lib/api/mockData";
import { Coins, Shield, UserCheck, AlertTriangle } from "lucide-react";
import Link from "next/link";
import { useContractPauseGuard } from "@/hooks/useContractPauseGuard";

// Known batch references for duplicate guidance — demo uses mock run ids plus example refs
const KNOWN_BATCH_REFERENCES = [...MOCK_PAYROLL_RUNS.map((r) => r.id), "BATCH-2025-001", "payroll_q1_2025"];

/**
 * Payroll operator permission model.
 *
 * The dashboard must validate that the current operator holds the
 * `create:payroll` permission before allowing a draft batch to
 * be created. This is a privacy-aware gate: we only expose the operator's
 * role label and the missing permission, never salary or amount data.
 */
export type PayrollPermission = "create:payroll" | "view:payroll" | "approve:payroll";

export type PayrollOperatorRole = "admin" | "operator" | "viewer" | "guest";

export interface PayrollOperator {
  id: string;
  name: string;
  role: PayrollOperatorRole;
  permissions: PayrollPermission[];
}

/**
 * Role → permission matrix used to derive effective permissions.
 * Keeping this explicit makes the gate auditable and easy to test.
 */
export const ROLE_PERMISSIONS: Record<PayrollOperatorRole, PayrollPermission[]> = {
  admin: ["create:payroll", "view:payroll", "approve:payroll"],
  operator: ["create:payroll", "view:payroll"],
  viewer: ["view:payroll"],
  guest: [],
};

export interface PermissionCheckResult {
  allowed: boolean;
  operator: PayrollOperator;
  required: PayrollPermission;
  message: string;
}

/**
 * Validate whether an operator may create a payroll batch.
 *
 * Returns an actionable message when denied so the UI can surface
 * clear guidance to the operator without leaking sensitive data.
 */
export function validatePayrollOperatorPermission(
  operator: PayrollOperator,
  required: PayrollPermission = "create:payroll",
): PermissionCheckResult {
  if (!operator || typeof operator.id !== "string" || operator.id.trim().length === 0) {
    return {
      allowed: false,
      operator,
      required,
      message: "No payroll operator is signed in. Sign in with an operator account to create a payroll batch.",
    };
  }

  if (!operator.role || !(operator.role in ROLE_PERMISSIONS)) {
    return {
      allowed: false,
      operator,
      required,
      message: `Unknown payroll role "${operator.role}". Contact an administrator to assign a valid role.`,
    };
  }

  const effective = new Set([
    ...(ROLE_PERMISSIONS[operator.role] ?? []),
    ...(Array.isArray(operator.permissions) ? operator.permissions : []),
  ]);

  if (!effective.has(required)) {
    return {
      allowed: false,
      operator,
      required,
      message: `Operator "${operator.name || operator.id}" with role "${operator.role}" lacks the "${required}" permission required to create a payroll batch.`,
    };
  }

  return {
    allowed: true,
    operator,
    required,
    message: `Operator "${operator.name || operator.id}" is authorized to create payroll batches.`,
  };
}

/**
 * Default operator used by the dashboard when no explicit operator id
 * is provided. This mirrors the demo auth session and keeps the flow
 * working without a real backend.
 */
export const DEFAULT_PAYROLL_OPERATOR: PayrollOperator = {
  id: "operator-demo-001",
  name: "Demo Operator",
  role: "operator",
  permissions: [],
};

/**
 * Sensitive diagnostic redaction.
 *
 * The developer diagnostic panel on this page renders raw input values.
 * Raw inputs can contain sensitive data (account numbers, emails,
 * token-like strings, long numeric amounts). This helper redacts those
 * patterns before they are rendered so diagnostic copy never leaks sensitive values to the screen, logs, or screenshots.
 */
export interface RedactionResult {
  redacted: string;
  wasRedacted: boolean;
}

const REDACTED_PLACEHOLDER = "[redacted]";

// Email addresses (e.g. payroll@example.com)
const EMAIL_PATTERN = /[A-Za-z0-9._%+\-]+@[A-Za-z0-9.\-]+\.[A-Za-z]{2,}/g;
// Long digit sequences (account numbers, wallet ids, amounts)
const LONG_DIGITS_PATTERN = /\d(?:[\s\-]?\d){3,}/g;
// Token-like strings (API keys, secrets, hashes)
const TOKEN_PATTERN = /[a-zA-Z0-9_\-]{24,}/g;

export function redactSensitiveDiagnosticValue(value: string | null | undefined): RedactionResult {
  if (value == null || value === "") {
    return { redacted: "", wasRedacted: false };
  }

  const original = String(value);
  const redacted = original
    .replace(EMAIL_PATTERN, REDACTED_PLACEHOLDER)
    .replace(LONG_DIGITS_PATTERN, REDACTED_PLACEHOLDER)
    .replace(TOKEN_PATTERN, REDACTED_PLACEHOLDER);

  return { redacted, wasRedacted: redacted !== original };
}

export default function PayrollCreatePage() {
  const [assetRaw, setAssetRaw] = useState("");
  const [batchRef, setBatchRef] = useState("");
  const [description, setDescription] = useState("");
  const [submitted, setSubmitted] = useState<{ asset: string; batchRef: string; description: string } | null>(null);
  const [error, setError] = useState<string | null>(null);

  // The operator driving this dashboard session. In a live app this would
  // come from the auth context; the default keeps the demo flow working.
  const operator = DEFAULT_PAYROLL_OPERATOR;

  const { isMutationDisabled, checkAction } = useContractPauseGuard();

  const permissionCheck = useMemo(
    () => validatePayrollOperatorPermission(operator, "create:payroll"),
    [operator],
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Contract pause gate: deny mutation actions when contracts are paused
    const pauseCheck = checkAction("create_payroll_draft");
    if (!pauseCheck.allowed) {
      setError(pauseCheck.message);
      setSubmitted(null);
      return;
    }

    // Permission gate first: deny before any field work is done.
    if (!permissionCheck.allowed) {
      setError(permissionCheck.message);
      setSubmitted(null);
      return;
    }

    const assetResult = normalizeAssetSymbol(assetRaw);
    if (!assetResult.isValid) {
      setError(assetResult.validationError);
      setSubmitted(null);
      return;
    }
    const batchResult = validateBatchReferenceWithDuplicateCheck(batchRef, KNOWN_BATCH_REFERENCES);
    if (!batchResult.isValid) {
      setError(batchResult.message);
      setSubmitted(null);
      return;
    }
    const descriptionResult = validateDraftDescription(description);
    if (!descriptionResult.isValid) {
      setError(descriptionResult.message);
      setSubmitted(null);
      return;
    }
    setError(null);
    // Privacy-safe: only normalized asset + batch reference (opaque ID) — no amounts
    setSubmitted({ asset: assetResult.normalized, batchRef: batchResult.normalized, description: description });
  };

  const result = normalizeAssetSymbol(assetRaw);
  const batchValidation = useMemo(
    () => validateBatchReferenceWithDuplicateCheck(batchRef, KNOWN_BATCH_REFERENCES),
    [batchRef],
  );
  const descriptionValidation = useMemo(
    () => validateDraftDescription(description),
    [description],
  );

  // Redact sensitive patterns before rendering the diagnostic panel.
  const assetDiagnostic = redactSensitiveDiagnosticValue(assetRaw);
  const batchDiagnostic = redactSensitiveDiagnosticValue(batchRef);
  const descriptionDiagnostic = redactSensitiveDiagnosticValue(description);
  const hasRedaction =
    assetDiagnostic.wasRedacted || batchDiagnostic.wasRedacted || descriptionDiagnostic.wasRedacted;

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto space-y-6">
        <header className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center gap-3">
            <div className="w-11 h-10 rounded-full bg-indigo-50 flex items-center justify-center">
              <Coins className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-gray-900">Create Payroll Batch</h1>
              <p className="text-sm text-gray-500 mt-0.5">Enter asset details — symbols are normalized for consistency before submission.</p>
            </div>
          </div>
        </header>

        <div data-testid="payroll-operator-permission" className="bg-white rounded-lg shadow-sm p-4">
          <div className="flex items-center gap-2 text-sm">
            {permissionCheck.allowed ? (
              <>
                <UserCheck className="w-4 h-4 text-green-600" />
                <span className="text-gray-700">
                  Operator: <span className="font-medium">{operator.name || operator.id}</span> ({operator.role}) — authorized to create payroll batches.
                </span>
              </>
            ) : (
              <>
                <AlertTriangle className="w-4 h-4 text-red-600" />
                <span className="text-red-700" data-testid="payroll-operator-denied">
                  {permissionCheck.message}
                </span>
              </>
            )}
          </div>
        </div>

        {isMutationDisabled && (
          <div
            role="alert"
            data-testid="contract-paused-alert"
            className="bg-amber-50 border border-amber-300 rounded-lg p-4 text-sm text-amber-900"
          >
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
              <span className="font-medium">
                Payroll smart contracts are currently paused. Batch creation and other mutation actions are disabled.
              </span>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate className="bg-white rounded-lg shadow-sm p-6 space-y-6">
          <AssetSymbolInput value={assetRaw} onChange={(raw) => setAssetRaw(raw)} />

          <BatchReferenceInput
            value={batchRef}
            onChange={setBatchRef}
            existingReferences={KNOWN_BATCH_REFERENCES}
            label="External batch reference"
            placeholder="e.g. BATCH-2025-001"
          />

          <DraftDescriptionInput
            value={description}
            onChange={setDescription}
          />

          <div className="rounded-lg bg-gray-50 border p-3 text-xs text-gray-600">
            <p className="font-medium text-gray-700 mb-1 flex items-center gap-1">
              <Shield className="w-3.5 h-3.5" /> Privacy &amp; validation
            </p>
            <p>Asset raw: <span className="font-mono">{assetDiagnostic.redacted || "—"}</span> → <span className="font-mono font-medium">{result.normalized || "—"}</span> {result.isValid ? "✓" : `x● ${result.validationError}`} {result.wasNormalized && <span className="text-amber-700">(normalized)</span>}</p>
            <p>Batch ref: <span className="font-mono">{batchDiagnostic.redacted || "—"}</span> → <span className="font-mono font-medium">{batchValidation.normalized || "—"}</span> {batchValidation.isValid ? "✓ no duplicate" : `x● ${batchValidation.message}`}</p>
            <p>Description: <span className="font-mono">{descriptionDiagnostic.redacted || "—"}</span> {descriptionValidation.isValid ? "✓ no sensitive data" : `x● <span className="text-red-700">{descriptionValidation.message}</span>`}</p>
            {hasRedaction && (
              <p className="text-amber-700 mt-1">
                Sensitive values are redacted in this diagnostic view.
              </p>
            )}
          </div>

          {error && (
            <div role="alert" className="bg-red-50 border border-red-300 rounded-lg p-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={!permissionCheck.allowed || isMutationDisabled}
            className="w-full inline-flex items-center justify-center rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Create Draft Batch
          </button>
        </form>

        {submitted && (
          <div data-testid="payroll-draft-created" className="bg-green-50 border border-green-300 rounded-lg p-4 text-sm text-green-900">
            <p className="font-medium">Draft batch created</p>
            <p>Asset: <span className="font-mono">{submitted.asset}</span></p>
            <p>Batch reference: <span className="font-mono">{submitted.batchRef}</span></p>
          </div>
        )}

        <p className="text-xs text-gray-500">
          <Link href="/payroll" className="text-indigo-600 hover:underline">
            Back to payroll
          </Link>
        </p>
      </div>
    </DashboardLayout>
  );
}
