import DashboardLayout from "@/components/layout/DashboardLayout";
import CsvImport from "@/components/features/employees/CsvImport";

function EmployeeImportPage() {
  return (
    <DashboardLayout>
      <CsvImport />
    </DashboardLayout>
  );
}

export default EmployeeImportPage;
