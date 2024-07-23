// server/routes/register.js

const express = require('express');
const router = express.Router();
const db = require('../db/database');
const sanitizeHtml = require('sanitize-html');
const path = require('path');

// Function to generate KCIYTF ID
const generateID = async () => {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    await connection.query(`UPDATE id_manager SET last_id = last_id + 1 WHERE id = 1`);
    const [rows] = await connection.query(`SELECT last_id FROM id_manager WHERE id = 1`);
    const id = rows[0].last_id.toString().padStart(4, '0'); // Pad with leading zeros
    await connection.commit();
    return 'KCIYTF' + id;
  } catch (err) {
    await connection.rollback();
    console.error('Database error:', err.message);
    throw err;
  } finally {
    connection.release();
  }
};

router.post('/register', async (req, res) => {
  const { name, phone, email, school, class: cls, eventDay1, eventDay2 } = req.body;

  // Sanitize input data
  const sanitizedData = {
    name: sanitizeHtml(name),
    phone: sanitizeHtml(phone),
    email: sanitizeHtml(email),
    school: sanitizeHtml(school),
    class: sanitizeHtml(cls),

    event_day1: sanitizeHtml(eventDay1),
    event_day2: sanitizeHtml(eventDay2)
  };

  try {
    // Generate KCIYTF ID
    const registrationID = await generateID();

    // Save to database
    const connection = await db.getConnection();
    try {
      await connection.query(`INSERT INTO participants (name, phone_number, email_id, school, class, event_day1, event_day2, registration_id) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [sanitizedData.name, sanitizedData.phone, sanitizedData.email, sanitizedData.school, sanitizedData.class,
          sanitizedData.event_day1, sanitizedData.event_day2, registrationID]);
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

router.get('/download-db', (req, res) => {
  const secret = req.query.secret;

  if (secret !== process.env.DOWNLOAD_SECRET) {
    return res.status(403).send('Forbidden');
  }

  // For MySQL, you would typically not download the DB file directly
  res.status(500).send('Download not supported for MySQL database.');
});

module.exports = router;
