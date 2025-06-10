import React, { createContext, useContext, useState } from 'react';
import { useSelector } from 'react-redux';
import { fetchCommentsByVideoId, postComment, deleteComment as deleteCommentApi, UpdateComment, fetchCommentsByTweetId, postTweetComment, deleteTweetComment, updateTweetComment } from '../utils/api/auth';

const CommentContext = createContext();

export const CommentProvider = ({ children }) => {
  const user = useSelector((state) => state.auth.user);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [toast, setToast] = useState(null);
  const [showNewCommentEmojiPicker, setShowNewCommentEmojiPicker] = useState(false);
  const [showEditingCommentEmojiPicker, setShowEditingCommentEmojiPicker] = useState(false);
  const [editingComment, setEditingComment] = useState(null);
  const [editedContent, setEditedContent] = useState("");
  const [showCommentButtons, setShowCommentButtons] = useState(false);
  const showToast = (msg) => {
    setToast({ msg });
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

  const fetchComments = async (videoId) => {
    if (!videoId) return;

    setLoading(true);
    try {
      const response = await fetchCommentsByVideoId(videoId);
      setComments(response);
    } catch (err) {
      handleApiError(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddComment = async (videoId, content) => {
    if (!user) {
      showToast("please login or register to continue.");
      return;
    }

    if (!content.trim()) return;

    try {
      const response = await postComment({
        videoId,
        content,
      });
      setComments((prevComments) => [response, ...prevComments]);
      setNewComment("");
      setShowCommentButtons(false);
      setShowNewCommentEmojiPicker(false);
      showToast("Comment added successfully!");
    } catch (err) {
      handleApiError(err);
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!user) {
      showToast("please login or register to continue.");
      return;
    }

    try {
      await deleteCommentApi(commentId);
      setComments((prevComments) =>
        prevComments.filter((comment) => comment._id !== commentId)
      );
      showToast("Comment deleted successfully!");
    } catch (err) {
      handleApiError(err);
    }
  };

  const handleEditComment = async (commentId, content) => {
    if (!content.trim()) return;

    try {
      const updatedComment = await UpdateComment(commentId, content);
      setComments((prevComments) =>
        prevComments.map((comment) =>
          comment._id === commentId
            ? { ...comment, content: updatedComment.content }
            : comment
        )
      );
      setEditingComment(null);
      setEditedContent("");
      setShowEditingCommentEmojiPicker(false);
      showToast("Comment updated successfully!");
    } catch (err) {
      handleApiError(err);
    }
  };

  const resetCommentState = () => {
    setComments([]);
    setNewComment("");
    setShowCommentButtons(false);
    setShowNewCommentEmojiPicker(false);
    setEditingComment(null);
    setEditedContent("");
    setShowEditingCommentEmojiPicker(false);
    setLoading(false);
  };

  const fetchTweetComments = async (tweetId) => {
    if (!tweetId) return;
    setLoading(true);
    try {
      const response = await fetchCommentsByTweetId(tweetId);
      setComments(response);
    } catch (err) {
      handleApiError(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddTweetComment = async (tweetId, content) => {
    if (!user) {
      showToast("please login or register to continue.");
      return;
    }
    if (!content.trim()) return;
    try {
      const response = await postTweetComment({ tweetId, content });
      setComments((prevComments) => [response, ...prevComments]);
      setNewComment("");
      setShowCommentButtons(false);
      setShowNewCommentEmojiPicker(false);
      showToast("Comment added successfully!");
    } catch (err) {
      handleApiError(err);
    }
  };

  const handleUpdateTweetComment = async (commentId, content) => {

    try {
      const updatedComment = await updateTweetComment(commentId, content);
      setComments((prevComments) =>
        prevComments.map((comment) =>
          comment._id === commentId
          ? { ...comment, content: updatedComment.content }
          : comment
        )
      );
      setEditingComment(null);
      setEditedContent("");
      setShowEditingCommentEmojiPicker(false);
      showToast("Comment updated successfully!");
    } catch (err) {
      handleApiError(err);
    }
  };

  const handleDeleteTweetComment = async (commentId) => {
    if (!user) {
      showToast("please login or register to continue.");
      return;
    }
    try {
      await deleteTweetComment(commentId);
      setComments((prevComments) =>
        prevComments.filter((comment) => comment._id !== commentId)
      );
      showToast("Comment deleted successfully!");
    } catch (err) {
      handleApiError(err);
    }
  };

  const value = {
    comments,
    loading,
    newComment,
    setNewComment,
    toast,
    showNewCommentEmojiPicker,
    setShowNewCommentEmojiPicker,
    showEditingCommentEmojiPicker,
    setShowEditingCommentEmojiPicker,
    editingComment,
    setEditingComment,
    editedContent,
    setEditedContent,
    showCommentButtons,
    setShowCommentButtons,
    fetchComments,
    handleAddComment,
    handleDeleteComment,
    handleEditComment,
    resetCommentState,
    fetchTweetComments,
    handleAddTweetComment,
    handleDeleteTweetComment,
    handleUpdateTweetComment
  };

  return (
    <CommentContext.Provider value={value}>
      {children}
    </CommentContext.Provider>
  );
};

export const useComment = () => {
  const context = useContext(CommentContext);
  if (!context) {
    throw new Error('useComment must be used within a CommentProvider');
  }
  return context;
}; 