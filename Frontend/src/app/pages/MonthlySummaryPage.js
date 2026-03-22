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
      const date = new Date(selectedMonth);
      const year = date.getFullYear();
      const month = date.getMonth() + 1;
      const data = await balanceApi.getMonthlySummary({ year, month });
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

  const net = (summary.credit || 0) - (summary.debit || 0);
  const isPositive = net >= 0;
  const monthLabel = new Date(selectedMonth).toLocaleString('default', { month: 'long', year: 'numeric' });

  return (
    <div>
      <Navbar />
      <main className="dashboard-container">

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 16, marginBottom: 28 }}>
          <div>
            <div style={{ fontSize: 12, color: '#4a5568', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 4 }}>
              Monthly Report
            </div>
            <h1 style={{ fontSize: 26, fontWeight: 800, color: '#f0f4ff', letterSpacing: '-0.5px', margin: 0 }}>
              {monthLabel}
            </h1>
          </div>
          <MonthFilter value={selectedMonth} onChange={setSelectedMonth} />
        </div>

        {loading ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '40px 0', color: '#4a5568' }}>
            <div style={{
              width: 20, height: 20, borderRadius: '50%',
              border: '2px solid rgba(99,211,159,0.2)', borderTopColor: '#63d39f',
              animation: 'spin 0.8s linear infinite'
            }} />
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            Fetching {monthLabel} data...
          </div>
        ) : (
          <>
            <div className="flex-row">
              <BalanceCard title="Total Debit" value={summary.debit || 0} type="debit" />
              <BalanceCard title="Total Credit" value={summary.credit || 0} type="credit" />
              <BalanceCard title="Net Movement" value={net} type={isPositive ? 'credit' : 'debit'} />
            </div>

            {/* Net summary card */}
            <div className="card" style={{ marginTop: 8 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#f0f4ff', marginBottom: 6 }}>
                    {isPositive ? '📈 You saved money this month!' : '📉 You spent more than you earned'}
                  </div>
                  <div style={{ fontSize: 13, color: '#4a5568' }}>
                    {isPositive
                      ? `Great job! You saved ₹${Math.abs(net).toLocaleString('en-IN')} this month.`
                      : `You overspent by ₹${Math.abs(net).toLocaleString('en-IN')}. Try to reduce expenses next month.`
                    }
                  </div>
                </div>
                <div style={{
                  background: isPositive ? 'rgba(99,211,159,0.1)' : 'rgba(255,92,92,0.1)',
                  border: `1px solid ${isPositive ? 'rgba(99,211,159,0.2)' : 'rgba(255,92,92,0.2)'}`,
                  borderRadius: 30, padding: '8px 20px',
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: 16, fontWeight: 700,
                  color: isPositive ? '#63d39f' : '#ff5c5c'
                }}>
                  {isPositive ? '+' : '-'}₹{Math.abs(net).toLocaleString('en-IN')}
                </div>
              </div>
            </div>

            {/* Savings rate */}
            {summary.credit > 0 && (
              <div className="card" style={{ marginTop: 16 }}>
                <div style={{ fontSize: 13, color: '#4a5568', marginBottom: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', fontSize: 11 }}>
                  Savings Rate
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                  <div style={{ flex: 1, background: 'rgba(255,255,255,0.05)', borderRadius: 6, height: 8, overflow: 'hidden' }}>
                    <div style={{
                      width: `${Math.max(0, Math.min(100, (net / summary.credit) * 100))}%`,
                      height: '100%',
                      background: isPositive ? 'linear-gradient(90deg, #059669, #63d39f)' : '#ff5c5c',
                      borderRadius: 6, transition: 'width 1s ease'
                    }} />
                  </div>
                  <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 14, fontWeight: 700, color: isPositive ? '#63d39f' : '#ff5c5c', minWidth: 48 }}>
                    {Math.round((net / summary.credit) * 100)}%
                  </span>
                </div>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
};

export default MonthlySummaryPage;