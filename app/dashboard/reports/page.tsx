import { supabase } from "@/lib/supabase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { LeaveTypeSettings } from "./leave-type-settings";

export const revalidate = 0;

async function getReportData() {
  const currentYear = new Date().getFullYear();

  // ดึงข้อมูลพนักงานพร้อมโควต้าวันลา
  const { data: employees, error: employeesError } = await supabase
    .from("employees")
    .select(`
      *,
      employee_leave_quotas (
        *,
        leave_types (name, description)
      )
    `)
    .eq("status", "active")
    .eq("employee_leave_quotas.year", currentYear)
    .order("full_name");

  // ดึงข้อมูลประเภทการลาทั้งหมด
  const { data: leaveTypes } = await supabase
    .from("leave_types")
    .select("*")
    .order("name");

  if (employeesError) {
    console.error("Error fetching report data:", employeesError);
    return { employees: [], leaveTypes: [] };
  }

  return {
    employees: employees || [],
    leaveTypes: leaveTypes || [],
  };
}

export default async function ReportsPage() {
  const { employees, leaveTypes } = await getReportData();

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-3xl font-bold tracking-tight">รายงานวันลา</h2>
        <p className="text-muted-foreground">
          สรุปการใช้วันลาของพนักงานทั้งหมด (ปี {new Date().getFullYear()})
        </p>
      </div>

      {/* สรุปโควต้าวันลาแต่ละประเภท */}
      <div className="mb-8">
        <LeaveTypeSettings initialLeaveTypes={leaveTypes} />
      </div>

      {/* รายงานการใช้วันลาของพนักงาน */}
      <Card className="shadow-md border-0">
        <CardHeader>
          <CardTitle>สรุปการใช้วันลาของพนักงาน</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          {employees.length === 0 ? (
            <p className="text-center py-8 text-muted-foreground">
              ยังไม่มีข้อมูลพนักงาน
            </p>
          ) : (
            <div className="space-y-6">
              {employees.map((employee: any) => (
                <div key={employee.id} className="shadow hover:shadow-md rounded-lg p-5 bg-white transition-shadow">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="font-semibold text-lg">
                        {employee.full_name}
                      </h3>
                    </div>
                    <Badge variant="outline">{employee.email}</Badge>
                  </div>

                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>ประเภทการลา</TableHead>
                          <TableHead className="text-center">โควต้าทั้งหมด</TableHead>
                          <TableHead className="text-center">ใช้ไปแล้ว</TableHead>
                          <TableHead className="text-center">คงเหลือ</TableHead>
                          <TableHead className="w-[200px]">สถานะการใช้</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {employee.employee_leave_quotas &&
                        employee.employee_leave_quotas.length > 0 ? (
                          employee.employee_leave_quotas.map((quota: any) => {
                            const usagePercent =
                              quota.total_days > 0
                                ? (quota.used_days / quota.total_days) * 100
                                : 0;

                            return (
                              <TableRow key={quota.id}>
                                <TableCell className="font-medium">
                                  {quota.leave_types?.name || "N/A"}
                                </TableCell>
                                <TableCell className="text-center">
                                  {quota.total_days} วัน
                                </TableCell>
                                <TableCell className="text-center">
                                  <span className="font-semibold text-orange-600">
                                    {quota.used_days} วัน
                                  </span>
                                </TableCell>
                                <TableCell className="text-center">
                                  <span className="font-semibold text-green-600">
                                    {quota.remaining_days} วัน
                                  </span>
                                </TableCell>
                                <TableCell>
                                  <div className="space-y-2">
                                    <Progress value={usagePercent} />
                                    <p className="text-xs text-muted-foreground text-right">
                                      ใช้ไป {usagePercent.toFixed(0)}%
                                    </p>
                                  </div>
                                </TableCell>
                              </TableRow>
                            );
                          })
                        ) : (
                          <TableRow>
                            <TableCell
                              colSpan={5}
                              className="text-center text-muted-foreground"
                            >
                              ยังไม่มีข้อมูลโควต้าวันลา
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
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
