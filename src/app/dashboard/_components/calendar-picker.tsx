"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { enUS } from "date-fns/locale";
import { CalendarIcon } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { buttonVariants } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

export function CalendarPicker({ selected }: { selected: Date }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  function handleSelect(date: Date | undefined) {
    if (!date) return;
    router.push(`?date=${format(date, "yyyy-MM-dd")}`);
    setOpen(false);
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger className={buttonVariants({ variant: "outline" })}>
        <CalendarIcon />
        {format(selected, "do MMM yyyy")}
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar mode="single" selected={selected} onSelect={handleSelect} locale={enUS} />
      </PopoverContent>
    </Popover>
  );
}
