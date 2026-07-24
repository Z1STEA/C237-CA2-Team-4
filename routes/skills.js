const express = require("express");
const router = express.Router();
const db = require("../config/db");
const isAuthenticated = require("../middleware/isAuthenticated");

router.get("/addSkill", isAuthenticated, (req, res) => {
    res.render("addSkill", {
        error: null,
        success: null,
        formData: {}
    });
});

router.post("/addSkill", isAuthenticated, (req, res) => {

    const {
        skillName,
        category,
        otherDescription,
        proficiencyLevel,
        description,
        dateStarted
    } = req.body;

    let finalCategory = category;

    if (category === "Others") {
        finalCategory = otherDescription.trim();
    }

    if (!skillName || !finalCategory || !proficiencyLevel || !dateStarted) {
        return res.render("addSkill", {
            error: "Please fill in all required fields.",
            success: null,
            formData: req.body
        });
    }

    db.query(
        `INSERT INTO skills
        (userId, skillName, category, proficiencyLevel, description, dateStarted)
        VALUES (?, ?, ?, ?, ?, ?)`,
        [
            req.session.user.id,
            skillName,
            finalCategory,
            proficiencyLevel,
            description,
            dateStarted
        ],
        (err) => {

            if (err) {
                console.error(err);

                return res.render("addSkill", {
                    error: "Unable to add skill.",
                    success: null,
                    formData: req.body
                });
            }

            res.render("addSkill", {
                error: null,
                success: "Skill added successfully.",
                formData: {}
            });
        }
    );
});

module.exports = router;