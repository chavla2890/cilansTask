const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
    const token = req.header("Authorization");
    if (!token) return res.status(401).json({ message: "Access denied" });

    try {
        // console.log("1")
        const decoded = jwt.verify(token.split(" ")[1], process.env.JWT_SECRET);
        // console.log("2")
        req.user = decoded;
        // console.log("3")
        
        next();
    } catch (err) {
        res.status(400).json({ message: "Invalid token" });
    }
};
