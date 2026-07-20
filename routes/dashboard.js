const express = require("express");
const router = express.Router();

router.get("/dashboard", (req, res) => {
    const user = req.session.user || {
        name: "Student",
        role: "student"
    };

    // The skills array is deliberately kept as the view's data contract.
    // Replace this with rows from the skills table when the CRUD branch lands.
    const skills = [];

    res.render("dashboard", {
        user,
        skills
    });
});

module.exports = router;
