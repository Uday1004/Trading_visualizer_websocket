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

const socket = io("http://localhost:5100");

const symbols = ["BTCUSDT", "ETHUSDT", "BNBUSDT"];

function StockDashboard() {
  const [selectedSymbol, setSelectedSymbol] = useState("BTCUSDT");
  const [prices, setPrices] = useState({});
  const [history, setHistory] = useState({});

  useEffect(() => {
    socket.on("tradingData", (data) => {
      setPrices((prev) => ({ ...prev, [data.symbol]: parseFloat(data.price) }));
      setHistory((prev) => ({
        ...prev,
        [data.symbol]: [
          ...(prev[data.symbol] || []),
          parseFloat(data.price),
        ].slice(-40),
      }));
    });

    return () => socket.off("tradingData");
  }, []);

  return (
    <div className="container p-4 mt-4 rounded text-light">
      <span class="material-symbols-outlined mx-2 fs-1 mb-4 text-success " >trending_up</span>
      <span>
        <h2 className="mb-4" style={{display:'inline'}}>
          Stock Market Dashboard
        </h2>
      </span>

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
            {symbol.replace("USDT", "")}
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
            <h3>+0.32%</h3>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card bg-dark text-light p-3">
            <h6>📊 Volume</h6>
            <h3>5.15M</h3>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card bg-dark text-light p-3">
            <h6>🚀 24h High</h6>
            <h3>$185.00</h3>
          </div>
        </div>
      </div>

      {/* Stock Chart */}
      <div className="card bg-dark p-3">
        <h4>{selectedSymbol} Price Chart</h4>
        <div style={{ height: "300px", overflow: "hidden" }}>
          <Line
            data={{
              labels: history[selectedSymbol]?.map((_, index) => index) || [],
              datasets: [
                {
                  label: `${selectedSymbol} Price`,
                  data: history[selectedSymbol] || [],
                  borderColor: "#0f9d58",
                  borderWidth: 2,
                  fill: false,
                },
              ],
            }}
          />
        </div>
      </div>
    </div>
  );
}

export default StockDashboard;
