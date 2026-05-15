import { motion } from "framer-motion";
import { Mail, Lock } from "lucide-react";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { loginRequest } from "../../redux/auth/authSlice";
import { Link, useNavigate } from "react-router";
import Header from "../Home/Header";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { token } = useSelector((state) => state.auth);
  const handleLogin = (e) => {
    e.preventDefault();
    dispatch(loginRequest({ username, password }));
  };
  useEffect(() => {
    if (token) {
      navigate("/");
    }
  }, [token, navigate]);
  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6">
      <Header />
      {/* CONTAINER */}
      <div className="w-full max-w-6xl overflow-hidden rounded-3xl bg-slate-900 shadow-2xl md:grid md:grid-cols-2">
        {/* LEFT SIDE - LOGIN FORM */}
        <motion.div
          initial={{ opacity: 0, x: -40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="flex flex-col justify-center p-10 md:p-14"
        >
          {/* TITLE */}
          <div className="mb-10">
            <h1 className="text-4xl font-bold text-white">Welcome Back</h1>

            <p className="mt-3 text-slate-400">
              Login to your Parking Manager account
            </p>
          </div>

          {/* FORM */}
          <form className="space-y-6">
            {/* EMAIL */}
            <div>
              <label className="mb-2 block text-sm text-slate-300">Email</label>

              <div className="flex items-center rounded-xl border border-slate-700 bg-slate-800 px-4">
                <Mail className="text-slate-400" size={18} />

                <input
                  placeholder="Enter your username"
                  className="w-full bg-transparent px-3 py-4 text-white outline-none"
                  onChange={(e) => setUsername(e.target.value)}
                  value={username}
                />
              </div>
            </div>

            {/* PASSWORD */}
            <div>
              <label className="mb-2 block text-sm text-slate-300">
                Password
              </label>

              <div className="flex items-center rounded-xl border border-slate-700 bg-slate-800 px-4">
                <Lock className="text-slate-400" size={18} />

                <input
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-transparent px-3 py-4 text-white outline-none"
                />
              </div>
            </div>

            {/* REMEMBER */}
            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 text-slate-400">
                <input type="checkbox" />
                Remember me
              </label>

              <a href="#" className="text-blue-400 hover:text-blue-300">
                Forgot password?
              </a>
            </div>

            {/* BUTTON */}
            <button
              onClick={handleLogin}
              type="submit"
              className="w-full rounded-xl bg-blue-600 py-4 font-semibold text-white transition hover:bg-blue-500"
            >
              Sign In
            </button>
          </form>

          {/* FOOTER */}
          <p className="mt-8 text-center text-slate-400">
            Don’t have an account?{" "}
            <Link to="/register" className="text-blue-400 hover:text-blue-300">
              Sign Up
            </Link>
          </p>
        </motion.div>

        {/* RIGHT SIDE - IMAGE */}
        <motion.div
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="hidden md:block"
        >
          <img
            src="https://images.unsplash.com/photo-1502877338535-766e1452684a?q=80&w=2070&auto=format&fit=crop"
            alt="Parking"
            className="h-full w-full object-cover"
          />
        </motion.div>
      </div>
    </div>
  );
};

export default Login;
