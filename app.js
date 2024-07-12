// app.js

const express = require('express');
const bodyParser = require('body-parser');
const db = require('./server/db/database');
const registerRoute = require('./public/js/register');
require('dotenv').config();

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static('public'));
app.use('/', registerRoute);

// Initialize database and ID manager
db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS id_manager (
        id INTEGER PRIMARY KEY,
        last_id INTEGER NOT NULL
    )`);

    // Ensure there is at least one row with ID 1
    db.get(`SELECT * FROM id_manager WHERE id = 1`, (err, row) => {
        if (err) {
            console.error('Database error:', err.message);
        } else if (!row) {
            // Insert initial last_id value if the table is empty
            db.run(`INSERT INTO id_manager (id, last_id) VALUES (1, 0)`, (err) => {
                if (err) {
                    console.error('Database error:', err.message);
                }
            });
        }
    });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

module.exports = app;
