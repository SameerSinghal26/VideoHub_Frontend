import React, { useEffect, useState } from "react";
import { FaHome, FaHistory, FaThumbsUp, FaTwitter} from "react-icons/fa";
import {
  MdOutlineSubscriptions,
  MdOutlineVideoLibrary,
  MdPlaylistPlay,
  MdWatchLater,
  MdSettings,
} from "react-icons/md";
import { useSelector } from "react-redux";
import { getSubscribedChannels } from "../utils/api/auth";
import { Link } from "react-router-dom";
import { useSubscription } from "../context/SubscriptionContext";

const Sidebar = ({ isOpen }) => {
  const user = useSelector((state) => state.auth.user);
  const [subscribedChannels, setSubscribedChannels] = useState([]);
  const [loading, setLoading] = useState(false);
  const { isSubscribed } = useSubscription();
  const menuItemClass =
    "flex items-center gap-4 px-4 py-2 rounded-lg text-md cursor-pointer hover:bg-zinc-800 transition-colors duration-200";
  const iconClass = isOpen ? "text-2xl" : "text-2xl";

  const fetchSubscribedChannels = async () => {
    if (!user) {
      setSubscribedChannels([]);
      return;
    }
    setLoading(true);
    try {
      const response = await getSubscribedChannels(user._id);
      setSubscribedChannels(response || []);
    } catch (error) {
      if (
        error.message &&
        error.message.toLowerCase().includes("unauthorized")
      ) {
        setSubscribedChannels([]);
      } else {
        setSubscribedChannels([]);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscribedChannels();
  }, [user, isSubscribed]);

  return (
    <div
      className={`fixed top-10 left-0 h-full bg-black text-zinc-300 transition-all duration-400 ease-in-out shadow-lg z-40 ${
        isOpen ? "w-57" : "w-16"
      } overflow-y-auto pt-20`}
    >
      <div className="p-2 flex flex-col gap-1">
        <Link to="/">
          <div className={menuItemClass}>
            <FaHome className={iconClass} />
            {isOpen && <span>Home</span>}
          </div>
        </Link>
        <Link to="/feed/subscriptions">
          <div className={menuItemClass}>
            <MdOutlineSubscriptions className={iconClass} />
            {isOpen && <span>Subscriptions</span>}
          </div>
        </Link>
        <hr className="my-2 border-zinc-700" />
        <Link to={user ? `/@${user.username}` : "#"}>
          {isOpen && (
            <div
              className={
                "px-4 py-1 text-lg text-white font-semibold cursor-pointer hover:bg-zinc-800 rounded-lg"
              }
            >
              You{" "}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                height="16"
                width="16"
                focusable="false"
                aria-hidden="true"
                className="w-5 inline-block ml-2"
                stroke="currentColor"
                viewBox="0 0 16 16"
              >
                <path d="M4.97 12.65 9.62 8 4.97 3.35l.71-.71L11.03 8l-5.35 5.35-.71-.7z" />
              </svg>
            </div>
          )}
        </Link>
        <Link to="/feed/history">
          <div className={menuItemClass}>
            <FaHistory className={iconClass} />
            {isOpen && <span>History</span>}
          </div>
        </Link>
        <Link to="/feed/playlists">
          <div className={menuItemClass}>
            <MdPlaylistPlay className={iconClass} />
            {isOpen && <span>Playlists</span>}
          </div>
        </Link>
        <Link to={user ? `/@${user.username}/videos` : "#"}>
          <div className={menuItemClass}>
            <MdOutlineVideoLibrary className={iconClass} />
            {isOpen && <span>Your Videos</span>}
          </div>
        </Link>
        <Link to="/feed/watch-later">
          <div className={menuItemClass}>
            <MdWatchLater className={iconClass} />
            {isOpen && <span>Watch Later</span>}
          </div>
        </Link>
        <Link to="/feed/likes">
          <div className={menuItemClass}>
            <FaThumbsUp className={iconClass} />
            {isOpen && <span>Liked Videos</span>}
          </div>
        </Link>
        <Link to="/feed/tweets">
          <div className={menuItemClass}>
            <FaTwitter className={iconClass} />
            {isOpen && <span>Tweets</span>}
          </div>
        </Link>

        <hr className="my-2 border-zinc-700" />

        {isOpen && (
          <div>
            <div className="px-4 py-1 text-sm font-semibold text-white">
              Subscriptions
            </div>
            {loading ? (
              <div className="px-4 py-2 text-sm text-gray-400">
                Loading subscriptions...
              </div>
            ) : subscribedChannels.length > 0 ? (
              subscribedChannels.map((channel) => (
                <Link
                  to={`/@${channel.username}`}
                  key={channel._id}
                  className={menuItemClass}
                >
                  <img
                    src={channel.avatar || "/download.webp"}
                    alt={channel.username}
                    className="w-6 h-6 rounded-full"
                  />
                  <span className="flex-1 truncate">{channel.username}</span>
                </Link>
              ))
            ) : (
              <div className="px-4 py-2 text-sm text-gray-400">
                {user
                  ? "No subscriptions yet"
                  : "Sign in to see your subscriptions"}
              </div>
            )}
          </div>
        )}
        {isOpen && <hr className="my-2 border-zinc-700" />}
        <Link to="/account">
          <div className={menuItemClass}>
            <MdSettings className={iconClass} />
            {isOpen && <span>Settings</span>}
          </div>
        </Link>
      </div>
    </div>
  );
};

export default Sidebar;
