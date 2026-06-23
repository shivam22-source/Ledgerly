import React from "react";

const currencyFormatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

const BalanceCard = ({ title, value, type }) => {
  const displayValue = typeof value === "number" ? currencyFormatter.format(value) : value;

  let valueColor = "#f0f4ff";
  if (type === "debit") valueColor = "#ff5c5c";
  if (type === "credit") valueColor = "#63d39f";

  return (
    <div className="card flex-1">
      <div className="balance-label">{title}</div>
      <div className="balance-value" style={{ color: valueColor }}>
        {displayValue}
      </div>
    </div>
  );
};

export default BalanceCard;
