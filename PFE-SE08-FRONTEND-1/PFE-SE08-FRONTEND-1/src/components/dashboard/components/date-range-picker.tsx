"use client"

import * as React from "react"
import { addDays, format, startOfMonth, endOfMonth, subMonths } from "date-fns"
import { CalendarIcon, ChevronDown } from "lucide-react"
import { DateRange } from "react-day-picker"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

type DateRangePickerProps = React.HTMLAttributes<HTMLDivElement> & {
  onDateRangeChange?: (range: DateRange | undefined) => void;
};

export function CalendarDateRangePicker({
  className,
  onDateRangeChange,
}: DateRangePickerProps) {
  // Get current date for default values
  const today = new Date();
  const firstDayCurrentMonth = startOfMonth(today);
  const lastDayCurrentMonth = endOfMonth(today);
  
  // Predefined date ranges
  const dateRanges = {
    "This Month": { from: firstDayCurrentMonth, to: lastDayCurrentMonth },
    "Last Month": { 
      from: startOfMonth(subMonths(today, 1)), 
      to: endOfMonth(subMonths(today, 1)) 
    },
    "Last 7 Days": { from: addDays(today, -7), to: today },
    "Last 30 Days": { from: addDays(today, -30), to: today },
    "Last 90 Days": { from: addDays(today, -90), to: today },
  };
  
  const [date, setDate] = React.useState<DateRange | undefined>(dateRanges["This Month"]);
  const [presetOption, setPresetOption] = React.useState<string>("This Month");

  // Handle date change from calendar
  const handleDateChange = (newDate: DateRange | undefined) => {
    setDate(newDate);
    if (onDateRangeChange) {
      onDateRangeChange(newDate);
    }
    
    // Reset preset if custom date is selected
    if (newDate && !Object.values(dateRanges).some(range => 
      range.from?.getTime() === newDate.from?.getTime() && 
      range.to?.getTime() === newDate.to?.getTime()
    )) {
      setPresetOption("Custom Range");
    }
  };

  // Handle preset selection
  const handlePresetChange = (value: string) => {
    setPresetOption(value);
    const newRange = dateRanges[value as keyof typeof dateRanges];
    if (newRange) {
      setDate(newRange);
      if (onDateRangeChange) {
        onDateRangeChange(newRange);
      }
    }
  };

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <Select value={presetOption} onValueChange={handlePresetChange}>
        <SelectTrigger className="w-[150px]">
          <SelectValue placeholder="Select range" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="This Month">This Month</SelectItem>
          <SelectItem value="Last Month">Last Month</SelectItem>
          <SelectItem value="Last 7 Days">Last 7 Days</SelectItem>
          <SelectItem value="Last 30 Days">Last 30 Days</SelectItem>
          <SelectItem value="Last 90 Days">Last 90 Days</SelectItem>
          {presetOption === "Custom Range" && (
            <SelectItem value="Custom Range">Custom Range</SelectItem>
          )}
        </SelectContent>
      </Select>
      
      <Popover>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant={"outline"}
            className={cn(
              "w-[260px] justify-start text-left font-normal",
              !date && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {date?.from ? (
              date.to ? (
                <>
                  {format(date.from, "MMM dd, yyyy")} -{" "}
                  {format(date.to, "MMM dd, yyyy")}
                </>
              ) : (
                format(date.from, "MMM dd, yyyy")
              )
            ) : (
              <span>Pick a date range</span>
            )}
            <ChevronDown className="ml-auto h-4 w-4 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            initialFocus
            mode="range"
            defaultMonth={date?.from}
            selected={date}
            onSelect={handleDateChange}
            numberOfMonths={2}
            className="rounded-md border shadow"
          />
        </PopoverContent>
      </Popover>
    </div>
  )
}
