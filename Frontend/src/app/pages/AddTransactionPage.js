import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { transactionApi } from "../../services/transactionApi";

const CATEGORIES = {
  Food: ["Zomato", "Swiggy", "Restaurant", "Cafe", "Grocery"],
  Transport: ["Uber", "Ola", "Metro", "Bus", "Petrol", "Train"],
  Bills: ["Electricity", "Internet", "Phone Recharge", "Rent", "Water"],
  Shopping: ["Amazon", "Flipkart", "Mall", "Meesho", "Myntra"],
  Entertainment: ["Netflix", "Spotify", "Amazon Prime", "Cinema", "Games"],
  Health: ["Pharmacy", "Doctor", "Gym", "Hospital"],
  Salary: ["Monthly Salary", "Stipend", "Bonus"],
  Freelance: ["Client Payment", "Project", "Invoice"],
  Other: [],
};

const AddTransactionPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [mainCategory, setMainCategory] = useState("");
  const [subCategory, setSubCategory] = useState("");
  const [customSub, setCustomSub] = useState("");
  const [isOtherSub, setIsOtherSub] = useState(false);
  const [formData, setFormData] = useState({
    partyName: "",
    type: "DEBIT",
    amount: "",
    category: "",
    paymentMode: "UPI",
    date: new Date().toISOString().split("T")[0],
    description: "",
  });

  const subOptions = mainCategory ? CATEGORIES[mainCategory] || [] : [];

  const updateForm = (field, value) => {
    setFormData((current) => ({ ...current, [field]: value }));
  };

  const handleMainCategory = (e) => {
    const category = e.target.value;

    setMainCategory(category);
    setSubCategory("");
    setCustomSub("");
    setIsOtherSub(false);
    updateForm("category", category);
  };

  const handleSubCategory = (e) => {
    const category = e.target.value;

    if (category === "__other__") {
      setIsOtherSub(true);
      setSubCategory("");
      updateForm("category", mainCategory);
      return;
    }

    setIsOtherSub(false);
    setSubCategory(category);
    updateForm("category", category);
  };

  const handleCustomSub = (e) => {
    const category = e.target.value;

    setCustomSub(category);
    updateForm("category", category || mainCategory);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await transactionApi.createTransaction({
        ...formData,
        amount: Number(formData.amount),
      });
      navigate("/");
    } catch (err) {
      alert("Error adding transaction.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Navbar />
      <main className="dashboard-container">
        <div className="card" style={{ maxWidth: "600px", margin: "0 auto" }}>
          <h2 style={{ fontSize: "20px", fontWeight: 700, color: "#f0f4ff", marginBottom: "24px" }}>
            Add Transaction
          </h2>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Party Name</label>
              <input
                name="partyName"
                value={formData.partyName}
                onChange={(e) => updateForm(e.target.name, e.target.value)}
                placeholder="e.g. Zomato, Amazon, Shivam"
                required
              />
            </div>

            <div className="flex-row">
              <div className="form-group flex-1">
                <label>Type</label>
                <select name="type" value={formData.type} onChange={(e) => updateForm(e.target.name, e.target.value)}>
                  <option value="DEBIT">DEBIT (Money Out)</option>
                  <option value="CREDIT">CREDIT (Money In)</option>
                </select>
              </div>

              <div className="form-group flex-1">
                <label>Amount (INR)</label>
                <input
                  type="number"
                  name="amount"
                  value={formData.amount}
                  onChange={(e) => updateForm(e.target.name, e.target.value)}
                  placeholder="0"
                  required
                />
              </div>
            </div>

            <div className="flex-row">
              <div className="form-group flex-1">
                <label>Category</label>
                <select value={mainCategory} onChange={handleMainCategory} required>
                  <option value="">Select category</option>
                  {Object.keys(CATEGORIES).map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>

              {mainCategory && mainCategory !== "Other" && (
                <div className="form-group flex-1">
                  <label>Sub-category</label>
                  <select value={isOtherSub ? "__other__" : subCategory} onChange={handleSubCategory}>
                    <option value="">Select or skip</option>
                    {subOptions.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                    <option value="__other__">Other (custom)</option>
                  </select>
                </div>
              )}
            </div>

            {isOtherSub && (
              <div className="form-group">
                <label>Custom Sub-category</label>
                <input
                  placeholder={`e.g. My favourite ${mainCategory} place`}
                  value={customSub}
                  onChange={handleCustomSub}
                />
              </div>
            )}

            {formData.category && (
              <div style={{ marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 12, color: "#4a5568" }}>Saving as:</span>
                <span style={{ background: "rgba(99,211,159,0.12)", color: "#63d39f", borderRadius: "20px", padding: "2px 12px", fontSize: 12, fontWeight: 600 }}>
                  {formData.category}
                </span>
              </div>
            )}

            <div className="flex-row">
              <div className="form-group flex-1">
                <label>Payment Mode</label>
                <select name="paymentMode" value={formData.paymentMode} onChange={(e) => updateForm(e.target.name, e.target.value)}>
                  <option value="CASH">Cash</option>
                  <option value="UPI">UPI</option>
                  <option value="BANK">Bank Transfer</option>
                </select>
              </div>

              <div className="form-group flex-1">
                <label>Date</label>
                <input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={(e) => updateForm(e.target.name, e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label>Description <span style={{ color: "#4a5568", fontWeight: 400 }}>(optional)</span></label>
              <textarea
                name="description"
                rows="3"
                value={formData.description}
                onChange={(e) => updateForm(e.target.name, e.target.value)}
                placeholder="Any notes about this transaction..."
              />
            </div>

            <button type="submit" disabled={loading}>
              {loading ? "Saving..." : "Submit Transaction"}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
};

export default AddTransactionPage;
