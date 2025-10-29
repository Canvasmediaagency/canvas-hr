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
type LeaveRecord = Tables<"leave_records">;

interface EditLeaveDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  leave: LeaveRecord;
  employees: Employee[];
  leaveTypes: LeaveType[];
}

export function EditLeaveDialog({
  open,
  onOpenChange,
  onSuccess,
  leave,
  employees,
  leaveTypes,
}: EditLeaveDialogProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    employee_id: leave.employee_id,
    leave_type_id: leave.leave_type_id,
    start_date: leave.start_date,
    end_date: leave.end_date,
    days_count: leave.days_count.toString(),
    reason: leave.reason || "",
    notes: leave.notes || "",
  });

  useEffect(() => {
    setFormData({
      employee_id: leave.employee_id,
      leave_type_id: leave.leave_type_id,
      start_date: leave.start_date,
      end_date: leave.end_date,
      days_count: leave.days_count.toString(),
      reason: leave.reason || "",
      notes: leave.notes || "",
    });
  }, [leave]);


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const oldDaysCount = leave.days_count;
      const newDaysCount = parseFloat(formData.days_count);
      const daysDifference = newDaysCount - oldDaysCount;

      // Update leave record
      const { error: leaveError } = await supabase
        .from("leave_records")
        .update({
          employee_id: formData.employee_id,
          leave_type_id: formData.leave_type_id,
          start_date: formData.start_date,
          end_date: formData.end_date,
          days_count: newDaysCount,
          reason: formData.reason,
          notes: formData.notes,
        })
        .eq("id", leave.id);

      if (leaveError) throw leaveError;

      // Update quota if days changed
      if (daysDifference !== 0) {
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
            .update({ used_days: quota.used_days + daysDifference })
            .eq("id", quota.id);
        }
      }

      onSuccess();
    } catch (error) {
      console.error("Error updating leave:", error);
      alert("เกิดข้อผิดพลาดในการแก้ไขบันทึกวันลา");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>แก้ไขบันทึกการลา</DialogTitle>
            <DialogDescription>
              แก้ไขข้อมูลการลาของพนักงาน
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit_employee_id">พนักงาน *</Label>
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
              <Label htmlFor="edit_leave_type_id">ประเภทการลา *</Label>
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
                <Label htmlFor="edit_start_date">วันที่เริ่ม *</Label>
                <Input
                  id="edit_start_date"
                  type="date"
                  value={formData.start_date}
                  onChange={(e) =>
                    setFormData({ ...formData, start_date: e.target.value })
                  }
                  required
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="edit_end_date">วันที่สิ้นสุด *</Label>
                <Input
                  id="edit_end_date"
                  type="date"
                  value={formData.end_date}
                  onChange={(e) =>
                    setFormData({ ...formData, end_date: e.target.value })
                  }
                  required
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="edit_days_count">จำนวนวัน *</Label>
              <Input
                id="edit_days_count"
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
              <Label htmlFor="edit_reason">เหตุผล</Label>
              <Textarea
                id="edit_reason"
                value={formData.reason}
                onChange={(e) =>
                  setFormData({ ...formData, reason: e.target.value })
                }
                rows={3}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="edit_notes">หมายเหตุ</Label>
              <Textarea
                id="edit_notes"
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
