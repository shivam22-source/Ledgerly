import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import BalanceCard from '../components/BalanceCard';
import TransactionTable from '../components/TransactionTable';
import { balanceApi } from '../../services/balanceApi';
import { transactionApi } from '../../services/transactionApi';

const DashboardPage = () => {
  const [balance, setBalance] = useState(0);
  const [summary, setSummary] = useState({ debit: 0, credit: 0 });
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const currentMonth = new Date().toISOString().slice(0, 7);
        const [balRes, summRes, transRes] = await Promise.all([
          balanceApi.getCurrentBalance(),
          balanceApi.getMonthlySummary(currentMonth),
          transactionApi.getTransactions()
        ]);
        
        setBalance(balRes.balance || 0);
        setSummary(summRes);
        setTasks(transRes);
      } catch (err) {
        console.error("Dashboard load failed", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <div style={{ padding: '40px' }}>Loading Dashboard Data...</div>;

  return (
    <div>
      <Navbar />
      <main className="dashboard-container">
        <h3>Overview</h3>
        <div className="flex-row">
          <BalanceCard title="Current Balance" value={balance} />
          <BalanceCard title="Current Month Debit" value={summary.debit} type="debit" />
          <BalanceCard title="Current Month Credit" value={summary.credit} type="credit" />
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '40px' }}>
          <h3>Recent Tasks (Transactions)</h3>
        </div>
        <TransactionTable transactions={tasks} />
      </main>
    </div>
  );
};

export default DashboardPage;
