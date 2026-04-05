"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CalendarDays, LayoutDashboard, LineChart, Settings, SmilePlus } from "lucide-react";
import { cn } from "@/lib/utils";

const nav = [
  { href: "/", label: "Today", icon: LayoutDashboard },
  { href: "/calendar", label: "Calendar", icon: CalendarDays },
  { href: "/insights", label: "Insights", icon: LineChart },
  { href: "/symptoms", label: "Symptoms", icon: SmilePlus },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function MobileNavBar() {
  const pathname = usePathname();

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 flex border-t border-border bg-card/95 px-1 py-2 backdrop-blur-md md:hidden"
      aria-label="Mobile navigation"
    >
      {nav.map(({ href, label, icon: Icon }) => {
        const active = pathname === href || (href !== "/" && pathname.startsWith(href));
        return (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex min-w-0 flex-1 flex-col items-center gap-0.5 rounded-md px-1 py-1 text-[10px] text-muted-foreground",
              active && "text-primary",
            )}
          >
            <Icon className="size-5 shrink-0" aria-hidden />
            <span className="truncate">{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
