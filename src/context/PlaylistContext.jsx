import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import {
  getUserPlaylists,
  removeVideoFromPlaylist,
  getPlaylistById,
  deletePlaylist,
  updatePlaylist,
  createPlaylist,
  addVideoToPlaylist,
} from "../utils/api/auth";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import Toast from "../Toast";

const PlaylistContext = createContext();

export const PlaylistProvider = ({ children }) => {
    const user = useSelector((state) => state.auth.user);
    const [playlists, setPlaylists] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [toast, setToast] = useState(null);
    const navigate = useNavigate();
    const [watchLaterPlaylist, setWatchLaterPlaylist] = useState(null);
    
    const showToast = (msg) => {
        setToast({ msg });
        if (msg === "please login or register to continue.") {
            navigate("/login", { state: { error: msg } });
        }
        setTimeout(() => setToast(null), 4000);
    };
    
  const handleRemoveFromPlaylist = async (videoId, playlistId) => {
    try {
      // Make the API call
      await removeVideoFromPlaylist(videoId, playlistId);

      // Fetch the updated playlist from the backend
      const updatedPlaylist = await getPlaylistById(playlistId);

      // Create a new array of playlists with the updated playlist
      const updatedPlaylists = playlists.map((playlist) =>
        playlist._id === playlistId ? updatedPlaylist : playlist
      );

      // Update the state with the new array
      setPlaylists(updatedPlaylists);
      showToast("Video removed from playlist successfully");
    } catch (err) {
      console.error("Error removing video from playlist:", err);
      showToast(err.message || "Failed to remove video from playlist");
    }
  };

  const handleDeletePlaylist = async (playlistId) => {
    try {
      await deletePlaylist(playlistId);
      // Remove the deleted playlist from state
      setPlaylists((prev) => prev.filter((p) => p._id !== playlistId));
      showToast("Playlist deleted successfully");
    } catch (err) {
      console.error("Error deleting playlist:", err);
      showToast(err.message || "Failed to delete playlist");
    }
  };

  const handleUpdatePlaylist = async (playlistId, data) => {
    try {
      await updatePlaylist(playlistId, data);
      // Fetch the updated playlist from the backend
      const updatedPlaylist = await getPlaylistById(playlistId);
      setPlaylists((prev) =>
        prev.map((p) => (p._id === playlistId ? updatedPlaylist : p))
      );
      showToast("Playlist updated successfully");
      setTimeout(() => {
        window.location.reload();
      }, 3000);
    } catch (err) {
      console.error("Error updating playlist:", err);
      showToast(err.message || "Failed to update playlist");
    }
  };

  const handleAddVideoToPlaylist = async (videoId, playlistId) => {
    try {
      await addVideoToPlaylist(videoId, playlistId);
      // Optionally refetch playlists or update state
      fetchPlaylists();
      showToast("Video added to playlist!");
    } catch (err) {
      showToast(err.message || "Failed to add video to playlist");
    }
  };

  const handleCreatePlaylist = async ({ name, description, videoId }) => {
    try {
      const playlist = await createPlaylist({ name, description });
      if (videoId) {
        await addVideoToPlaylist(videoId, playlist._id);
      }
      fetchPlaylists();
      showToast("Playlist created!");
    } catch (err) {
      showToast(err.message || "Failed to create playlist");
    }
  };

  const fetchPlaylists = useCallback(async () => {
    if (!user?._id) {
      setPlaylists([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const response = await getUserPlaylists(user._id);
      // Handle new API structure: response.data is the array
      setPlaylists(response || []);
      setError(null);
    } catch (err) {
      // JWT/unauthorized error handling
      if (
        (typeof err.message === "string" &&
          err.message.includes("jwt expired")) ||
        (typeof err === "string" && err.includes("jwt expired")) ||
        (typeof err.message === "string" &&
          err.message.includes("Unauthorized request")) ||
        (typeof err === "string" && err.includes("Unauthorized request")) ||
        err.status === 401
      ) {
        setError("please login or register to continue.");
        showToast("please login or register to continue.");
      } else {
        setError(err.message || "Failed to fetch playlists.");
        showToast(err.message || "Failed to fetch playlists.");
      }
      setPlaylists([]);
    }
    setLoading(false);
  }, [user, navigate]);

  useEffect(() => {
    fetchPlaylists();
  }, [fetchPlaylists]);

  const value = {
    playlists,
    loading,
    error,
    toast,
    refetchPlaylists: fetchPlaylists,
    user,
    handleRemoveFromPlaylist,
    handleDeletePlaylist,
    handleUpdatePlaylist,
    handleAddVideoToPlaylist,
    handleCreatePlaylist,
    watchLaterPlaylist,
  };

  return (
    <PlaylistContext.Provider value={value}>
      {children}
      {toast && <Toast message={toast.msg} />}
    </PlaylistContext.Provider>
  );
};

export const usePlaylist = () => {
  const context = useContext(PlaylistContext);
  if (!context) {
    throw new Error("usePlaylist must be used within a PlaylistProvider");
  }
  return context;
};
