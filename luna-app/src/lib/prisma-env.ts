/**
 * Prisma schema uses LUNA_DATABASE_URL. Neon/Vercel templates often set DATABASE_URL or POSTGRES_PRISMA_URL only.
 * Call before `new PrismaClient()` (see db.ts).
 */
export function ensurePrismaDatabaseUrl(): void {
  if (typeof process === "undefined") return;
  if (process.env.LUNA_DATABASE_URL) return;
  const fromAlt =
    process.env.DATABASE_URL ??
    process.env.POSTGRES_PRISMA_URL ??
    process.env.POSTGRES_URL;
  if (fromAlt?.startsWith("postgres")) {
    process.env.LUNA_DATABASE_URL = fromAlt;
  }
}
