"use client";

import { useState } from "react";
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

interface AddHolidayDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function AddHolidayDialog({
  open,
  onOpenChange,
  onSuccess,
}: AddHolidayDialogProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    date: "",
    description: "",
    is_recurring: "false",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.from("company_holidays").insert([
        {
          name: formData.name,
          date: formData.date,
          description: formData.description || null,
          is_recurring: formData.is_recurring === "true",
        },
      ]);

      if (error) throw error;

      setFormData({
        name: "",
        date: "",
        description: "",
        is_recurring: "false",
      });
      onSuccess();
    } catch (error) {
      console.error("Error adding holiday:", error);
      alert("เกิดข้อผิดพลาดในการเพิ่มวันหยุด");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>เพิ่มวันหยุด</DialogTitle>
            <DialogDescription>
              กำหนดวันหยุดบริษัทใหม่
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">ชื่อวันหยุด *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="เช่น วันขึ้นปีใหม่"
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="date">วันที่ *</Label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) =>
                  setFormData({ ...formData, date: e.target.value })
                }
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="is_recurring">ประเภท</Label>
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
              <Label htmlFor="description">คำอธิบาย</Label>
              <Textarea
                id="description"
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
