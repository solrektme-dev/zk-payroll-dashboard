"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import {
  AlertTriangle,
  CheckCircle,
  XCircle,
  Pencil,
  Edit3,
  UserPlus,
  ArrowUpDown,
  Eye,
} from "lucide-react";
import { useImportReviewStore } from "@/stores/importReview";
import type { ImportRecord, ImportRecordIssue } from "@/stores/importReview";
import { useEmployeeStore } from "@/stores/employees";
import { toast } from "sonner";
import EmptyState from "@/components/ui/EmptyState";
import StatusBadge from "@/components/ui/StatusBadge";

const SEVERITY_BADGES: Record<ImportRecordIssue["severity"], string> = {
  warning: "bg-amber-50 text-amber-700 border-amber-200",
  error: "bg-red-50 text-red-700 border-red-200",
};

type SortField = "name" | "department" | "salary" | "status";
type SortDir = "asc" | "desc";

function generateMockImportRecords(): ImportRecord[] {
  return [
    {
      id: "imp_001",
      rowIndex: 1,
      name: "Chiamaka Okafor",
      email: "chiamaka@example.com",
      department: "Engineering",
      address: "GAC2P5KQGKIHYJGXNUIYOMHARUARCA7DJT5FO2FFOOKY3B2WSQHG4X37",
      salary: 6200,
      startDate: "2025-06-01T00:00:00Z",
      status: "pending",
      importedAt: new Date().toISOString(),
      issues: [
        {
          field: "address",
          message: "Stellar address may be invalid; verify on-chain before approving",
          severity: "warning",
        },
      ],
    },
    {
      id: "imp_002",
      rowIndex: 2,
      name: "Oluwaseun Adeyemi",
      email: "seun@example.com",
      department: "Product",
      address: "GDQP2KPQGKIHYJGXNUIYOMHARUARCA7DJT5FO2FFOOKY3B2WSQHG4W37",
      salary: 4800,
      startDate: "2025-05-15T00:00:00Z",
      status: "pending",
      importedAt: new Date().toISOString(),
      issues: [
        {
          field: "salary",
          message: "Salary is below department minimum for Product (5000)",
          severity: "error",
        },
        {
          field: "email",
          message: "Email domain mismatch with company domain",
          severity: "warning",
        },
      ],
    },
    {
      id: "imp_003",
      rowIndex: 3,
      name: "Fatima Ibrahim",
      department: "Finance",
      address: "GAAZI4TCR3TY5OJHCTJC2A4QSY6CJWJH5IAJTGKIN2ER7LBNVKOCCWN",
      salary: 5500,
      startDate: "2025-04-01T00:00:00Z",
      status: "pending",
      importedAt: new Date().toISOString(),
      issues: [
        {
          field: "email",
          message: "Email address is missing; required for payroll notifications",
          severity: "warning",
        },
      ],
    },
    {
      id: "imp_004",
      rowIndex: 4,
      name: "Tendai Moyo",
      email: "tendai@example.com",
      department: "Engineering",
      address: "GBVXCPHJMZ5HZXMBBP3YMBM6HXKH3JRXJBHXJHXJHXJHXJHX",
      salary: 7000,
      startDate: "2025-06-15T00:00:00Z",
      status: "pending",
      importedAt: new Date().toISOString(),
      issues: [],
    },
  ];
}

interface EditModalProps {
  record: ImportRecord;
  onSave: (record: ImportRecord) => void;
  onClose: () => void;
}

function EditModal({ record, onSave, onClose }: EditModalProps) {
  const [form, setForm] = useState({
    name: record.name,
    email: record.email ?? "",
    department: record.department ?? "",
    salary: String(record.salary),
    startDate: record.startDate.split("T")[0],
  });

  const handleSave = () => {
    onSave({
      ...record,
      name: form.name.trim(),
      email: form.email.trim() || undefined,
      department: form.department.trim() || undefined,
      salary: parseFloat(form.salary) || record.salary,
      startDate: new Date(form.startDate).toISOString(),
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div
        className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6 space-y-4"
        role="dialog"
        aria-modal="true"
        aria-label={`Edit ${record.name}`}
      >
        <h3 className="text-base font-semibold text-gray-900">
          Edit {record.name}
        </h3>
        <div className="space-y-3">
          <div>
            <label
              htmlFor="edit-import-name"
              className="block text-xs font-medium text-gray-600 mb-1"
            >
              Name
            </label>
            <input
              id="edit-import-name"
              type="text"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              className="w-full rounded-md border border-gray-300 px-3 py-1.5 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          </div>
          <div>
            <label
              htmlFor="edit-import-email"
              className="block text-xs font-medium text-gray-600 mb-1"
            >
              Email
            </label>
            <input
              id="edit-import-email"
              type="email"
              value={form.email}
              onChange={(e) =>
                setForm((f) => ({ ...f, email: e.target.value }))
              }
              className="w-full rounded-md border border-gray-300 px-3 py-1.5 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          </div>
          <div>
            <label
              htmlFor="edit-import-dept"
              className="block text-xs font-medium text-gray-600 mb-1"
            >
              Department
            </label>
            <input
              id="edit-import-dept"
              type="text"
              value={form.department}
              onChange={(e) =>
                setForm((f) => ({ ...f, department: e.target.value }))
              }
              className="w-full rounded-md border border-gray-300 px-3 py-1.5 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          </div>
          <div>
            <label
              htmlFor="edit-import-salary"
              className="block text-xs font-medium text-gray-600 mb-1"
            >
              Salary
            </label>
            <input
              id="edit-import-salary"
              type="number"
              value={form.salary}
              onChange={(e) =>
                setForm((f) => ({ ...f, salary: e.target.value }))
              }
              className="w-full rounded-md border border-gray-300 px-3 py-1.5 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          </div>
          <div>
            <label
              htmlFor="edit-import-start"
              className="block text-xs font-medium text-gray-600 mb-1"
            >
              Start Date
            </label>
            <input
              id="edit-import-start"
              type="date"
              value={form.startDate}
              onChange={(e) =>
                setForm((f) => ({ ...f, startDate: e.target.value }))
              }
              className="w-full rounded-md border border-gray-300 px-3 py-1.5 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          </div>
        </div>
        <div className="flex justify-end gap-3 pt-2">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-md border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 rounded-md bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ImportReviewQueue() {
  const {
    records: storedRecords,
    setRecords,
    approveRecord,
    rejectRecord,
    editRecord,
    approveAll,
    rejectAll,
    clearRecords,
  } = useImportReviewStore();

  const addEmployee = useEmployeeStore((s) => s.addEmployee);

  const [sortField, setSortField] = useState<SortField>("name");
  const [sortDir, setSortDir] = useState<SortDir>("asc");
  const [editingRecord, setEditingRecord] = useState<ImportRecord | null>(null);
  const [initialized, setInitialized] = useState(false);

  const records = useMemo(
    () => (storedRecords.length > 0 ? storedRecords : []),
    [storedRecords]
  );

  useEffect(() => {
    if (!initialized && storedRecords.length === 0) {
      setRecords(generateMockImportRecords());
      const t = setTimeout(() => setInitialized(true), 100);
      return () => clearTimeout(t);
    }
  }, [initialized, storedRecords.length, setRecords]);

  const pendingCount = useMemo(
    () => records.filter((r) => r.status === "pending").length,
    [records]
  );

  const sorted = useMemo(() => {
    const copy = [...records];
    copy.sort((a, b) => {
      let cmp = 0;
      if (sortField === "name") cmp = a.name.localeCompare(b.name);
      else if (sortField === "department")
        cmp = (a.department ?? "").localeCompare(b.department ?? "");
      else if (sortField === "salary") cmp = a.salary - b.salary;
      else if (sortField === "status")
        cmp = a.status.localeCompare(b.status);
      return sortDir === "asc" ? cmp : -cmp;
    });
    return copy;
  }, [records, sortField, sortDir]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDir("asc");
    }
  };

  const handleApproveAndOnboard = useCallback(
    (record: ImportRecord) => {
      approveRecord(record.id);
      addEmployee({
        id: `emp_${Date.now()}_${record.rowIndex}`,
        address: record.address,
        name: record.name,
        email: record.email,
        department: record.department,
        salary: record.salary,
        salaryCommitment: `0ximported_${record.rowIndex}`,
        isActive: true,
        status: "pending",
        onboardingStatus: "not_started",
        startDate: record.startDate,
      });
      toast.success(`${record.name} approved and added to directory`);
    },
    [approveRecord, addEmployee]
  );

  const handleApproveAll = () => {
    approveAll();
    records.forEach((r) => {
      if (r.status === "pending") {
        addEmployee({
          id: `emp_${Date.now()}_${r.rowIndex}_${Math.random().toString(36).slice(2, 6)}`,
          address: r.address,
          name: r.name,
          email: r.email,
          department: r.department,
          salary: r.salary,
          salaryCommitment: `0ximported_${r.rowIndex}`,
          isActive: true,
          status: "pending",
          onboardingStatus: "not_started",
          startDate: r.startDate,
        });
      }
    });
    toast.success("All pending records approved and added to directory");
  };

  const handleClearProcessed = () => {
    clearRecords();
    toast.info("Review queue has been cleared");
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return null;
    return (
      <span className="ml-1 inline-block">
        {sortDir === "asc" ? "\u2191" : "\u2193"}
      </span>
    );
  };

  return (
    <section aria-labelledby="import-review-heading">
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="px-4 sm:px-6 py-4 border-b flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h3
              id="import-review-heading"
              className="text-lg font-medium text-gray-900"
            >
              Import Review Queue
            </h3>
            <p className="text-sm text-gray-500 mt-0.5">
              Review imported employee records before onboarding completion
            </p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {pendingCount > 0 && (
              <>
                <button
                  type="button"
                  onClick={handleApproveAll}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-green-600 text-white text-xs font-medium hover:bg-green-700 transition-colors"
                >
                  <CheckCircle className="w-3.5 h-3.5" />
                  Approve all ({pendingCount})
                </button>
                <button
                  type="button"
                  onClick={rejectAll}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-red-100 text-red-700 text-xs font-medium hover:bg-red-200 transition-colors border border-red-200"
                >
                  <XCircle className="w-3.5 h-3.5" />
                  Reject all ({pendingCount})
                </button>
              </>
            )}
            <button
              type="button"
              onClick={handleClearProcessed}
              disabled={records.length === 0}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-gray-100 text-gray-600 text-xs font-medium hover:bg-gray-200 transition-colors disabled:opacity-40"
            >
              Clear queue
            </button>
          </div>
        </div>

        {pendingCount > 0 && (
          <div className="px-4 sm:px-6 py-3 bg-yellow-50 border-b flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-yellow-600 shrink-0" />
            <p className="text-sm text-yellow-700">
              {pendingCount} record{pendingCount > 1 ? "s" : ""} pending review.
              Row-level issues are highlighted below.
            </p>
          </div>
        )}

        {records.length === 0 ? (
          <EmptyState
            screen="generic"
            icon={UserPlus}
            title="No imported records to review"
            description="Imported employee records will appear here for validation before full onboarding."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <caption className="sr-only">
                Import review queue with row-level validation
              </caption>
              <thead className="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    className="px-4 py-3 text-xs font-medium text-gray-600 uppercase cursor-pointer select-none hover:bg-gray-100"
                    onClick={() => handleSort("name")}
                  >
                    Name <SortIcon field="name" />
                  </th>
                  <th
                    scope="col"
                    className="px-4 py-3 text-xs font-medium text-gray-600 uppercase cursor-pointer select-none hover:bg-gray-100"
                    onClick={() => handleSort("department")}
                  >
                    Dept <SortIcon field="department" />
                  </th>
                  <th
                    scope="col"
                    className="px-4 py-3 text-xs font-medium text-gray-600 uppercase cursor-pointer select-none hover:bg-gray-100"
                    onClick={() => handleSort("salary")}
                  >
                    Salary <SortIcon field="salary" />
                  </th>
                  <th scope="col" className="px-4 py-3 text-xs font-medium text-gray-600 uppercase">
                    Issues
                  </th>
                  <th
                    scope="col"
                    className="px-4 py-3 text-xs font-medium text-gray-600 uppercase cursor-pointer select-none hover:bg-gray-100"
                    onClick={() => handleSort("status")}
                  >
                    Status <SortIcon field="status" />
                  </th>
                  <th scope="col" className="px-4 py-3 text-xs font-medium text-gray-600 uppercase text-right">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100" aria-live="polite">
                {sorted.map((record) => (
                  <tr
                    key={record.id}
                    className={
                      record.issues.filter((i) => i.severity === "error").length > 0
                        ? "bg-red-50/30"
                        : "hover:bg-gray-50"
                    }
                  >
                    <td className="px-4 py-3">
                      <div className="text-sm font-medium text-gray-900">
                        {record.name}
                      </div>
                      {record.email && (
                        <div className="text-xs text-gray-500">
                          {record.email}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {record.department ?? "\u2014"}
                    </td>
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">
                      ${record.salary.toLocaleString()}
                    </td>
                    <td className="px-4 py-3">
                      {record.issues.length > 0 ? (
                        <div className="space-y-1">
                          {record.issues.map((issue, i) => (
                            <span
                              key={i}
                              className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[11px] font-medium border ${SEVERITY_BADGES[issue.severity]}`}
                            >
                              {issue.severity === "error" ? (
                                <AlertTriangle className="w-2.5 h-2.5" />
                              ) : (
                                <Eye className="w-2.5 h-2.5" />
                              )}
                              {issue.field}: {issue.message}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-xs text-green-600 font-medium">
                          No issues
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={record.status} showIcon={false} />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        {record.status === "pending" && (
                          <>
                            <button
                              type="button"
                              onClick={() => handleApproveAndOnboard(record)}
                              className="p-1.5 rounded text-green-600 hover:bg-green-50 transition-colors"
                              aria-label={`Approve ${record.name}`}
                              title="Approve and onboard"
                            >
                              <CheckCircle className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => rejectRecord(record.id)}
                              className="p-1.5 rounded text-red-500 hover:bg-red-50 transition-colors"
                              aria-label={`Reject ${record.name}`}
                              title="Reject"
                            >
                              <XCircle className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => setEditingRecord(record)}
                              className="p-1.5 rounded text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                              aria-label={`Edit ${record.name}`}
                              title="Edit"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                          </>
                        )}
                        {record.status !== "pending" && (
                          <span className="text-xs text-gray-400">
                            {record.status === "approved" ? "Onboarded" : "Rejected"}
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {records.length > 0 && (
          <div className="px-4 sm:px-6 py-3 border-t text-xs text-gray-500 flex items-center justify-between">
            <span>
              {records.length} record{records.length > 1 ? "s" : ""} total ·{" "}
              {pendingCount} pending ·{" "}
              {records.filter((r) => r.status === "approved").length} approved ·{" "}
              {records.filter((r) => r.status === "rejected").length} rejected
            </span>
            <a
              href="/employees"
              className="text-indigo-600 hover:text-indigo-700 font-medium"
            >
              View employee directory &rarr;
            </a>
          </div>
        )}
      </div>

      {editingRecord && (
        <EditModal
          record={editingRecord}
          onSave={(updated) => {
            editRecord(updated.id, updated);
            setEditingRecord(null);
            toast.success(`${updated.name} updated`);
          }}
          onClose={() => setEditingRecord(null)}
        />
      )}
    </section>
  );
}
