import { supabase } from "@/lib/supabase";
import { LeaveTypeSettings } from "./leave-type-settings";
import { EmployeeLeaveSummary } from "./employee-leave-summary";

export const revalidate = 0;

async function getReportData() {
  const currentYear = new Date().getFullYear();

  // ดึงข้อมูลพนักงานพร้อมโควต้าวันลา
  const { data: employees, error: employeesError } = await supabase
    .from("employees")
    .select(`
      *,
      employee_leave_quotas (
        *,
        leave_types (name, description)
      )
    `)
    .eq("status", "active")
    .eq("employee_leave_quotas.year", currentYear)
    .order("full_name");

  // ดึงข้อมูลประเภทการลาทั้งหมด
  const { data: leaveTypes } = await supabase
    .from("leave_types")
    .select("*")
    .order("name");

  if (employeesError) {
    console.error("Error fetching report data:", employeesError);
    return { employees: [], leaveTypes: [] };
  }

  return {
    employees: employees || [],
    leaveTypes: leaveTypes || [],
  };
}

export default async function ReportsPage() {
  const { employees, leaveTypes } = await getReportData();

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-3xl font-bold tracking-tight">รายงานวันลา</h2>
        <p className="text-muted-foreground">
          สรุปการใช้วันลาของพนักงานทั้งหมด (ปี {new Date().getFullYear()})
        </p>
      </div>

      {/* สรุปโควต้าวันลาแต่ละประเภท */}
      <div className="mb-8">
        <LeaveTypeSettings initialLeaveTypes={leaveTypes} />
      </div>

      {/* รายงานการใช้วันลาของพนักงาน */}
      <EmployeeLeaveSummary employees={employees} />
    </div>
  );
}
