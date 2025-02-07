import React, { useState, useEffect } from "react";
import { useWallet } from "@/context/walletContext";
import { createThirdwebClient, getContract, readContract } from "thirdweb";
import { defineChain } from "thirdweb/chains";

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

const client = createThirdwebClient({
  clientId: process.env.NEXT_PUBLIC_CLIENT_ID || "",
});

const contract = getContract({
  client,
  chain: defineChain(84532),
  address: process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || "",
});

const ADMIN_WALLET = process.env.NEXT_PUBLIC_ADMIN_WALLET || "";

const RiskManagement: React.FC<{ portfolio: Portfolio }> = ({ portfolio }) => {
  const [subscriptionActive, setSubscriptionActive] = useState<boolean>(false);
  const [riskData, setRiskData] = useState<any>(null);
  const [aiResponse, setAiResponse] = useState<string>("");
  const [loadingAi, setLoadingAi] = useState<boolean>(false);
  const { account } = useWallet();

  useEffect(() => {
    const fetchRiskMetrics = async () => {
      try {
        const data = await readContract({
          contract,
          method:
            "function calculateRiskMetrics((string symbol, uint256 quantity, uint256 currentPriceUSD, uint256 valueUSD, uint256 allocationPercentage)[] assets, uint256) pure returns ((string largestAllocationSymbol, uint256 largestAllocationPercentage, string riskLevel, uint256 diversificationScore))",
          params: [portfolio.assets],
        });
        setRiskData(data);
      } catch (error) {
        console.error("Error fetching risk metrics:", error);
      }
    };
    fetchRiskMetrics();
  }, [portfolio.assets]);

  useEffect(() => {
    const fetchSubscriptionStatus = async () => {
      const response = await fetch("http://localhost:5000/api/v1/subscription/read");
      const data = await response.json();
      const subscription = data.data.find((item: any) => item.address === account);
      if (subscription && subscription.transactionDone) {
        setSubscriptionActive(true);
      }
    };
    fetchSubscriptionStatus();
  }, [account]);

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
      }, 5000);
    } catch (error) {
      console.error("Transaction failed:", error);
      alert("Transaction failed. Please try again.");
    }
  };

  const handleAskAI = async () => {
    setLoadingAi(true);
    setAiResponse("");

    try {
      const res = await fetch("http://localhost:5000/api/v1/agent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: `${JSON.stringify(portfolio)} Calculate Risk Management For This Porfolio...` }),
      });
      if (!res.body) {
        throw new Error("ReadableStream not supported in this browser.");
      }
  
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let result = "";
  
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
  
        const text = decoder.decode(value, { stream: true });
        const lines = text.split("\n\n"); // SSE messages are separated by double newlines
  
        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const jsonString = line.slice(6).trim(); // Remove "data: " prefix
  
            if (jsonString === "[DONE]") {
              reader.cancel();
              break;
            }
  
            try {
              const parsed = JSON.parse(jsonString);
              if (parsed.type === "agent" || parsed.type === "tools") {
                result += parsed.content + " "; // Append received chunk
                setAiResponse(result); // Update UI dynamically
              }
            } catch (parseError) {
              console.error("Error parsing SSE data:", parseError);
            }
          }
        }
      }
    } catch (error) {
      console.error("Error fetching AI response:", error);
      setAiResponse("Error fetching AI response.");
    } finally {
      setLoadingAi(false);
    }
  };

  return (
    <div className="p-6 bg-gray-800 text-white rounded-lg shadow-lg max-w-xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Risk Management</h2>
      {riskData ? (
        <div>
          <h3 className="text-lg font-semibold">Risk Level: {riskData.riskLevel}</h3>
          <p><strong>Largest Allocation:</strong> {riskData.largestAllocationSymbol} ({riskData.largestAllocationPercentage}%)</p>
          <p><strong>Diversification Score:</strong> {riskData.diversificationScore}</p>
        </div>
      ) : (
        <p>Loading risk metrics...</p>
      )}
      <div className="mt-4">
        {!subscriptionActive ? (
          <button onClick={handleActivateSubscription} className="bg-blue-500 px-4 py-2 rounded hover:bg-blue-600">
            Activate Subscription
          </button>
        ) : (
          <>
            <p className="text-green-400">Subscription Active</p>
            <button onClick={handleAskAI} className="mt-3 bg-purple-500 px-4 py-2 rounded hover:bg-purple-600">
              {loadingAi ? "Processing..." : "Ask AI"}
            </button>
          </>
        )}
      </div>
      {aiResponse && (
        <div className="mt-4 p-4 bg-gray-700 rounded">
          <h3 className="text-lg font-semibold">AI Response:</h3>
          <p>{aiResponse}</p>
        </div>
      )}
    </div>
  );
};

export default RiskManagement;