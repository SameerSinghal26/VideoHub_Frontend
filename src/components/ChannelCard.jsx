import React from "react";
import { Link } from "react-router-dom";

const ChannelCard = ({
  channel,
  isSubscribed,
  loadingSubscription,
  onToggleSubscription,
}) => {
  return (
    <div className="flex items-center justify-between border shadow-md rounded-2xl px-8 mb-4">
      {/* Left: Avatar and info */}
      <div className="flex items-center gap-6 flex-1">
        <Link to={`/@${channel.username}`}>
          <img
            src={channel.avatar || "/download.webp"}
            alt={channel.fullName}
            className="w-32 h-32 rounded-full object-full"
          />
        </Link>
        <div className="flex flex-col flex-1">
          <div className="flex items-center gap-2">
            <Link to={`/@${channel.username}`}>
              <span className="text-white text-xl font-bold">
                {channel.fullName}
              </span>
            </Link>
            {channel.isVerified && (
              <span className="text-blue-400 text-lg">✔</span>
            )}
          </div>
          <div className="text-gray-400 text-md">
            @{channel.username} • {channel.subscriberCount} subscribers
          </div>
          <div className="text-gray-300 mt-1 max-w-2xl">
            {channel.bio || "No description"}
          </div>
        </div>
      </div>
      {/* Right: Subscribed button */}
      <div className="flex items-center gap-2 ml-8">
        <button
          onClick={() => onToggleSubscription(channel._id)}
          disabled={loadingSubscription}
          className={`ml-6 cursor-pointer font-semibold py-2 px-4 rounded-3xl transition-colors duration-200 ${
            isSubscribed
              ? "bg-gray-600 hover:bg-gray-700 text-white"
              : "bg-white hover:bg-gray-200 text-black"
          }`}
        >
          {loadingSubscription
            ? "Loading..."
            : isSubscribed
            ? "Subscribed"
            : "Subscribe"}
        </button>
      </div>
    </div>
  );
};

export default ChannelCard;
