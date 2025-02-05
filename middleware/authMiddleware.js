const jwt = require("jsonwebtoken");

exports.verifyToken = (req, res, next) => {
    const authHeader = req.header("Authorization"); 
    if (!authHeader) {
        return res.status(401).json({ error: "Access Denied. No token provided." });
    }

    const token = authHeader.split(" ")[1];
    if (!token) {
        return res.status(401).json({ error: "Access Denied. Invalid token format." });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET); 
        req.user = decoded;
        next(); 
    } catch (err) {
        return res.status(400).json({ error: "Invalid Token" });
    }
};
