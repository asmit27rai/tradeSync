"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  Wallet,
  BarChart2,
  ArrowUpRight,
  ArrowDownRight,
  Settings,
  RefreshCcw,
  PieChart,
  Activity,
  Sliders,
  Copy,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useWallet } from "@/context/walletContext";

const Dashboard = () => {
  const { account } = useWallet();

  const [showForm, setShowForm] = useState(4 === 4);
  const [formData, setFormData] = useState({
    personal_info: {
      name: "",
      email: "",
      walletAddress: "",
      tradingExperience: "",
      profession: "",
    },
    financial_profile: {
      monthlyIncome: "",
      totalInvestableAmount: "",
      monthlyInvestment: "",
      emergencyFunds: "",
      existingInvestments: "",
    },
    risk_strategy: {
      riskTolerance: "medium",
      maxPortfolioLoss: "",
      investmentTimeframe: "",
      withdrawalNeeds: "",
    },
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    const keys = name.split('.');
    if (keys.length === 2) {
      setFormData({
        ...formData,
        [keys[0]]: {
          ...formData[keys[0]],
          [keys[1]]: value,
        },
      });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };  

  const handleSubmit = async (e) => {
    e.preventDefault();
    setShowForm(false);

    try {
      const response = await fetch("http://localhost:5000/api/v1/write", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData), // Send the form data as a JSON string
      });

      if (!response.ok) {
        throw new Error("Error submitting form");
      }

      const data = await response.json();
      console.log("Form submitted successfully:", data);
    } catch (error) {
      console.error("Error while submitting form:", error);
    }
  };

  // Sample data - replace with real data in production
  const [portfolioData] = useState([
    { name: "Jan", value: 4000 },
    { name: "Feb", value: 3000 },
    { name: "Mar", value: 5000 },
    { name: "Apr", value: 4500 },
    { name: "May", value: 6000 },
    { name: "Jun", value: 5500 },
  ]);

  // Function to truncate address
  const truncateAddress = (address) => {
    return `${address?.slice(0, 6)}...${address?.slice(-4)}`;
  };

  // Function to copy address to clipboard
  const copyAddress = () => {
    if (account) {
      navigator.clipboard.writeText(account);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/read", {
          method: "GET", // No body for GET requests
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error("Error fetching data");
        }

        const data = await response.json();
        console.log("Data fetched successfully:", data);
      } catch (error) {
        console.error("Error while fetching data:", error);
      }
    };

    fetchData(); // Call the fetchData function
  }, []); // Empty dependency array means it will run once on component mount

  const ParticleBackground = () => {
    return (
      <div className="absolute inset-0 overflow-hidden -z-10">
        <div className="relative w-full h-full">
          {[...Array(30)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 bg-blue-500/20 rounded-full"
              initial={{
                x: Math.random() * window.innerWidth,
                y: Math.random() * window.innerHeight,
              }}
              animate={{
                x: [
                  Math.random() * window.innerWidth,
                  Math.random() * window.innerWidth,
                ],
                y: [
                  Math.random() * window.innerHeight,
                  Math.random() * window.innerHeight,
                ],
              }}
              transition={{
                duration: 15 + Math.random() * 15,
                repeat: Infinity,
                ease: "linear",
              }}
              style={{
                filter: "blur(4px)",
              }}
            />
          ))}
        </div>
      </div>
    );
  };

  // Animated Character Component
  const AnimatedCharacter = () => (
    <motion.div
      className="relative w-16 h-16"
      animate={{
        y: [0, -10, 0],
        rotate: [0, 5, -5, 0],
      }}
      transition={{
        duration: 4,
        repeat: Infinity,
        ease: "easeInOut",
      }}
    >
      <div className="w-16 h-16 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full overflow-hidden">
        <motion.div
          className="w-full h-full relative"
          animate={{
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          {/* MetaMask-inspired fox face */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-8 h-8 bg-white rounded-full">
              <motion.div
                className="w-2 h-2 bg-black rounded-full absolute top-2 left-2"
                animate={{
                  scale: [1, 1.2, 1],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
              <motion.div
                className="w-2 h-2 bg-black rounded-full absolute top-2 right-2"
                animate={{
                  scale: [1, 1.2, 1],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );

  if (showForm) {
    return (
      <div className="min-h-screen bg-gray-900 text-white p-6">
        <h1 className="text-2xl font-bold mb-6">Trading Preferences Form</h1>
        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 md:grid-cols-2 gap-4"
        >
          {/* Personal Information */}
          <input
            type="text"
            name="personal_info.name"
            placeholder="Name"
            className="p-2 bg-gray-800 rounded"
            onChange={handleChange}
          />
          <input
            type="email"
            name="personal_info.email"
            placeholder="Email"
            className="p-2 bg-gray-800 rounded"
            onChange={handleChange}
          />
          <input
            type="text"
            name="personal_info.walletAddress"
            placeholder="Wallet Address"
            className="p-2 bg-gray-800 rounded"
            onChange={handleChange}
          />
          <input
            type="text"
            name="personal_info.tradingExperience"
            placeholder="Trading Experience"
            className="p-2 bg-gray-800 rounded"
            onChange={handleChange}
          />
          <input
            type="text"
            name="personal_info.profession"
            placeholder="Profession"
            className="p-2 bg-gray-800 rounded"
            onChange={handleChange}
          />

          {/* Financial Profile */}
          <input
            type="number"
            name="financial_profile.monthlyIncome"
            placeholder="Monthly Income"
            className="p-2 bg-gray-800 rounded"
            onChange={handleChange}
          />
          <input
            type="number"
            name="financial_profile.totalInvestableAmount"
            placeholder="Total Investable Amount"
            className="p-2 bg-gray-800 rounded"
            onChange={handleChange}
          />
          <input
            type="number"
            name="financial_profile.monthlyInvestment"
            placeholder="Monthly Investment"
            className="p-2 bg-gray-800 rounded"
            onChange={handleChange}
          />
          <input
            type="number"
            name="financial_profile.emergencyFunds"
            placeholder="Emergency Funds"
            className="p-2 bg-gray-800 rounded"
            onChange={handleChange}
          />
          <input
            type="text"
            name="financial_profile.existingInvestments"
            placeholder="Existing Investments"
            className="p-2 bg-gray-800 rounded"
            onChange={handleChange}
          />

          {/* Risk Strategy */}
          <input
            type="text"
            name="risk_strategy.riskTolerance"
            placeholder="Risk Tolerance"
            className="p-2 bg-gray-800 rounded"
            onChange={handleChange}
          />
          <input
            type="text"
            name="risk_strategy.maxPortfolioLoss"
            placeholder="Max Portfolio Loss"
            className="p-2 bg-gray-800 rounded"
            onChange={handleChange}
          />
          <input
            type="text"
            name="risk_strategy.investmentTimeframe"
            placeholder="Investment Timeframe"
            className="p-2 bg-gray-800 rounded"
            onChange={handleChange}
          />
          <input
            type="text"
            name="risk_strategy.withdrawalNeeds"
            placeholder="Withdrawal Needs"
            className="p-2 bg-gray-800 rounded"
            onChange={handleChange}
          />

          <Button type="submit" className="col-span-2 mt-4">
            Submit
          </Button>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 text-white p-6 relative">
      <ParticleBackground />

      <motion.div
        className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl"
        animate={{
          scale: [1, 1.2, 1],
          x: [0, 50, 0],
          y: [0, 30, 0],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
        }}
      />

      {/* Header with MetaMask Account */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-purple-400 to-teal-400">
          Trading Dashboard
        </h1>
        <div className="flex items-center gap-6">
          {/* MetaMask Account Section */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-4 bg-gray-800/50 backdrop-blur-lg rounded-lg p-3 border border-gray-700"
          >
            <AnimatedCharacter />
            <div>
              <p className="text-sm text-gray-400">Connected Wallet</p>
              <div className="flex items-center gap-2">
                <span className="font-medium">{truncateAddress(account)}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={copyAddress}
                  className="p-1 hover:bg-gray-700/50"
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </motion.div>
          <div className="flex gap-4">
            <Button variant="ghost" className="flex items-center gap-2">
              <RefreshCcw className="h-4 w-4" />
              Sync
            </Button>
            <Button variant="ghost" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Settings
            </Button>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        {[
          {
            title: "Portfolio Value",
            value: "$15,234.56",
            icon: Wallet,
            trend: "+12.3%",
            isPositive: true,
          },
          {
            title: "Daily Return",
            value: "$234.12",
            icon: BarChart2,
            trend: "+5.2%",
            isPositive: true,
          },
          {
            title: "Active Trades",
            value: "8",
            icon: Activity,
            trend: "3 pending",
            isPositive: true,
          },
          {
            title: "Total Profit",
            value: "$1,234.56",
            icon: PieChart,
            trend: "-2.1%",
            isPositive: false,
          },
        ].map((stat, index) => (
          <motion.div
            key={index}
            whileHover={{ y: -5 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="bg-gray-800/50 backdrop-blur-lg border-gray-700">
              <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-gray-400 text-sm mb-1">{stat.title}</p>
                    <p className="text-2xl font-bold">{stat.value}</p>
                  </div>
                  <stat.icon className="h-6 w-6 text-blue-400" />
                </div>
                <div className="mt-2 flex items-center">
                  {stat.isPositive ? (
                    <ArrowUpRight className="h-4 w-4 text-green-400" />
                  ) : (
                    <ArrowDownRight className="h-4 w-4 text-red-400" />
                  )}
                  <span
                    className={`text-sm ${
                      stat.isPositive ? "text-green-400" : "text-red-400"
                    }`}
                  >
                    {stat.trend}
                  </span>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Main Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <Card className="bg-gray-800/50 backdrop-blur-lg border-gray-700">
          <CardHeader>
            <CardTitle className="text-xl font-bold">
              Portfolio Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={portfolioData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="name" stroke="#9CA3AF" />
                  <YAxis stroke="#9CA3AF" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1F2937",
                      border: "none",
                      borderRadius: "8px",
                      color: "#fff",
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke="#60A5FA"
                    strokeWidth={2}
                    dot={{ fill: "#60A5FA" }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Bottom Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Active Trades */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="bg-gray-800/50 backdrop-blur-lg border-gray-700">
            <CardHeader>
              <CardTitle className="text-xl font-bold">Active Trades</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  {
                    pair: "BTC/USDT",
                    amount: "0.15 BTC",
                    value: "$4,523.12",
                    profit: "+2.3%",
                  },
                  {
                    pair: "ETH/USDT",
                    amount: "2.5 ETH",
                    value: "$3,142.50",
                    profit: "-1.2%",
                  },
                  {
                    pair: "SOL/USDT",
                    amount: "12 SOL",
                    value: "$1,234.56",
                    profit: "+5.6%",
                  },
                ].map((trade, index) => (
                  <div
                    key={index}
                    className="flex justify-between items-center p-4 border border-gray-700 rounded-lg"
                  >
                    <div>
                      <p className="font-semibold">{trade.pair}</p>
                      <p className="text-sm text-gray-400">{trade.amount}</p>
                    </div>
                    <div className="text-right">
                      <p>{trade.value}</p>
                      <p
                        className={
                          trade.profit.startsWith("+")
                            ? "text-green-400"
                            : "text-red-400"
                        }
                      >
                        {trade.profit}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Trading Settings */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="bg-gray-800/50 backdrop-blur-lg border-gray-700">
            <CardHeader>
              <CardTitle className="text-xl font-bold">
                Trading Settings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { name: "Risk Level", value: "Medium", icon: Sliders },
                  { name: "Auto-trading", value: "Enabled", icon: RefreshCcw },
                  { name: "Stop Loss", value: "Active", icon: Activity },
                ].map((setting, index) => (
                  <div
                    key={index}
                    className="flex justify-between items-center p-4 border border-gray-700 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <setting.icon className="h-5 w-5 text-blue-400" />
                      <span>{setting.name}</span>
                    </div>
                    <span className="text-gray-400">{setting.value}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard;
