const express = require("express");
const router = express.Router();
const db = require("../config/db");
const isAuthenticated = require("../middleware/isAuthenticated");

const CATEGORIES = ["Skill", "Project", "Certification", "Achievement"];

router.get("/addSubmission", isAuthenticated, (req, res) => {
    res.render("addSubmission", {
        error: null,
        formData: {}
    });
});

router.post("/addSubmission", isAuthenticated, async (req, res) => {
    const title = (req.body.title || "").trim();
    const category = req.body.category;
    const description = (req.body.description || "").trim();

    if (!title || !CATEGORIES.includes(category)) {
        return res.status(400).render("addSubmission", {
            error: "Please enter a title and select a valid category.",
            formData: req.body
        });
    }

    try {
        await db.promise().execute(
            "INSERT INTO portfolio (userId, studentName, title, category, description, status) VALUES (?, ?, ?, ?, ?, ?)",
            [req.session.user.id, req.session.user.name, title, category, description || null, "Pending"]
        );

        res.redirect("/dashboard");
    } catch (error) {
        console.error(error);
        res.status(500).render("addSubmission", {
            error: "Failed to submit portfolio entry.",
            formData: req.body
        });
    }
});

module.exports = router;
