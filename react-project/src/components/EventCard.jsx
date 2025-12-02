// EventCard.jsx
import React from "react";
import CalendarStyles from "../stylesheets/Calendar.module.css";

const EventCard = ({ dateLabel, time, title, onEdit, onDelete }) => {
  return (
    <div className={CalendarStyles.event}>
      <div className={CalendarStyles.event_date_wrapper}>
        <div className={CalendarStyles.event_date}>{dateLabel}</div>
        <div className={CalendarStyles.event_time}>{time}</div>
      </div>

      <div className={CalendarStyles.event_details}>{title}</div>

      <div className={CalendarStyles.event_buttons}>
        <button
          className={CalendarStyles.event_edit_button}
          onClick={onEdit}
          type="button"
        >
          <i className="bx bx-edit" />
        </button>
        <button
          className={CalendarStyles.event_delete}
          onClick={onDelete}
          type="button"
        >
          <i className="bx bx-trash" />
        </button>
      </div>
    </div>
  );
};

export default EventCard;
