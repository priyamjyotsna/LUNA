/**
 * Prisma schema reads DATABASE_URL (Neon/Vercel default).
 * If you only set LUNA_DATABASE_URL or POSTGRES_PRISMA_URL, copy into DATABASE_URL before PrismaClient is created.
 */
export function ensurePrismaDatabaseUrl(): void {
  if (typeof process === "undefined") return;
  if (process.env.DATABASE_URL?.startsWith("postgres")) return;

  const fromAlt =
    process.env.LUNA_DATABASE_URL ??
    process.env.POSTGRES_PRISMA_URL ??
    process.env.POSTGRES_URL;

  if (fromAlt?.startsWith("postgres")) {
    process.env.DATABASE_URL = fromAlt;
  }
}
