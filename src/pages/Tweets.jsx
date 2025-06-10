import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import Tweet from '../components/Tweet';
import { Image, BarChart2, X } from 'lucide-react';
import { useSidebar } from '../context/SideBarContext';
import { useTweet } from '../context/TweetContext';
import { useNavigate } from 'react-router-dom';

const Tweets = () => {
    const { isSidebarOpen } = useSidebar();
    const user = useSelector((state) => state.auth.user);
    const navigate = useNavigate();
    const {
        tweets,
        loading,
        toast,
        hasMore,
        handleCreateTweet,
        handleReactToTweet,
        handleVoteInPoll,
        handleDeleteTweet,
        fetchAllTweets,
    } = useTweet();
    const [content, setContent] = useState('');
    const [media, setMedia] = useState([]);
    const [showPollForm, setShowPollForm] = useState(false);
    const [pollQuestion, setPollQuestion] = useState('');
    const [pollOptions, setPollOptions] = useState(['', '']);
    const [page, setPage] = useState(1);

    React.useEffect(() => {
        if (!user) {
            navigate('/login', { state: { error: "Please login to view tweets" } });
            return;
        }
        fetchAllTweets(page);
    }, [page, fetchAllTweets, user, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!content && !media.length && !showPollForm) return;

        const formData = new FormData();
        formData.append('content', content);

        // Add media files
        media.forEach(file => {
            formData.append('media', file);
        });

        // Add poll data if exists
        if (showPollForm) {
            const pollData = {
                question: pollQuestion,
                options: pollOptions.filter(opt => opt.trim() !== '')
            };
            formData.append('poll', JSON.stringify(pollData));
        }

        try {
            await handleCreateTweet(formData);
            // Hard reload the page after successful tweet creation
            window.location.reload();
        } catch (error) {
            console.error('Error creating tweet:', error);
        }
    };

    const handleMediaChange = (e) => {
        const files = Array.from(e.target.files);
        setMedia([...media, ...files]);
    };

    const handleRemoveMedia = (index) => {
        setMedia(media.filter((_, i) => i !== index));
    };

    const handleAddPollOption = () => {
        if (pollOptions.length < 4) {
            setPollOptions([...pollOptions, '']);
        }
    };

    const handleRemovePollOption = (index) => {
        if (pollOptions.length > 2) {
            setPollOptions(pollOptions.filter((_, i) => i !== index));
        }
    };

    const handlePollOptionChange = (index, value) => {
        const newOptions = [...pollOptions];
        newOptions[index] = value;
        setPollOptions(newOptions);
    };

    if (!user) {
        return null;
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    return (
        <div className="flex">
            <div
                className={`min-h-screen flex flex-col ml-[490px] mt-28 relative`}
            >
                {/* Toast container */}
                <div>
                    {toast && <div className="mb-2"><span>{toast.msg}</span></div>}
                </div>

                <div className="max-w-2xl mx-auto p-4 w-full">
                    <div className="flex items-start gap-3 bg-neutral-900 rounded-xl p-4 mb-6">
                        <img
                            src={user?.avatar}
                            alt={user?.username}
                            className="w-10 h-10 rounded-full object-cover mt-1"
                        />

                        <form onSubmit={handleSubmit} className="flex-1 flex flex-col">
                            <textarea
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                                placeholder="What do you want to talk about?"
                                className="w-full bg-neutral-800 text-white resize-none outline-none rounded-xl px-4 py-3 mb-2"
                                rows={2}
                            />

                            {media.length > 0 && (
                                <div className="grid grid-cols-2 gap-2 mt-2">
                                    {media.map((file, index) => (
                                        <div key={index} className="relative">
                                            {file.type.startsWith('image/') ? (
                                                <img
                                                    src={URL.createObjectURL(file)}
                                                    alt="Preview"
                                                    className="w-full h-full object-cover rounded-lg"
                                                />
                                            ) : (
                                                <video
                                                    src={URL.createObjectURL(file)}
                                                    className="w-full h-full object-cover rounded-lg"
                                                />
                                            )}
                                            <button
                                                type="button"
                                                onClick={() => handleRemoveMedia(index)}
                                                className="absolute top-2 right-2 bg-opacity-50 rounded-full p-1"
                                            >
                                                <X size={16} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {showPollForm && (
                                <div className="mt-4 bg-neutral-800 rounded-lg p-4">
                                    <input
                                        type="text"
                                        value={pollQuestion}
                                        onChange={(e) => setPollQuestion(e.target.value)}
                                        placeholder="Ask a question..."
                                        className="w-full bg-transparent text-white outline-none mb-4"
                                    />
                                    {pollOptions.map((option, index) => (
                                        <div key={index} className="flex items-center gap-2 mb-2">
                                            <input
                                                type="text"
                                                value={option}
                                                onChange={(e) => handlePollOptionChange(index, e.target.value)}
                                                placeholder={`Option ${index + 1}`}
                                                className="flex-1 bg-transparent text-white outline-none"
                                            />
                                            {pollOptions.length > 2 && (
                                                <button
                                                    type="button"
                                                    onClick={() => handleRemovePollOption(index)}
                                                    className="text-red-500"
                                                >
                                                    <X size={16} />
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                    {pollOptions.length < 4 && (
                                        <button
                                            type="button"
                                            onClick={handleAddPollOption}
                                            className="text-blue-500"
                                        >
                                            Add option
                                        </button>
                                    )}
                                </div>
                            )}

                            <div className="flex items-center justify-end gap-2 mt-4">
                                <label className="cursor-pointer">
                                    <input
                                        type="file"
                                        accept="image/*,video/*"
                                        multiple
                                        onChange={handleMediaChange}
                                        className="hidden"
                                    />
                                    <span className="text-blue-500 text-xl mr-2">📷</span>
                                </label>
                                <button
                                    type="button"
                                    onClick={() => setShowPollForm(!showPollForm)}
                                    className="text-blue-500 text-xl mr-2"
                                >
                                    📊
                                </button>
                                <button
                                    type="submit"
                                    className="bg-blue-500 text-white px-6 py-2 rounded-full font-semibold hover:bg-blue-600"
                                >
                                    Post
                                </button>
                            </div>
                        </form>
                    </div>

                    {/* Tweets List */}
                    <div className="space-y-4">
                        {tweets.filter(Boolean).map(tweet => (
                            tweet._id && <Tweet
                                key={tweet._id}
                                tweet={tweet}
                                onReact={handleReactToTweet}
                                onVote={handleVoteInPoll}
                                onDelete={handleDeleteTweet}
                            />
                        ))}
                    </div>

                    {/* Load More Button */}
                    {hasMore && (
                        <div className="flex justify-center mt-4">
                            <button
                                onClick={() => setPage(prev => prev + 1)}
                                className="bg-blue-500 text-white px-4 py-2 rounded-full font-semibold hover:bg-blue-600"
                            >
                                Load More
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Tweets; 