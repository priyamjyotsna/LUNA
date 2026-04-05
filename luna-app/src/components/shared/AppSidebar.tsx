"use client";

import Link from "next/link";
import { CalendarDays, LayoutDashboard, LineChart, LogOut, Settings, SmilePlus } from "lucide-react";
import { signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { SidebarLogPeriodButton } from "@/components/dashboard/SidebarLogPeriodButton";
import { cn } from "@/lib/utils";

const nav = [
  { href: "/", label: "Today", icon: LayoutDashboard },
  { href: "/calendar", label: "Calendar", icon: CalendarDays },
  { href: "/insights", label: "Insights", icon: LineChart },
  { href: "/symptoms", label: "Symptoms", icon: SmilePlus },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function AppSidebar({ className }: { className?: string }) {
  return (
    <aside
      className={cn(
        "flex w-56 shrink-0 flex-col border-r border-border bg-sidebar py-6",
        className,
      )}
      aria-label="Main navigation"
    >
      <div className="px-4 pb-6">
        <Link href="/" className="font-display text-2xl font-semibold tracking-tight text-primary">
          Luna
        </Link>
        <p className="mt-1 text-xs text-muted-foreground">Your body&apos;s rhythm, understood.</p>
      </div>
      <SidebarLogPeriodButton />
      <nav className="flex flex-1 flex-col gap-1 px-2">
        {nav.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className="flex items-center gap-2 rounded-md px-3 py-2 text-sm text-sidebar-foreground hover:bg-sidebar-accent"
          >
            <Icon className="size-4 opacity-80" aria-hidden />
            {label}
          </Link>
        ))}
      </nav>
      <div className="border-t border-sidebar-border px-2 pt-4">
        <Button
          type="button"
          variant="ghost"
          className="w-full justify-start gap-2 text-muted-foreground"
          onClick={() => signOut({ callbackUrl: "/login" })}
        >
          <LogOut className="size-4" aria-hidden />
          Sign out
        </Button>
      </div>
    </aside>
  );
}
