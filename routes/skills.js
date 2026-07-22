const express = require("express");
const router = express.Router();

const db = require("../config/db");


// Display Add Skill Page
router.get("/addSkill", (req, res) => {

    res.render("addSkill", {
        error: null,
        success: null,
        formData: {}
    });

});


// Add Skill
router.post("/addSkill", (req, res) => {

    const {
        skillName,
        category,
        proficiencyLevel,
        description,
        dateStarted
    } = req.body;

    const userId = req.session.user.id;


    // Validation
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
        proficiencyLevel,
        description,
        dateStarted
    )
    VALUES (?, ?, ?, ?, ?, ?)
`;


    db.query(
        sql,
        [
            userId,
            skillName,
            category,
            proficiencyLevel,
            description,
            dateStarted
        ],

        (err, result) => {

            if (err) {

                console.log(err);

                return res.render("addSkill", {
                    error: "Failed to add skill.",
                    success: null,
                    formData: req.body
                });

            }


            console.log("Skill added successfully");

            res.redirect("/");

        }
    );

});


module.exports = router;