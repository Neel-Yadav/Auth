const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Configuration values
const PORT = 3000;
const SECRET_KEY = 'your_jwt_secret_key';  // Replace with a secure key
const TOKEN_EXPIRATION = '1h';
const REFRESH_TOKEN_EXPIRATION = '7d';

const DB_FILE = path.join(__dirname, 'db.json');

// Helper functions to read and write to the JSON file
const readDB = () => {
    const data = fs.readFileSync(DB_FILE, 'utf-8');
    return JSON.parse(data);
};

const writeDB = (data) => {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
};

// Initialize the JSON file if it doesn't exist
if (!fs.existsSync(DB_FILE)) {
    writeDB({ users: {} });
}

// Register endpoint
app.post('/register', async (req, res) => {
    const { firstName, lastName, dob, username, password } = req.body;
    if (!firstName || !lastName || !dob || !username || !password) {
        return res.status(400).json({ message: "All fields are required" });
    }

    const db = readDB();
    
    // Check if username already exists
    if (db.users[username]) {
        return res.status(400).json({ message: "Username already taken" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const userId = `${username}`; // Create a user ID by appending '@cyro.com'

    db.users[username] = {
        userId, // Store userId as the username with '@cyro.com'
        firstName,
        lastName,
        dob,
        password: hashedPassword
    };

    writeDB(db);
    res.json({ userId });
});

// Login endpoint
app.post('/login', async (req, res) => {
    const { userId, password } = req.body;
    const username = userId.split('@')[0]; // Extract username from userId
    const db = readDB();
    const user = db.users[username];

    if (!user || !(await bcrypt.compare(password, user.password))) {
        return res.status(401).json({ message: "Invalid credentials" });
    }

    // Generate JWT token
    const accessToken = jwt.sign({ userId: user.userId }, SECRET_KEY, { expiresIn: TOKEN_EXPIRATION });
    const refreshToken = jwt.sign({ userId: user.userId }, SECRET_KEY, { expiresIn: REFRESH_TOKEN_EXPIRATION });

    res.json({ accessToken, refreshToken });
});

// Middleware to verify token
function authenticateToken(req, res, next) {
    const token = req.headers['authorization'];
    if (!token) return res.status(403).json({ message: "Token required" });

    jwt.verify(token, SECRET_KEY, (err, user) => {
        if (err) return res.status(403).json({ message: "Invalid token" });
        req.user = user;
        next();
    });
}

// Protected route
app.get('/protected', authenticateToken, (req, res) => {
    const username = req.user.userId.split('@')[0]; // Get username from userId
    const db = readDB();
    const user = db.users[username];
    res.json({ message: "This is a protected route", user: { firstName: user.firstName, lastName: user.lastName, dob: user.dob, userId: user.userId } });
});

// Refresh token endpoint
app.post('/refresh-token', (req, res) => {
    const { refreshToken } = req.body;
    if (!refreshToken) return res.status(401).json({ message: "Refresh token required" });

    jwt.verify(refreshToken, SECRET_KEY, (err, user) => {
        if (err) return res.status(403).json({ message: "Invalid refresh token" });
        
        const newAccessToken = jwt.sign({ userId: user.userId }, SECRET_KEY, { expiresIn: TOKEN_EXPIRATION });
        res.json({ accessToken: newAccessToken });
    });
});

// Start the server
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));