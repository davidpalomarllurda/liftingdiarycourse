"use client";

import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { enUS } from "date-fns/locale";
import { Calendar } from "@/components/ui/calendar";

export function CalendarPicker({ selected }: { selected: Date }) {
  const router = useRouter();

  function handleSelect(date: Date | undefined) {
    if (!date) return;
    router.push(`?date=${format(date, "yyyy-MM-dd")}`);
  }

  return (
    <div className="rounded-md border p-4">
      <Calendar mode="single" selected={selected} onSelect={handleSelect} locale={enUS} />
    </div>
  );
}
