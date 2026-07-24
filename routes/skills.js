const express = require("express");
const router = express.Router();
const isAuthenticated = require("../middleware/isAuthenticated");

const db = require("../config/db");


// Display Add Skill Page
router.get("/addSkill", isAuthenticated, (req, res) => {

    res.render("addSkill", {
        error: null,
        success: null,
        formData: {}
    });

});

// Add Skill
router.post("/addSkill", isAuthenticated, (req, res) => {

    const {
        skillName,
        category,
        otherDescription,
        proficiencyLevel,
        description,
        dateStarted
    } = req.body;


    const userId = req.session.user.id;

    console.log("User ID:", userId);

    if (!skillName || !category || !proficiencyLevel || !dateStarted) {

        return res.render("addSkill", {
            error: "Please fill in all required fields.",
            success: null,
            formData: req.body
        });

    }


    const sql = `
        INSERT INTO skills
        (
            userId,
            skillName,
            category,
            otherDescription,
            proficiencyLevel,
            description,
            dateStarted
        )
        VALUES (?, ?, ?, ?, ?, ?, ?)
    `;


    db.query(
        sql,
        [
            userId,
            skillName,
            category,
            category === "Others" ? otherDescription : null,
            proficiencyLevel,
            description,
            dateStarted
        ],

        (err, result) => {

            if (err) {

                return res.render("addSkill", {
                    error: "Failed to add skill.",
                    success: null,
                    formData: req.body
                });

            }


            console.log("Skill added successfully");

            return res.render("addSkill", {
                error: null,
                success: "Skill added successfully!",
                formData: {}
            });

        }
    );

});


module.exports = router;
