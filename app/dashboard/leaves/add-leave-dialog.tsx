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
      <DialogContent className="sm:max-w-[550px] rounded-2xl">
        <form onSubmit={handleSubmit}>
          <DialogHeader className="space-y-3 pb-4">
            <DialogTitle className="text-2xl font-bold text-gray-900">บันทึกการลา</DialogTitle>
          </DialogHeader>

          <div className="grid gap-5 py-4">
            <div className="grid gap-2">
              <Label htmlFor="employee_id" className="text-sm font-semibold text-gray-700">พนักงาน *</Label>
              <Select
                value={formData.employee_id}
                onValueChange={(value) =>
                  setFormData({ ...formData, employee_id: value })
                }
                required
              >
                <SelectTrigger className="rounded-xl border-gray-200 h-11">
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
              <Label htmlFor="leave_type_id" className="text-sm font-semibold text-gray-700">ประเภทการลา *</Label>
              <Select
                value={formData.leave_type_id}
                onValueChange={(value) =>
                  setFormData({ ...formData, leave_type_id: value })
                }
                required
              >
                <SelectTrigger className="rounded-xl border-gray-200 h-11">
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
                <Label htmlFor="start_date" className="text-sm font-semibold text-gray-700">วันที่เริ่ม *</Label>
                <input
                  id="start_date"
                  type="date"
                  className="flex h-11 w-full rounded-xl border border-gray-200 bg-transparent px-3 py-2 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 disabled:cursor-not-allowed disabled:opacity-50"
                  value={formData.start_date}
                  onChange={(e) =>
                    setFormData({ ...formData, start_date: e.target.value })
                  }
                  required
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="end_date" className="text-sm font-semibold text-gray-700">วันที่สิ้นสุด *</Label>
                <input
                  id="end_date"
                  type="date"
                  className="flex h-11 w-full rounded-xl border border-gray-200 bg-transparent px-3 py-2 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 disabled:cursor-not-allowed disabled:opacity-50"
                  value={formData.end_date}
                  onChange={(e) =>
                    setFormData({ ...formData, end_date: e.target.value })
                  }
                  required
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="days_count" className="text-sm font-semibold text-gray-700">จำนวนวัน *</Label>
              <Input
                id="days_count"
                type="number"
                step="0.5"
                min="0.5"
                value={formData.days_count}
                onChange={(e) =>
                  setFormData({ ...formData, days_count: e.target.value })
                }
                className="rounded-xl border-gray-200 h-11"
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="reason" className="text-sm font-semibold text-gray-700">เหตุผล</Label>
              <Textarea
                id="reason"
                value={formData.reason}
                onChange={(e) =>
                  setFormData({ ...formData, reason: e.target.value })
                }
                rows={3}
                className="rounded-xl border-gray-200 resize-none"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="notes" className="text-sm font-semibold text-gray-700">หมายเหตุ</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) =>
                  setFormData({ ...formData, notes: e.target.value })
                }
                rows={2}
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
