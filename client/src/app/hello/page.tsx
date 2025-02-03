// import {
//   createThirdwebClient,
//   getContract,
//   prepareContractCall,
//   prepareEvent,
// } from "thirdweb";
// import { defineChain } from "thirdweb/chains";
// import {
//   useSendTransaction,
//   useReadContract,
//   useContractEvents,
// } from "thirdweb/react";

// const client = createThirdwebClient({
//   clientId: process.env.NEXT_PUBLIC_CLIENT_ID || "",
// });

// const contract = getContract({
//   client,
//   chain: defineChain(84532),
//   address: process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || "",
// });

// function fu1() {
//   const { mutate: sendTransaction } = useSendTransaction();

//   const onClick = () => {
//     const transaction = prepareContractCall({
//       contract,
//       method: "function renounceOwnership()",
//       params: [],
//     });
//     sendTransaction(transaction);
//   };
// }

// function fu2() {
//   const { mutate: sendTransaction } = useSendTransaction();

//   const onClick = () => {
//     const transaction = prepareContractCall({
//       contract,
//       method: "function transferOwnership(address newOwner)",
//       params: [newOwner],
//     });
//     sendTransaction(transaction);
//   };
// }

// function fun3() {
//   const { mutate: sendTransaction } = useSendTransaction();

//   const onClick = () => {
//     const transaction = prepareContractCall({
//       contract,
//       method:
//         "function updatePortfolio(string portfolioId, (string symbol, uint256 quantity, uint256 currentPriceUSD, uint256 valueUSD, uint256 allocationPercentage)[] assets, uint256 totalValueUSD)",
//       params: [portfolioId, assets, totalValueUSD],
//     });
//     sendTransaction(transaction);
//   };
// }

// function fun4() {
//   const { data, isPending } = useReadContract({
//     contract,
//     method: "function HIGH_RISK_THRESHOLD() view returns (uint256)",
//     params: [],
//   });
// }

// function fun5() {
//   const { data, isPending } = useReadContract({
//     contract,
//     method: "function MEDIUM_RISK_THRESHOLD() view returns (uint256)",
//     params: [],
//   });
// }

// function fun6() {
//   const { data, isPending } = useReadContract({
//     contract,
//     method: "function MIN_DIVERSIFICATION_SCORE() view returns (uint256)",
//     params: [],
//   });
// }

// function fun7() {
//   const { data, isPending } = useReadContract({
//     contract,
//     method:
//       "function calculateRiskMetrics((string symbol, uint256 quantity, uint256 currentPriceUSD, uint256 valueUSD, uint256 allocationPercentage)[] assets, uint256) pure returns ((string largestAllocationSymbol, uint256 largestAllocationPercentage, string riskLevel, uint256 diversificationScore))",
//     params: [assets],
//   });
// }

// function fun8() {
//   const { data, isPending } = useReadContract({
//     contract,
//     method:
//       "function getPortfolioRiskMetrics(address wallet) view returns ((string largestAllocationSymbol, uint256 largestAllocationPercentage, string riskLevel, uint256 diversificationScore))",
//     params: [wallet],
//   });
// }

// function fun9() {
//   const { data, isPending } = useReadContract({
//     contract,
//     method: "function owner() view returns (address)",
//     params: [],
//   });
// }

// function fun10() {
//   const { data, isPending } = useReadContract({
//     contract,
//     method:
//       "function portfolios(address) view returns (string portfolioId, address walletAddress, uint256 timestamp, uint256 totalValueUSD, (string largestAllocationSymbol, uint256 largestAllocationPercentage, string riskLevel, uint256 diversificationScore) riskMetrics)",
//     params: [],
//   });
// }

// const preparedEvent = prepareEvent({
//   signature:
//     "event OwnershipTransferred(address indexed previousOwner, address indexed newOwner)",
// });
// function fun11() {
//   const { data: event } = useContractEvents({
//     contract,
//     events: [preparedEvent],
//   });
// }

// const preparedEvent_2 = prepareEvent({
//   signature:
//     "event PortfolioUpdated(string indexed portfolioId, address indexed walletAddress, uint256 timestamp, uint256 totalValueUSD, (string largestAllocationSymbol, uint256 largestAllocationPercentage, string riskLevel, uint256 diversificationScore) riskMetrics)",
// });

// function fun12() {
//   const { data: event } = useContractEvents({
//     contract,
//     events: [preparedEvent_2],
//   });
// }

// const preparedEvent_3 = prepareEvent({
//   signature:
//     "event RiskAlert(address indexed wallet, string alertType, string message)",
// });

// function fun13() {
//   const { data: event } = useContractEvents({
//     contract,
//     events: [preparedEvent_3],
//   });
// }

"use client";

import React, { useEffect, useState } from "react";
import { createThirdwebClient, getContract, resolveMethod } from "thirdweb";
import { defineChain } from "thirdweb/chains";
import { ThirdwebProvider, useReadContract } from "thirdweb/react";
import { QueryClient, QueryClientProvider } from "react-query";
import { useWallet } from "@/context/walletContext";

const queryClient = new QueryClient();

interface RiskMetrics {
  largestAllocationSymbol: string;
  largestAllocationPercentage: number;
  riskLevel: string;
  diversificationScore: number;
}

const client = createThirdwebClient({
  clientId: process.env.NEXT_PUBLIC_CLIENT_ID || "",
});

const contract = getContract({
  client,
  chain: defineChain(84532),
  address: process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || "",
});

const RiskManagementUI: React.FC = () => {
  const [riskMetrics, setRiskMetrics] = useState<RiskMetrics | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const { account } = useWallet();

  const { data: riskData, isPending } = useReadContract({
    contract,
    method: "function getPortfolioRiskMetrics(address wallet) view returns ((string largestAllocationSymbol, uint256 largestAllocationPercentage, string riskLevel, uint256 diversificationScore))",
    params: [account || ""],
  });

  useEffect(() => {
    if (riskData) {
      setRiskMetrics(riskData);
      setLoading(false);
    }
  }, [riskData]);

  // Dummy data for demonstration
  const dummyData: RiskMetrics = {
    largestAllocationSymbol: "BTC",
    largestAllocationPercentage: 60,
    riskLevel: "high",
    diversificationScore: 30,
  };

  return (
    <QueryClientProvider client={queryClient}>
      <ThirdwebProvider>
        <div className="container mx-auto p-4">
          <h1 className="text-2xl font-bold mb-4">Risk Management Dashboard</h1>
          {loading ? (
            <p>Loading...</p>
          ) : (
            <div className="bg-gray-800 p-6 rounded-lg text-white">
              <h2 className="text-xl font-semibold mb-2">
                Portfolio Risk Metrics
              </h2>
              <ul>
                <li>
                  <strong>Largest Allocation Asset:</strong>{" "}
                  {riskMetrics?.largestAllocationSymbol ||
                    dummyData.largestAllocationSymbol}
                </li>
                <li>
                  <strong>Largest Allocation Percentage:</strong>{" "}
                  {riskMetrics?.largestAllocationPercentage ||
                    dummyData.largestAllocationPercentage}
                  %
                </li>
                <li>
                  <strong>Risk Level:</strong>{" "}
                  {riskMetrics?.riskLevel || dummyData.riskLevel}
                </li>
                <li>
                  <strong>Diversification Score:</strong>{" "}
                  {riskMetrics?.diversificationScore ||
                    dummyData.diversificationScore}
                </li>
              </ul>
            </div>
          )}
        </div>
      </ThirdwebProvider>
    </QueryClientProvider>
  );
};

export default RiskManagementUI;
