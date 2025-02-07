"use client";

import React, { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { TrendingUp, PieChart, Shield } from "lucide-react";
import { useWallet } from "@/context/walletContext";
import RiskManager from "@/components/RiskManager";

interface Portfolio {
  wallet_address: string;
  timestamp: string;
  total_value_usd: number;
  assets: {
    symbol: string;
    name: string;
    quantity: number;
    current_price_usd: number;
    value_usd: number;
    allocation_percentage: number;
  }[];
  risk_metrics: {
    risk_level: string;
    diversification_score: number;
  };
}

const PortfolioDashboard: React.FC = () => {
  const { account } = useWallet();
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPortfolio = async () => {
      if (!account) return;

      try {
        const response = await fetch("http://localhost:5000/api/v1/portfolio/read", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch portfolio data");
        }

        const data = await response.json();
        const userPortfolio = data.data.find((p: Portfolio) => p.wallet_address === account);
        
        if (userPortfolio) {
          setPortfolio(userPortfolio);
        } else {
          setError("No portfolio data found for this wallet.");
        }
      } catch (err) {
        setError(err.message);
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
      <p className="text-sm text-gray-500">
        Wallet: {portfolio.wallet_address}
      </p>

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

const PortfolioOverview: React.FC<{ portfolio: Portfolio }> = ({ portfolio }) => (
  <div className="space-y-4">
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Total Value</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            ${portfolio.total_value_usd.toLocaleString()}
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Risk Level</CardTitle>
          <Shield className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold capitalize">
            {portfolio.risk_metrics.risk_level}
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">
            Diversification Score
          </CardTitle>
          <PieChart className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {portfolio.risk_metrics.diversification_score}/100
          </div>
        </CardContent>
      </Card>
    </div>
  </div>
);

const AssetTable: React.FC<{ portfolio: Portfolio }> = ({ portfolio }) => (
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
                <td className="text-right p-2">
                  ${asset.current_price_usd.toLocaleString()}
                </td>
                <td className="text-right p-2">
                  ${asset.value_usd.toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </CardContent>
  </Card>
);

const RiskAssessment: React.FC<{ portfolio: Portfolio }> = ({ portfolio }) => (
  <Card>
    <CardHeader>
      <CardTitle>Risk Metrics</CardTitle>
    </CardHeader>
    <CardContent>
      <div className="space-y-4">
        <div>
          <div className="text-lg">Risk Level: {portfolio.risk_metrics.risk_level}</div>
          <div className="text-lg">
            Diversification Score: {portfolio.risk_metrics.diversification_score}/100
          </div>
        </div>
        
        {/* Include RiskManager component */}
        <RiskManager riskLevel={portfolio.risk_metrics.risk_level} diversificationScore={portfolio.risk_metrics.diversification_score} />
      </div>
    </CardContent>
  </Card>
);

export default PortfolioDashboard;