"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { Pencil, Save, X } from "lucide-react";

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
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>จัดการโควต้าวันลา</CardTitle>
          {!editing ? (
            <Button variant="outline" size="sm" onClick={() => setEditing(true)}>
              <Pencil className="mr-2 h-4 w-4" />
              แก้ไข
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleCancel}
                disabled={saving}
              >
                <X className="mr-2 h-4 w-4" />
                ยกเลิก
              </Button>
              <Button size="sm" onClick={handleSave} disabled={saving}>
                <Save className="mr-2 h-4 w-4" />
                {saving ? "กำลังบันทึก..." : "บันทึก"}
              </Button>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {quotas.map((quota: any) => (
            <div key={quota.id} className="grid grid-cols-3 gap-4 items-end">
              <div>
                <Label className="text-sm font-medium">
                  {quota.leave_types?.name}
                </Label>
                <p className="text-xs text-muted-foreground">
                  {quota.leave_types?.description}
                </p>
              </div>
              <div>
                <Label htmlFor={`total-${quota.id}`} className="text-xs">
                  โควต้าทั้งหมด
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
                  className="h-9"
                />
              </div>
              <div>
                <Label htmlFor={`used-${quota.id}`} className="text-xs">
                  ใช้ไปแล้ว
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
                  className="h-9"
                />
              </div>
            </div>
          ))}
          {quotas.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-4">
              ยังไม่มีข้อมูลโควต้าวันลา
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
