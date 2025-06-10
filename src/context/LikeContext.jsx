import React, { createContext, useContext, useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { 
  toggleVideoLike, 
  getLikedVideos, 
  checkVideoLike,
  toggleCommentLike,
  checkCommentLike,
  toggleTweetLike,
  checkTweetLike
} from '../utils/api/auth';
import { useNavigate } from 'react-router-dom';

const LikeContext = createContext();

export const LikeProvider = ({ children }) => {
  const user = useSelector((state) => state.auth.user);
  const navigate = useNavigate();
  
  const [isLiked, setIsLiked] = useState(false);
  const [likedVideos, setLikedVideos] = useState([]);
  const [loadingLike, setLoadingLike] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (msg) => {
    setToast({ msg });
    if (msg === "please login or register to continue.") {
      navigate("/login", { state: { error: msg } });
    }
    setTimeout(() => setToast(null), 4000);
  };

  const handleApiError = (error) => {
    if (error.response) {
      if (error.response.status === 401) {
        showToast("please login or register to continue.");
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

  const fetchLikedVideos = async () => {
    if (!user) {
      setLikedVideos([]);
      return;
    }

    try {
      const videos = await getLikedVideos();
      setLikedVideos(videos || []);
    } catch (err) {
      if (err.message && !err.message.includes('404')) {
        handleApiError(err);
      }
    }
  };

  const checkIfVideoIsLiked = async (videoId) => {
    if (!user || !videoId) return false;
    
    try {
      const response = await checkVideoLike(videoId);
      setIsLiked(response.isLiked);
      return response.isLiked;
    } catch (err) {
      if (err.message && !err.message.includes('404')) {
        handleApiError(err);
      }
      return false;
    }
  };

  const handleToggleLike = async (videoId) => {
    if (!user) {
      showToast("please login or register to continue.");
      return;
    }

    if (!videoId || !user?._id || loadingLike) return;
    
    setLoadingLike(true);
    try {
      const response = await toggleVideoLike(videoId);
      setIsLiked(response.data.isLiked);
      return response.data;
    } catch (err) {
      handleApiError(err);
      return { isLiked: false, totalLikes: 0 };
    } finally {
      setLoadingLike(false);
    }
  };

  // Comment like functions
  const checkIfCommentIsLiked = async (commentId) => {
    if (!user || !commentId) return false;
    
    try {
      const response = await checkCommentLike(commentId);
      return response.isLiked;
    } catch (err) {
      if (err.message && !err.message.includes('404')) {
        handleApiError(err);
      }
      return false;
    }
  };

  const handleToggleCommentLike = async (commentId) => {
    if (!user) {
      showToast("please login or register to continue.");
      return;
    }

    if (!commentId || !user?._id || loadingLike) return;
    
    setLoadingLike(true);
    try {
      const response = await toggleCommentLike(commentId);
      return response.data.isLiked;
    } catch (err) {
      handleApiError(err);
      return false;
    } finally {
      setLoadingLike(false);
    }
  };

  // Tweet like functions
  const checkIfTweetIsLiked = async (tweetId) => {
    if (!user || !tweetId) return false;
    
    try {
      const response = await checkTweetLike(tweetId);
      return response.isLiked;
    } catch (err) {
      if (err.message && !err.message.includes('404')) {
        handleApiError(err);
      }
      return false;
    }
  };

  const handleToggleTweetLike = async (tweetId) => {
    if (!user) {
      showToast("please login or register to continue.");
      return;
    }

    if (!tweetId || !user?._id || loadingLike) return;
    
    setLoadingLike(true);
    try {
      const response = await toggleTweetLike(tweetId);
      showToast(response.data.isLiked ? 'Tweet liked successfully!' : 'Tweet unliked successfully!');
      return response.data.isLiked;
    } catch (err) {
      handleApiError(err);
      return false;
    } finally {
      setLoadingLike(false);
    }
  };

  const resetLikeState = () => {
    setIsLiked(false);
    setLikedVideos([]);
    setLoadingLike(false);
  };

  useEffect(() => {
    if (user) {
      fetchLikedVideos();
    } else {
      resetLikeState();
    }
  }, [user]);

  const value = {
    isLiked,
    likedVideos,
    loadingLike,
    toast,
    handleToggleLike,
    checkIfVideoIsLiked,
    resetLikeState,
    fetchLikedVideos,
    checkIfCommentIsLiked,
    handleToggleCommentLike,
    checkIfTweetIsLiked,
    handleToggleTweetLike
  };

  return (
    <LikeContext.Provider value={value}>
      {children}
    </LikeContext.Provider>
  );
};

export const useLike = () => {
  const context = useContext(LikeContext);
  if (!context) {
    throw new Error('useLike must be used within a LikeProvider');
  }
  return context;
}; 