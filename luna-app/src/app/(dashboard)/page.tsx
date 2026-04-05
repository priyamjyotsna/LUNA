import { redirect } from "next/navigation";
import { DashboardPredictionCard } from "@/components/dashboard/DashboardPredictionCard";
import { PeriodHistory } from "@/components/dashboard/PeriodHistory";
import { SectionErrorBoundary } from "@/components/shared/SectionErrorBoundary";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export default async function DashboardPage() {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { name: true },
  });

  if (!user) {
    return <p className="text-muted-foreground">Profile not found.</p>;
  }

  return (
    <div className="mx-auto max-w-6xl space-y-8 px-0">
      <header>
        <h1 className="font-display text-3xl font-semibold text-foreground">
          Hello{user.name ? `, ${user.name}` : ""}
        </h1>
        <p className="mt-1 text-muted-foreground">
          Your focus for today, cycle snapshot, and history — all in one place.
        </p>
      </header>

      <SectionErrorBoundary title="Dashboard could not be shown">
        <DashboardPredictionCard />
      </SectionErrorBoundary>

      <SectionErrorBoundary title="Period history could not be shown">
        <PeriodHistory />
      </SectionErrorBoundary>
    </div>
  );
}
