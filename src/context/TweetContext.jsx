import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import {
  getAllTweets,
  getUserTweets,
  createTweet,
  reactToTweet,
  voteInPoll,
  deleteTweet,
  updateTweet,
} from "../utils/api/auth";
import { useSelector } from "react-redux";
import Toast from "../Toast";
import { useNavigate } from "react-router-dom";

const TweetContext = createContext();

export const TweetProvider = ({ children }) => {
  const user = useSelector((state) => state.auth.user);
  const [tweets, setTweets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState(null);
  const navigate = useNavigate();

  const handleApiError = (error) => {
    if (error.response) {
      if (error.response.status === 401) {
        setToast({ msg: "Please login or register to continue.", type: "error" });
        senavigate("/login", { state: { error: "Please login or register to continue." } });
      } else {
        const errorMessage = error.response.data?.message || "Something went wrong";
        setToast({ msg: errorMessage, type: "error" });
      }
    } else if (error.request) {
      setToast({ msg: "No response from server. Please check your internet connection.", type: "error" });
    } else {
      setToast({ msg: "An unexpected error occurred", type: "error" });
    }
  };

  // Fetch all tweets (for feed)
  const fetchAllTweets = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const res = await getAllTweets(page);
      setTweets(res.tweets || []);
      setError(null);
    } catch (err) {
      handleApiError(err);
      setError(err.message || "Failed to fetch tweets.");
      setTweets([]);
    }
    setLoading(false);
  }, [navigate]);

  // Fetch tweets for a specific user
  const fetchUserTweets = useCallback(async (userId, page = 1) => {
    setLoading(true);
    try {
      const res = await getUserTweets(userId, page);
      setTweets(res || []);
      setError(null);
    } catch (err) {
      setError(err.message || "Failed to fetch user tweets.");
      setTweets([]);
    }
    setLoading(false);
  }, []);

  // Create a tweet
  const handleCreateTweet = async (tweetData) => {
    try {
      const newTweet = await createTweet(tweetData);
      if (newTweet && newTweet._id) {
        setTweets((prev) => [newTweet, ...prev]);
      }
      setToast({ msg: "Tweet created!" });
    } catch (err) {
      setToast({ msg: err.message || "Failed to create tweet", type: "error" });
      throw err;
    }
  };

  // React to a tweet
  const handleReactToTweet = async (tweetId, reactionType) => {
    try {
      const updatedReactions = await reactToTweet(tweetId, reactionType);
      setTweets((prev) =>
        prev.map((t) => {
          if (t._id === tweetId) {
            return {
              ...t,
              reactions: updatedReactions
            };
          }
          return t;
        })
      );
    } catch (err) {
      setToast({ msg: err.message || "Failed to react to tweet", type: "error" });
    }
  };

  // Vote in a poll
  const handleVoteInPoll = async (tweetId, optionIndex) => {
    try {
      const updatedTweet = await voteInPoll(tweetId, optionIndex);
      if (!updatedTweet || !updatedTweet._id) {
        setToast({ msg: "Invalid tweet data after voting", type: "error" });
        return;
      }
      setTweets((prev) =>
        prev.map((t) => (t._id === tweetId ? updatedTweet : t))
      );
    } catch (err) {
      if (err.message && err.message.includes("already voted")) {
        const updatedTweet = await getTweetById(tweetId);
        setTweets((prev) =>
          prev.map((t) => (t._id === tweetId ? updatedTweet : t))
        );
      } else {
        setToast({ msg: err.message || "Failed to vote in poll" });
      }
    }
  };

  // Delete a tweet
  const handleDeleteTweet = async (tweetId) => {
    try {
      await deleteTweet(tweetId);
      setTweets((prev) => prev.filter((t) => t._id !== tweetId));
      setToast({ msg: "Tweet deleted" });
    } catch (err) {
      setToast({ msg: err.message || "Failed to delete tweet" });
    }
  };

  // Update a tweet
  const handleUpdateTweet = async (tweetId, tweetData) => {
    try {
      const updatedTweet = await updateTweet(tweetId, tweetData);
      setTweets((prev) =>
        prev.map((t) => (t._id === tweetId ? updatedTweet : t))
      );
      setToast({ msg: "Tweet updated!" });
    } catch (err) {
      setToast({ msg: err.message || "Failed to update tweet", type: "error" });
      throw err;
    }
  };

  const value = {
    tweets,
    loading,
    error,
    toast,
    fetchAllTweets,
    fetchUserTweets,
    handleCreateTweet,
    handleReactToTweet,
    handleVoteInPoll,
    handleDeleteTweet,
    handleUpdateTweet,
  };

  return (
    <TweetContext.Provider value={value}>
      {children}
      {toast && <Toast message={toast.msg} />}
    </TweetContext.Provider>
  );
};

export const useTweet = () => {
  const context = useContext(TweetContext);
  if (!context) {
    throw new Error("useTweet must be used within a TweetProvider");
  }
  return context;
};
