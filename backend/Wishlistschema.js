const mongoose = require('mongoose');

// Define the schema for buy requests
const Watchlist = new mongoose.Schema({

  stockName: String,
  symbol: String,
  price: Number,
  change: Number,
  percentchange: Number,

 
 
  
});


// Create a Mongoose model based on the schema
const Fav = mongoose.model('Fav', Watchlist);

module.exports = Fav; // Export the Buy model
