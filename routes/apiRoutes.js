// External dependencies
var cheerio = require("cheerio");
var axios = require("axios");
var mongoose = require("mongoose")
// Import all models
var db = require("../models");


// -------- STARTER CODE --------- //
module.exports = function (app) {
  // A GET route for scraping the echoJS website
  app.get("/scrape", function (req, res) {
    // First, we grab the body of the html with axios
    axios.get("https://www.goodreads.com/quotes/tag/inspirational").then(function (response) {
      // Then, we load that into cheerio and save it to $ for a shorthand selector
      var $ = cheerio.load(response.data);

      // Now, we grab every h2 within an article tag, and do the following:
      $(".quoteDetails").each(function (i, element) {
        // empty arr
        var resultsArr = [];
        // Save an empty result object
        var result = {};
        // Add the text and href of every link, and save them as properties of the result object
        result.quote = $(this).find(".quoteText").text();
        result.author = $(this).find(".authorOrTitle").text();
        result.link = $(this)
          .children("a")
          .attr("href");
        resultsArr.push(result);
        // console.log(resultsArr);
        // Create a new Quote using the `result` object built from scraping
        db.Quote.create(result)
          .then(function (dbQuote) {
            // View the added result in the console
            console.log(dbQuote);
          })
          .catch(function (err) {
            // If an error occurred, log it
            console.log(err);
          });
      });

      // Send a message to the client
      res.json(resultsArr);
    });
  });


  // Route for getting all Quotes from the db
  app.get("/quotes", function (req, res) {
    // Grab every document in the Quotes collection
    db.Quote.find({})
      .then(function (dbQuote) {
        // If we were able to successfully find Quotes, send them back to the client
        res.json(dbQuote);
      })
      .catch(function (err) {
        // If an error occurred, send it to the client
        res.json(err);
      });
  });
  // Route for saving comments to the db
  app.post("/api/comment", function (req, res) {
    // req.body.quoteId === obj Id of the QUOTE in db
    // regardless of which comment btn is clicked, only first quoteId is getting registered

    db.Comment.create({
      body: req.body.body
    }).then(function (dbComment) {

      return db.Quote.findOneAndUpdate(
        { _id: req.body.quoteId },
        { $push: { comments: dbComment._id } },
        { new: true }
      )
    })
      .then(function (dbComments) {
        res.json(dbComments);
      })
      .catch(function (err) {
        res.json(err);
      })
  });
  // get comments by quoteId
  app.get("/comments/:quoteId", function (req, res) {
    db.Quotes.findOne({
      _id: req.params.quoteId
    }).populate("Comment").then(function (dbComment) {
      res.json(dbComment);
    }).catch(function (err) {
      console.log(err);
    });
  })

  // get all comments
  app.get("/comments", function (req, res) {
    db.Comment.find({})
      .then(function (dbComments) {
        res.json(dbComments)
      })
      .catch(function (err) {
        console.log(err);
      })
  })
  // // Route for loading saved comments from db
  // app.get("/comments", function (req, res) {
  //   db.Comment({})
  //     .then(function (dbComment) {
  //       res.json(dbComment);
  //     })
  //     .catch(function (err) {
  //       // If an error occurred, send it to the client
  //       res.json(err);
  //     });
  // })





}