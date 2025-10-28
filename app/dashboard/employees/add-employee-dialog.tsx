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

interface AddEmployeeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function AddEmployeeDialog({
  open,
  onOpenChange,
  onSuccess,
}: AddEmployeeDialogProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    full_name: "",
    phone_number: "",
    department: "",
    position: "",
    hire_date: "",
    status: "active" as "active" | "inactive" | "terminated",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error: employeeError, data: employeeData } = await supabase
        .from("employees")
        .insert([formData])
        .select()
        .single();

      if (employeeError) throw employeeError;

      const { data: leaveTypes } = await supabase
        .from("leave_types")
        .select("*");

      if (leaveTypes && leaveTypes.length > 0) {
        const currentYear = new Date().getFullYear();
        const quotas = leaveTypes.map((leaveType) => ({
          employee_id: employeeData.id,
          leave_type_id: leaveType.id,
          total_days: leaveType.default_quota,
          used_days: 0,
          year: currentYear,
        }));

        await supabase.from("employee_leave_quotas").insert(quotas);
      }

      setFormData({
        full_name: "",
        phone_number: "",
        department: "",
        position: "",
        hire_date: "",
        status: "active",
      });
      onSuccess();
    } catch (error) {
      console.error("Error adding employee:", error);
      alert("เกิดข้อผิดพลาดในการเพิ่มพนักงาน");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>เพิ่มพนักงานใหม่</DialogTitle>
            <DialogDescription>
              กรอกข้อมูลพนักงานใหม่ที่ต้องการเพิ่มเข้าสู่ระบบ
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="full_name">ชื่อ-นามสกุล *</Label>
              <Input
                id="full_name"
                value={formData.full_name}
                onChange={(e) =>
                  setFormData({ ...formData, full_name: e.target.value })
                }
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="phone_number">เบอร์โทรศัพท์</Label>
              <Input
                id="phone_number"
                type="tel"
                value={formData.phone_number}
                onChange={(e) =>
                  setFormData({ ...formData, phone_number: e.target.value })
                }
                placeholder="0XX-XXX-XXXX"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="department">แผนก</Label>
              <Input
                id="department"
                value={formData.department}
                onChange={(e) =>
                  setFormData({ ...formData, department: e.target.value })
                }
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="position">ตำแหน่ง</Label>
              <Input
                id="position"
                value={formData.position}
                onChange={(e) =>
                  setFormData({ ...formData, position: e.target.value })
                }
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="hire_date">วันเริ่มงาน *</Label>
              <Input
                id="hire_date"
                type="date"
                value={formData.hire_date}
                onChange={(e) =>
                  setFormData({ ...formData, hire_date: e.target.value })
                }
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="status">สถานะ</Label>
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
