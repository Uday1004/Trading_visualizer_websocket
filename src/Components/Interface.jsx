import React, { useEffect, useState } from "react";
import io from "socket.io-client";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
} from "chart.js";
import "bootstrap/dist/css/bootstrap.min.css";

ChartJS.register(LineElement, CategoryScale, LinearScale, PointElement);

const socket = io("https://trading-backend-ccs7.onrender.com");

const symbols = ["BTCUSDT", "ETHUSDT", "BNBUSDT", "SOLUSDT"];
const symbolNames = {
  BTCUSDT: "Bitcoin",
  ETHUSDT: "Ethereum",
  BNBUSDT: "Binance Coin",
  SOLUSDT: "Solana",
};

function Interface() {
  const [selectedSymbol, setSelectedSymbol] = useState("BTCUSDT");
  const [prices, setPrices] = useState({});
  const [history, setHistory] = useState({});
  const [stats, setStats] = useState({}); // New state for 24h data

  useEffect(() => {
    socket.on("tradingData", (data) => {
      setPrices((prev) => ({ ...prev, [data.symbol]: parseFloat(data.price) }));

      setHistory((prev) => ({
        ...prev,
        [data.symbol]: [
          ...(prev[data.symbol] || []),
          parseFloat(data.price),
        ].slice(-30),
      }));

      setStats((prev) => ({
        ...prev,
        [data.symbol]: {
          change24h: data.change24h,
          volume24h: data.volume24h,
          high24h: data.high24h,
        },
      }));
    });

    return () => socket.off("tradingData");
  }, []);

  return (
    <div className="container p-4 mt-4 rounded text-light">
      <span className="material-symbols-outlined mx-2 fs-1 mb-4 text-success">
        trending_up
      </span>
      <h2 className="mb-4" style={{ display: "inline" }}>
        Live Stock Market Dashboard
      </h2>

      {/* Stock Selection Buttons */}
      <div className="d-flex justify-content-start mb-4">
        {symbols.map((symbol) => (
          <button
            key={symbol}
            className={`btn me-2 ${
              selectedSymbol === symbol ? "btn-success" : "btn-dark"
            }`}
            onClick={() => setSelectedSymbol(symbol)}
          >
            {symbolNames[symbol]}
          </button>
        ))}
      </div>

      {/* Stock Info Cards */}
      <div className="row text-center mb-4">
        <div className="col-md-3">
          <div className="card bg-dark text-light p-3">
            <h6>💲 Current Price</h6>
            <h3>${prices[selectedSymbol] || "Loading..."}</h3>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card bg-dark text-light p-3">
            <h6>📈 24h Change</h6>
            <h3 className={stats[selectedSymbol]?.change24h >= 0 ? "text-success" : "text-danger"}>
              {stats[selectedSymbol]?.change24h
                ? `${stats[selectedSymbol].change24h.toFixed(2)}%`
                : "Loading..."}
            </h3>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card bg-dark text-light p-3">
            <h6>📊 Volume</h6>
            <h3>
              {stats[selectedSymbol]?.volume24h
                ? `${(stats[selectedSymbol].volume24h / 1_000_000).toFixed(2)}M`
                : "Loading..."}
            </h3>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card bg-dark text-light p-3">
            <h6>🚀 24h High</h6>
            <h3 className="" style={{color:'red'}}>
              ${stats[selectedSymbol]?.high24h
                ? stats[selectedSymbol].high24h.toFixed(2)
                : "Loading..."}
            </h3>
          </div>
        </div>
      </div>

      {/* Stock Chart */}
      <div className="card bg-dark p-3">
        <h4>{selectedSymbol} Price Chart</h4>
        <div style={{ height: "300px", overflow: "hidden", width:600 }}>
          <Line
            data={{
              labels: history[selectedSymbol]?.map((_, index) => index) || [],
              datasets: [
                {
                  label: `${selectedSymbol} Price`,
                  data: history[selectedSymbol] || [],
                  borderColor: "#0f9d58",
                  borderWidth: 2,
                  fill: true,
                },
              ],
            }}
          />
        </div>
      </div>
    </div>
  );
}

export default Interface;