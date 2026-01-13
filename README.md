📒 Ledgerly – Personal Finance & Ledger Dashboard

Ledgerly is a full-stack financial ledger application that helps users track transactions, view balances, and analyze monthly debit/credit summaries through a clean dashboard interface.

🚀 Live Deployment
Demo: https://ledgerly-navy.vercel.app/

Frontend: Deployed on Vercel

Backend: Deployed on Render

Database: MongoDB Atlas

🧠 Features
🔐 Authentication

User registration & login using JWT (Access + Refresh Tokens)

Secure password hashing with bcrypt

Protected routes using authentication middleware

💰 Financial Tracking

Add debit & credit transactions (treated as tasks)

Soft delete transactions using isDeleted flag

View current lifetime balance

View monthly debit & credit summary

Month selector to switch summary dynamically

📊 Dashboard

Overview cards:

Current Balance

Current Month Debit

Current Month Credit

Recent transactions table

Real-time UI updates after transaction deletion

Safe rendering to handle empty or loading states

🏗️ Backend Architecture
Backend server->https://github.com/shivam22-source/Backend-Ledgerly

Built with Node.js & Express

MongoDB + Mongoose for data modeling

Used MongoDB Aggregation Pipeline for:

Lifetime balance calculation

Month-wise debit & credit summaries

Clean separation between:

Transaction data

Aggregated financial insights

Core APIs
POST   /api/auth/register

POST   /api/auth/login

GET    /api/auth/refresh

POST   /api/transaction

GET    /api/transaction-view

POST   /api/transaction-del/:id

GET    /api/balance

GET    /api/balance-month?year=YYYY&month=MM

🎨 Frontend Architecture

Built with React

State management using useState & useEffect

Centralized API calls using Axios

Modular component structure:

Navbar

Balance Cards

Transaction Table

Dynamic dashboard updates synced with backend

🛠️ Tech Stack
Frontend

React

Axios

CSS

Backend

Node.js

Express.js

MongoDB

Mongoose

JWT (Access & Refresh Tokens)

bcrypt

Deployment

Frontend: Vercel

Backend: Render

Database: MongoDB Atlas

🧩 Design Decisions

Soft delete instead of hard delete for data safety

Monthly summary implemented using aggregation, not manual calculation

Summary data and transaction list handled separately for clarity

Single source of truth for dashboard data fetching

Built with extensibility in mind (charts, filters, exports can be added)
