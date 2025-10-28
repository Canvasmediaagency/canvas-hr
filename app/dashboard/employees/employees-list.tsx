"use client";

import { useState, useMemo, useEffect } from "react";
import { Button } from "@/components/ui/button";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Pencil, Trash2, Eye, Search, ChevronLeft, ChevronRight } from "lucide-react";
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

export function EmployeesList({ initialEmployees }: EmployeesListProps) {
  const router = useRouter();
  const [employees, setEmployees] = useState<Employee[]>(initialEmployees);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
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

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((emp) => emp.status === statusFilter);
    }

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (emp) =>
          emp.full_name.toLowerCase().includes(query) ||
          emp.phone_number?.toLowerCase().includes(query) ||
          emp.department?.toLowerCase().includes(query) ||
          emp.position?.toLowerCase().includes(query)
      );
    }

    return filtered;
  }, [employees, searchQuery, statusFilter]);

  // Pagination
  const totalPages = Math.ceil(filteredEmployees.length / itemsPerPage);
  const paginatedEmployees = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredEmployees.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredEmployees, currentPage]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter]);

  return (
    <div className="space-y-4">
      {/* Header with Add Button */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">พนักงานทั้งหมด</h3>
          <p className="text-sm text-muted-foreground">
            แสดง {paginatedEmployees.length} จาก {filteredEmployees.length} คน
          </p>
        </div>
        <Button onClick={() => setIsAddOpen(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          เพิ่มพนักงาน
        </Button>
      </div>

      {/* Search and Filter Section */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="ค้นหาชื่อ, เบอร์โทร, แผนก, ตำแหน่ง..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-[200px]">
            <SelectValue placeholder="สถานะทั้งหมด" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">สถานะทั้งหมด</SelectItem>
            <SelectItem value="active">ทำงานอยู่</SelectItem>
            <SelectItem value="inactive">พักงาน</SelectItem>
            <SelectItem value="terminated">ออกจากงาน</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="rounded-lg shadow-md bg-white border-0 p-5">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ชื่อ-นามสกุล</TableHead>
              <TableHead>เบอร์โทรศัพท์</TableHead>
              <TableHead>แผนก</TableHead>
              <TableHead>ตำแหน่ง</TableHead>
              <TableHead>วันเริ่มงาน</TableHead>
              <TableHead>สถานะ</TableHead>
              <TableHead className="text-right">จัดการ</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedEmployees.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                  {searchQuery || statusFilter !== "all"
                    ? "ไม่พบข้อมูลที่ตรงกับการค้นหา"
                    : "ยังไม่มีข้อมูลพนักงาน"}
                </TableCell>
              </TableRow>
            ) : (
              paginatedEmployees.map((employee) => (
                <TableRow key={employee.id}>
                  <TableCell className="font-medium">{employee.full_name}</TableCell>
                  <TableCell>{employee.phone_number || "-"}</TableCell>
                  <TableCell>{employee.department || "-"}</TableCell>
                  <TableCell>{employee.position || "-"}</TableCell>
                  <TableCell>
                    {new Date(employee.hire_date).toLocaleDateString("th-TH")}
                  </TableCell>
                  <TableCell>
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
                  </TableCell>
                  <TableCell className="text-right">
                    <Link href={`/dashboard/employees/${employee.id}`}>
                      <Button variant="ghost" size="icon">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </Link>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setEditingEmployee(employee)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(employee.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
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
            >
              <ChevronLeft className="h-4 w-4" />
              ก่อนหน้า
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
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
