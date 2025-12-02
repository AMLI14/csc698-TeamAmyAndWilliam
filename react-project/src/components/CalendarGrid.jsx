import React from "react";
import CalendarStyles from "../stylesheets/Calendar.module.css";

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const CalendarGrid = ({ daysInMonth, firstWeekday, selectedDay, eventDays, onDayClick }) => {
  const totalCells = firstWeekday + daysInMonth;

  return (
    <div className={CalendarStyles.calendar_grid}>
      <div className={CalendarStyles.weekdays}>
        {WEEKDAYS.map((d) => (
          <span key={d}>{d}</span>
        ))}
      </div>

      <div className={CalendarStyles.days}>
        {Array.from({ length: totalCells }, (_, idx) => {
          if (idx < firstWeekday) {
            // empty cell before day 1
            return <span key={`empty-${idx}`}
            className={CalendarStyles.dayEmpty} 
            />;
          }

          const day = idx - firstWeekday + 1;
          const isSelected = day === selectedDay;
          const hasEvent = eventDays?.includes(day);

          return (
              <span
                key={day}
                className={`${CalendarStyles.dayWrapper} ${
                  hasEvent ? CalendarStyles.dayHasEvent : ""
                }`}
              >
                <span
                  className={`${CalendarStyles.day} ${
                    isSelected ? CalendarStyles.daySelected : ""
                  }`}
                  onClick={() => onDayClick(day)}
                >
                  {day}
                </span>
              </span>
            );
        })}
      </div>
    </div>
  );
};

export default CalendarGrid;