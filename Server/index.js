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
    origin: "http://localhost:3000", // Fixed CORS origin
    methods: ["GET", "POST"],
  },
});

const PORT = 5100;

// List of currencies
const symbols = ["BTCUSDT", "ETHUSDT", "BNBUSDT"];

const fetchTradingData = async (symbol) => {
  try {
    console.log(`Fetching data for ${symbol}...`); // Debugging line
    const response = await axios.get(
      `https://api.binance.com/api/v3/ticker/price?symbol=${symbol}`
    );
    console.log(`Data received for ${symbol}:`, response.data); // Debugging line
    return response.data;
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
      console.log(`Emitting data:`, data); // Debugging line
      io.emit("tradingData", data);
    }
  }
}, 1000);

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  
  // Handle WebSocket connections after the server starts
  io.on("connection", (socket) => {
    console.log("New client connected");

    socket.on("disconnect", () => {
      console.log("Client disconnected");
    });
  });
});
