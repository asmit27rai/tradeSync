"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  User,
  Mail,
  Briefcase,
  Clock,
  DollarSign,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useWallet } from "@/context/walletContext";
import Graph from "@/components/Graph";
import { useNavigate } from 'react-router-dom';
import { BrowserRouter as Router } from "react-router-dom";

interface NavigatorProps {
  route: string;
  children: React.ReactNode;
}

const Navigator: React.FC<NavigatorProps> = ({ route, children }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(route);
  };

  return (
    <button onClick={handleClick} className="p-2 bg-blue-500 text-white rounded">
      {children}
    </button>
  );
};


const Dashboard = () => {
  const { account } = useWallet();
  const [showForm, setShowForm] = useState(true);
  interface UserData {
    personal_info: {
      name: string;
      email: string;
      walletAddress: string | null;
      tradingExperience: string;
      profession: string;
    };
    financial_profile: {
      monthlyIncome: string;
      totalInvestableAmount: string;
      monthlyInvestment: string;
      emergencyFunds: string;
      existingInvestments: string;
    };
    risk_strategy: {
      riskTolerance: string;
      maxPortfolioLoss: string;
      investmentTimeframe: string;
      withdrawalNeeds: string;
    };
  }
  
  const [userData, setUserData] = useState<UserData | null>(null);
  
  const [formData, setFormData] = useState({
    personal_info: {
      name: "",
      email: "",
      walletAddress: account || "", // Set wallet address from account
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
    const submissionData = {
      ...formData,
      personal_info: {
        ...formData.personal_info,
        walletAddress: account,
      },
    };
    setShowForm(false);

    try {
      const response = await fetch("http://localhost:5000/api/v1/write", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(submissionData),
      });

      if (!response.ok) {
        throw new Error("Error submitting form");
      }

      const data = await response.json();
      console.log("Form submitted successfully:", data);
      setUserData(submissionData);
      setShowForm(false);
    } catch (error) {
      console.error("Error while submitting form:", error);
    }
  };

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
    const fetchUserData = async () => {
      if (!account) return;

      try {
        const response = await fetch("http://localhost:5000/api/read", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error("Error fetching data");
        }

        const data = await response.json();
        
        // Find data for current wallet address
        const userSpecificData = data.data.find(
          item => item.personal_info.walletAddress.toLowerCase() === account.toLowerCase()
        );

        if (userSpecificData) {
          setUserData(userSpecificData);
          setShowForm(false); // Hide form if user data exists
        } else {
          setShowForm(true); // Show form if no user data found
        }
      } catch (error) {
        console.error("Error while fetching data:", error);
        setShowForm(true);
      }
    };

    fetchUserData();
  }, [account]);

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

  const calculateStats = () => {
    if (!userData) return null;

    const totalInvestable = parseFloat(userData.financial_profile.totalInvestableAmount);
    const monthlyInvestment = parseFloat(userData.financial_profile.monthlyInvestment);
    const emergencyFunds = parseFloat(userData.financial_profile.emergencyFunds);
    const existingInvestments = parseFloat(userData.financial_profile.existingInvestments);

    const totalPortfolio = totalInvestable + existingInvestments;
    const monthlyRate = (monthlyInvestment / totalPortfolio) * 100;

    return {
      totalPortfolio: totalPortfolio.toFixed(2),
      monthlyInvestmentRate: monthlyRate.toFixed(1),
      emergencyRatio: ((emergencyFunds / totalPortfolio) * 100).toFixed(1),
      investmentUtilization: ((existingInvestments / totalInvestable) * 100).toFixed(1)
    };
  };

  const generatePortfolioData = () => {
    if (!userData) return [];
    
    const monthlyInvestment = parseFloat(userData.financial_profile.monthlyInvestment);
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    let currentValue = parseFloat(userData.financial_profile.existingInvestments);
    
    return months.map(month => {
      currentValue *= (1 + (Math.random() * 0.1 - 0.05)); // Random fluctuation
      currentValue += monthlyInvestment;
      return {
        name: month,
        value: Math.round(currentValue)
      };
    });
  };

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
            value={account || ""}
            className="p-2 bg-gray-800 rounded cursor-not-allowed"
            readOnly
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

  const stats = calculateStats();
  const portfolioData = generatePortfolioData();

  return (
    <Router>
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 text-white p-6 relative">
      <ParticleBackground />

      {/* Header section remains the same */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-purple-400 to-teal-400">
          Trading Dashboard
          <Navigator route={`/portfolio/${account}`}>Portfolio</Navigator>
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
        </div>
      </div>

      {/* User Profile Summary */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <Card className="bg-gray-800/50 backdrop-blur-lg border-gray-700">
          <CardHeader>
            <CardTitle className="text-xl font-bold">Profile Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="flex items-center gap-4">
                <User className="h-8 w-8 text-blue-400" />
                <div>
                  <p className="text-gray-400">Name</p>
                  <p className="font-medium">{userData?.personal_info.name}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <Mail className="h-8 w-8 text-blue-400" />
                <div>
                  <p className="text-gray-400">Email</p>
                  <p className="font-medium">{userData?.personal_info.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <Briefcase className="h-8 w-8 text-blue-400" />
                <div>
                  <p className="text-gray-400">Profession</p>
                  <p className="font-medium">{userData?.personal_info.profession}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        {[
          {
            title: "Total Portfolio",
            value: `$${stats?.totalPortfolio}`,
            icon: Wallet,
            trend: `${stats?.monthlyInvestmentRate}% monthly`,
            isPositive: true,
          },
          {
            title: "Monthly Investment",
            value: `$${userData?.financial_profile.monthlyInvestment}`,
            icon: BarChart2,
            trend: "Regular Investment",
            isPositive: true,
          },
          {
            title: "Risk Tolerance",
            value: userData?.risk_strategy.riskTolerance,
            icon: Activity,
            trend: `Max Loss ${userData?.risk_strategy.maxPortfolioLoss}`,
            isPositive: true,
          },
          {
            title: "Emergency Funds",
            value: `$${userData?.financial_profile.emergencyFunds}`,
            icon: PieChart,
            trend: `${stats?.emergencyRatio}% of portfolio`,
            isPositive: true,
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

      {/* Portfolio Performance Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <Card className="bg-gray-800/50 backdrop-blur-lg border-gray-700">
          <CardHeader>
            <CardTitle className="text-xl font-bold">Portfolio Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[400px]">
              <Graph />
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Investment Strategy */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="bg-gray-800/50 backdrop-blur-lg border-gray-700">
            <CardHeader>
              <CardTitle className="text-xl font-bold">Investment Strategy</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-4 border border-gray-700 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Clock className="h-5 w-5 text-blue-400" />
                    <span>Investment Timeframe</span>
                  </div>
                  <span className="text-gray-400">{userData?.risk_strategy.investmentTimeframe}</span>
                </div>
                <div className="flex justify-between items-center p-4 border border-gray-700 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Activity className="h-5 w-5 text-blue-400" />
                    <span>Risk Tolerance</span>
                  </div>
                  <span className="text-gray-400">{userData?.risk_strategy.riskTolerance}</span>
                </div>
                <div className="flex justify-between items-center p-4 border border-gray-700 rounded-lg">
                  <div className="flex items-center gap-3">
                    <DollarSign className="h-5 w-5 text-blue-400" />
                    <span>Withdrawal Needs</span>
                  </div>
                  <span className="text-gray-400">{userData?.risk_strategy.withdrawalNeeds}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Financial Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="bg-gray-800/50 backdrop-blur-lg border-gray-700">
            <CardHeader>
              <CardTitle className="text-xl font-bold">Financial Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-4 border border-gray-700 rounded-lg">
                  <div className="flex items-center gap-3">
                    <DollarSign className="h-5 w-5 text-blue-400" />
                    <span>Monthly Income</span>
                  </div>
                  <span className="text-gray-400">${userData?.financial_profile.monthlyIncome}</span>
                </div>
                <div className="flex justify-between items-center p-4 border border-gray-700 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Wallet className="h-5 w-5 text-blue-400" />
                    <span>Total Investable Amount</span>
                  </div>
                  <span className="text-gray-400">${userData?.financial_profile.totalInvestableAmount}</span>
                </div>
                <div className="flex justify-between items-center p-4 border border-gray-700 rounded-lg">
                  <div className="flex items-center gap-3">
                    <PieChart className="h-5 w-5 text-blue-400" />
                    <span>Existing Investments</span>
                  </div>
                  <span className="text-gray-400">${userData?.financial_profile.existingInvestments}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
    </Router>
  );
};

export default Dashboard;