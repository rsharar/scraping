// External dependencies
var cheerio = require("cheerio");
var axios = require("axios");
var async = require("async");

// Import all models
var db = require("../models");

module.exports = function (app) {

    // Scrapes new quotes from the web
    app.get("/scrape", function (req, res) {
        axios.get("https://www.goodreads.com/quotes/tag/inspirational").then(function (response) {
            var $ = cheerio.load(response.data);
            var functionsObjs = {};
            $(".quoteDetails").each(function (i) {
                var result = {};
                result.quote = $(this).find(".quoteText").text();
                result.author = $(this).find(".authorOrTitle").text();
                // Stores database function as a method in an object
                functionsObjs[i] = function (cb) {
                    db.Quote.create(result, function (err, dbQuote) {
                        if (err) {
                            return cb(null, "Error: " + err.errmsg);
                        }
                        cb(null, dbQuote);
                    });
                }
            });
            // Runs all async methods in the functions object and returns results(error or quote)
            async.series(functionsObjs, function (err, results) {
                res.send(results);
            });
        });
    });

    // Post Comment
    app.post("/comment", function (req, res) {
        var comment = {
            comment: req.body.body,
        };
        // Creates comment in the database and updates correponding quote
        db.Comment.create(comment).then(function (dbComment) {
            return db.Quote.findOneAndUpdate({ _id: req.body.quoteId }, { $push: { comment: dbComment._id } }, { new: true }).populate("comment")
        }).then(function (dbQuote) {
            var index = (dbQuote.comment.length) - 1;
            var newComment = dbQuote.comment[index];
            // Returns created comment to the front-end
            res.json([newComment]);
        }).catch(function (err) {
            console.log(err);
        });
    });

    app.delete("/comment/:commentId/:quoteId", function (req, res) {
        var commentId = req.params.commentId;
        var quoteId = req.params.quoteId;
        db.Comment.deleteOne({ _id: commentId }).then(function (data, err) {
            if (err) {
                return console.log(err);
            }
            db.Quote.updateOne({ _id: quoteId }, { $pull: { comment: commentId } }).then(function (data, err) {
                if (err) {
                    return console.log(err);
                }
                res.sendStatus(200);
            });
        });
    });
}