 // db.js
const mysql = require('mysql2');
require('dotenv').config();

const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port:3306
});

db.connect(err => {
    if (err) {
        // checking error
        console.error('Database connection error:', err);
        return;
    }
    // connected to database
    console.log('Connected to MySQL database.');
});

module.exports = db;


