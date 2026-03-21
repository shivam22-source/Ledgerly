import React, { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import BalanceCard from "../components/BalanceCard";
import TransactionTable from "../components/TransactionTable";
import { balanceApi } from "../../services/balanceApi";
import { transactionApi } from "../../services/transactionApi";
 import AIFinanceAssistant from '../components/AIFinanceAssistant'

const DashboardPage = () => {
  
  const [balance, setBalance] = useState(0);
  const [summary, setSummary] = useState({ debit: 0, credit: 0 });
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  

  
  // eslint-disable-next-line no-unused-vars
  const [selectedMonth, setSelectedMonth] = useState(
    new Date().toISOString().slice(0, 7) // YYYY-MM
  );

  // ✅ SINGLE SOURCE OF TRUTH
 const fetchData = async (monthStr = selectedMonth) => {
  try {
    setLoading(true);

    const date = new Date(monthStr); // "2026-01"
    const year = date.getFullYear();
    const month = date.getMonth() + 1;

    const [balRes, summRes, transRes] = await Promise.all([
      balanceApi.getCurrentBalance(),
      balanceApi.getMonthlySummary({ year, month }),
      transactionApi.getTransactions()
    ]);

    setBalance(balRes?.balance ?? 0);
    setSummary(summRes ?? { debit: 0, credit: 0 });
    setTasks(transRes ?? []);
  } catch (err) {
    console.error("Dashboard load failed", err);
  } finally {
    setLoading(false);
  }
};

  // ✅ RUN ON MONTH CHANGE
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    fetchData(selectedMonth);
  }, [selectedMonth]);

  if (loading) {
    return <div style={{ padding: "40px" }}>Loading Dashboard Data...</div>;
  }

  return (
    <div>
      <Navbar />

      <main className="dashboard-container">
        <h3>Overview</h3>

        {/* BALANCE CARDS */}
        <div className="flex-row">
          <BalanceCard title="Current Balance" value={balance} />
          <BalanceCard
            title="Current Month Debit"
            value={summary.debit || 0}
            type="debit"
          />
          <BalanceCard
            title="Current Month Credit"
            value={summary.credit || 0}
            type="credit"
          />
        </div>

       

        {/* TRANSACTION TABLE */}
        <TransactionTable
          transactions={tasks}
          setTransactions={setTasks}
          refreshDashboard={fetchData}
        />
           {/* ATF-AI */}
        <AIFinanceAssistant
          balance={balance}
          summary={summary}
          transactions={tasks} />
      </main>
    </div>
  );
};

export default DashboardPage;
