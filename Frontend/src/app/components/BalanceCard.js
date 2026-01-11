import React from 'react';

const BalanceCard = ({ title, value, type }) => {
  const isCurrency = typeof value === 'number';
  const displayValue = isCurrency ? `₹${value.toLocaleString("en-IN")}` : value;

  let valueClass = '';
  if (type === 'debit') valueClass = 'status-debit';
  if (type === 'credit') valueClass = 'status-credit';

  return (
    <div className="card flex-1">
      <h4 style={{ margin: '0 0 10px 0', color: '#666', fontSize: '14px', textTransform: 'uppercase' }}>
        {title}
      </h4>
      <h2 style={{ margin: 0 }} className={valueClass}>
        {displayValue}
      </h2>
    </div>
  );
};

export default BalanceCard;
