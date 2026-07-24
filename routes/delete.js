const express = require("express");
const router = express.Router();
const db = require("../config/db");
const isAuthenticated = require("../middleware/isAuthenticated");

router.post("/deletePortfolio/:id", isAuthenticated, async (req, res) => {
    try {
        const portfolioId = Number(req.params.id);

        if (!Number.isInteger(portfolioId) || portfolioId <= 0) {
            return res.status(400).send("Invalid portfolio entry ID");
        }

        const [submissions] = await db.promise().execute(
            "SELECT portfolioId FROM portfolio WHERE portfolioId = ? AND userId = ?",
            [portfolioId, req.session.user.id]
        );

        if (submissions.length === 0) {
            const [existingSubmissions] = await db.promise().execute(
                "SELECT portfolioId FROM portfolio WHERE portfolioId = ?",
                [portfolioId]
            );

            if (existingSubmissions.length === 0) {
                return res.status(404).send("Portfolio entry not found");
            }

            return res.status(403).send("Access Denied");
        }

        await db.promise().execute(
            "DELETE FROM portfolio WHERE portfolioId = ? AND userId = ?",
            [portfolioId, req.session.user.id]
        );

        res.redirect("/dashboard");
    } catch (error) {
        console.error(error);
        res.status(500).send("Unable to delete portfolio entry");
    }
});

module.exports = router;
