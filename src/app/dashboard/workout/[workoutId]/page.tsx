import { notFound } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { getWorkoutWithExercisesAndSets } from "@/data/workouts";
import { getAllExercises } from "@/data/exercises";
import { EditWorkoutForm } from "./_components/edit-workout-form";
import { ExerciseCard } from "./_components/exercise-card";
import { AddExerciseControl } from "./_components/add-exercise-control";

type Props = {
  params: Promise<{ workoutId: string }>;
};

export default async function WorkoutPage({ params }: Props) {
  const { workoutId } = await params;
  const { userId } = await auth();
  if (!userId) return notFound();

  const [workout, availableExercises] = await Promise.all([
    getWorkoutWithExercisesAndSets(userId, Number(workoutId)),
    getAllExercises(),
  ]);
  if (!workout) return notFound();

  return (
    <main className="max-w-2xl mx-auto px-8 py-16 space-y-8">
      <EditWorkoutForm
        workoutId={workout.id}
        defaultName={workout.name}
        defaultStartedAt={workout.startedAt}
      />
      <section className="space-y-4">
        <h2 className="text-lg font-semibold">Exercises</h2>
        {workout.workoutExercises.map((we) => (
          <ExerciseCard key={we.workoutExerciseId} workoutId={workout.id} workoutExercise={we} />
        ))}
        <AddExerciseControl
          workoutId={workout.id}
          availableExercises={availableExercises}
          addedExerciseIds={workout.workoutExercises.map((we) => we.exerciseId)}
        />
      </section>
    </main>
  );
}
