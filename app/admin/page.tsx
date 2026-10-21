import DashboardLayout from "@/components/layout/DashboardLayout";
import AdminOverview from "@/components/features/admin/AdminOverview";

function AdminPage() {
  return (
    <DashboardLayout>
      <AdminOverview />
    </DashboardLayout>
  );
}

export default AdminPage;
