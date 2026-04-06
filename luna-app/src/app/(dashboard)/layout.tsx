import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { auth, signOut } from "@/lib/auth";
import { prisma } from "@/lib/db";
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
  if (!session?.user?.id) {
    redirect("/login");
  }

  const dbUser = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { id: true },
  });
  if (!dbUser) {
    await signOut({ redirectTo: "/login?session=stale" });
  }

  return (
    <PeriodLogProvider>
      <div className="flex min-h-full flex-1">
        <AppSidebar className="hidden md:flex" />
        <main
          id="main-content"
          className="flex-1 overflow-auto p-4 pb-[max(5.5rem,calc(4.5rem+env(safe-area-inset-bottom,0px)))] md:pb-6 md:p-6"
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
