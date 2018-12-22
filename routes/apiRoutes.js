// External dependencies
var cheerio = require("cheerio");
var axios = require("axios");

// Import all models
var db = require("../models");


// -------- STARTER CODE --------- //
module.exports = function (app){
// A GET route for scraping the echoJS website
app.get("/scrape", function(req, res) {
    // First, we grab the body of the html with axios
    axios.get("https://www.goodreads.com/quotes/tag/inspirational").then(function(response) {
      // Then, we load that into cheerio and save it to $ for a shorthand selector
      var $ = cheerio.load(response.data);
  
      // Now, we grab every h2 within an article tag, and do the following:
      $(".quoteDetails").each(function(i, element) {
        // Save an empty result object
        var result = {};
  
        // Add the text and href of every link, and save them as properties of the result object
        result.quote = $(this).find(".quoteText").text();
        result.author = $(this).find(".authorOrTitle").text();
        result.link = $(this)
          .children("a")
          .attr("href");
  
        // Create a new Article using the `result` object built from scraping
        db.Quote.create(result)
          .then(function(dbQuote) {
            // View the added result in the console
            console.log(dbQuote);
          })
          .catch(function(err) {
            // If an error occurred, log it
            console.log(err);
          });
      });
  
      // Send a message to the client
      res.send("Scrape Complete");
    });
  });
  
  // Route for getting all Articles from the db
  app.get("/quotes", function(req, res) {
    // Grab every document in the Articles collection
    db.Quote.find({})
      .then(function(dbQuote) {
        // If we were able to successfully find Articles, send them back to the client
        res.json(dbQuote);
      })
      .catch(function(err) {
        // If an error occurred, send it to the client
        res.json(err);
      });
  });
}