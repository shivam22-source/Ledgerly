import React from 'react';

const MonthFilter = ({ value, onChange }) => {
  const months = [
    { label: 'January', value: '01' },
    { label: 'February', value: '02' },
    { label: 'March', value: '03' },
    { label: 'April', value: '04' },
    { label: 'May', value: '05' },
    { label: 'June', value: '06' },
    { label: 'July', value: '07' },
    { label: 'August', value: '08' },
    { label: 'September', value: '09' },
    { label: 'October', value: '10' },
    { label: 'November', value: '11' },
    { label: 'December', value: '12' },
  ];

  const currentYear = new Date().getFullYear();

  return (
    <div className="form-group" style={{ maxWidth: '300px' }}>
      <label>Select Month View</label>
      <select 
        value={value} 
        onChange={(e) => onChange(e.target.value)}
      >
        {months.map(m => (
          <option key={m.value} value={`${currentYear}-${m.value}`}>
            {m.label} {currentYear}
          </option>
        ))}
      </select>
    </div>
  );
};

export default MonthFilter;
