const jwt = require("jsonwebtoken");


exports.authenticatePepiniere = (req, res, next) => {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
        return res.status(401).json({ message: "Unauthorized! No token provided." });
    }

    jwt.verify(token, process.env.SECRET_KEY, (err, decoded) => {
        if (err) {
            return res.status(401).json({ message: "Invalid token!" });
        }
        req.pepiniereId = decoded.id;
        next();
    });
};

