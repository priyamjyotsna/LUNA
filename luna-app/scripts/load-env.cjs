/**
 * Load `.env.local` then `.env` so Prisma CLI sees env vars locally.
 * Does not override variables already set (e.g. Vercel-injected env).
 */
const fs = require("fs");
const path = require("path");
const dotenv = require("dotenv");

const root = path.join(__dirname, "..");
const envLocal = path.join(root, ".env.local");
const envFile = path.join(root, ".env");

if (fs.existsSync(envLocal)) {
  dotenv.config({ path: envLocal });
}
if (fs.existsSync(envFile)) {
  dotenv.config({ path: envFile });
}

if (!process.env.DATABASE_URL?.startsWith("postgres")) {
  const u =
    process.env.POSTGRES_PRISMA_URL ?? process.env.POSTGRES_URL;
  if (u?.startsWith("postgres")) {
    process.env.DATABASE_URL = u;
  }
}
