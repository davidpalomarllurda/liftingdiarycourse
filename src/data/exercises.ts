import { and, asc, eq, inArray } from "drizzle-orm";
import { db } from "@/db";
import { exercises, workoutExercises, workouts } from "@/db/schema";

export type ExerciseOption = { id: number; name: string };

export async function getAllExercises(): Promise<ExerciseOption[]> {
  return db
    .select({ id: exercises.id, name: exercises.name })
    .from(exercises)
    .orderBy(asc(exercises.name));
}

export async function addExerciseToWorkout(
  workoutId: number,
  exerciseId: number,
  order: number
) {
  const [workoutExercise] = await db
    .insert(workoutExercises)
    .values({ workoutId, exerciseId, order })
    .returning();
  return workoutExercise;
}

export async function removeExerciseFromWorkout(
  userId: string,
  workoutExerciseId: number
) {
  await db
    .delete(workoutExercises)
    .where(
      and(
        eq(workoutExercises.id, workoutExerciseId),
        inArray(
          workoutExercises.workoutId,
          db
            .select({ id: workouts.id })
            .from(workouts)
            .where(eq(workouts.userId, userId))
        )
      )
    );
}
