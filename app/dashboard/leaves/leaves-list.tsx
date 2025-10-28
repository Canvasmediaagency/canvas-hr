"use client";

import { useState, useMemo } from "react";
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
import { Plus, Trash2, Search, ChevronLeft, ChevronRight, Filter } from "lucide-react";
import { AddLeaveDialog } from "./add-leave-dialog";
import { supabase } from "@/lib/supabase";
import type { Tables } from "@/lib/database.types";
import { useRouter } from "next/navigation";

type Employee = Tables<"employees">;
type LeaveType = Tables<"leave_types">;
type LeaveRecord = Tables<"leave_records"> & {
  employees: { full_name: string; email: string } | null;
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
  const [searchQuery, setSearchQuery] = useState("");
  const [leaveTypeFilter, setLeaveTypeFilter] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

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

    setLeaves(leaves.filter((leave) => leave.id !== id));
    router.refresh();
  };

  const handleAddSuccess = () => {
    router.refresh();
    setIsAddOpen(false);
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
          leave.employees?.email.toLowerCase().includes(query) ||
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

  // Reset to page 1 when filters change
  useMemo(() => {
    setCurrentPage(1);
  }, [searchQuery, leaveTypeFilter]);

  return (
    <div className="space-y-4">
      {/* Header with Add Button */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">บันทึกการลา</h3>
          <p className="text-sm text-muted-foreground">
            แสดง {paginatedLeaves.length} จาก {filteredLeaves.length} รายการ
          </p>
        </div>
        <Button onClick={() => setIsAddOpen(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          บันทึกการลา
        </Button>
      </div>

      {/* Search and Filter Section */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="ค้นหาชื่อพนักงาน, อีเมล, เหตุผล..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={leaveTypeFilter} onValueChange={setLeaveTypeFilter}>
          <SelectTrigger className="w-full sm:w-[200px]">
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

      {/* Table */}
      <div className="rounded-md border bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>พนักงาน</TableHead>
              <TableHead>ประเภทการลา</TableHead>
              <TableHead>วันที่เริ่ม</TableHead>
              <TableHead>วันที่สิ้นสุด</TableHead>
              <TableHead>จำนวนวัน</TableHead>
              <TableHead>เหตุผล</TableHead>
              <TableHead className="text-right">จัดการ</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedLeaves.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                  {searchQuery || leaveTypeFilter !== "all"
                    ? "ไม่พบข้อมูลที่ตรงกับการค้นหา"
                    : "ยังไม่มีบันทึกการลา"}
                </TableCell>
              </TableRow>
            ) : (
              paginatedLeaves.map((leave) => (
                <TableRow key={leave.id}>
                  <TableCell className="font-medium">
                    {leave.employees?.full_name || "N/A"}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {leave.leave_types?.name || "N/A"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {new Date(leave.start_date).toLocaleDateString("th-TH")}
                  </TableCell>
                  <TableCell>
                    {new Date(leave.end_date).toLocaleDateString("th-TH")}
                  </TableCell>
                  <TableCell>{leave.days_count} วัน</TableCell>
                  <TableCell className="max-w-[200px] truncate">
                    {leave.reason || "-"}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(leave.id, leave.employee_id, leave.leave_type_id, leave.days_count)}
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

      <AddLeaveDialog
        open={isAddOpen}
        onOpenChange={setIsAddOpen}
        onSuccess={handleAddSuccess}
        employees={employees}
        leaveTypes={leaveTypes}
      />
    </div>
  );
}
