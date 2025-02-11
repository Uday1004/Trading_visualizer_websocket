const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const axios = require("axios");
const cors = require("cors");

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*", // Fixed CORS origin
    methods: ["GET", "POST"],
  },
});

const PORT = 5100;

// List of symbols
const symbols = ["BTCUSDT", "ETHUSDT", "BNBUSDT","SOLUSDT"];

// Function to fetch trading data
const fetchTradingData = async (symbol) => {
  try {
    console.log(`Fetching data for ${symbol}...`);
    
    // Fetch 24h ticker data from Binance API
    const response = await axios.get(
      `https://api.binance.com/api/v3/ticker/24hr?symbol=${symbol}`
    );

    console.log(`Data received for ${symbol}:`, response.data);

    return {
      symbol,
      price: parseFloat(response.data.lastPrice), // Current price
      change24h: parseFloat(response.data.priceChangePercent), // 24h percentage change
      volume24h: parseFloat(response.data.volume), // 24h volume
      high24h: parseFloat(response.data.highPrice), // 24h highest price
    };
  } catch (error) {
    console.error(`Error fetching ${symbol} data:`, error.message);
    return null;
  }
};

// Emit trading data every second
setInterval(async () => {
  for (const symbol of symbols) {
    const data = await fetchTradingData(symbol);
    if (data) {
      console.log(`Emitting data:`, data);
      io.emit("tradingData", data);
    }
  }
}, 1000);

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);

  io.on("connection", (socket) => {
    console.log("New client connected");

    socket.on("disconnect", () => {
      console.log("Client disconnected");
    });
  });
});
