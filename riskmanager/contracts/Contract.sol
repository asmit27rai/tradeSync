// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@chainlink/contracts/src/v0.8/shared/interfaces/AggregatorV3Interface.sol";

contract PortfolioRiskManager is Ownable {
    struct Asset {
        string symbol;
        uint256 quantity;
        uint256 currentPriceUSD;
        uint256 valueUSD;
        uint256 allocationPercentage;
    }
    
    struct RiskMetrics {
        string largestAllocationSymbol;
        uint256 largestAllocationPercentage;
        string riskLevel;
        uint256 diversificationScore;
    }
    
    struct Portfolio {
        string portfolioId;
        address walletAddress;
        uint256 timestamp;
        uint256 totalValueUSD;
        Asset[] assets;
        RiskMetrics riskMetrics;
    }
    
    mapping(address => Portfolio) public portfolios;
    
    uint256 public constant HIGH_RISK_THRESHOLD = 50; // 50% allocation in single asset
    uint256 public constant MEDIUM_RISK_THRESHOLD = 30; // 30% allocation in single asset
    uint256 public constant MIN_DIVERSIFICATION_SCORE = 40;
    
    event RiskAlert(address indexed wallet, string alertType, string message);
    event PortfolioUpdated(address indexed wallet, uint256 timestamp, string riskLevel);

    constructor(address initialOwner) Ownable(initialOwner) {}

    function calculateRiskMetrics(Asset[] memory assets, uint256) 
        public 
        pure 
        returns (RiskMetrics memory) 
    {
        RiskMetrics memory metrics;
        
        uint256 maxAllocation = 0;
        uint256 assetCount = assets.length;
        
        for (uint256 i = 0; i < assetCount; i++) {
            if (assets[i].allocationPercentage > maxAllocation) {
                maxAllocation = assets[i].allocationPercentage;
                metrics.largestAllocationSymbol = assets[i].symbol;
                metrics.largestAllocationPercentage = maxAllocation;
            }
        }
        
        uint256 sumSquaredAllocations = 0;
        for (uint256 i = 0; i < assetCount; i++) {
            sumSquaredAllocations += (assets[i].allocationPercentage * assets[i].allocationPercentage);
        }
        
        metrics.diversificationScore = 100 - (sumSquaredAllocations / assetCount);
        
        if (maxAllocation >= HIGH_RISK_THRESHOLD) {
            metrics.riskLevel = "high";
        } else if (maxAllocation >= MEDIUM_RISK_THRESHOLD) {
            metrics.riskLevel = "medium";
        } else {
            metrics.riskLevel = "low";
        }
        
        return metrics;
    }
    
    function updatePortfolio(
        string memory portfolioId,
        Asset[] memory assets,
        uint256 totalValueUSD
    ) external {
        Portfolio storage portfolio = portfolios[msg.sender];
        portfolio.portfolioId = portfolioId;
        portfolio.walletAddress = msg.sender;
        portfolio.timestamp = block.timestamp;
        portfolio.totalValueUSD = totalValueUSD;
        
        delete portfolio.assets;
        for (uint256 i = 0; i < assets.length; i++) {
            portfolio.assets.push(assets[i]);
        }
        
        portfolio.riskMetrics = calculateRiskMetrics(assets, totalValueUSD);
        
        if (portfolio.riskMetrics.diversificationScore < MIN_DIVERSIFICATION_SCORE) {
            emit RiskAlert(
                msg.sender,
                "LOW_DIVERSIFICATION",
                "Portfolio diversification score is below recommended threshold"
            );
        }
        
        if (portfolio.riskMetrics.largestAllocationPercentage >= HIGH_RISK_THRESHOLD) {
            emit RiskAlert(
                msg.sender,
                "HIGH_CONCENTRATION",
                string(abi.encodePacked(
                    "High concentration in asset: ",
                    portfolio.riskMetrics.largestAllocationSymbol
                ))
            );
        }
        
        emit PortfolioUpdated(msg.sender, block.timestamp, portfolio.riskMetrics.riskLevel);
    }
    
    function getPortfolioRiskMetrics(address wallet) 
        external 
        view 
        returns (RiskMetrics memory) 
    {
        return portfolios[wallet].riskMetrics;
    }
}