// CalendarGrid.jsx
import React from "react";
import CalendarStyles from "../stylesheets/Calendar.module.css";

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const CalendarGrid = ({ daysInMonth = 31, onDayClick }) => {
  return (
    <div className={CalendarStyles.calendar_grid}>
      <div className={CalendarStyles.weekdays}>
        {WEEKDAYS.map((d) => (
          <span key={d}>{d}</span>
        ))}
      </div>

      <div className={CalendarStyles.days}>
        {Array.from({ length: daysInMonth }, (_, i) => {
          const day = i + 1;
          return (
            <span
              key={day}
              className={CalendarStyles.day}
              onClick={() => onDayClick?.(day)}
            >
              {day}
            </span>
          );
        })}
      </div>
    </div>
  );
};

export default CalendarGrid;
