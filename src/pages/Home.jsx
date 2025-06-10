import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getAllVideosPublic } from "../redux/Slice/authSlice.js";
import VideoCard from "../components/VideoCard.jsx";
import { useSidebar } from "../context/SideBarContext.jsx";

const Home = () => {
  const dispatch = useDispatch();
  const { videos, loading, error } = useSelector((state) => state.auth);
  const { isSidebarOpen } = useSidebar();
  const [activeMenuId, setActiveMenuId] = useState(null);
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });

  useEffect(() => {
    dispatch(getAllVideosPublic());
  }, [dispatch]);

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
  return (
    <div
      className={`min-h-screen bg-black px-8 py-12 grid gap-x-8 gap-y-1 items-start grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 transition-all duration-300 ease-in-out ${isSidebarOpen ? "ml-[200px]" : "ml-[50px]"} mt-16`}
    >
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
  );
};

export default Home;
