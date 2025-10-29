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
    <Card className="bg-white rounded-2xl shadow-sm border border-gray-100">
      <CardHeader className="space-y-3 pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-2xl font-bold text-gray-900">กำหนดวันลาแต่ละประเภท</CardTitle>
          {!editing ? (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setEditing(true)}
              className="gap-2 rounded-xl border-gray-200 h-9 cursor-pointer"
            >
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
        <div className="grid gap-4 md:grid-cols-3">
          {leaveTypes.map((type) => (
            <div
              key={type.id}
              className={`rounded-xl p-5 transition-all ${
                editing
                  ? 'shadow-md bg-slate-50 border border-slate-200'
                  : 'shadow-sm bg-gray-50 border border-gray-100'
              }`}
            >
              <h3 className="font-bold text-lg mb-1.5 text-gray-900">{type.name}</h3>
              <p className="text-sm text-gray-600 mb-4">
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
                    className="w-24 rounded-xl border-gray-200 h-10"
                  />
                  <span className="text-sm font-medium text-gray-700">วัน</span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Badge className="rounded-full px-3 py-1 text-sm font-semibold bg-slate-100 text-slate-700 hover:bg-slate-100">
                    {type.default_quota} วัน
                  </Badge>
                </div>
              )}
            </div>
          ))}
        </div>
        {editing && (
          <div className="mt-6 p-4 rounded-xl bg-amber-50 border border-amber-100">
            <p className="text-sm text-gray-700">
              <strong className="font-semibold text-amber-800">หมายเหตุ:</strong> การแก้ไขโควต้ามาตรฐานจะมีผลกับพนักงานใหม่เท่านั้น
              พนักงานปัจจุบันต้องแก้ไขโควต้าในหน้ารายละเอียดพนักงานแต่ละคน
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
