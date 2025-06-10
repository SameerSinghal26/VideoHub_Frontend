import React, { useState } from "react";
import { usePlaylist } from "../context/PlaylistContext";

const SaveToPlaylistModal = ({
  show,
  onClose,
  videoId,
  onVideoAdded, // optional callback
}) => {
  const { playlists, handleRemoveFromPlaylist, handleAddVideoToPlaylist, handleCreatePlaylist } = usePlaylist();
  const [newPlaylistName, setNewPlaylistName] = useState("");
  const [newPlaylistDesc, setNewPlaylistDesc] = useState("");
  const [creating, setCreating] = useState(false);

  if (!show) return null;

  const handleCheckbox = (playlist, checked) => {
    if (checked) {
      handleAddVideoToPlaylist(videoId, playlist._id);
      if (onVideoAdded) onVideoAdded();
    } else {
      handleRemoveFromPlaylist(videoId, playlist._id);
    }
  };
  

  const handleCreate = async (e) => {
    e.preventDefault();
    await handleCreatePlaylist({ name: newPlaylistName, description: newPlaylistDesc, videoId });
    setNewPlaylistName("");
    setNewPlaylistDesc("");
    setCreating(false);
    if (onVideoAdded) onVideoAdded();
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-transparent bg-opacity-60">
      <div className="bg-neutral-900 rounded-xl p-6 shadow-2xl w-full max-w-xs relative">
        <button
          className="absolute top-2 right-3 text-gray-400 hover:text-white text-xl"
          onClick={onClose}
        >
          &times;
        </button>
        <h2 className="text-lg font-bold text-white mb-4">Save video to...</h2>
        <div className="mb-4">
          {playlists
            .filter(playlist => playlist.name !== "Liked Videos")
            .map((playlist) => (
              <label
                key={playlist._id}
                className="flex items-center gap-2 mb-2 cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={playlist.videos.some((v) => v._id === videoId)}
                  onChange={e => handleCheckbox(playlist, e.target.checked)}
                  className="accent-blue-500"
                />
                <span className="text-white">{playlist.name}</span>
              </label>
            ))}
        </div>
        {creating ? (
          <form onSubmit={handleCreate} className="flex flex-col gap-2 mb-2">
            <input
              type="text"
              className="px-2 py-1 rounded bg-gray-800 text-white"
              placeholder="Playlist name"
              value={newPlaylistName}
              onChange={e => setNewPlaylistName(e.target.value)}
              required
            />
            <input
              type="text"
              className="px-2 py-1 rounded bg-gray-800 text-white"
              placeholder="Description"
              value={newPlaylistDesc}
              onChange={e => setNewPlaylistDesc(e.target.value)}
              required
            />
            <div className="flex gap-2">
              <button
                type="button"
                className="flex-1 px-2 py-1 rounded bg-gray-700 text-white"
                onClick={() => setCreating(false)}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 px-2 py-1 rounded bg-blue-600 text-white"
              >
                Create
              </button>
            </div>
          </form>
        ) : (
          <button
            className="w-full py-2 mt-2 rounded bg-neutral-800 text-white flex items-center justify-center gap-2"
            onClick={() => setCreating(true)}
          >
            <span className="text-xl">+</span> New playlist
          </button>
        )}
      </div>
    </div>
  );
};

export default SaveToPlaylistModal;
