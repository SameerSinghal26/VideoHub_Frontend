import { useDispatch } from 'react-redux';
import { logout } from '../redux/Slice/authSlice';
import { logoutUser } from '../utils/api/auth';
import { useNavigate } from 'react-router-dom';

const LogoutButton = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logoutUser();
      dispatch(logout());
      localStorage.removeItem("user");
      localStorage.removeItem("accessToken");
      navigate("/");
    } catch (err) {
      if (err.message && err.message.toLowerCase().includes("unauthorized")) {
        dispatch(logout());
        localStorage.removeItem("user");
        localStorage.removeItem("accessToken");
        navigate("/");
      } else {
        alert(err.message || "Logout failed");
      }
    }
  };

  return (
    <button 
      onClick={handleLogout}
      className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-900 transition-colors"
    >
      Logout
    </button>
  );
};

export default LogoutButton; 