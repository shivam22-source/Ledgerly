import React, { useState, useEffect, useCallback } from 'react';
import Navbar from '../components/Navbar';
import MonthFilter from '../components/MonthFilter';
import BalanceCard from '../components/BalanceCard';
import { balanceApi } from '../../services/balanceApi';

const MonthlySummaryPage = () => {
  const currentMonthStr = new Date().toISOString().slice(0, 7);
  const [selectedMonth, setSelectedMonth] = useState(currentMonthStr);
  const [summary, setSummary] = useState({ debit: 0, credit: 0 });
  const [loading, setLoading] = useState(false);

  const fetchSummary = useCallback(async () => {
    setLoading(true);
    try {
      const data = await balanceApi.getMonthlySummary(selectedMonth);
      setSummary(data);
    } catch (err) {
      console.error("Failed to fetch summary", err);
    } finally {
      setLoading(false);
    }
  }, [selectedMonth]);

  useEffect(() => {
    fetchSummary();
  }, [fetchSummary]);

  return (
    <div>
      <Navbar />
      <main className="dashboard-container">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3>Aggregated Monthly Summary</h3>
          <MonthFilter value={selectedMonth} onChange={setSelectedMonth} />
        </div>

        {loading ? (
          <div>Fetching data for {selectedMonth}...</div>
        ) : (
          <div className="flex-row" style={{ marginTop: '20px' }}>
            <BalanceCard title="Total Debit" value={summary.debit || 0} type="debit" />
            <BalanceCard title="Total Credit" value={summary.credit || 0} type="credit" />
            <BalanceCard 
              title="Net Movement" 
              value={(summary.debit || 0) - (summary.credit || 0)} 
            />
          </div>
        )}

        <div className="card" style={{ marginTop: '20px' }}>
          <h4>Early-Stage Empire</h4>
          <code style={{ fontSize: '12px' }}>
          Not a millionaire yet — but the dashboard is ready.
          </code>
        </div>
      </main>
    </div>
  );
};

export default MonthlySummaryPage;
