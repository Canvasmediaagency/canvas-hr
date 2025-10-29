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
      <HolidaysList initialHolidays={holidays} />
    </div>
  );
}
