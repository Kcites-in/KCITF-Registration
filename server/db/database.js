// server/db/database.js
const mysql = require("mysql2/promise");
require("dotenv").config();

// !: add DB info 
// const db = mysql.createPool({
//   host: process.env.DB_HOST,
//   user: process.env.DB_USER,
//   password: process.env.DB_PASSWORD,
//   database: process.env.DB_DATABSE,
//   port: process.env.DB_PORT,
// });

const db = mysql.createPool(
  {
    host: 'mysql-357cf0df-kcisclubcoalition-b16e.i.aivencloud.com',
    user: 'avnadmin',
    password: 'AVNS_HbJzgpGLq1IF5As4W35',
    database: 'defaultdb',
    port: 14688
  }
);

console.log({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABSE,
  port: process.env.DB_PORT,
})

// Create tables if they don't exist
async function initializeDatabase() {
  const connection = await db.getConnection();
  console.log(await connection.ping())
  try {
    await connection.query(`
      CREATE TABLE IF NOT EXISTS id_manager (
        id INT PRIMARY KEY AUTO_INCREMENT,
        last_id INT NOT NULL
      )
    `);

    const [rows] = await connection.query(
      "SELECT * FROM id_manager WHERE id = 1"
    );
    if (rows.length === 0) {
      await connection.query(
        "INSERT INTO id_manager (id, last_id) VALUES (1, 0)"
      );
    }

    await connection.query(`
      CREATE TABLE IF NOT EXISTS participants (
        id INT PRIMARY KEY AUTO_INCREMENT,
        name VARCHAR(255) NOT NULL,
        phone_number VARCHAR(255) NOT NULL,
        school VARCHAR(255) NOT NULL,
        email_id VARCHAR(255) NOT NULL,
        class VARCHAR(255) NOT NULL,
        event_day1 VARCHAR(255),
        event_day2 VARCHAR(255),
        registration_id VARCHAR(255) NOT NULL
      )
    `);
  } finally {
    connection.release();
  }
}

initializeDatabase().catch((err) => {
  console.error("Database initialization error:", err.message);
});

module.exports = db;
