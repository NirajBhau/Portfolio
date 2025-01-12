const express = require('express');
const bodyParser = require('body-parser');
const sql = require('mssql');

// MSSQL Configuration for Windows Authentication
const dbConfig = {
    server: 'DESKTOP-CEIB8QQ\NIRAJ', // e.g., localhost or IP
    database: 'ContactFormDB',
    options: {
        encrypt: true, // Use encryption for Azure SQL
        trustServerCertificate: true, // Required for local development
    },
    authentication: {
        type: 'ntlm',
        options: {
            domain: 'your-domain', // Replace with your Windows domain or leave empty for a local system
            userName: process.env.USERNAME, // Use the system's logged-in user
            password: process.env.PASSWORD, // Optional; not required for Windows Integrated Authentication
        },
    },
};

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Endpoint for form submission
app.post('/submit', async (req, res) => {
    const { name, email, subject, message } = req.body;

    try {
        // Connect to MSSQL
        const pool = await sql.connect(dbConfig);

        // Insert data into the Submissions table
        await pool.request()
            .input('Name', sql.NVarChar(100), name)
            .input('Email', sql.NVarChar(100), email)
            .input('Subject', sql.NVarChar(255), subject)
            .input('Message', sql.NVarChar(sql.MAX), message)
            .query(`
                INSERT INTO Submissions (Name, Email, Subject, Message)
                VALUES (@Name, @Email, @Subject, @Message)
            `);

        res.status(200).send('Form submitted successfully!');
    } catch (err) {
        console.error('Database error:', err);
        res.status(500).send('Error submitting form.');
    }
});

// Start the server
app.listen(3000, () => {
    console.log('Server is running on port 3000');
});
