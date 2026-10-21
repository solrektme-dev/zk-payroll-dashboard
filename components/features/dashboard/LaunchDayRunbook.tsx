"use client";

import { useState } from "react";
import {
  AlertTriangle,
  Wrench,
  MessageSquare,
  ExternalLink,
  Shield,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  Phone,
  FileText,
  Clock,
  Users,
  Play,
  CheckCircle,
  XCircle,
  Search,
} from "lucide-react";

type SeverityLevel = "sev1" | "sev2" | "sev3";

const SEVERITY_COLORS: Record<SeverityLevel, string> = {
  sev1: "bg-red-50 border-red-200 text-red-800",
  sev2: "bg-amber-50 border-amber-200 text-amber-800",
  sev3: "bg-blue-50 border-blue-200 text-blue-800",
};

const SEVERITY_BADGES: Record<SeverityLevel, string> = {
  sev1: "bg-red-100 text-red-700",
  sev2: "bg-amber-100 text-amber-700",
  sev3: "bg-blue-100 text-blue-700",
};

const SEVERITY_LABELS: Record<SeverityLevel, string> = {
  sev1: "Critical",
  sev2: "Major",
  sev3: "Minor",
};

interface IncidentScenario {
  title: string;
  severity: SeverityLevel;
  description: string;
  triage: string[];
  communication: string[];
  fallback: string[];
}

const INCIDENT_SCENARIOS: IncidentScenario[] = [
  {
    title: "Dashboard Unavailable (Full Outage)",
    severity: "sev1",
    description:
      "The entire dashboard is unreachable for all users. Payroll execution, employee management, and compliance views are inaccessible.",
    triage: [
      "Check /api/health endpoint from an external monitoring tool",
      "Verify Stellar RPC connectivity via SystemStatus component",
      "Inspect deployment logs for recent errors or configuration changes",
      "Check CI/CD pipeline status for failed deployments",
    ],
    communication: [
      "Post a maintenance banner via /incidents page (maintenance variant)",
      "Notify operators in Telegram: https://t.me/zkpayroll",
      "Update the SystemStatus component to reflect 'Dashboard Services' as 'down'",
      "Set expected resolution time and update every 30 minutes",
    ],
    fallback: [
      "Operators can queue payroll runs via the /payroll/execute direct URL",
      "Employee data is preserved in local stores; no data loss expected",
      "Transaction history remains accessible via the API at /api/transactions",
      "Auditors can use view keys to verify proofs offline via the ZK engine",
    ],
  },
  {
    title: "Payroll Execution Degraded",
    severity: "sev1",
    description:
      "Payroll execution is partially working. Some payroll runs fail to submit, or ZK proof generation is slow or failing.",
    triage: [
      "Check Payroll Exceptions Queue at /payroll/exceptions for failed runs",
      "Verify ZK Proof Service status in SystemStatus",
      "Inspect Stellar network congestion via Horizon public endpoints",
      "Check wallet connectivity and network settings",
    ],
    communication: [
      "Post a warning banner on the dashboard via /incidents page",
      "Alert operators with specific affected payroll run IDs",
      "Update SystemStatus 'ZK Proof Service' to 'degraded'",
      "Provide estimated recovery window based on Stellar network conditions",
    ],
    fallback: [
      "Pending payroll runs will be queued for retry automatically",
      "Operators can manually retry from the Payroll Exceptions page",
      "Use the 'Retry Submission' button in the payroll wizard for individual runs",
      "If Stellar network is congested, wait for fee market to stabilize",
    ],
  },
  {
    title: "Employee Directory Not Loading",
    severity: "sev2",
    description:
      "The employee directory page loads slowly or fails to display records. Add/edit operations may time out.",
    triage: [
      "Check browser console for API or rendering errors",
      "Verify the /api/employees endpoint returns data",
      "Inspect employee store (localStorage) for corruption",
      "Test with a subset of employee records",
    ],
    communication: [
      "Post a warning banner on the employees page",
      "Notify the admin team about the degraded experience",
      "Suggest users refresh or clear local storage if persistent",
    ],
    fallback: [
      "Employee records are cached in local storage under zk-payroll-employees",
      "Bulk operations can be queued via the import review queue",
      "Critical payroll can proceed with the existing employee set",
    ],
  },
  {
    title: "Compliance / Audit View Failing",
    severity: "sev2",
    description:
      "Auditors cannot access compliance data or view keys are not being generated properly.",
    triage: [
      "Check view key generation logs for errors",
      "Verify auditor role assignments and session tokens",
      "Test view key revocation and regeneration flow",
      "Inspect compliance page rendering for UI errors",
    ],
    communication: [
      "Notify the audit team via the auditor workspace",
      "Post an incident update on the compliance page",
      "Link auditors to alternative access via the view keys page",
    ],
    fallback: [
      "Auditors can still access history data via /history with read-only scope",
      "Existing view keys remain valid until their expiration",
      "Manual audit reports can be printed from Transaction History",
    ],
  },
  {
    title: "Treasury Balance Alerts",
    severity: "sev3",
    description:
      "Treasury balance drops below the recommended buffer. Payroll execution may fail if funds are insufficient.",
    triage: [
      "Check current balance in the Treasury View at /treasury",
      "Compare against upcoming payroll projections",
      "Verify last funding date and source",
    ],
    communication: [
      "A low-balance warning banner displays automatically",
      "Admins are notified on the dashboard homepage",
      "The SystemStatus component shows a treasury alert card",
    ],
    fallback: [
      "Fund the treasury from the admin wallet before the next payroll",
      "Partial payroll execution is possible with available balance",
      "Remaining employees are queued for the next funding cycle",
    ],
  },
  {
    title: "Wallet Connection Issues",
    severity: "sev3",
    description:
      "Users cannot connect their Freighter wallet. The dashboard shows the connection prompt and blocks protected features.",
    triage: [
      "Verify Freighter extension is installed and up to date",
      "Check network selection (Testnet vs Mainnet) in Freighter",
      "Inspect browser extension settings for conflicts",
      "Test wallet connection on a fresh browser profile",
    ],
    communication: [
      "The dashboard automatically shows wallet connection instructions",
      "Notify the user about network requirements (Testnet expected)",
      "Link to Freighter setup documentation",
    ],
    fallback: [
      "Unauthenticated users can still view the public landing page",
      "Session may persist for authenticated users for 24 hours",
      "Wallet reconnection can be retried from any page",
    ],
  },
];

const OPERATOR_ROLES = [
  {
    role: "Incident Commander",
    resp: "Coordinates the overall incident response, makes go/no-go decisions, and communicates with stakeholders.",
  },
  {
    role: "Technical Lead",
    resp: "Triages the root cause, leads debugging, and implements or coordinates the fix.",
  },
  {
    role: "Communications Lead",
    resp: "Updates incident banners, posts in Telegram, and keeps the status page current.",
  },
  {
    role: "Operations Lead",
    resp: "Manages fallback procedures, monitors queued operations, and ensures payroll continuity.",
  },
];

const SEVERITY_TIMELINES = [
  {
    sev: "SEV-1",
    label: "Critical",
    initialResponse: "5 minutes",
    updateInterval: "30 minutes",
    resolutionTarget: "2 hours",
  },
  {
    sev: "SEV-2",
    label: "Major",
    initialResponse: "15 minutes",
    updateInterval: "1 hour",
    resolutionTarget: "8 hours",
  },
  {
    sev: "SEV-3",
    label: "Minor",
    initialResponse: "1 hour",
    updateInterval: "Next business day",
    resolutionTarget: "3 business days",
  },
];

function SectionToggle({
  title,
  defaultOpen,
  children,
}: {
  title: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen ?? true);
  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-5 py-4 bg-gray-50 hover:bg-gray-100 transition-colors text-left"
      >
        <span className="text-sm font-semibold text-gray-900">{title}</span>
        {open ? (
          <ChevronUp className="w-4 h-4 text-gray-500" />
        ) : (
          <ChevronDown className="w-4 h-4 text-gray-500" />
        )}
      </button>
      {open && <div className="px-5 py-4 bg-white">{children}</div>}
    </div>
  );
}

export default function LaunchDayRunbook() {
  return (
    <section aria-labelledby="runbook-heading" className="space-y-6 max-w-4xl">
      <div>
        <h2
          id="runbook-heading"
          className="text-xl font-semibold text-gray-900 flex items-center gap-2"
        >
          <FileText className="w-5 h-5 text-indigo-600" />
          Launch-Day Runbook
        </h2>
        <p className="mt-1 text-sm text-gray-500">
          Incident response procedures for dashboard operations, degraded
          experiences, and operator communication.
        </p>
      </div>

      <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-start gap-3">
        <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 shrink-0" />
        <div>
          <p className="text-sm font-medium text-green-800">
            Operational tools are linked below
          </p>
          <p className="text-sm text-green-700 mt-0.5">
            Use the{" "}
            <a
              href="/incidents"
              className="underline font-medium hover:text-green-900"
            >
              System Notices
            </a>{" "}
            page to post banners,{" "}
            <a
              href="/payroll/exceptions"
              className="underline font-medium hover:text-green-900"
            >
              Payroll Exceptions
            </a>{" "}
            to monitor queue health, and the dashboard{" "}
            <strong>System Status</strong> panel for real-time service health.
          </p>
        </div>
      </div>

      <SectionToggle title="Incident Severity &amp; Response Timelines">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-2 pr-4 font-semibold text-gray-700">
                  Level
                </th>
                <th className="text-left py-2 pr-4 font-semibold text-gray-700">
                  Initial Response
                </th>
                <th className="text-left py-2 pr-4 font-semibold text-gray-700">
                  Update Interval
                </th>
                <th className="text-left py-2 font-semibold text-gray-700">
                  Resolution Target
                </th>
              </tr>
            </thead>
            <tbody>
              {SEVERITY_TIMELINES.map((s) => (
                <tr key={s.sev} className="border-b border-gray-100">
                  <td className="py-2 pr-4">
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${SEVERITY_BADGES[s.label.toLowerCase() as SeverityLevel]}`}
                    >
                      {s.sev} — {s.label}
                    </span>
                  </td>
                  <td className="py-2 pr-4 text-gray-600">
                    {s.initialResponse}
                  </td>
                  <td className="py-2 pr-4 text-gray-600">
                    {s.updateInterval}
                  </td>
                  <td className="py-2 text-gray-600">
                    {s.resolutionTarget}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SectionToggle>

      <SectionToggle title="Operator Roles &amp; Responsibilities">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {OPERATOR_ROLES.map((r) => (
            <div
              key={r.role}
              className="border border-gray-200 rounded-lg p-4"
            >
              <h4 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                <Users className="w-4 h-4 text-indigo-500" />
                {r.role}
              </h4>
              <p className="text-sm text-gray-600 mt-1">{r.resp}</p>
            </div>
          ))}
        </div>
      </SectionToggle>

      <div>
        <h3 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-red-500" />
          Incident Scenarios &amp; Response Playbooks
        </h3>
        <div className="space-y-4">
          {INCIDENT_SCENARIOS.map((scenario) => (
            <div
              key={scenario.title}
              className={`border rounded-lg p-5 ${SEVERITY_COLORS[scenario.severity]}`}
            >
              <div className="flex items-start justify-between gap-3 mb-3">
                <h4 className="text-sm font-semibold">{scenario.title}</h4>
                <span
                  className={`shrink-0 px-2 py-0.5 rounded-full text-xs font-medium ${SEVERITY_BADGES[scenario.severity]}`}
                >
                  {SEVERITY_LABELS[scenario.severity]}
                </span>
              </div>
              <p className="text-sm mb-4 opacity-80">{scenario.description}</p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <h5 className="text-xs font-semibold uppercase tracking-wide mb-2 flex items-center gap-1">
                    <Search className="w-3 h-3" /> Triage
                  </h5>
                  <ul className="space-y-1">
                    {scenario.triage.map((step, i) => (
                      <li
                        key={i}
                        className="text-xs flex items-start gap-1.5 opacity-90"
                      >
                        <span className="mt-0.5 shrink-0">•</span>
                        <span>{step}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h5 className="text-xs font-semibold uppercase tracking-wide mb-2 flex items-center gap-1">
                    <MessageSquare className="w-3 h-3" /> Communication
                  </h5>
                  <ul className="space-y-1">
                    {scenario.communication.map((step, i) => (
                      <li
                        key={i}
                        className="text-xs flex items-start gap-1.5 opacity-90"
                      >
                        <span className="mt-0.5 shrink-0">•</span>
                        <span>{step}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h5 className="text-xs font-semibold uppercase tracking-wide mb-2 flex items-center gap-1">
                    <RefreshCw className="w-3 h-3" /> Fallback
                  </h5>
                  <ul className="space-y-1">
                    {scenario.fallback.map((step, i) => (
                      <li
                        key={i}
                        className="text-xs flex items-start gap-1.5 opacity-90"
                      >
                        <span className="mt-0.5 shrink-0">•</span>
                        <span>{step}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <SectionToggle title="Communication Templates">
        <div className="space-y-4">
          <div>
            <h4 className="text-sm font-semibold text-gray-900 mb-2">
              Initial Incident Notification
            </h4>
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <pre className="text-xs text-gray-700 whitespace-pre-wrap font-sans">
                {`[SEVERITY] Incident: <Brief Title>

We are investigating an issue affecting <affected service/feature>.
Impact: <Describe what users experience>
Incident Commander: <Name>
Next update: <Time, typically in 30 minutes>

Track status: <link to incidents page or status tool>
Telegram: https://t.me/zkpayroll`}
              </pre>
            </div>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-gray-900 mb-2">
              Resolution Update
            </h4>
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <pre className="text-xs text-gray-700 whitespace-pre-wrap font-sans">
                {`[RESOLVED] <Title> has been resolved.

Root Cause: <Brief explanation>
Duration: <Start time> to <End time>
Actions Taken: <Summary of fix>

The service is now fully operational. A post-incident review will be scheduled.

<Link to incident report>`}
              </pre>
            </div>
          </div>
        </div>
      </SectionToggle>

      <SectionToggle title="Linked Operational Tooling">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <a
            href="/incidents"
            className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:border-indigo-300 hover:bg-indigo-50 transition-colors group"
          >
            <AlertTriangle className="w-5 h-5 text-amber-500" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 group-hover:text-indigo-700">
                System Notices
              </p>
              <p className="text-xs text-gray-500">
                Post and manage incident banners
              </p>
            </div>
            <ExternalLink className="w-3.5 h-3.5 text-gray-400" />
          </a>

          <a
            href="/payroll/exceptions"
            className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:border-indigo-300 hover:bg-indigo-50 transition-colors group"
          >
            <XCircle className="w-5 h-5 text-red-500" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 group-hover:text-indigo-700">
                Payroll Exceptions Queue
              </p>
              <p className="text-xs text-gray-500">
                Monitor and retry failed payroll runs
              </p>
            </div>
            <ExternalLink className="w-3.5 h-3.5 text-gray-400" />
          </a>

          <a
            href="/history"
            className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:border-indigo-300 hover:bg-indigo-50 transition-colors group"
          >
            <Clock className="w-5 h-5 text-blue-500" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 group-hover:text-indigo-700">
                Transaction History
              </p>
              <p className="text-xs text-gray-500">
                Audit trail with CSV export and printing
              </p>
            </div>
            <ExternalLink className="w-3.5 h-3.5 text-gray-400" />
          </a>

          <a
            href="/treasury"
            className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:border-indigo-300 hover:bg-indigo-50 transition-colors group"
          >
            <Shield className="w-5 h-5 text-green-500" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 group-hover:text-indigo-700">
                Treasury View
              </p>
              <p className="text-xs text-gray-500">
                Check balance and funding status
              </p>
            </div>
            <ExternalLink className="w-3.5 h-3.5 text-gray-400" />
          </a>

          <a
            href="/payroll/execute"
            className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:border-indigo-300 hover:bg-indigo-50 transition-colors group"
          >
            <Play className="w-5 h-5 text-indigo-500" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 group-hover:text-indigo-700">
                Execute Payroll
              </p>
              <p className="text-xs text-gray-500">
                Direct access to payroll execution flow
              </p>
            </div>
            <ExternalLink className="w-3.5 h-3.5 text-gray-400" />
          </a>

          <a
            href="https://t.me/zkpayroll"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:border-indigo-300 hover:bg-indigo-50 transition-colors group"
          >
            <MessageSquare className="w-5 h-5 text-blue-500" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 group-hover:text-indigo-700">
                ZK Payroll Telegram
              </p>
              <p className="text-xs text-gray-500">
                Real-time operator coordination
              </p>
            </div>
            <ExternalLink className="w-3.5 h-3.5 text-gray-400" />
          </a>
        </div>
      </SectionToggle>

      <SectionToggle title="Post-Incident Review Checklist" defaultOpen={false}>
        <ul className="space-y-2">
          {[
            "Document the timeline: detection, triage, resolution, verification",
            "Identify root cause and contributing factors",
            "List what worked well and what could improve in the response",
            "Update this runbook with new scenarios or revised procedures",
            "Schedule follow-up actions with owners and due dates",
            "Share the post-incident report with the team and in Telegram",
          ].map((item, i) => (
            <li key={i} className="text-sm text-gray-700 flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </SectionToggle>

      <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
        <p className="text-sm text-indigo-800 flex items-center gap-2">
          <Phone className="w-4 h-4" />
          <span>
            Escalation: If an incident is not resolving within the target
            timeline, escalate to the engineering lead or post in{" "}
            <a
              href="https://t.me/zkpayroll"
              target="_blank"
              rel="noopener noreferrer"
              className="underline font-semibold hover:text-indigo-900"
            >
              ZK Payroll Telegram
            </a>
            .
          </span>
        </p>
      </div>
    </section>
  );
}
