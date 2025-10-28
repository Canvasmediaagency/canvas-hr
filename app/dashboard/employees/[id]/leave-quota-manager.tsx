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
    <Card className="shadow-lg border-0">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Settings className="h-5 w-5 text-blue-600" />
            <CardTitle>จัดการโควต้าวันลา</CardTitle>
          </div>
          {!editing ? (
            <Button variant="outline" size="sm" onClick={() => setEditing(true)} className="gap-2">
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
                className="gap-2"
              >
                <X className="h-4 w-4" />
                ยกเลิก
              </Button>
              <Button size="sm" onClick={handleSave} disabled={saving} className="gap-2">
                <Save className="h-4 w-4" />
                {saving ? "กำลังบันทึก..." : "บันทึก"}
              </Button>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {quotas.length === 0 ? (
          <div className="text-center py-8">
            <Settings className="h-12 w-12 text-muted-foreground mx-auto mb-2 opacity-50" />
            <p className="text-muted-foreground">ยังไม่มีข้อมูลโควต้าวันลา</p>
          </div>
        ) : (
          <div className="space-y-3">
            {quotas.map((quota: any) => (
              <div
                key={quota.id}
                className={`p-4 rounded-lg transition-all ${
                  editing ? "bg-blue-50 shadow-md" : "bg-gray-50 shadow"
                }`}
              >
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <Label className="text-sm font-semibold">
                      {quota.leave_types?.name}
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      {quota.leave_types?.description}
                    </p>
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor={`total-${quota.id}`} className="text-xs font-medium">
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
                      className={`h-10 ${editing ? "bg-white" : ""}`}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor={`used-${quota.id}`} className="text-xs font-medium">
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
                      className={`h-10 ${editing ? "bg-white" : ""}`}
                    />
                  </div>
                </div>
                {!editing && (
                  <div className="mt-3 pt-3 border-t">
                    <p className="text-xs text-muted-foreground">
                      คงเหลือ:{" "}
                      <span className="font-semibold text-green-600">
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
