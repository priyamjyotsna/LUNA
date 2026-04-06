/**
 * One-off: copy data from legacy local SQLite (prisma/dev.db) into PostgreSQL (DATABASE_URL).
 *
 * Run from `luna-app/`:
 *   npx dotenv -e .env.local -- npx tsx prisma/import-sqlite-to-postgres.ts
 *
 * Optional: SQLITE_PATH=/path/to.db
 *
 * Uses createMany + skipDuplicates so re-runs are safe if some rows already exist.
 */

import Database from "better-sqlite3";
import { PrismaClient } from "@prisma/client";
import path from "node:path";
import { ensurePrismaDatabaseUrl } from "@/lib/prisma-env";

const sqlitePath =
  process.env.SQLITE_PATH ?? path.join(process.cwd(), "prisma", "dev.db");

function parseDate(v: unknown): Date | null {
  if (v == null || v === "") return null;
  if (typeof v === "number" && Number.isFinite(v)) {
    const d = new Date(v);
    return Number.isNaN(d.getTime()) ? null : d;
  }
  const d = new Date(String(v));
  return Number.isNaN(d.getTime()) ? null : d;
}

function requiredDate(v: unknown, label: string): Date {
  const d = parseDate(v);
  if (!d) throw new Error(`Invalid date for ${label}`);
  return d;
}

function parseBool(v: unknown): boolean {
  return v === true || v === 1 || v === "1";
}

function parseFloatOrNull(v: unknown): number | null {
  if (v == null || v === "") return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

function parseIntOrNull(v: unknown): number | null {
  if (v == null || v === "") return null;
  const n = Number(v);
  return Number.isFinite(n) ? Math.trunc(n) : null;
}

async function main() {
  ensurePrismaDatabaseUrl();
  const pgUrl = process.env.DATABASE_URL ?? "";
  if (!pgUrl.startsWith("postgres")) {
    console.error(
      "Set DATABASE_URL or LUNA_DATABASE_URL to a PostgreSQL connection string in .env.local.",
    );
    process.exit(1);
  }

  const prisma = new PrismaClient();

  let sqlite: Database.Database;
  try {
    sqlite = new Database(sqlitePath, { readonly: true, fileMustExist: true });
  } catch {
    console.error(`SQLite file not found or unreadable: ${sqlitePath}`);
    process.exit(1);
  }

  const users = sqlite.prepare("SELECT * FROM User").all() as Record<
    string,
    unknown
  >[];
  const accounts = sqlite.prepare("SELECT * FROM Account").all() as Record<
    string,
    unknown
  >[];
  const sessions = sqlite.prepare("SELECT * FROM Session").all() as Record<
    string,
    unknown
  >[];
  const verificationTokens = sqlite
    .prepare("SELECT * FROM VerificationToken")
    .all() as Record<string, unknown>[];
  const periodLogs = sqlite.prepare("SELECT * FROM PeriodLog").all() as Record<
    string,
    unknown
  >[];
  const symptomLogs = sqlite.prepare("SELECT * FROM SymptomLog").all() as Record<
    string,
    unknown
  >[];

  console.log(
    `Importing from SQLite (${sqlitePath}): User=${users.length}, Account=${accounts.length}, Session=${sessions.length}, VerificationToken=${verificationTokens.length}, PeriodLog=${periodLogs.length}, SymptomLog=${symptomLogs.length}`,
  );

  await prisma.$transaction(async (tx) => {
    if (users.length) {
      await tx.user.createMany({
        data: users.map((row) => ({
          id: String(row.id),
          name: row.name != null ? String(row.name) : null,
          email: row.email != null ? String(row.email) : null,
          emailVerified: parseDate(row.emailVerified),
          image: row.image != null ? String(row.image) : null,
          password: row.password != null ? String(row.password) : null,
          dateOfBirth: parseDate(row.dateOfBirth),
          averageCycleLen: Number(row.averageCycleLen ?? 28),
          lutealPhaseLen: Number(row.lutealPhaseLen ?? 14),
          periodDuration: Number(row.periodDuration ?? 5),
          mode: String(row.mode ?? "avoid"),
          notificationsOn: parseBool(row.notificationsOn ?? true),
          pushSubscription:
            row.pushSubscription != null ? String(row.pushSubscription) : null,
          theme: String(row.theme ?? "light"),
          createdAt: parseDate(row.createdAt) ?? new Date(),
          updatedAt: parseDate(row.updatedAt) ?? new Date(),
        })),
        skipDuplicates: true,
      });
    }

    if (accounts.length) {
      await tx.account.createMany({
        data: accounts.map((row) => ({
          id: String(row.id),
          userId: String(row.userId),
          type: String(row.type),
          provider: String(row.provider),
          providerAccountId: String(row.providerAccountId),
          refresh_token:
            row.refresh_token != null ? String(row.refresh_token) : null,
          access_token:
            row.access_token != null ? String(row.access_token) : null,
          expires_at: parseIntOrNull(row.expires_at),
          token_type: row.token_type != null ? String(row.token_type) : null,
          scope: row.scope != null ? String(row.scope) : null,
          id_token: row.id_token != null ? String(row.id_token) : null,
          session_state:
            row.session_state != null ? String(row.session_state) : null,
        })),
        skipDuplicates: true,
      });
    }

    if (sessions.length) {
      await tx.session.createMany({
        data: sessions.map((row) => ({
          id: String(row.id),
          sessionToken: String(row.sessionToken),
          userId: String(row.userId),
          expires: requiredDate(row.expires, "Session.expires"),
        })),
        skipDuplicates: true,
      });
    }

    if (verificationTokens.length) {
      await tx.verificationToken.createMany({
        data: verificationTokens.map((row) => ({
          identifier: String(row.identifier),
          token: String(row.token),
          expires: requiredDate(row.expires, "VerificationToken.expires"),
        })),
        skipDuplicates: true,
      });
    }

    if (periodLogs.length) {
      await tx.periodLog.createMany({
        data: periodLogs.map((row) => ({
          id: String(row.id),
          userId: String(row.userId),
          periodStart: requiredDate(row.periodStart, "PeriodLog.periodStart"),
          periodEnd: parseDate(row.periodEnd),
          cycleLength: parseIntOrNull(row.cycleLength),
          flowIntensity:
            row.flowIntensity != null ? String(row.flowIntensity) : null,
          flowUserEntered: parseBool(row.flowUserEntered ?? false),
          isAnomaly: parseBool(row.isAnomaly ?? false),
          notes: row.notes != null ? String(row.notes) : null,
          createdAt: parseDate(row.createdAt) ?? new Date(),
          updatedAt: parseDate(row.updatedAt) ?? new Date(),
        })),
        skipDuplicates: true,
      });
    }

    if (symptomLogs.length) {
      await tx.symptomLog.createMany({
        data: symptomLogs.map((row) => ({
          id: String(row.id),
          userId: String(row.userId),
          logDate: requiredDate(row.logDate, "SymptomLog.logDate"),
          cycleDay: parseIntOrNull(row.cycleDay),
          phase: row.phase != null ? String(row.phase) : null,
          cramps: parseIntOrNull(row.cramps),
          headache: parseBool(row.headache ?? false),
          bloating: parseBool(row.bloating ?? false),
          nausea: parseBool(row.nausea ?? false),
          backPain: parseBool(row.backPain ?? false),
          breastTenderness: parseBool(row.breastTenderness ?? false),
          fatigue: parseBool(row.fatigue ?? false),
          acne: parseBool(row.acne ?? false),
          mood: row.mood != null ? String(row.mood) : null,
          energyLevel: parseIntOrNull(row.energyLevel),
          anxietyLevel: parseIntOrNull(row.anxietyLevel),
          libido: parseIntOrNull(row.libido),
          sleepHours: parseFloatOrNull(row.sleepHours),
          exercised: parseBool(row.exercised ?? false),
          stressLevel: parseIntOrNull(row.stressLevel),
          waterIntake: parseFloatOrNull(row.waterIntake),
          cervicalMucus:
            row.cervicalMucus != null ? String(row.cervicalMucus) : null,
          spotting: parseBool(row.spotting ?? false),
          bbt: parseFloatOrNull(row.bbt),
          ovulationPain: parseBool(row.ovulationPain ?? false),
          notes: row.notes != null ? String(row.notes) : null,
          createdAt: parseDate(row.createdAt) ?? new Date(),
          updatedAt: parseDate(row.updatedAt) ?? new Date(),
        })),
        skipDuplicates: true,
      });
    }
  });

  sqlite.close();
  console.log("Import finished.");
  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
