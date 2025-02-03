import React, { useState, useEffect } from "react";
import { useWallet } from "@/context/walletContext";

interface Asset {
  symbol: string;
  allocationPercentage: number;
}

interface RiskMetrics {
  largestAllocationSymbol: string;
  largestAllocationPercentage: number;
  riskLevel: string;
  diversificationScore: number;
}

interface PortfolioRiskProps {
  portfolioId: string;
  totalValueUSD: number;
  assets: Asset[];
}

const ADMIN_WALLET = process.env.NEXT_PUBLIC_ADMIN_WALLET || "";

const RiskManagement: React.FC<PortfolioRiskProps> = ({ portfolioId, totalValueUSD, assets }) => {
  const [riskMetrics, setRiskMetrics] = useState<RiskMetrics | null>(null);
  const [subscriptionActive, setSubscriptionActive] = useState<boolean>(false);

  const { account } = useWallet();

  useEffect(() => {
    const fetchSubscriptionStatus = async () => {
      const response = await fetch('http://localhost:5000/api/v1/subscription/read');
      const data = await response.json();
      const subscription = data.data.find((item: any) => item.address === account);
      console.log(data);
      if (subscription && subscription.transactionDone) {
        setSubscriptionActive(true);
      }
    };

    fetchSubscriptionStatus();
  }, [account]); 

  const calculateRiskMetrics = (assets: Asset[]): RiskMetrics => {
    if (!assets || assets.length === 0) {
      return {
        largestAllocationSymbol: "N/A",
        largestAllocationPercentage: 0,
        riskLevel: "N/A",
        diversificationScore: 0,
      };
    }

    let maxAllocation = 0;
    let largestAllocationSymbol = "";
    let diversificationScore = 0;

    let sumSquaredAllocations = 0;
    for (let i = 0; i < assets.length; i++) {
      const asset = assets[i];
      if (asset.allocationPercentage > maxAllocation) {
        maxAllocation = asset.allocationPercentage;
        largestAllocationSymbol = asset.symbol;
      }
      sumSquaredAllocations += asset.allocationPercentage * asset.allocationPercentage;
    }

    diversificationScore = assets.length > 0 ? 100 - sumSquaredAllocations / assets.length : 0;

    const riskLevel = maxAllocation >= 50 ? "high" : maxAllocation >= 30 ? "medium" : "low";

    return {
      largestAllocationSymbol,
      largestAllocationPercentage: maxAllocation,
      riskLevel,
      diversificationScore,
    };
  };

  const handleActivateSubscription = async () => {
    if (!window.ethereum) {
      alert("Please install MetaMask to proceed.");
      return;
    }

    try {
      const provider = window.ethereum;
      const accounts = await provider.request({ method: "eth_requestAccounts" });
      const sender = accounts[0];

      const transactionParameters = {
        from: sender,
        to: ADMIN_WALLET,
        value: "0x16345785D8A0000",
        gas: "0x5208",
      };

      const txHash = await provider.request({
        method: "eth_sendTransaction",
        params: [transactionParameters],
      });

      console.log("Transaction sent! Hash:", txHash);

      // Polling for transaction success (optional)
      setTimeout(async () => {
        const response = await fetch("http://localhost:5000/api/v1/subscription/write", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ address: sender, transactionDone: true }),
        });

        const data = await response.json();
        if (data.message === "Subscription data written successfully") {
          setSubscriptionActive(true);
        }
      }, 5000); // Wait for confirmation before saving subscription
    } catch (error) {
      console.error("Transaction failed:", error);
      alert("Transaction failed. Please try again.");
    }
  };

  return (
    <div>
      <h2>Risk Management</h2>
      <div>
        <h3>Risk Level: {riskMetrics?.riskLevel}</h3>
        <p>Largest Allocation: {riskMetrics?.largestAllocationSymbol} ({riskMetrics?.largestAllocationPercentage}%)</p>
        <p>Diversification Score: {riskMetrics?.diversificationScore}</p>
      </div>

      <div>
        {!subscriptionActive ? (
          <button onClick={handleActivateSubscription}>Activate Subscription</button>
        ) : (
          <p>Subscription Active</p>
        )}
      </div>
    </div>
  );
};

export default RiskManagement;