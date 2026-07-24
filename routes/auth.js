const express = require("express");
const bcrypt = require("bcrypt");

const router = express.Router();
const db = require("../config/db");

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
    if (req.session.user) {
        return res.redirect("/dashboard");
    }

    res.render("register", {
        error: null,
        formData: { name: "", email: "" }
    });
});

router.post("/register", (req, res) => {
    const name = (req.body.name || "").trim();
    const email = (req.body.email || "").trim().toLowerCase();
    const password = req.body.password || "";

    const formData = { name, email };

    if (!name || !email || !password) {
        return res.status(400).render("register", {
            error: "Please fill in all fields.",
            formData
        });
    }

    if (password.length < 8) {
        return res.status(400).render("register", {
            error: "Password must be at least 8 characters long.",
            formData
        });
    }

    bcrypt.hash(password, 10, (hashErr, hashedPassword) => {
        if (hashErr) {
            console.error("Error hashing password:", hashErr);
            return res.status(500).render("register", {
                error: "Unable to create account right now.",
                formData
            });
        }

        const insertQuery = "INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, 'user')";

        db.query(insertQuery, [name, email, hashedPassword], (insertErr, result) => {
            if (insertErr) {
                if (insertErr.code === "ER_DUP_ENTRY") {
                    return res.status(409).render("register", {
                        error: "An account with this email already exists.",
                        formData
                    });
                }

                console.error("Error creating user:", insertErr);
                return res.status(500).render("register", {
                    error: "Unable to create account right now.",
                    formData
                });
            }

            req.session.user = {
                id: result.insertId,
                name,
                email,
                role: "user"
            };

            res.redirect("/dashboard");
        });
    });
});

router.post("/login", (req, res) => {
    const email = (req.body.email || "").trim().toLowerCase();
    const password = req.body.password || "";

    if (!email || !password) {
        return res.status(400).render("login", {
            error: "Please enter both email and password.",
            email
        });
    }

    db.query("SELECT * FROM users WHERE email = ? LIMIT 1", [email], (err, results) => {
        if (err) {
            console.error("Error finding user:", err);
            return res.status(500).render("login", {
                error: "Unable to login right now.",
                email
            });
        }

        if (results.length === 0) {
            return res.status(401).render("login", {
                error: "Invalid email or password.",
                email
            });
        }

        const user = results[0];

        bcrypt.compare(password, user.password, (compareErr, isMatch) => {
            if (compareErr) {
                console.error("Error checking password:", compareErr);
                return res.status(500).render("login", {
                    error: "Unable to login right now.",
                    email
                });
            }

            if (!isMatch) {
                return res.status(401).render("login", {
                    error: "Invalid email or password.",
                    email
                });
            }

            req.session.user = {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role
            };

            res.redirect("/dashboard");
        });
    });
});

router.get("/logout", (req, res) => {
    req.session.destroy(() => {
        res.redirect("/login");
    });
});

module.exports = router;