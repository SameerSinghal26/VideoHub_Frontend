import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getUserChannelProfile, fetchUserAllVideos, getUserPlaylists, getUserTweets, updateUserAvatar, updateUserCoverImage } from "../utils/api/auth";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { useSidebar } from "../context/SideBarContext.jsx";
import VideoCardList from '../components/VideoCardList';
import { usePlaylist } from '../context/PlaylistContext';
import { useTweet } from '../context/TweetContext';
import { useSubscription } from '../context/SubscriptionContext';
import Tweet from '../components/Tweet';
import Toast from '../Toast';

function Dashboard() {
  const { username } = useParams();
  const navigate = useNavigate();
  const [channelData, setChannelData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useSelector((state) => state.auth);
  const { isSidebarOpen } = useSidebar();
  const [activeTab, setActiveTab] = useState('videos');
  const [userVideos, setUserVideos] = useState([]);
  const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });
  const [activeMenuId, setActiveMenuId] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [playlistToDelete, setPlaylistToDelete] = useState(null);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [playlistToUpdate, setPlaylistToUpdate] = useState(null);
  const [updateForm, setUpdateForm] = useState({ name: "", description: "" });
  const [showTweetUpdateModal, setShowTweetUpdateModal] = useState(false);
  const [tweetToUpdate, setTweetToUpdate] = useState(null);
  const [tweetUpdateForm, setTweetUpdateForm] = useState({ content: '' });
  const [toast, setToast] = useState(null);
  const [showImageChangeModal, setShowImageChangeModal] = useState(false);
  const [imageType, setImageType] = useState(null); // 'avatar' or 'cover'
  const [selectedFile, setSelectedFile] = useState(null);
  const fileInputRef = useRef(null);

  const { 
    playlists, 
    loading: playlistsLoading, 
    error: playlistError,
    toast: playlistToast,
    handleDeletePlaylist, 
    handleUpdatePlaylist 
  } = usePlaylist();

  const { 
    tweets, 
    loading: tweetsLoading, 
    error: tweetError,
    toast: tweetToast,
    fetchUserTweets, 
    handleReactToTweet, 
    handleVoteInPoll, 
    handleDeleteTweet,
    handleUpdateTweet 
  } = useTweet();

  const { 
    subscribersCount,
    isSubscribed,
    loadingSubscription,
    handleToggleSubscription,
    fetchSubscriptionData
  } = useSubscription();

  const showToast = (msg) => {
    setToast({ msg });
    setTimeout(() => setToast(null), 4000);
  };

  const handleApiError = (error) => {
    console.error("API Error:", error);
    if (error.response) {
      if (error.response.status === 401 || error.message?.includes('Unauthorized request')) {
        showToast("Please login to view channel");
        navigate("/login", { state: { error: "Please login to view channel" } });
        return;
      } else {
        const errorMessage = error.response.data?.message || "Something went wrong";
        showToast(errorMessage);
      }
    } else if (error.request) {
      showToast("No response from server. Please check your internet connection.");
    } else {
      showToast("An unexpected error occurred");
    }
  };

  const handleImageDoubleClick = (type) => {
    if (user?.username === channelData?.username) {
      setImageType(type);
      setShowImageChangeModal(true);
    }
  };

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleImageUpload = async () => {
    if (!selectedFile) return;

    const formData = new FormData();
    formData.append('avatar', selectedFile);

    try {
      let response;
      if (imageType === 'avatar') {
        response = await updateUserAvatar(formData);
      } else {
        formData.delete('avatar');
        formData.append('coverImage', selectedFile);
        response = await updateUserCoverImage(formData);
      }
      
      if (response) {
        // Refresh channel data
        const cleanUsername = username.startsWith('@') ? username.slice(1) : username;
        const data = await getUserChannelProfile(cleanUsername);
        setChannelData(data);
        
        showToast("Image updated successfully");
      } else {
        throw new Error("Failed to update image");
      }
    } catch (error) {
      console.error("Error updating image:", error);
      showToast(error.message || "Failed to update image");
    } finally {
      setShowImageChangeModal(false);
      setSelectedFile(null);
      setImageType(null);
    }
  };

  useEffect(() => {
    const fetchChannelData = async () => {
      try {
        setLoading(true);
        setError(null);
        const cleanUsername = username.startsWith('@') ? username.slice(1) : username;
        
        // Fetch channel profile
        const data = await getUserChannelProfile(cleanUsername);
        if (!data) {
          throw new Error("Channel not found");
        }
        setChannelData(data);
        
        // Fetch user videos
        try {
          const response = await fetchUserAllVideos(data._id);
          setUserVideos(response.videos || []);
        } catch (videoError) {
          console.error("Error fetching videos:", videoError);
          if (videoError.message?.includes('Unauthorized')) {
            handleApiError(videoError);
            return;
          }
          setUserVideos([]);
        }

        // Fetch subscription data
        try {
          await fetchSubscriptionData(data._id);
        } catch (subError) {
          console.error("Error fetching subscription data:", subError);
          if (subError.message?.includes('Unauthorized')) {
            handleApiError(subError);
            return;
          }
        }
      } catch (err) {
        console.error("Error fetching channel data:", err);
        if (err.message?.includes('Unauthorized')) {
          handleApiError(err);
          return;
        }
        setError(err.message);
        if (err.message.includes('not found')) {
          navigate('/');
        }
      } finally {
        setLoading(false);
      }
    };

    if (username) {
      fetchChannelData();
    } else {
      setLoading(false);
    }
  }, [username, navigate]);

  // Fetch user tweets when tab is selected
  useEffect(() => {
    if (activeTab === 'tweets' && channelData?._id) {
      fetchUserTweets(channelData._id);
    }
  }, [activeTab, channelData, fetchUserTweets]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[100vh] bg-black">
        <img src="/1479.gif" alt="Loading..." className="w-20 h-20" />
        <p className="text-white mt-4">Loading channel data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center">
        <p className="text-red-500 mb-4">Error: {error}</p>
        <button 
          onClick={() => navigate('/')}
          className="px-4 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700"
        >
          Go Home
        </button>
      </div>
    );
  }

  if (!channelData) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center">
        <p className="text-white mb-4">Channel not found</p>
        <button 
          onClick={() => navigate('/')}
          className="px-4 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700"
        >
          Go Home
        </button>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-black text-white p-4 mt-22 ${isSidebarOpen ? 'ml-60' : 'ml-20'}`}>
      <div className="max-w-6xl mx-auto">
        {/* Cover Image */}
        <div 
          className="w-full h-40 bg-gray-800 rounded-lg overflow-hidden mb-4"
          onDoubleClick={() => handleImageDoubleClick('cover')}
        >
          <img 
            src={channelData.coverImage || "/DeafultBanner.png"} 
            alt="cover"
            className="w-full h-full object-cover"
          />
        </div>

        {/* Profile Section */}
        <div className="flex items-start gap-6">
          <div onDoubleClick={() => handleImageDoubleClick('avatar')}>
            <img
              src={channelData.avatar || "/download.webp"}
              alt={channelData.username}
              className="w-36 h-36 rounded-full border-4 border-black -mt-10"
            />
          </div>
          <div className="flex-1">
            <h1 className="text-3xl font-bold">{channelData.fullName}</h1>
            <div className="flex items-center gap-2">
              <Link to={`/@${channelData.username}`}><p className="text-white font-semibold">@{channelData.username}</p></Link>
              <span className="text-gray-400">•</span>
              <p className="text-gray-400">{userVideos.length} videos</p>
            </div>
            <p className="mt-2">{channelData.bio}</p>
            <div className="mt-4 flex items-center gap-4">
              <p className="text-gray-400">{subscribersCount} subscribers</p>
              {user && channelData._id !== user._id && (
                <button
                  onClick={() => handleToggleSubscription(channelData._id)}
                  disabled={loadingSubscription}
                  className={`px-4 py-2 rounded-full font-semibold ${
                    isSubscribed 
                      ? 'bg-gray-700 hover:bg-gray-600' 
                      : 'bg-red-600 hover:bg-red-700'
                  } transition-colors duration-200`}
                >
                  {loadingSubscription ? (
                    <span className="flex items-center gap-2">
                      <img src="/1479.gif" alt="Loading..." className="w-4 h-4" />
                      Loading...
                    </span>
                  ) : isSubscribed ? (
                    'Subscribed'
                  ) : (
                    'Subscribe'
                  )}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Tabs Section */}
        <div className="mt-8 border-b border-gray-700">
          <div className="flex space-x-8">
            <button
              onClick={() => setActiveTab('playlists')}
              className={`pb-2 px-2 text-lg font-semibold transition relative ${
                activeTab === 'playlists'
                  ? 'text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Playlists
              {activeTab === 'playlists' && (
                <span className="absolute left-0 right-0 -bottom-[2px] h-[3px] bg-white rounded-full"></span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('videos')}
              className={`pb-2 px-2 text-lg font-semibold transition relative ${
                activeTab === 'videos'
                  ? 'text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Videos
              {activeTab === 'videos' && (
                <span className="absolute left-0 right-0 -bottom-[2px] h-[3px] bg-white rounded-full"></span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('tweets')}
              className={`pb-2 px-2 text-lg font-semibold transition relative ${
                activeTab === 'tweets'
                  ? 'text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Tweets
              {activeTab === 'tweets' && (
                <span className="absolute left-0 right-0 -bottom-[2px] h-[3px] bg-white rounded-full"></span>
              )}
            </button>
          </div>
        </div>

        {/* Tab Content */}
        <div className="mt-6">
          {activeTab === 'videos' && (
            !userVideos || userVideos.length === 0 ? (
              <div className="text-white text-center py-8">
                <p className="text-xl mb-2">No videos uploaded yet</p>
                <p className="text-gray-400">Upload your first video to get started!</p>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
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
                  </div>
                ))}
              </div>
            )
          )}

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
                    className="rounded-xl shadow-lg overflow-hidden flex flex-col cursor-pointer hover:shadow-2xl transition-shadow duration-200 hover:bg-neutral-900"
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
                        {playlist.owner === user?._id && (
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
                        )}
                      </div>
                    </div>
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
              <div className="flex flex-col gap-4">
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
                    {activeMenuId === tweet._id && tweet.ownerDetails?._id === user?._id && (
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
                  window.location.reload();
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

      {/* Image Change Modal */}
      {showImageChangeModal && (
        <div className="fixed inset-0 bg-transparent bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-neutral-800 p-6 rounded-lg max-w-md w-full">
            <h3 className="text-xl font-semibold mb-4">
              Change {imageType === 'avatar' ? 'Profile Picture' : 'Cover Image'}
            </h3>
            <p className="text-gray-300 mb-4">
              Do you want to change your {imageType === 'avatar' ? 'profile picture' : 'cover image'}?
            </p>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileSelect}
              accept="image/*"
              className="hidden"
            />
            <div className="flex justify-end gap-4">
              <button
                onClick={() => {
                  setShowImageChangeModal(false);
                  setImageType(null);
                }}
                className="px-4 py-2 text-gray-300 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Select Image
              </button>
              {selectedFile && (
                <button
                  onClick={handleImageUpload}
                  className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                >
                  Upload
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Toast Messages */}
      {playlistToast && <Toast message={playlistToast.msg} />}
      {tweetToast && <Toast message={tweetToast.msg} />}
      {toast && <Toast message={toast.msg} />}
    </div>
  );
}

export default Dashboard;
