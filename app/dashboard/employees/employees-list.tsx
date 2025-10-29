"use client";

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
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
import { Plus, Pencil, Trash2, Eye, Search, ChevronLeft, ChevronRight, Users } from "lucide-react";
import { AddEmployeeDialog } from "./add-employee-dialog";
import { EditEmployeeDialog } from "./edit-employee-dialog";
import { supabase } from "@/lib/supabase";
import type { Tables } from "@/lib/database.types";
import { useRouter } from "next/navigation";
import Link from "next/link";

type Employee = Tables<"employees">;

interface EmployeesListProps {
  initialEmployees: Employee[];
}

// Calculate work duration from hire date
function calculateWorkDuration(hireDate: string): string {
  const hire = new Date(hireDate);
  const now = new Date();

  let years = now.getFullYear() - hire.getFullYear();
  let months = now.getMonth() - hire.getMonth();
  let days = now.getDate() - hire.getDate();

  // Adjust for negative days
  if (days < 0) {
    months--;
    const lastMonth = new Date(now.getFullYear(), now.getMonth(), 0);
    days += lastMonth.getDate();
  }

  // Adjust for negative months
  if (months < 0) {
    years--;
    months += 12;
  }

  const parts = [];
  if (years > 0) parts.push(`${years} ปี`);
  if (months > 0) parts.push(`${months} เดือน`);
  if (days > 0) parts.push(`${days} วัน`);

  return parts.length > 0 ? parts.join(' ') : '0 วัน';
}

export function EmployeesList({ initialEmployees }: EmployeesListProps) {
  const router = useRouter();
  const [employees, setEmployees] = useState<Employee[]>(initialEmployees);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const handleDelete = async (id: string) => {
    if (!confirm("คุณแน่ใจหรือไม่ว่าต้องการลบพนักงานคนนี้?")) {
      return;
    }

    const { error } = await supabase.from("employees").delete().eq("id", id);

    if (error) {
      alert("เกิดข้อผิดพลาดในการลบพนักงาน");
      console.error(error);
      return;
    }

    // Update state immediately for instant UI feedback
    setEmployees(employees.filter((emp) => emp.id !== id));
    // Also refresh from server to ensure consistency
    await refreshEmployees();
    router.refresh();
  };

  const refreshEmployees = async () => {
    const { data } = await supabase
      .from("employees")
      .select("*")
      .order("created_at", { ascending: false });
    if (data) {
      setEmployees(data);
    }
  };

  const handleAddSuccess = async () => {
    await refreshEmployees();
    setIsAddOpen(false);
    router.refresh();
  };

  const handleEditSuccess = async () => {
    await refreshEmployees();
    setEditingEmployee(null);
    router.refresh();
  };

  // Filter and search employees
  const filteredEmployees = useMemo(() => {
    let filtered = employees;

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (emp) =>
          emp.full_name.toLowerCase().includes(query) ||
          emp.nickname?.toLowerCase().includes(query) ||
          emp.department?.toLowerCase().includes(query)
      );
    }

    return filtered;
  }, [employees, searchQuery]);

  // Pagination
  const totalPages = Math.ceil(filteredEmployees.length / itemsPerPage);
  const paginatedEmployees = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredEmployees.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredEmployees, currentPage]);

  // Handler for search with page reset
  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    setCurrentPage(1);
  };

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="h-10 w-10 rounded-xl bg-linear-to-br from-slate-600 to-slate-700 flex items-center justify-center shadow-lg shadow-slate-500/20">
                <Users className="h-5 w-5 text-white" strokeWidth={2.5} />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">รายชื่อพนักงาน</h2>
            </div>
            <p className="text-sm text-gray-500 ml-13">
              แสดง {paginatedEmployees.length} จาก {filteredEmployees.length} คน
            </p>
          </div>
          <div className="flex items-center gap-3">
            
            <Button
              onClick={() => setIsAddOpen(true)}
              className="gap-2 bg-linear-to-r from-slate-700 to-slate-800 hover:from-slate-800 hover:to-slate-900 rounded-xl px-6 shadow-lg shadow-slate-500/20 text-white cursor-pointer"
            >
              <Plus className="h-4 w-4 text-white" />
              เพิ่มพนักงาน
            </Button>
          </div>
        </div>

        {/* Search and Filter Section */}
        <div className="flex flex-col sm:flex-row gap-4 mt-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="ค้นหาชื่อ, แผนก..."
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="pl-9 rounded-xl border-gray-200 bg-gray-50/50 focus:bg-white"
            />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden p-2">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-b border-gray-100 hover:bg-transparent">
                <TableHead className="font-semibold text-gray-600 text-xs">ชื่อ-นามสกุล</TableHead>
                <TableHead className="font-semibold text-gray-600 text-xs">แผนก</TableHead>
                <TableHead className="font-semibold text-gray-600 text-xs">ชื่อเล่น</TableHead>
                <TableHead className="font-semibold text-gray-600 text-xs">สถานะ</TableHead>
                <TableHead className="font-semibold text-gray-600 text-xs">วันเริ่มงาน</TableHead>
                <TableHead className="font-semibold text-gray-600 text-xs">อายุงาน</TableHead>
                <TableHead className="font-semibold text-gray-600 text-xs text-center">จัดการ</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedEmployees.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-12 text-gray-400">
                    {searchQuery
                      ? "ไม่พบข้อมูลที่ตรงกับการค้นหา"
                      : "ยังไม่มีข้อมูลพนักงาน"}
                  </TableCell>
                </TableRow>
              ) : (
                paginatedEmployees.map((employee, index) => (
                  <TableRow
                    key={employee.id}
                    className={cn(
                      "border-b border-gray-50 hover:bg-slate-50/50 transition-colors",
                      index % 2 === 0 ? "bg-white" : "bg-gray-50/30"
                    )}
                  >
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <span className="font-medium text-gray-900">{employee.full_name}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-gray-700">{employee.department || ""}</TableCell>
                    <TableCell className="text-gray-700">{employee.nickname || "-"}</TableCell>
                    <TableCell>
                      <Badge
                        className={cn(
                          "rounded-full px-3 py-1 text-xs font-medium",
                          employee.status === "active"
                            ? "bg-green-100 text-green-700 hover:bg-green-100"
                            : employee.status === "inactive"
                            ? "bg-amber-100 text-amber-700 hover:bg-amber-100"
                            : "bg-red-100 text-red-700 hover:bg-red-100"
                        )}
                      >
                        {employee.status === "active"
                          ? "ทำงานอยู่"
                          : employee.status === "inactive"
                          ? "พักงาน"
                          : "ออกจากงาน"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-gray-600 text-sm">
                      {new Date(employee.hire_date).toLocaleDateString("th-TH", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric"
                      })}
                    </TableCell>
                    <TableCell className="text-gray-700 font-medium">
                      {calculateWorkDuration(employee.hire_date)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-center gap-1">
                        <Link href={`/dashboard/employees/${employee.id}`} className="cursor-pointer">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 rounded-lg hover:bg-slate-50 cursor-pointer"
                          >
                            <Eye className="h-4 w-4 text-slate-600" />
                          </Button>
                        </Link>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setEditingEmployee(employee)}
                          className="h-8 w-8 rounded-lg hover:bg-slate-50 cursor-pointer"
                        >
                          <Pencil className="h-4 w-4 text-slate-600" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(employee.id)}
                          className="h-8 w-8 rounded-lg hover:bg-red-50 cursor-pointer"
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            หน้า {currentPage} จาก {totalPages}
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="cursor-pointer"
            >
              <ChevronLeft className="h-4 w-4" />
              ก่อนหน้า
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="cursor-pointer"
            >
              ถัดไป
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      <AddEmployeeDialog
        open={isAddOpen}
        onOpenChange={setIsAddOpen}
        onSuccess={handleAddSuccess}
      />

      {editingEmployee && (
        <EditEmployeeDialog
          employee={editingEmployee}
          open={!!editingEmployee}
          onOpenChange={(open) => !open && setEditingEmployee(null)}
          onSuccess={handleEditSuccess}
        />
      )}
    </div>
  );
}
