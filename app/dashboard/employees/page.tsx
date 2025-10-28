import { supabase } from "@/lib/supabase";
import { EmployeesList } from "./employees-list";

export const revalidate = 0;

async function getEmployees() {
  const { data, error } = await supabase
    .from("employees")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching employees:", error);
    return [];
  }

  return data || [];
}

export default async function EmployeesPage() {
  const employees = await getEmployees();

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-3xl font-bold tracking-tight">จัดการพนักงาน</h2>
        <p className="text-muted-foreground">
          เพิ่ม แก้ไข และจัดการข้อมูลพนักงาน
        </p>
      </div>

      <EmployeesList initialEmployees={employees} />
    </div>
  );
}
