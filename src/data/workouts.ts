import { and, eq, gte, lt } from "drizzle-orm";
import { startOfDay, endOfDay } from "date-fns";
import { db } from "@/db";
import { workouts, workoutExercises, exercises } from "@/db/schema";

export type WorkoutWithExercises = {
  id: number;
  name: string | null;
  startedAt: Date;
  completedAt: Date | null;
  exercises: string[];
};

export async function getWorkoutsForDate(
  userId: string,
  date: Date
): Promise<WorkoutWithExercises[]> {
  const rows = await db
    .select({
      workoutId: workouts.id,
      workoutName: workouts.name,
      startedAt: workouts.startedAt,
      completedAt: workouts.completedAt,
      exerciseName: exercises.name,
      exerciseOrder: workoutExercises.order,
    })
    .from(workouts)
    .leftJoin(workoutExercises, eq(workoutExercises.workoutId, workouts.id))
    .leftJoin(exercises, eq(exercises.id, workoutExercises.exerciseId))
    .where(
      and(
        eq(workouts.userId, userId),
        gte(workouts.startedAt, startOfDay(date)),
        lt(workouts.startedAt, endOfDay(date))
      )
    )
    .orderBy(workouts.startedAt, workoutExercises.order);

  const map = new Map<number, WorkoutWithExercises>();
  for (const row of rows) {
    if (!map.has(row.workoutId)) {
      map.set(row.workoutId, {
        id: row.workoutId,
        name: row.workoutName,
        startedAt: row.startedAt,
        completedAt: row.completedAt,
        exercises: [],
      });
    }
    if (row.exerciseName) {
      map.get(row.workoutId)!.exercises.push(row.exerciseName);
    }
  }

  return Array.from(map.values());
}

export async function getWorkoutById(userId: string, workoutId: number) {
  const [workout] = await db
    .select()
    .from(workouts)
    .where(and(eq(workouts.id, workoutId), eq(workouts.userId, userId)));
  return workout ?? null;
}

export async function updateWorkout(
  userId: string,
  workoutId: number,
  name: string | null,
  startedAt: Date
) {
  const [workout] = await db
    .update(workouts)
    .set({ name, startedAt })
    .where(and(eq(workouts.id, workoutId), eq(workouts.userId, userId)))
    .returning();
  return workout;
}

export async function createWorkout(
  userId: string,
  name: string | null,
  startedAt: Date
) {
  const [workout] = await db
    .insert(workouts)
    .values({ userId, name, startedAt })
    .returning();
  return workout;
}
