# 📒 Ledgerly – Personal Finance & Ledger Dashboard

Ledgerly is a full-stack AI-powered financial ledger application that helps users track transactions, view balances, analyze monthly spending, and get smart AI-driven insights through a premium dark dashboard.

## 🚀 Live Deployment

- **Demo:** https://ledgerly-navy.vercel.app/
- **Frontend:** Deployed on Vercel
- **Backend:** Deployed on Render
- **Database:** MongoDB Atlas

---

## ✨ What's New in v2.0

- 🤖 **AI Finance Assistant** — Gemini-powered chatbot with Chat, Categorize & Insights tabs
- 🏷️ **2-Level Smart Categories** — Pick Food → Zomato, Bills → Electricity, etc.
- 📊 **Spending Analytics** — Savings rate bar, net movement badge, spending breakdown
- 🎨 **Premium Dark UI** — Glassmorphism navbar, animated cards, JetBrains Mono for numbers

---

## 🧠 Features

### 🔐 Authentication
- User registration & login using JWT (Access + Refresh Tokens)
- Secure password hashing with bcrypt
- Auto token refresh via Axios response interceptor
- Protected routes — redirects to login if unauthenticated

### 💰 Financial Tracking
- Add debit & credit transactions with party name, amount, category, payment mode
- 2-level category picker (e.g. Food → Zomato / Swiggy, Bills → Electricity / Rent)
- Soft delete transactions using `isDeleted` flag
- View current lifetime balance
- View monthly debit & credit summary with dynamic month selector

### 🤖 AI Finance Assistant (Gemini Powered)
- Floating popup chatbot — 🤖 button fixed bottom-right
- **Chat tab** — Ask anything about your finances in natural language
- **Categorize tab** — AI auto-categorizes transactions with visual spending breakdown bar
- **Insights tab** — 3 AI-generated data-backed spending insights + savings rate visualization
- Backend proxy pattern — Gemini API key secured on server, never exposed to browser

### 📊 Dashboard
- Overview cards: Current Balance, Month Debit, Month Credit
- Net balance badge (green/red based on balance)
- Recent transactions table with category pills, colored amounts, formatted dates
- Real-time UI updates after adding or deleting transactions
- Aggregated Monthly Summary page with savings rate progress bar and smart insight card

### 🎨 Premium Dark UI
- Dark theme with green accent (`#63d39f`) — fintech aesthetic
- Glassmorphism sticky navbar with backdrop-filter blur
- Outfit (UI) + JetBrains Mono (numbers) — professional typography pairing
- Staggered fadeUp card animations on dashboard load
- Smooth hover transitions, custom scrollbar, loading spinner

---

## 🏗️ Architecture

### Frontend Structure
```
src/
├── app/
│   ├── components/
│   │   ├── AIFinanceAssistant.jsx   ← AI chatbot (Gemini powered)
│   │   ├── BalanceCard.js           ← Balance display cards
│   │   ├── Navbar.js                ← Sticky glassmorphism navbar
│   │   ├── TransactionTable.js      ← Transactions list
│   │   ├── TransactionRow.js        ← Individual transaction row
│   │   └── MonthFilter.js           ← Month/year selector
│   └── pages/
│       ├── DashboardPage.js         ← Main dashboard (single source of truth)
│       ├── AddTransactionPage.js    ← Add transaction with 2-level category
│       ├── LoginPage.js             ← Auth
│       ├── RegisterPage.js          ← Auth
│       └── MonthlySummaryPage.js    ← Monthly analytics + savings rate
├── services/
│   ├── axiosInstance.js             ← Axios with JWT interceptors
│   ├── authApi.js                   ← Login, register
│   ├── balanceApi.js                ← Balance, monthly summary
│   └── transactionApi.js            ← CRUD transactions
├── App.js                           ← Routing + protected routes
└── index.css                        ← Design system + global styles
```

### Backend Architecture
**Backend repo →** https://github.com/shivam22-source/Backend-Ledgerly

- Built with Node.js & Express
- MongoDB + Mongoose for data modeling
- MongoDB Aggregation Pipeline for lifetime balance & monthly summaries
- JWT middleware for route protection
- Gemini AI proxy route (`POST /api/ai-chat`) — keeps API key secure

### Core APIs
```
POST   /api/auth/register
POST   /api/auth/login
GET    /api/auth/refresh
POST   /api/transaction
GET    /api/transaction-view
POST   /api/transaction-del/:id
GET    /api/balance
GET    /api/balance-month?year=YYYY&month=MM
POST   /api/ai-chat                    ← NEW: Gemini AI proxy
```

---

## 🛠️ Tech Stack

### Frontend
| Tech | Purpose |
|------|---------|
| React 18 | UI framework |
| React Router v6 | Client-side routing + protected routes |
| Axios | HTTP client with JWT interceptors |
| CSS Custom Properties | Design system / theming |
| Outfit + JetBrains Mono | Typography (Google Fonts) |

### Backend
| Tech | Purpose |
|------|---------|
| Node.js + Express | Server + REST API |
| MongoDB + Mongoose | Database + ODM |
| JWT | Access + Refresh token auth |
| bcrypt | Password hashing |
| Axios | Gemini API calls (server-side proxy) |
| Google Gemini API | AI chat, categorization, insights |

### Deployment
| Layer | Platform |
|-------|---------|
| Frontend | Vercel |
| Backend | Render |
| Database | MongoDB Atlas |

---

## 🧩 Design Decisions

- **Soft delete** instead of hard delete — `isDeleted: true` flag preserves data for audit trail
- **MongoDB Aggregation Pipeline** for balance/summary — faster and more accurate than manual JS calculation
- **Single source of truth** — DashboardPage fetches all data, passes as props to children (avoids auth timing issues)
- **Backend proxy for AI** — Gemini API key stored in Render env variables, frontend never sees it
- **Promise.all** for parallel API calls — 3x faster than sequential awaits
- **2-level category system** — user picks main category + sub-category, stored as a single string
- **CSS Variables design system** — change one variable, entire UI updates consistently
- **Monospace font for numbers** — JetBrains Mono for amounts/dates, standard in fintech UIs

---

## 🔑 Environment Variables

### Frontend (.env)
```
REACT_APP_API_URL=https://your-backend.onrender.com
```

### Backend (.env)
```
MONGO_URI=mongodb+srv://...
JWT_SECRET=your_secret_key
GEMINI_API_KEY=your_gemini_key
PORT=5000
```
