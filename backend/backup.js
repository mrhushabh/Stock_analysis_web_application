const express = require('express');
const axios = require('axios');
const cors = require('cors');
const app = express();
const port = 3001; // Port for the server
app.use(cors());
app.use(express.json());
const endDate = new Date(); // Current date and time
const startDate = new Date(endDate.getTime() - 6 * 60 * 60 * 1000);
const endTime = endDate.toISOString().split('T')[0];
const startTime = startDate.toISOString().split('T')[0];

const mongoose = require("mongoose")
const dbUrl = "mongodb+srv://testing:testing1234@cluster0.mk3xceu.mongodb.net/portfolio?retryWrites=true&w=majority&appName=Cluster0"

const connectionParams = {
    useNewUrlParser : true,
    useUnifiedTopology : true,
};

mongoose
        .connect(dbUrl, connectionParams)
        .then(()=>{
            console.info("Connected to DB");
        })
        .catch((e) => {
            console.log("Error:",e);
      });

      const Trade = require('./tradeschema'); 
      const Wallet = require('./MoneySchema');
      const Fav = require('./Wishlistschema')

      app.post('/api/buy', async (req, res) => {
        try {
            const { quantity, price, stockName, change} = req.body;
            console.log('Buy request received:', { quantity, price, stockName, change});
            // Try to find an existing buy record for the same stock
            const totalCost = quantity * price;
            let existingBuy = await Trade.findOne({ stockName });
            // Wallet.Money = Money;
            // existingBuy.Money -= parseInt(quantity)*parseInt(price);
            let currentMoney = await Wallet.findOne(); // Assuming you only have one document for money
    
            // If there's no document in the Wallet collection, create one with initial money value
            if (!currentMoney) {
              currentMoney = new Wallet({ Money: 250000 }); // Set initial money value (e.g., $10,000)
            }
        
            // Deduct the total cost from the current money value
            currentMoney.Money -= totalCost;
        
            // Save the updated money value to the database
            await currentMoney.save();
            if (existingBuy) {
              // If a record exists, update the quantity
              
              existingBuy.quantity += quantity;
              existingBuy.MarketV = price*quantity;
              await existingBuy.save();
              res.json(existingBuy);
              const newTotal = parseInt(quantity)*parseInt(price);
              existingBuy.Total += newTotal;
              existingBuy.Average = existingBuy.Total/existingBuy.quantity;
            } else {
              // If no record exists, create a new one
              const Total = quantity*price;
              const Average = Total/quantity;
              const MarketV = quantity*price;
              const newBuy = new Trade({ quantity, price, stockName, Total, Average, MarketV});
              await newBuy.save();
              res.json(newBuy);
            }
            
          } catch (error) {
            console.error('Error buying stock:', error);
            res.status(500).json({ error: 'An error occurred' });
          }
        });
      
      app.post('/api/sell', async (req, res) => {
        try {


          const { quantity, price, stockName } = req.body;
          // Process the sell request, for example, update the database
          const totalCost = quantity * price;
          let currentMoney = await Wallet.findOne();
          currentMoney.Money += totalCost;
        
          // Save the updated money value to the database
          await currentMoney.save();
          console.log('Sell request received:', { quantity, price, stockName });
          let Sellstock = await Trade.findOne({ stockName });
          Sellstock.quantity -= quantity;
          await Sellstock.save();
          res.json(Sellstock);
          const newTotal = parseInt(quantity)*parseInt(price);
          Sellstock.Total -= newTotal;
          // Send a success response
          // res.json({ success: true, message: 'Sell request processed successfully' });
        } catch (error) {
          console.error('Error processing sell request:', error);
          // res.status(500).json({ error: 'An error occurred while processing the sell request' });
        }
      });

      app.post('/api/portfolio', async (req, res) => {
        try {
            const trades = await Trade.find();
            console.log(trades)
            res.json(trades);
        } catch (error) {
            console.error('Error fetching trade data:', error);
            res.status(500).json({ error: 'An error occurred' });
        }
    });
    app.post('/api/addfav', async (req, res) => {
      try{
        const {stockName, symbol} = req.body;
        let existing = await Fav.findOne({ stockName });
        if(existing){
          console.log('Do nothing')
        }
        else{
          const newfav = new Fav({ stockName, symbol});
          await newfav.save();
          res.json(newfav);
        }
      }catch (error) {
          console.error('Error buying stock:', error);
          res.status(500).json({ error: 'An error occurred' });
        }
      });

      app.post('/api/removefav', async (req, res) => {
        try {
          const { symbol } = req.body;
          const result = await Fav.deleteOne({ symbol });

          if (result.deletedCount === 1) {
            console.log('Stock removed from favorites successfully');
            res.status(200).json({ message: 'Stock removed from favorites successfully' });
          } else {
            console.error('Stock not found in favorites');
            res.status(404).json({ error: 'Stock not found in favorites' });
          }
        } catch (error) {
          console.error('Error removing stock from favorites:', error);
          res.status(500).json({ error: 'Internal server error' });
        }
      });
      

      
    app.post('/api/watchlist', async (req, res) => {
      try {
          const list = await Fav.find();
          console.log(list)
          res.json(list);
      } catch (error) {
          console.error('Error fetching trade data:', error);
          res.status(500).json({ error: 'An error occurred' });
          
      }
  });

  app.post('/api/star', async (req, res) => {
    try {
      const { stockName } = req.body; 
        const stardata = await Fav.find({ stockName});
        console.log(stardata)
        if(stardata){
        res.json({starstate:true});
        }
        else{
          res.json({starstate:false});
        }
    } catch (error) {
        console.error('Error fetching trade data:', error);
        res.status(500).json({ error: 'An error occurred' });
        
    }
});
    app.post('/api/Money', async (req, res) => {
      try {
          // const trades = await Trade.find();

          // console.log(trades)
          let currentMoney = await Wallet.findOne();
          if (!currentMoney) {
            currentMoney = new Wallet({ Money: 250000 }); // Set initial money value (e.g., $10,000)
          }
      
          console.log(currentMoney);
          res.json({ Money: currentMoney.Money });
      } catch (error) {
          console.error('Error fetching trade data:', error);
          res.status(500).json({ error: 'An error occurred' });
      }
  });
  app.post('/api/portfoliostock', async (req, res) => {
    const { stockName } = req.body; // Assuming you send the stock symbol in the request body
    console.log(stockName)
    try {
        // Fetch trades for the specified stock symbol
        const trades = await Trade.find({ stockName});
        console.log(trades);
        res.json(trades);
    } catch (error) {
        console.error('Error fetching trade data:', error);
        res.status(500).json({ error: 'An error occurred' });
    }
});
      

      
app.get('/api/stocks', async (req, res) => {
    try {
        const { query } = req.query;
        const response = await axios.get(`https://finnhub.io/api/v1/search?q=${query}&token=cmundmpr01qltmc10l9gcmundmpr01qltmc10la0`);
        const data = response.data;
        // console.log(data);
        res.json(data);
    } catch (error) {
        console.error('Error fetching data:', error);
        res.status(500).json({ error: 'An error occurred' });
    }
});


app.post('/api/company', async (req, res) => {
    try {
      // console.log(req.body)
      const symbol  = req.body;

      console.log(symbol.symbol)
      const response = await axios.get(`https://finnhub.io/api/v1/stock/profile2?symbol=${symbol.symbol}&token=cmundmpr01qltmc10l9gcmundmpr01qltmc10la0`);
      const data = response.data;
      console.log(data);
      res.json(data);
    } catch (error) {
      console.error('Error fetching company data:', error);
      res.status(500).json({ error: 'An error occurred' });
    }
  });
  
  app.post('/api/quote', async (req, res) => {
    try {
      // console.log(req.body)
      const symbol  = req.body;

      console.log(symbol)
      const response = await axios.get(`https://finnhub.io/api/v1/quote?symbol=${String(symbol.symbol)}&token=cmundmpr01qltmc10l9gcmundmpr01qltmc10la0`);
      const data = response.data
      console.log(data);
      res.json(data);
    } catch (error) {
      console.error('Error fetching company data:', error);
      res.status(500).json({ error: 'An error occurred' });
    }
  });

  app.post('/api/peers', async (req, res) => {
    try {
      // console.log(req.body)
      const symbol  = req.body;

      console.log(symbol)
      const response = await axios.get(`https://finnhub.io/api/v1/stock/peers?symbol=${String(symbol.symbol)}&token=cmundmpr01qltmc10l9gcmundmpr01qltmc10la0`);
      const data = response.data
      console.log(data);
      res.json(data);
    } catch (error) {
      console.error('Error fetching company data:', error);
      res.status(500).json({ error: 'An error occurred' });
    }
  });

  app.post('/api/News', async (req, res) => {
    try {
      // console.log(req.body)
      const symbol  = req.body;

      console.log(symbol)
      const response = await axios.get(`https://finnhub.io/api/v1/company-news?symbol=${String(symbol.symbol)}&from=2023-08-15&to=2023-08-20&token=cmundmpr01qltmc10l9gcmundmpr01qltmc10la0`);
      const data = response.data
      console.log(data);
      res.json(data);
    } catch (error) {
      console.error('Error fetching company data:', error);
      res.status(500).json({ error: 'An error occurred' });
    }
  });


  app.post('/api/Sentiments', async (req, res) => {
    try {
      // console.log(req.body)
      const symbol  = req.body;

      console.log(symbol)
      const response = await axios.get(`https://finnhub.io/api/v1/stock/insider-sentiment?symbol=${String(symbol.symbol)}&token=cmundmpr01qltmc10l9gcmundmpr01qltmc10la0`);
      const data = response.data;
      console.log(data);
      res.json(data);
    } catch (error) {
      console.error('Error fetching company data:', error);
      res.status(500).json({ error: 'An error occurred' });
    }
  });

  app.post('/api/Chart1', async (req, res) => {
    try {
      const symbol = req.body;
      console.log(symbol);
      console.log('hee');
      const response = await axios.get(`https://api.polygon.io/v2/aggs/ticker/${symbol.symbol}/range/1/day/2023-09-14/2024-03-17?adjusted=true&sort=asc&apiKey=OpXGdu_iIjhzVRAXnby_ktJX7iHAurj9`);
      const data = response.data.results;
  
      const tValues = data.map(item => item.t); // Extracting 't' values into a separate array
      const cValues = data.map(item => item.c); // Extracting 'c' values into a separate array
  
      console.log('tValues:', tValues);
      console.log('cValues:', cValues);
      
      res.json({ tValues, cValues });
    } catch (error) {
      console.error('Error fetching company data:', error);
      res.status(500).json({ error: 'An error occurred' });
    }
  });

  app.get('/api/Chart2', async (req, res) => {
    try {
   
  
        // Call Finnhub API
        const response = await axios.get(`https://finnhub.io/api/v1/stock/recommendation?`, {
          params: {
            symbol: req.query.symbol, // Pass any query parameters as needed
            token: 'cmu2ja9r01qsv99lvmdgcmu2ja9r01qsv99lvme0'
          }
        });
      res.send(response.data);
    } catch (error) {
      // Handle errors
      console.error('Error fetching company data:', error);
      res.status(500).send('Error fetching company data');
    }
  });
  
  app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });
  
