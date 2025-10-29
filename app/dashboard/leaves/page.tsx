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
        employees (full_name),
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
      <LeavesList
        initialLeaves={leaves}
        employees={employees}
        leaveTypes={leaveTypes}
      />
    </div>
  );
}
