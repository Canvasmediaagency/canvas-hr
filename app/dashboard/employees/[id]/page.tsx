import { supabase } from "@/lib/supabase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  Briefcase,
  Building2,
  Calendar,
  User,
  Clock,
  TrendingUp,
  Phone
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
      <Link href="/dashboard/employees">
        <Button variant="ghost" size="sm" className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          กลับไปหน้าพนักงาน
        </Button>
      </Link>

      {/* Employee Header Card */}
      <Card className="bg-gradient-to-br from-blue-50 to-white shadow-lg border-0">
        <CardContent className="pt-6">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-4">
              {/* Avatar */}
              <div className="h-20 w-20 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center flex-shrink-0">
                <User className="h-10 w-10 text-white" />
              </div>
              {/* Info */}
              <div className="space-y-2">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">
                    {employee.full_name}
                  </h1>
                  {employee.phone_number && (
                    <div className="flex items-center gap-2 mt-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">{employee.phone_number}</span>
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-4 text-sm">
                  {employee.department && (
                    <div className="flex items-center gap-1.5">
                      <Building2 className="h-4 w-4 text-blue-600" />
                      <span className="font-medium">{employee.department}</span>
                    </div>
                  )}
                  {employee.position && (
                    <div className="flex items-center gap-1.5">
                      <Briefcase className="h-4 w-4 text-purple-600" />
                      <span className="font-medium">{employee.position}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-1.5">
                    <Calendar className="h-4 w-4 text-green-600" />
                    <span className="font-medium">
                      เริ่มงาน {new Date(employee.hire_date).toLocaleDateString("th-TH")}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            {/* Status Badge */}
            <Badge
              className="text-sm px-3 py-1"
              variant={
                employee.status === "active"
                  ? "default"
                  : employee.status === "inactive"
                  ? "secondary"
                  : "destructive"
              }
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
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="h-5 w-5 text-blue-600" />
          <h2 className="text-xl font-semibold">สรุปวันลาประจำปี {new Date().getFullYear()}</h2>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {quotas.map((quota: any) => {
            const usagePercent = quota.total_days > 0
              ? (quota.used_days / quota.total_days) * 100
              : 0;
            const isHighUsage = usagePercent > 80;

            return (
              <Card key={quota.id} className="shadow-md hover:shadow-lg transition-shadow border-0">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base font-semibold">
                      {quota.leave_types?.name}
                    </CardTitle>
                    <Badge variant="outline" className="text-xs">
                      {quota.remaining_days} วันเหลือ
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">ใช้ไป</span>
                    <span className="font-bold text-orange-600">
                      {quota.used_days} วัน
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">โควต้าทั้งหมด</span>
                    <span className="font-semibold">
                      {quota.total_days} วัน
                    </span>
                  </div>
                  <div className="space-y-2">
                    <Progress
                      value={usagePercent}
                      className={isHighUsage ? "bg-red-100" : ""}
                    />
                    <p className="text-xs text-muted-foreground text-right">
                      ใช้ไป {usagePercent.toFixed(0)}%
                    </p>
                  </div>
                </CardContent>
              </Card>
            );
          })}
          {quotas.length === 0 && (
            <Card className="md:col-span-2 lg:col-span-3 shadow-md border-0">
              <CardContent className="py-8">
                <p className="text-center text-muted-foreground">
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
      <Card className="shadow-md border-0">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-purple-600" />
            <CardTitle>ประวัติการลาล่าสุด</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          {recentLeaves.length === 0 ? (
            <div className="text-center py-8">
              <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-2 opacity-50" />
              <p className="text-muted-foreground">ยังไม่มีประวัติการลา</p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentLeaves.map((leave: any) => (
                <div
                  key={leave.id}
                  className="flex items-start justify-between p-4 rounded-lg shadow hover:shadow-md bg-white transition-all"
                >
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="font-semibold">
                        {leave.leave_types?.name}
                      </Badge>
                      <Badge variant="secondary" className="text-xs">
                        {leave.days_count} วัน
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      <span>
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
                      <p className="text-sm text-muted-foreground">
                        <span className="font-medium">เหตุผล:</span> {leave.reason}
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
