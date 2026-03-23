import { integer, numeric, pgTable, text, timestamp, varchar } from 'drizzle-orm/pg-core';

export const exercises = pgTable('exercises', {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  name: varchar({ length: 255 }).notNull().unique(),
  createdAt: timestamp().notNull().defaultNow(),
  updatedAt: timestamp().notNull().defaultNow(),
});

export const workouts = pgTable('workouts', {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  userId: text().notNull(),
  name: varchar({ length: 255 }),
  startedAt: timestamp().notNull().defaultNow(),
  completedAt: timestamp(),
  updatedAt: timestamp().notNull().defaultNow(),
});

export const workoutExercises = pgTable('workout_exercises', {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  workoutId: integer().notNull().references(() => workouts.id, { onDelete: 'cascade' }),
  exerciseId: integer().notNull().references(() => exercises.id),
  order: integer().notNull(),
  createdAt: timestamp().notNull().defaultNow(),
});

export const sets = pgTable('sets', {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  workoutExerciseId: integer().notNull().references(() => workoutExercises.id, { onDelete: 'cascade' }),
  setNumber: integer().notNull(),
  reps: integer(),
  weightKg: numeric({ precision: 6, scale: 2 }),
  createdAt: timestamp().notNull().defaultNow(),
});
