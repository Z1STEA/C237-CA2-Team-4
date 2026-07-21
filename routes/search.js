/*
=========================================================
Part F - Search / Filter / Organise
Developer: Wei Han

Purpose:
This route handles all search requests from search.ejs.

Features:
- Keyword Search
- Category Filter
- Status Filter
- Result Sorting

If the Search page does not load correctly,
check this file first.
=========================================================
*/

// Explanation:
// Import the Express framework.
const express = require("express");

// Explanation:
// Create a router to group all search-related routes.
const router = express.Router();

/*
Integration Note

This imports the shared database connection.

If your project stores the database connection
in another file, update ONLY the path below.

Example:
../database/db
../config/database
*/

// Explanation:
// Import the shared database connection.
const db = require("../config/db");

/*
Integration Note

GET /search

This route:
✓ Receives the search request
✓ Builds the SQL query
✓ Retrieves matching records
✓ Sends the results to search.ejs

If another GET /search route already exists,
merge the logic instead of creating a duplicate.
*/

// Explanation:
// Handle GET requests for the Search page.
router.get("/search", (req, res) => {

    /*
    Integration Note

    These values come from the search form in:

    views/search.ejs

    The input names in search.ejs must match
    the variable names below.
    */

    // Explanation:
    // Read the values submitted by the user.
    // Use an empty string if no value is provided.
    const keyword = req.query.keyword || "";
    const category = req.query.category || "";
    const status = req.query.status || "";
    const sort = req.query.sort || "newest";

    /*
    Integration Note

    "portfolio" is the database table used
    for this project.
    */

    // Explanation:
    // Start building the SQL query.
    let sql = "SELECT * FROM portfolio";

    // Explanation:
    // Store all filter conditions before adding them to the SQL query.
    let conditions = [];

    // Explanation:
    // Store values that replace the ? placeholders safely.
    let values = [];

    /*
    Integration Note

    Keyword search currently checks:
    - studentName
    - title
    */

    // Explanation:
    // Search for matching student names or titles.
    if (keyword !== "") {
        conditions.push("(studentName LIKE ? OR title LIKE ?)");
        values.push("%" + keyword + "%");
        values.push("%" + keyword + "%");
    }

    /*
    Integration Note

    The category value should match
    the dropdown values in search.ejs.
    */

    // Explanation:
    // Filter records by category.
    if (category !== "") {
        conditions.push("category = ?");
        values.push(category);
    }

    /*
    Integration Note

    Status values should match the
    dropdown values in search.ejs.
    */

    // Explanation:
    // Filter records by status.
    if (status !== "") {
        conditions.push("status = ?");
        values.push(status);
    }

    /*
    Integration Note

    Only add the WHERE clause when at least
    one search condition has been selected.
    */

    // Explanation:
    // Add the WHERE clause only if filters exist.
    if (conditions.length > 0) {
        sql += " WHERE " + conditions.join(" AND ");
    }

    /*
    Integration Note

    Each sort option below corresponds to
    one option inside search.ejs.
    */

    // Explanation:
    // Sort the search results based on the selected option.
    if (sort === "newest") {
        sql += " ORDER BY createdAt DESC";
    }
    else if (sort === "oldest") {
        sql += " ORDER BY createdAt ASC";
    }
    else if (sort === "titleAZ") {
        sql += " ORDER BY title ASC";
    }
    else if (sort === "titleZA") {
        sql += " ORDER BY title DESC";
    }
    else if (sort === "studentAZ") {
        sql += " ORDER BY studentName ASC";
    }
    else if (sort === "studentZA") {
        sql += " ORDER BY studentName DESC";
    }
    else if (sort === "category") {
        sql += " ORDER BY category ASC";
    }
    else if (sort === "status") {
        sql += " ORDER BY status ASC";
    }

    /*
    Integration Note

    Execute the SQL query using the shared
    database connection.
    */

    // Explanation:
    // Execute the completed SQL query.
    db.query(sql, values, (err, results) => {

        // Explanation:
        // Stop the program if the database returns an error.
        if (err) {
            console.log(err);
            return res.send("Database Error");
        }

        /*
        Integration Note

        These variables are required by
        views/search.ejs.
        */

        // Explanation:
        // Send the search results to search.ejs for display.
        res.render("search", {
            keyword,
            category,
            status,
            sort,
            results
        });

    });

});

/*
=========================================================
End of Search Route

Integration Checklist
---------------------
✓ Route imported into app.js
✓ Route registered using app.use(...)
✓ Database connection configured
✓ portfolio table exists
✓ search.ejs is inside the views folder

If the search feature does not work after
integration, check the items above first.
=========================================================
*/

// Explanation:
// Export this router so app.js can use it.
module.exports = router;