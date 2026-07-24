const express = require("express");
const bcrypt = require("bcrypt");

const db = require("../config/db");

const router = express.Router();

router.get("/login", (req, res) => {
    res.render("login", {
        error: null,
        email: ""
    });
});

router.post("/login", (req, res) => {

    const { email, password } = req.body;

    if (!email || !password) {
        return res.render("login", {
            error: "Please enter email and password.",
            email
        });
    }

    db.query(
        "SELECT * FROM users WHERE email = ?",
        [email],
        async (err, results) => {

            if (err) {
                console.error(err);
                return res.render("login", {
                    error: "Database error.",
                    email
                });
            }

            if (results.length === 0) {
                return res.render("login", {
                    error: "Incorrect email or password.",
                    email
                });
            }

            const user = results[0];

            const passwordMatches = await bcrypt.compare(
                password,
                user.password
            );

            if (!passwordMatches) {
                return res.render("login", {
                    error: "Incorrect email or password.",
                    email
                });
            }

            req.session.user = {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role
            };

            if (user.role === "admin") {
                return res.redirect("/admin/dashboard");
            }

            res.redirect("/dashboard");
        }
    );
});

router.get("/register", (req, res) => {
    res.render("register");
});

router.post("/register", async (req, res) => {

    const { name, email, password } = req.body;

    // Check if all fields are filled
    if (!name || !email || !password) {
        return res.send("Please fill in all fields.");
    }

    // Check if email already exists
    db.query(
        "SELECT * FROM users WHERE email = ?",
        [email],
        async (err, results) => {

            if (err) {
                console.error(err);
                return res.send("Database error.");
            }

            if (results.length > 0) {
                return res.send("Email already exists.");
            }

            // Hash password
            const hashedPassword = await bcrypt.hash(password, 10);

            // Insert new user
            db.query(
                "INSERT INTO users (name, email, password) VALUES (?, ?, ?)",
                [name, email, hashedPassword],
                (err) => {

                    if (err) {
                        console.error(err);
                        return res.send("Registration failed.");
                    }

                    res.redirect("/login");
                }
            );

        }
    );

});

router.get("/logout", (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error(err);
            return res.status(500).send("Unable to log out.");
        }

        res.clearCookie("connect.sid");
        res.redirect("/login");
    });
});

module.exports = router;