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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/lib/supabase";
import type { Tables } from "@/lib/database.types";

type Employee = Tables<"employees">;

interface EditEmployeeDialogProps {
  employee: Employee;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function EditEmployeeDialog({
  employee,
  open,
  onOpenChange,
  onSuccess,
}: EditEmployeeDialogProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    full_name: employee.full_name,
    email: employee.email,
    department: employee.department || "",
    position: employee.position || "",
    hire_date: employee.hire_date,
    status: employee.status as "active" | "inactive" | "terminated",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase
        .from("employees")
        .update(formData)
        .eq("id", employee.id);

      if (error) throw error;

      onSuccess();
    } catch (error) {
      console.error("Error updating employee:", error);
      alert("เกิดข้อผิดพลาดในการอัพเดทข้อมูล");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>แก้ไขข้อมูลพนักงาน</DialogTitle>
            <DialogDescription>
              แก้ไขข้อมูลของพนักงาน {employee.full_name}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit_full_name">ชื่อ-นามสกุล *</Label>
              <Input
                id="edit_full_name"
                value={formData.full_name}
                onChange={(e) =>
                  setFormData({ ...formData, full_name: e.target.value })
                }
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="edit_email">อีเมล *</Label>
              <Input
                id="edit_email"
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="edit_department">แผนก</Label>
              <Input
                id="edit_department"
                value={formData.department}
                onChange={(e) =>
                  setFormData({ ...formData, department: e.target.value })
                }
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="edit_position">ตำแหน่ง</Label>
              <Input
                id="edit_position"
                value={formData.position}
                onChange={(e) =>
                  setFormData({ ...formData, position: e.target.value })
                }
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="edit_hire_date">วันเริ่มงาน *</Label>
              <Input
                id="edit_hire_date"
                type="date"
                value={formData.hire_date}
                onChange={(e) =>
                  setFormData({ ...formData, hire_date: e.target.value })
                }
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="edit_status">สถานะ</Label>
              <Select
                value={formData.status}
                onValueChange={(value: "active" | "inactive" | "terminated") =>
                  setFormData({ ...formData, status: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">ทำงานอยู่</SelectItem>
                  <SelectItem value="inactive">พักงาน</SelectItem>
                  <SelectItem value="terminated">ออกจากงาน</SelectItem>
                </SelectContent>
              </Select>
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
