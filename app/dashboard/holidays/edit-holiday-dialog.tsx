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
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>แก้ไขวันหยุด</DialogTitle>
            <DialogDescription>
              แก้ไขข้อมูลวันหยุดบริษัท
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit_name">ชื่อวันหยุด *</Label>
              <Input
                id="edit_name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="เช่น วันขึ้นปีใหม่"
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="edit_date">วันที่ *</Label>
              <Input
                id="edit_date"
                type="date"
                value={formData.date}
                onChange={(e) =>
                  setFormData({ ...formData, date: e.target.value })
                }
                onBlur={(e) => {
                  // Ensure the value is set correctly
                  if (e.target.value) {
                    setFormData({ ...formData, date: e.target.value });
                  }
                }}
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="edit_is_recurring">ประเภท</Label>
              <Select
                value={formData.is_recurring}
                onValueChange={(value) =>
                  setFormData({ ...formData, is_recurring: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="true">วันหยุดประจำปี</SelectItem>
                  <SelectItem value="false">วันหยุดพิเศษ</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="edit_description">คำอธิบาย</Label>
              <Textarea
                id="edit_description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                rows={3}
                placeholder="รายละเอียดเพิ่มเติม (ถ้ามี)"
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              ยกเลิก
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "กำลังบันทึก..." : "บันทึก"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
