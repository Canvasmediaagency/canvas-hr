"use client";

import { useState, useMemo } from "react";
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
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

interface EmployeeWithQuotas {
  id: string;
  full_name: string;
  nickname: string | null;
  email: string | null;
  employee_leave_quotas: Array<{
    id: string;
    total_days: number;
    used_days: number;
    remaining_days: number | null;
    leave_types: {
      name: string;
      description: string | null;
    } | null;
  }>;
}

interface EmployeeLeaveSummaryProps {
  employees: EmployeeWithQuotas[];
}

export function EmployeeLeaveSummary({ employees }: EmployeeLeaveSummaryProps) {
  const [searchQuery, setSearchQuery] = useState("");

  // Filter employees by search query
  const filteredEmployees = useMemo(() => {
    if (!searchQuery) return employees;

    const query = searchQuery.toLowerCase();
    return employees.filter((emp) => {
      const fullName = emp.full_name.toLowerCase();
      const nickname = emp.nickname?.toLowerCase() || "";
      const email = emp.email?.toLowerCase() || "";

      // แยกชื่อและนามสกุล
      const nameParts = fullName.split(" ");

      return (
        fullName.includes(query) ||
        nickname.includes(query) ||
        email.includes(query) ||
        nameParts.some(part => part.includes(query))
      );
    });
  }, [employees, searchQuery]);

  return (
    <Card className="shadow-md border-0">
      <CardHeader>
        <CardTitle>สรุปการใช้วันลาของพนักงาน</CardTitle>
        <div className="relative mt-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="ค้นหาด้วยชื่อ, นามสกุล, ชื่อเล่น"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
      </CardHeader>
      <CardContent className="p-6">
        {filteredEmployees.length === 0 ? (
          <p className="text-center py-8 text-muted-foreground">
            {searchQuery
              ? "ไม่พบข้อมูลที่ตรงกับการค้นหา"
              : "ยังไม่มีข้อมูลพนักงาน"}
          </p>
        ) : (
          <div className="space-y-6">
            {filteredEmployees.map((employee) => (
              <div
                key={employee.id}
                className="shadow hover:shadow-md rounded-lg p-5 bg-white transition-shadow"
              >
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-semibold text-lg">
                      {employee.full_name}
                      {employee.nickname && (
                        <span className="text-base font-normal text-muted-foreground ml-2">
                          ({employee.nickname})
                        </span>
                      )}
                    </h3>
                  </div>
                  {employee.email && (
                    <Badge variant="outline">{employee.email}</Badge>
                  )}
                </div>

                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>ประเภทการลา</TableHead>
                        <TableHead className="text-center">
                          โควต้าทั้งหมด
                        </TableHead>
                        <TableHead className="text-center">
                          ใช้ไปแล้ว
                        </TableHead>
                        <TableHead className="text-center">คงเหลือ</TableHead>
                        <TableHead className="w-[200px]">
                          สถานะการใช้
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {employee.employee_leave_quotas &&
                      employee.employee_leave_quotas.length > 0 ? (
                        employee.employee_leave_quotas.map((quota) => {
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
  );
}
