import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import VideoCardList from '../components/VideoCardList';
import { deleteVideo, fetchAllPublicVideos } from '../utils/api/auth';
import { useSidebar } from '../context/SideBarContext.jsx';
import { logout } from '../redux/Slice/authSlice';
import { useNavigate } from 'react-router-dom';
import { usePlaylist } from '../context/PlaylistContext';
import Toast from '../Toast';
import { useTweet } from '../context/TweetContext';
import Tweet from '../components/Tweet';

const UserVideos = () => {
  const user = useSelector((state) => state.auth.user);
  const [allVideos, setAllVideos] = useState([]);
  const [userVideos, setUserVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeMenuId, setActiveMenuId] = useState(null);
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });
  const [activeTab, setActiveTab] = useState('playlists');
  const [showTweetUpdateModal, setShowTweetUpdateModal] = useState(false);
  const [tweetToUpdate, setTweetToUpdate] = useState(null);
  const [tweetUpdateForm, setTweetUpdateForm] = useState({ content: '' });
  const [tweetData, setTweetData] = useState(null);

  const { isSidebarOpen } = useSidebar();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const {
    playlists,
    loading: playlistsLoading,
    error,
    toast,
    handleDeletePlaylist,
    handleUpdatePlaylist,
  } = usePlaylist();
  const { tweets, loading: tweetsLoading, fetchUserTweets, handleReactToTweet, handleVoteInPoll, handleDeleteTweet } = useTweet();
  

  // Modal state for playlist update/delete
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [playlistToDelete, setPlaylistToDelete] = useState(null);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [playlistToUpdate, setPlaylistToUpdate] = useState(null);
  const [updateForm, setUpdateForm] = useState({ name: "", description: "" });

  // Authentication check
  useEffect(() => {
    if (!user) {
      navigate('/login', { state: { error: "Please login to view your videos" } });
      return;
    }
  }, [user, navigate]);

  // Fetch user tweets when tab is selected
  useEffect(() => {
    if (activeTab === 'tweets' && user?._id) {
      fetchUserTweets(user._id);
    }
  }, [activeTab, user, fetchUserTweets]);

  useEffect(() => {
    if (!user?._id) return;
    setLoading(true);

    // Fetch all videos
    fetchAllPublicVideos()
      .then((videosData) => {
        setAllVideos(videosData || []);

        // Filter videos for current user
        const userVideosList = (videosData || []).filter(
          video => video.owner._id === user._id
        );
        setUserVideos(userVideosList);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching videos:", error);
        setLoading(false);
      });
  }, [user]);

  const handleDeleteVideo = async (videoId) => {
    await deleteVideo(videoId);
    setUserVideos(userVideos.filter(video => video._id !== videoId));
    // Show toast
    if (typeof setToast === "function") setToast({ msg: "Video deleted successfully" });
  };

  const handleSwitchAccount = async () => {
    await dispatch(logout());
    navigate('/login');
  };

  // New state for video delete
  const [showVideoDeleteModal, setShowVideoDeleteModal] = useState(false);
  const [videoToDelete, setVideoToDelete] = useState(null);

  if (!user || loading) {
    return <div className="flex flex-col items-center justify-center min-h-[100vh] bg-black">
      <img src="/1479.gif" alt="Loading..." className="w-20 h-20" />
    </div>;
  }
  
  return (
    <div
      className={`bg-black min-h-screen transition-all duration-700 ease-in-out ${
        isSidebarOpen ? "ml-[200px]" : "ml-[50px]"
      } mt-24`}
    >
      {/* Header */}
      <div className={`flex items-center gap-6 py-1 ${isSidebarOpen ? "pl-30" : "pl-60"}`}>
        {/* Avatar */}
        <img
          src={user.avatar || "/download.webp"}
          alt={user.username}
          className="w-30 h-30 rounded-full object-cover border-4 border-neutral-800 shadow-lg"
        />
        {/* User Info */}
        <div className="flex flex-col">
          <div className="flex items-center">
            <h1 className="text-3xl font-bold text-white">{user.fullName}</h1>
          </div>
          <div className="flex items-center gap-2 mt-2">
            <span className="text-gray-400 text-xl">@{user.username}</span>
            <span className="text-gray-400 text-xl">·</span>
            <a
              href={`/@${user.username}`}
              className="text-blue-400 hover:underline text-sm"
            >
              View channel
            </a>
          </div>
          <div className="flex mt-2">
            <button
              className="bg-neutral-800 text-white px-4 py-1.5 rounded-full font-semibold flex items-center gap-1 hover:bg-neutral-700 transition"
              onClick={handleSwitchAccount}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V4a2 2 0 10-4 0v1.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path></svg>
              Switch account
            </button>
            {/* <button className="bg-neutral-800 text-white px-5 py-2 rounded-full font-semibold flex items-center gap-2 hover:bg-neutral-700 transition">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M21.35 11.1l-9-9a1 1 0 00-1.42 0l-9 9a1 1 0 001.42 1.42L4 12.41V20a2 2 0 002 2h3a1 1 0 001-1v-4h2v4a1 1 0 001 1h3a2 2 0 002-2v-7.59l1.29 1.29a1 1 0 001.42-1.42z"></path></svg>
              Google Account
            </button> */}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className={`flex gap-8 border-b border-neutral-800 mt-6 ${isSidebarOpen ? "ml-20" : "ml-40"}`}>
        <button
          className={`px-2 pb-2 text-lg font-semibold transition relative ${
            activeTab === 'playlists'
              ? 'text-white'
              : 'text-gray-400 hover:text-white'
          }`}
          onClick={() => setActiveTab('playlists')}
        >
          Playlists
          {activeTab === 'playlists' && (
            <span className="absolute left-0 right-0 -bottom-[2px] h-[3px] bg-white rounded-full"></span>
          )}
        </button>
        <button
          className={`px-2 pb-2 text-lg font-semibold transition relative ${
            activeTab === 'videos'
              ? 'text-white'
              : 'text-gray-400 hover:text-white'
          }`}
          onClick={() => setActiveTab('videos')}
        >
          Videos
          {activeTab === 'videos' && (
            <span className="absolute left-0 right-0 -bottom-[2px] h-[3px] bg-white rounded-full"></span>
          )}
        </button>
        <button
          className={`px-2 pb-2 text-lg font-semibold transition relative ${
            activeTab === 'tweets'
              ? 'text-white'
              : 'text-gray-400 hover:text-white'
          }`}
          onClick={() => setActiveTab('tweets')}
        >
          Tweets
          {activeTab === 'tweets' && (
            <span className="absolute left-0 right-0 -bottom-[2px] h-[3px] bg-white rounded-full"></span>
          )}
        </button>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-4 py-6">
          {activeTab === 'playlists' && (
          playlistsLoading ? (
            <div className="flex flex-col items-center justify-center min-h-[100vh] bg-black">
              <img src="/1479.gif" alt="Loading..." className="w-20 h-20" />
            </div>
          ) : playlists.length === 0 ? (
            <div className="text-white text-center py-8">
              <p className="text-xl mb-2">No playlists yet</p>
              <p className="text-gray-400">Create a playlist to get started!</p>
            </div>
          ) : (
            <div className="flex flex-wrap gap-6">
              {playlists.map((playlist) => (
                <div
                  key={playlist._id}
                  className="rounded-xl shadow-lg w-80 overflow-hidden flex flex-col cursor-pointer hover:shadow-2xl transition-shadow duration-200 hover:bg-neutral-900"
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
                        <img src={playlist.owner?.avatar || "/download.webp"} alt={playlist.owner?.username} className="w-6 h-6 rounded-full" />
                        {playlist.owner?.username}
                      </div>
                      <div className="text-gray-400 text-xs mb-2">
                        {playlist.description}
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
          )
        )}

        {activeTab === 'videos' && (
          userVideos.length === 0 ? (
            <div className="text-white text-center py-8">
              <p className="text-xl mb-2">No videos uploaded yet</p>
              <p className="text-gray-400">Upload your first video to get started!</p>
            </div>
          ) : (
            <div className="">
              {userVideos.map((video) => (
                <div
                  key={video._id}
                  className="relative group"
                >
                  <VideoCardList
                    video={video}
                    activeMenuId={activeMenuId}
                    setActiveMenuId={setActiveMenuId}
                    menuPosition={menuPosition}
                    setMenuPosition={setMenuPosition}
                    showImage={false}
                    hideMenu={true}
                  />
                  {video.owner._id === user._id && (
                    <button
                      onClick={() => {
                        setVideoToDelete(video._id);
                        setShowVideoDeleteModal(true);
                      }}
                      className="absolute bottom-8 right-14 bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                    >
                      Delete
                    </button>
                  )}
                </div>
              ))}
            </div>
          )
        )}

        {activeTab === 'tweets' && (
          tweetsLoading ? (
            <div className="flex flex-col items-center justify-center min-h-[100vh] bg-black">
              <img src="/1479.gif" alt="Loading..." className="w-20 h-20" />
            </div>
          ) : !tweets || tweets.length === 0 ? (
            <div className="text-white text-center py-8">
              <p className="text-xl mb-2">No tweets yet</p>
              <p className="text-gray-400">Post your first tweet to get started!</p>
            </div>
          ) : (
            <div className="flex flex-col gap-4 w-126 ml-80">
              {tweets.map((tweet) => (
                <div
                  key={tweet._id}
                  className="relative group"
                  onMouseEnter={() => setActiveMenuId(tweet._id)}
                  onMouseLeave={() => setActiveMenuId(null)}
                >
                  <Tweet
                    tweet={tweet}
                    onReact={handleReactToTweet}
                    onVote={handleVoteInPoll}
                    onDelete={handleDeleteTweet}
                  />
                  {/* Show update/delete only for own tweets on hover */}
                  {activeMenuId === tweet._id && tweet.ownerDetails?._id === user._id && (
                    <div className="absolute top-2 right-4 flex gap-2 z-10">
                      <button
                        className="px-3 py-1 rounded bg-blue-600 text-white hover:bg-blue-700 text-sm"
                        onClick={() => {
                          setTweetToUpdate(tweet._id);
                          setTweetUpdateForm({ content: tweet.content });
                          setShowTweetUpdateModal(true);
                        }}
                      >
                        Update
                      </button>
                      <button
                        className="px-3 py-1 rounded bg-red-600 text-white hover:bg-red-700 text-sm"
                        onClick={() => handleDeleteTweet(tweet._id)}
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )
        )}
      </div>

      {/* Modals */}
      {showDeleteModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-transparent bg-opacity-60">
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
      {showTweetUpdateModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-60">
          <div className="bg-neutral-900 rounded-xl p-8 shadow-2xl text-center w-full max-w-sm">
            <h2 className="text-xl font-bold text-white mb-4">Update Tweet</h2>
            <form
              onSubmit={async e => {
                e.preventDefault();
                await handleUpdateTweet(tweetToUpdate, tweetUpdateForm);
                setShowTweetUpdateModal(false);
              }}
            >
              <textarea
                className="w-full px-3 py-2 rounded bg-gray-800 text-white mb-4"
                placeholder="What's happening?"
                value={tweetUpdateForm.content}
                onChange={e => setTweetUpdateForm(f => ({ ...f, content: e.target.value }))}
                required
              />
              <div className="flex justify-center gap-4">
                <button
                  type="button"
                  className="px-4 py-2 rounded bg-gray-700 text-white hover:bg-gray-600"
                  onClick={() => setShowTweetUpdateModal(false)}
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
      {showVideoDeleteModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-transparent bg-opacity-60">
          <div className="bg-neutral-900 rounded-xl p-8 shadow-2xl text-center w-full max-w-sm">
            <h2 className="text-xl font-bold text-white mb-4">Delete Video</h2>
            <p className="text-gray-300 mb-6">
              Are you sure you want to delete this video? This action cannot be undone.
            </p>
            <div className="flex justify-center gap-4">
              <button
                className="px-4 py-2 rounded bg-gray-700 text-white hover:bg-gray-600"
                onClick={() => setShowVideoDeleteModal(false)}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700"
                onClick={async () => {
                  await handleDeleteVideo(videoToDelete);
                  setShowVideoDeleteModal(false);
                }}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
      {toast && <Toast message={toast.msg} />}
    </div>
  );
};

export default UserVideos;