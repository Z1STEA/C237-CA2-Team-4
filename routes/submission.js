const express = require("express");
const router = express.Router();
const db = require("../config/db");
const isAuthenticated = require("../middleware/isAuthenticated");
const multer = require("multer");
const fs = require("fs");
const path = require("path");

const CATEGORIES = ["Skill", "Project", "Certification", "Achievement"];

// Image upload configuration
const uploadDir = path.join(__dirname, "../public/uploads/certificates");

if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + "-" + file.originalname);
    }
});

const upload = multer({
    storage: storage
});

// Display submission page
router.get("/addSubmission", isAuthenticated, (req, res) => {
    res.render("addSubmission", {
        error: null,
        formData: {}
    });
});

// Add portfolio submission
router.post(
    "/addSubmission",
    isAuthenticated,
    upload.single("certificate"),
    async (req, res) => {

        const title = (req.body.title || "").trim();
        const category = req.body.category;
        const description = (req.body.description || "").trim();
        const certificate = req.file ? req.file.filename : null;

        if (!title || !CATEGORIES.includes(category)) {
            return res.status(400).render("addSubmission", {
                error: "Please enter a title and select a valid category.",
                formData: req.body
            });
        }

        try {
            await db.promise().execute(
                `INSERT INTO portfolio
                (userId, studentName, title, category, description, certificate, status)
                VALUES (?, ?, ?, ?, ?, ?, ?)`,
                [
                    req.session.user.id,
                    req.session.user.name,
                    title,
                    category,
                    description || null,
                    certificate,
                    "Pending"
                ]
            );

            res.redirect("/dashboard");

        } catch (error) {
            console.error(error);

            res.status(500).render("addSubmission", {
                error: "Failed to submit portfolio entry.",
                formData: req.body
            });
        }
    }
);

module.exports = router;