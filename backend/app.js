require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const os = require('os');
const fs = require('fs');
const session = require('express-session');
const bcrypt = require('bcrypt');
const fileUpload = require('express-fileupload');
const crypto = require('crypto');
const blowfish = require('./blowfish');
const mailer = require('./mailer');
const { uploadFileToS3, downloadFileFromS3 } = require('./aws');
const db = require('./db');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({
    origin: 'https://safefileshare.netlify.app',
    credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '../frontend')));
app.use(fileUpload());
app.use(session({
    secret: process.env.SESSION_SECRET || 'your-secret-key',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: true }
}));

app.post('/register', async (req, res) => {
    const { email, password } = req.body;
    try {
        const checkQuery = 'SELECT * FROM users WHERE email = ?';
        db.query(checkQuery, [email], async (err, results) => {
            if (err) return res.status(500).json({ message: 'Error checking user.' });
            if (results.length > 0) return res.status(400).json({ message: 'Email already exists.' });

            const hashedPassword = await bcrypt.hash(password, 10);
            const insertQuery = 'INSERT INTO users (email, password) VALUES (?, ?)';
            db.query(insertQuery, [email, hashedPassword], (err) => {
                if (err) return res.status(500).json({ message: 'Error registering user.' });
                req.session.user = { email };
                return res.status(200).json({ message: 'User registered successfully!' });
            });
        });
    } catch (error) {
        return res.status(500).json({ message: 'Internal server error.' });
    }
});

app.post('/login', (req, res) => {
    const { email, password } = req.body;
    const query = 'SELECT * FROM users WHERE email = ?';
    db.query(query, [email], async (err, results) => {
        if (err) return res.status(500).json({ message: 'Error logging in.' });
        if (results.length === 0) return res.status(400).json({ message: 'Invalid email or password.' });

        const user = results[0];
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: 'Invalid email or password.' });

        req.session.user = { email };
        return res.status(200).json({ message: 'Login successful!' });
    });
});

app.post('/upload', async (req, res) => {
    if (!req.files || !req.files.file) return res.status(400).json({ message: 'No file uploaded.' });

    const { email } = req.body;
    const file = req.files.file;
    const encryptionKey = blowfish.generateKey();
    const s3FileKey = crypto.randomBytes(16).toString('hex');
    const uploadPath = path.join(os.tmpdir(), file.name);

    file.mv(uploadPath, async (err) => {
        if (err) return res.status(500).json({ message: 'File upload failed.' });

        try {
            await blowfish.encryptFile(uploadPath, uploadPath, encryptionKey);
            await uploadFileToS3(uploadPath, process.env.AWS_BUCKET_NAME, s3FileKey);

            const emailContent = `
                <p>Your file has been encrypted and stored securely.</p>
                <p>Encryption Key: <strong>${encryptionKey}</strong></p>
                <p>S3 File Key: <strong>${s3FileKey}</strong></p>
            `;

            await mailer.send(email, 'Your Encryption Keys', emailContent);
            res.status(200).json({ message: 'File uploaded and encrypted successfully! An email with your encryption key and S3 file key has been sent.' });
        } catch (error) {
            return res.status(500).json({ message: 'Error during file processing.' });
        } finally {
            fs.unlink(uploadPath, (err) => {
                if (err) console.error('Error deleting uploaded file:', err);
            });
        }
    });
});

app.post('/decrypt', async (req, res) => {
    const { encryptionKey, s3FileKey } = req.body;
    if (!encryptionKey || !s3FileKey) return res.status(400).json({ message: 'Please provide both encryption key and S3 file key.' });

    const filePath = path.join(os.tmpdir(), `${s3FileKey}.encrypted`);

    try {
        await downloadFileFromS3(s3FileKey, process.env.AWS_BUCKET_NAME, filePath);
        const decryptedFilePath = filePath.replace('.encrypted', '');

        await blowfish.decryptFile(filePath, decryptedFilePath, encryptionKey);

        res.download(decryptedFilePath, (err) => {
            if (err) return res.status(500).json({ message: 'Error downloading the file.' });

            fs.unlink(decryptedFilePath, (err) => {
                if (err) console.error('Error deleting decrypted file:', err);
            });
        });
    } catch (error) {
        return res.status(500).json({ message: 'Error during decryption process.' });
    }
});

app.post('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) return res.status(500).send('Could not log out.');
        res.status(200).send('Logged out successfully.');
    });
});

app.use((req, res) => {
    res.status(404).send('404 Not Found');
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
