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
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/lib/supabase";
import type { Tables } from "@/lib/database.types";

type Employee = Tables<"employees">;
type LeaveType = Tables<"leave_types">;

interface AddLeaveDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  employees: Employee[];
  leaveTypes: LeaveType[];
}

export function AddLeaveDialog({
  open,
  onOpenChange,
  onSuccess,
  employees,
  leaveTypes,
}: AddLeaveDialogProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    employee_id: "",
    leave_type_id: "",
    start_date: "",
    end_date: "",
    days_count: "1",
    reason: "",
    notes: "",
  });

  const calculateDays = () => {
    if (formData.start_date && formData.end_date) {
      const start = new Date(formData.start_date);
      const end = new Date(formData.end_date);
      const diffTime = Math.abs(end.getTime() - start.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
      setFormData({ ...formData, days_count: diffDays.toString() });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const daysCount = parseFloat(formData.days_count);

      const { error: leaveError } = await supabase
        .from("leave_records")
        .insert([{
          employee_id: formData.employee_id,
          leave_type_id: formData.leave_type_id,
          start_date: formData.start_date,
          end_date: formData.end_date,
          days_count: daysCount,
          reason: formData.reason,
          notes: formData.notes,
        }]);

      if (leaveError) throw leaveError;

      const currentYear = new Date().getFullYear();
      const { data: quota } = await supabase
        .from("employee_leave_quotas")
        .select("*")
        .eq("employee_id", formData.employee_id)
        .eq("leave_type_id", formData.leave_type_id)
        .eq("year", currentYear)
        .single();

      if (quota) {
        await supabase
          .from("employee_leave_quotas")
          .update({ used_days: quota.used_days + daysCount })
          .eq("id", quota.id);
      }

      setFormData({
        employee_id: "",
        leave_type_id: "",
        start_date: "",
        end_date: "",
        days_count: "1",
        reason: "",
        notes: "",
      });
      onSuccess();
    } catch (error) {
      console.error("Error adding leave:", error);
      alert("เกิดข้อผิดพลาดในการบันทึกวันลา");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>บันทึกการลา</DialogTitle>
            <DialogDescription>
              บันทึกข้อมูลการลาของพนักงาน
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="employee_id">พนักงาน *</Label>
              <Select
                value={formData.employee_id}
                onValueChange={(value) =>
                  setFormData({ ...formData, employee_id: value })
                }
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="เลือกพนักงาน" />
                </SelectTrigger>
                <SelectContent>
                  {employees.map((emp) => (
                    <SelectItem key={emp.id} value={emp.id}>
                      {emp.full_name}{emp.nickname && ` (${emp.nickname})`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="leave_type_id">ประเภทการลา *</Label>
              <Select
                value={formData.leave_type_id}
                onValueChange={(value) =>
                  setFormData({ ...formData, leave_type_id: value })
                }
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="เลือกประเภทการลา" />
                </SelectTrigger>
                <SelectContent>
                  {leaveTypes.map((type) => (
                    <SelectItem key={type.id} value={type.id}>
                      {type.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="start_date">วันที่เริ่ม *</Label>
                <Input
                  id="start_date"
                  type="date"
                  value={formData.start_date}
                  onChange={(e) => {
                    setFormData({ ...formData, start_date: e.target.value });
                    setTimeout(calculateDays, 0);
                  }}
                  required
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="end_date">วันที่สิ้นสุด *</Label>
                <Input
                  id="end_date"
                  type="date"
                  value={formData.end_date}
                  onChange={(e) => {
                    setFormData({ ...formData, end_date: e.target.value });
                    setTimeout(calculateDays, 0);
                  }}
                  required
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="days_count">จำนวนวัน *</Label>
              <Input
                id="days_count"
                type="number"
                step="0.5"
                min="0.5"
                value={formData.days_count}
                onChange={(e) =>
                  setFormData({ ...formData, days_count: e.target.value })
                }
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="reason">เหตุผล</Label>
              <Textarea
                id="reason"
                value={formData.reason}
                onChange={(e) =>
                  setFormData({ ...formData, reason: e.target.value })
                }
                rows={3}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="notes">หมายเหตุ</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) =>
                  setFormData({ ...formData, notes: e.target.value })
                }
                rows={2}
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
