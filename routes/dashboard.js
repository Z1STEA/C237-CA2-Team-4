const express = require("express");
const router = express.Router();
const db = require("../config/db");
const isAuthenticated = require("../middleware/isAuthenticated");

router.get("/dashboard", isAuthenticated, async (req, res) => {
    const user = req.session.user;

    try {
        const [skills] = await db.promise().execute(
            "SELECT id, skillName AS skill_name, category, proficiencyLevel AS status, description, dateStarted FROM skills WHERE userId = ? ORDER BY id DESC",
            [user.id]
        );

        const [submissions] = await db.promise().execute(
            "SELECT portfolioId, title, category, description, status, createdAt FROM portfolio WHERE studentName = ? ORDER BY createdAt DESC",
            [user.name]
        );

        res.render("dashboard", {
            user,
            skills,
            submissions
        });
    } catch (error) {
        console.error(error);
        res.status(500).send("Unable to load dashboard");
    }
});

module.exports = router;
