const express = require("express");
const router = express.Router();
const db = require("../config/db");
const isAuthenticated = require("../middleware/isAuthenticated");

const PROFICIENCY_LEVELS = ["Beginner", "Intermediate", "Advanced", "Expert"];

function validateSkillInput({ skillName, category, proficiencyLevel, description, dateStarted }) {
    const errors = [];
    const trimmedSkillName = (skillName || "").trim();
    const trimmedCategory = (category || "").trim();
    const trimmedDescription = (description || "").trim();

    if (!trimmedSkillName) {
        errors.push("Skill name is required.");
    } else if (trimmedSkillName.length > 100) {
        errors.push("Skill name must be 100 characters or fewer.");
    }

    if (!trimmedCategory) {
        errors.push("Category is required.");
    } else if (trimmedCategory.length > 50) {
        errors.push("Category must be 50 characters or fewer.");
    }

    if (!PROFICIENCY_LEVELS.includes(proficiencyLevel)) {
        errors.push("Please select a valid proficiency level.");
    }

    if (trimmedDescription.length > 255) {
        errors.push("Description must be 255 characters or fewer.");
    }

    if (!dateStarted) {
        errors.push("Date started is required.");
    } else {
        const parsedDate = new Date(dateStarted);
        if (Number.isNaN(parsedDate.getTime())) {
            errors.push("Please enter a valid start date.");
        } else if (parsedDate > new Date()) {
            errors.push("Date started cannot be in the future.");
        }
    }

    return {
        errors,
        cleaned: {
            skillName: trimmedSkillName,
            category: trimmedCategory,
            proficiencyLevel,
            description: trimmedDescription,
            dateStarted
        }
    };
}

router.get("/editSkill", isAuthenticated, async (req, res) => {
    try {
        const skillId = Number(req.query.id);

        if (!Number.isInteger(skillId) || skillId <= 0) {
            return res.status(400).send("Invalid skill ID");
        }

        const [skills] = await db.promise().execute(
            "SELECT id, skillName, category, proficiencyLevel, description, dateStarted FROM skills WHERE id = ? AND userId = ?",
            [skillId, req.session.user.id]
        );

        if (skills.length === 0) {
            const [existingSkills] = await db.promise().execute(
                "SELECT id FROM skills WHERE id = ?",
                [skillId]
            );

            if (existingSkills.length === 0) {
                return res.status(404).send("Skill not found");
            }

            return res.status(403).send("Access Denied");
        }

        res.render("editSkill", {
            skill: skills[0],
            proficiencyLevels: PROFICIENCY_LEVELS,
            errors: []
        });
    } catch (error) {
        console.error(error);
        res.status(500).send("Unable to load skill");
    }
});

router.post("/editSkill", isAuthenticated, async (req, res) => {
    try {
        const skillId = Number(req.query.id);

        if (!Number.isInteger(skillId) || skillId <= 0) {
            return res.status(400).send("Invalid skill ID");
        }

        const [skills] = await db.promise().execute(
            "SELECT id, userId, skillName, category, proficiencyLevel, description, dateStarted FROM skills WHERE id = ? AND userId = ?",
            [skillId, req.session.user.id]
        );

        if (skills.length === 0) {
            const [existingSkills] = await db.promise().execute(
                "SELECT id FROM skills WHERE id = ?",
                [skillId]
            );

            if (existingSkills.length === 0) {
                return res.status(404).send("Skill not found");
            }

            return res.status(403).send("Access Denied");
        }

        const { errors, cleaned } = validateSkillInput(req.body);

        if (errors.length > 0) {
            return res.status(400).render("editSkill", {
                skill: {
                    ...skills[0],
                    ...req.body,
                    id: skillId
                },
                proficiencyLevels: PROFICIENCY_LEVELS,
                errors
            });
        }

        await db.promise().execute(
            `UPDATE skills
             SET skillName = ?, category = ?, proficiencyLevel = ?, description = ?, dateStarted = ?
             WHERE id = ? AND userId = ?`,
            [
                cleaned.skillName,
                cleaned.category,
                cleaned.proficiencyLevel,
                cleaned.description || null,
                cleaned.dateStarted,
                skillId,
                req.session.user.id
            ]
        );

        res.redirect("/dashboard?updated=1");
    } catch (error) {
        console.error(error);
        res.status(500).send("Unable to update skill");
    }
});

module.exports = router;
