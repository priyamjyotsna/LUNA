import type { SymptomLog } from "@prisma/client";

export type SymptomLogDTO = {
  id: string;
  userId: string;
  logDate: string;
  cycleDay: number | null;
  phase: string | null;
  cramps: number | null;
  headache: boolean;
  bloating: boolean;
  nausea: boolean;
  backPain: boolean;
  breastTenderness: boolean;
  fatigue: boolean;
  acne: boolean;
  mood: string | null;
  energyLevel: number | null;
  anxietyLevel: number | null;
  libido: number | null;
  sleepHours: number | null;
  exercised: boolean;
  stressLevel: number | null;
  waterIntake: number | null;
  cervicalMucus: string | null;
  spotting: boolean;
  bbt: number | null;
  ovulationPain: boolean;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
};

export function toSymptomLogDTO(row: SymptomLog): SymptomLogDTO {
  return {
    id: row.id,
    userId: row.userId,
    logDate: row.logDate.toISOString(),
    cycleDay: row.cycleDay,
    phase: row.phase,
    cramps: row.cramps,
    headache: row.headache,
    bloating: row.bloating,
    nausea: row.nausea,
    backPain: row.backPain,
    breastTenderness: row.breastTenderness,
    fatigue: row.fatigue,
    acne: row.acne,
    mood: row.mood,
    energyLevel: row.energyLevel,
    anxietyLevel: row.anxietyLevel,
    libido: row.libido,
    sleepHours: row.sleepHours,
    exercised: row.exercised,
    stressLevel: row.stressLevel,
    waterIntake: row.waterIntake,
    cervicalMucus: row.cervicalMucus,
    spotting: row.spotting,
    bbt: row.bbt,
    ovulationPain: row.ovulationPain,
    notes: row.notes,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}
