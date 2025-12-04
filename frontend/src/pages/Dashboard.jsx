import React, { useEffect, useMemo, useState } from "react";
import api from "../api.js";
import { useAuth } from "../context/AuthContext.jsx";
import { useNavigate } from "react-router-dom";

function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({
    amount: "",
    type: "income",
    category: "",
    date: "",
    note: "",
  });

  const [filterType, setFilterType] = useState("all");
  const [filterCategory, setFilterCategory] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const res = await api.get("/api/transactions");
        setTransactions(res.data);
      } catch (err) {
        setError(
          err.response?.data?.message || "Failed to load transactions"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, []);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const startEdit = (transaction) => {
    setEditingId(transaction._id);
    setForm({
      amount: String(transaction.amount),
      type: transaction.type,
      category: transaction.category,
      date: transaction.date?.slice(0, 10),
      note: transaction.note || "",
    });
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/api/transactions/${id}`);
      setTransactions((prev) => prev.filter((t) => t._id !== id));
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to delete transaction"
      );
    }
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...form,
        amount: Number(form.amount),
      };

      if (editingId) {
        const res = await api.patch(
          `/api/transactions/${editingId}`,
          payload
        );
        setTransactions((prev) =>
          prev.map((t) => (t._id === editingId ? res.data : t))
        );
        setEditingId(null);
      } else {
        const res = await api.post("/api/transactions", payload);
        setTransactions((prev) => [res.data, ...prev]);
      }

      setForm({
        amount: "",
        type: "income",
        category: "",
        date: "",
        note: "",
      });
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to save transaction"
      );
    }
  };

  const filteredTransactions = useMemo(() => {
    if (!Array.isArray(transactions)) return [];
    return transactions.filter((t) => {
      if (filterType !== "all" && t.type !== filterType) return false;

      if (
        filterCategory &&
        !t.category.toLowerCase().includes(filterCategory.toLowerCase())
      ) {
        return false;
      }

      if (search) {
        const s = search.toLowerCase();
        const inNote = (t.note || "").toLowerCase().includes(s);
        const inCat = (t.category || "").toLowerCase().includes(s);
        if (!inNote && !inCat) return false;
      }

      return true;
    });
  }, [transactions, filterType, filterCategory, search]);

  const { totalIncome, totalExpense, netBalance } = useMemo(() => {
    let income = 0;
    let expense = 0;
    for (const t of transactions) {
      if (t.type === "income") income += t.amount;
      if (t.type === "expense") expense += t.amount;
    }
    return {
      totalIncome: income,
      totalExpense: expense,
      netBalance: income - expense,
    };
  }, [transactions]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100 text-slate-900">
        <p>Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-slate-100 text-slate-900">
      <header className="flex items-center justify-between px-8 py-4 bg-white border-b border-slate-200 shadow-sm">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <div className="flex items-center gap-4">
          <p className="text-sm text-slate-500">
            Welcome, <span className="font-semibold">{user?.name}</span>
          </p>
          <button
            type="button"
            onClick={() => {
              logout();
              navigate("/login");
            }}
            className="px-3 py-1.5 rounded bg-slate-900 text-white text-sm hover:bg-slate-700"
          >
            Logout
          </button>
          <button
  type="button"
  onClick={() => navigate("/profile")}
  className="px-3 py-1.5 rounded border border-slate-300 text-sm text-slate-700 bg-white hover:bg-slate-100"
>
  Profile
</button>

        </div>
      </header>

      {error && (
        <div className="px-8 py-3 text-sm text-red-600 bg-red-50 border-b border-red-100">
          {error}
        </div>
      )}

      <main className="px-8 py-6 space-y-6">
        {/* Summary cards */}
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-xl bg-white p-4 shadow-sm border border-slate-200">
            <p className="text-sm text-slate-500">Total Income</p>
            <p className="mt-2 text-2xl font-semibold text-emerald-600">
              ₹{totalIncome.toFixed(2)}
            </p>
          </div>
          <div className="rounded-xl bg-white p-4 shadow-sm border border-slate-200">
            <p className="text-sm text-slate-500">Total Expense</p>
            <p className="mt-2 text-2xl font-semibold text-rose-600">
              ₹{totalExpense.toFixed(2)}
            </p>
          </div>
          <div className="rounded-xl bg-white p-4 shadow-sm border border-slate-200">
            <p className="text-sm text-slate-500">Net Balance</p>
            <p className="mt-2 text-2xl font-semibold text-indigo-600">
              ₹{netBalance.toFixed(2)}
            </p>
          </div>
        </div>

        {/* Add transaction form */}
        <section className="rounded-xl bg-white p-4 space-y-4 shadow-sm border border-slate-200">
          <h2 className="text-lg font-semibold">
            {editingId ? "Edit Transaction" : "Add Transaction"}
          </h2>
          <form
            onSubmit={handleAdd}
            className="grid gap-4 md:grid-cols-5 md:items-end"
          >
            <div className="space-y-1">
              <label className="block text-sm">Amount</label>
              <input
                type="number"
                name="amount"
                value={form.amount}
                onChange={handleChange}
                className="w-full px-3 py-2 rounded border border-slate-300 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="block text-sm">Type</label>
              <select
                name="type"
                value={form.type}
                onChange={handleChange}
                className="w-full px-3 py-2 rounded border border-slate-300 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="income">Income</option>
                <option value="expense">Expense</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="block text-sm">Category</label>
              <input
                type="text"
                name="category"
                value={form.category}
                onChange={handleChange}
                className="w-full px-3 py-2 rounded border border-slate-300 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="block text-sm">Date</label>
              <input
                type="date"
                name="date"
                value={form.date}
                onChange={handleChange}
                className="w-full px-3 py-2 rounded border border-slate-300 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>
            
            
            <button
              type="submit"
              className="w-full py-2 rounded bg-indigo-600 text-white font-semibold hover:bg-indigo-500 transition"
            >
              {editingId ? "Save" : "Add"}
            </button>

          </form>
        </section>

        {/* Filters */}
        <section className="rounded-xl bg-white p-4 space-y-3 shadow-sm border border-slate-200">
          <h2 className="text-lg font-semibold mb-1">Filters</h2>
          <div className="flex flex-wrap gap-4">
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-3 py-2 rounded border border-slate-300 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">All</option>
              <option value="income">Income</option>
              <option value="expense">Expense</option>
            </select>

            <input
              type="text"
              placeholder="Filter by category"
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="px-3 py-2 rounded border border-slate-300 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />

            <input
              type="text"
              placeholder="Search note or category"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 min-w-[200px] px-3 py-2 rounded border border-slate-300 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </section>

        {/* Transactions table */}
        <section className="rounded-xl bg-white p-4 overflow-x-auto shadow-sm border border-slate-200">
          <h2 className="text-lg font-semibold mb-3">Transactions</h2>
          {filteredTransactions.length === 0 ? (
            <p className="text-sm text-slate-500">No transactions yet.</p>
          ) : (
            <table className="min-w-full text-sm">
              <thead className="text-left text-slate-500 border-b border-slate-200 bg-slate-50">
                <tr>
                  <th className="py-2 pr-4">Date</th>
                  <th className="py-2 pr-4">Category</th>
                  <th className="py-2 pr-4">Type</th>
                  <th className="py-2 pr-4">Amount</th>
                  <th className="py-2 pr-4">Note</th>
                  <th className="py-2 pr-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredTransactions.map((t) => (
                  <tr key={t._id} className="border-b border-slate-100">
                    <td className="py-2 pr-4">
                      {new Date(t.date).toLocaleDateString()}
                    </td>
                    <td className="py-2 pr-4">{t.category}</td>
                    <td className="py-2 pr-4 capitalize">{t.type}</td>
                    <td className="py-2 pr-4">
                      {t.type === "income" ? "+" : "-"}₹
                      {t.amount.toFixed(2)}
                    </td>
                    <td className="py-2 pr-4 text-slate-600">
                      {t.note || "-"}
                    </td>
                    <td className="py-2 pr-4 space-x-2">
                      <button
                        type="button"
                        onClick={() => startEdit(t)}
                        className="px-2 py-1 text-xs rounded bg-slate-100 border border-slate-300 text-slate-700 hover:bg-slate-200"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(t._id)}
                        className="px-2 py-1 text-xs rounded bg-rose-500 text-white hover:bg-rose-400"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>
      </main>
    </div>
  );
}

export default Dashboard;

