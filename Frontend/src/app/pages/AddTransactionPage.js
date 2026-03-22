import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { transactionApi } from '../../services/transactionApi';

const CATEGORIES = {
  Food: ['Zomato', 'Swiggy', 'Restaurant', 'Cafe', 'Grocery'],
  Transport: ['Uber', 'Ola', 'Metro', 'Bus', 'Petrol', 'Train'],
  Bills: ['Electricity', 'Internet', 'Phone Recharge', 'Rent', 'Water'],
  Shopping: ['Amazon', 'Flipkart', 'Mall', 'Meesho', 'Myntra'],
  Entertainment: ['Netflix', 'Spotify', 'Amazon Prime', 'Cinema', 'Games'],
  Health: ['Pharmacy', 'Doctor', 'Gym', 'Hospital'],
  Salary: ['Monthly Salary', 'Stipend', 'Bonus'],
  Freelance: ['Client Payment', 'Project', 'Invoice'],
  Other: [],
};

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
  const [mainCategory, setMainCategory] = useState('');
  const [subCategory, setSubCategory] = useState('');
  const [customSub, setCustomSub] = useState('');
  const [isOtherSub, setIsOtherSub] = useState(false);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleMainCategory = (e) => {
    const val = e.target.value;
    setMainCategory(val); setSubCategory(''); setCustomSub(''); setIsOtherSub(false);
    setFormData({ ...formData, category: val === 'Other' ? 'Other' : val });
  };

  const handleSubCategory = (e) => {
    const val = e.target.value;
    if (val === '__other__') { setIsOtherSub(true); setSubCategory(''); setFormData({ ...formData, category: mainCategory }); }
    else { setIsOtherSub(false); setSubCategory(val); setFormData({ ...formData, category: val }); }
  };

  const handleCustomSub = (e) => { setCustomSub(e.target.value); setFormData({ ...formData, category: e.target.value || mainCategory }); };

  const handleSubmit = async (e) => {
    e.preventDefault(); setLoading(true);
    try {
      await transactionApi.createTransaction({ ...formData, amount: parseFloat(formData.amount) });
      navigate('/');
    } catch (err) { alert("Error adding transaction."); console.error(err); }
    finally { setLoading(false); }
  };

  const subOptions = mainCategory ? CATEGORIES[mainCategory] || [] : [];

  return (
    <div>
      <Navbar />
      <main className="dashboard-container">
        <div className="card" style={{ maxWidth: '600px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#f0f4ff', marginBottom: '24px', letterSpacing: '-0.3px' }}>
            Add Transaction
          </h2>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Party Name</label>
              <input type="text" name="partyName" value={formData.partyName} onChange={handleChange} placeholder="e.g. Zomato, Amazon, Shivam" required />
            </div>
            <div className="flex-row">
              <div className="form-group flex-1">
                <label>Type</label>
                <select name="type" value={formData.type} onChange={handleChange}>
                  <option value="DEBIT">DEBIT (Money Out)</option>
                  <option value="CREDIT">CREDIT (Money In)</option>
                </select>
              </div>
              <div className="form-group flex-1">
                <label>Amount (₹)</label>
                <input type="number" name="amount" value={formData.amount} onChange={handleChange} placeholder="0" required />
              </div>
            </div>
            <div className="flex-row">
              <div className="form-group flex-1">
                <label>Category</label>
                <select value={mainCategory} onChange={handleMainCategory} required>
                  <option value="">Select category</option>
                  {Object.keys(CATEGORIES).map(cat => <option key={cat} value={cat}>{cat}</option>)}
                </select>
              </div>
              {mainCategory && mainCategory !== 'Other' && (
                <div className="form-group flex-1">
                  <label>Sub-category</label>
                  <select value={isOtherSub ? '__other__' : subCategory} onChange={handleSubCategory}>
                    <option value="">Select or skip</option>
                    {subOptions.map(sub => <option key={sub} value={sub}>{sub}</option>)}
                    <option value="__other__">✏️ Other (custom)</option>
                  </select>
                </div>
              )}
            </div>
            {isOtherSub && (
              <div className="form-group">
                <label>Custom Sub-category</label>
                <input type="text" placeholder={`e.g. My favourite ${mainCategory} place`} value={customSub} onChange={handleCustomSub} />
              </div>
            )}
            {formData.category && (
              <div style={{ marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 12, color: '#4a5568' }}>Saving as:</span>
                <span style={{ background: 'rgba(99,211,159,0.12)', color: '#63d39f', border: '1px solid rgba(99,211,159,0.25)', borderRadius: '20px', padding: '2px 12px', fontSize: 12, fontWeight: 600 }}>
                  {formData.category}
                </span>
              </div>
            )}
            <div className="flex-row">
              <div className="form-group flex-1">
                <label>Payment Mode</label>
                <select name="paymentMode" value={formData.paymentMode} onChange={handleChange}>
                  <option value="CASH">Cash</option>
                  <option value="UPI">UPI</option>
                  <option value="BANK">Bank Transfer</option>
                </select>
              </div>
              <div className="form-group flex-1">
                <label>Date</label>
                <input type="date" name="date" value={formData.date} onChange={handleChange} required />
              </div>
            </div>
            <div className="form-group">
              <label>Description <span style={{ color: '#4a5568', fontWeight: 400 }}>(optional)</span></label>
              <textarea name="description" rows="3" value={formData.description} onChange={handleChange} placeholder="Any notes about this transaction..."></textarea>
            </div>
            <button type="submit" disabled={loading}>
              {loading ? 'Saving...' : '+ Submit Transaction'}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
};

export default AddTransactionPage;