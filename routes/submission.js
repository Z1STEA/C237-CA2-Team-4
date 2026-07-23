const express = require("express");
const router = express.Router();

const db = require("../config/db");
const multer = require("multer");


// Image upload configuration
const storage = multer.diskStorage({

    destination: (req, file, cb) => {
        cb(null, "/public/uploads/certificates");
    },

    filename: (req, file, cb) => {
        cb(null, Date.now() + "-" + file.originalname);
    }

});


const upload = multer({
    storage: storage
});


// Display submission page
router.get("/addSubmission", (req, res) => {

    if (!req.session.user) {
        return res.redirect("/login");
    }

    res.render("addSubmission", {
        error: null,
        formData: {}
    });

});


// Add portfolio submission
router.post("/addSubmission", upload.single("certificate"), (req, res) => {

    if (!req.session.user) {
        return res.redirect("/login");
    }


    const {
        title,
        category,
        description
    } = req.body;


    const userId = req.session.user.id;


    if (!title || !category) {

        return res.render("addSubmission", {
            error: "Please fill in all required fields.",
            formData: req.body
        });

    }


    const certificate = req.file ? req.file.filename : null;


    const sql = `
        INSERT INTO portfolio
        (
            userId,
            title,
            category,
            description,
            certificate,
            status
        )
        VALUES (?, ?, ?, ?, ?, ?)
    `;


    db.query(
        sql,
        [
            userId,
            title,
            category,
            description,
            certificate,
            "Pending"
        ],
        (err, result) => {

            if (err) {

                console.log(err);

                return res.render("addSubmission", {
                    error: "Failed to submit.",
                    formData: req.body
                });

            }


            console.log("Portfolio submission added");

            res.redirect("/dashboard");

        }
    );

});


module.exports = router;