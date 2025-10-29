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
    nickname: employee.nickname || "",
    birthday: employee.birthday || "",
    department: employee.department || "",
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
      <DialogContent className="sm:max-w-[550px] rounded-2xl">
        <form onSubmit={handleSubmit}>
          <DialogHeader className="space-y-3 pb-4">
            <DialogTitle className="text-2xl font-bold text-gray-900">แก้ไขข้อมูลพนักงาน</DialogTitle>
            <DialogDescription className="text-gray-600">
              แก้ไขข้อมูลของพนักงาน {employee.full_name}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-5 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit_full_name" className="text-sm font-semibold text-gray-700">ชื่อ-นามสกุล *</Label>
              <Input
                id="edit_full_name"
                value={formData.full_name}
                onChange={(e) =>
                  setFormData({ ...formData, full_name: e.target.value })
                }
                className="rounded-xl border-gray-200 h-11"
                placeholder="กรอกชื่อ-นามสกุล"
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="edit_nickname" className="text-sm font-semibold text-gray-700">ชื่อเล่น</Label>
              <Input
                id="edit_nickname"
                value={formData.nickname}
                onChange={(e) =>
                  setFormData({ ...formData, nickname: e.target.value })
                }
                className="rounded-xl border-gray-200 h-11"
                placeholder="กรอกชื่อเล่น"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="edit_birthday" className="text-sm font-semibold text-gray-700">วันเกิด</Label>
                <input
                  id="edit_birthday"
                  type="date"
                  value={formData.birthday}
                  onChange={(e) =>
                    setFormData({ ...formData, birthday: e.target.value })
                  }
                  className="flex h-11 w-full rounded-xl border border-gray-200 bg-transparent px-3 py-2 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 disabled:cursor-not-allowed disabled:opacity-50"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="edit_hire_date" className="text-sm font-semibold text-gray-700">วันเริ่มงาน *</Label>
                <input
                  id="edit_hire_date"
                  type="date"
                  value={formData.hire_date}
                  onChange={(e) =>
                    setFormData({ ...formData, hire_date: e.target.value })
                  }
                  className="flex h-11 w-full rounded-xl border border-gray-200 bg-transparent px-3 py-2 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 disabled:cursor-not-allowed disabled:opacity-50"
                  required
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="edit_department" className="text-sm font-semibold text-gray-700">แผนก</Label>
              <Input
                id="edit_department"
                value={formData.department}
                onChange={(e) =>
                  setFormData({ ...formData, department: e.target.value })
                }
                className="rounded-xl border-gray-200 h-11"
                placeholder="กรอกแผนก"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="edit_status" className="text-sm font-semibold text-gray-700">สถานะ</Label>
              <Select
                value={formData.status}
                onValueChange={(value: "active" | "inactive" | "terminated") =>
                  setFormData({ ...formData, status: value })
                }
              >
                <SelectTrigger className="rounded-xl border-gray-200 h-11">
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
