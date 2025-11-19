**CSC698 — Smart Calendar Day Planner (with GPT API)**

A web app that helps you plan your day from your calendar.
You add events/tasks on a calendar, type what you want help with
(“make me a realistic plan around classes and gym”),
and the app summarizes your schedule, proposes a plan,
and shows a confirmation modal: “Use this plan for today?”

**Authors:** Amy Li, William Ghanayem

**Features:**
* Calendar planner UI: create/edit events with title, date, start/end time. (maybe notes if we can figure out a plan for that)
* One-click “Plan My Day”: sends your schedule + your prompt to GPT.


**How It Works: (At least this is the plan..)**
1. User creates events for a day (e.g., classes, work shift, errands).
2. User clicks “Plan My Day” and writes a prompt (e.g., “fit in 2h of studying and a 45-min gym after 5pm”).
3. Backend compiles context (only: date, start/end, taskItem) → crafts a structured system prompt.
4. GPT returns a draft day plan.
5. Modal pops up with the proposed plan.
6. Accept → app writes items back to the calendar/to-do list.
7. Cancel (Or Revise, we will find out later lol)

**Tech Stack: (so far)**
* Frontend: React + Vite. (maybe tailwind if we learn it)
* Backend: Node.JS/Express, OpenAI API (both on the way)
  


