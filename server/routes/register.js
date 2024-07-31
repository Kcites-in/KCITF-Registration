// server/routes/register.js
/*
const express = require('express');
const router = express.Router();
const db = require('../db/database');
const sanitizeHtml = require('sanitize-html');
const path = require('path');

// Function to generate KCIYTF ID
router.post('/register', async (req, res) => {
  const { name, phone, email, class: cls, section, eventDay1, eventDay2 } = req.body;

  // Sanitize input data
  const sanitizedData = {
    name: sanitizeHtml(name),
    phone: sanitizeHtml(phone),
    email: sanitizeHtml(email),
    class: sanitizeHtml(cls),
    section: sanitizeHtml(section),
    event_day1: sanitizeHtml(eventDay1),
    event_day2: sanitizeHtml(eventDay2)
  };

  try {
   
    // Save to database
    const connection = await db.getConnection();
    try {
      await connection.query(`INSERT INTO participants (name, phone_number, email_id, section, class, event_day1, event_day2) 
        VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [sanitizedData.name, sanitizedData.phone, sanitizedData.email, sanitizedData.section, sanitizedData.class,
          sanitizedData.event_day1, sanitizedData.event_day2]);
          const insertedId = result.insertId;
          console.log(`New registration inserted with ID ${insertedId}`);
          res.status(200).json({ id: insertedId });
    } finally {
      connection.release();
    }
  } catch (err) {
    console.error('Error generating ID:', err.message);
    res.status(500).json({ message: 'Registration failed. Please try again later.' });
  }
});

router.get('/download-db', (req, res) => {
  const secret = req.query.secret;

  if (secret !== process.env.DOWNLOAD_SECRET) {
    return res.status(403).send('Forbidden');
  }

  // For MySQL, you would typically not download the DB file directly
  res.status(500).send('Download not supported for MySQL database.');
});

module.exports = router;
*/
// server/routes/register.js

const express = require('express');
const router = express.Router();
const db = require('../db/database');
const sanitizeHtml = require('sanitize-html');

// Function to generate KCITF ID
const generateID = async () => {
    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();

        // Get the current last_id
        const [rows] = await connection.query('SELECT last_id FROM id_manager WHERE id = 1 FOR UPDATE');
        const lastId = rows[0].last_id;

        // Increment the ID
        const newId = lastId + 1;
        await connection.query('UPDATE id_manager SET last_id = ? WHERE id = 1', [newId]);

        // Commit the transaction
        await connection.commit();

        // Format the ID
        const id = newId.toString().padStart(4, '0'); // Pad with leading zeros
        return 'KCITF' + id;
    } catch (err) {
        await connection.rollback();
        console.error('Database error:', err.message);
        throw err;
    } finally {
        connection.release();
    }
};

router.post('/register', async (req, res) => {
    const { name, phone, email, class: cls, section, eventDay1, eventDay2 } = req.body;

    // Sanitize input data
    const sanitizedData = {
        name: sanitizeHtml(name),
        phone: sanitizeHtml(phone),
        email: sanitizeHtml(email),
        class: sanitizeHtml(cls),
        section: sanitizeHtml(section),
        event_day1: sanitizeHtml(eventDay1),
        event_day2: sanitizeHtml(eventDay2)
    };

    try {
        // Generate KCITF ID
        const registrationID = await generateID();

        // Save to database
        const connection = await db.getConnection();
        try {
            const [result] = await connection.query(
                `INSERT INTO participants (name, phone_number, email_id, class, section, event_day1, event_day2, registration_id) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                [sanitizedData.name, sanitizedData.phone, sanitizedData.email, sanitizedData.class, sanitizedData.section,
                 sanitizedData.event_day1, sanitizedData.event_day2, registrationID]
            );

            console.log('New registration inserted with ID:', registrationID);
            res.status(200).json({ id: registrationID });
        } finally {
            connection.release();
        }
    } catch (err) {
        console.error('Error generating ID:', err.message);
        res.status(500).json({ message: 'Registration failed. Please try again later.' });
    }
});

module.exports = router;
