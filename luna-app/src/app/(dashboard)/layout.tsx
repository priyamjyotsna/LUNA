import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { LogPeriodFab } from "@/components/dashboard/LogPeriodButton";
import { PeriodLogProvider } from "@/components/dashboard/period-log-context";
import { AppSidebar } from "@/components/shared/AppSidebar";
import { MobileNavBar } from "@/components/shared/MobileNavBar";

export default async function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }

  return (
    <PeriodLogProvider>
      <div className="flex min-h-full flex-1">
        <AppSidebar className="hidden md:flex" />
        <main
          id="main-content"
          className="flex-1 overflow-auto p-4 pb-20 md:pb-6 md:p-6"
          tabIndex={-1}
        >
          {children}
        </main>
        <MobileNavBar />
        <LogPeriodFab />
      </div>
    </PeriodLogProvider>
  );
}
