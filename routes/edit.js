const express = require("express");
const router = express.Router();
const db = require("../config/db");
const isAuthenticated = require("../middleware/isAuthenticated");

router.get("/editSkill", isAuthenticated, async (req, res) => {
    try {
        const [skills] = await db.promise().execute(
            "SELECT id, skillName, category, proficiencyLevel, description, dateStarted FROM skills WHERE id = ? AND userId = ?",
            [req.query.id, req.session.user.id]
        );

        if (skills.length === 0) {
            const [existingSkills] = await db.promise().execute(
                "SELECT id FROM skills WHERE id = ?",
                [req.query.id]
            );

            if (existingSkills.length === 0) {
                return res.status(404).send("Skill not found");
            }

            return res.status(403).send("Access Denied");
        }

        res.render("editSkill", {
            skill: skills[0]
        });
    } catch (error) {
        console.error(error);
        res.status(500).send("Unable to load skill");
    }
});

module.exports = router;
