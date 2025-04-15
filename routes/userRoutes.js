const express = require("express");
const router = express.Router();

router.get("/", (req, res) => {
    res.send("User routes working!");
});

module.exports = router;