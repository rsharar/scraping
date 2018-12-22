var db = require("../models");

module.exports = function(app){
    app.get("/", function(req, res){
        // Sort by recency and limit to 10 articles
        db.Article.find().sort({createdDate: -1}).populate("comment").limit(10).then(function(articles, err){
            if(err){
                return console.log(err);
            }
            else{
                return res.render("index", {
                    articles: articles,
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