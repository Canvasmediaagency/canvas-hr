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
import { Plus, Trash2, Search, ChevronLeft, ChevronRight } from "lucide-react";
import { AddHolidayDialog } from "./add-holiday-dialog";
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
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

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

    setHolidays(holidays.filter((holiday) => holiday.id !== id));
    router.refresh();
  };

  const handleAddSuccess = () => {
    router.refresh();
    setIsAddOpen(false);
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

  // Reset to page 1 when filters change
  useMemo(() => {
    setCurrentPage(1);
  }, [searchQuery, typeFilter]);

  return (
    <div className="space-y-4">
      {/* Header with Add Button */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">วันหยุดบริษัท</h3>
          <p className="text-sm text-muted-foreground">
            แสดง {paginatedHolidays.length} จาก {filteredHolidays.length} วัน
          </p>
        </div>
        <Button onClick={() => setIsAddOpen(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          เพิ่มวันหยุด
        </Button>
      </div>

      {/* Search and Filter Section */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="ค้นหาชื่อวันหยุด, คำอธิบาย..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-full sm:w-[200px]">
            <SelectValue placeholder="ประเภททั้งหมด" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">ประเภททั้งหมด</SelectItem>
            <SelectItem value="recurring">วันหยุดประจำปี</SelectItem>
            <SelectItem value="special">วันหยุดพิเศษ</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="rounded-md border bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>วันที่</TableHead>
              <TableHead>ชื่อวันหยุด</TableHead>
              <TableHead>คำอธิบาย</TableHead>
              <TableHead>ประเภท</TableHead>
              <TableHead className="text-right">จัดการ</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedHolidays.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                  {searchQuery || typeFilter !== "all"
                    ? "ไม่พบข้อมูลที่ตรงกับการค้นหา"
                    : "ยังไม่มีวันหยุดที่กำหนดไว้"}
                </TableCell>
              </TableRow>
            ) : (
              paginatedHolidays.map((holiday) => (
                <TableRow key={holiday.id}>
                  <TableCell className="font-medium">
                    {new Date(holiday.date).toLocaleDateString("th-TH", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </TableCell>
                  <TableCell>{holiday.name}</TableCell>
                  <TableCell className="max-w-[300px]">
                    {holiday.description || "-"}
                  </TableCell>
                  <TableCell>
                    {holiday.is_recurring ? (
                      <Badge variant="secondary">วันหยุดประจำปี</Badge>
                    ) : (
                      <Badge variant="outline">วันหยุดพิเศษ</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(holiday.id)}
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

      <AddHolidayDialog
        open={isAddOpen}
        onOpenChange={setIsAddOpen}
        onSuccess={handleAddSuccess}
      />
    </div>
  );
}
