const express = require("express");
const router = express.Router();
const db = require("../config/db");
const isAuthenticated = require("../middleware/isAuthenticated");
const CATEGORIES = ["Skill", "Project", "Certification", "Achievement"];
const STATUSES = ["Pending", "Verified", "Rejected"];

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

        if (!isOwner) {
            return res.status(403).send("Access Denied: You can only edit your own portfolio entries.");
        }

        res.render("editPortfolio", {
            entry,
            categories: CATEGORIES,
            statuses: STATUSES,
            isAdmin: false,
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

        if (!isOwner) {
            return res.status(403).send("Access Denied: You can only edit your own portfolio entries.");
        }

        const { errors, cleaned } = validatePortfolioInput(req.body);

        if (errors.length > 0) {
            return res.status(400).render("editPortfolio", {
                entry: { ...existingEntry, ...req.body },
                categories: CATEGORIES,
                statuses: STATUSES,
                isAdmin: false,
                errors
            });
        }

        let newStatus = existingEntry.status;

        if (existingEntry.status === "Verified" || existingEntry.status === "Rejected") {
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
