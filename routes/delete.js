const express = require("express");
const router = express.Router();
const db = require("../config/db");
const isAuthenticated = require("../middleware/isAuthenticated");

router.post("/deleteSkill/:id", isAuthenticated, async (req, res) => {
    try {
        const [skills] = await db.promise().execute(
            "SELECT id FROM skills WHERE id = ? AND userId = ?",
            [req.params.id, req.session.user.id]
        );

        if (skills.length === 0) {
            const [existingSkills] = await db.promise().execute(
                "SELECT id FROM skills WHERE id = ?",
                [req.params.id]
            );

            if (existingSkills.length === 0) {
                return res.status(404).send("Skill not found");
            }

            return res.status(403).send("Access Denied");
        }

        await db.promise().execute(
            "DELETE FROM skills WHERE id = ? AND userId = ?",
            [req.params.id, req.session.user.id]
        );

        res.redirect("/dashboard");
    } catch (error) {
        console.error(error);
        res.status(500).send("Unable to delete skill");
    }
});

module.exports = router;
