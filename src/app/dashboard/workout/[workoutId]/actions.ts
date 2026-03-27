"use server";

import { z } from "zod";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { updateWorkout } from "@/data/workouts";

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
