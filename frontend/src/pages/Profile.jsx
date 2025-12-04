import React, { useEffect, useState } from "react";
import api from "../api.js";
import { useAuth } from "../context/AuthContext.jsx";

function Profile() {
  const { user, setUser } = useAuth();
  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const fetchMe = async () => {
      try {
        const res = await api.get("/api/auth/me");
        setName(res.data.name);
        setEmail(res.data.email);
        setUser(res.data);
      } catch {
        // ignore; we already have user from context
      }
    };
    fetchMe();
  }, [setUser]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    try {
      const res = await api.patch("/api/auth/me", { name });
      setUser(res.data);
      setMessage("Profile updated");
    } catch {
      setMessage("Update failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-slate-100 text-slate-900">
      <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-md border border-slate-200 space-y-4">
        <h1 className="text-2xl font-bold text-center mb-2">Profile</h1>
        {message && (
          <p className="text-sm text-center text-emerald-600">{message}</p>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="block text-sm text-slate-600">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 rounded border border-slate-300 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            />
          </div>

          <div className="space-y-1">
            <label className="block text-sm text-slate-600">Email</label>
            <input
              type="email"
              value={email}
              disabled
              className="w-full px-3 py-2 rounded border border-slate-200 bg-slate-50 text-slate-500"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 rounded bg-indigo-600 text-white font-semibold hover:bg-indigo-500 disabled:opacity-60"
          >
            {loading ? "Saving..." : "Save changes"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default Profile;


