import React from 'react';

const TransactionRow = ({ transaction, onDelete }) => {
  const { partyName, type, amount, category, paymentMode, date, description } = transaction;

  const isDebit = type === 'DEBIT' || type === 'debit';

  return (
    <tr>
      <td style={{ color: '#f0f4ff', fontWeight: 500 }}>{partyName}</td>
      <td>
        <span className={isDebit ? 'status-debit' : 'status-credit'}>
          {type.toUpperCase()}
        </span>
      </td>
      <td>
        <span className="amount" style={{ color: isDebit ? '#ff5c5c' : '#63d39f', fontFamily: "'JetBrains Mono', monospace", fontSize: '13px', fontWeight: 500 }}>
          {isDebit ? '-' : '+'}
          {amount.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}
        </span>
      </td>
      <td>
        <span style={{
          background: 'rgba(255,255,255,0.05)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: '6px',
          padding: '3px 10px',
          fontSize: '12px',
          color: '#8892a4',
          textTransform: 'capitalize'
        }}>
          {category || '—'}
        </span>
      </td>
      <td style={{ color: '#8892a4' }}>{paymentMode}</td>
      <td style={{ color: '#8892a4', fontFamily: "'JetBrains Mono', monospace", fontSize: '12px' }}>
        {new Date(date).toLocaleDateString('en-IN')}
      </td>
      <td style={{ fontSize: '13px', color: '#4a5568' }}>{description || '—'}</td>
      <td>
        <button className="delete-btn" onClick={() => onDelete(transaction._id)}>
          Delete
        </button>
      </td>
    </tr>
  );
};

export default TransactionRow;