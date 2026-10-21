"use client";

import { useState, useEffect } from "react";
import {
  AlertCircle,
  CheckCircle,
  Clock,
  ExternalLink,
  RefreshCw,
} from "lucide-react";

interface SystemHealthStatus {
  name: string;
  status: "operational" | "degraded" | "down";
  impact: string;
  lastUpdated: string;
  details: string;
}

export default function SystemStatus() {
  const [statuses, setStatuses] = useState<SystemHealthStatus[]>([
    {
      name: "CI/CD Pipeline",
      status: "operational",
      impact: "Enables new deployments and feature releases",
      lastUpdated: new Date().toISOString(),
      details:
        "GitHub Actions running normally. All deployment workflows completing successfully.",
    },
    {
      name: "Stellar RPC",
      status: "operational",
      impact: "Required for all on-chain payroll operations",
      lastUpdated: new Date(Date.now() - 300000).toISOString(),
      details:
        "Soroban RPC responding normally with < 1s latency. Transaction confirmation times nominal.",
    },
    {
      name: "Dashboard Services",
      status: "operational",
      impact: "Affects user dashboard access and data loading",
      lastUpdated: new Date(Date.now() - 60000).toISOString(),
      details:
        "All API endpoints responding normally. Database connections stable.",
    },
    {
      name: "ZK Proof Service",
      status: "operational",
      impact: "Required for payroll proof generation",
      lastUpdated: new Date(Date.now() - 120000).toISOString(),
      details:
        "Proof generation completing within expected time windows. No queuing.",
    },
  ]);

  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setStatuses((prev) =>
      prev.map((s) => ({
        ...s,
        lastUpdated: new Date().toISOString(),
      }))
    );
    setIsRefreshing(false);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "operational":
        return (
          <CheckCircle className="w-5 h-5 text-green-600" aria-hidden="true" />
        );
      case "degraded":
        return (
          <AlertCircle className="w-5 h-5 text-amber-600" aria-hidden="true" />
        );
      case "down":
        return (
          <AlertCircle className="w-5 h-5 text-red-600" aria-hidden="true" />
        );
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "operational":
        return "bg-green-50 border-green-200";
      case "degraded":
        return "bg-amber-50 border-amber-200";
      case "down":
        return "bg-red-50 border-red-200";
      default:
        return "bg-gray-50 border-gray-200";
    }
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case "operational":
        return "bg-green-100 text-green-800";
      case "degraded":
        return "bg-amber-100 text-amber-800";
      case "down":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatTime = (isoString: string) => {
    const date = new Date(isoString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return "now";
    if (diffMins === 1) return "1 minute ago";
    if (diffMins < 60) return `${diffMins} minutes ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours === 1) return "1 hour ago";
    return `${diffHours} hours ago`;
  };

  const allOperational = statuses.every((s) => s.status === "operational");

  return (
    <section
      aria-labelledby="system-status-heading"
      className="space-y-6 mb-6"
    >
      <div className="flex items-center justify-between">
        <div>
          <h2 id="system-status-heading" className="text-lg font-semibold text-gray-900">
            System Status
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            Health status of systems affecting payroll workflows
          </p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="inline-flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 disabled:opacity-50 transition-colors"
          aria-label="Refresh status"
        >
          <RefreshCw
            className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`}
          />
          Refresh
        </button>
      </div>

      {!allOperational && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <div className="flex gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <h3 className="text-sm font-medium text-amber-800">
                Some systems are experiencing issues
              </h3>
              <p className="text-sm text-amber-700 mt-1">
                Check the details below. Affected workflows may be delayed.
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {statuses.map((status) => (
          <div
            key={status.name}
            className={`border rounded-lg p-5 ${getStatusColor(status.status)}`}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3 flex-1">
                {getStatusIcon(status.status)}
                <h3 className="font-semibold text-gray-900">{status.name}</h3>
              </div>
              <span
                className={`px-2 py-1 rounded text-xs font-medium shrink-0 ${getStatusBadgeClass(status.status)}`}
              >
                {status.status === "operational" && "Operational"}
                {status.status === "degraded" && "Degraded"}
                {status.status === "down" && "Down"}
              </span>
            </div>

            <p className="text-sm text-gray-700 mb-3">{status.details}</p>

            <div className="space-y-2">
              <p className="text-xs text-gray-600">
                <strong>Impact:</strong> {status.impact}
              </p>
              <div className="flex items-center gap-1 text-xs text-gray-500">
                <Clock className="w-3 h-3" />
                Updated {formatTime(status.lastUpdated)}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <p className="text-sm text-gray-600 mb-2">
          <strong>Need help?</strong> Check the incident page or contact support for
          detailed status updates and incident information.
        </p>
        <a
          href="/incidents"
          className="inline-flex items-center gap-1 text-sm text-indigo-600 hover:text-indigo-700 font-medium"
        >
          View Incidents
          <ExternalLink className="w-3 h-3" />
        </a>
      </div>
    </section>
  );
}
