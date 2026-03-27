"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { updateWorkoutAction } from "../actions";

function formatDatetimeLocal(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

type Props = {
  workoutId: number;
  defaultName: string | null;
  defaultStartedAt: Date;
};

export function EditWorkoutForm({ workoutId, defaultName, defaultStartedAt }: Props) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const name = (form.elements.namedItem("name") as HTMLInputElement).value;
    const startedAtStr = (form.elements.namedItem("startedAt") as HTMLInputElement).value;

    startTransition(async () => {
      await updateWorkoutAction(workoutId, {
        name,
        startedAt: new Date(startedAtStr),
      });
      router.push("/dashboard");
    });
  }

  return (
    <div className="mx-auto w-full max-w-[580px]">
      <h1 className="mb-8 text-3xl font-bold">Edit Workout</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="name">Workout Name</Label>
          <Input
            id="name"
            name="name"
            placeholder="Example workout"
            maxLength={255}
            defaultValue={defaultName ?? ""}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="startedAt">Start Time</Label>
          <Input
            id="startedAt"
            name="startedAt"
            type="datetime-local"
            defaultValue={formatDatetimeLocal(defaultStartedAt)}
            required
          />
        </div>
        <div className="flex gap-3">
          <Button type="submit" disabled={isPending}>
            {isPending ? "Saving..." : "Save Changes"}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/dashboard")}
            disabled={isPending}
          >
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}
