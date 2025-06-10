import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { register} from "../../redux/Slice/authSlice";
import { Link, useNavigate } from "react-router-dom";
import Toast from "../../Toast.jsx";

const Register = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate(); 
  const { loading, error, success } = useSelector((state) => state.auth);
  const [toast, setToast] = useState(null);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    fullName: "",
    username: "",
    bio: "",
  });

  const showToast = (msg) => {
    setToast({ msg });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  useEffect(() => {
    if (error) {
      showToast(error);
    }
    if (success) {
      showToast(success);
    }
  }, [error, success]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'username') {
      const formattedUsername = value.replace(/\s+/g, '').toLowerCase();
      setFormData({ ...formData, [name]: formattedUsername });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (formData.username.includes(' ')) {
      setToast({ msg: "Username cannot contain spaces" });
      return;
    }
    const data = new FormData();
    data.append("fullName", formData.fullName);
    data.append("username", formData.username);
    data.append("email", formData.email);
    data.append("password", formData.password);
    data.append("bio", formData.bio);
  
    try {
      await dispatch(register(data)).unwrap();
      setToast({ msg: "Registration successful! Please login to continue." });
      setTimeout(() => {
        navigate("/login");
      }, 1000);
    } catch (error) {
      setToast({ msg: error || "Registration failed" });
    }
  };

  return (
    <div className="h-screen overflow-hidden flex items-center justify-center bg-black mt-12">
      {/* Toast container */}
      <div className="fixed top-20 right-4 z-50">
        {toast && <Toast message={toast.msg} />}
      </div>
      <div className="bg-zinc-800 p-8 rounded-lg shadow-lg w-full max-w-md">
        <h2 className="text-2xl font-bold text-white mb-6 text-center">
          Create an Account
        </h2>
        <form onSubmit={handleRegister} className="space-y-4">
          <input
            type="text"
            name="fullName"
            placeholder="Full Name"
            className="w-full p-3 bg-zinc-700 text-white rounded border border-zinc-600 focus:border-green-500 focus:outline-none"
            value={formData.fullName}
            onChange={handleChange}
            required
          />
          <input
            type="text"
            name="username"
            placeholder="Username"
            className="w-full p-3 bg-zinc-700 text-white rounded border border-zinc-600 focus:border-green-500 focus:outline-none"
            value={formData.username}
            onChange={handleChange}
            required
          />
          <input
            type="email"
            name="email"
            placeholder="Email"
            className="w-full p-3 bg-zinc-700 text-white rounded border border-zinc-600 focus:border-green-500 focus:outline-none"
            value={formData.email}
            onChange={handleChange}
            required
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            className="w-full p-3 bg-zinc-700 text-white rounded border border-zinc-600 focus:border-green-500 focus:outline-none"
            value={formData.password}
            onChange={handleChange}
            required
          />
          <input
            name="bio"
            placeholder="Bio"
            className="w-full p-3 bg-zinc-700 text-white rounded border border-zinc-600 focus:border-red-500 focus:outline-none resize-none"
            value={formData.bio}
            onChange={handleChange}
          />
          <button
            type="submit"
            className="w-full bg-red-600 text-white p-3 rounded hover:bg-red-700 transition-colors disabled:opacity-50"
            disabled={loading}
          >
            {loading ? "Registering..." : "Register"}
          </button>
        </form>
        {error && <p className="text-red-500 mt-4 text-center">{error}</p>}
        <p className="text-gray-400 mt-4 text-center">
          Already have an account?{" "}
          <Link to="/login" className="text-red-500 hover:text-red-400">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
