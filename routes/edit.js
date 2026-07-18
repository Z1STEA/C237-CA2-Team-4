const express = require("express");
const router = express.Router();

router.get("/editSkill", (req, res) => {
    res.render("editSkill");
});

module.exports = router;