"use client";

import React, { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { AlertCircle, TrendingUp, PieChart, Shield } from "lucide-react";
import { useWallet } from "@/context/walletContext";

const PortfolioDashboard = () => {
  const { account } = useWallet();
  const [portfolio, setPortfolio] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!account) return;
    const fetchPortfolio = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/v1/portfolio/read");
        const result = await response.json();
        const portfolios = result.data;
        
        if (!portfolios.length) {
          setPortfolio(null);
          return;
        }

        // Find the latest portfolio for the given wallet_address
        const userPortfolios = portfolios.filter(
          (p) => p.wallet_address === account
        );
        
        if (!userPortfolios.length) {
          setPortfolio(null);
          return;
        }
        
        const latestPortfolio = userPortfolios.reduce((prev, curr) => 
          new Date(curr.timestamp) > new Date(prev.timestamp) ? curr : prev
        );

        setPortfolio(latestPortfolio);
        console.log(latestPortfolio);
      } catch (err) {
        setError("Failed to fetch portfolio data");
      } finally {
        setLoading(false);
      }
    };

    fetchPortfolio();
  }, [account]);

  if (loading) return <div>Loading portfolio...</div>;
  if (error) return <div className="text-red-500">{error}</div>;
  if (!portfolio) return <div>No portfolio data found for this wallet.</div>;

  return (
    <div className="container mx-auto p-4 space-y-4">
      <h1 className="text-3xl font-bold">Portfolio Management</h1>
      <p className="text-sm text-gray-500">Wallet: {portfolio.wallet_address}</p>

      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="assets">Assets</TabsTrigger>
          <TabsTrigger value="risk">Risk Assessment</TabsTrigger>
        </TabsList>
        <TabsContent value="overview">
          <PortfolioOverview portfolio={portfolio} />
        </TabsContent>
        <TabsContent value="assets">
          <AssetTable portfolio={portfolio} />
        </TabsContent>
        <TabsContent value="risk">
          <RiskAssessment portfolio={portfolio} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

const PortfolioOverview = ({ portfolio }) => (
  <div className="space-y-4">
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Total Value</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">${portfolio.total_value_usd.toLocaleString()}</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Risk Level</CardTitle>
          <Shield className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold capitalize">{portfolio.risk_metrics.risk_level}</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Diversification Score</CardTitle>
          <PieChart className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{portfolio.risk_metrics.diversification_score}/100</div>
        </CardContent>
      </Card>
    </div>
  </div>
);

const AssetTable = ({ portfolio }) => (
  <Card>
    <CardHeader>
      <CardTitle>Asset Details</CardTitle>
    </CardHeader>
    <CardContent>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b">
              <th className="text-left p-2">Asset</th>
              <th className="text-right p-2">Quantity</th>
              <th className="text-right p-2">Price (USD)</th>
              <th className="text-right p-2">Value (USD)</th>
            </tr>
          </thead>
          <tbody>
            {portfolio.assets.map((asset) => (
              <tr key={asset.symbol} className="border-b">
                <td className="p-2">{asset.symbol}</td>
                <td className="text-right p-2">{asset.quantity}</td>
                <td className="text-right p-2">${asset.current_price_usd.toLocaleString()}</td>
                <td className="text-right p-2">${asset.value_usd.toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </CardContent>
  </Card>
);

const RiskAssessment = ({ portfolio }) => (
  <Card>
    <CardHeader>
      <CardTitle>Risk Assessment</CardTitle>
    </CardHeader>
    <CardContent>
      <p>Risk Level: {portfolio.risk_metrics.risk_level}</p>
    </CardContent>
  </Card>
);

export default PortfolioDashboard;