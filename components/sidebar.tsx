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
  },
  {
    label: "พนักงาน",
    icon: Users,
    href: "/dashboard/employees",
  },
  {
    label: "จัดการวันลา",
    icon: Calendar,
    href: "/dashboard/leaves",
  },
  {
    label: "วันหยุดบริษัท",
    icon: CalendarDays,
    href: "/dashboard/holidays",
  },
  {
    label: "รายงานวันลา",
    icon: FileText,
    href: "/dashboard/reports",
  },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="flex flex-col h-full bg-linear-to-b from-slate-800 via-slate-700 to-slate-900">
      {/* Logo Section */}
      <div className="p-6 flex items-center justify-center border-b border-white/10">
        <div className="h-12 w-12 rounded-2xl bg-white/95 flex items-center justify-center shadow-lg">
          <div className="text-2xl font-bold bg-linear-to-br from-slate-700 to-slate-900 bg-clip-text text-transparent">
            HR
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-8 px-4">
        <div className="space-y-3">
          {routes.map((route) => {
            const isActive = pathname === route.href;
            return (
              <Link
                key={route.href}
                href={route.href}
                className={cn(
                  "group relative flex flex-col items-center justify-center gap-2 py-4 px-3 rounded-2xl transition-all duration-200",
                  isActive
                    ? "bg-white/95 shadow-lg"
                    : "hover:bg-white/10"
                )}
                title={route.label}
              >
                <div
                  className={cn(
                    "flex items-center justify-center transition-all duration-200",
                  )}
                >
                  <route.icon
                    className={cn(
                      "h-6 w-6 transition-colors",
                      isActive ? "text-slate-700" : "text-white"
                    )}
                    strokeWidth={2}
                  />
                </div>
                <span
                  className={cn(
                    "text-xs font-semibold tracking-wide transition-colors",
                    isActive ? "text-slate-700" : "text-white/80"
                  )}
                >
                  {route.label}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Bottom Actions */}
      <div className="p-4 space-y-3 border-t border-white/10">
        <p className="text-xs text-center text-white/70">
         @ Canvas
        </p>
        <p className="text-[10px] text-center text-white/70">
          Developed by Folk
        </p>
      </div>
    </div>
  );
}
