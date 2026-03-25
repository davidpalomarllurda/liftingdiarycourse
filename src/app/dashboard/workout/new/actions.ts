"use server";

import { z } from "zod";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { createWorkout } from "@/data/workouts";

const CreateWorkoutSchema = z.object({
  name: z.string().max(255),
  startedAt: z.date(),
});

export async function createWorkoutAction(input: {
  name: string;
  startedAt: Date;
}) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthenticated");

  const parsed = CreateWorkoutSchema.parse(input);
  const workout = await createWorkout(userId, parsed.name || null, parsed.startedAt);
  revalidatePath("/dashboard");
  return workout;
}
