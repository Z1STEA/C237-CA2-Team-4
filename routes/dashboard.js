const express = require("express");
const router = express.Router();
const db = require("../config/db");
const isAuthenticated = require("../middleware/isAuthenticated");

router.get("/dashboard", isAuthenticated, async (req, res) => {
    const user = req.session.user;

    try {
        const [submissions] = await db.promise().execute(
            "SELECT portfolioId, title, category, description, status, createdAt FROM portfolio WHERE userId = ? ORDER BY createdAt DESC",
            [user.id]
        );

        res.render("dashboard", {
            user,
            submissions
        });

    } catch (error) {
        console.error(error);
        res.status(500).send("Unable to load dashboard");
    }
});

module.exports = router;
