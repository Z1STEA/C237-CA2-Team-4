const express = require("express");
const router = express.Router();
const db = require("../config/db");
const isAuthenticated = require("../middleware/isAuthenticated");

router.get("/dashboard", isAuthenticated, (req, res) => {
    const currentUser = req.session.user;
    const isAdminUser = currentUser.role === "admin";

    const query = isAdminUser
        ? "SELECT * FROM portfolio ORDER BY updatedAt DESC"
        : "SELECT * FROM portfolio WHERE userId = ? ORDER BY updatedAt DESC";

    const queryValues = isAdminUser ? [] : [currentUser.id];

    db.query(query, queryValues, (err, portfolioEntries) => {
        if (err) {
            console.error("Error loading dashboard entries:", err);
            return res.status(500).send("Unable to load dashboard entries.");
        }

        res.render("dashboard", {
            user: currentUser,
            entries: portfolioEntries,
            updated: req.query.updated === "1"
        });
    });
});

module.exports = router;
