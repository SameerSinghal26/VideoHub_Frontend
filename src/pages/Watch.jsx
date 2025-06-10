import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchSingleVideo, getAllVideosPublic } from "../redux/Slice/authSlice";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useSidebar } from "../context/SideBarContext.jsx";
import WatchVideoCard from "../components/WatchVideoCard.jsx";
import VideoDescription from "../components/VideoDescription.jsx";
import Toast from "../Toast.jsx";
import { useComment } from "../context/CommentContext";
import { usePlaylist } from '../context/PlaylistContext';
import PlaylistSidebar from '../components/PlaylistSidebar';

const Watch = () => {
  const { videoId } = useParams();
  const location = useLocation();
  const playlistId = new URLSearchParams(location.search).get('playlist');
  const { playlists } = usePlaylist();
  const dispatch = useDispatch();
  const { isSidebarOpen } = useSidebar();
  const navigate = useNavigate();
  const { toast: commentToast } = useComment();
  const auth = useSelector((state) => state.auth);

  // Authentication check
  useEffect(() => {
    if (!auth.user) {
      navigate('/login', { state: { error: "Please login to watch videos" } });
      return;
    }
  }, [auth.user, navigate]);

  const [activeMenuId, setActiveMenuId] = useState(null);
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });
  const [cinemaMode, setCinemaMode] = useState(false);
  const [toast, setToast] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);

  const showToast = (msg) => {
    setToast({ msg });
    setErrorMessage(msg);
    if (msg === "please login or register to continue.") {
      navigate("/login", { state: { error: msg } });
    }
  };

  const { selectedVideo, videos, loading, error } = useSelector(
    (state) => state.auth
  );

  const currentVideoOwner = videos.find((video) => video._id === videoId)?.owner;   

  const filteredVideos = videos
    .filter((video) => video._id !== videoId)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  const playlist = playlists.find(p => p._id === playlistId);

  useEffect(() => {
    if (videoId) {
      dispatch(fetchSingleVideo(videoId));
    }
    dispatch(getAllVideosPublic());
  }, [videoId, dispatch]);

  // Show toast when error is 401 message
  useEffect(() => {
    if (error && error.includes("please login")) {
      showToast(error);
    }
  }, [error]);

  // Handle comment toast
  useEffect(() => {
    if (commentToast?.msg === "please login or register to continue.") {
      navigate("/login", { state: { error: commentToast.msg } });
    }
  }, [commentToast, navigate]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "t" || e.key === "T") {
        setCinemaMode((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  if (loading || !selectedVideo) return (
    <div className="flex flex-col items-center justify-center min-h-[100vh] bg-black">
      {toast && <Toast message={toast.msg} />}
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
    <div className="flex">
      <div
        className={`min-h-screen mt-1 flex flex-col ${
          isSidebarOpen ? "ml-[240px]" : "ml-[75px]"
        } mt-28 relative`}
      >
        {/* Toast container */}
        <div>
          {toast && <Toast message={toast.msg} />}
          {commentToast && <Toast message={commentToast.msg} />}
        </div>

        <div className={`grid grid-cols-6 ${cinemaMode ? "grid-rows-3" : "grid-rows-5"} mr-1`}>
          {/* Video Player */}
          <div
            className={`${cinemaMode ? "col-span-6 row-span-3 mr-2" : "row-span-2 col-span-4"}`}
          >
            <div className="flex flex-col md:flex-row max-w-full bg-black rounded-lg overflow-hidden shadow-lg">
              <video
                src={selectedVideo.videoFile}
                crossOrigin="anonymous"
                controls
                className={`w-full cursor-pointer ${cinemaMode ? "object-fill h-[650px]" : "h-auto max-h-auto"}`}
              />
            </div>
          </div>

          {/* Video Description */}
          <div
            className={`${
              cinemaMode
                ? "row-start-4 col-span-4"
                : "row-span-3 col-span-4 row-start-3"
            }`}
          >
            <VideoDescription
              selectedVideo={selectedVideo}
              selectedUser={currentVideoOwner}
            />
          </div>

          {/* Up Next Sidebar */}
          <div
            className={`col-span-2 ${
              cinemaMode
                ? "row-start-4 row-span-2 p-4 overflow-y-auto"
                : "row-span-5"
            }`}
          >
            
            <aside className="w-full">
              {/* Playlist sidebar */}
        {playlist && (
          <div className="m-2 p-1">
            <PlaylistSidebar playlist={playlist} currentVideoId={videoId} />
          </div>
        )}
              <h3 className="text-lg font-semibold text-white m-1 pl-3 pt-2">
                Up Next
              </h3>
              {videos &&
                filteredVideos.map((video) => (
                  <WatchVideoCard
                    key={video._id}
                    video={video}
                    activeMenuId={activeMenuId}
                    setActiveMenuId={setActiveMenuId}
                    menuPosition={menuPosition}
                    setMenuPosition={setMenuPosition}
                  />
                ))}
            </aside>
          </div>
        </div>

        
      </div>
    </div>
  );
};

export default Watch;
