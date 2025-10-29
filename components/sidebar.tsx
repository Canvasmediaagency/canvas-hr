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
  Briefcase,
} from "lucide-react";

const routes = [
  {
    label: "Dashboard",
    icon: LayoutDashboard,
    href: "/dashboard",
    gradient: "from-blue-500 to-cyan-500",
  },
  {
    label: "พนักงาน",
    icon: Users,
    href: "/dashboard/employees",
    gradient: "from-blue-500 to-cyan-500",
  },
  {
    label: "จัดการวันลา",
    icon: Calendar,
    href: "/dashboard/leaves",
    gradient: "from-blue-500 to-cyan-500",
  },
  {
    label: "วันหยุดบริษัท",
    icon: CalendarDays,
    href: "/dashboard/holidays",
    gradient: "from-blue-500 to-cyan-500",
  },
  {
    label: "รายงานวันลา",
    icon: FileText,
    href: "/dashboard/reports",
    gradient: "from-blue-500 to-cyan-500",
  },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="space-y-4 py-6 flex flex-col h-full bg-linear-to-b from-slate-50 to-slate-100/50 border-r border-slate-200/60">
      <div className="px-5 flex-1">
        {/* Logo Section */}
        <Link href="/dashboard" className="flex items-center mb-10 group">
          <div className="flex items-center gap-3">
            <div className="relative h-12 w-12 rounded-xl bg-linear-to-br from-blue-600 via-purple-600 to-pink-600 flex items-center justify-center shadow-lg shadow-blue-500/30 group-hover:shadow-xl group-hover:shadow-blue-500/40 transition-all duration-300 group-hover:scale-105">
              <Briefcase className="h-6 w-6 text-white" strokeWidth={2.5} />
              <div className="absolute -inset-0.5 bg-linear-to-br from-blue-600 via-purple-600 to-pink-600 rounded-xl opacity-0 group-hover:opacity-20 blur transition-opacity duration-300" />
            </div>
            <div>
              <h1 className="text-xl font-bold bg-linear-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                HR System
              </h1>
              <p className="text-xs font-medium text-slate-500 tracking-wide">
                Management Portal
              </p>
            </div>
          </div>
        </Link>

        {/* Navigation */}
        <nav className="space-y-1.5">
          {routes.map((route) => {
            const isActive = pathname === route.href;
            return (
              <Link
                key={route.href}
                href={route.href}
                className={cn(
                  "group relative flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-sm transition-all duration-200",
                  isActive
                    ? "bg-white text-slate-900 shadow-md shadow-slate-200/60"
                    : "text-slate-600 hover:bg-white/60 hover:text-slate-900"
                )}
              >
                {/* Active Indicator */}
                {isActive && (
                  <div className={cn(
                    "absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 rounded-r-full bg-linear-to-b",
                    route.gradient
                  )} />
                )}

                {/* Icon Container */}
                <div className="relative">
                  <div
                    className={cn(
                      "flex items-center justify-center h-9 w-9 rounded-lg transition-all duration-200",
                      isActive
                        ? cn("bg-linear-to-br shadow-sm", route.gradient)
                        : "bg-slate-100 group-hover:bg-slate-200"
                    )}
                  >
                    <route.icon
                      className={cn(
                        "h-[18px] w-[18px] transition-colors",
                        isActive ? "text-white" : "text-slate-600 group-hover:text-slate-900"
                      )}
                      strokeWidth={2.5}
                    />
                  </div>
                  {isActive && (
                    <div className={cn(
                      "absolute inset-0 rounded-lg bg-linear-to-br opacity-40 blur-md",
                      route.gradient
                    )} />
                  )}
                </div>

                <span className="relative z-10">{route.label}</span>

                {/* Hover Effect */}
                {!isActive && (
                  <div className="absolute inset-0 rounded-xl bg-linear-to-r from-transparent via-slate-100/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Footer */}
      <div className="px-5 py-4 mx-3 rounded-xl bg-white/60 backdrop-blur-sm border border-slate-200/60">
        <div className="text-xs text-slate-600">
          <p className="font-semibold text-slate-700">HR Management System</p>
          <p className="mt-1 text-slate-500">Version 1.0.0</p>
        </div>
      </div>
    </div>
  );
}
