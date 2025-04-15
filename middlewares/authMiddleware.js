/*const jwt = require("jsonwebtoken");

exports.authMiddleware = (req, res, next) => {
    const token = req.header("Authorization");
    if (!token) return res.status(401).json({ error: "No token, authorization denied" });

    try {
        const decoded = jwt.verify(token, process.env.SECRET_KEY);
        req.user = decoded;
        next();
    } catch (error) {
        res.status(401).json({ error: "Invalid token" });
    }
};
*/
const jwt = require("jsonwebtoken");

exports.authMiddleware = (req, res, next) => {
    const token = req.header("Authorization"); // get token from the Authorization header
    if (!token) {
        return res.status(401).json({ error: "No token, authorization denied" });
    }

    // Remove the "Bearer " part of the token
    const tokenWithoutBearer = token.startsWith("Bearer ") ? token.slice(7) : token;

    try {
        // Verify token
        const decoded = jwt.verify(tokenWithoutBearer, process.env.SECRET_KEY);
        req.user = decoded; // Attach decoded user info to the request
        next();
    } catch (error) {
        res.status(401).json({ error: "Invalid token" });
    }
    console.log("Authorization Header:", req.headers.authorization);

};





