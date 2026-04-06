-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateTable
CREATE TABLE "Account" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "sessionToken" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VerificationToken" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "email" TEXT,
    "emailVerified" TIMESTAMP(3),
    "image" TEXT,
    "password" TEXT,
    "dateOfBirth" TIMESTAMP(3),
    "averageCycleLen" INTEGER NOT NULL DEFAULT 28,
    "lutealPhaseLen" INTEGER NOT NULL DEFAULT 14,
    "periodDuration" INTEGER NOT NULL DEFAULT 5,
    "mode" TEXT NOT NULL DEFAULT 'avoid',
    "notificationsOn" BOOLEAN NOT NULL DEFAULT true,
    "pushSubscription" TEXT,
    "theme" TEXT NOT NULL DEFAULT 'light',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PeriodLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "periodStart" TIMESTAMP(3) NOT NULL,
    "periodEnd" TIMESTAMP(3),
    "cycleLength" INTEGER,
    "flowIntensity" TEXT,
    "flowUserEntered" BOOLEAN NOT NULL DEFAULT false,
    "isAnomaly" BOOLEAN NOT NULL DEFAULT false,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PeriodLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SymptomLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "logDate" TIMESTAMP(3) NOT NULL,
    "cycleDay" INTEGER,
    "phase" TEXT,
    "cramps" INTEGER,
    "headache" BOOLEAN NOT NULL DEFAULT false,
    "bloating" BOOLEAN NOT NULL DEFAULT false,
    "nausea" BOOLEAN NOT NULL DEFAULT false,
    "backPain" BOOLEAN NOT NULL DEFAULT false,
    "breastTenderness" BOOLEAN NOT NULL DEFAULT false,
    "fatigue" BOOLEAN NOT NULL DEFAULT false,
    "acne" BOOLEAN NOT NULL DEFAULT false,
    "mood" TEXT,
    "energyLevel" INTEGER,
    "anxietyLevel" INTEGER,
    "libido" INTEGER,
    "sleepHours" DOUBLE PRECISION,
    "exercised" BOOLEAN NOT NULL DEFAULT false,
    "stressLevel" INTEGER,
    "waterIntake" DOUBLE PRECISION,
    "cervicalMucus" TEXT,
    "spotting" BOOLEAN NOT NULL DEFAULT false,
    "bbt" DOUBLE PRECISION,
    "ovulationPain" BOOLEAN NOT NULL DEFAULT false,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SymptomLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Account_provider_providerAccountId_key" ON "Account"("provider", "providerAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "Session_sessionToken_key" ON "Session"("sessionToken");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_token_key" ON "VerificationToken"("token");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_identifier_token_key" ON "VerificationToken"("identifier", "token");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "PeriodLog_userId_periodStart_idx" ON "PeriodLog"("userId", "periodStart");

-- CreateIndex
CREATE INDEX "SymptomLog_userId_logDate_idx" ON "SymptomLog"("userId", "logDate");

-- CreateIndex
CREATE UNIQUE INDEX "SymptomLog_userId_logDate_key" ON "SymptomLog"("userId", "logDate");

-- AddForeignKey
ALTER TABLE "Account" ADD CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PeriodLog" ADD CONSTRAINT "PeriodLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SymptomLog" ADD CONSTRAINT "SymptomLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
