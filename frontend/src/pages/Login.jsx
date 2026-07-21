import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const { login, register, loginWithGoogle } = useAuth();
  const navigate = useNavigate();
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      if (isRegister) await register(email, password);
      else await login(email, password);
      navigate("/");
    } catch (err) {
      setError(err.message.replace("Firebase: ", ""));
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-brand-50 to-orange-100 dark:from-gray-900 dark:to-gray-800 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass rounded-2xl p-8 w-full max-w-sm"
      >
        <h1 className="text-2xl font-display font-semibold text-center mb-1">NutriPlate</h1>
        <p className="text-sm text-gray-500 text-center mb-6">
          {isRegister ? "Create your account" : "Welcome back"}
        </p>

        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            type="email"
            required
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl bg-white/70 dark:bg-white/10 outline-none text-sm"
          />
          <input
            type="password"
            required
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl bg-white/70 dark:bg-white/10 outline-none text-sm"
          />
          {error && <p className="text-xs text-red-500">{error}</p>}
          <button type="submit" className="btn-primary w-full">
            {isRegister ? "Sign up" : "Log in"}
          </button>
        </form>

        <button
          onClick={() => loginWithGoogle().then(() => navigate("/")).catch((e) => setError(e.message))}
          className="w-full mt-3 py-2.5 rounded-xl border border-gray-300 text-sm font-medium"
        >
          Continue with Google
        </button>

        <p className="text-xs text-center mt-5 text-gray-500">
          {isRegister ? "Already have an account?" : "New here?"}{" "}
          <button onClick={() => setIsRegister((v) => !v)} className="text-brand-600 font-medium">
            {isRegister ? "Log in" : "Sign up"}
          </button>
        </p>
      </motion.div>
    </div>
  );
}
