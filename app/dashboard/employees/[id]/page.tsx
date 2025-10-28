import { supabase } from "@/lib/supabase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { LeaveQuotaManager } from "./leave-quota-manager";

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
    <div>
      <div className="mb-6">
        <Link href="/dashboard/employees">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            กลับ
          </Button>
        </Link>
      </div>

      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">
              {employee.full_name}
            </h2>
            <p className="text-muted-foreground">{employee.email}</p>
          </div>
          <Badge
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
      </div>

      <div className="grid gap-6 md:grid-cols-2 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>ข้อมูลทั่วไป</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div>
              <span className="text-sm text-muted-foreground">แผนก:</span>
              <p className="font-medium">{employee.department || "-"}</p>
            </div>
            <div>
              <span className="text-sm text-muted-foreground">ตำแหน่ง:</span>
              <p className="font-medium">{employee.position || "-"}</p>
            </div>
            <div>
              <span className="text-sm text-muted-foreground">วันเริ่มงาน:</span>
              <p className="font-medium">
                {new Date(employee.hire_date).toLocaleDateString("th-TH")}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>สรุปวันลา (ปี {new Date().getFullYear()})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {quotas.map((quota: any) => (
                <div key={quota.id} className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">
                      {quota.leave_types?.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      ใช้ไป {quota.used_days} / {quota.total_days} วัน
                    </p>
                  </div>
                  <Badge variant="outline">
                    เหลือ {quota.remaining_days} วัน
                  </Badge>
                </div>
              ))}
              {quotas.length === 0 && (
                <p className="text-sm text-muted-foreground">
                  ยังไม่มีข้อมูลโควต้าวันลา
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <LeaveQuotaManager employeeId={id} initialQuotas={quotas} />

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>ประวัติการลาล่าสุด</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recentLeaves.map((leave: any) => (
              <div
                key={leave.id}
                className="flex items-center justify-between border-b pb-3 last:border-0"
              >
                <div>
                  <p className="font-medium">{leave.leave_types?.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(leave.start_date).toLocaleDateString("th-TH")} -{" "}
                    {new Date(leave.end_date).toLocaleDateString("th-TH")}
                  </p>
                  {leave.reason && (
                    <p className="text-sm text-muted-foreground mt-1">
                      {leave.reason}
                    </p>
                  )}
                </div>
                <Badge variant="secondary">{leave.days_count} วัน</Badge>
              </div>
            ))}
            {recentLeaves.length === 0 && (
              <p className="text-sm text-muted-foreground">ยังไม่มีประวัติการลา</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
