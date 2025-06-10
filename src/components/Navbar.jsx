import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import LoginButton from "./LoginButton";
import SignupButton from "./SignupButton";
import LogoutButton from "./LogoutButton";
import Sidebar from "./Sidebar.jsx";
import Profile from "./ProfileBar.jsx";
import { useSidebar } from '../context/SideBarContext.jsx';
import { searchAll } from "../utils/api/auth";

import defaultAvatar from "/download.webp";

const Navbar = () => {
  const auth = useSelector((state) => state.auth);
  const user = auth.user;
  // console.log(auth);
  
  
  const { isSidebarOpen, toggleSidebar } = useSidebar();

  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const profileRef = useRef(null);
  const [search, setSearch] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const debounceRef = useRef();
  const navigate = useNavigate();
  const searchAreaRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setShowProfileMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const handleClickOutsideSearch = (event) => {
      if (
        searchAreaRef.current &&
        !searchAreaRef.current.contains(event.target)
      ) {
        setSuggestions([]);
      }
    };
    document.addEventListener("mousedown", handleClickOutsideSearch);
    return () => document.removeEventListener("mousedown", handleClickOutsideSearch);
  }, []);

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearch(value);

    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (value.trim()) {
      debounceRef.current = setTimeout(async () => {
        try {
          const { videos, users } = await searchAll(value);
          setSuggestions([
            ...users.map(u => ({ type: 'user', ...u })),
            ...videos.map(v => ({ type: 'video', ...v }))
          ]);
        } catch {
          setSuggestions([]);
        }
      }, 300); // 300ms debounce
    } else {
      setSuggestions([]);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (search.trim()) {
      navigate(`/search?q=${encodeURIComponent(search)}`);
      setSearch("");
    }
  };

  const handleSuggestionClick = () => {
    setSuggestions([]);
  };

  return (
    <>
      <nav className="bg-black text-white shadow-md fixed top-0 z-50 w-full">
        <div className="max-w-full mx-auto px-3 sm:px-6 lg:px-3">
          <div className="flex justify-between items-center h-23">
            {/* Left - Logo & Menu Icon */}
            <div className="flex items-center space-x-4">
              <button
                onClick={toggleSidebar}
                className="text-white focus:outline-none p-1 hover:bg-zinc-800 rounded-4xl"
              >
                <img src="/sort_white.png" alt="Menu" className="w-10 h-10" />
              </button>
              <Link to="/" className="flex items-center space-x-2">
                <img src="/play.png" alt="VideoHub Logo" className="w-9 h-9" />
                <span className="text-xl font-semibold">VideoHub</span>
              </Link>
            </div>

            {/* Center - Search Bar */}
            <div className="flex-1 flex justify-center mx-4" ref={searchAreaRef}>
              <form onSubmit={handleSearch} className="flex-1 flex justify-center mx-4">
                <input
                  type="text"
                  placeholder="Search videos or users..."
                  className="w-full max-w-md px-4 py-2 rounded-4xl bg-zinc-850 text-white border border-zinc-700 focus:outline-none focus:ring-2 focus:ring-red-600"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                />
              </form>
            </div>

            {/* Right - Auth Buttons + Profile */}
            <div className="flex items-center space-x-3 relative" ref={profileRef}>
              {!auth.isAuthenticated ? (
                <>
                  <LoginButton />
                  <SignupButton />
                  <img
                    src={defaultAvatar}
                    alt="profile"
                    className="w-10 h-10 rounded-full cursor-pointer border-2"
                    onClick={() => setShowProfileMenu(!showProfileMenu)}
                  />
                  {showProfileMenu && <Profile user={auth.user} setShowProfileMenu={setShowProfileMenu} />}
                </>
              ) : (
                <>
                  <Link
                    to="/create"
                    className="flex items-center bg-zinc-900 hover:bg-zinc-800 text-white font-medium py-1 px-4 rounded-full transition-colors duration-200 mr-4"
                  >
                    <span className="text-2xl mr-2 mb-1">+</span>
                    <span>Create</span>
                  </Link>
                  <LogoutButton />
                  <img
                    src={user?.avatar || "/download.webp"}
                    alt="profile"
                    className="w-10 h-10 rounded-full cursor-pointer"
                    onClick={() => setShowProfileMenu(!showProfileMenu)}
                  />
                  {showProfileMenu && <Profile user={auth.user} setShowProfileMenu={setShowProfileMenu} />}
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Sidebar */}
      <Sidebar isOpen={isSidebarOpen} />
    </>
  );
};

export default Navbar;
