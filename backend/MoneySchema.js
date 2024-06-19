const mongoose = require('mongoose');

const MoneySchema = new mongoose.Schema({
    Money: {
        type: Number,
        default: 25000 // Set default value to 0
      }
    })

  const Wallet = mongoose.model('Wallet', MoneySchema);
module.exports = Wallet;