import { supabase } from "@/lib/supabase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  Building2,
  Calendar,
  User,
  Clock,
  TrendingUp,
  Cake
} from "lucide-react";
import Link from "next/link";
import { LeaveQuotaManager } from "./leave-quota-manager";
import { Progress } from "@/components/ui/progress";

export const revalidate = 0;

async function getEmployeeData(id: string) {
  const [employeeResult, quotasResult, leavesResult] = await Promise.all([
    supabase.from("employees").select("*").eq("id", id).single(),
    supabase
      .from("employee_leave_quotas")
      .select(`
        *,
        leave_types (name, description)
      `)
      .eq("employee_id", id)
      .eq("year", new Date().getFullYear()),
    supabase
      .from("leave_records")
      .select(`
        *,
        leave_types (name)
      `)
      .eq("employee_id", id)
      .order("start_date", { ascending: false })
      .limit(10),
  ]);

  return {
    employee: employeeResult.data,
    quotas: quotasResult.data || [],
    recentLeaves: leavesResult.data || [],
  };
}

export default async function EmployeeDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { employee, quotas, recentLeaves } = await getEmployeeData(id);

  if (!employee) {
    return <div>ไม่พบข้อมูลพนักงาน</div>;
  }

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <Link href="/dashboard/employees" className="cursor-pointer">
        <Button variant="ghost" size="sm" className="gap-2 rounded-xl hover:bg-gray-100 cursor-pointer">
          <ArrowLeft className="h-4 w-4" />
          กลับไปหน้าพนักงาน
        </Button>
      </Link>

      {/* Employee Header Card */}
      <Card className="bg-white rounded-2xl shadow-sm border border-gray-100">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row items-start justify-between gap-4">
            <div className="flex items-start gap-5">
              {/* Avatar */}
              <div className="h-20 w-20 rounded-2xl bg-linear-to-br from-slate-600 to-slate-700 flex items-center justify-center flex-shrink-0 shadow-lg shadow-slate-500/20">
                <User className="h-10 w-10 text-white" strokeWidth={2.5} />
              </div>
              {/* Info */}
              <div className="space-y-3">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">
                    {employee.full_name}
                    {employee.nickname && (
                      <span className="text-xl font-normal text-gray-500 ml-2">
                        ({employee.nickname})
                      </span>
                    )}
                  </h1>
                  {employee.birthday && (
                    <div className="flex items-center gap-2 mt-3">
                      <div className="h-8 w-8 rounded-lg bg-pink-100 flex items-center justify-center">
                        <Cake className="h-4 w-4 text-pink-600" />
                      </div>
                      <span className="text-sm text-gray-600 font-medium">
                        {new Date(employee.birthday).toLocaleDateString("th-TH", {
                          year: "numeric",
                          month: "long",
                          day: "numeric"
                        })}
                      </span>
                    </div>
                  )}
                </div>
                <div className="flex flex-wrap items-center gap-4 text-sm">
                  {employee.department && (
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 rounded-lg">
                      <Building2 className="h-4 w-4 text-slate-600" />
                      <span className="font-semibold text-gray-900">{employee.department}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-green-50 rounded-lg">
                    <Calendar className="h-4 w-4 text-green-600" />
                    <span className="font-semibold text-gray-900">
                      เริ่มงาน {new Date(employee.hire_date).toLocaleDateString("th-TH")}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            {/* Status Badge */}
            <Badge
              className={`text-sm px-4 py-2 rounded-full font-semibold ${
                employee.status === "active"
                  ? "bg-green-100 text-green-700 hover:bg-green-100"
                  : employee.status === "inactive"
                  ? "bg-amber-100 text-amber-700 hover:bg-amber-100"
                  : "bg-red-100 text-red-700 hover:bg-red-100"
              }`}
            >
              {employee.status === "active"
                ? "ทำงานอยู่"
                : employee.status === "inactive"
                ? "พักงาน"
                : "ออกจากงาน"}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Leave Summary Cards */}
      <div>
        <div className="flex items-center gap-3 mb-5">
          <div className="h-10 w-10 rounded-xl bg-linear-to-br from-slate-600 to-slate-700 flex items-center justify-center shadow-lg shadow-slate-500/20">
            <TrendingUp className="h-5 w-5 text-white" strokeWidth={2.5} />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">สรุปวันลาประจำปี {new Date().getFullYear()}</h2>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {quotas.map((quota: any) => {
            const usagePercent = quota.total_days > 0
              ? (quota.used_days / quota.total_days) * 100
              : 0;

            return (
              <Card key={quota.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg font-bold text-gray-900">
                      {quota.leave_types?.name}
                    </CardTitle>
                    <Badge className="rounded-full px-3 py-1 text-xs font-semibold bg-green-100 text-green-700 hover:bg-green-100">
                      {quota.remaining_days} วันเหลือ
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600 font-medium">ใช้ไป</span>
                    <span className="font-bold text-amber-600">
                      {quota.used_days} วัน
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600 font-medium">โควต้าทั้งหมด</span>
                    <span className="font-bold text-gray-900">
                      {quota.total_days} วัน
                    </span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <div className="flex-1 h-3 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full transition-all rounded-full ${
                            usagePercent >= 90
                              ? 'bg-linear-to-r from-red-500 to-red-600'
                              : usagePercent >= 70
                              ? 'bg-linear-to-r from-amber-500 to-amber-600'
                              : 'bg-linear-to-r from-green-500 to-green-600'
                          }`}
                          style={{ width: `${usagePercent}%` }}
                        />
                      </div>
                      <span className="text-xs font-bold text-gray-700 min-w-[40px] text-right">
                        {usagePercent.toFixed(0)}%
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
          {quotas.length === 0 && (
            <Card className="md:col-span-2 lg:col-span-3 bg-white rounded-2xl shadow-sm border border-gray-100">
              <CardContent className="py-12">
                <p className="text-center text-gray-400">
                  ยังไม่มีข้อมูลโควต้าวันลา
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Quota Manager */}
      <LeaveQuotaManager employeeId={id} initialQuotas={quotas} />

      {/* Recent Leave History */}
      <Card className="bg-white rounded-2xl shadow-sm border border-gray-100">
        <CardHeader className="space-y-3 pb-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-linear-to-br from-purple-600 to-purple-700 flex items-center justify-center shadow-lg shadow-purple-500/20">
              <Clock className="h-5 w-5 text-white" strokeWidth={2.5} />
            </div>
            <CardTitle className="text-2xl font-bold text-gray-900">ประวัติการลาล่าสุด</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          {recentLeaves.length === 0 ? (
            <div className="text-center py-12">
              <Clock className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-400 font-medium">ยังไม่มีประวัติการลา</p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentLeaves.map((leave: any) => (
                <div
                  key={leave.id}
                  className="flex items-start justify-between p-5 rounded-xl bg-gray-50 hover:bg-gray-100 border border-gray-100 transition-colors"
                >
                  <div className="space-y-2.5 flex-1">
                    <div className="flex items-center gap-2">
                      <Badge className="rounded-full px-3 py-1 text-xs font-semibold bg-purple-100 text-purple-700 hover:bg-purple-100">
                        {leave.leave_types?.name}
                      </Badge>
                      <Badge className="rounded-full px-3 py-1 text-xs font-semibold bg-slate-100 text-slate-700 hover:bg-slate-100">
                        {leave.days_count} วัน
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Calendar className="h-4 w-4" />
                      <span className="font-medium">
                        {new Date(leave.start_date).toLocaleDateString("th-TH", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}{" "}
                        -{" "}
                        {new Date(leave.end_date).toLocaleDateString("th-TH", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                    </div>
                    {leave.reason && (
                      <p className="text-sm text-gray-700 bg-white px-3 py-2 rounded-lg">
                        <span className="font-semibold">เหตุผล:</span> {leave.reason}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
