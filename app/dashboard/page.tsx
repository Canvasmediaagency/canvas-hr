import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/lib/supabase";
import { Users, Calendar, CalendarDays, TrendingUp, Clock, AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";

async function getDashboardStats() {
  const currentYear = new Date().getFullYear();

  const [
    employeesResult,
    leavesResult,
    holidaysResult,
    activeEmployees,
    recentLeaves,
    upcomingHolidays,
  ] = await Promise.all([
    supabase.from("employees").select("*", { count: "exact", head: true }),
    supabase.from("leave_records").select("*", { count: "exact", head: true }),
    supabase.from("company_holidays").select("*", { count: "exact", head: true }),
    supabase
      .from("employees")
      .select("*", { count: "exact", head: true })
      .eq("status", "active"),
    supabase
      .from("leave_records")
      .select(`
        *,
        employees(full_name),
        leave_types(name)
      `)
      .order("created_at", { ascending: false })
      .limit(5),
    supabase
      .from("company_holidays")
      .select("*")
      .gte("date", new Date().toISOString().split("T")[0])
      .order("date", { ascending: true })
      .limit(5),
  ]);

  return {
    employeesCount: employeesResult.count || 0,
    activeEmployeesCount: activeEmployees.count || 0,
    leavesCount: leavesResult.count || 0,
    holidaysCount: holidaysResult.count || 0,
    recentLeaves: recentLeaves.data || [],
    upcomingHolidays: upcomingHolidays.data || [],
  };
}

export default async function DashboardPage() {
  const stats = await getDashboardStats();

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-semibold text-gray-700">
              พนักงานทั้งหมด
            </CardTitle>
            <div className="h-10 w-10 rounded-xl bg-linear-to-br from-sky-400 to-sky-500 flex items-center justify-center shadow-sm shadow-sky-200">
              <Users className="h-5 w-5 text-white" strokeWidth={2.5} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">{stats.employeesCount}</div>
            <p className="text-xs text-gray-600 mt-1 flex items-center gap-1">
              <TrendingUp className="h-3 w-3 text-green-600" />
              <span className="text-green-600 font-medium">{stats.activeEmployeesCount} คน</span>
              กำลังทำงาน
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-semibold text-gray-700">
              บันทึกการลา
            </CardTitle>
            <div className="h-10 w-10 rounded-xl bg-linear-to-br from-violet-400 to-violet-500 flex items-center justify-center shadow-sm shadow-violet-200">
              <Calendar className="h-5 w-5 text-white" strokeWidth={2.5} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">{stats.leavesCount}</div>
            <p className="text-xs text-gray-600 mt-1">
              บันทึกการลาทั้งหมด
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-semibold text-gray-700">
              วันหยุดบริษัท
            </CardTitle>
            <div className="h-10 w-10 rounded-xl bg-linear-to-br from-amber-400 to-amber-500 flex items-center justify-center shadow-sm shadow-amber-200">
              <CalendarDays className="h-5 w-5 text-white" strokeWidth={2.5} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">{stats.holidaysCount}</div>
            <p className="text-xs text-gray-600 mt-1">
              วันหยุดที่กำหนดไว้
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-semibold text-gray-700">
              วันหยุดถัดไป
            </CardTitle>
            <div className="h-10 w-10 rounded-xl bg-linear-to-br from-teal-400 to-teal-500 flex items-center justify-center shadow-sm shadow-teal-200">
              <Clock className="h-5 w-5 text-white" strokeWidth={2.5} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">
              {stats.upcomingHolidays.length}
            </div>
            <p className="text-xs text-gray-600 mt-1">
              วันหยุดที่กำลังจะมาถึง
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity and Upcoming Holidays */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Recent Leaves */}
        <Card className="bg-white rounded-2xl shadow-sm border border-gray-100">
          <CardHeader className="space-y-3 pb-4">
            <CardTitle className="flex items-center gap-3 text-xl font-bold text-gray-900">
              <div className="h-9 w-9 rounded-xl bg-linear-to-br from-violet-400 to-violet-500 flex items-center justify-center shadow-sm shadow-violet-200">
                <Calendar className="h-4 w-4 text-white" strokeWidth={2.5} />
              </div>
              บันทึกการลาล่าสุด
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {stats.recentLeaves.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-8">
                ยังไม่มีบันทึกการลา
              </p>
            ) : (
              <div className="space-y-3">
                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                {stats.recentLeaves.map((leave: any) => (
                  <div
                    key={leave.id}
                    className="flex items-start justify-between p-4 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors"
                  >
                    <div className="space-y-1.5">
                      <p className="text-sm font-semibold text-gray-900">
                        {leave.employees?.full_name || "N/A"}
                      </p>
                      <div className="flex items-center gap-2">
                        <Badge className="rounded-full px-3 py-1 text-xs font-medium bg-purple-100 text-purple-700 hover:bg-purple-100">
                          {leave.leave_types?.name || "N/A"}
                        </Badge>
                        <span className="text-xs text-gray-600 font-medium">
                          {leave.days_count} วัน
                        </span>
                      </div>
                    </div>
                    <span className="text-xs text-gray-500 font-medium">
                      {new Date(leave.start_date).toLocaleDateString("th-TH", {
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Upcoming Holidays */}
        <Card className="bg-white rounded-2xl shadow-sm border border-gray-100">
          <CardHeader className="space-y-3 pb-4">
            <CardTitle className="flex items-center gap-3 text-xl font-bold text-gray-900">
              <div className="h-9 w-9 rounded-xl bg-linear-to-br from-amber-400 to-amber-500 flex items-center justify-center shadow-sm shadow-amber-200">
                <CalendarDays className="h-4 w-4 text-white" strokeWidth={2.5} />
              </div>
              วันหยุดที่กำลังจะมาถึง
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {stats.upcomingHolidays.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-8">
                ไม่มีวันหยุดที่กำลังจะมาถึง
              </p>
            ) : (
              <div className="space-y-3">
                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                {stats.upcomingHolidays.map((holiday: any) => (
                  <div
                    key={holiday.id}
                    className="flex items-start justify-between p-4 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors"
                  >
                    <div className="space-y-1.5">
                      <p className="text-sm font-semibold text-gray-900">{holiday.name}</p>
                      {holiday.is_recurring && (
                        <Badge className="rounded-full px-3 py-1 text-xs font-medium bg-purple-100 text-purple-700 hover:bg-purple-100">
                          วันหยุดประจำปี
                        </Badge>
                      )}
                    </div>
                    <span className="text-xs text-amber-600 font-semibold">
                      {new Date(holiday.date).toLocaleDateString("th-TH", {
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
