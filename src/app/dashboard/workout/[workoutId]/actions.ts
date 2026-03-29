"use server";

import { z } from "zod";
import { count, eq } from "drizzle-orm";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { workoutExercises } from "@/db/schema";
import { updateWorkout, getWorkoutById } from "@/data/workouts";
import { addExerciseToWorkout, removeExerciseFromWorkout } from "@/data/exercises";
import { addSet, deleteSet } from "@/data/sets";

const UpdateWorkoutSchema = z.object({
  name: z.string().max(255),
  startedAt: z.date(),
});

export async function updateWorkoutAction(
  workoutId: number,
  input: { name: string; startedAt: Date }
) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthenticated");

  const parsed = UpdateWorkoutSchema.parse(input);
  const workout = await updateWorkout(userId, workoutId, parsed.name || null, parsed.startedAt);
  revalidatePath("/dashboard");
  return workout;
}

const AddExerciseSchema = z.object({
  exerciseId: z.number().int().positive(),
});

export async function addExerciseToWorkoutAction(
  workoutId: number,
  input: { exerciseId: number }
) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthenticated");

  const parsed = AddExerciseSchema.parse(input);

  const workout = await getWorkoutById(userId, workoutId);
  if (!workout) throw new Error("Forbidden");

  const [{ value: orderCount }] = await db
    .select({ value: count() })
    .from(workoutExercises)
    .where(eq(workoutExercises.workoutId, workoutId));
  const order = Number(orderCount) + 1;

  const workoutExercise = await addExerciseToWorkout(workoutId, parsed.exerciseId, order);
  revalidatePath(`/dashboard/workout/${workoutId}`);
  return workoutExercise;
}

const RemoveExerciseSchema = z.object({
  workoutExerciseId: z.number().int().positive(),
});

export async function removeExerciseFromWorkoutAction(
  workoutId: number,
  input: { workoutExerciseId: number }
) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthenticated");

  const parsed = RemoveExerciseSchema.parse(input);
  await removeExerciseFromWorkout(userId, parsed.workoutExerciseId);
  revalidatePath(`/dashboard/workout/${workoutId}`);
}

const AddSetSchema = z.object({
  workoutExerciseId: z.number().int().positive(),
  reps: z.number().int().min(1).nullable(),
  weightKg: z.string().regex(/^\d{1,4}(\.\d{1,2})?$/).nullable(),
});

export async function addSetAction(
  workoutId: number,
  input: { workoutExerciseId: number; reps: number | null; weightKg: string | null }
) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthenticated");

  const parsed = AddSetSchema.parse(input);
  const set = await addSet(userId, parsed.workoutExerciseId, parsed.reps, parsed.weightKg);
  revalidatePath(`/dashboard/workout/${workoutId}`);
  return set;
}

const DeleteSetSchema = z.object({
  setId: z.number().int().positive(),
});

export async function deleteSetAction(
  workoutId: number,
  input: { setId: number }
) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthenticated");

  const parsed = DeleteSetSchema.parse(input);
  await deleteSet(userId, parsed.setId);
  revalidatePath(`/dashboard/workout/${workoutId}`);
}
