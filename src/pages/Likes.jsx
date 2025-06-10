import React, { useState, useEffect } from 'react';
import { useSidebar } from '../context/SideBarContext';
import VideoCardList from '../components/VideoCardList';
import Toast from '../Toast';
import { getLikedVideos, toggleVideoLike } from '../utils/api/auth';

const Likes = () => {
    const { isSidebarOpen } = useSidebar();
    const [videos, setVideos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeMenuId, setActiveMenuId] = useState(null);
    const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });
    const [toast, setToast] = useState(null);

    useEffect(() => {
        const fetchLikedVideos = async () => {
            try {
                setLoading(true);
                const likedVideos = await getLikedVideos();
                setVideos(likedVideos);
            } catch (error) {
                console.error('Error fetching liked videos:', error);
                setToast({ msg: "Failed to fetch liked videos" });
            } finally {
                setLoading(false);
            }
        };

        fetchLikedVideos();
    }, []);

    const handleUnlike = async (videoId) => {
        try {
            await toggleVideoLike(videoId);
            // Update videos state after removal
            setVideos(prevVideos => prevVideos.filter(video => video._id !== videoId));
            setToast({ msg: "Video removed from liked videos" });
        } catch (error) {
            console.error('Error unliking video:', error);
            setToast({ msg: "Failed to remove video from liked videos" });
        }
    };

    const handleClearAll = async () => {
        try {
            // Unlike all videos
            const unlikePromises = videos.map(video => toggleVideoLike(video._id));
            await Promise.all(unlikePromises);
            setVideos([]); // Clear videos state
            setToast({ msg: "All videos removed from liked videos" });
        } catch (error) {
            console.error('Error clearing liked videos:', error);
            setToast({ msg: "Failed to clear liked videos" });
        }
    };

    if (loading) return (
        <div className="flex flex-col items-center justify-center min-h-[100vh] bg-black">
            <img src="/1479.gif" alt="Loading..." className="w-20 h-20" />
        </div>
    );

    return (
        <div className={`${isSidebarOpen ? 'ml-[220px] py-35 px-20 duration-600' : 'ml-[80px] py-35 px-20 duration-400'}`} style={{ minHeight: "100vh", overflowY: "auto" }}>
            <div className="flex items-center justify-between px-12">
                <h1 className="text-2xl font-bold text-white px-12">Liked Videos</h1>
                <button
                    className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded transition-colors duration-200"
                    onClick={handleClearAll}
                >
                    Clear Liked Videos
                </button>
            </div>
            <div className="flex flex-col">
                {!videos || videos.length === 0 ? (
                    <div className="text-white py-5 px-10 text-center">
                        <p className="text-xl mb-4">Your Liked Videos list is empty</p>
                        <p className="text-gray-400">Like videos to see them here.</p>
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
                                    onClick={() => handleUnlike(video._id)}
                                    className="absolute bottom-8 right-14 bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                                >
                                    Unlike
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

export default Likes;