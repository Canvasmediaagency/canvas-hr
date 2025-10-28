"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Pencil, Save, X } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import type { Tables } from "@/lib/database.types";

type LeaveType = Tables<"leave_types">;

interface LeaveTypeSettingsProps {
  initialLeaveTypes: LeaveType[];
}

export function LeaveTypeSettings({ initialLeaveTypes }: LeaveTypeSettingsProps) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [leaveTypes, setLeaveTypes] = useState(initialLeaveTypes);

  const handleSave = async () => {
    setSaving(true);
    try {
      for (const leaveType of leaveTypes) {
        await supabase
          .from("leave_types")
          .update({
            default_quota: leaveType.default_quota,
          })
          .eq("id", leaveType.id);
      }

      // Refresh data from server
      const { data: updatedData } = await supabase
        .from("leave_types")
        .select("*")
        .order("created_at", { ascending: true });

      if (updatedData) {
        setLeaveTypes(updatedData);
      }

      setEditing(false);
      router.refresh();
      alert("บันทึกการตั้งค่าเรียบร้อยแล้ว");
    } catch (error) {
      console.error("Error saving leave types:", error);
      alert("เกิดข้อผิดพลาดในการบันทึก");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setLeaveTypes(initialLeaveTypes);
    setEditing(false);
  };

  const updateQuota = (id: string, quota: number) => {
    setLeaveTypes(
      leaveTypes.map((lt) =>
        lt.id === id ? { ...lt, default_quota: quota } : lt
      )
    );
  };

  return (
    <Card className="shadow-md border-0">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>กำหนดวันลาแต่ละประเภท</CardTitle>
          {!editing ? (
            <Button variant="outline" size="sm" onClick={() => setEditing(true)} className="gap-2">
              <Pencil className="h-4 w-4" />
              แก้ไขโควต้า
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
        <div className="grid gap-4 md:grid-cols-3">
          {leaveTypes.map((type) => (
            <div key={type.id} className={`rounded-lg p-4 transition-all ${editing ? 'shadow-md bg-blue-50' : 'shadow bg-white'}`}>
              <h3 className="font-semibold text-lg mb-1">{type.name}</h3>
              <p className="text-sm text-muted-foreground mb-3">
                {type.description}
              </p>
              {editing ? (
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    min="0"
                    value={type.default_quota}
                    onChange={(e) =>
                      updateQuota(type.id, parseInt(e.target.value) || 0)
                    }
                    className="w-24"
                  />
                  <span className="text-sm">วัน</span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-base">
                    {type.default_quota} วัน
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
        {editing && (
          <p className="text-sm text-muted-foreground mt-4">
            <strong>หมายเหตุ:</strong> การแก้ไขโควต้ามาตรฐานจะมีผลกับพนักงานใหม่เท่านั้น
            พนักงานปัจจุบันต้องแก้ไขโควต้าในหน้ารายละเอียดพนักงานแต่ละคน
          </p>
        )}
      </CardContent>
    </Card>
  );
}
