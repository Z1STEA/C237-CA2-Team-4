const express = require("express");
const router = express.Router();

router.get("/addSkill", (req, res) => {
    res.render("addSkill");
});

module.exports = router;