import TransactionRow from "./TransactionRow";
import { deleteTransaction } from "../../services/transactionApi";

const TransactionTable = ({ transactions, setTransactions, refreshDashboard }) => {

  const handleDelete = async (id) => {
    await deleteTransaction(id);
    setTransactions(prev => prev.filter(txn => txn._id !== id));
    refreshDashboard();
  };

  if (!transactions || transactions.length === 0) {
    return (
      <div className="card" style={{ textAlign: "center", padding: '48px', marginTop: "20px" }}>
        <div style={{ fontSize: '32px', marginBottom: '12px' }}>📭</div>
        <div style={{ color: '#4a5568', fontSize: '15px' }}>No transactions yet</div>
        <div style={{ color: '#4a5568', fontSize: '13px', marginTop: '4px' }}>Add your first transaction to get started</div>
      </div>
    );
  }

  return (
    <div className="card" style={{ padding: 0, overflow: 'hidden', marginTop: '8px' }}>
      <div style={{ overflowX: "auto" }}>
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
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((t) => (
              <TransactionRow
                key={t._id}
                transaction={t}
                onDelete={handleDelete}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TransactionTable;