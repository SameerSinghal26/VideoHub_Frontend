import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MoreVertical } from 'lucide-react';
import { createPortal } from 'react-dom';
import { usePlaylist } from '../context/PlaylistContext';
import Toast from '../Toast';
import { useSidebar } from '../context/SideBarContext';
import SaveToPlaylistModal from './SaveToPlaylistModal';
import ShareModal from './ShareModal';

const PlaylistSidebar = ({ playlist, currentVideoId }) => {
  const { isSidebarOpen } = useSidebar();
  const { handleRemoveFromPlaylist, handleAddVideoToPlaylist, playlists, handleCreatePlaylist } = usePlaylist();
  const [activeMenuId, setActiveMenuId] = useState(null);
  const [hoveredId, setHoveredId] = useState(null);
  const menuRef = useRef(null);
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });
  const [toast, setToast] = useState(null);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState(null);

  const handleMenuClick = (e, videoId) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (activeMenuId === videoId) {
      setActiveMenuId(null);
      return;
    }

    const rect = e.currentTarget.getBoundingClientRect();
    setMenuPosition({
      top: rect.bottom + window.scrollY,
      left: rect.right - 220 + window.scrollX,
    });
    setActiveMenuId(videoId);
  };

  const handleRemoveVideo = (videoId) => {
    if (!videoId || !playlist?._id) {
      setToast('Missing video ID or playlist ID!');
      return;
    }
    handleRemoveFromPlaylist(videoId, playlist._id);
    setActiveMenuId(null);
  };

  // Close menu on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setActiveMenuId(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!playlist) return null;

  const handleWatchLater = async (video) => {
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
    <div className="bg-neutral-900 rounded-xl p-2 w-full max-w-md">
      <div className="font-bold text-lg text-white mb-2">{playlist.name}</div>
      <div className="text-xs text-gray-400 mb-2">{playlist.owner?.username} • {playlist.videos.length} videos</div>
      <div className="overflow-y-auto max-h-[100vh] gap-5">
        {playlist.videos.map((video, idx) => (
          <div
            key={video._id}
            className={`relative flex items-center mb-1 rounded group cursor-pointer
              ${video._id === currentVideoId ? 'bg-[#281A0B]' : ''}
              ${hoveredId === video._id && video._id !== currentVideoId ? 'bg-neutral-800' : ''}
            `}
            onMouseEnter={() => setHoveredId(video._id)}
            onMouseLeave={() => setHoveredId(null)}
          >
            <Link
              to={`/watch/${video._id}?playlist=${playlist._id}`}
              className="flex items-center gap-3 p-2 flex-1 min-w-0"
              style={{ zIndex: 1 }}
            >
              <div className="text-xs text-gray-400">{idx + 1}</div>
              <img src={video.thumbnail} alt={video.title} className="w-30 h-16 object-cover rounded" />
              <div className="min-w-0">
                <div className="text-white text-sm font-semibold line-clamp-1">{video.title}</div>
                <div className="text-xs text-gray-400">{video.owner?.username}</div>
              </div>
            </Link>
            {/* Menu Button - only show on hover */}
            {hoveredId === video._id && (
              <button
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-neutral-800 z-10"
                onClick={(e) => {
                  setSelectedVideo(video);
                  handleMenuClick(e, video._id);
                }}
              >
                <MoreVertical size={18} className="text-gray-400" />
              </button>
            )}
            {/* Dropdown Menu */}
            {activeMenuId === video._id && createPortal(
              <div
                ref={menuRef}
                className="fixed z-[9999] w-56 bg-neutral-900 text-white rounded-xl shadow-xl border border-neutral-800"
                style={{
                  top: menuPosition.top,
                  left: menuPosition.left,
                }}
              >
                <div onClick={() => handleWatchLater(video)} className="hover:bg-neutral-800 px-4 py-2 cursor-pointer flex items-center gap-3">
                  ⏰ <span>Save to Watch Later</span>
                </div>
                <div onClick={() => {
                  setSelectedVideo(video);
                  setShowSaveModal(true);
                }} className="hover:bg-neutral-800 px-4 py-2 cursor-pointer flex items-center gap-3">
                  📑 <span>Save to playlist</span>
                </div>
                <div className="hover:bg-neutral-800 px-4 py-2 cursor-pointer flex items-center gap-3">
                  ⬇️ <span>Download</span>
                </div>
                <div onClick={() => {
                  setSelectedVideo(video);
                  setActiveMenuId(null); // Close menu first
                  setShowShareModal(true);
                }}
                className="hover:bg-neutral-800 px-4 py-2 cursor-pointer flex items-center gap-3">
                  🔗 <span>Share</span>
                </div>
                <hr className="border-neutral-700 my-1" />
                <div 
                  className="hover:bg-neutral-800 px-4 py-2 cursor-pointer flex items-center gap-3 text-red-400"
                  onClick={() => handleRemoveVideo(video._id)}
                >
                  🗑️ <span>Remove from Playlist</span>
                </div>
              </div>,
              document.body
            )}
          </div>
        ))}
      </div>
      <SaveToPlaylistModal
        show={showSaveModal}
        onClose={() => setShowSaveModal(false)}
        videoId={selectedVideo?._id}
      />
      {showShareModal && selectedVideo && (
        <ShareModal
          videoUrl={window.location.origin + "/watch/" + selectedVideo._id}
          onClose={() => setShowShareModal(false)}
        />
      )}
    </div>
  );
};

export default PlaylistSidebar;
