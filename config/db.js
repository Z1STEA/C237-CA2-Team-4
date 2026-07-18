const mysql = require("mysql2");

const db = mysql.createConnection({
    host: "c237-meilan-mysql.mysql.database.azure.com",
    user: "c237_012",
    password: "c237012@2026!",
    database: "c237_012_team4_ca2",
    ssl: {
        rejectUnauthorized: false
    }
});

db.connect((err) => {
    if (err) {
        console.error("❌ Database Connection Failed");
        console.error(err);
        return;
    }

    console.log("✅ Connected to Azure MySQL Database");
});

module.exports = db;