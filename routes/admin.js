const express = require("express");
const router = express.Router();
const db = require("../config/db");
const isAuthenticated = require("../middleware/isAuthenticated");
const isAdmin = require("../middleware/isAdmin");

router.get("/admin/dashboard", isAuthenticated, isAdmin, async (req, res) => {
    try {
        const [submissions] = await db.promise().execute(
            "SELECT portfolioId, studentName, title, category, description, status, createdAt FROM portfolio ORDER BY status, createdAt DESC"
        );

        res.render("partials/adminDashboard", {
            submissions
        });
    } catch (error) {
        console.error(error);
        res.status(500).send("Unable to load submissions");
    }
});

router.post("/admin/portfolio/:id/verify", isAuthenticated, isAdmin, async (req, res) => {
    try {
        const [result] = await db.promise().execute(
            "UPDATE portfolio SET status = ? WHERE portfolioId = ?",
            ["Verified", req.params.id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).send("Submission not found");
        }

        res.redirect("/admin/dashboard");
    } catch (error) {
        console.error(error);
        res.status(500).send("Unable to verify submission");
    }
});

router.post("/admin/portfolio/:id/reject", isAuthenticated, isAdmin, async (req, res) => {
    try {
        const [result] = await db.promise().execute(
            "UPDATE portfolio SET status = ? WHERE portfolioId = ?",
            ["Rejected", req.params.id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).send("Submission not found");
        }

        res.redirect("/admin/dashboard");
    } catch (error) {
        console.error(error);
        res.status(500).send("Unable to reject submission");
    }
});

module.exports = router;
