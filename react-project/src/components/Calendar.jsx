// Calendar.jsx
import React, { useState, useEffect } from "react";
import CalendarStyles from "../stylesheets/Calendar.module.css";

import CalendarHeader from "./CalendarHeader";
import CalendarGrid from "./CalendarGrid";
import EventCard from "./EventCard";
import EventPopup from "./EventPopup";

const API_BASE = "http://localhost:4000/api";

const MONTH_LABELS = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December"
];

// helper to get days in a month
const getDaysInMonth = (year, monthIndex) =>
  new Date(year, monthIndex + 1, 0).getDate(); // monthIndex 0–11

// format YYYY-MM-DD
const formatDateKey = (year, monthIndex, day) =>
  `${year}-${String(monthIndex + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

const Calendar = () => {
  const [year, setYear] = useState(2025);
  const [monthIndex, setMonthIndex] = useState(11); // 0 = Jan, 11 = Dec

  const [selectedDay, setSelectedDay] = useState(1);

  // popup form state
  const [showPopup, setShowPopup] = useState(false);
  const [hours, setHours] = useState("");
  const [minutes, setMinutes] = useState("");
  const [text, setText] = useState("");

  // which event (by index) we're editing for the selected day; null = new event
  const [editingIndex, setEditingIndex] = useState(null);

  // events keyed by date string: { "YYYY-MM-DD": [ { time, text }, ... ] }
  const [events, setEvents] = useState({
    // seed with the “Meeting with Amy” example
    [formatDateKey(2025, 11, 15)]: [
      { time: "10:00", text: "Meeting with Amy" },
    ],
  });

  useEffect(() => {
  const loadEvents = async () => {
    try {
      const res = await fetch(
        `${API_BASE}/events?year=${year}&month=${monthIndex + 1}`
      );
      const rows = await res.json(); // [{id, date, time, text}, ...]

      const grouped = {};
      for (const row of rows) {
        if (!grouped[row.date]) grouped[row.date] = [];
        grouped[row.date].push({
          id: row.id,
          time: row.time,
          text: row.text,
        });
      }

      setEvents(grouped);
    } catch (err) {
      console.error("Failed to load events", err);
    }
  };

  loadEvents();
}, [year, monthIndex]);



  const daysInMonth = getDaysInMonth(year, monthIndex);
  const monthLabel = MONTH_LABELS[monthIndex];
  const firstWeekday = new Date(year, monthIndex, 1).getDay(); // 0 = Sunday...
  const selectedDateKey = formatDateKey(year, monthIndex, selectedDay);
  const selectedDateEvents = events[selectedDateKey] || [];

  // days in this month that have at least one event
  const eventDays = Object.keys(events)
    .filter((key) => {
      const [y, m] = key.split("-");
      return (
        Number(y) === year &&
        Number(m) === monthIndex + 1 &&
        Array.isArray(events[key]) &&
        events[key].length > 0
      );
    })
    .map((key) => Number(key.split("-")[2]));

  // --- handlers ---

  const handlePrevMonth = () => {
    setMonthIndex((prev) => {
      if (prev === 0) {
        setYear((y) => y - 1);
        return 11;
      }
      return prev - 1;
    });
    setSelectedDay(1);
    setEditingIndex(null);
    setShowPopup(false);
  };

  const handleNextMonth = () => {
    setMonthIndex((prev) => {
      if (prev === 11) {
        setYear((y) => y + 1);
        return 0;
      }
      return prev + 1;
    });
    setSelectedDay(1);
    setEditingIndex(null);
    setShowPopup(false);
  };

  // Clicking a day: select that day and open popup for a NEW event
  const handleDayClick = (day) => {
    setSelectedDay(day);
    setEditingIndex(null);
    setHours("");
    setMinutes("");
    setText("");
    setShowPopup(false);
  };

  const handleOpenPopup = () => {
    setEditingIndex(null);
    setHours("");
    setMinutes("");
    setText("");
    setShowPopup(true);
  };

  const handleClosePopup = () => {
    setShowPopup(false);
    setHours("");
    setMinutes("");
    setText("");
    setEditingIndex(null);
  };

  const handleAddEvent = async () => {
    if (!text.trim()) return;

    const hh = String(hours || "0").padStart(2, "0");
    const mm = String(minutes || "0").padStart(2, "0");
    const time = `${hh}:${mm}`;

    const dateStr = selectedDateKey; // "YYYY-MM-DD"

    try {
      let savedEvent;

      if (editingIndex === null) {
        // NEW EVENT → POST
        const res = await fetch(`${API_BASE}/events`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ date: dateStr, time, text: text.trim() }),
        });
        savedEvent = await res.json(); // {id, date, time, text}
      } else {
        // EDIT EXISTING → need its id
        const currentList = events[dateStr] || [];
        const original = currentList[editingIndex];
        if (!original) return;

        const res = await fetch(`${API_BASE}/events/${original.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ time, text: text.trim() }),
        });
        const updated = await res.json(); // {id, time, text}
        savedEvent = { ...original, ...updated, date: dateStr };
      }

      // update local state
      setEvents((prev) => {
        const list = Array.isArray(prev[dateStr]) ? [...prev[dateStr]] : [];

        if (editingIndex === null) {
          list.push({
            id: savedEvent.id,
            time: savedEvent.time,
            text: savedEvent.text,
          });
        } else {
          list[editingIndex] = {
            id: savedEvent.id,
            time: savedEvent.time,
            text: savedEvent.text,
          };
        }

        return { ...prev, [dateStr]: list };
      });

      handleClosePopup();
    } catch (err) {
      console.error("Failed to save event", err);
      // optional: show toast
    }
  };


  const handleDeleteEvent = async (index) => {
    const list = selectedDateEvents;
    const evt = list[index];
    if (!evt) return;

    try {
      await fetch(`${API_BASE}/events/${evt.id}`, { method: "DELETE" });

      setEvents((prev) => {
        const currentList = Array.isArray(prev[selectedDateKey])
          ? [...prev[selectedDateKey]]
          : [];
        currentList.splice(index, 1);

        const next = { ...prev };
        if (currentList.length === 0) {
          delete next[selectedDateKey];
        } else {
          next[selectedDateKey] = currentList;
        }
        return next;
      });

      if (editingIndex === index) {
        setEditingIndex(null);
        setShowPopup(false);
      }
    } catch (err) {
      console.error("Failed to delete event", err);
    }
  };


  const handleEditEvent = (index) => {
    const evt = selectedDateEvents[index];
    if (!evt) return;

    const [hh, mm] = evt.time.split(":");
    setHours(hh);
    setMinutes(mm);
    setText(evt.text);
    setEditingIndex(index);
    setShowPopup(true);
  };

  return (
    <div className={CalendarStyles.page}>
      <div className={CalendarStyles.calendarWrapper}>
        <h1 className={CalendarStyles.calendar_heading}>CALENDAR</h1>

        <div className={CalendarStyles.calendar_container}>
          {/* header */}
          <CalendarHeader
            monthLabel={monthLabel}
            year={year}
            onPrev={handlePrevMonth}
            onNext={handleNextMonth}
          />

          {/* grid */}
          <CalendarGrid
            daysInMonth={daysInMonth}
            firstWeekday={firstWeekday}
            selectedDay={selectedDay}
            eventDays={eventDays}
            onDayClick={handleDayClick}
          />

          {/* right-side event column */}
          <div className={CalendarStyles.eventColumn}>
            {/* one EventCard per event for the selected day */}
            {selectedDateEvents.map((evt, index) => (
              <EventCard
                key={index}
                dateLabel={`${monthLabel} ${selectedDay}, ${year}`}
                time={evt.time}
                title={evt.text}
                onEdit={() => handleEditEvent(index)}
                onDelete={() => handleDeleteEvent(index)}
              />
            ))}

            {/* Add Task button – always visible, sits under any existing cards */}
            <button
              type="button"
              className={CalendarStyles.addEventButton}
              onClick={handleOpenPopup}
            >
              <i className="bx bx-plus" />
              <span>Add task</span>
            </button>
          </div>

          {/* popup (show when adding/editing) */}
          {showPopup && (
            <EventPopup
              onClose={handleClosePopup}
              onSubmit={handleAddEvent}
              hours={hours}
              minutes={minutes}
              text={text}
              onHoursChange={setHours}
              onMinutesChange={setMinutes}
              onTextChange={setText}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default Calendar;
