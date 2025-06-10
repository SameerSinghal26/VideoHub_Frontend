import { useRef, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { MoreVertical } from "lucide-react";
import { useSidebar } from "../context/SideBarContext.jsx";
import ShareModal from "./ShareModal";
import SaveToPlaylistModal from "../components/SaveToPlaylistModal";
import { usePlaylist } from "../context/PlaylistContext";

const VideoCardList = ({
  video,
  activeMenuId,
  setActiveMenuId,
  menuPosition,
  setMenuPosition,
  showImage = true,
  hideMenu = false,
}) => {
  const { isSidebarOpen } = useSidebar();
  const iconRef = useRef(null);
  const menuRef = useRef(null);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [showBlockMessage, setShowBlockMessage] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const { handleAddVideoToPlaylist, playlists, handleCreatePlaylist } = usePlaylist();
  const isOpen = activeMenuId === video._id;
  const toggleMenu = () => {
    if (isOpen) {
      setActiveMenuId(null);
    } else {
      if (iconRef.current) {
        const rect = iconRef.current.getBoundingClientRect();
        setMenuPosition({ top: rect.bottom - 5, left: rect.left - 230 });
      }
      setActiveMenuId(video._id);
    }
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
  }, [setActiveMenuId]);

  const formatDuration = (seconds) => {
    if (!seconds && seconds !== 0) return "";
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

  return (
    <div
      className={`flex flex-col rounded-lg mb-2 ${isSidebarOpen ? "px-12 py-2" : "px-15 py-5"}`}
    >
      {/* Channel info and menu */}
      <div className="flex items-center justify-between mb-2">
        {showImage && (
        <Link
          to={`/@${video.owner?.username}`}
          className="flex items-center gap-3"
        >
            <img
              src={video.owner?.avatar || "/download.webp"}
              alt={video.owner?.username}
              className="w-12 h-12 rounded-full object-full"
            />
          <span className="text-white font-semibold text-lg ">
            {video.owner?.username}
          </span>
        </Link>
          )}
        {/* Menu (optional, add your menu here) */}
        {!hideMenu && (
          <div>
            <button
              ref={iconRef}
              onClick={toggleMenu}
              className="rounded-3xl p-1.5 hover:bg-neutral-950"
              aria-label="More options"
            >
              <MoreVertical size={20} className="text-gray-400 hover:text-white cursor-pointer"/>
            </button>
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
              <div onClick={() => {
                  setActiveMenuId(null); // Close menu first
                  setShowSaveModal(true);
                }} className="hover:bg-neutral-800 px-4 py-2 cursor-pointer flex items-center gap-3">
                📑 <span>Save to playlist</span>
              </div>
              <div onClick={() => {
                  setActiveMenuId(null); // Close menu first
                  setShowShareModal(true);
                }} className="hover:bg-neutral-800 px-4 py-2 cursor-pointer flex items-center gap-3">
                🔗 <span>Share</span>
              </div>
              <hr className="border-neutral-700 my-1" />
              <div onClick={() => {
                  setShowBlockMessage(true);
                  setActiveMenuId(null); // Close menu
                }}
                className="hover:bg-neutral-800 px-4 py-2 cursor-pointer flex items-center gap-3">
                🚫 <span>Not interested</span>
              </div>
            </div>
            )}
          </div>
        )}
      </div>
      {/* Video info */}
      <div className="flex gap-4 relative">
        <Link
          to={`/watch/${video?._id}  `}
          onClick={(e) => {
            e.preventDefault();
            window.location.href = `/watch/${video?._id}`;
          }}
        >
            <div className="relative">
          <img
            src={video.thumbnail}
            alt={video.title}
            className="w-72 h-40 object-cover rounded-lg"
          />
          <span className="absolute bottom-2 right-2 bg-black bg-opacity-75 text-white text-xs px-1.5 py-0.5 rounded">
            {formatDuration(video.duration)}
          </span>
          </div>
        </Link>
        <div className="flex flex-col justify-between flex-1">
          <div>
            <Link to={`/watch/${video._id}`}>
              <h2 className="text-white text-xl font-semibold mb-1">
                {video.title}
              </h2>
            </Link>
            <p className="text-gray-400 text-sm mb-1">
              {video.owner?.username || "Unknown Channel"} • {video.view ?? 0}{" "}
              views •{" "}
              {timeAgo(video.createdAt)}
            </p>
            <p className="text-gray-300 mt-2 line-clamp-2">
              {video.description}
            </p>
          </div>
        </div>
      </div>
      <hr className="my-5 mb-0 border-zinc-700" />

      {showBlockMessage && (
        <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-neutral-900 text-white border border-neutral-700 rounded-xl shadow-lg p-6 text-center z-[10000]">
          <p className="mb-4">
            We won't recommend this video to you again
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
      <SaveToPlaylistModal
        show={showSaveModal}
        onClose={() => setShowSaveModal(false)}
        videoId={video._id}
      />
      {showShareModal && (
        <ShareModal
          videoUrl={window.location.origin + "/watch/" + video?._id}
          onClose={() => setShowShareModal(false)}
        />
      )}
    </div>
  );
};

export default VideoCardList;
