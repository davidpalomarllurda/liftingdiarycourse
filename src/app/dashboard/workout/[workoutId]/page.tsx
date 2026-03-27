import { notFound } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { getWorkoutById } from "@/data/workouts";
import { EditWorkoutForm } from "./_components/edit-workout-form";

type Props = {
  params: Promise<{ workoutId: string }>;
};

export default async function EditWorkoutPage({ params }: Props) {
  const { workoutId } = await params;
  const { userId } = await auth();
  if (!userId) return notFound();

  const workout = await getWorkoutById(userId, Number(workoutId));
  if (!workout) return notFound();

  return (
    <main className="flex justify-center px-8 py-16">
      <EditWorkoutForm
        workoutId={workout.id}
        defaultName={workout.name}
        defaultStartedAt={workout.startedAt}
      />
    </main>
  );
}
