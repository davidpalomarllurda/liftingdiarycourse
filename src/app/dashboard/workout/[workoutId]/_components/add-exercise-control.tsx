"use client";

import { useState, useTransition } from "react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { type ExerciseOption } from "@/data/exercises";
import { addExerciseToWorkoutAction } from "../actions";

type Props = {
  workoutId: number;
  availableExercises: ExerciseOption[];
  addedExerciseIds: number[];
};

export function AddExerciseControl({ workoutId, availableExercises, addedExerciseIds }: Props) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [isPending, startTransition] = useTransition();

  const addedSet = new Set(addedExerciseIds);
  const filtered = availableExercises.filter((e) =>
    e.name.toLowerCase().includes(query.toLowerCase())
  );

  function handleSelect(exerciseId: number) {
    startTransition(async () => {
      await addExerciseToWorkoutAction(workoutId, { exerciseId });
      setOpen(false);
      setQuery("");
    });
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger className={buttonVariants({ variant: "outline" })}>
        Add Exercise
      </PopoverTrigger>
      <PopoverContent className="w-64 p-2" align="start">
        <Input
          placeholder="Search exercises..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="mb-2"
          autoFocus
        />
        <div className="max-h-56 overflow-y-auto flex flex-col gap-0.5">
          {filtered.length === 0 && (
            <p className="text-sm text-muted-foreground px-2 py-1">No exercises found</p>
          )}
          {filtered.map((exercise) => {
            const alreadyAdded = addedSet.has(exercise.id);
            return (
              <Button
                key={exercise.id}
                variant="ghost"
                size="sm"
                className="justify-start"
                disabled={alreadyAdded || isPending}
                onClick={() => handleSelect(exercise.id)}
              >
                {exercise.name}
                {alreadyAdded && (
                  <span className="ml-auto text-xs text-muted-foreground">Added</span>
                )}
              </Button>
            );
          })}
        </div>
      </PopoverContent>
    </Popover>
  );
}
