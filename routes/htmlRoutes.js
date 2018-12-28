var db = require("../models");

module.exports = function(app){
    app.get("/", function(req, res){
        // Sort by recency and limit to 5 quotes
        db.Quote.find().sort({createdDate: -1}).populate("comment").limit(5).then(function(quotes, err){
            if(err){
                return console.log(err);
            }
            else{
                return res.render("index", {
                    quotes: quotes,
                });
            }
        });
    });
    // Catch for invalid URLs
    app.get("*", function(req, res){
        res.render("error", {
            message: "Error",
            link: "/",
        });
    });
};