// EventPopup.jsx
import React from "react";
import CalendarStyles from "../stylesheets/Calendar.module.css";

const EventPopup = ({
  onClose,
  onSubmit,
  hours,
  minutes,
  text,
  onHoursChange,
  onMinutesChange,
  onTextChange,
}) => {
  return (
    <div className={CalendarStyles.eventArea}>
      <div className={CalendarStyles.event_popup}>
        <button
          className={CalendarStyles.event_close_button}
          onClick={onClose}
          type="button"
        >
          <i className="bx bx-x" />
        </button>

        <div className={CalendarStyles.event_time_popup}>
          <input
            type="number"
            name="hours"
            min="0"
            max="23"
            placeholder="HH"
            value={hours}
            onChange={(e) => onHoursChange(e.target.value)}
          />
          <input
            type="number"
            name="minutes"
            min="0"
            max="59"
            placeholder="MM"
            value={minutes}
            onChange={(e) => onMinutesChange(e.target.value)}
          />
        </div>

        <textarea
          className={CalendarStyles.event_textarea}
          placeholder="Enter Event Text (Maximum 60 Characters)"
          value={text}
          onChange={(e) => onTextChange(e.target.value)}
        />

        <button
          className={CalendarStyles.event_add_button}
          onClick={onSubmit}
          type="button"
        >
          ADD EVENT
        </button>
      </div>
    </div>
  );
};

export default EventPopup;
