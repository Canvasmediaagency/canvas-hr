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
      <EmployeesList initialEmployees={employees} />
    </div>
  );
}
