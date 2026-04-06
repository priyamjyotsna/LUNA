export async function register() {
  if (process.env.NEXT_RUNTIME === "edge") return;
  const { ensurePrismaDatabaseUrl } = await import("./lib/prisma-env");
  ensurePrismaDatabaseUrl();
}
