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
        <Card className="bg-linear-to-br from-blue-50 to-white shadow-md hover:shadow-lg transition-shadow border-0">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              พนักงานทั้งหมด
            </CardTitle>
            <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
              <Users className="h-5 w-5 text-blue-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-900">{stats.employeesCount}</div>
            <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
              <TrendingUp className="h-3 w-3 text-green-600" />
              <span className="text-green-600">{stats.activeEmployeesCount} คน</span>
              กำลังทำงาน
            </p>
          </CardContent>
        </Card>

        <Card className="bg-linear-to-br from-purple-50 to-white shadow-md hover:shadow-lg transition-shadow border-0">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              บันทึกการลา
            </CardTitle>
            <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center">
              <Calendar className="h-5 w-5 text-purple-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-900">{stats.leavesCount}</div>
            <p className="text-xs text-muted-foreground mt-1">
              บันทึกการลาทั้งหมด
            </p>
          </CardContent>
        </Card>

        <Card className="bg-linear-to-br from-orange-50 to-white shadow-md hover:shadow-lg transition-shadow border-0">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              วันหยุดบริษัท
            </CardTitle>
            <div className="h-10 w-10 rounded-full bg-orange-100 flex items-center justify-center">
              <CalendarDays className="h-5 w-5 text-orange-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-900">{stats.holidaysCount}</div>
            <p className="text-xs text-muted-foreground mt-1">
              วันหยุดที่กำหนดไว้
            </p>
          </CardContent>
        </Card>

        <Card className="bg-linear-to-br from-green-50 to-white shadow-md hover:shadow-lg transition-shadow border-0">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              วันหยุดถัดไป
            </CardTitle>
            <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
              <Clock className="h-5 w-5 text-green-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-900">
              {stats.upcomingHolidays.length}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              วันหยุดที่กำลังจะมาถึง
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity and Upcoming Holidays */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Recent Leaves */}
        <Card className="shadow-md border-0">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-purple-600" />
              บันทึกการลาล่าสุด
            </CardTitle>
          </CardHeader>
          <CardContent>
            {stats.recentLeaves.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                ยังไม่มีบันทึกการลา
              </p>
            ) : (
              <div className="space-y-3">
                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                {stats.recentLeaves.map((leave: any) => (
                  <div
                    key={leave.id}
                    className="flex items-start justify-between p-3 rounded-lg shadow hover:shadow-md bg-white transition-all"
                  >
                    <div className="space-y-1">
                      <p className="text-sm font-medium">
                        {leave.employees?.full_name || "N/A"}
                      </p>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          {leave.leave_types?.name || "N/A"}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {leave.days_count} วัน
                        </span>
                      </div>
                    </div>
                    <span className="text-xs text-muted-foreground">
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
        <Card className="shadow-md border-0">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarDays className="h-5 w-5 text-orange-600" />
              วันหยุดที่กำลังจะมาถึง
            </CardTitle>
          </CardHeader>
          <CardContent>
            {stats.upcomingHolidays.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                ไม่มีวันหยุดที่กำลังจะมาถึง
              </p>
            ) : (
              <div className="space-y-3">
                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                {stats.upcomingHolidays.map((holiday: any) => (
                  <div
                    key={holiday.id}
                    className="flex items-start justify-between p-3 rounded-lg shadow hover:shadow-md bg-white transition-all"
                  >
                    <div className="space-y-1">
                      <p className="text-sm font-medium">{holiday.name}</p>
                      {holiday.is_recurring && (
                        <Badge variant="secondary" className="text-xs">
                          วันหยุดประจำปี
                        </Badge>
                      )}
                    </div>
                    <span className="text-xs font-medium text-orange-600">
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
