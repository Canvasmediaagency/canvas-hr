import { supabase } from "@/lib/supabase";
import { HolidaysList } from "./holidays-list";

export const revalidate = 0;

async function getHolidays() {
  const { data, error } = await supabase
    .from("company_holidays")
    .select("*")
    .order("date", { ascending: true });

  if (error) {
    console.error("Error fetching holidays:", error);
    return [];
  }

  return data || [];
}

export default async function HolidaysPage() {
  const holidays = await getHolidays();

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-3xl font-bold tracking-tight">วันหยุดบริษัท</h2>
        <p className="text-muted-foreground">
          กำหนดและจัดการวันหยุดประจำปี
        </p>
      </div>

      <HolidaysList initialHolidays={holidays} />
    </div>
  );
}
