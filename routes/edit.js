const express = require("express");
const router = express.Router();
const db = require("../config/db");
const isAuthenticated = require("../middleware/isAuthenticated");
const CATEGORIES = ["Skill", "Project", "Certification", "Achievement"];
const STATUSES = ["Pending", "Verified"];

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

function validatePortfolioInput({ title, category, description }) {
    const errors = [];

    const trimmedTitle = (title || "").trim();
    const trimmedDescription = (description || "").trim();

    if (!trimmedTitle) {
        errors.push("Title is required.");
    } else if (trimmedTitle.length > 150) {
        errors.push("Title must be 150 characters or fewer.");
    }

    if (!CATEGORIES.includes(category)) {
        errors.push("Please select a valid category.");
    }

    if (trimmedDescription.length > 2000) {
        errors.push("Description must be 2000 characters or fewer.");
    }

    return {
        errors,
        cleaned: {
            title: trimmedTitle,
            category,
            description: trimmedDescription
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
// GET /editPortfolio/:id - show the edit form pre-filled with the entry's current data
router.get("/editPortfolio/:id", isAuthenticated, (req, res) => {
    const entryId = Number(req.params.id);

    if (!Number.isInteger(entryId) || entryId <= 0) {
        return res.status(400).send("Invalid portfolio entry ID.");
    }

    db.query("SELECT * FROM portfolio WHERE portfolioId = ?", [entryId], (err, results) => {
        if (err) {
            console.error("Error fetching portfolio entry for edit:", err);
            return res.status(500).send("Something went wrong while loading the entry.");
        }

        if (results.length === 0) {
            return res.status(404).send("Portfolio entry not found.");
        }

        const entry = results[0];
        const currentUser = req.session.user;
        const isOwner = entry.userId === currentUser.id;
        const isAdminUser = currentUser.role === "admin";

        if (!isOwner && !isAdminUser) {
            return res.status(403).send("Access Denied: You can only edit your own portfolio entries.");
        }

        res.render("editPortfolio", {
            entry,
            categories: CATEGORIES,
            statuses: STATUSES,
            isAdmin: isAdminUser,
            errors: []
        });
    });
});

// POST /editPortfolio/:id - validate input and update the portfolio entry
router.post("/editPortfolio/:id", isAuthenticated, (req, res) => {
    const entryId = Number(req.params.id);

    if (!Number.isInteger(entryId) || entryId <= 0) {
        return res.status(400).send("Invalid portfolio entry ID.");
    }

    db.query("SELECT * FROM portfolio WHERE portfolioId = ?", [entryId], (err, results) => {
        if (err) {
            console.error("Error fetching portfolio entry for update:", err);
            return res.status(500).send("Something went wrong while loading the entry.");
        }

        if (results.length === 0) {
            return res.status(404).send("Portfolio entry not found.");
        }

        const existingEntry = results[0];
        const currentUser = req.session.user;
        const isOwner = existingEntry.userId === currentUser.id;
        const isAdminUser = currentUser.role === "admin";

        if (!isOwner && !isAdminUser) {
            return res.status(403).send("Access Denied: You can only edit your own portfolio entries.");
        }

        const { errors, cleaned } = validatePortfolioInput(req.body);

        if (errors.length > 0) {
            return res.status(400).render("editPortfolio", {
                entry: { ...existingEntry, ...req.body },
                categories: CATEGORIES,
                statuses: STATUSES,
                isAdmin: isAdminUser,
                errors
            });
        }

        let newStatus = existingEntry.status;

        if (isAdminUser && STATUSES.includes(req.body.status)) {
            newStatus = req.body.status;
        } else if (isOwner && existingEntry.status === "Verified") {
            newStatus = "Pending";
        }

        const updateQuery = `
            UPDATE portfolio
            SET title = ?, category = ?, description = ?, status = ?
            WHERE portfolioId = ?
        `;

        db.query(
            updateQuery,
            [
                cleaned.title,
                cleaned.category,
                cleaned.description || null,
                newStatus,
                entryId
            ],
            (updateErr) => {
                if (updateErr) {
                    console.error("Error updating portfolio entry:", updateErr);
                    return res.status(500).send("Something went wrong while updating the entry.");
                }

                res.redirect("/dashboard?updated=1");
            }
        );
    });
});
module.exports = router;
