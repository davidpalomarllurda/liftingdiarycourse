import { auth } from "@clerk/nextjs/server";
import { format, parseISO } from "date-fns";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CalendarPicker } from "./_components/calendar-picker";
import { NewWorkoutLink } from "./_components/new-workout-link";
import { getWorkoutsForDate } from "@/data/workouts";

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { userId } = await auth();
  const { date: dateParam } = await searchParams;

  const date =
    typeof dateParam === "string" ? parseISO(dateParam) : new Date();

  const workouts = await getWorkoutsForDate(userId!, date);

  return (
    <main className="mx-auto w-full max-w-4xl px-8 py-10">
      <h1 className="mb-8 text-3xl font-bold">Workout Dashboard</h1>

      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-lg font-medium">
          Workouts for {format(date, "do MMM yyyy")}
        </h2>
        <div className="flex items-center gap-2">
          <CalendarPicker selected={date} />
          <NewWorkoutLink />
        </div>
      </div>

      <section>
        {workouts.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No workouts logged for this date.
          </p>
        ) : (
          <div className="flex flex-col gap-3">
            {workouts.map((workout) => {
              const durationMin =
                workout.completedAt
                  ? Math.round(
                      (workout.completedAt.getTime() -
                        workout.startedAt.getTime()) /
                        60_000
                    )
                  : null;

              return (
                <Link key={workout.id} href={`/dashboard/workout/${workout.id}`}>
                  <Card className="cursor-pointer transition-shadow hover:shadow-md">
                    <CardContent className="px-5 py-4">
                      <div className="flex items-start justify-between">
                        <p className="text-base font-semibold">
                          {workout.name ?? "Untitled Workout"}
                        </p>
                        <span className="text-sm text-muted-foreground">
                          {format(workout.startedAt, "h:mm a")}
                        </span>
                      </div>
                      {workout.exercises.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1.5">
                          {workout.exercises.map((ex) => (
                            <Badge key={ex} variant="secondary">
                              {ex}
                            </Badge>
                          ))}
                        </div>
                      )}
                      {durationMin !== null && (
                        <p className="mt-2 text-sm text-muted-foreground">
                          Duration: {durationMin} min
                        </p>
                      )}
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}
