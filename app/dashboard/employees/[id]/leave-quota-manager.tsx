"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { Pencil, Save, X, Settings } from "lucide-react";

interface LeaveQuotaManagerProps {
  employeeId: string;
  initialQuotas: any[];
}

export function LeaveQuotaManager({
  employeeId,
  initialQuotas,
}: LeaveQuotaManagerProps) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [quotas, setQuotas] = useState(initialQuotas);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      for (const quota of quotas) {
        await supabase
          .from("employee_leave_quotas")
          .update({
            total_days: quota.total_days,
            used_days: quota.used_days,
          })
          .eq("id", quota.id);
      }
      setEditing(false);
      router.refresh();
    } catch (error) {
      console.error("Error saving quotas:", error);
      alert("เกิดข้อผิดพลาดในการบันทึก");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setQuotas(initialQuotas);
    setEditing(false);
  };

  const updateQuota = (id: string, field: string, value: number) => {
    setQuotas(
      quotas.map((q) => (q.id === id ? { ...q, [field]: value } : q))
    );
  };

  return (
    <Card className="bg-white rounded-2xl shadow-sm border border-gray-100">
      <CardHeader className="space-y-3 pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-linear-to-br from-slate-600 to-slate-700 flex items-center justify-center shadow-lg shadow-slate-500/20">
              <Settings className="h-5 w-5 text-white" strokeWidth={2.5} />
            </div>
            <CardTitle className="text-2xl font-bold text-gray-900">จัดการโควต้าวันลา</CardTitle>
          </div>
          {!editing ? (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setEditing(true)}
              className="gap-2 rounded-xl border-gray-200 h-9 cursor-pointer"
            >
              <Pencil className="h-4 w-4" />
              แก้ไข
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleCancel}
                disabled={saving}
                className="gap-2 rounded-xl border-gray-200 h-9 cursor-pointer"
              >
                <X className="h-4 w-4" />
                ยกเลิก
              </Button>
              <Button
                size="sm"
                onClick={handleSave}
                disabled={saving}
                className="gap-2 rounded-xl h-9 bg-linear-to-r from-slate-700 to-slate-800 hover:from-slate-800 hover:to-slate-900 shadow-lg shadow-slate-500/20 text-white cursor-pointer"
              >
                <Save className="h-4 w-4" />
                {saving ? "กำลังบันทึก..." : "บันทึก"}
              </Button>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {quotas.length === 0 ? (
          <div className="text-center py-12">
            <Settings className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-400 font-medium">ยังไม่มีข้อมูลโควต้าวันลา</p>
          </div>
        ) : (
          <div className="space-y-4">
            {quotas.map((quota: any) => (
              <div
                key={quota.id}
                className={`p-5 rounded-xl transition-all border ${
                  editing
                    ? "bg-slate-50 border-slate-200 shadow-md"
                    : "bg-gray-50 border-gray-100 shadow-sm"
                }`}
              >
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-base font-bold text-gray-900">
                      {quota.leave_types?.name}
                    </Label>
                    <p className="text-xs text-gray-600">
                      {quota.leave_types?.description}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`total-${quota.id}`} className="text-xs font-semibold text-gray-700">
                      โควต้าทั้งหมด (วัน)
                    </Label>
                    <Input
                      id={`total-${quota.id}`}
                      type="number"
                      min="0"
                      value={quota.total_days}
                      onChange={(e) =>
                        updateQuota(quota.id, "total_days", parseInt(e.target.value) || 0)
                      }
                      disabled={!editing}
                      className={`h-11 rounded-xl border-gray-200 ${editing ? "bg-white" : ""}`}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`used-${quota.id}`} className="text-xs font-semibold text-gray-700">
                      ใช้ไปแล้ว (วัน)
                    </Label>
                    <Input
                      id={`used-${quota.id}`}
                      type="number"
                      min="0"
                      value={quota.used_days}
                      onChange={(e) =>
                        updateQuota(quota.id, "used_days", parseInt(e.target.value) || 0)
                      }
                      disabled={!editing}
                      className={`h-11 rounded-xl border-gray-200 ${editing ? "bg-white" : ""}`}
                    />
                  </div>
                </div>
                {!editing && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <p className="text-sm text-gray-600 font-medium">
                      คงเหลือ:{" "}
                      <span className="font-bold text-green-600">
                        {quota.remaining_days} วัน
                      </span>
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
