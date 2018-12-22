// External dependencies
var cheerio = require("cheerio");
var axios = require("axios");
var async = require("async");

// Import all models
var db = require("../models");

module.exports = function(app){

    // Scrapes new articles from the web
    app.get("/scrape", function(req, res){
        axios.get("https://www.goodreads.com/quotes/recently_added").then(function(response){
            var $ = cheerio.load(response.data);
            var functionsObjs = {};
            $(".quoteDetails").each(function(i){
                var result = {};
                result.quote = $(this).find(".quoteText").text();
                result.author = $(this).find(".authorOrTitle").text();
                // Stores database function as a method in an object
                functionsObjs[i] = function(cb){
                    db.Article.create(result, function(err, dbArticle){
                        if(err){
                            return cb(null, "Error: " + err.errmsg);
                        }
                        cb(null, dbArticle);
                    });
                }
            });
            // Runs all async methods in the functions object and returns results(error or article)
            async.series(functionsObjs, function(err, results){
                res.send(results);
            });
        });
    });

    // Post Comment
    app.post("/comment", function(req, res){
        var comment = {
            comment: req.body.body,
            author: req.body.author,
            authorId: req.session.token
        };
        // Creates comment in the database and updates correponding article
        db.Comment.create(comment).then(function(dbComment){
            return db.Article.findOneAndUpdate({_id: req.body.articleId}, {$push: { comment: dbComment._id }}, {new: true}).populate("comment")
        }).then(function(dbArticle){
            var index = (dbArticle.comment.length) - 1;
            var newComment = dbArticle.comment[index];
            // Returns created comment to the front-end
            if(req.session.token){
                res.json([newComment, {oauthToken : req.session.token}]);
            }
            else{
                res.json([newComment]);
            }
        }).catch(function(err){
            console.log(err);
        });
    });

    app.delete("/comment/:commentId/:articleId", function(req, res){
        var commentId = req.params.commentId;
        var articleId = req.params.articleId;
        db.Comment.deleteOne({ _id : commentId }).then(function(data, err){
            if(err){
                return console.log(err);
            }
            db.Article.updateOne({ _id: articleId}, {$pull: {comment: commentId}}).then(function(data, err){
                if(err){
                    return console.log(err);
                }
                res.sendStatus(200);
            });
        });
    });
}