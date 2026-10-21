"use client";

import React from "react";
import { Clock, Trash2 } from "lucide-react";
import { RevocationHistory } from "@/types/models";

interface RevocationHistoryProps {
  history: RevocationHistory[];
  isLoading?: boolean;
}

export function RevocationHistoryView({ history, isLoading = false }: RevocationHistoryProps) {
  if (isLoading) {
    return (
      <div className="space-y-3">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-20 bg-gray-100 rounded-lg animate-pulse" />
        ))}
      </div>
    );
  }

  if (history.length === 0) {
    return (
      <div className="text-center py-8">
        <Clock className="w-12 h-12 text-gray-300 mx-auto mb-3" />
        <p className="text-gray-500">No revocations on record</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {history.map((entry) => (
        <div
          key={entry.id}
          className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
        >
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3 flex-1">
              <div className="bg-red-100 p-2 rounded-lg flex-shrink-0 mt-1">
                <Trash2 className="w-4 h-4 text-red-600" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline gap-2 flex-wrap">
                  <h4 className="font-semibold">{entry.auditorName}</h4>
                  <span className="text-sm text-gray-600">
                    {entry.auditorOrg && `(${entry.auditorOrg})`}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mt-1">
                  Access revoked by <span className="font-medium">{entry.revokedBy}</span>
                </p>
                {entry.reason && (
                  <p className="text-sm text-gray-700 mt-2 italic">&ldquo;{entry.reason}&rdquo;</p>
                )}
              </div>
            </div>
            <div className="text-right flex-shrink-0">
              <p className="text-sm text-gray-600">
                {new Date(entry.revokedAt).toLocaleDateString()}
              </p>
              <p className="text-xs text-gray-500">
                {new Date(entry.revokedAt).toLocaleTimeString()}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

interface RevocationHistorySummaryProps {
  history: RevocationHistory[];
  maxDisplay?: number;
}

export function RevocationHistorySummary({
  history,
  maxDisplay = 3,
}: RevocationHistorySummaryProps) {
  const displayedItems = history.slice(0, maxDisplay);
  const hiddenCount = Math.max(0, history.length - maxDisplay);

  if (history.length === 0) {
    return null;
  }

  return (
    <div className="space-y-2">
      <div className="text-sm font-medium text-gray-700">Recent Revocations</div>
      <div className="space-y-2">
        {displayedItems.map((entry) => (
          <div key={entry.id} className="text-sm bg-red-50 border border-red-200 rounded p-2">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="font-medium text-red-900">{entry.auditorName}</p>
                <p className="text-red-700 text-xs">
                  Revoked by {entry.revokedBy} on {new Date(entry.revokedAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
      {hiddenCount > 0 && (
        <p className="text-xs text-gray-500">
          +{hiddenCount} more revocation{hiddenCount > 1 ? "s" : ""}
        </p>
      )}
    </div>
  );
}
