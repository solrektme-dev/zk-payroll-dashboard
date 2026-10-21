import DashboardLayout from "@/components/layout/DashboardLayout";
import { IncidentBanner } from "@/components/ui/IncidentBanner";

function IncidentsPage() {
  return (
    <DashboardLayout>
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-900">System notices</h2>
        <IncidentBanner
          variant="maintenance"
          message="Scheduled maintenance window: 02:00–04:00 UTC. Payroll submissions will be queued."
          dismissible
        />
        <IncidentBanner
          variant="warning"
          message="Treasury balance is below the recommended buffer. Fund your account before next payroll."
        />
      </div>
    </DashboardLayout>
  );
}

export default IncidentsPage;
