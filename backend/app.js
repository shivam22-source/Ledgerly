require("dotenv").config();

const axios = require("axios");
const bcrypt = require("bcrypt");
const cors = require("cors");
const express = require("express");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");

const auth = require("./middleware/auth");
const authorize = require("./middleware/authorization");
const connectDB = require("./config/mongoose");
const validate = require("./middleware/validate");
const { Loginlimiter } = require("./middleware/rate-limit");
const Task = require("./models/task.model");
const User = require("./models/user.model");
const { generateAccessToken, generateRefreshToken } = require("./utils/token");
const { loginSchema, registerSchema } = require("./validators/user.validator");

const app = express();
const PORT = process.env.PORT || 3000;

const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:3001",
  "http://localhost:5173",
  "https://ledgerly-navy.vercel.app",
];

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error("Not allowed by CORS"));
    },
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json());

app.get("/", (req, res) => {
  res.send("Ledgerly API is live");
});

app.post("/api/auth/register", validate(registerSchema), async (req, res) => {
  const { email, password } = req.body;
  const existingUser = await User.findOne({ email });

  if (existingUser) {
    return res.status(409).json({ message: "User already registered" });
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  await User.create({ email, password: hashedPassword, role: "user" });

  return res.status(201).json({ message: "User registered" });
});

app.post("/api/auth/login", Loginlimiter, validate(loginSchema), async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  const passwordMatches = await bcrypt.compare(password, user.password);
  if (!passwordMatches) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  const tokenPayload = { userId: user._id, role: user.role };
  const accessToken = generateAccessToken(tokenPayload);
  const refreshToken = generateRefreshToken(tokenPayload);

  user.refreshToken = refreshToken;
  await user.save();

  return res.json({ accessToken, refreshToken });
});

app.post("/api/auth/refresh", async (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(401).json({ message: "Refresh token required" });
  }

  const user = await User.findOne({ refreshToken });
  if (!user) {
    return res.status(403).json({ message: "Invalid refresh token" });
  }

  try {
    jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);

    return res.json({
      accessToken: generateAccessToken({ userId: user._id, role: user.role }),
    });
  } catch {
    return res.status(403).json({ message: "Refresh token expired" });
  }
});

app.post("/api/transaction", auth, authorize("user", "admin", "analyst"), async (req, res) => {
  const { partyName, type, amount, date, description, category, paymentMode } = req.body;

  if (!partyName || !type || !amount || !date) {
    return res.status(400).json({ message: "Missing fields" });
  }

  if (Number(amount) <= 0) {
    return res.status(400).json({ message: "Invalid amount" });
  }

  const transaction = await Task.create({
    user: req.user.userId,
    partyName,
    type,
    amount,
    date,
    description,
    category,
    paymentMode,
  });

  return res.status(201).json({ transaction, message: "Transaction saved" });
});

app.get("/api/transaction-view", auth, async (req, res) => {
  const transactions = await Task.find({
    user: req.user.userId,
    isDeleted: false,
  }).sort({ _id: -1 });

  return res.json(transactions);
});

app.get("/api/balance", auth, async (req, res) => {
  const totals = await getTransactionTotals(req.user.userId);
  const credit = totals.CREDIT || 0;
  const debit = totals.DEBIT || 0;

  return res.json({ credit, debit, balance: credit - debit });
});

app.get("/api/balance-month", auth, async (req, res) => {
  const { year, month } = req.query;
  const start = new Date(Number(year), Number(month) - 1, 1);
  const end = new Date(Number(year), Number(month), 1);

  const totals = await getTransactionTotals(req.user.userId, {
    date: { $gte: start, $lt: end },
  });

  return res.json({
    debit: totals.DEBIT || 0,
    credit: totals.CREDIT || 0,
  });
});

app.post("/api/transaction-del/:id", auth, authorize("user", "admin"), async (req, res) => {
  const transaction = await Task.findOneAndUpdate(
    { _id: req.params.id, user: req.user.userId },
    { isDeleted: true },
    { new: true }
  );

  if (!transaction) {
    return res.status(404).json({ message: "Transaction not found" });
  }

  return res.json({ message: "Transaction deleted successfully" });
});

app.post("/api/ai-chat", auth, async (req, res) => {
  const { messages, systemPrompt } = req.body;

  if (!Array.isArray(messages)) {
    return res.status(400).json({ message: "Invalid messages format" });
  }

  try {
    const contents = messages.map((message) => ({
      role: message.role === "assistant" ? "model" : "user",
      parts: [{ text: message.content }],
    }));

    const geminiResponse = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        system_instruction: {
          parts: [{ text: systemPrompt }],
        },
        contents,
        generationConfig: {
          maxOutputTokens: 1000,
          temperature: 0.7,
        },
      },
      {
        headers: { "Content-Type": "application/json" },
      }
    );

    const reply =
      geminiResponse.data?.candidates?.[0]?.content?.parts?.[0]?.text ||
      "Sorry, I couldn't process that.";

    return res.json({ reply });
  } catch (err) {
    console.error("Gemini API error:", err.response?.data || err.message);
    return res.status(500).json({ message: "AI service error" });
  }
});

async function getTransactionTotals(userId, extraMatch = {}) {
  const result = await Task.aggregate([
    {
      $match: {
        user: new mongoose.Types.ObjectId(userId),
        isDeleted: false,
        ...extraMatch,
      },
    },
    {
      $group: {
        _id: "$type",
        total: { $sum: "$amount" },
      },
    },
  ]);

  return result.reduce((totals, row) => {
    totals[row._id] = row.total;
    return totals;
  }, {});
}

app.use((err, req, res, next) => {
  console.error(err);
  return res.status(500).json({ message: err.message || "Internal Server Error" });
});

const startServer = async () => {
  try {
    await connectDB();
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  } catch (err) {
    console.error("Database connection failed:", err.message);
  }
};

startServer();
