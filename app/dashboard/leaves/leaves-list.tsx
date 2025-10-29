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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Trash2, Search, ChevronLeft, ChevronRight, Pencil, Calendar } from "lucide-react";
import { AddLeaveDialog } from "./add-leave-dialog";
import { EditLeaveDialog } from "./edit-leave-dialog";
import { supabase } from "@/lib/supabase";
import type { Tables } from "@/lib/database.types";
import { useRouter } from "next/navigation";

type Employee = Tables<"employees">;
type LeaveType = Tables<"leave_types">;
type LeaveRecord = Tables<"leave_records"> & {
  employees: { full_name: string; nickname: string | null } | null;
  leave_types: { name: string } | null;
};

interface LeavesListProps {
  initialLeaves: LeaveRecord[];
  employees: Employee[];
  leaveTypes: LeaveType[];
}

export function LeavesList({
  initialLeaves,
  employees,
  leaveTypes,
}: LeavesListProps) {
  const router = useRouter();
  const [leaves, setLeaves] = useState<LeaveRecord[]>(initialLeaves);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingLeave, setEditingLeave] = useState<LeaveRecord | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [leaveTypeFilter, setLeaveTypeFilter] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const refreshLeaves = async () => {
    const { data } = await supabase
      .from("leave_records")
      .select(`
        *,
        employees (full_name, nickname),
        leave_types (name)
      `)
      .order("start_date", { ascending: false });
    if (data) {
      setLeaves(data as LeaveRecord[]);
    }
  };

  const handleDelete = async (id: string, employeeId: string, leaveTypeId: string, daysCount: number) => {
    if (!confirm("คุณแน่ใจหรือไม่ว่าต้องการลบบันทึกการลานี้?")) {
      return;
    }

    const { error: deleteError } = await supabase
      .from("leave_records")
      .delete()
      .eq("id", id);

    if (deleteError) {
      alert("เกิดข้อผิดพลาดในการลบบันทึก");
      console.error(deleteError);
      return;
    }

    const currentYear = new Date().getFullYear();
    const { data: quota } = await supabase
      .from("employee_leave_quotas")
      .select("*")
      .eq("employee_id", employeeId)
      .eq("leave_type_id", leaveTypeId)
      .eq("year", currentYear)
      .single();

    if (quota) {
      await supabase
        .from("employee_leave_quotas")
        .update({ used_days: Math.max(0, quota.used_days - daysCount) })
        .eq("id", quota.id);
    }

    // Update state immediately
    setLeaves(leaves.filter((leave) => leave.id !== id));
    // Refresh from server
    await refreshLeaves();
    router.refresh();
  };

  const handleAddSuccess = async () => {
    await refreshLeaves();
    setIsAddOpen(false);
    router.refresh();
  };

  const handleEditSuccess = async () => {
    await refreshLeaves();
    setEditingLeave(null);
    router.refresh();
  };

  // Filter and search leaves
  const filteredLeaves = useMemo(() => {
    let filtered = leaves;

    // Leave type filter
    if (leaveTypeFilter !== "all") {
      filtered = filtered.filter((leave) => leave.leave_type_id === leaveTypeFilter);
    }

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (leave) =>
          leave.employees?.full_name.toLowerCase().includes(query) ||
          leave.leave_types?.name.toLowerCase().includes(query) ||
          leave.reason?.toLowerCase().includes(query)
      );
    }

    return filtered;
  }, [leaves, searchQuery, leaveTypeFilter]);

  // Pagination
  const totalPages = Math.ceil(filteredLeaves.length / itemsPerPage);
  const paginatedLeaves = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredLeaves.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredLeaves, currentPage]);

  // Handler for search with page reset
  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    setCurrentPage(1);
  };

  const handleFilterChange = (value: string) => {
    setLeaveTypeFilter(value);
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
                <Calendar className="h-5 w-5 text-white" strokeWidth={2.5} />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">บันทึกการลา</h2>
            </div>
            <p className="text-sm text-gray-500 ml-13">
              แสดง {paginatedLeaves.length} จาก {filteredLeaves.length} รายการ
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              onClick={() => setIsAddOpen(true)}
              className="gap-2 bg-linear-to-r from-slate-700 to-slate-800 hover:from-slate-800 hover:to-slate-900 rounded-xl px-6 shadow-lg shadow-slate-500/20 text-white"
            >
              <Plus className="h-4 w-4" />
              บันทึกการลา
            </Button>
          </div>
        </div>

        {/* Search and Filter Section */}
        <div className="flex flex-col sm:flex-row gap-4 mt-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="ค้นหาชื่อพนักงาน, เหตุผล..."
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="pl-9 rounded-xl border-gray-200 bg-gray-50/50 focus:bg-white"
            />
          </div>
          <Select value={leaveTypeFilter} onValueChange={handleFilterChange}>
            <SelectTrigger className="w-full sm:w-[200px] rounded-xl border-gray-200">
              <SelectValue placeholder="ประเภทการลาทั้งหมด" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">ประเภทการลาทั้งหมด</SelectItem>
              {leaveTypes.map((type) => (
                <SelectItem key={type.id} value={type.id}>
                  {type.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden p-2">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-b border-gray-100 hover:bg-transparent">
                <TableHead className="font-semibold text-gray-600 text-xs">พนักงาน</TableHead>
                <TableHead className="font-semibold text-gray-600 text-xs">ประเภทการลา</TableHead>
                <TableHead className="font-semibold text-gray-600 text-xs">วันที่เริ่ม</TableHead>
                <TableHead className="font-semibold text-gray-600 text-xs">วันที่สิ้นสุด</TableHead>
                <TableHead className="font-semibold text-gray-600 text-xs">จำนวนวัน</TableHead>
                <TableHead className="font-semibold text-gray-600 text-xs">เหตุผล</TableHead>
                <TableHead className="font-semibold text-gray-600 text-xs text-center">จัดการ</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedLeaves.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-12 text-gray-400">
                    {searchQuery || leaveTypeFilter !== "all"
                      ? "ไม่พบข้อมูลที่ตรงกับการค้นหา"
                      : "ยังไม่มีบันทึกการลา"}
                  </TableCell>
                </TableRow>
              ) : (
                paginatedLeaves.map((leave, index) => (
                  <TableRow
                    key={leave.id}
                    className={cn(
                      "border-b border-gray-50 hover:bg-slate-50/50 transition-colors",
                      index % 2 === 0 ? "bg-white" : "bg-gray-50/30"
                    )}
                  >
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <span className="font-medium text-gray-900">
                          {leave.employees?.full_name || "N/A"}
                          {leave.employees?.nickname && (
                            <span className="text-gray-500 font-normal"> ({leave.employees.nickname})</span>
                          )}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className="rounded-full px-3 py-1 text-xs font-medium bg-blue-100 text-blue-700 hover:bg-blue-100">
                        {leave.leave_types?.name || "N/A"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-gray-600 text-sm">
                      {new Date(leave.start_date).toLocaleDateString("th-TH", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric"
                      })}
                    </TableCell>
                    <TableCell className="text-gray-600 text-sm">
                      {new Date(leave.end_date).toLocaleDateString("th-TH", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric"
                      })}
                    </TableCell>
                    <TableCell className="text-gray-700 font-medium">
                      {leave.days_count} วัน
                    </TableCell>
                    <TableCell className="max-w-[200px] truncate text-gray-600 text-sm">
                      {leave.reason || "-"}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setEditingLeave(leave)}
                          className="h-8 w-8 rounded-lg hover:bg-slate-50"
                        >
                          <Pencil className="h-4 w-4 text-slate-600" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(leave.id, leave.employee_id, leave.leave_type_id, leave.days_count)}
                          className="h-8 w-8 rounded-lg hover:bg-red-50"
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

      <AddLeaveDialog
        open={isAddOpen}
        onOpenChange={setIsAddOpen}
        onSuccess={handleAddSuccess}
        employees={employees}
        leaveTypes={leaveTypes}
      />

      {editingLeave && (
        <EditLeaveDialog
          open={!!editingLeave}
          onOpenChange={(open) => !open && setEditingLeave(null)}
          onSuccess={handleEditSuccess}
          leave={editingLeave}
          employees={employees}
          leaveTypes={leaveTypes}
        />
      )}
    </div>
  );
}
