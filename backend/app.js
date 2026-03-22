require("dotenv").config();

const cors=require("cors");

const express = require("express");

const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const ratelimit=require("express-rate-limit")
const mongoose=require("mongoose")
const app = express();

require("./config/mongoose")

const User = require("./models/user.model");
const Task = require("./models/task.model");

//AI Assitent
const axios = require('axios');


const auth = require("./middleware/auth");
const authorize=require("./middleware/authorization")
const validate = require("./middleware/validate");
const {Loginlimiter}=require("./middleware/rate-limit")

const { registerSchema, loginSchema } = require("./validators/user.validator");


const {
  generateAccessToken,
  generateRefreshToken,
} = require("./utils/token");
const { date } = require("joi");
const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:5173",
  "https://ledgerly-navy.vercel.app",
  "https://ledgerly-navy.vercel.app/",
  "http://localhost:3001",
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true); // Postman / server-to-server
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    callback(new Error("Not allowed by CORS"));
  },
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));


app.use((req, res, next) => {
  if (req.method === "OPTIONS") {
    res.header("Access-Control-Allow-Origin", req.headers.origin || "*");
    res.header(
      "Access-Control-Allow-Headers",
      "Content-Type, Authorization"
    );
    res.header(
      "Access-Control-Allow-Methods",
      "GET, POST, PUT, DELETE, OPTIONS"
    );
    return res.sendStatus(200);
  }
  next();
});
const asyncHandler = fn => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);


app.use(express.json());



app.use(express.json());

app.get('/', (req, res) => {
  res.send('Ledgerly API is live 🚀');
});

// ================= AUTH =================

app.post("/api/auth/register", validate(registerSchema), async (req, res) => {
  const exists = await User.findOne({ email: req.body.email });
  if (exists)
    return res.status(409).json({ message: "User already registered" });

  const hashed = await bcrypt.hash(req.body.password, 10);
  await User.create({ email: req.body.email, password: hashed, role:"user" });

  res.status(201).json({ message: "User registered" });
});

app.post("/api/auth/login",Loginlimiter,validate(loginSchema), async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });
  if (!user) return res.status(404).json({ message: "User not found" });

  const match = await bcrypt.compare(password, user.password);
  if (!match) return res.status(401).json({ message: "Invalid credentials" });

  const accessToken = generateAccessToken({ userId: user._id ,role:user.role});
  const refreshToken = generateRefreshToken({ userId: user._id , role:user.role});

  user.refreshToken = refreshToken;
  await user.save();

  res.json({ accessToken, refreshToken });
});

// ================= REFRESH =================

app.post("/api/auth/refresh", async (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken)
    return res.status(401).json({ message: "Refresh token required" });

  const user = await User.findOne({ refreshToken });
  if (!user)
    return res.status(403).json({ message: "Invalid refresh token" });

  try {
    jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);

    const newAccessToken = generateAccessToken({
      userId: user._id,
    });

    res.json({ accessToken: newAccessToken });
  } catch {
    res.status(403).json({ message: "Refresh token expired" });
  }
});

// ================= TASKS =================
app.post("/api/transaction", auth, async (req, res) => {
  const { partyName, type, amount, date, description, category, paymentMode } = req.body; // ← add these

  if (!partyName || !type || !amount || !date) {
    return res.status(400).json({ message: "Missing fields" });
  }

  if (amount <= 0) {
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
    paymentMode    
  });

  res.status(201).json({ transaction, message: "Ledge registered" });
});



app.get("/api/transaction-view",auth,async(req,res)=>{
  const{from,to,type,party}=req.query;
  
  
  
    const filter={user:req.user.userId,isDeleted:false}
    if(type){
      filter.type=type;
    }
    if(party){
      filter.partyName=new RegExp(party, "i"); ///regex->small and big alphabet
    }
    if(from&&to){
      $gte:new Date(from);
      $lte:new Date(to);
    }

  
    const tasks=await Task.find(filter).sort({createdAt:-1})
    res.json(tasks);
})

app.get("/api/balance",auth,async (req,res)=>{

  const result = await Task.aggregate([
    {$match:{
       user: new mongoose.Types.ObjectId(req.user.userId),isDeleted:false,
       
    }},
    {$group:{                                  ///Credit->All ek saath and Debit->All ek saath group 
_id:"$type",
total:{$sum:"$amount"}
    }}

  ])
  let credit=0;
  let debit=0;
result.forEach(r=>{
  if(r._id==="CREDIT"){credit=r.total}
    if(r._id==="DEBIT"){debit=r.total}

})
let balance=credit-debit;
res.json({
  credit,
  debit,
  balance
})

})

app.get("/api/balance-month",auth,async(req,res)=>{
  const {year,month}=req.query;
  const start = new Date(Number(year), Number(month) - 1, 1);
    const end = new Date(Number(year), Number(month), 1);
  const result = await Task.aggregate([
    {$match:{
       user: new mongoose.Types.ObjectId(req.user.userId),isDeleted:false,date:{ $gte: start, $lte: end }
       
    }},
    {$group:{                                  ///Credit->All ek saath and Debit->All ek saath group 
_id:"$type",
total:{$sum:"$amount"}
    }}

  ])
  let debit = 0;
let credit = 0;
    
   result.forEach(r => {
  if (r._id === "DEBIT") debit = r.total;
  if (r._id === "CREDIT") credit = r.total;
});

res.json({ debit, credit });
})

app.post("/api/transaction-del/:id",auth,async(req,res)=>{
  try{
    const{id}=req.params;
 const task=await Task.findOneAndDelete({_id:id,user:req.user.userId},{isDeleted:true},{new:true})
 if(!task){
  return  res.status(404).json({message:"Transction not found"})
 }
return res.status(201).json({message:"Transction delete sccesfully"})
  }catch(err){
 res.status(500).json({message:"Sever error"})
  }
  
})


// ================= AI_FINANCIAL_ASSISTENT =================
app.post('/api/ai-chat', auth, async (req, res) => {
  try {
    const { messages, systemPrompt } = req.body;
 
    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ message: "Invalid messages format" });
    }
 
    // Build Gemini conversation format
    // Gemini uses "contents" array with "role" and "parts"
    const contents = messages.map(m => ({
      role: m.role === 'assistant' ? 'model' : 'user', // Gemini uses 'model' not 'assistant'
      parts: [{ text: m.content }]
    }));
 
    // Call Gemini API
    const geminiRes = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        system_instruction: {
          parts: [{ text: systemPrompt }]
        },
        contents,
        generationConfig: {
          maxOutputTokens: 1000,
          temperature: 0.7,
        }
      },
      {
        headers: { 'Content-Type': 'application/json' }
      }
    );
 
    // Extract reply from Gemini response
    const reply = geminiRes.data?.candidates?.[0]?.content?.parts?.[0]?.text
      || "Sorry, I couldn't process that.";
 
    res.json({ reply });
 
  } catch (err) {
    console.error("Gemini API error:", err.response?.data || err.message);
    res.status(500).json({ message: "AI service error", error: err.message });
  }
});


// ================= GLOBAL ERROR =================
app.use((err, req, res, next) => {
  console.error(err);

  res.header(
    "Access-Control-Allow-Origin",
    req.headers.origin || "https://ledgerly-navy.vercel.app"
  );
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");

  res.status(500).json({
    message: err.message || "Internal Server Error",
  });
});


// ================= SERVER =================
app.listen(3000, () => console.log("Server running on port 3000"));


