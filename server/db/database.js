const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./server/db/database.sqlite');

db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS participants (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    phone_number TEXT NOT NULL,
    email_id TEXT NOT NULL,
    class TEXT NOT NULL,
    section TEXT NOT NULL,
    event_day1 TEXT,  -- Add this column
    event_day2 TEXT,  -- Add this column
    registration_id TEXT NOT NULL
  )`);
});

module.exports = db;
