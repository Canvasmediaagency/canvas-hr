"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Users,
  Calendar,
  CalendarDays,
  FileText,
} from "lucide-react";

const routes = [
  {
    label: "Dashboard",
    icon: LayoutDashboard,
    href: "/dashboard",
    color: "text-sky-500",
  },
  {
    label: "พนักงาน",
    icon: Users,
    href: "/dashboard/employees",
    color: "text-violet-500",
  },
  {
    label: "จัดการวันลา",
    icon: Calendar,
    href: "/dashboard/leaves",
    color: "text-pink-700",
  },
  {
    label: "วันหยุดบริษัท",
    icon: CalendarDays,
    href: "/dashboard/holidays",
    color: "text-orange-700",
  },
  {
    label: "รายงานวันลา",
    icon: FileText,
    href: "/dashboard/reports",
    color: "text-green-600",
  },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="space-y-4 py-6 flex flex-col h-full bg-white border-r border-gray-200">
      <div className="px-6 flex-1">
        <Link href="/dashboard" className="flex items-center mb-8">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center">
              <span className="text-white font-bold text-lg">HR</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">HR System</h1>
              <p className="text-xs text-muted-foreground">Management</p>
            </div>
          </div>
        </Link>
        <nav className="space-y-2">
          {routes.map((route) => {
            const isActive = pathname === route.href;
            return (
              <Link
                key={route.href}
                href={route.href}
                className={cn(
                  "group flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium text-sm transition-all",
                  isActive
                    ? "bg-gray-100 text-gray-900 shadow-sm"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                )}
              >
                <div
                  className={cn(
                    "flex items-center justify-center h-8 w-8 rounded-md transition-colors",
                    isActive
                      ? "bg-white shadow-sm"
                      : "group-hover:bg-white group-hover:shadow-sm"
                  )}
                >
                  <route.icon className={cn("h-4 w-4", route.color)} />
                </div>
                <span>{route.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>
      <div className="px-6 py-4 border-t border-gray-200">
        <div className="text-xs text-muted-foreground">
          <p className="font-medium">HR Management System</p>
          <p className="mt-1">Version 1.0.0</p>
        </div>
      </div>
    </div>
  );
}
