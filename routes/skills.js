const express = require("express");
const router = express.Router();
const isAuthenticated = require("../middleware/isAuthenticated");

router.get("/addSkill", isAuthenticated, (req, res) => {
    res.render("addSkill");
});

module.exports = router;
