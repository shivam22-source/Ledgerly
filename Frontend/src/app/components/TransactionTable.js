import TransactionRow from "./TransactionRow";
import { deleteTransaction } from "../../services/transactionApi";

const TransactionTable = ({ transactions, setTransactions,refreshDashboard}) => {

  const handleDelete = async (id) => {
    await deleteTransaction(id);

    setTransactions(prev =>
      prev.filter(txn => txn._id !== id)
    );
    refreshDashboard();
   
  };

  if (!transactions || transactions.length === 0) {
    return (
      <div className="card" style={{ textAlign: "center", marginTop: "20px" }}>
        No tasks/transactions found.
      </div>
    );
  }

  return (
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
  );
};

export default TransactionTable;
