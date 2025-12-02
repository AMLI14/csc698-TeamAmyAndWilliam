// CalendarHeader.jsx
import React from "react";
import CalendarStyles from "../stylesheets/Calendar.module.css";

const CalendarHeader = ({ monthLabel, year, onPrev, onNext }) => {
  return (
    <div className={CalendarStyles.headerRow}>
      <div className={CalendarStyles.headerLeft}>
        <button
          className={CalendarStyles.buttonsSmall}
          onClick={onPrev}
          type="button"
        >
          <i className="bx bx-chevron-left" />
        </button>

        <div className={CalendarStyles.monthYear}>
          <h2 className={CalendarStyles.calendar_text}>{monthLabel},</h2>
          <h2 className={CalendarStyles.calendar_text}>{year}</h2>
        </div>

        <button
          className={CalendarStyles.buttonsSmall}
          onClick={onNext}
          type="button"
        >
          <i className="bx bx-chevron-right" />
        </button>
      </div>
    </div>
  );
};

export default CalendarHeader;
