import DashboardLayout from "@/components/layout/DashboardLayout";
import EmployeeDetailPageContent from "@/components/features/employees/EmployeeDetailPageContent";

function EmployeeDetailPage({ params }: { params: { id: string } }) {
  return (
    <DashboardLayout>
      <EmployeeDetailPageContent employeeId={params.id} />
    </DashboardLayout>
  );
}

export default EmployeeDetailPage;
