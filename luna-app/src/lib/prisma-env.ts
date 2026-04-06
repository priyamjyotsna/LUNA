/**
 * Prisma reads DATABASE_URL. Neon’s Vercel integration may expose POSTGRES_PRISMA_URL / POSTGRES_URL
 * before DATABASE_URL is normalized—copy into DATABASE_URL when needed.
 */
export function ensurePrismaDatabaseUrl(): void {
  if (typeof process === "undefined") return;
  if (process.env.DATABASE_URL?.startsWith("postgres")) return;

  const fromAlt =
    process.env.POSTGRES_PRISMA_URL ?? process.env.POSTGRES_URL;

  if (fromAlt?.startsWith("postgres")) {
    process.env.DATABASE_URL = fromAlt;
  }
}
