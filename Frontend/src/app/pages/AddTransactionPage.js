import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { transactionApi } from '../../services/transactionApi';

const AddTransactionPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    partyName: '',
    type: 'DEBIT',
    amount: '',
    category: '',
    paymentMode: 'UPI',
    date: new Date().toISOString().split('T')[0],
    description: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await transactionApi.createTransaction({
        ...formData,
        amount: parseFloat(formData.amount)
      });
      navigate('/');
    } catch (err) {
      alert("Error adding transaction. See console.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Navbar />
      <main className="dashboard-container">
        <div className="card" style={{ maxWidth: '600px', margin: '0 auto' }}>
          <h3>Add New Task (Transaction)</h3>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Party Name</label>
              <input type="text" name="partyName" value={formData.partyName} onChange={handleChange} required />
            </div>

            <div className="flex-row">
              <div className="form-group flex-1">
                <label>Type</label>
                <select name="type" value={formData.type} onChange={handleChange}>
                  <option value="DEBIT">DEBIT (+)</option>
                  <option value="CREDIT">CREDIT (-)</option>
                </select>
              </div>
              <div className="form-group flex-1">
                <label>Amount</label>
                <input type="number" name="amount" value={formData.amount} onChange={handleChange} required />
              </div>
            </div>

            <div className="flex-row">
              <div className="form-group flex-1">
                <label>Category</label>
                <input type="text" name="category" placeholder="e.g. Food, Rent" value={formData.category} onChange={handleChange} required />
              </div>
              <div className="form-group flex-1">
                <label>Payment Mode</label>
                <select name="paymentMode" value={formData.paymentMode} onChange={handleChange}>
                  <option value="CASH">Cash</option>
                  <option value="ONLINE">Online</option>
                  <option value="UPI">UPI</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label>Date</label>
              <input type="date" name="date" value={formData.date} onChange={handleChange} required />
            </div>

            <div className="form-group">
              <label>Description</label>
              <textarea name="description" rows="3" value={formData.description} onChange={handleChange}></textarea>
            </div>

            <button type="submit" disabled={loading}>
              {loading ? 'Saving...' : 'Submit Transaction'}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
};

export default AddTransactionPage;
