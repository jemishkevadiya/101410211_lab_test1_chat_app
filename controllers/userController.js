const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const blacklist = new Set();

exports.signup = async (req, res) => {
    try {
        const { username, firstname, lastname, password } = req.body;

        const existingUser = await User.findOne({ username });

        if (!username) {
            return res.status(400).json({ error: "Username is required" });
        }

        if (existingUser) {
            return res.status(400).json({ error: "Username already taken" });
        }

        if (!firstname) {
            return res.status(400).json({ error: "Firstname is required" });
        }

        if (!lastname) {
            return res.status(400).json({ error: "Lastname is required" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = new User({
            username,
            firstname,
            lastname,
            password: hashedPassword
        });

        await newUser.save();
        res.status(201).json({ message: "User registered successfully" });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.login = async (req, res) => {
    const { username, password } = req.body;

    try {
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        const isMatch = await user.matchPassword(password);
        if (!isMatch) {
            return res.status(401).json({ error: "Invalid password" });
        }

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
            expiresIn: "1h",
        });

        res.status(200).json({ token, username: user.username });
    } catch (error) {
        res.status(500).json({ error: "Internal server error" });
    }
};

exports.getUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.userId).select("-password"); 
        if (!user) return res.status(404).json({ error: "User not found" });

        res.json(user); 
    } catch (err) {
        res.status(500).json({ error: err.message }); 
    }
};


exports.logout = async (req, res) => {
    res.status(200).json({
        message: "Logged out successfully. Please clear the token from localStorage on the frontend."
    });
};