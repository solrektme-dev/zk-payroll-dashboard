import DashboardLayout from "@/components/layout/DashboardLayout";
import EmployeeDirectory from "@/components/features/employees/EmployeeDirectory";

function EmployeesPage() {
  return (
    <DashboardLayout>
      <EmployeeDirectory />
    </DashboardLayout>
  );
}

export default EmployeesPage;
