import React, { useCallback, useEffect, useMemo, useState } from 'react'
import './stylesheets/App.css'
import PromptAI from './components/PromptAI.jsx'
import TaskInputFieldsStyles from './stylesheets/TaskInputFields.module.css'




// Simple list of weekdays used to render the table header.
// Using an array of names keeps the rendering code short and easy to read.
const DAYS = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday']

// Helper: Generates an array of time labels from 6:00 AM to 12:00 AM in 30-minute intervals.
// Generate them instead of hard-coding to keep the file concise and flexible.
function generateTimes(startHour = 6, endHour = 24, stepMinutes = 30) {
  const times = []
  const pad = (n) => (n < 10 ? `0${n}` : `${n}`)
  for (let h = startHour; h <= endHour; h++) {
    for (let m = 0; m < 60; m += stepMinutes) {
      if (h === endHour && m > 0) break
      const hour12 = ((h + 11) % 12) + 1
      const suffix = h < 12 || h === 24 ? 'AM' : 'PM'
      times.push(`${hour12}:${pad(m)} ${suffix}`)
    }
  }
  return times
}

// TIMES is the array of labels shown down the left side of the calendar.
const TIMES = generateTimes(6, 24, 30)

// TaskItem: small presentational component that renders a task title and a delete button.
// React.memo wraps it so React will skip re-rendering this component when its props
// are unchanged (shallow comparison). This helps performance when many tasks exist.
const TaskItem = React.memo(function TaskItem({ task, onDelete }) {
  return (
    <li className={TaskInputFieldsStyles.taskItem}>
      {/* show the task title */}
      <span 
        className="task-title"
        onClick={() => onDelete(task.id)}
        aria-label={`Delete ${task.title}`}>
          {task.title}
        </span>
      {/* when clicked, call parent onDelete with this task's id */}
      
    </li>
  )
})

// Cell: renders one cell in the calendar grid.
// If there are no tasks for this cell we show '---' so empty slots are obvious.
// If there are tasks we render a small list of TaskItem components.
const Cell = React.memo(function Cell({ items = [], onDelete }) {
  return (
    <td className="cell">
      {items.length === 0 ? (
        <span className="empty">---</span>
      ) : (
        <ul className="task-list">
          {items.map((t) => (
            <TaskItem key={t.id} task={t} onDelete={onDelete} />
          ))}
        </ul>
      )}
    </td>
  )
})

// Try to load saved tasks from localStorage. If parsing fails or storage is unavailable
// we return an empty array so the app still works offline or when storage is blocked.
function loadTasks() {
  try {
    const raw = localStorage.getItem('weekly-tasks')
    return raw ? JSON.parse(raw) : []
  } catch (e) {
    return []
  }
}

// Main app component
function App() {
  // tasks: array of { id, day (0-6), time (string), title }
  // initialize from localStorage so data persists across reloads
  const [tasks, setTasks] = useState(() => loadTasks())

  // form: controlled form state for adding a task
  const [form, setForm] = useState({ day: 1, time: TIMES[0], title: '' })

  // Whenever tasks change we save them back to localStorage.
  // Wrapped in try/catch to avoid runtime errors when storage is disabled.
  useEffect(() => {
    try {
      localStorage.setItem('weekly-tasks', JSON.stringify(tasks))
    } catch (e) {
      // ignore localStorage errors (e.g., blocked in private mode)
    }
  }, [tasks])

  // Add a new task based on the form values. We use useCallback so the handler
  // reference is stable and doesn't cause unnecessary re-renders of memoized children.
  const handleAdd = useCallback((e) => {
    e.preventDefault()
    if (!form.title) return // don't add empty titles
    const newTask = { id: Date.now(), day: Number(form.day), time: form.time, title: form.title }
    setTasks((s) => [...s, newTask])
    setForm((f) => ({ ...f, title: '' }))
  }, [form])

  // Delete a task by id
  const handleDelete = useCallback((id) => {
    setTasks((s) => s.filter((t) => t.id !== id))
  }, [])

  // Build a Map keyed by `${day}-${time}` for O(1) lookup when rendering cells.
  // useMemo ensures we only rebuild this map when `tasks` actually changes.
  const tasksByCell = useMemo(() => {
    const map = new Map()
    for (const t of tasks) {
      const key = `${t.day}-${t.time}`
      const arr = map.get(key) || []
      arr.push(t)
      map.set(key, arr)
    }
    return map
  }, [tasks])

  // Render the app: form at the top, then a table with TIMES rows and DAYS columns.
  return (
    <div className="App">
      <h2>Weekly Schedule</h2>

      {/* Simple add-task form. Controlled inputs update `form` state. */}
      <form className="task-form" onSubmit={handleAdd}>
        <label className={TaskInputFieldsStyles.label}>
          Day     
          <select className={TaskInputFieldsStyles.select} value={form.day} onChange={(e) => setForm((f) => ({ ...f, day: e.target.value }))}>
            {DAYS.map((d, i) => (
              <option key={d} value={i}>{d}</option>
            ))}
          </select>
        </label>

        <label className={TaskInputFieldsStyles.label}>
          Time
          <select className={TaskInputFieldsStyles.select} value={form.time} onChange={(e) => setForm((f) => ({ ...f, time: e.target.value }))}>
            {TIMES.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </label>

        <label className={TaskInputFieldsStyles.label}>
          Title
          <input className={TaskInputFieldsStyles.input} value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} placeholder="Task title" />
        </label>

        <button type="submit">Add</button>
      </form>

      {/* Calendar table: header row for days, then a row per time slot. */}
      <div className="table-wrap">
        <table className="calendar">
          <thead>
            <tr>
              <th>Time</th>
              {DAYS.map((d) => (
                <th key={d}>{d}</th>
              ))}
            </tr>
          </thead>

          <tbody>
            {TIMES.map((time) => (
              <tr key={time}>
                <th className="time-label">{time}</th>
                {DAYS.map((_, dayIndex) => {
                  // Look up tasks for this day/time cell and render a Cell component.
                  const key = `${dayIndex}-${time}`
                  const items = tasksByCell.get(key) || []
                  return <Cell key={key} items={items} onDelete={handleDelete} />
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>


    {/* PromptAI rendered at the bottom so users can type a prompt and click the button. */}
    <PromptAI />
      
    </div>
  )
}

export default App
