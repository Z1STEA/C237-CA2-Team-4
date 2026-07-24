const express = require("express");
const router = express.Router();
const isAuthenticated = require("../middleware/isAuthenticated");

router.get("/addSkill", isAuthenticated, (req, res) => {
    res.redirect("/addSubmission");
});

router.post("/addSkill", isAuthenticated, (req, res) => {
    res.redirect("/addSubmission");
});

module.exports = router;
