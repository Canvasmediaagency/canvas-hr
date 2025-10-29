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
import { Plus, Trash2, Search, ChevronLeft, ChevronRight, Pencil, CalendarDays } from "lucide-react";
import { AddHolidayDialog } from "./add-holiday-dialog";
import { EditHolidayDialog } from "./edit-holiday-dialog";
import { supabase } from "@/lib/supabase";
import type { Tables } from "@/lib/database.types";
import { useRouter } from "next/navigation";

type Holiday = Tables<"company_holidays">;

interface HolidaysListProps {
  initialHolidays: Holiday[];
}

export function HolidaysList({ initialHolidays }: HolidaysListProps) {
  const router = useRouter();
  const [holidays, setHolidays] = useState<Holiday[]>(initialHolidays);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingHoliday, setEditingHoliday] = useState<Holiday | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const refreshHolidays = async () => {
    const { data } = await supabase
      .from("company_holidays")
      .select("*")
      .order("date", { ascending: true });
    if (data) {
      setHolidays(data);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("คุณแน่ใจหรือไม่ว่าต้องการลบวันหยุดนี้?")) {
      return;
    }

    const { error } = await supabase
      .from("company_holidays")
      .delete()
      .eq("id", id);

    if (error) {
      alert("เกิดข้อผิดพลาดในการลบวันหยุด");
      console.error(error);
      return;
    }

    // Update state immediately
    setHolidays(holidays.filter((holiday) => holiday.id !== id));
    // Refresh from server
    await refreshHolidays();
    router.refresh();
  };

  const handleAddSuccess = async () => {
    await refreshHolidays();
    setIsAddOpen(false);
    router.refresh();
  };

  const handleEditSuccess = async () => {
    await refreshHolidays();
    setEditingHoliday(null);
    router.refresh();
  };

  // Filter and search holidays
  const filteredHolidays = useMemo(() => {
    let filtered = holidays;

    // Type filter
    if (typeFilter === "recurring") {
      filtered = filtered.filter((h) => h.is_recurring);
    } else if (typeFilter === "special") {
      filtered = filtered.filter((h) => !h.is_recurring);
    }

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (h) =>
          h.name.toLowerCase().includes(query) ||
          h.description?.toLowerCase().includes(query)
      );
    }

    return filtered;
  }, [holidays, searchQuery, typeFilter]);

  // Pagination
  const totalPages = Math.ceil(filteredHolidays.length / itemsPerPage);
  const paginatedHolidays = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredHolidays.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredHolidays, currentPage]);

  // Handlers for search and filter with page reset
  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    setCurrentPage(1);
  };

  const handleFilterChange = (value: string) => {
    setTypeFilter(value);
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
                <CalendarDays className="h-5 w-5 text-white" strokeWidth={2.5} />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">วันหยุดบริษัท</h2>
            </div>
            <p className="text-sm text-gray-500 ml-13">
              แสดง {paginatedHolidays.length} จาก {filteredHolidays.length} วัน
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              onClick={() => setIsAddOpen(true)}
              className="gap-2 bg-linear-to-r from-slate-700 to-slate-800 hover:from-slate-800 hover:to-slate-900 rounded-xl px-6 shadow-lg shadow-slate-500/20 text-white cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              เพิ่มวันหยุด
            </Button>
          </div>
        </div>

        {/* Search and Filter Section */}
        <div className="flex flex-col sm:flex-row gap-4 mt-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="ค้นหาชื่อวันหยุด, คำอธิบาย..."
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="pl-9 rounded-xl border-gray-200 bg-gray-50/50 focus:bg-white"
            />
          </div>
          <Select value={typeFilter} onValueChange={handleFilterChange}>
            <SelectTrigger className="w-full sm:w-[200px] rounded-xl border-gray-200">
              <SelectValue placeholder="ประเภททั้งหมด" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">ประเภททั้งหมด</SelectItem>
              <SelectItem value="recurring">วันหยุดประจำปี</SelectItem>
              <SelectItem value="special">วันหยุดพิเศษ</SelectItem>
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
                <TableHead className="font-semibold text-gray-600 text-xs">วันที่</TableHead>
                <TableHead className="font-semibold text-gray-600 text-xs">ชื่อวันหยุด</TableHead>
                <TableHead className="font-semibold text-gray-600 text-xs">คำอธิบาย</TableHead>
                <TableHead className="font-semibold text-gray-600 text-xs">ประเภท</TableHead>
                <TableHead className="font-semibold text-gray-600 text-xs text-center">จัดการ</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedHolidays.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-12 text-gray-400">
                    {searchQuery || typeFilter !== "all"
                      ? "ไม่พบข้อมูลที่ตรงกับการค้นหา"
                      : "ยังไม่มีวันหยุดที่กำหนดไว้"}
                  </TableCell>
                </TableRow>
              ) : (
                paginatedHolidays.map((holiday, index) => (
                  <TableRow
                    key={holiday.id}
                    className={cn(
                      "border-b border-gray-50 hover:bg-slate-50/50 transition-colors",
                      index % 2 === 0 ? "bg-white" : "bg-gray-50/30"
                    )}
                  >
                    <TableCell className="text-gray-700 font-medium">
                      {new Date(holiday.date).toLocaleDateString("th-TH", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric"
                      })}
                    </TableCell>
                    <TableCell className="font-medium text-gray-900">{holiday.name}</TableCell>
                    <TableCell className="max-w-[300px] text-gray-600 text-sm">
                      {holiday.description || "-"}
                    </TableCell>
                    <TableCell>
                      {holiday.is_recurring ? (
                        <Badge className="rounded-full px-3 py-1 text-xs font-medium bg-purple-100 text-purple-700 hover:bg-purple-100">
                          วันหยุดประจำปี
                        </Badge>
                      ) : (
                        <Badge className="rounded-full px-3 py-1 text-xs font-medium bg-amber-100 text-amber-700 hover:bg-amber-100">
                          วันหยุดพิเศษ
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setEditingHoliday(holiday)}
                          className="h-8 w-8 rounded-lg hover:bg-slate-50 cursor-pointer"
                        >
                          <Pencil className="h-4 w-4 text-slate-600" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(holiday.id)}
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

      <AddHolidayDialog
        open={isAddOpen}
        onOpenChange={setIsAddOpen}
        onSuccess={handleAddSuccess}
      />

      {editingHoliday && (
        <EditHolidayDialog
          open={!!editingHoliday}
          onOpenChange={(open) => !open && setEditingHoliday(null)}
          onSuccess={handleEditSuccess}
          holiday={editingHoliday}
        />
      )}
    </div>
  );
}
