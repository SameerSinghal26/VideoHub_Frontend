import React, { useEffect, useState } from "react";
import { getSubscribedChannelsVideos } from "../utils/api/auth";
import VideoCard from "../components/VideoCard.jsx";
import { useSidebar } from "../context/SideBarContext.jsx";
import { Grid, List } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import VideoCardList from "../components/VideoCardList.jsx";
import Toast from "../Toast.jsx";
import { useSelector } from 'react-redux';

function Subscriptions() {

  const { isSidebarOpen } = useSidebar();
  const [activeMenuId, setActiveMenuId] = useState(null);
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [viewMode, setViewMode] = useState("grid"); // "grid" or "list"
  const [toast, setToast] = useState(null);
  const navigate = useNavigate();
  const auth = useSelector((state) => state.auth);

  // Authentication check
  useEffect(() => {
    if (!auth.user) {
      navigate('/login', { state: { error: "Please login to view subscriptions" } });
      return;
    }
  }, [auth.user, navigate]);

  const showToast = (msg) => {
    setToast({ msg });
    setError(msg);
    if (msg === "please login or register to continue.") {
      navigate("/login", { state: { error: msg } });
    }
  };

  useEffect(() => {
    const fetchSubscribedVideos = async () => {
      try {
        setLoading(true);
        const data = await getSubscribedChannelsVideos();
        setVideos(data);
        setError(null);
      } catch (err) {
        setError(err.message);
        setVideos([]);
      } finally {
        setLoading(false);
      }
    };

    fetchSubscribedVideos();
  }, []);

  useEffect(() => {
    if (error && error.includes("Unauthorized request")) {
      setToast({ msg: "please login or register to continue." });
      setTimeout(() => {
        navigate("/login", { state: { error: "please login or register to continue." } });
      }, 2000);
    }
  }, [error, navigate]);

  const handleManageClick = () => {
    // Add your manage logic here
    console.log("Manage clicked");
  };
  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[100vh] bg-black">
      <img src="/1479.gif" alt="Loading..." className="w-20 h-20" />
    </div>
  );
  if (error) return (
    <div className="flex flex-col items-center justify-center min-h-[100vh] bg-black">
      {toast && <Toast message={toast.msg} />}
      <img src="/1479.gif" alt="Error" className="w-20 h-20" />
    </div>
  );
  console.log(videos);
  return (
    <>
    
      <div className={`flex justify-between items-center px-12 pt-3 ${isSidebarOpen ? "ml-[200px]" : "ml-[50px]"} transition-all duration-300 mt-22`}>
        <h1 className={`text-white text-2xl p-1 font-semibold ${viewMode === "grid" ? "" : "px-9"}`}>Latest</h1>
        <div>
        {toast && <Toast message={toast.msg} />}
      </div>
        <div className="flex items-center gap-6">
          <Link to="/feed/channels">
            <button onClick={handleManageClick} className="text-blue-700 hover:bg-blue-400 font-semibold rounded-4xl py-1 px-3">
              Manage
            </button>
          </Link>
          <button
            className={`text-white hover:text-blue-400 ${viewMode === "grid" ? "text-blue-400" : ""}`}
            onClick={() => setViewMode("grid")}
          >
            <Grid size={20} />
          </button>
          <button
            className={`text-white hover:text-blue-400 ${viewMode === "list" ? "text-blue-400" : ""}`}
            onClick={() => setViewMode("list")}
          >
            <List size={20} />
          </button>
        </div>
      </div>
    
      {viewMode === "grid" ? (
        <div className={`min-h-screen bg-black px-8 py-12 grid gap-x-8 gap-y-1 items-start grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 transition-all duration-300 ease-in-out ${isSidebarOpen ? "ml-[200px]" : "ml-[50px]"}`}>
          {!loading && !error && videos.length === 0 && (
            <p className="text-white col-span-full text-center">
              No videos from your subscribed channels yet. Subscribe to some channels to see their videos here!
            </p>
          )}
          {videos &&
            videos.map((video) => (
              <VideoCard
                key={video._id}
                video={video}
                activeMenuId={activeMenuId}
                setActiveMenuId={setActiveMenuId}
                menuPosition={menuPosition}
                setMenuPosition={setMenuPosition}
              />
            ))}
        </div>
      ) : (
        <div className={`min-h-screen bg-black px-8 flex flex-col transition-all duration-300 ease-in-out ${isSidebarOpen ? "ml-[200px]" : "ml-[50px]"}`}>
          {!loading && !error && videos.length === 0 && (
            <p className="text-white text-center">
              No videos from your subscribed channels yet. Subscribe to some channels to see their videos here!
            </p>
          )}
          {videos &&
            videos.map((video) => (
              <VideoCardList 
                key={video._id} 
                video={video} 
                activeMenuId={activeMenuId}
                setActiveMenuId={setActiveMenuId}
                menuPosition={menuPosition}
                setMenuPosition={setMenuPosition}
              />
            ))}
        </div>
      )}
    </>
  );
}

export default Subscriptions;