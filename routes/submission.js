const express = require("express");
const router = express.Router();

const db = require("../config/db");


// Display submission page
router.get("/addSubmission", (req,res)=>{

    if(!req.session.user){
        return res.redirect("/login");
    }


    res.render("addSubmission",{
        error:null
    });

});


// Add submission
router.post("/addSubmission",(req,res)=>{

    if(!req.session.user){
        return res.redirect("/login");
    }


    const {
        title,
        category,
        description
    } = req.body;


    const userId = req.session.user.id;

    const studentName = req.session.user.name;


    if(!title || !category){

        return res.render("addSubmission",{
            error:"Please fill in all required fields."
        });

    }


    const sql = `
        INSERT INTO portfolio
        (
            userId,
            studentName,
            title,
            category,
            description,
            status
        )
        VALUES (?, ?, ?, ?, ?, ?)
    `;


    db.query(
        sql,
        [
            userId,
            studentName,
            title,
            category,
            description,
            "Pending"
        ],

        (err,result)=>{

            if(err){

                console.log(err);

                return res.render("addSubmission",{
                    error:"Failed to submit."
                });

            }


            res.redirect("/");

        }
    );


});


module.exports = router;