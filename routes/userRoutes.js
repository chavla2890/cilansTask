const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const pool = require("../db");
const redisClient = require("../redisClient");
const authMiddleware = require("../middleware/auth");
const rateLimit = require("express-rate-limit");
const nodemailer = require("nodemailer");

const router = express.Router();

// Rate Limiting for Login
const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5,
    message: "Too many login attempts. Try again later."
});

// Nodemailer setup
const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    }
});

// Register User
router.post("/register", async (req, res) => {
    console.log("1");
    const { email, password, name } = req.body;
    if (!email || !password || !name) return res.status(400).json({ message: "All fields are required" });

    try {
        const userAlready = await pool.query('SELECT * FROM users WHERE email = $1', [email]);

        if (userAlready.rows.length > 0) {
            return res.status(400).json({ message: "User already exists" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = await pool.query(
            "INSERT INTO users (email, password, name) VALUES ($1, $2, $3) RETURNING id, email, name",
            [email, hashedPassword, name]
        );

        // Send Welcome Email
        await transporter.sendMail({
            from: process.env.SMTP_USER,
            to: email,
            subject: "Welcome to Our Aakash Task!",
            text: `Hello ${name}, Hope you are doing well welcome to our Aakash Task!`,
        });

        res.status(201).json({ message: "User registered successfully", user: newUser.rows[0] });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Login User
router.post("/login", loginLimiter, async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
        if (user.rows.length === 0) return res.status(400).json({ message: "Invalid credentials" });

        const validPassword = await bcrypt.compare(password, user.rows[0].password);
        if (!validPassword) return res.status(400).json({ message: "Invalid credentials" });

        const token = jwt.sign({ id: user.rows[0].id }, process.env.JWT_SECRET, { expiresIn: "1h" });
        res.json({ token });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get All Users (Paginated & Cached)
router.get("/users", authMiddleware, async (req, res) => {
    const { page = 1, limit = 10 } = req.query;
    const cacheKey = `users:${page}:${limit}`;

    try {
        const cachedUsers = await redisClient.get(cacheKey);
        if (cachedUsers) return res.json(JSON.parse(cachedUsers));

        const offset = (page - 1) * limit;
        const users = await pool.query("SELECT id, email, name FROM users LIMIT $1 OFFSET $2", [limit, offset]);

        await redisClient.setEx(cacheKey, 300, JSON.stringify(users.rows));
        res.json(users.rows);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get Profile
router.get("/profile", authMiddleware, async (req, res) => {
    try {
        const user = await pool.query("SELECT id, email, name FROM users WHERE id = $1", [req.user.id]);
        res.json(user.rows[0]);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Update Profile
router.put("/profile", authMiddleware, async (req, res) => {
    const { name } = req.body;
    if (!name) return res.status(400).json({ message: "Name is required" });

    try {
        await pool.query("UPDATE users SET name = $1 WHERE id = $2", [name, req.user.id]);
        await redisClient.del("users:*");
        res.json({ message: "Profile updated successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
