/**
 * Login System Server
 * This file handles all server-side operations including:
 * - Database connection and setup
 * - User authentication (register, login, logout)
 * - Session management
 * - Route handling
 */

require('dotenv').config();
const express = require('express');
const mysql = require('mysql2');
const bcrypt = require('bcryptjs');
const session = require('express-session');
const MySQLStore = require('connect-mysql')(session);
const path = require('path');

// Initialize Express application
const app = express();

/**
 * Middleware Configuration
 * - express.json(): Parse JSON request bodies
 * - express.urlencoded(): Parse URL-encoded request bodies
 * - express.static(): Serve static files from 'public' directory
 */
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

/**
 * MySQL Database Connection
 * Initial connection without database selection to allow database creation
 */
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: ''
});

/**
 * Database Setup and Connection
 * 1. Connect to MySQL server
 * 2. Create database if it doesn't exist
 * 3. Select the database
 * 4. Create users table if it doesn't exist
 */
db.connect((err) => {
    if (err) {
        console.error('Error connecting to MySQL:', err);
        return;
    }
    console.log('Connected to MySQL');

    // Create database if it doesn't exist
    db.query('CREATE DATABASE IF NOT EXISTS login_system', (err) => {
        if (err) {
            console.error('Error creating database:', err);
            return;
        }
        console.log('Database ready');

        // Select the database
        db.query('USE login_system', (err) => {
            if (err) {
                console.error('Error using database:', err);
                return;
            }
            console.log('Using login_system database');
            
            // Create users table with required fields
            const createTableQuery = `
                CREATE TABLE IF NOT EXISTS users (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    username VARCHAR(255) UNIQUE NOT NULL,
                    password VARCHAR(255) NOT NULL,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            `;
            
            db.query(createTableQuery, (err) => {
                if (err) {
                    console.error('Error creating users table:', err);
                    return;
                }
                console.log('Users table ready');
            });
        });
    });
});

/**
 * Session Configuration
 * - secret: Used to sign the session ID cookie
 * - resave: Don't save session if unmodified
 * - saveUninitialized: Don't create session until something stored
 * - store: Use MySQL to store session data
 * - cookie: Configure session cookie settings
 */
app.use(session({
    secret: process.env.SESSION_SECRET || 'your-secret-key',
    resave: false,
    saveUninitialized: false,
    store: new MySQLStore({
        config: {
            host: 'localhost',
            user: 'root',
            password: '',
            database: 'login_system'
        }
    }),
    cookie: {
        maxAge: 1000 * 60 * 60 * 24 // 1 day
    }
}));

/**
 * Route Handlers
 */

// Serve the main login/registration page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Serve the profile page
app.get('/profile', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'profile.html'));
});

/**
 * User Registration
 * 1. Check if username already exists
 * 2. Hash the password
 * 3. Create new user in database
 */
app.post('/register', async (req, res) => {
    try {
        const { username, password } = req.body;
        
        // Check for existing username
        db.query('SELECT * FROM users WHERE username = ?', [username], async (err, results) => {
            if (err) {
                console.error('Error checking user:', err);
                return res.status(500).json({ message: 'Error registering user' });
            }
            
            if (results.length > 0) {
                return res.status(400).json({ message: 'Username already exists' });
            }

            // Hash password with bcrypt
            const hashedPassword = await bcrypt.hash(password, 10);

            // Insert new user
            db.query('INSERT INTO users (username, password) VALUES (?, ?)', 
                [username, hashedPassword],
                (err) => {
                    if (err) {
                        console.error('Error creating user:', err);
                        return res.status(500).json({ message: 'Error registering user' });
                    }
                    res.status(201).json({ message: 'User registered successfully' });
                }
            );
        });
    } catch (error) {
        console.error('Error in register route:', error);
        res.status(500).json({ message: 'Error registering user' });
    }
});

/**
 * User Login
 * 1. Find user by username
 * 2. Verify password
 * 3. Create session
 */
app.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;

        // Find user in database
        db.query('SELECT * FROM users WHERE username = ?', [username], async (err, results) => {
            if (err) {
                console.error('Error finding user:', err);
                return res.status(500).json({ message: 'Error logging in' });
            }

            if (results.length === 0) {
                return res.status(400).json({ message: 'User not found' });
            }

            const user = results[0];

            // Verify password
            const validPassword = await bcrypt.compare(password, user.password);
            if (!validPassword) {
                return res.status(400).json({ message: 'Invalid password' });
            }

            // Create session
            req.session.userId = user.id;
            res.json({ message: 'Login successful' });
        });
    } catch (error) {
        console.error('Error in login route:', error);
        res.status(500).json({ message: 'Error logging in' });
    }
});

/**
 * User Logout
 * Destroys the current session
 */
app.post('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error('Error destroying session:', err);
            return res.status(500).json({ message: 'Error logging out' });
        }
        res.json({ message: 'Logged out successfully' });
    });
});

/**
 * Authentication Status Check
 * Returns whether the current user is authenticated
 */
app.get('/check-auth', (req, res) => {
    if (req.session.userId) {
        res.json({ isAuthenticated: true });
    } else {
        res.json({ isAuthenticated: false });
    }
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
}); 