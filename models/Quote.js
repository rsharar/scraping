var mongoose = require("mongoose");
var Schema = mongoose.Schema;

// QuoteSchema object created with Schema constructor
var QuoteSchema = new Schema ({
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

// Create the from the Quoteschema

var Quote = mongoose.model("Quote", QuoteSchema);

module.exports = Quote