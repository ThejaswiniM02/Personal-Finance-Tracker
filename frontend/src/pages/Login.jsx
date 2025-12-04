import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
  e.preventDefault();
  setError("");
  setSubmitting(true);
  try {
    await login(form.email, form.password);
    navigate("/");
  } catch (err) {
    setError(err.response?.data?.message || "Login failed");
  } finally {
    setSubmitting(false);
  }
};


  return (
  <div className="min-h-screen w-full flex items-center justify-center bg-slate-100 text-slate-900">
    <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-lg space-y-4">
      <h1 className="text-2xl font-bold text-center mb-2">Login</h1>
      {error && <p className="text-red-400 text-sm">{error}</p>}

      <form className="space-y-4" onSubmit={handleSubmit}>
        <div className="space-y-1">
          <label className="block text-sm">Email</label>
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            className="w-full px-3 py-2 rounded border border-slate-300 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            required
          />
        </div>

        <div className="space-y-1">
          <label className="block text-sm">Password</label>
          <input
            type="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            className="w-full px-3 py-2 rounded border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            required
          />
        </div>

        <button
  type="submit"
  disabled={submitting}
  className="w-full py-2 rounded bg-gold text-slate-900 font-semibold hover:bg-yellow-400 disabled:opacity-60 disabled:cursor-not-allowed transition"
>
  {submitting ? "Signing in..." : "Sign in"}
</button>

      </form>

      <p className="text-center text-sm text-slate-400">
        Don&apos;t have an account?{" "}
        <Link to="/register" className="text-gold hover:underline">
          Register
        </Link>
      </p>
    </div>
  </div>
);
}

export default Login;
