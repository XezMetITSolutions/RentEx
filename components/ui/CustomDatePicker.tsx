"use client";

import { useState, useEffect, useRef } from "react";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react";

type Props = {
  value: string; // YYYY-MM-DD
  onChange: (val: string) => void; // YYYY-MM-DD
  min?: string; // YYYY-MM-DD
  className?: string;
  inputClassName?: string;
};

export default function CustomDatePicker({ value, onChange, min, className = "", inputClassName = "" }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentDate, setCurrentDate] = useState(() => {
    const d = value ? new Date(value) : new Date();
    return isNaN(d.getTime()) ? new Date() : d;
  });
  const containerRef = useRef<HTMLDivElement>(null);

  // Sync date view when value changes from outside
  useEffect(() => {
    if (value) {
      const d = new Date(value);
      if (!isNaN(d.getTime())) {
        setCurrentDate(d);
      }
    }
  }, [value]);

  // Click outside listener
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  const formatDateDisplay = (isoStr: string) => {
    if (!isoStr) return "";
    const parts = isoStr.split("-");
    if (parts.length !== 3) return isoStr;
    return `${parts[2]}.${parts[1]}.${parts[0]}`; // DD.MM.YYYY
  };

  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (year: number, month: number) => {
    // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
    // Convert to: 0 = Monday, ..., 6 = Sunday for European standard
    const day = new Date(year, month, 1).getDay();
    return day === 0 ? 6 : day - 1;
  };

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const handleSelectDay = (day: number) => {
    const selectedMonth = currentDate.getMonth() + 1;
    const monthStr = selectedMonth.toString().padStart(2, "0");
    const dayStr = day.toString().padStart(2, "0");
    const newIsoValue = `${currentDate.getFullYear()}-${monthStr}-${dayStr}`;
    onChange(newIsoValue);
    setIsOpen(false);
  };

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const daysInMonth = getDaysInMonth(year, month);
  const firstDayIndex = getFirstDayOfMonth(year, month);

  const monthNames = [
    "Januar", "Februar", "März", "April", "Mai", "Juni",
    "Juli", "August", "September", "Oktober", "November", "Dezember"
  ];
  const weekDays = ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"];

  // Generate grid days
  const gridCells = [];
  // Empty slots for offset
  for (let i = 0; i < firstDayIndex; i++) {
    gridCells.push(null);
  }
  // Days of the month
  for (let d = 1; d <= daysInMonth; d++) {
    gridCells.push(d);
  }

  // Helper to check if a day is disabled
  const isDayDisabled = (day: number) => {
    if (!min) return false;
    const selectedMonth = month + 1;
    const monthStr = selectedMonth.toString().padStart(2, "0");
    const dayStr = day.toString().padStart(2, "0");
    const targetDateStr = `${year}-${monthStr}-${dayStr}`;
    return targetDateStr < min;
  };

  const isSelected = (day: number) => {
    if (!value) return false;
    const parts = value.split("-");
    return (
      parseInt(parts[0], 10) === year &&
      parseInt(parts[1], 10) === month + 1 &&
      parseInt(parts[2], 10) === day
    );
  };

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className={inputClassName || "w-full flex items-center justify-between bg-white dark:bg-[#1C1C1C] border border-gray-200 dark:border-white/5 rounded-[1rem] py-4 px-4 text-[14px] text-gray-900 dark:text-white outline-none cursor-pointer hover:border-gray-300 dark:hover:border-white/10 transition-colors select-none"}
      >
        <span className="font-medium">
          {formatDateDisplay(value) || "Datum wählen"}
        </span>
        <CalendarIcon className="w-4 h-4 text-gray-400 dark:text-[#A3A3A3]" />
      </div>

      {isOpen && (
        <div className="absolute z-50 mt-2 p-4 w-72 bg-white dark:bg-[#171717] border border-gray-200 dark:border-white/10 rounded-2xl shadow-xl animate-in fade-in zoom-in-95 duration-150 right-0 left-0 md:left-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <button 
              type="button" 
              onClick={handlePrevMonth}
              className="p-1 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="font-bold text-sm text-gray-950 dark:text-white">
              {monthNames[month]} {year}
            </span>
            <button 
              type="button" 
              onClick={handleNextMonth}
              className="p-1 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Weekdays */}
          <div className="grid grid-cols-7 gap-1 text-center text-xs font-semibold text-gray-400 dark:text-gray-500 mb-2">
            {weekDays.map(w => (
              <div key={w}>{w}</div>
            ))}
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-1 text-center">
            {gridCells.map((day, idx) => {
              if (day === null) {
                return <div key={`empty-${idx}`} />;
              }

              const disabled = isDayDisabled(day);
              const selected = isSelected(day);

              return (
                <button
                  key={`day-${day}`}
                  type="button"
                  disabled={disabled}
                  onClick={() => handleSelectDay(day)}
                  className={`w-8 h-8 rounded-full text-xs font-medium flex items-center justify-center transition-colors mx-auto ${
                    selected
                      ? "bg-[#E53935] text-white font-bold"
                      : disabled
                      ? "text-gray-300 dark:text-gray-650 cursor-not-allowed line-through"
                      : "text-gray-800 dark:text-gray-200 hover:bg-gray-150 dark:hover:bg-white/5"
                  }`}
                >
                  {day}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
