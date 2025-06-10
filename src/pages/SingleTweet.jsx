import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useTweet } from '../context/TweetContext';
import Tweet from '../components/Tweet';

function SingleTweet() {
  const { tweetId } = useParams();
  const { tweets, fetchAllTweets, loading, error } = useTweet();

  useEffect(() => {
    if (!tweets.length) {
      fetchAllTweets();
    }
  }, [tweets.length, fetchAllTweets]);

  const tweet = tweets.find(t => t._id === tweetId);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[100vh] bg-black">
        <img src="/1479.gif" alt="Loading..." className="w-20 h-20" />
      </div>
    );
  }

  if (error) {
    return <div className="text-red-500 text-center mt-10">{error}</div>;
  }

  if (!tweet) {
    return <div className="text-center mt-10">Tweet not found.</div>;
  }

  return (
    <div className="flex flex-col items-center mt-40 mb-36">
      <div className="max-w-xl w-full">
        <Tweet tweet={tweet} />
      </div>
    </div>
  );
}

export default SingleTweet;