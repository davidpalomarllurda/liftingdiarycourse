import { and, count, eq, inArray } from "drizzle-orm";
import { db } from "@/db";
import { sets, workoutExercises, workouts } from "@/db/schema";

export async function addSet(
  userId: string,
  workoutExerciseId: number,
  reps: number | null,
  weightKg: string | null
) {
  const [ownerCheck] = await db
    .select({ id: workoutExercises.id })
    .from(workoutExercises)
    .innerJoin(workouts, eq(workouts.id, workoutExercises.workoutId))
    .where(
      and(
        eq(workoutExercises.id, workoutExerciseId),
        eq(workouts.userId, userId)
      )
    );
  if (!ownerCheck) throw new Error("Forbidden");

  const [{ value: setCount }] = await db
    .select({ value: count() })
    .from(sets)
    .where(eq(sets.workoutExerciseId, workoutExerciseId));

  const setNumber = Number(setCount) + 1;

  const [set] = await db
    .insert(sets)
    .values({ workoutExerciseId, setNumber, reps, weightKg })
    .returning();
  return set;
}

export async function deleteSet(userId: string, setId: number) {
  await db.delete(sets).where(
    and(
      eq(sets.id, setId),
      inArray(
        sets.workoutExerciseId,
        db
          .select({ id: workoutExercises.id })
          .from(workoutExercises)
          .innerJoin(workouts, eq(workouts.id, workoutExercises.workoutId))
          .where(eq(workouts.userId, userId))
      )
    )
  );
}
