import React from 'react';
import TransactionRow from './TransactionRow';

const TransactionTable = ({ transactions }) => {
  if (!transactions || transactions.length === 0) {
    return (
      <div className="card" style={{ textAlign: 'center', marginTop: '20px' }}>
        No tasks/transactions found.
      </div>
    );
  }

  return (
    <div style={{ overflowX: 'auto' }}>
      <table>
        <thead>
          <tr>
            <th>Party Name</th>
            <th>Type</th>
            <th>Amount</th>
            <th>Category</th>
            <th>Payment Mode</th>
            <th>Date</th>
            <th>Description</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((t, index) => (
            <TransactionRow key={t.id || index} transaction={t} />
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TransactionTable;
