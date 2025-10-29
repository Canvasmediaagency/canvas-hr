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
    <Card className="bg-white rounded-2xl shadow-sm border border-gray-100">
      <CardHeader className="space-y-3 pb-4">
        <CardTitle className="text-2xl font-bold text-gray-900">สรุปการใช้วันลาของพนักงาน</CardTitle>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="ค้นหาด้วยชื่อ, นามสกุล, ชื่อเล่น"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 rounded-xl border-gray-200 bg-gray-50/50 focus:bg-white h-11"
          />
        </div>
      </CardHeader>
      <CardContent className="p-6">
        {filteredEmployees.length === 0 ? (
          <p className="text-center py-12 text-gray-400">
            {searchQuery
              ? "ไม่พบข้อมูลที่ตรงกับการค้นหา"
              : "ยังไม่มีข้อมูลพนักงาน"}
          </p>
        ) : (
          <div className="space-y-6">
            {filteredEmployees.map((employee) => (
              <div
                key={employee.id}
                className="shadow-sm hover:shadow-md rounded-2xl p-6 bg-gray-50 border border-gray-100 transition-shadow"
              >
                <div className="flex items-center justify-between mb-5">
                  <div>
                    <h3 className="font-bold text-lg text-gray-900">
                      {employee.full_name}
                      {employee.nickname && (
                        <span className="text-base font-normal text-gray-500 ml-2">
                          ({employee.nickname})
                        </span>
                      )}
                    </h3>
                  </div>
                  {employee.email && (
                    <Badge className="rounded-full px-3 py-1 text-xs font-medium bg-slate-100 text-slate-700 hover:bg-slate-100">
                      {employee.email}
                    </Badge>
                  )}
                </div>

                <div className="overflow-x-auto bg-white rounded-xl border border-gray-100 p-2">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-b border-gray-100 hover:bg-transparent">
                        <TableHead className="font-semibold text-gray-600 text-xs">ประเภทการลา</TableHead>
                        <TableHead className="text-center font-semibold text-gray-600 text-xs">
                          โควต้าทั้งหมด
                        </TableHead>
                        <TableHead className="text-center font-semibold text-gray-600 text-xs">
                          ใช้ไปแล้ว
                        </TableHead>
                        <TableHead className="text-center font-semibold text-gray-600 text-xs">คงเหลือ</TableHead>
                        <TableHead className="w-[200px] font-semibold text-gray-600 text-xs">
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
                            <TableRow key={quota.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                              <TableCell className="font-semibold text-gray-900">
                                {quota.leave_types?.name || "N/A"}
                              </TableCell>
                              <TableCell className="text-center text-gray-700">
                                {quota.total_days} วัน
                              </TableCell>
                              <TableCell className="text-center">
                                <span className="font-bold text-amber-600">
                                  {quota.used_days} วัน
                                </span>
                              </TableCell>
                              <TableCell className="text-center">
                                <span className="font-bold text-green-600">
                                  {quota.remaining_days} วัน
                                </span>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-3">
                                  <div className="flex-1 h-6 bg-gray-100 rounded-full overflow-hidden">
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
                                  <span className="text-sm font-bold text-gray-700 min-w-[45px] text-right">
                                    {usagePercent.toFixed(0)}%
                                  </span>
                                </div>
                              </TableCell>
                            </TableRow>
                          );
                        })
                      ) : (
                        <TableRow>
                          <TableCell
                            colSpan={5}
                            className="text-center text-gray-400 py-8"
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
