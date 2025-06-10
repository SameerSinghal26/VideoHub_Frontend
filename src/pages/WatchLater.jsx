import React, { useState, useEffect } from 'react';
import { usePlaylist } from '../context/PlaylistContext';
import VideoCardList from '../components/VideoCardList';
import { useSidebar } from '../context/SideBarContext';
import Toast from '../Toast';
import { fetchSingleVideoByPublicId, fetchUserById } from '../utils/api/auth';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

const WatchLater = () => {
    const {
        playlists,
        handleRemoveFromPlaylist,
        addVideoToPlaylist,
        loading,
    } = usePlaylist();

    const WATCH_LATER_NAME = "Watch Later";
    const [localPlaylist, setLocalPlaylist] = useState(null);
    const [watchlaterPlaylistId, setWatchlaterPlaylistId] = useState(null);
    const { isSidebarOpen } = useSidebar();
    const [activeMenuId, setActiveMenuId] = useState(null);
    const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });
    const [toast, setToast] = useState(null);
    const [videos, setVideos] = useState([]);
    const navigate = useNavigate();
    const auth = useSelector((state) => state.auth);

    // Authentication check
    useEffect(() => {
        if (!auth.user) {
            navigate('/login', { state: { error: "Please login to view watch later" } });
            return;
        }
    }, [auth.user, navigate]);

    useEffect(() => {
        const fetchWatchLaterData = async () => {
            if (playlists && playlists.length > 0) {
                const watchLaterPlaylist = playlists.find(playlist => playlist.name === WATCH_LATER_NAME);
                if (watchLaterPlaylist) {
                    setLocalPlaylist(watchLaterPlaylist);
                    setWatchlaterPlaylistId(watchLaterPlaylist._id);
                    
                    // Fetch complete video data for each video while maintaining order
                    const videoPromises = watchLaterPlaylist.videos.map(async (video) => {
                        try {
                            const videoData = await fetchSingleVideoByPublicId(video._id);
                            // Fetch owner information
                            if (videoData && videoData.owner) {
                                const ownerData = await fetchUserById(videoData.owner);
                                // Combine video data with owner information
                                return {
                                    ...videoData,
                                    owner: ownerData
                                };
                            }
                            return videoData;
                        } catch (error) {
                            console.error(`Error fetching video ${video._id}:`, error);
                            return null;
                        }
                    });

                    const videoData = await Promise.all(videoPromises);
                    // Filter out null values and reverse the order to show newest first
                    setVideos(videoData.filter(video => video !== null).reverse());
                }
            }
        };

        fetchWatchLaterData();
    }, [playlists]);

    const handleRemove = async (videoId) => {
        await handleRemoveFromPlaylist(videoId, watchlaterPlaylistId);
        // Update videos state after removal
        setVideos(prevVideos => prevVideos.filter(video => video._id !== videoId));
    };

    const handleClearAll = async () => {
        const playlist = localPlaylist || playlists.find(playlist => playlist.name === WATCH_LATER_NAME);
        if (!playlist) {
            return;
        }
        for (const video of playlist.videos) {
            await handleRemoveFromPlaylist(video._id, playlist._id);
        }
        setVideos([]); // Clear videos state
        setToast({ msg: "All videos removed from Watch Later." });
    };

    if (loading) return(
        <div className="flex flex-col items-center justify-center min-h-[100vh] bg-black">
            <img src="/1479.gif" alt="Loading..." className="w-20 h-20" />
        </div>
    );

    const handleAddToWatchLater = async (videoId) => {
        await addVideoToPlaylist(videoId, watchlaterPlaylistId);
    };

    
    return (
        <div className={`${isSidebarOpen ? 'ml-[220px] py-35 px-20 duration-600' : 'ml-[80px] py-35 px-20 duration-400'}`} style={{ minHeight: "100vh", overflowY: "auto" }}>
            <div className="flex items-center justify-between px-12">
                <h1 className="text-2xl font-bold text-white px-12">Watch Later</h1>
                <button
                    className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded transition-colors duration-200"
                    onClick={handleClearAll}
                >
                    Clear Watch Later
                </button>
            </div>
            <div className="flex flex-col">
                {!videos || videos.length === 0 ? (
                    <div className="text-white py-5 px-10 text-center">
                        <p className="text-xl mb-4">Your Watch Later list is empty</p>
                        <p className="text-gray-400">Add videos to watch later by clicking the "Watch Later" button on any video.</p>
                    </div>
                ) : (
                    <div className="mt-4 px-16">
                        {videos.map((video, idx) => (
                            <div key={video._id + '-' + idx} className="relative group">
                                <VideoCardList
                                    key={video._id}
                                    video={video}
                                    activeMenuId={activeMenuId}
                                    setActiveMenuId={setActiveMenuId}
                                    menuPosition={menuPosition}
                                    setMenuPosition={setMenuPosition}
                                    showImage={true}
                                    hideMenu={false}
                                />
                                <button
                                    onClick={() => handleRemove(video._id)}
                                    className="absolute bottom-8 right-14 bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                                >
                                    Remove
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
            {toast && <Toast message={toast.msg} />}
        </div>
    );
};

export default WatchLater;
