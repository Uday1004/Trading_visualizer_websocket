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

const socket = io("http://localhost:5100", {
  transports: ["polling"],
});

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
  const [stats, setStats] = useState({});

  useEffect(() => {
    socket.on("tradingData", (data) => {
      setPrices((prev) => ({ ...prev, [data.symbol]: parseFloat(data.price) }));

      setHistory((prev) => {
        const now = new Date();
        const formattedTime = now.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit", // ✅ Seconds add kiya
        });

        return {
          ...prev,
          [data.symbol]: [
            ...(prev[data.symbol] || []),
            { price: parseFloat(data.price), time: formattedTime }, // ✅ "hh:mm:ss" format store hoga
          ].slice(-15), // Last 20 Entries Only
        };
      });

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
    <div className="container p-2 mt-2 rounded text-light">
      <div className="d-flex align-items-center mb-4">
        <span class="material-symbols-outlined fs-1 me-2 " style={{color:'#60d9a1'}}>monitoring</span>
        <h2 className="mb-0">Live Stock Market Dashboard</h2>
      </div>

      {/* Stock Selection Buttons */}
      <div className="d-flex justify-content-start mb-4">
        {symbols.map((symbol) => (
          <button
            key={symbol}
            className={`btn me-2 ${
              selectedSymbol === symbol ? "btn-outline-success" : "btn-dark"
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
          <div className="card bg-dark text-light p-2">
            <h6>💲 Current Price</h6>
            <h3>${prices[selectedSymbol] || "Loading..."}</h3>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card bg-dark text-light p-2">
            <h6>📈 24h Change</h6>
            <h3
              className={
                stats[selectedSymbol]?.change24h >= 0
                  ? "text-success"
                  : "text-danger"
              }
            >
              {stats[selectedSymbol]?.change24h
                ? `${stats[selectedSymbol].change24h.toFixed(2)}%`
                : "Loading..."}
            </h3>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card bg-dark text-light p-2">
            <h6>📊 Volume</h6>
            <h3>
              {stats[selectedSymbol]?.volume24h
                ? `${(stats[selectedSymbol].volume24h / 1_000_000).toFixed(2)}M`
                : "Loading..."}
            </h3>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card bg-dark text-light p-2">
            <h6>🚀 24h High</h6>
            <h3 className="" style={{ color: "#babaff" }}>
              $
              {stats[selectedSymbol]?.high24h
                ? stats[selectedSymbol].high24h.toFixed(2)
                : "Loading..."}
            </h3>
          </div>
        </div>
      </div>

      {/* Stock Chart */}
      <div className="card bg-dark p-3">
        <h4>{selectedSymbol} Price Chart</h4>
        <div style={{ height: "360px", width: "100%" }}>
          {" "}
          {/* Width badhayi gayi hai */}
          <Line
            data={{
              labels: history[selectedSymbol]?.map((entry) => entry.time) || [],
              datasets: [
                {
                  label: `${selectedSymbol} Price`,
                  data:
                    history[selectedSymbol]?.map((entry) => entry.price) || [],
                  borderColor: "#0f9d58",
                  backgroundColor: "rgba(15, 157, 88, 0.3)",
                  borderWidth: 2,
                  fill: true,
                  tension: 0.4,
                },
              ],
            }}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              scales: {
                x: {
                  display: true,
                },
                y: {
                  beginAtZero: false,
                },
              },
            }}
          />
        </div>
      </div>
      
    </div>
  );
}

export default Interface;
