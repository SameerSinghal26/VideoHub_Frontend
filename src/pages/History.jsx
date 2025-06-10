import React, { useEffect, useState } from 'react';
import { getWatchHistory, clearWatchHistory } from '../utils/api/auth';
import VideoCardList from '../components/VideoCardList';
import { useSidebar } from '../context/SideBarContext';
import { format, isToday, isYesterday, isThisWeek, isThisYear, differenceInCalendarDays } from 'date-fns';
import Toast from '../Toast.jsx';
import { useNavigate } from 'react-router-dom';

function groupHistoryByDate(history) {
  const groups = {};

  history.forEach(item => {
    const date = new Date(item.updatedAt);
    let label = '';

    if (isToday(date)) {
      label = 'Today';
    } else if (isYesterday(date)) {
      label = 'Yesterday';
    } else if (differenceInCalendarDays(new Date(), date) < 7) {
      // Show day of week for last 7 days
      label = format(date, 'EEEE'); // e.g., 'Monday'
    } else if (isThisYear(date)) {
      // Show '25 May' for this year
      label = format(date, 'd MMM');
    } else {
      // Show '25 May 2023' for previous years
      label = format(date, 'd MMM yyyy');
    }

    if (!groups[label]) groups[label] = [];
    groups[label].push(item);
  });

  // To keep the order: Today, Yesterday, ...days..., ...dates...
  const orderedLabels = Object.keys(groups).sort((a, b) => {
    // Custom sort: Today > Yesterday > days of week > dates
    const order = ['Today', 'Yesterday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const aIndex = order.indexOf(a);
    const bIndex = order.indexOf(b);
    if (aIndex !== -1 && bIndex !== -1) return aIndex - bIndex;
    if (aIndex !== -1) return -1;
    if (bIndex !== -1) return 1;
    // For dates, sort by most recent first
    return groups[b][0].updatedAt.localeCompare(groups[a][0].updatedAt);
  });

  return orderedLabels.map(label => ({ label, videos: groups[label] }));
}

// Add this function outside the component return
const handleClearHistory = async (setToast, setLoading, setHistory) => {
  try {
    await clearWatchHistory();
    setToast({ msg: "Watch history cleared!" });
    // Refetch history after clearing
    setLoading(true);
    const res = await getWatchHistory();
    setHistory(res?.data || []);
    setLoading(false);
    // Hide toast after 6 seconds
    setTimeout(() => {
      setToast(null);
    }, 4000);
  } catch (err) {
    setToast({ msg: err.message || "Failed to clear history" });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  }
};

function History() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeMenuId, setActiveMenuId] = useState(null);
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });
  const { isSidebarOpen } = useSidebar();
  const [error, setError] = useState(null);
  const [toast, setToast] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchHistory = async () => {
      setLoading(true);
      try {
        const res = await getWatchHistory();
        setHistory(res?.data || []);
        setError(null);
      } catch (err) {
        // Enhanced error handling for JWT/unauthorized
        if (
          (typeof err.message === "string" && err.message.includes("jwt expired")) ||
          (typeof err === "string" && err.includes("jwt expired")) ||
          (typeof err.message === "string" && err.message.includes("Unauthorized request")) ||
          (typeof err === "string" && err.includes("Unauthorized request")) ||
          err.status === 401
        ) {
          setError("please login or register to continue.");
        } else {
          setError(err.message || "Failed to fetch history");
        }
        setHistory([]);
      }
      setLoading(false);
    };
    fetchHistory();
  }, []);

  useEffect(() => {
    if (error && error.includes("please login")) {
      setToast({ msg: error });
      setTimeout(() => {
        navigate("/login", { state: { error } });
      }, 2000); // Show toast for 2 seconds before redirect
    }
  }, [error, navigate]);

  const timeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = Math.floor((now - date) / 1000); // in seconds

    if (diff < 60) return `${diff} sec ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)} min ago`;
    if (diff < 86400)
      return `${Math.floor(diff / 3600)} hour${Math.floor(diff / 3600) === 1 ? "" : "s"} ago`;
    if (diff < 604800)
      return `${Math.floor(diff / 86400)} day${Math.floor(diff / 86400) === 1 ? "" : "s"} ago`;
    if (diff < 2592000)
      return `${Math.floor(diff / 604800)} week${Math.floor(diff / 604800) === 1 ? "" : "s"} ago`;
    if (diff < 31536000)
      return `${Math.floor(diff / 2592000)} month${Math.floor(diff / 2592000) === 1 ? "" : "s"} ago`;
    return `${Math.floor(diff / 31536000)} year${Math.floor(diff / 31536000) === 1 ? "" : "s"} ago`;
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[100vh] bg-black">
      <img src="/1479.gif" alt="Loading..." className="w-20 h-20" />
    </div>
  );
  if (error) return (
    <div className="flex flex-col items-center justify-center min-h-[100vh] bg-black">
      {toast && <Toast message={toast.msg} />}
      <img src="/1479.gif" alt="Error" className="w-20 h-20" />
    </div>
  );

  // Remove duplicates, keeping only the most recent occurrence
  const dedupedHistory = [];
  const seen = new Set();
  for (let i = history.length - 1; i >= 0; i--) {
    const video = history[i];
    if (!seen.has(video._id)) {
      dedupedHistory.unshift(video); // Add to start to preserve order
      seen.add(video._id);
    }
  }
  // Now use dedupedHistory instead of history
  const groupedHistory = groupHistoryByDate(dedupedHistory);

  return (
    <div  className={`${isSidebarOpen ? 'ml-[220px] py-40 px-20 duration-600' : 'ml-[80px] py-40 px-20 duration-400'}`} style={{ minHeight: "100vh", overflowY: "auto" }}>
      <div className="flex items-center justify-between px-12">
        <h1 className="text-2xl font-bold text-white">Watch History</h1>
        <button
          className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded transition-colors duration-200"
          onClick={() => handleClearHistory(setToast, setLoading, setHistory)}
        >
          Clear Watch History
        </button>
      </div>
      <div className="flex flex-col">
        {history.length === 0 ? (
          <div className="text-white py-5 px-10 text-center">No watch history found.</div>
        ) : (
          groupedHistory.map(group => (
            <div key={group.label}>
              <h2 className="text-lg font-semibold text-white mt-4 px-16">{group.label}</h2>
              {[...group.videos]
                .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
                .map((item, idx) => (
                  <div key={item._id + '-' + idx} className="relative">
                    <VideoCardList
                      video={item}
                      activeMenuId={activeMenuId}
                      setActiveMenuId={setActiveMenuId}
                      menuPosition={menuPosition}
                      setMenuPosition={setMenuPosition}
                      showImage={false}
                      hideMenu={true}
                    />
                    <div className="absolute top-41 right-15 bg-black bg-opacity-70 text-xs text-white px-2 py-1 rounded">
                      Watched: {timeAgo(item.updatedAt)}
                    </div>
                  </div>
                ))}
            </div>
          ))
        )}
      </div>
      {toast && <Toast message={toast.msg} />}
    </div>
  );
}

export default History;