import { useRef, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { MoreVertical } from "lucide-react";
import { useSidebar } from "../context/SideBarContext.jsx";
import ShareModal from "./ShareModal";
import SaveToPlaylistModal from "../components/SaveToPlaylistModal";
import { usePlaylist } from "../context/PlaylistContext";

const WatchVideoCard = ({
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
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [showBlockMessage, setShowBlockMessage] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.round(seconds % 60);
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  const timeAgo = (dateStr) => {
    const seconds = Math.floor((new Date() - new Date(dateStr)) / 1000);
    const times = [
      [31536000, "year"],
      [2592000, "month"],
      [604800, "week"],
      [86400, "day"],
      [3600, "hour"],
      [60, "min"],
      [1, "sec"],
    ];

    for (const [s, name] of times) {
      const value = Math.floor(seconds / s);
      if (value) return `${value} ${name}${value > 1 ? "s" : ""} ago`;
    }

    return "just now";
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
  <div className={`text-white p-2 hover:bg-neutral-900 rounded-lg transition-all ${isSidebarOpen ? "mr-1" : "mr-3"}`}>
      <div className="flex">
    
    {/* Thumbnail and title wrapped in Link */}
    <Link 
      to={`/watch/${video?._id}`} 
      className="flex gap-2 flex-1 overflow-hidden"
      onClick={(e) => {
        e.preventDefault();
        window.location.href = `/watch/${video?._id}`;
      }}
    >
      {/* Thumbnail */}
      <div className={`relative ${isSidebarOpen ? "w-[200px]" : "w-[210px]"} min-w-[168px] h-[120px] rounded-lg overflow-hidden`}>
        <img
          src={video?.thumbnail}
          alt={video?.title}
          className="w-full h-full object-cover"
        />
        <span className="absolute bottom-1 right-1 bg-black bg-opacity-70 text-white text-xs px-1.5 py-0.5 rounded">
          {formatDuration(video.duration)}
        </span>
      </div>

      {/* Right side (title + metadata) */}
      <div className="flex-1 flex flex-col justify-between overflow-hidden">
        <h2 className="text-md font-bold leading-snug line-clamp-2 pr-2 pt-1">
          {video.title}
        </h2>
        <p className="text-sm text-gray-400 flex items-center">
          {video.owner?.username}
        </p>
          {new Date() - new Date(video.createdAt) < 86400000 && (
            <span className="bg-gray-700 text-white text-[10px] px-2 py-0.5 rounded uppercase w-10">
              New
            </span>
          )}
        <div className="text-sm text-gray-500 flex items-center gap-3">
          <span>{video.view} views</span>
          <span>•</span>
          <span>{timeAgo(video.createdAt)}</span>
        </div>
      </div>
    </Link>

    {/* Menu button (outside Link!) */}
    <div>
    <button ref={iconRef} onClick={toggleMenu} className="rounded-3xl p-1.5 hover:bg-neutral-950">
      <MoreVertical
        className="text-gray-400 hover:text-white cursor-pointer"
        size={20}
      />
    </button>
    </div>
  </div>

      {/* Dropdown menu */}
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
          className="hover:bg-neutral-800 px-4 py-2 cursor-pointer flex items-center gap-3">
            ⏰ <span>Save to Watch Later</span>
          </div>
          <div onClick={() => setShowSaveModal(true)} className="hover:bg-neutral-800 px-4 py-2 cursor-pointer flex items-center gap-3">
            📑 <span>Save to playlist</span>
          </div>
          <div className="hover:bg-neutral-800 px-4 py-2 cursor-pointer flex items-center gap-3" onClick={() => setShowShareModal(true)}>
            🔗 <span>Share</span>
          </div>
          <hr className="border-neutral-700 my-1" />
          <div className="hover:bg-neutral-800 px-4 py-2 cursor-pointer flex items-center gap-3">
            🚫 <span>Not interested</span>
          </div>
          <div
            className="hover:bg-neutral-800 px-4 py-2 cursor-pointer flex items-center gap-3"
            onClick={() => {
              setShowBlockMessage(true);
              setActiveMenuId(null);
            }}
          >
            ❌ <span>Don't recommend channel</span>
          </div>
          <div className="hover:bg-neutral-800 px-4 py-2 cursor-pointer flex items-center gap-3">
            🚩 <span>Report</span>
          </div>
        </div>
      )}

      {/* Block message */}
      {showBlockMessage && (
        <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-neutral-900 text-white border border-neutral-700 rounded-xl shadow-lg p-6 text-center z-[10000]">
          <p className="mb-4">
            We won't recommend videos from this channel to you again
          </p>
          <button
            className="text-blue-400 font-semibold hover:underline block mb-2"
            onClick={() => setShowBlockMessage(false)}
          >
            Undo
          </button>
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
  );
};

export default WatchVideoCard;
