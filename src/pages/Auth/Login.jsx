import React, { useState, useEffect} from "react";
import { useDispatch, useSelector } from "react-redux";
import { login } from "../../redux/Slice/authSlice";
import { Link, useNavigate, useLocation } from "react-router-dom";
import Toast from "../../Toast.jsx";

const Login = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();   
  const location = useLocation();
  const {isAuthenticated, loading, error } = useSelector((state) => state.auth);
  const [toast, setToast] = useState(null);

  const [emailOrUsername, setEmailOrUsername] = useState("");
  const [password, setPassword] = useState("");

  const showToast = (msg) => {
    setToast({ msg });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  const handleLogin = (e) => {
    e.preventDefault();
    const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailOrUsername);

    const loginData = isEmail? { email: emailOrUsername, password } : { username: emailOrUsername, password };
      dispatch(login(loginData));
  };

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/"); // ✅ Redirect after login
    }
  }, [isAuthenticated, navigate]);

  // Show error in toast when it occurs
  useEffect(() => {
    if (error) {
      showToast(error);
    }
  }, [error]);

  // Show toast when redirected from Watch page
  useEffect(() => {
    if (location.state?.error) {
      showToast(location.state.error);
    }
  }, [location]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-black">
      {/* Toast container */}
      <div className="fixed top-20 right-4 z-50">
        {toast && <Toast message={toast.msg} />}
      </div>

      <div className="bg-zinc-800 p-8 rounded-lg shadow-lg w-full max-w-md">
        <h2 className="text-2xl font-bold text-white mb-6 text-center">
          Login to VideoHub
        </h2>
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <input
              type="text"
              placeholder="Email or Username"
              className="w-full p-3 bg-zinc-700 text-white rounded border border-zinc-600 focus:border-red-500 focus:outline-none"
              value={emailOrUsername}
              onChange={(e) => setEmailOrUsername(e.target.value)}
            />
          </div>
          <div>
            <input
              type="password"
              placeholder="Password"
              className="w-full p-3 bg-zinc-700 text-white rounded border border-zinc-600 focus:border-red-500 focus:outline-none"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <button
            className="w-full bg-red-600 text-white p-3 rounded hover:bg-red-700 transition-colors disabled:opacity-50"
            disabled={loading}
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>
        {error && <p className="text-red-500 mt-4 text-center">{error}</p>}
        <p className="text-gray-400 mt-4 text-center">
          Don't have an account?{" "}
          <Link to="/register" className="text-red-500 hover:text-red-400">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
