"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/lib/supabase";
import type { Tables } from "@/lib/database.types";

type Holiday = Tables<"company_holidays">;

interface EditHolidayDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  holiday: Holiday;
}

export function EditHolidayDialog({
  open,
  onOpenChange,
  onSuccess,
  holiday,
}: EditHolidayDialogProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: holiday.name,
    date: holiday.date,
    description: holiday.description || "",
    is_recurring: holiday.is_recurring ? "true" : "false",
  });

  useEffect(() => {
    setFormData({
      name: holiday.name,
      date: holiday.date,
      description: holiday.description || "",
      is_recurring: holiday.is_recurring ? "true" : "false",
    });
  }, [holiday]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase
        .from("company_holidays")
        .update({
          name: formData.name,
          date: formData.date,
          description: formData.description || null,
          is_recurring: formData.is_recurring === "true",
        })
        .eq("id", holiday.id);

      if (error) throw error;

      onSuccess();
    } catch (error) {
      console.error("Error updating holiday:", error);
      alert("เกิดข้อผิดพลาดในการแก้ไขวันหยุด");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px] rounded-2xl">
        <form onSubmit={handleSubmit}>
          <DialogHeader className="space-y-3 pb-4">
            <DialogTitle className="text-2xl font-bold text-gray-900">แก้ไขวันหยุด</DialogTitle>
            <DialogDescription className="text-gray-600">
              แก้ไขข้อมูลวันหยุดบริษัท
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-5 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit_name" className="text-sm font-semibold text-gray-700">ชื่อวันหยุด *</Label>
              <Input
                id="edit_name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="เช่น วันขึ้นปีใหม่"
                className="rounded-xl border-gray-200 h-11"
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="edit_date" className="text-sm font-semibold text-gray-700">วันที่ *</Label>
              <input
                id="edit_date"
                type="date"
                className="flex h-11 w-full rounded-xl border border-gray-200 bg-transparent px-3 py-2 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 disabled:cursor-not-allowed disabled:opacity-50"
                value={formData.date}
                onChange={(e) =>
                  setFormData({ ...formData, date: e.target.value })
                }
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="edit_is_recurring" className="text-sm font-semibold text-gray-700">ประเภท</Label>
              <Select
                value={formData.is_recurring}
                onValueChange={(value) =>
                  setFormData({ ...formData, is_recurring: value })
                }
              >
                <SelectTrigger className="rounded-xl border-gray-200 h-11">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="true">วันหยุดประจำปี</SelectItem>
                  <SelectItem value="false">วันหยุดพิเศษ</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="edit_description" className="text-sm font-semibold text-gray-700">คำอธิบาย</Label>
              <Textarea
                id="edit_description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                rows={3}
                placeholder="รายละเอียดเพิ่มเติม (ถ้ามี)"
                className="rounded-xl border-gray-200 resize-none"
              />
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
              className="rounded-xl border-gray-200 h-11"
            >
              ยกเลิก
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="rounded-xl h-11 bg-linear-to-r from-slate-700 to-slate-800 hover:from-slate-800 hover:to-slate-900 shadow-lg shadow-slate-500/20 text-white"
            >
              {loading ? "กำลังบันทึก..." : "บันทึก"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
