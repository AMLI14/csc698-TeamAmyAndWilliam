import express from "express";
import cors from "cors";
import sqlite3 from "sqlite3";
import { open } from "sqlite";
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const app = express();
app.use(cors());
app.use(express.json());

// open DB
let db;
(async () => {
  db = await open({
    filename: "./calendar.db",
    driver: sqlite3.Database,
  });

  await db.exec(`
    CREATE TABLE IF NOT EXISTS events (
      id   INTEGER PRIMARY KEY AUTOINCREMENT,
      date TEXT NOT NULL,
      time TEXT NOT NULL,
      text TEXT NOT NULL
    );
  `);
})();

// GET /api/events?year=2025&month=12
app.get("/api/events", async (req, res) => {
  const { year, month } = req.query; // month 1–12 as string

  try {
    let rows;
    if (year && month) {
      const monthPadded = String(month).padStart(2, "0");
      rows = await db.all(
        `SELECT * FROM events WHERE date LIKE ? ORDER BY date, time`,
        [`${year}-${monthPadded}-%`]
      );
    } else {
      rows = await db.all(`SELECT * FROM events ORDER BY date, time`);
    }
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch events" });
  }
});

// POST /api/events  { date, time, text }
app.post("/api/events", async (req, res) => {
  const { date, time, text } = req.body;
  try {
    const result = await db.run(
      `INSERT INTO events (date, time, text) VALUES (?, ?, ?)`,
      [date, time, text]
    );
    res.status(201).json({ id: result.lastID, date, time, text });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create event" });
  }
});

// POST /api/ai/suggest-schedule  { prompt, fromDate, toDate }
app.post("/api/ai/suggest-schedule", async (req, res) => {
  const { prompt, fromDate, toDate } = req.body;

  try {
    // 1. load events from DB in the given range
    const rows = await db.all(
      `SELECT * FROM events WHERE date BETWEEN ? AND ? ORDER BY date, time`,
      [fromDate, toDate]
    );

    // turn into structured array
    const existing = rows.map((r) => ({
      id: r.id,
      date: r.date,
      time: r.time,
      text: r.text,
    }));

    // 2. call OpenAI
    const response = await openai.responses.create({
      model: "gpt-5.1", // or gpt-5-mini if you want cheaper :contentReference[oaicite:1]{index=1}
      input: [
        {
          role: "system",
          content:
            "You are a scheduling assistant that suggests new workout tasks " +
            "without changing existing tasks. Respond ONLY with JSON.",
        },
        {
          role: "user",
          content: [
            {
              type: "output_text",
              text: `
User prompt: ${prompt}

Existing events (JSON):
${JSON.stringify(existing, null, 2)}

Return a JSON array of suggested tasks with this shape:
[
  {
    "date": "YYYY-MM-DD",
    "time": "HH:MM",
    "text": "string description"
  }
]`,
            },
          ],
        },
      ],
      response_format: { type: "json_object" }, // ensure valid JSON
    });

    const suggestionsJson = JSON.parse(response.output[0].content[0].text);

    res.json(suggestionsJson);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to get AI suggestions" });
  }
});

// PUT /api/events/:id  { time, text }
app.put("/api/events/:id", async (req, res) => {
  const { id } = req.params;
  const { time, text } = req.body;

  try {
    await db.run(
      `UPDATE events SET time = ?, text = ? WHERE id = ?`,
      [time, text, id]
    );
    res.json({ id: Number(id), time, text });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update event" });
  }
});

// DELETE /api/events/:id
app.delete("/api/events/:id", async (req, res) => {
  const { id } = req.params;
  try {
    await db.run(`DELETE FROM events WHERE id = ?`, [id]);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to delete event" });
  }
});

const PORT = 4000;
app.listen(PORT, () => {
  console.log(`API server listening on http://localhost:${PORT}`);
});
