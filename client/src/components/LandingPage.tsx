import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Wallet, BarChart2, Shield, Zap, TrendingUp, Cpu, Globe, Waves } from "lucide-react";
import { useWallet } from '@/context/walletContext';
import { useNavigate } from 'react-router-dom';

const LandingPage = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const { 
    isConnected, 
    account, 
    balance, 
    connect, 
    disconnect, 
    isLoading, 
    error 
  } = useWallet();

  const navigate = useNavigate();

  // Add effect to watch for connection status
  useEffect(() => {
    if (isConnected && account) {
      navigate(`/dashboard/${account}`);
    }
  }, [isConnected, account, navigate]);

  useEffect(() => {
    setIsVisible(true);
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % tradingPhrases.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const tradingPhrases = [
    "Revolutionizing Crypto Trading",
    "AI-Powered Performance",
    "Secure & Transparent",
    "24/7 Automated Trading"
  ];

  const features = [
    {
      icon: <BarChart2 className="h-8 w-8 mb-2" />,
      title: "AI-Powered Trading",
      description: "Advanced machine learning algorithms for intelligent, automated trading strategies"
    },
    {
      icon: <Shield className="h-8 w-8 mb-2" />,
      title: "Secure Infrastructure",
      description: "Multi-signature wallets and continuous risk assessment for maximum security"
    },
    {
      icon: <Zap className="h-8 w-8 mb-2" />,
      title: "Real-time Operations",
      description: "24/7 autonomous trading with emotional-free investment decisions"
    }
  ];

  // Animated background component with interactive particles
  const ParticleBackground = () => {
    return (
      <div className="absolute inset-0 overflow-hidden -z-10">
        <div className="relative w-full h-full">
          {[...Array(50)].map((_, i) => (
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
                  Math.random() * window.innerWidth,
                ],
                y: [
                  Math.random() * window.innerHeight,
                  Math.random() * window.innerHeight,
                  Math.random() * window.innerHeight,
                ],
              }}
              transition={{
                duration: 10 + Math.random() * 20,
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

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.3,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.8,
        ease: "easeOut",
      },
    },
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 text-white relative overflow-hidden">
      <ParticleBackground />
      
      {/* Animated Gradient Orbs */}
      <motion.div
        className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/30 rounded-full blur-3xl"
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
      <motion.div
        className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/30 rounded-full blur-3xl"
        animate={{
          scale: [1.2, 1, 1.2],
          x: [0, -50, 0],
          y: [0, -30, 0],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
        }}
      />

      {/* Hero Section */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="container mx-auto px-4 py-16 relative"
      >
        <motion.div variants={itemVariants} className="text-center max-w-3xl mx-auto">
          <motion.h1
            className="text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-purple-400 to-teal-400"
            animate={{
              backgroundPosition: ["0%", "100%", "0%"],
            }}
            transition={{
              duration: 10,
              repeat: Infinity,
              ease: "linear",
            }}
          >
            TradeSync
          </motion.h1>
          <AnimatePresence mode="wait">
            <motion.div
              key={activeIndex}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -20, opacity: 0 }}
              transition={{ duration: 0.5 }}
              className="h-16 mb-8"
            >
              <p className="text-2xl text-gray-300">{tradingPhrases[activeIndex]}</p>
            </motion.div>
          </AnimatePresence>
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button
              className="bg-gradient-to-r from-blue-500 via-purple-500 to-teal-500 hover:from-blue-600 hover:via-purple-600 hover:to-teal-600 text-white px-8 py-6 rounded-lg text-lg flex items-center gap-2"
              onClick={connect}
              disabled={isLoading}
            >
              <Wallet className="h-5 w-5" />
              {isLoading ? 'Connecting...' : 'Connect Wallet'}
            </Button>
          </motion.div>
        </motion.div>
      </motion.div>

      {/* Features Section */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="container mx-auto px-4 py-16 relative"
      >
        <motion.h2
          variants={itemVariants}
          className="text-3xl font-bold text-center mb-12 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-teal-400"
        >
          Why Choose TradeSync?
        </motion.h2>
        <div className="grid md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              whileHover={{ y: -10 }}
            >
              <Card className="bg-gray-800/50 backdrop-blur-lg border-gray-700">
                <CardContent className="p-6 text-center">
                  <motion.div
                    className="flex justify-center text-blue-400"
                    animate={{ rotate: [0, 360] }}
                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                  >
                    {feature.icon}
                  </motion.div>
                  <h3 className="text-xl font-semibold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-teal-400">
                    {feature.title}
                  </h3>
                  <p className="text-gray-400">{feature.description}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Stats Section */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="container mx-auto px-4 py-16 relative"
      >
        <div className="grid md:grid-cols-3 gap-8 text-center">
          {[
            { value: "$0 Fee", label: "Base Network Trading" },
            { value: "24/7", label: "Autonomous Trading" },
            { value: "100%", label: "Transparent Operations" }
          ].map((stat, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              whileHover={{ scale: 1.05 }}
              className="p-6"
            >
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-purple-400 to-teal-400 mb-2"
              >
                {stat.value}
              </motion.div>
              <p className="text-gray-400">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </motion.div>

      <style jsx global>{`
        @keyframes gradient {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
      `}</style>
    </div>
  );
};

export default LandingPage;