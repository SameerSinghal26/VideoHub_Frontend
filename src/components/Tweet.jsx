import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { Heart, MessageCircle, Share2, Repeat } from 'lucide-react';
import { useSelector } from "react-redux";
import ShareModal from './ShareModal';
import { useComment } from '../context/CommentContext';
import { useLike } from '../context/LikeContext';
import Toast from './../Toast';
import { reactToTweet } from '../utils/api/auth';

const reactionIcons = {
    like: "❤️",
    love: "😍",
    haha: "😂",
    wow: "😮",
    sad: "😢",
    angry: "😠"
};

const Tweet = ({ tweet, onVote, onDelete }) => {
    const user = useSelector((state) => state.auth.user);
    const [showReactions, setShowReactions] = useState(false);
    const [showOptions, setShowOptions] = useState(false);
    const [toast, setToast] = useState(null);
    const [userReaction, setUserReaction] = useState(null);
    const [reactionCount, setReactionCount] = useState(tweet.reactions?.length || 0);

    const showToast = (msg) => {
        setToast({ msg });
        setTimeout(() => setToast(null), 4000);
    };

    React.useEffect(() => {
        if (tweet.reactions && user) {
            const userReaction = tweet.reactions.find(r => String(r.user._id) === String(user._id));
            setUserReaction(userReaction ? userReaction.type : null);
            setReactionCount(tweet.reactions.length);
        }
    }, [tweet.reactions, user]);

    const handleReaction = async (type) => {
        if (!user) {
            showToast("Please login or register to continue.");
            return;
        }

        try {
            const response = await reactToTweet(tweet._id, type);
            
            // Update reaction count and user reaction based on the response
            if (response) {
                const updatedReactions = response;
                const userReaction = updatedReactions.find(r => r.user._id === user._id);
                setUserReaction(userReaction ? userReaction.type : null);
                setReactionCount(updatedReactions.length);
                showToast(userReaction ? "Reaction added!" : "Reaction removed!");
            }
        } catch (err) {
            showToast("Error updating reaction");
            console.error("Reaction error:", err);
        }
        setShowReactions(false);
    };

    const {
        comments,
        loading,
        newComment,
        setNewComment,
        fetchTweetComments,
        handleAddTweetComment,
        handleDeleteTweetComment,
        handleUpdateTweetComment,
    } = useComment();

    const [showComments, setShowComments] = useState(false);
    const [activeMenu, setActiveMenu] = useState(null);
    const [editingCommentId, setEditingCommentId] = useState(null);
    const [editContent, setEditContent] = useState("");
    const [isLiked, setIsLiked] = useState(false);

    const handleVote = (optionIndex) => {
        onVote(tweet._id, optionIndex);
    };

    const getReactionCount = (type) => {
        return tweet.reactions?.filter(r => r.type === type).length || 0;
    };

    const hasReacted = (type) => {
        return tweet.reactions?.some(r => r.type === type && r.user._id === user?._id) || false;
    };

    const getTotalVotes = () => {
        return tweet.poll?.options?.reduce((total, option) => total + option.votes.length, 0) || 0;
    };

    const getVotePercentage = (votes) => {
        const total = getTotalVotes();
        return total > 0 ? Math.round((votes / total) * 100) : 0;
    };

    const hasVoted = () => {
        return tweet.poll?.options?.some(option => 
            option.votes.some(vote => vote._id === user?._id)
        ) || false;
    };

    const [showShareModal, setShowShareModal] = useState(false);

    const handleShowComments = () => {
        setShowComments((prev) => !prev);
        if (!showComments) fetchTweetComments(tweet._id);
    };

    const getUserReactionType = () => {
        const reaction = tweet.reactions?.find(r => r.user._id === user?._id);
        return reaction ? reaction.type : null;
    };

    // If tweet or owner details are not loaded yet
    if (!tweet || !tweet.ownerDetails) {
        return <div>Error loading tweet.</div>;
    }

    return (
        <div className="bg-neutral-900 rounded-xl p-4 mb-4">
            {toast && <Toast message={toast.msg} />}
            {/* Tweet Header */}
            <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                    <Link to={`/@${tweet.ownerDetails.username}`}>
                        <img 
                            src={tweet.ownerDetails.avatar || "/download.webp"} 
                            alt={tweet.ownerDetails.username}
                            className="w-10 h-10 rounded-full"
                        />
                    </Link>
                    <div>
                        <Link to={`/@${tweet.ownerDetails.username}`} className="font-bold hover:underline">
                            {tweet.ownerDetails.fullName}
                        <p className="text-gray-500">@{tweet.ownerDetails.username}</p>
                        </Link>
                    </div>
                </div>
            </div>

            {/* Tweet Content */}
            <div className="mt-3">
                <p className="text-white whitespace-pre-wrap">{tweet.content}</p>
                
                {/* Media */}
                {tweet.media && tweet.media.length > 0 && (
                    <div className="mt-3 grid gap-2">
                        {tweet.media.map((media, index) => (
                            <div key={index} className="rounded-lg overflow-hidden">
                                {media.type === 'image' && (
                                    <img 
                                        src={media.url} 
                                        alt="Tweet media" 
                                        className="max-h-100 w-full object-fill"
                                    />
                                )}
                                {media.type === 'video' && (
                                    <video 
                                        src={media.url} 
                                        controls 
                                        className="max-h-96 w-full"
                                    />
                                )}
                                {media.type === 'gif' && (
                                    <img 
                                        src={media.url} 
                                        alt="GIF" 
                                        className="max-h-96 w-full object-cover"
                                    />
                                )}
                            </div>
                        ))}
                    </div>
                )}

                {/* Poll */}
                {tweet.poll && tweet.poll.isActive && (
                    <div className="mt-3 bg-neutral-800 rounded-lg p-4">
                        <h3 className="font-bold mb-3">{tweet.poll.question}</h3>
                        <div className="space-y-2">
                            {tweet.poll.options.map((option, index) => (
                                <button
                                    key={index}
                                    onClick={() => !hasVoted() && handleVote(index)}
                                    className={`w-full p-2 rounded-lg text-left ${
                                        hasVoted() 
                                            ? 'bg-neutral-700 cursor-default' 
                                            : 'hover:bg-neutral-700'
                                    }`}
                                    disabled={hasVoted()}
                                >
                                    <div className="flex justify-between items-center">
                                        <span>{option.text} {/* index: {index} */}</span>
                                        {hasVoted() && (
                                            <span className="text-sm text-gray-400">
                                                {getVotePercentage(option.votes.length)}%
                                            </span>
                                        )}
                                    </div>
                                    {hasVoted() && (
                                        <div className="w-full bg-neutral-600 rounded-full h-2 mt-2">
                                            <div 
                                                className="bg-blue-500 h-2 rounded-full"
                                                style={{ width: `${getVotePercentage(option.votes.length)}%` }}
                                            />
                                        </div>
                                    )}
                                </button>
                            ))}
                        </div>
                        {hasVoted() && (
                            <p className="text-sm text-gray-400 mt-2">
                                {getTotalVotes()} votes
                            </p>
                        )}
                    </div>
                )}
            </div>

            {/* Tweet Actions */}
            <div className="mt-4 flex items-center space-x-4">
                <div className="relative">
                    <button 
                        onClick={() => setShowReactions(!showReactions)}
                        className="flex items-center space-x-1 text-gray-500 hover:text-white"
                    >
                        {userReaction ? (
                            <span className="text-xl mb-1">{reactionIcons[userReaction]}</span>
                        ) : (
                            <Heart size={20} />
                        )}
                        <span>{reactionCount}</span>
                    </button>
                    {showReactions && (
                        <div className="absolute bottom-full left-0 mb-1 bg-neutral-800 rounded-lg p-2 flex space-x-2">
                            {['like', 'love', 'haha', 'wow', 'sad', 'angry'].map(type => (
                                <button
                                    key={type}
                                    onClick={() => handleReaction(type)}
                                    className={`hover:scale-110 transition-transform ${
                                        userReaction === type ? 'border-b border-amber-50 rounded-full' : ''
                                    }`}
                                >
                                    {reactionIcons[type]}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Show user's reaction icon if they have reacted */}
                {getUserReactionType() && (
                    <span className="ml-2 text-xl">
                        {reactionIcons[getUserReactionType()]}
                    </span>
                )}

                <button
                    className="flex items-center text-gray-500 hover:text-white"
                    onClick={handleShowComments}
                >
                    <MessageCircle size={18} className="mr-1" /> Comments
                </button>

                <button className="flex items-center space-x-2 text-gray-500 hover:text-white">
                    <Repeat size={18} className="mr-2"/> Repost
                </button>
                <button onClick={() => setShowShareModal(true)} className="text-gray-500 hover:text-white">
                    <Share2 size={20} />
                </button>
            </div>

            {/* Timestamp */}
            <div className="mt-2 text-sm text-gray-500">
                {formatDistanceToNow(new Date(tweet.createdAt), { addSuffix: true })}
            </div>

            {showComments && (
                <div className="mt-4 border-t border-gray-400 pt-4">
                    <div className="flex items-center gap-2 mb-4">
                        <img src={user.avatar || "/download.webp"} alt="me" className="w-8 h-8 rounded-full" />
                        <input
                            value={newComment}
                            onChange={e => setNewComment(e.target.value)}
                            placeholder="Add a comment..."
                            className="flex-1 border rounded-full px-4 py-2 text-white"
                        />
                        <button onClick={() => handleAddTweetComment(tweet._id, newComment)} className="ml-2 text-blue-600 font-semibold">Post</button>
                    </div>
                    {loading ? (
                        <div className='text-white'>Loading comments...</div>
                    ) : (
                        comments.map(comment => (
                            <div key={comment._id} className="flex flex-col mb-4">
                                {/* Header: Avatar, Username, Menu */}
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <img
                                            src={comment.owner.avatar || "/download.webp"}
                                            alt="avatar"
                                            className="w-8 h-8 rounded-full object-cover"
                                        />
                                        <span className="font-semibold text-white">{comment.owner.username}</span>
                                    </div>
                                    {/* Three-dot menu for owner */}
                                    {user?._id === comment.owner._id && (
                                        <div className="relative">
                                            <button
                                                className="text-gray-400 hover:text-white"
                                                onClick={() => setActiveMenu(activeMenu === comment._id ? null : comment._id)}
                                            >
                                                <svg width="18" height="18" fill="currentColor" viewBox="0 0 20 20">
                                                    <circle cx="4" cy="10" r="2" />
                                                    <circle cx="10" cy="10" r="2" />
                                                    <circle cx="16" cy="10" r="2" />
                                                </svg>
                                            </button>
                                            {activeMenu === comment._id && (
                                                <div className="absolute right-0 mt-2 w-28 bg-neutral-900 border border-neutral-700 rounded shadow-lg z-10">
                                                    <button
                                                        className="block w-full text-left px-4 py-2 hover:bg-neutral-800 text-blue-400"
                                                        onClick={() => {
                                                            setEditingCommentId(comment._id);
                                                            setEditContent(comment.content);
                                                            setActiveMenu(null);
                                                        }}
                                                    >
                                                        Edit
                                                    </button>
                                                    <button
                                                        className="block w-full text-left px-4 py-2 hover:bg-neutral-800 text-red-400"
                                                        onClick={() => {
                                                            handleDeleteTweetComment(comment._id);
                                                            setActiveMenu(null);
                                                        }}
                                                    >
                                                        Delete
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                                {/* Comment Content */}
                                <div className="ml-10 mt-1 bg-neutral-800 rounded-xl px-4 py-2 text-white">
                                    {editingCommentId === comment._id ? (
                                        <div className="flex items-center gap-2">
                                            <input
                                                value={editContent}
                                                onChange={e => setEditContent(e.target.value)}
                                                className="flex-1 bg-neutral-700 text-white rounded px-2 py-1"
                                            />
                                            <button
                                                className="text-blue-400 font-semibold"
                                                onClick={() => {
                                                    handleUpdateTweetComment(comment._id, editContent);
                                                    setEditingCommentId(null);
                                                }}
                                            >
                                                Save
                                            </button>
                                            <button
                                                className="text-gray-400"
                                                onClick={() => setEditingCommentId(null)}
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    ) : (
                                        <span>{comment.content}</span>
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}

            {showShareModal && (
                <ShareModal
                    videoUrl={window.location.origin + "/tweet/" + tweet?._id}
                    onClose={() => setShowShareModal(false)}
                />
            )}
        </div>
    );
};

export default Tweet; 