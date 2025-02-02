import { SecretVaultWrapper } from "nillion-sv-wrappers";
import { orgConfig } from "./nillionOrgConfig.js";
import { v4 as uuidv4 } from "uuid";
import express from "express";
import dotenv from "dotenv";
import cors from "cors";

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;
app.use(express.json());
app.use(cors());

const SCHEMA_ID = process.env.SCHEMA_ID;
const PORTFOLIO_SCHEMA_ID = process.env.PORTFOLIO_ID;
const SUBSCRIPTION = process.env.SUBSCRIBE_ID;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

app.post("/api/v1/write", async (req, res) => {
  try {
    const collection = new SecretVaultWrapper(
      orgConfig.nodes,
      orgConfig.orgCredentials,
      SCHEMA_ID
    );
    await collection.init();

    const data = [
        {
          _id: uuidv4(),
          personal_info: {
            name: req.body.personal_info.name,
            email: req.body.personal_info.email,
            walletAddress: req.body.personal_info.walletAddress,
            tradingExperience: req.body.personal_info.tradingExperience,
            profession: req.body.personal_info.profession
          },
          financial_profile: {
            monthlyIncome: parseInt(req.body.financial_profile.monthlyIncome),
            totalInvestableAmount: parseInt(req.body.financial_profile.totalInvestableAmount),
            monthlyInvestment: parseInt(req.body.financial_profile.monthlyInvestment),
            emergencyFunds: parseInt(req.body.financial_profile.emergencyFunds),
            existingInvestments: req.body.financial_profile.existingInvestments
          },
          risk_strategy: {
            riskTolerance: req.body.risk_strategy.riskTolerance,
            maxPortfolioLoss: req.body.risk_strategy.maxPortfolioLoss,
            investmentTimeframe: req.body.risk_strategy.investmentTimeframe,
            withdrawalNeeds: req.body.risk_strategy.withdrawalNeeds
          }
        }
      ];      

    const dataWritten = await collection.writeToNodes(data);

    res.status(200).json({
      message: "Data written successfully",
      data: dataWritten,
    });
  } catch (error) {
    console.error("❌ Error while writing data:", error.message);
    res.status(500).json({
      message: "Error writing data",
      error: error.message,
    });
  }
});

app.get("/api/read", async (req, res) => {
  try {
    const collection = new SecretVaultWrapper(
      orgConfig.nodes,
      orgConfig.orgCredentials,
      SCHEMA_ID
    );
    await collection.init();

    const decryptedCollectionData = await collection.readFromNodes({});
    res.status(200).json({
      message: "Data retrieved successfully",
      data: decryptedCollectionData,
    });
  } catch (error) {
    console.error("❌ Error while reading data:", error.message);
    res.status(500).json({
      message: "Error reading data",
      error: error.message,
    });
  }
});

app.post("/api/v1/portfolio/write", async (req, res) => {
  try {
    const collection = new SecretVaultWrapper(
      orgConfig.nodes,
      orgConfig.orgCredentials,
      PORTFOLIO_SCHEMA_ID
    );
    await collection.init();

    const { wallet_address, timestamp, total_value_usd, assets, risk_metrics } = req.body;

    const data = [
      {
        _id: uuidv4(),
        portfolio_id: uuidv4(),
        wallet_address,
        timestamp,
        total_value_usd,
        assets: assets.map(asset => ({
          symbol: asset.symbol,
          name: asset.name,
          quantity: asset.quantity,
          current_price_usd: asset.current_price_usd,
          value_usd: asset.value_usd,
          allocation_percentage: asset.allocation_percentage,
        })),
        risk_metrics: risk_metrics || null
      }
    ];

    const dataWritten = await collection.writeToNodes(data);

    res.status(200).json({
      message: "Portfolio data written successfully",
      data: dataWritten,
    });
  } catch (error) {
    console.error("❌ Error while writing portfolio data:", error.message);
    res.status(500).json({
      message: "Error writing portfolio data",
      error: error.message,
    });
  }
});

app.get("/api/v1/portfolio/read", async (req, res) => {
  try {
    const collection = new SecretVaultWrapper(
      orgConfig.nodes,
      orgConfig.orgCredentials,
      PORTFOLIO_SCHEMA_ID
    );
    await collection.init();

    const decryptedPortfolioData = await collection.readFromNodes({});
    res.status(200).json({
      message: "Portfolio data retrieved successfully",
      data: decryptedPortfolioData,
    });
  } catch (error) {
    console.error("❌ Error while reading portfolio data:", error.message);
    res.status(500).json({
      message: "Error reading portfolio data",
      error: error.message,
    });
  }
});

app.post("/api/v1/subscription/write", async (req, res) => {
  try {
    const collection = new SecretVaultWrapper(
      orgConfig.nodes,
      orgConfig.orgCredentials,
      SUBSCRIPTION
    );
    await collection.init();

    const { address, transactionDone } = req.body;

    if (!address || typeof transactionDone !== "boolean") {
      return res.status(400).json({ message: "Invalid request data" });
    }

    const data = [
      {
        _id: uuidv4(),
        address,
        transactionDone
      }
    ];

    const dataWritten = await collection.writeToNodes(data);

    res.status(200).json({
      message: "Subscription data written successfully",
      data: dataWritten,
    });
  } catch (error) {
    console.error("❌ Error while writing subscription data:", error.message);
    res.status(500).json({
      message: "Error writing subscription data",
      error: error.message,
    });
  }
});

app.get("/api/v1/subscription/read", async (req, res) => {
  try {
    const collection = new SecretVaultWrapper(
      orgConfig.nodes,
      orgConfig.orgCredentials,
      SUBSCRIPTION
    );
    await collection.init();

    const decryptedSubscriptionData = await collection.readFromNodes({});
    res.status(200).json({
      message: "Subscription data retrieved successfully",
      data: decryptedSubscriptionData,
    });
  } catch (error) {
    console.error("❌ Error while reading subscription data:", error.message);
    res.status(500).json({
      message: "Error reading subscription data",
      error: error.message,
    });
  }
});