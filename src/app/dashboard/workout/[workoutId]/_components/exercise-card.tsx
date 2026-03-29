"use client";

import { useState, useTransition } from "react";
import { Card, CardHeader, CardTitle, CardAction, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { type WorkoutExerciseWithSets } from "@/data/workouts";
import {
  removeExerciseFromWorkoutAction,
  addSetAction,
  deleteSetAction,
} from "../actions";

type Props = {
  workoutId: number;
  workoutExercise: WorkoutExerciseWithSets;
};

export function ExerciseCard({ workoutId, workoutExercise }: Props) {
  const [isPending, startTransition] = useTransition();
  const [reps, setReps] = useState("");
  const [weightKg, setWeightKg] = useState("");

  function handleRemoveExercise() {
    startTransition(async () => {
      await removeExerciseFromWorkoutAction(workoutId, {
        workoutExerciseId: workoutExercise.workoutExerciseId,
      });
    });
  }

  function handleDeleteSet(setId: number) {
    startTransition(async () => {
      await deleteSetAction(workoutId, { setId });
    });
  }

  function handleAddSet() {
    const parsedReps = reps !== "" ? parseInt(reps, 10) : null;
    const parsedWeightKg = weightKg !== "" ? weightKg : null;
    startTransition(async () => {
      await addSetAction(workoutId, {
        workoutExerciseId: workoutExercise.workoutExerciseId,
        reps: parsedReps,
        weightKg: parsedWeightKg,
      });
      setReps("");
      setWeightKg("");
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{workoutExercise.exerciseName}</CardTitle>
        <CardAction>
          <Button
            variant="destructive"
            size="sm"
            disabled={isPending}
            onClick={handleRemoveExercise}
          >
            Remove
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {workoutExercise.sets.map((set) => (
            <div key={set.id} className="flex items-center gap-3 text-sm">
              <span className="text-muted-foreground w-12">Set {set.setNumber}</span>
              <span className="flex-1">
                {set.reps != null ? `${set.reps} reps` : "— reps"}
                {" @ "}
                {set.weightKg != null ? `${set.weightKg} kg` : "— kg"}
              </span>
              <Button
                variant="ghost"
                size="sm"
                disabled={isPending}
                onClick={() => handleDeleteSet(set.id)}
              >
                Delete
              </Button>
            </div>
          ))}
          <div className="flex items-center gap-2 pt-2">
            <Input
              type="number"
              placeholder="Reps"
              value={reps}
              onChange={(e) => setReps(e.target.value)}
              className="w-24"
              min={1}
            />
            <Input
              type="text"
              placeholder="kg"
              value={weightKg}
              onChange={(e) => setWeightKg(e.target.value)}
              className="w-24"
            />
            <Button
              size="sm"
              disabled={isPending || (reps === "" && weightKg === "")}
              onClick={handleAddSet}
            >
              Add Set
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
