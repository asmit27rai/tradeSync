import { SecretVaultWrapper } from "nillion-sv-wrappers";
import { orgConfig } from "./nillionOrgConfig.js";
import { v4 as uuidv4 } from "uuid";
import { WardenAgentKit } from "@wardenprotocol/warden-agent-kit-core";
import { WardenToolkit, WardenTool } from "@wardenprotocol/warden-langchain";
import { HumanMessage } from "@langchain/core/messages";
import { MemorySaver } from "@langchain/langgraph";
import { createReactAgent } from "@langchain/langgraph/prebuilt";
import { ChatOpenAI } from "@langchain/openai";
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

async function initializeAgent() {
  try {
    const llm = new ChatOpenAI({ model: "gpt-4o-mini" });
    const config = {
      privateKeyOrAccount: process.env.PRIVATE_KEY,
    };
    if (!config.privateKeyOrAccount) {
      throw new Error("Missing PRIVATE_KEY in environment variables.");
    }
    const agentkit = new WardenAgentKit(config);
    const wardenToolkit = new WardenToolkit(agentkit);
    const tools = wardenToolkit.getTools();
    const memory = new MemorySaver();

    const agentConfig = {
      configurable: { thread_id: "Warden Agent Kit CLI Agent Example!" },
    };

    const agent = createReactAgent({
      llm,
      tools,
      checkpointSaver: memory,
      messageModifier:
        "You're a helpful assistant that can help with a variety of tasks related to web3 transactions.",
    });

    return { agent, config: agentConfig };
  } catch (error) {
    console.error("Failed to initialize agent:", error);
    throw error;
  }
}

async function startServer() {
  try {
    const { agent, config } = await initializeAgent();

    app.post("/api/v1/agent", async (req, res) => {
      try {
        const userInput = req.body.prompt;

        res.setHeader("Content-Type", "text/event-stream");
        res.setHeader("Cache-Control", "no-cache");
        res.setHeader("Connection", "keep-alive");

        const stream = await agent.stream(
          { messages: [new HumanMessage(userInput)] },
          config
        );

        for await (const chunk of stream) {
          if ("agent" in chunk) {
            res.write(
              `data: ${JSON.stringify({
                type: "agent",
                content: chunk.agent.messages[0].content,
              })}\n\n`
            );
          } else if ("tools" in chunk) {
            res.write(
              `data: ${JSON.stringify({
                type: "tools",
                content: chunk.tools.messages[0].content,
              })}\n\n`
            );
          }
        }

        res.write("data: [DONE]\n\n");
        res.end();
      } catch (error) {
        console.error("Error processing agent request:", error);

        if (!res.headersSent) {
          res.status(500).json({
            message: "Agent processing error",
            error: error.message,
          });
        } else {
          res.write(
            `data: ${JSON.stringify({
              type: "error",
              content: error.message,
            })}\n\n`
          );
          res.end();
        }
      }
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
              profession: req.body.personal_info.profession,
            },
            financial_profile: {
              monthlyIncome: parseInt(req.body.financial_profile.monthlyIncome),
              totalInvestableAmount: parseInt(
                req.body.financial_profile.totalInvestableAmount
              ),
              monthlyInvestment: parseInt(
                req.body.financial_profile.monthlyInvestment
              ),
              emergencyFunds: parseInt(
                req.body.financial_profile.emergencyFunds
              ),
              existingInvestments:
                req.body.financial_profile.existingInvestments,
            },
            risk_strategy: {
              riskTolerance: req.body.risk_strategy.riskTolerance,
              maxPortfolioLoss: req.body.risk_strategy.maxPortfolioLoss,
              investmentTimeframe: req.body.risk_strategy.investmentTimeframe,
              withdrawalNeeds: req.body.risk_strategy.withdrawalNeeds,
            },
          },
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
    
        const data = [
          {
            _id: uuidv4(),
            portfolio_id: uuidv4(),
            wallet_address: req.body.wallet_address,
            timestamp: req.body.timestamp,
            total_value_usd: req.body.total_value_usd,
            assets: req.body.assets.map((asset) => ({
              symbol: asset.symbol,
              name: asset.name,
              quantity: asset.quantity,
              current_price_usd: asset.current_price_usd,
              value_usd: asset.value_usd,
              allocation_percentage: asset.allocation_percentage,
            })),
            risk_metrics: req.body.risk_metrics || null,
          },
        ];
    
        const dataWritten = await collection.writeToNodes(data);
    
        res.status(200).json({
          message: "Portfolio data written successfully",
          data: dataWritten,
        });

        console.log("Portfolio data written successfully");
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
            transactionDone,
          },
        ];

        const dataWritten = await collection.writeToNodes(data);

        res.status(200).json({
          message: "Subscription data written successfully",
          data: dataWritten,
        });
      } catch (error) {
        console.error(
          "❌ Error while writing subscription data:",
          error.message
        );
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
        console.log("Subscription data retrieved successfully");
      } catch (error) {
        console.error(
          "❌ Error while reading subscription data:",
          error.message
        );
        res.status(500).json({
          message: "Error reading subscription data",
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
            transactionDone,
          },
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

    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Error starting server:", error);
  }
}

startServer();
