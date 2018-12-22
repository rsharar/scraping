var db = require("../models");

module.exports = function(app){
    app.get("/", function(req, res){
        // Sort by recency and limit to 10 quotes
        db.Quote.find().sort({createdDate: -1}).populate("comment").limit(1).then(function(quotes, err){
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
    // General catch for invalid urls
    app.get("*", function(req, res){
        res.render("error", {
            message: "Error",
            link: "/",
            linkName: "Main Page"
        });
    });
};