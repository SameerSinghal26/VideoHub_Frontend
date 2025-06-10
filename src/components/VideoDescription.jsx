import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import EmojiPicker from "emoji-picker-react";
import Toast from "../Toast";
import { useComment } from "../context/CommentContext";
import { useSubscription } from "../context/SubscriptionContext";
import ShareModal from "./ShareModal";
import { useLike } from "../context/LikeContext";

const VideoDescription = ({ selectedVideo, selectedUser }) => {
  const user = useSelector((state) => state.auth.user);
  const navigate = useNavigate();
  const [showShareModal, setShowShareModal] = useState(false);
  const [likeToast, setLikeToast] = useState(null);
  const [videoLikeToast, setVideoLikeToast] = useState(null);
  // Use comment context
  const {
    comments,
    loading,
    newComment,
    setNewComment,
    toast: commentToast,
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
    setComments,
  } = useComment();

  // Use subscription context
  const {
    subscribersCount,
    isSubscribed,
    loadingSubscription,
    toast: subscriptionToast,
    fetchSubscriptionData,
    handleToggleSubscription,
    resetSubscriptionState,
  } = useSubscription();

  // Use like context
  const {
    isLiked,
    handleToggleLike,
    loadingLike,
    checkIfVideoIsLiked,
    handleToggleCommentLike,
    checkIfCommentIsLiked,
    likedVideos,
    setLikedVideos,
  } = useLike();

  const [likedComments, setLikedComments] = useState({});

  const likedVideo = likedVideos?.find(v => v._id === selectedVideo._id);
  const totalLikes = likedVideo ? likedVideo.totalLikes : selectedVideo.totalLikes || 0;

  const showToast = (msg) => {
    setLikeToast({ msg });
    setTimeout(() => setLikeToast(null), 4000);
  };

  const showVideoLikeToast = (msg) => {
    setVideoLikeToast({ msg });
    setTimeout(() => setVideoLikeToast(null), 4000);
  };

  // Function to format relative time
  const formatRelativeTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);

    if (diffInSeconds < 60) return "just now";
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60)
      return `${diffInMinutes} minute${diffInMinutes === 1 ? "" : "s"} ago`;
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24)
      return `${diffInHours} hour${diffInHours === 1 ? "" : "s"} ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 30)
      return `${diffInDays} day${diffInDays === 1 ? "" : "s"} ago`;
    const diffInMonths = Math.floor(diffInDays / 30);
    if (diffInMonths < 12)
      return `${diffInMonths} month${diffInMonths === 1 ? "" : "s"} ago`;
    const diffInYears = Math.floor(diffInMonths / 12);
    return `${diffInYears} year${diffInYears === 1 ? "" : "s"} ago`;
  };

  // Reset states and fetch data when video changes
  useEffect(() => {
    if (selectedVideo?._id) {
      // Reset all states first
      resetCommentState();
      resetSubscriptionState();

      // Then fetch new data
      fetchComments(selectedVideo._id);
      if (selectedVideo.owner) {
        fetchSubscriptionData(selectedVideo.owner);
      }
      // Check if video is liked
      checkIfVideoIsLiked(selectedVideo._id);
    }
  }, [selectedVideo?._id, selectedVideo?.owner]);

  // Handle comment input changes
  const handleCommentChange = (e) => {
    setNewComment(e.target.value);
    if (e.target.value.length > 0) {
      setShowCommentButtons(true);
    }
  };

  // Handle cancel button click
  const handleCancelComment = () => {
    setNewComment("");
    setShowCommentButtons(false);
    setShowNewCommentEmojiPicker(false);
  };

  // Handle emoji selection
  const onEmojiClick = (emojiObject) => {
    if (editingComment) {
      setEditedContent((prevContent) => prevContent + emojiObject.emoji);
    } else {
      setNewComment((prevComment) => prevComment + emojiObject.emoji);
      setShowCommentButtons(true);
    }
  };

  // Handle click on Update button
  const handleEditClick = (comment) => {
    setEditingComment({ id: comment._id, originalContent: comment.content });
    setEditedContent(comment.content);
    setShowNewCommentEmojiPicker(false);
  };

  // Handle change in edit textarea
  const handleEditedContentChange = (e) => {
    setEditedContent(e.target.value);
  };

  // Handle cancel button click (for editing comment)
  const handleCancelEdit = () => {
    setEditingComment(null);
    setEditedContent("");
    setShowEditingCommentEmojiPicker(false);
  };

  // Handle Save button click (for editing comment)
  const handleSaveEdit = (commentId) => {
    handleEditComment(commentId, editedContent);
  };

  // Handle form submission
  const handleSubmitComment = (e) => {
    e.preventDefault();
    handleAddComment(selectedVideo._id, newComment);
  };

  // Handle comment like
  const handleCommentLike = async (commentId) => {
    if (!user) {
      showToast("please login or register to continue.");
      return;
    }

    try {
      const isLiked = await handleToggleCommentLike(commentId);
      fetchComments(selectedVideo._id);
      showToast(isLiked ? "Comment is liked!" : "Comment is unliked!");
    } catch (err) {
      handleApiError(err);
    }
  };

  // Check if comment is liked
  const isCommentLiked = (comment) => {
    return likedComments[comment._id] || false;
  };

  // Check likes for all comments when they are loaded
  useEffect(() => {
    const checkCommentLikes = async () => {
      if (!user || !comments.length) return;

      const newLikedComments = {};
      for (const comment of comments) {
        const isLiked = await checkIfCommentIsLiked(comment._id);
        newLikedComments[comment._id] = isLiked;
      }
      setLikedComments(newLikedComments);
    };

    checkCommentLikes();
  }, [comments, user]);

  // Handle video like
  const handleVideoLike = async () => {
    if (!user) {
      showVideoLikeToast("Please login or register to continue.");
      return;
    }

    try {
      const response = await handleToggleLike(selectedVideo._id);
      
      // Update the like count from the response
      if (likedVideo) {
        likedVideo.totalLikes = response.totalLikes;
      } else {
        selectedVideo.totalLikes = response.totalLikes;
      }

      showVideoLikeToast(response.isLiked ? "Video is liked!" : "Video is unliked!");
    } catch (err) {
      showVideoLikeToast("Error toggling like status");
    }
  };

  return (
    <div className="text-white p-4 rounded-lg">
      {(commentToast || subscriptionToast || likeToast || videoLikeToast) && (
        <Toast
          message={
            (commentToast || subscriptionToast || likeToast || videoLikeToast)
              ?.msg
          }
        />
      )}

      {/* Video Title */}
      <h1 className="text-2xl font-bold mb-3">{selectedVideo?.title}</h1>

      {/* Channel Info and Interaction Buttons */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
        {/* Channel Info */}
        <div className="flex items-center mb-3 md:mb-0">
          <img
            src={selectedUser?.avatar || "/download.webp"}
            alt={selectedUser?.username}
            className="w-10 h-10 rounded-full mr-3"
          />
          <div>
            <p className="font-semibold">{selectedVideo.owner?.username}</p>
            <p className="text-sm text-gray-400">
              {subscribersCount} Subscribers
            </p>
          </div>
          {user && (
            <button
              onClick={() => handleToggleSubscription(selectedVideo.owner)}
              className={`ml-6 cursor-pointer font-semibold py-2 px-4 rounded-3xl transition-colors duration-200 ${
                isSubscribed
                  ? "bg-gray-600 hover:bg-gray-700 text-white"
                  : "bg-white hover:bg-gray-200 text-black"
              }`}
              disabled={loadingSubscription}
            >
              {loadingSubscription
                ? "Loading..."
                : isSubscribed
                  ? "Subscribed"
                  : "Subscribe"}
            </button>
          )}
        </div>

        {/* Interaction Buttons */}
        <div className="flex items-center space-x-4">
          {user && (
            <button
              onClick={handleVideoLike}
              disabled={loadingLike}
              className={`cursor-pointer font-semibold py-2 px-4 rounded-3xl transition-colors duration-200 ${
                isLiked
                  ? "bg-gray-600 hover:bg-gray-700 text-white"
                  : "bg-white hover:bg-gray-200 text-black"
              }`}
            >
              <span className="flex items-center space-x-1">
                {isLiked ? (
                  <>
                    <svg
                      version="1.1"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="-51.2 -51.2 614.40 614.40"
                      className="w-4 h-4"
                      fill="#ffffff"
                      transform="rotate(0)"
                      stroke="#ffffff"
                      strokeWidth="10.24"
                    >
                      <g>
                        <path d="M494.033,221.869c-19.535-3.252-119.276-15.022-136.735-16.276c-13.252-0.953-48.832-6.512-26.043-35.813 c45.67-73.609,35.906-111.586,20.715-135.457c-12.726-19.996-50.998-26.043-59.781,21.514 c-8.92,48.305-36.547,68.748-53.067,88.076C205.59,183.154,135.922,260.94,135.922,260.94v195.33c0,0,151.891,32.08,188.821,35.811 c34.328,3.469,61.994-11.176,78.27-30.707c19.117-22.94,73.486-136.571,84.508-161.37 C524.496,266.529,513.568,225.125,494.033,221.869z" />
                        <rect
                          x="0"
                          y="250.252"
                          width="85.45"
                          height="234.376"
                        />
                      </g>
                    </svg>
                    <span>{totalLikes} Liked</span>
                  </>
                ) : (
                  <span>{totalLikes} Likes</span>
                )}
              </span>
            </button>
          )}
          <button
            onClick={() => setShowShareModal(true)}
            className="flex items-center bg-neutral-900 hover:bg-neutral-600 text-white py-2 px-4 rounded-3xl"
          >
            Share
          </button>
          <button className="flex items-center bg-neutral-900 hover:bg-neutral-600 text-white py-2 px-4 rounded-3xl">
            Download
          </button>
        </div>
      </div>

      {/* Video Description */}
      <div className="bg-neutral-900 p-3 rounded-xl mb-6">
        <p className="text-sm whitespace-pre-wrap">
          {selectedVideo.description}
        </p>
      </div>

      {/* Comments Section */}
      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">
          {comments.length} Comments
        </h2>

        {loading && <p>Loading comments...</p>}

        {/* Add Comment Form */}
        {user && (
          <form
            onSubmit={handleSubmitComment}
            className="mb-6 flex items-start gap-4"
          >
            <img
              src={user?.avatar || "/download.webp"}
              alt={user?.username}
              className="w-10 h-10 rounded-full mt-1"
            />
            <div className="flex-1 flex flex-col">
              <div className="flex items-center relative">
                <textarea
                  value={newComment}
                  onChange={handleCommentChange}
                  onFocus={() => setShowCommentButtons(true)}
                  placeholder="Add a comment..."
                  className="w-full bg-transparent border-b border-gray-600 text-white p-1 outline-none focus:border-white resize-none"
                  rows="1"
                />
              </div>

              {showCommentButtons && (
                <div className="flex justify-end mt-2 space-x-2">
                  <button
                    type="button"
                    onClick={() =>
                      setShowNewCommentEmojiPicker((prev) => !prev)
                    }
                    className="p-1 text-gray-400 hover:text-white ml-2"
                  >
                    <svg
                      className="w-6 h-6"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      ></path>
                    </svg>
                  </button>
                  {showNewCommentEmojiPicker && (
                    <div className="absolute top-fit right-168 mt-10 z-50">
                      <EmojiPicker
                        onEmojiClick={onEmojiClick}
                        width={300}
                        theme="dark"
                      />
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={handleCancelComment}
                    className="px-4 py-2 rounded-full text-gray-400 hover:bg-gray-700"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-full bg-neutral-900 text-gray-400 hover:bg-neutral-700 hover:text-white"
                    disabled={!newComment.trim()}
                  >
                    Comment
                  </button>
                </div>
              )}
            </div>
          </form>
        )}

        {/* Comments List */}
        <div className="space-y-4">
          {comments.length > 0 ? (
            comments.map((comment) => (
              <div
                key={comment._id}
                className="flex gap-4 py-4 border-b border-gray-800"
              >
                <img
                  src={comment?.owner?.avatar || "/download.webp" }
                  alt={comment?.owner?.username}
                  className="w-10 h-10 rounded-full"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm">
                      @{comment?.owner?.username}
                    </span>
                    <span className="text-xs text-gray-400">
                      {formatRelativeTime(comment?.createdAt)}
                    </span>
                  </div>

                  {editingComment?.id === comment._id ? (
                    <div className="flex flex-col relative">
                      <textarea
                        value={editedContent}
                        onChange={handleEditedContentChange}
                        className="w-full bg-transparent border border-gray-600 text-white p-2 outline-none focus:border-white resize-none"
                        rows="3"
                      />
                      <div className="flex justify-end mt-2 space-x-2">
                        <button
                          type="button"
                          onClick={() =>
                            setShowEditingCommentEmojiPicker((prev) => !prev)
                          }
                          className="p-1 text-gray-400 hover:text-white mr-2"
                        >
                          <svg
                            className="w-6 h-6"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                            ></path>
                          </svg>
                        </button>
                        {showEditingCommentEmojiPicker && (
                          <div className="absolute bottom-11 left-165 mt-10 z-50">
                            <EmojiPicker
                              onEmojiClick={onEmojiClick}
                              width={300}
                              theme="dark"
                            />
                          </div>
                        )}
                        <button
                          type="button"
                          onClick={handleCancelEdit}
                          className="px-4 py-2 rounded-full text-gray-400 hover:bg-gray-700"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={() => handleSaveEdit(comment._id)}
                          className="px-4 py-2 rounded-full bg-blue-600 text-white hover:bg-blue-700"
                          disabled={
                            !editedContent.trim() ||
                            editedContent === editingComment.originalContent
                          }
                        >
                          Save
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <p className="text-sm mt-1">{comment?.content}</p>
                      <div className="flex items-center mt-2 space-x-4 text-gray-400 text-sm">
                        <button
                          onClick={() => handleCommentLike(comment._id)}
                          className="flex items-center hover:text-white"
                        >
                          {isCommentLiked(comment) ? (
                            <svg
                              version="1.1"
                              xmlns="http://www.w3.org/2000/svg"
                              xmlnsXlink="http://www.w3.org/1999/xlink"
                              viewBox="-51.2 -51.2 614.40 614.40"
                              className="w-4 h-4 mr-1"
                              fill="#ffffff"
                              transform="rotate(0)"
                              stroke="#ffffff"
                              strokeWidth="10.24"
                            >
                              <g>
                                <path d="M494.033,221.869c-19.535-3.252-119.276-15.022-136.735-16.276c-13.252-0.953-48.832-6.512-26.043-35.813 c45.67-73.609,35.906-111.586,20.715-135.457c-12.726-19.996-50.998-26.043-59.781,21.514 c-8.92,48.305-36.547,68.748-53.067,88.076C205.59,183.154,135.922,260.94,135.922,260.94v195.33c0,0,151.891,32.08,188.821,35.811 c34.328,3.469,61.994-11.176,78.27-30.707c19.117-22.94,73.486-136.571,84.508-161.37 C524.496,266.529,513.568,225.125,494.033,221.869z"></path>
                                <rect
                                  x="0"
                                  y="250.252"
                                  width="85.45"
                                  height="234.376"
                                ></rect>
                              </g>
                            </svg>
                          ) : (
                            <svg
                              version="1.1"
                              xmlns="http://www.w3.org/2000/svg"
                              xmlnsXlink="http://www.w3.org/1999/xlink"
                              viewBox="-51.2 -51.2 614.40 614.40"
                              className="w-4 h-4 mr-1"
                              fill="currentColor"
                              transform="rotate(0)"
                              stroke="currentColor"
                              strokeWidth="10.24"
                            >
                              <g>
                                <path d="M494.033,221.869c-19.535-3.252-119.276-15.022-136.735-16.276c-13.252-0.953-48.832-6.512-26.043-35.813 c45.67-73.609,35.906-111.586,20.715-135.457c-12.726-19.996-50.998-26.043-59.781,21.514 c-8.92,48.305-36.547,68.748-53.067,88.076C205.59,183.154,135.922,260.94,135.922,260.94v195.33c0,0,151.891,32.08,188.821,35.811 c34.328,3.469,61.994-11.176,78.27-30.707c19.117-22.94,73.486-136.571,84.508-161.37 C524.496,266.529,513.568,225.125,494.033,221.869z"></path>
                                <rect
                                  x="0"
                                  y="250.252"
                                  width="85.45"
                                  height="234.376"
                                ></rect>
                              </g>
                            </svg>
                          )}
                          <span>{comment.likes || 0}</span>
                        </button>
                        {user && user._id === comment?.owner?._id && (
                          <>
                            <button
                              onClick={() => handleEditClick(comment)}
                              className="text-blue-500 text-sm hover:text-blue-600"
                            >
                              Update
                            </button>
                            <button
                              onClick={() => handleDeleteComment(comment._id)}
                              className="text-red-500 text-sm hover:text-red-600"
                            >
                              Delete
                            </button>
                          </>
                        )}
                      </div>
                    </>
                  )}
                </div>
              </div>
            ))
          ) : (
            <p>No comments yet</p>
          )}
        </div>
      </div>
      {showShareModal && (
        <ShareModal
          videoUrl={window.location.origin + "/watch/" + selectedVideo?._id}
          onClose={() => setShowShareModal(false)}
        />
      )}
    </div>
  );
};

export default VideoDescription;
