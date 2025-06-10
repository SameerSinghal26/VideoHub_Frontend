import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { getSubscribedChannels, toggleSubscription } from "../utils/api/auth";
import { Link, useNavigate } from "react-router-dom";
import { useSidebar } from "../context/SideBarContext.jsx";
import Toast from "../Toast.jsx";
import ChannelCard from "../components/ChannelCard.jsx";

function Channels() {
  const user = useSelector((state) => state.auth.user);
  const { isSidebarOpen } = useSidebar();
  const [channels, setChannels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [subStatus, setSubStatus] = useState({}); // {channelId: true/false}
  const [loadingSub, setLoadingSub] = useState({}); // {channelId: true/false}
  const [toast, setToast] = useState(null);
  const [sortOrder, setSortOrder] = useState("recent");
  const navigate = useNavigate();

  const handleSortChange = (e) => {
    setSortOrder(e.target.value);
  };

  useEffect(() => {
    const fetchChannels = async () => {
      try {
        setLoading(true);
        if (user?._id) {
          const data = await getSubscribedChannels(user._id);
          setChannels(data);
          // Set initial subscription status
          const status = {};
          data.forEach((ch) => {
            status[ch._id] = true; // All are subscribed initially
          });
          setSubStatus(status);
        }
      } catch (err) {
        setChannels([]);
      } finally {
        setLoading(false);
      }
    };
    fetchChannels();
  }, [user]);

  const showToast = (msg) => {
    setToast({ msg });
    if (msg === "please login or register to continue.") {
      navigate("/login", { state: { error: msg } });
    }
    setTimeout(() => setToast(null), 4000);
  };

  const handleToggleSubscription = async (channelId) => {
    setLoadingSub((prev) => ({ ...prev, [channelId]: true }));
    try {
      await toggleSubscription(channelId);
      // Hard reload to update subscriber count and list
      window.location.reload();
    } catch (err) {
      showToast("Failed to update subscription.");
    } finally {
      setLoadingSub((prev) => ({ ...prev, [channelId]: false }));
    }
  };

  const sortedChannels = [...channels].sort((a, b) => {
    if (sortOrder === "az") {
      return a.fullName.localeCompare(b.fullName);
    } else {
      // Default: recently subscribed (keep backend order)
      return 0;
    }
  });

  return (
    <>
      {/* Toast message */}
      {toast && <Toast message={toast.msg} />}
      <div className={`${isSidebarOpen ? "ml-[150px]" : "pl-15 ml-[50px]"}`}>
        <div className="px-80 pt-3 transition-all duration-300 mt-22 mb-5">
          <h1 className="text-white text-3xl font-bold mb-4">
            All subscriptions
          </h1>
          <select
            className="bg-[#222] text-white p-1 ml-2 rounded-lg border "
            onChange={handleSortChange}
            value={sortOrder}
          >
            <option value="recent">Recently subscribed</option>
            <option value="az">A-Z</option>
          </select>
        </div>
        <div className="min-h-screen bg-black px-70 transition-all duration-300 ease-in-out">
          {loading ? (
            <p className="text-white">Loading...</p>
          ) : (
            <div className="flex flex-col">
              {sortedChannels.map((channel) => (
                <ChannelCard
                  key={channel._id}
                  channel={channel}
                  isSubscribed={subStatus[channel._id]}
                  loadingSubscription={loadingSub[channel._id]}
                  onToggleSubscription={handleToggleSubscription}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default Channels;
