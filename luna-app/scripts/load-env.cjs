/**
 * Load `.env.local` then `.env` so Prisma CLI sees `LUNA_DATABASE_URL` locally.
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

/* After dotenv: align with Prisma schema (LUNA_DATABASE_URL). */
if (!process.env.LUNA_DATABASE_URL && process.env.DATABASE_URL?.startsWith("postgres")) {
  process.env.LUNA_DATABASE_URL = process.env.DATABASE_URL;
}
