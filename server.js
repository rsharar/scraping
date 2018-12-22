var express = require("express");
var mongoose = require("mongoose");
var axios = require("axios");
var cheerio = require("cheerio");
var exphbs = require("express-handlebars");

// Require all models
// var db = require("./models");

var PORT = 3000;

// Initialize Express
var app = express();

// Configure middleware

// Parse request body as JSON
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
// Make public a static folder
app.use(express.static("public"));

// If deployed, use the deployed database. Otherwise use the local mongoHeadlines database
var MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/mongoHeadlines";

mongoose.connect(MONGODB_URI)

// Set up express handlebars
app.engine("handlebars", exphbs({
  defaultLayout: "main"
})
)
app.set("view engine","handlebars");


// Routes
app.get("/scrape",function(req,res){
  axios.get("https://www.goodreads.com/quotes").then(function(response){
  // Load HTML into cheero
  // Use $ as cheerio selector  
  var $ = cheerio.load(response.data);
  // // Declar empty arr to store results of scrape
  // var result = [];


    $(".quoteDetails").each(function(i,elem){

      var quote = $(elem).children("div").text();




      if (quote){
        db.scrapeData.insert({
          quote: quote
        },
        function(err,inserted){
          if (err){
            console.log(err);
          }
          else{
            console.log(inserted);
          }})
        }}
        )
      })
      res.send("Scraped");
    })

// Test routes
app.get("/", function (req,res){
  res.render("index",{title: "This is the homepage"})
});

// Start the server
app.listen(PORT, function() {
  console.log("App running on port " + PORT + "!");
});
