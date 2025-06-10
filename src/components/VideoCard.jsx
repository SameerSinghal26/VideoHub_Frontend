import { useRef, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { MoreVertical } from "lucide-react";
import { useSidebar } from "../context/SideBarContext.jsx";
import { usePlaylist } from "../context/PlaylistContext";
import ShareModal from "./ShareModal.jsx";
import SaveToPlaylistModal from "../components/SaveToPlaylistModal";

const VideoCard = ({
  video,
  activeMenuId,
  setActiveMenuId,
  menuPosition,
  setMenuPosition,
}) => {
  const { isSidebarOpen } = useSidebar();
  const { handleAddVideoToPlaylist, playlists, handleCreatePlaylist } = usePlaylist();
  const iconRef = useRef(null);
  const menuRef = useRef(null);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const isOpen = activeMenuId === video._id;
  
  const toggleMenu = () => {
    if (isOpen) {
      setActiveMenuId(null);
    } else {
      if (iconRef.current) {
        const rect = iconRef.current.getBoundingClientRect();
        setMenuPosition({ top: rect.bottom + 8, left: rect.left - 220 });
      }
      setActiveMenuId(video._id);
    }
  };

  // Optional: close on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(e.target) &&
        !iconRef.current.contains(e.target)
      ) {
        setActiveMenuId(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const [showBlockMessage, setShowBlockMessage] = useState(false);

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.round(seconds % 60);
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  const timeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = Math.floor((now - date) / 1000); // in seconds

    if (diff < 60) return `${diff} sec ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)} min ago`;
    if (diff < 86400)
      return `${Math.floor(diff / 3600)} hour${Math.floor(diff / 3600) === 1 ? "" : "s"} ago`;
    if (diff < 604800)
      return `${Math.floor(diff / 86400)} day${Math.floor(diff / 86400) === 1 ? "" : "s"} ago`;
    if (diff < 2592000)
      return `${Math.floor(diff / 604800)} week${Math.floor(diff / 604800) === 1 ? "" : "s"} ago`;
    if (diff < 31536000)
      return `${Math.floor(diff / 2592000)} month${Math.floor(diff / 2592000) === 1 ? "" : "s"} ago`;
    return `${Math.floor(diff / 31536000)} year${Math.floor(diff / 31536000) === 1 ? "" : "s"} ago`;
  };

  const handleWatchLater = async () => {
    try {
      // Find or create Watch Later playlist
      let watchLaterPlaylist = playlists.find(p => p.name === "Watch Later");
      
      if (!watchLaterPlaylist) {
        // Create Watch Later playlist if it doesn't exist
        const response = await handleCreatePlaylist({
          name: "Watch Later",
          description: "Videos you want to watch later"
        });
        watchLaterPlaylist = response;
      }

      // Add video to Watch Later playlist
      await handleAddVideoToPlaylist(video._id, watchLaterPlaylist._id);
      setActiveMenuId(null); // Close the menu
    } catch (error) {
      console.error("Error adding to Watch Later:", error);
    }
  };

  return (
    <>
    <div
      className={`text-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow ${
        isSidebarOpen ? "w-[400px]" : "w-[450px]"
      }`}
    >
      <Link to={`/watch/${video?._id}  `} onClick={(e) => {
        e.preventDefault();
        window.location.href = `/watch/${video?._id}`;
      }}>
      
        <div className="relative">
          <img
            src={video?.thumbnail}
            alt={video?.title}
            className="w-full h-[250px] object-cover rounded-xl"
          />
          <span className="absolute bottom-2 right-2 bg-black bg-opacity-75 text-white text-xs px-1.5 py-0.5 rounded">
            {formatDuration(video.duration)}
          </span>
        </div>
      </Link>
      <div className="p-3 flex gap-4">
      <Link
          to={`/@${video.owner?.username}`}
        >
        <img
          src={video.owner?.avatar || "/download.webp"}
          alt={video.owner?.username}
          className="w-11 h-11 rounded-full object-full"
        />
        </Link>
        <div className="flex-1 overflow-hidden">
          <h2 className="text-lg font-semibold truncate">{video.title}</h2>
          <Link to={`/@${video.owner?.username}`}>
            <p className="text-md text-gray-400">{video.owner?.username}</p>
          </Link>
          <div className="text-sm text-gray-500">
            {video.view || 0} views • {timeAgo(video.createdAt)}
          </div>
        </div>

        <div className="relative">
          <div
            ref={iconRef}
            onClick={toggleMenu}
            className="text-gray-400 hover:text-white cursor-pointer"
          >
            <MoreVertical size={22} />
          </div>
        </div>
      </div>

      {isOpen && (
        <div
          ref={menuRef}
          className="fixed w-64 bg-neutral-900 text-white rounded-xl shadow-xl z-[9999] overflow-hidden"
          style={{
            top: `${menuPosition.top}px`,
            left: `${menuPosition.left}px`,
          }}
        >
          <div 
            onClick={handleWatchLater}
            className="hover:bg-neutral-800 px-4 py-2 cursor-pointer flex items-center gap-3"
          >
            ⏰ <span>Save to Watch Later</span>
          </div>
          <div onClick={() => setShowSaveModal(true)} className="hover:bg-neutral-800 px-4 py-2 cursor-pointer flex items-center gap-3">
            📑 <span>Save to playlist</span>
          </div>
          <div onClick={() => setShowShareModal(true)} className="hover:bg-neutral-800 px-4 py-2 cursor-pointer flex items-center gap-3">
            🔗 <span>Share</span>
          </div>
          <hr className="border-neutral-700 my-1" />
          <div
            className="hover:bg-neutral-800 px-4 py-2 cursor-pointer flex items-center gap-3"
            onClick={() => {
              setShowBlockMessage(true);
              setActiveMenuId(null); // Close menu
            }}
          >
            🚫 <span>Not interested</span>
          </div>
          <div
            className="hover:bg-neutral-800 px-4 py-2 cursor-pointer flex items-center gap-3"
            onClick={() => {
              setShowBlockMessage(true);
              setActiveMenuId(null); // Close menu
            }}
          >
            ❌ <span>Don't recommend channel</span>
          </div>
          <div className="hover:bg-neutral-800 px-4 py-2 cursor-pointer flex items-center gap-3">
            🚩 <span>Report</span>
          </div>
        </div>
      )}

      {showBlockMessage && (
        <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-neutral-900 text-white border border-neutral-700 rounded-xl shadow-lg p-6 text-center z-[10000]">
          <p className="mb-4">
            We won't recommend videos from this channel to you again
          </p>
          <button
            className="text-blue-400 font-semibold hover:underline"
            onClick={() => setShowBlockMessage(false)}
          >
            Undo
          </button>
          <br />
          <button className="text-blue-400 font-semibold hover:underline">
            Learn more
          </button>
        </div>
      )}
      {showShareModal && (
        <ShareModal
          videoUrl={window.location.origin + "/watch/" + video?._id}
          onClose={() => setShowShareModal(false)}
        />
      )}
      <SaveToPlaylistModal
        show={showSaveModal}
        onClose={() => setShowSaveModal(false)}
        videoId={video._id}
      />
    </div>
    </>
  );
};

export default VideoCard;
