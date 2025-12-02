// Calendar.jsx
import React from "react";
import CalendarStyles from "../stylesheets/Calendar.module.css";
import "boxicons";
import CalendarHeader from "./CalendarHeader";
import CalendarGrid from "./CalendarGrid";
import EventCard from "./EventCard";
import EventPopup from "./EventPopup";

const Calendar = () => {
  // later you’ll put state here
  return (
    <div className={CalendarStyles.page}>
      <div className={CalendarStyles.calendarWrapper}>
        <h1 className={CalendarStyles.calendar_heading}>CALENDAR</h1>

        <div className={CalendarStyles.calendar_container}>
          <CalendarHeader
            monthLabel="May"
            year={2024}
            onPrev={() => {}}
            onNext={() => {}}
          />

          <CalendarGrid daysInMonth={31} onDayClick={(day) => console.log(day)} />

          <EventCard
            dateLabel="May 15, 2024"
            time="10:00"
            title="Meeting with John"
            onEdit={() => {}}
            onDelete={() => {}}
          />

          {/* Hide this until you wire up state, if you want */}
          {/* <EventPopup ...props /> */}
        </div>
      </div>
    </div>
  );
};

export default Calendar;
