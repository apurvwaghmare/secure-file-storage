// //db.js
// const mysql = require('mysql2');
// require('dotenv').config();

// const db = mysql.createConnection({
//     host: process.env.DB_HOST,
//     user: process.env.DB_USER,
//     password: process.env.DB_PASSWORD,
//     database: process.env.DB_NAME,
//     port:3306
// });

// // database access granted 
// db.connect(err => {
//     if (err) {
//         console.error('Database connection error:', err);
//         return;
//     }
//     console.log('Connected to MySQL database.');
// });

// module.exports = db;




// db.js
const mysql = require('mysql2/promise'); // Use promise-based connection
require('dotenv').config();

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: 3306,
    waitForConnections: true, // Ensure requests wait for a connection
    connectionLimit: 10,      // Maximum number of connections in the pool
    queueLimit: 0             // No limit on request queue
});

// Test the connection
pool.getConnection()
    .then(connection => {
        console.log('Connected to MySQL database.');
        connection.release(); // Release the connection back to the pool
    })
    .catch(err => {
        console.error('Database connection error:', err);
    });

module.exports = pool;
