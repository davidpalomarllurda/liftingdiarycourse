import { and, eq, gte, lt } from "drizzle-orm";
import { startOfDay, endOfDay } from "date-fns";
import { db } from "@/db";
import { workouts, workoutExercises, exercises, sets } from "@/db/schema";

export type SetRow = {
  id: number;
  workoutExerciseId: number;
  setNumber: number;
  reps: number | null;
  weightKg: string | null;
};

export type WorkoutExerciseWithSets = {
  workoutExerciseId: number;
  exerciseId: number;
  exerciseName: string;
  order: number;
  sets: SetRow[];
};

export type WorkoutDetail = {
  id: number;
  name: string | null;
  startedAt: Date;
  completedAt: Date | null;
  workoutExercises: WorkoutExerciseWithSets[];
};

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

export async function getWorkoutWithExercisesAndSets(
  userId: string,
  workoutId: number
): Promise<WorkoutDetail | null> {
  const rows = await db
    .select({
      workoutId: workouts.id,
      workoutName: workouts.name,
      startedAt: workouts.startedAt,
      completedAt: workouts.completedAt,
      workoutExerciseId: workoutExercises.id,
      exerciseId: exercises.id,
      exerciseName: exercises.name,
      exerciseOrder: workoutExercises.order,
      setId: sets.id,
      setWorkoutExerciseId: sets.workoutExerciseId,
      setNumber: sets.setNumber,
      reps: sets.reps,
      weightKg: sets.weightKg,
    })
    .from(workouts)
    .leftJoin(workoutExercises, eq(workoutExercises.workoutId, workouts.id))
    .leftJoin(exercises, eq(exercises.id, workoutExercises.exerciseId))
    .leftJoin(sets, eq(sets.workoutExerciseId, workoutExercises.id))
    .where(and(eq(workouts.id, workoutId), eq(workouts.userId, userId)))
    .orderBy(workoutExercises.order, sets.setNumber);

  if (rows.length === 0) return null;

  const first = rows[0];
  const exerciseMap = new Map<number, WorkoutExerciseWithSets>();

  const detail: WorkoutDetail = {
    id: first.workoutId,
    name: first.workoutName,
    startedAt: first.startedAt,
    completedAt: first.completedAt,
    workoutExercises: [],
  };

  for (const row of rows) {
    if (!row.workoutExerciseId || !row.exerciseId || !row.exerciseName) continue;

    if (!exerciseMap.has(row.workoutExerciseId)) {
      const we: WorkoutExerciseWithSets = {
        workoutExerciseId: row.workoutExerciseId,
        exerciseId: row.exerciseId,
        exerciseName: row.exerciseName,
        order: row.exerciseOrder!,
        sets: [],
      };
      exerciseMap.set(row.workoutExerciseId, we);
      detail.workoutExercises.push(we);
    }

    if (row.setId) {
      exerciseMap.get(row.workoutExerciseId)!.sets.push({
        id: row.setId,
        workoutExerciseId: row.setWorkoutExerciseId!,
        setNumber: row.setNumber!,
        reps: row.reps,
        weightKg: row.weightKg,
      });
    }
  }

  return detail;
}
