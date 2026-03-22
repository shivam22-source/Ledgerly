import React, { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import BalanceCard from "../components/BalanceCard";
import TransactionTable from "../components/TransactionTable";
import { balanceApi } from "../../services/balanceApi";
import { transactionApi } from "../../services/transactionApi";
import AIFinanceAssistant from '../components/AIFinanceAssistant';

const DashboardPage = () => {
  const [balance, setBalance] = useState(0);
  const [summary, setSummary] = useState({ debit: 0, credit: 0 });
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  // eslint-disable-next-line no-unused-vars
  const [selectedMonth, setSelectedMonth] = useState(
    new Date().toISOString().slice(0, 7)
  );

  const fetchData = async (monthStr = selectedMonth) => {
    try {
      setLoading(true);
      const date = new Date(monthStr);
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

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    fetchData(selectedMonth);
  }, [selectedMonth]);

  if (loading) {
    return (
      <div>
        <Navbar />
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          height: 'calc(100vh - 64px)', flexDirection: 'column', gap: 16
        }}>
          <div style={{
            width: 40, height: 40, borderRadius: '50%',
            border: '3px solid rgba(99,211,159,0.2)',
            borderTopColor: '#63d39f',
            animation: 'spin 0.8s linear infinite'
          }} />
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          <span style={{ color: '#4a5568', fontSize: 14 }}>Loading your ledger...</span>
        </div>
      </div>
    );
  }

  const now = new Date();
  const monthName = now.toLocaleString('default', { month: 'long', year: 'numeric' });

  return (
    <div>
      <Navbar />
      <main className="dashboard-container">

        {/* Header */}
        <div style={{ marginBottom: 28, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <div style={{ fontSize: 12, color: '#4a5568', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 4 }}>
              {monthName}
            </div>
            <h1 style={{ fontSize: 26, fontWeight: 800, color: '#f0f4ff', letterSpacing: '-0.5px', margin: 0 }}>
              Overview
            </h1>
          </div>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8,
            background: balance >= 0 ? 'rgba(99,211,159,0.08)' : 'rgba(255,92,92,0.08)',
            border: `1px solid ${balance >= 0 ? 'rgba(99,211,159,0.2)' : 'rgba(255,92,92,0.2)'}`,
            borderRadius: 30, padding: '6px 16px'
          }}>
            <span style={{ fontSize: 12, color: '#8892a4' }}>Net</span>
            <span style={{
              fontFamily: "'JetBrains Mono', monospace", fontSize: 14, fontWeight: 600,
              color: balance >= 0 ? '#63d39f' : '#ff5c5c'
            }}>
              {balance >= 0 ? '+' : ''}₹{Math.abs(balance).toLocaleString('en-IN')}
            </span>
          </div>
        </div>

        {/* Balance Cards */}
        <div className="flex-row">
          <BalanceCard title="Current Balance" value={balance} />
          <BalanceCard title="Month Debit" value={summary.debit || 0} type="debit" />
          <BalanceCard title="Month Credit" value={summary.credit || 0} type="credit" />
        </div>

        {/* Transactions header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <div style={{ fontSize: 13, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#4a5568' }}>
            Recent Transactions
          </div>
          <div style={{
            background: 'rgba(99,211,159,0.1)', border: '1px solid rgba(99,211,159,0.2)',
            borderRadius: 20, padding: '3px 12px', fontSize: 12, color: '#63d39f', fontWeight: 600
          }}>
            {tasks.length} total
          </div>
        </div>

        {/* Transaction Table */}
        <TransactionTable
          transactions={tasks}
          setTransactions={setTasks}
          refreshDashboard={fetchData}
        />

        {/* AI Assistant */}
        <AIFinanceAssistant
          balance={balance}
          summary={summary}
          transactions={tasks}
        />
      </main>
    </div>
  );
};

export default DashboardPage;