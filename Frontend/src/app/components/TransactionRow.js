import React from 'react';

const TransactionRow = ({ transaction }) => {
  const { partyName, type, amount, category, paymentMode, date, description } = transaction;

  return (
    <tr>
      <td>{partyName}</td>
      <td className={type === 'debit' ? 'status-debit' : 'status-credit'}>
        {type.toUpperCase()}
      </td>
      <td>${amount.toLocaleString()}</td>
      <td>{category}</td>
      <td>{paymentMode}</td>
      <td>{new Date(date).toLocaleDateString()}</td>
      <td style={{ fontSize: '13px', color: '#555' }}>{description}</td>
    </tr>
  );
};

export default TransactionRow;
