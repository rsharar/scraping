var mongoose = require("mongoose");
var Schema = mongoose.Schema;

// ArticleSchema object created with Schema constructor
var ArticleSchema = new Schema ({
    // quote is a required string
    quote: {
        type: String,
        required: true
    },
    // author is a required string
    author: {
        type: String,
        required: true
    }
})