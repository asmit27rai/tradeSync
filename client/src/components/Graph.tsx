'use client';

import React, { useEffect, useState } from "react";
import dynamic from "next/dynamic";

// Dynamically import ApexCharts with no SSR
const ReactApexChart = dynamic(() => import('react-apexcharts'), {
  ssr: false,
  loading: () => <div>Loading Chart...</div>
});

interface DataPoint {
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  blockNumber: number;
}

const Graph: React.FC = () => {
  const [timeframe, setTimeframe] = useState<string>("1");
  const [dataArray, setDataArray] = useState<DataPoint[]>([]);
  const [mounted, setMounted] = useState(false);

  const fetchData = async () => {
    try {
      const response = await fetch(
        "https://min-api.cryptocompare.com/data/v2/histominute?fsym=ETH&tsym=USD&limit=10&api_key=43e75d334f906b9906e1d321eb85868637b07ae182ca5372ac21ec99102cb6f7"
      );
      const data = await response.json();
      setDataArray(data.Data.Data);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  useEffect(() => {
    setMounted(true);
    fetchData();
    const interval = setInterval(fetchData, 100000);
    return () => clearInterval(interval);
  }, []);

  const series = [{
    data: dataArray.map((data, index) => {
      const currentTime = new Date();
      const timestamp = new Date(currentTime.getTime() - index * 5 * 60 * 1000);
      
      return {
        x: timestamp.getTime(),
        y: [data.open, data.high, data.low, data.close],
        volume: data.volume,
        blockNumber: data.blockNumber,
      };
    }),
  }];

  const options = {
    chart: {
      type: "candlestick" as const,
      height: 350,
      toolbar: { show: false },
      background: "transparent",
      animations: {
        enabled: false,
      },
    },
    title: {
      text: "Token Price",
      align: "left" as const,
      style: {
        fontSize: "22px",
        fontWeight: "bold",
        color: "#ffffff",
      },
    },
    xaxis: {
      type: "datetime" as const,
      labels: {
        formatter: (value: number) => {
          const date = new Date(value);
          return date.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
            hour12: false,
          });
        },
        style: {
          colors: "#a1a1aa",
          fontSize: "12px",
          fontWeight: "600",
        },
        datetimeUTC: false,
      },
      axisBorder: { color: "#4b5563" },
      axisTicks: { color: "#4b5563" },
      tickAmount: 6,
    },
    yaxis: {
      tooltip: { enabled: true },
      labels: {
        style: {
          colors: "#a1a1aa",
          fontSize: "12px",
          fontWeight: "600",
        },
        formatter: (value: number) => value.toFixed(2),
      },
    },
    plotOptions: {
      candlestick: {
        colors: {
          upward: "#22c55e",
          downward: "#ef4444",
        },
      },
    },
    tooltip: {
      theme: "dark",
      custom: ({ seriesIndex, dataPointIndex, w }: any) => {
        const data = w.config.series[seriesIndex].data[dataPointIndex];
        const timestamp = new Date(data.x).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        });
        const [open, high, low, close] = data.y;
        const volume = data.volume;

        return `
          <div class="px-4 py-2">
            <div class="text-xs text-gray-400">${timestamp}</div>
            <div class="grid grid-cols-2 gap-2 mt-2">
              <div>Open: <span class="text-white">${open.toFixed(2)}</span></div>
              <div>High: <span class="text-white">${high.toFixed(2)}</span></div>
              <div>Low: <span class="text-white">${low.toFixed(2)}</span></div>
              <div>Close: <span class="text-white">${close.toFixed(2)}</span></div>
              <div>Volume: <span class="text-white">${volume.toLocaleString()}</span></div>
            </div>
          </div>
        `;
      },
    },
  };

  if (!mounted) return <div>Loading...</div>;

  return (
    <div className="w-full h-full bg-gradient-to-r from-gray-800 via-gray-900 to-black p-6 mt-4 text-white rounded-lg shadow-2xl shadow-gray-900">
      <div className="flex items-center justify-start mb-6 space-x-4">
        <select
          className="bg-gray-700 hover:bg-gray-600 text-white rounded-lg px-4 py-2 transition-all duration-200 ease-in-out cursor-pointer"
          value={timeframe}
          onChange={(e) => setTimeframe(e.target.value)}
        >
          <option value="1">1 Min</option>
          <option value="240">4 Hours</option>
        </select>
        <h2 className="text-2xl font-bold text-gray-200">Token-USD</h2>
      </div>
      <div className="mixed-chart">
        <ReactApexChart
          key={`chart-${dataArray.length}`}
          options={options}
          series={series}
          type="candlestick"
          height={350}
        />
      </div>
    </div>
  );
};

export default Graph;