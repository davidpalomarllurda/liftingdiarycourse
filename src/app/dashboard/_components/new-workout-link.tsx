"use client";

import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";

export function NewWorkoutLink() {
  return (
    <Link href="/dashboard/workout/new" className={buttonVariants()}>
      Log New Workout
    </Link>
  );
}
