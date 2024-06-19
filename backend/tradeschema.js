const mongoose = require('mongoose');

// Define the schema for buy requests
const buySchema = new mongoose.Schema({
  quantity: Number,
  price: Number,
  symbol: String,
  stockName: String,
  Total: Number,
  change: Number,
  MarketV: Number,
  Average: Number,
 
  timestamp: { type: Date, default: Date.now },
 
});


// Create a Mongoose model based on the schema
const Trade = mongoose.model('Trade', buySchema);

module.exports = Trade; // Export the Buy model
