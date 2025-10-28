import { supabase } from "@/lib/supabase";
import { LeavesList } from "./leaves-list";

export const revalidate = 0;

async function getData() {
  const [employeesResult, leaveTypesResult, leavesResult] = await Promise.all([
    supabase.from("employees").select("*").eq("status", "active"),
    supabase.from("leave_types").select("*"),
    supabase
      .from("leave_records")
      .select(`
        *,
        employees (full_name, email),
        leave_types (name)
      `)
      .order("created_at", { ascending: false }),
  ]);

  return {
    employees: employeesResult.data || [],
    leaveTypes: leaveTypesResult.data || [],
    leaves: leavesResult.data || [],
  };
}

export default async function LeavesPage() {
  const { employees, leaveTypes, leaves } = await getData();

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-3xl font-bold tracking-tight">จัดการวันลา</h2>
        <p className="text-muted-foreground">
          บันทึกและจัดการวันลาของพนักงาน
        </p>
      </div>

      <LeavesList
        initialLeaves={leaves}
        employees={employees}
        leaveTypes={leaveTypes}
      />
    </div>
  );
}
