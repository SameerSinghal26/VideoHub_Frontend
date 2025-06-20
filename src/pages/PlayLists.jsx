import React from 'react';
import { formatDistanceToNow } from 'date-fns';
import { Link, useNavigate } from 'react-router-dom';
import { usePlaylist } from '../context/PlaylistContext';
import Toast from '../Toast';
import { useSidebar } from "../context/SideBarContext.jsx";
import { useSelector } from 'react-redux';

function PlayLists() {
  const { playlists, loading, error, toast, user, handleDeletePlaylist, handleUpdatePlaylist } = usePlaylist();
  const navigate = useNavigate();
  const { isSidebarOpen } = useSidebar();
  const [showDeleteModal, setShowDeleteModal] = React.useState(false);
  const [playlistToDelete, setPlaylistToDelete] = React.useState(null);
  const [showUpdateModal, setShowUpdateModal] = React.useState(false);
  const [playlistToUpdate, setPlaylistToUpdate] = React.useState(null);
  const [updateForm, setUpdateForm] = React.useState({ name: "", description: "" });
  const auth = useSelector((state) => state.auth);

  // Authentication check
  React.useEffect(() => {
    if (!auth.user) {
      navigate('/login', { state: { error: "Please login to view playlists" } });
      return;
    }
  }, [auth.user, navigate]);

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[100vh] bg-black">
      <img src="/1479.gif" alt="Loading..." className="w-20 h-20" />
    </div>
  );
  if (error) return (
    <div className="flex flex-col items-center justify-center min-h-[100vh] bg-black">
      {toast && <Toast message={toast.msg} />}
      <img src="/1479.gif" alt="Error" className="w-20 h-20" />
      <div className="text-red-500 text-lg mt-2">{error}</div>
    </div>
  );

  return (
    <div
      className={`min-h-screen bg-black px-8 py-12 transition-all duration-300 ease-in-out ${isSidebarOpen ? "ml-[250px]" : "ml-[55px]"} mt-16`}
    >
      {toast && <Toast message={toast.msg} />}
      <h1 className="text-3xl font-bold text-white mb-8">Playlists</h1>
      <div className="flex flex-wrap gap-6">
        {playlists.map((playlist) => (
          <div
            key={playlist._id}
            className=" rounded-xl shadow-lg w-80 overflow-hidden flex flex-col cursor-pointer hover:shadow-2xl transition-shadow duration-200"
            onClick={() => {
              if (playlist.videos && playlist.videos.length > 0) {
                navigate(`/watch/${playlist.videos[0]._id}?playlist=${playlist._id}`);
              }
            }}
          >
            <div className="relative">
              <img
                src={playlist.videos[0]?.thumbnail || "/profile.png"}
                alt={playlist.name}
                className="w-full h-44 object-cover rounded-xl"
              />
              <span className="absolute bottom-1 right-1.5 bg-black text-white text-xs px-2 py-0.5 rounded flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 25 25" strokeWidth={2} stroke="currentColor" className="w-4 h-4 inline-block mr-1"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6A2.25 2.25 0 005.25 5.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15" /><path strokeLinecap="round" strokeLinejoin="round" d="M18 15l3-3m0 0l-3-3m3 3H9" /></svg>
                {playlist.videos.length} videos
              </span>
            </div>
            <div className="p-4 flex-1 flex flex-col justify-between">
              <div>
                <h2 className="text-white text-lg font-semibold mb-1 line-clamp-2">{playlist.name}</h2>
                <div className="text-gray-400 text-xs mb-1 flex items-center gap-2">
                  <img src={playlist.owner?.avatar} alt={playlist.owner?.username} className="w-6 h-6 rounded-full" />
                  {playlist.owner?.username}
                </div>
                <div className="text-gray-400 text-xs mb-2">
                  {playlist.description}
                </div>
                <div className="text-gray-400 text-xs mb-2">
                  Updated {formatDistanceToNow(new Date(playlist.updatedAt), { addSuffix: true })}
                </div>
                <div className="text-gray-400 text-xs mb-2 flex gap-31 p-1">
                <button
                    className="text-blue-500 hover:underline"
                    onClick={e => {
                      e.stopPropagation();
                      setPlaylistToUpdate(playlist._id);
                      setUpdateForm({ name: playlist.name, description: playlist.description });
                      setShowUpdateModal(true);
                    }}
                  >
                    Update Playlist
                  </button>
                  <button
                    className="text-red-500 hover:underline"
                    onClick={e => {
                      e.stopPropagation();
                      console.log(playlist._id);
                      
                      setPlaylistToDelete(playlist._id);
                      setShowDeleteModal(true);
                    }}
                  >
                    Delete Playlist
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      {showDeleteModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-transprent bg-opacity-60">
          <div className="bg-neutral-900 rounded-xl p-8 shadow-2xl text-center w-full max-w-sm">
            <h2 className="text-xl font-bold text-white mb-4">Delete Playlist</h2>
            <p className="text-gray-300 mb-6">
              Are you sure you want to delete this playlist? This action cannot be undone.
            </p>
            <div className="flex justify-center gap-4">
              <button
                className="px-4 py-2 rounded bg-gray-700 text-white hover:bg-gray-600"
                onClick={() => setShowDeleteModal(false)}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700"
                onClick={() => {
                  handleDeletePlaylist(playlistToDelete);
                  setShowDeleteModal(false);
                }}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
      {showUpdateModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-transparent bg-opacity-60">
          <div className="bg-neutral-900 rounded-xl p-8 shadow-2xl text-center w-full max-w-sm">
            <h2 className="text-xl font-bold text-white mb-4">Update Playlist</h2>
            <form
              onSubmit={e => {
                e.preventDefault();
                handleUpdatePlaylist(playlistToUpdate, updateForm);
                setShowUpdateModal(false);
                window.location.reload();
              }}
            >
              <div className="mb-4">
                <input
                  type="text"
                  className="w-full px-3 py-2 rounded bg-gray-800 text-white mb-2"
                  placeholder="Playlist Name"
                  value={updateForm.name}
                  onChange={e => setUpdateForm(f => ({ ...f, name: e.target.value }))}
                  required
                />
                <textarea
                  className="w-full px-3 py-2 rounded bg-gray-800 text-white"
                  placeholder="Description"
                  value={updateForm.description}
                  onChange={e => setUpdateForm(f => ({ ...f, description: e.target.value }))}
                  required
                />
              </div>
              <div className="flex justify-center gap-4">
                <button
                  type="button"
                  className="px-4 py-2 rounded bg-gray-700 text-white hover:bg-gray-600"
                  onClick={() => setShowUpdateModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
                >
                  Update
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default PlayLists;