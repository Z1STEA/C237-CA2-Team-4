require("dotenv").config();

const express = require("express");
const session = require("express-session");
const path = require("path");

const app = express();

// Database
require("./config/db");

// Route Imports
const authRoutes = require("./routes/auth");
const dashboardRoutes = require("./routes/dashboard");
const skillRoutes = require("./routes/skills");
const editRoutes = require("./routes/edit");
const deleteRoutes = require("./routes/delete");
const searchRoutes = require("./routes/search");
const adminRoutes = require("./routes/admin");
const submissionRoutes = require("./routes/submission");

// View Engine
app.set("view engine", "ejs");

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(express.static(path.join(__dirname, "public")));

app.use(
    session({
        secret: 'skillsync-secret-key',
        resave: false,
        saveUninitialized: false
    })
);

app.use((req, res, next) => {
    res.locals.user = req.session.user || null;
    next();
});

// Routes
app.use("/", authRoutes);
app.use("/", dashboardRoutes);
app.use("/", skillRoutes);
app.use("/", editRoutes);
app.use("/", deleteRoutes);
app.use("/", searchRoutes);
app.use("/", adminRoutes);
app.use("/", submissionRoutes);

// Home Page
app.get("/", (req, res) => {

    res.render("index", {
        user: req.session.user || null
    });

});

// 404 Page
app.use((req, res) => {

    res.status(404).send("404 - Page Not Found");

});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {

    console.log(`🚀 SkillSync running on http://localhost:${PORT}`);

});
