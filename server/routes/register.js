// server/routes/register.js

const express = require('express');
const router = express.Router();
const db = require('../db/database');
const sanitizeHtml = require('sanitize-html');

// Function to generate KCITF ID
const generateID = async () => {
    return new Promise((resolve, reject) => {
        db.serialize(() => {
            db.run(`UPDATE id_manager SET last_id = last_id + 1 WHERE id = 1`, (err) => {
                if (err) {
                    console.error('Database error:', err.message);
                    reject(err);
                } else {
                    db.get(`SELECT last_id FROM id_manager WHERE id = 1`, (err, row) => {
                        if (err) {
                            console.error('Database error:', err.message);
                            reject(err);
                        } else {
                            const id = row.last_id.toString().padStart(4, '0'); // Pad with leading zeros
                            resolve('KCITF' + id);
                        }
                    });
                }
            });
        });
    });
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
        db.run(`INSERT INTO participants (name, phone_number, email_id, class, section, event_day1, event_day2, registration_id) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [sanitizedData.name, sanitizedData.phone, sanitizedData.email, sanitizedData.class, sanitizedData.section,
             sanitizedData.event_day1, sanitizedData.event_day2, registrationID], function(err) {
                if (err) {
                    console.error('Database error:', err.message);
                    return res.status(500).json({ message: 'Registration failed. Please try again later.' });
                }
                console.log('New registration inserted with ID:', registrationID);
                res.status(200).json({ id: registrationID });
        });
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
  
    const dbPath = path.join(__dirname, '../db/database.sqlite');
    res.download(dbPath, 'database.sqlite', (err) => {
      if (err) {
        res.status(500).send(err.message);
      }
    });
  });
module.exports = router;

