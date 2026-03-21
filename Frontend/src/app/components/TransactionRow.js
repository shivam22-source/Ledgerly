import React from 'react';

const TransactionRow = ({ transaction,onDelete }) => {
  const { partyName, type, amount, category, paymentMode, date, description } = transaction;

  return (
    <tr>
      <td>{partyName}</td>
      <td className={type === 'debit' ? 'status-debit' : 'status-credit'}>
        {type.toUpperCase()}
      </td>
     <td>
  {amount.toLocaleString('en-IN', {
    style: 'currency',
    currency: 'INR',
  })}
</td>

      <td>{category}</td>
      <td>{paymentMode}</td>
      <td>{new Date(date).toLocaleDateString()}</td>
      <td style={{ fontSize: '13px', color: '#555' }}>{description}</td>
        <td>
        <button
          onClick={() => onDelete(transaction._id)}
          style={{
            background: "none",
            border: "none",
            color: "#d00",
            cursor: "pointer"
          }}
        >
          Delete
        </button>
      </td>
    </tr>
  );
};

export default TransactionRow;
