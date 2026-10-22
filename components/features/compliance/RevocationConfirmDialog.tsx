"use client";

import React, { useState } from "react";
import { AlertTriangle, Clock } from "lucide-react";
import { ViewKey } from "@/types/models";

interface RevocationConfirmDialogProps {
  viewKey: ViewKey;
  isOpen: boolean;
  onConfirm: (reason?: string) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

export function RevocationConfirmDialog({
  viewKey,
  isOpen,
  onConfirm,
  onCancel,
  isLoading = false,
}: RevocationConfirmDialogProps) {
  const [reason, setReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleConfirm = async () => {
    setIsSubmitting(true);
    try {
      await onConfirm(reason);
    } finally {
      setIsSubmitting(false);
      setReason("");
    }
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        <div className="p-6 space-y-4">
          <div className="flex items-start gap-3">
            <div className="bg-red-100 p-2 rounded-lg flex-shrink-0">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <h2 className="font-semibold text-lg">Revoke Audit Access?</h2>
              <p className="text-sm text-gray-600 mt-1">
                This action cannot be undone. The auditor will immediately lose access.
              </p>
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Auditor</span>
              <span className="font-medium">{viewKey.auditorName}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Organization</span>
              <span className="font-medium">{viewKey.auditorOrg}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Access Level</span>
              <span className="font-medium capitalize">{viewKey.scope.replace("-", " ")}</span>
            </div>
            <div className="flex items-start gap-2 text-sm text-gray-600 pt-2 border-t">
              <Clock className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <span>Granted on {new Date(viewKey.createdAt).toLocaleDateString()}</span>
            </div>
          </div>

          <div>
            <label htmlFor="revocation-reason" className="block text-sm font-medium mb-2">
              Revocation Reason (Optional)
            </label>
            <textarea
              id="revocation-reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g., Audit complete, Access no longer needed, Security incident..."
              className="w-full px-3 py-2 border rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={3}
              disabled={isSubmitting || isLoading}
            />
            <p className="text-xs text-gray-500 mt-1">
              This reason will be recorded in the audit history for compliance.
            </p>
          </div>

          <div className="flex gap-3 pt-4 border-t">
            <button
              onClick={onCancel}
              disabled={isSubmitting || isLoading}
              className="flex-1 px-4 py-2 text-gray-700 border rounded-lg hover:bg-gray-50 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              disabled={isSubmitting || isLoading}
              className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting || isLoading ? "Revoking..." : "Revoke Access"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
