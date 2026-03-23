"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const MOCK_WORKOUTS = [
  {
    id: 1,
    name: "Upper Body Strength",
    time: "9:00 AM",
    exercises: ["Bench Press", "Pull-ups", "Shoulder Press"],
    duration: 45,
  },
  {
    id: 2,
    name: "Cardio Session",
    time: "6:00 PM",
    exercises: ["Treadmill", "Rowing"],
    duration: 30,
  },
];

export default function DashboardPage() {
  const [date, setDate] = useState<Date | undefined>(undefined);

  useEffect(() => {
    setDate(new Date());
  }, []);

  return (
    <main className="mx-auto w-full max-w-4xl px-8 py-10">
      <h1 className="mb-8 text-3xl font-bold">Workout Dashboard</h1>

      <div className="flex flex-col gap-8 md:flex-row md:items-start">
        <div className="shrink-0">
          <p className="mb-3 text-lg font-medium">Select Date</p>
          <div className="rounded-md border p-4">
            <Calendar
              mode="single"
              selected={date}
              onSelect={(d) => d && setDate(d)}
            />
          </div>
        </div>

        <section className="flex-1">
          <h2 className="mb-4 text-lg font-medium">
            Workouts{date ? ` for ${format(date, "do MMM yyyy")}` : ""}
          </h2>

          {MOCK_WORKOUTS.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No workouts logged for this date.
            </p>
          ) : (
            <div className="flex flex-col gap-3">
              {MOCK_WORKOUTS.map((workout) => (
                <Card key={workout.id} className="transition-shadow hover:shadow-md cursor-pointer">
                  <CardContent className="px-5 py-4">
                    <div className="flex items-start justify-between">
                      <p className="text-base font-semibold">{workout.name}</p>
                      <span className="text-sm text-muted-foreground">{workout.time}</span>
                    </div>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {workout.exercises.map((ex) => (
                        <Badge key={ex} variant="secondary">{ex}</Badge>
                      ))}
                    </div>
                    <p className="mt-2 text-sm text-muted-foreground">
                      Duration: {workout.duration} min
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
