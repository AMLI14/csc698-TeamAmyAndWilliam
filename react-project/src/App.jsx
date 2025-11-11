import React, { useCallback, useEffect, useMemo, useState } from 'react'
import './App.css'

const DAYS = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday']

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

const TIMES = generateTimes(6, 24, 30) // 6:00 AM -> 12:00 AM by 30m steps

const TaskItem = React.memo(function TaskItem({ task, onDelete }) {
  return (
    <li className="task-item">
      <span className="task-title">{task.title}</span>
      <button className="task-delete" onClick={() => onDelete(task.id)} aria-label={`Delete ${task.title}`}>✕</button>
    </li>
  )
})

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

function loadTasks() {
  try {
    const raw = localStorage.getItem('weekly-tasks')
    return raw ? JSON.parse(raw) : []
  } catch (e) {
    return []
  }
}

function App() {
  const [tasks, setTasks] = useState(() => loadTasks())
  const [form, setForm] = useState({ day: 1, time: TIMES[0], title: '' })

  useEffect(() => {
    try {
      localStorage.setItem('weekly-tasks', JSON.stringify(tasks))
    } catch (e) {
      // ignore localStorage errors
    }
  }, [tasks])

  const handleAdd = useCallback((e) => {
    e.preventDefault()
    if (!form.title) return
    const newTask = { id: Date.now(), day: Number(form.day), time: form.time, title: form.title }
    setTasks((s) => [...s, newTask])
    setForm((f) => ({ ...f, title: '' }))
  }, [form])

  const handleDelete = useCallback((id) => {
    setTasks((s) => s.filter((t) => t.id !== id))
  }, [])

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

  return (
    <div className="App">
      <h2>Weekly Schedule</h2>

      <form className="task-form" onSubmit={handleAdd}>
        <label>
          Day
          <select value={form.day} onChange={(e) => setForm((f) => ({ ...f, day: e.target.value }))}>
            {DAYS.map((d, i) => (
              <option key={d} value={i}>{d}</option>
            ))}
          </select>
        </label>

        <label>
          Time
          <select value={form.time} onChange={(e) => setForm((f) => ({ ...f, time: e.target.value }))}>
            {TIMES.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </label>

        <label>
          Title
          <input value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} placeholder="Task title" />
        </label>

        <button type="submit">Add</button>
      </form>

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
                  const key = `${dayIndex}-${time}`
                  const items = tasksByCell.get(key) || []
                  return <Cell key={key} items={items} onDelete={handleDelete} />
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default App
