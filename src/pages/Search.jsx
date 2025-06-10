import React, { useEffect, useState } from "react";
import { useLocation, Link } from "react-router-dom";
import { searchAll } from "../utils/api/auth";

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

const Search = () => {
  const query = useQuery().get("q");
  const [results, setResults] = useState({ videos: [], users: [] });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (query) {
      setLoading(true);
      setError(null);
      searchAll(query)
        .then((data) => {
          setResults(data || { videos: [], users: [] });
        })
        .catch((err) => {
          setError(err.message || "Failed to fetch search results");
          setResults({ videos: [], users: [] });
        })
        .finally(() => setLoading(false));
    }
  }, [query]);

  return (
    <div className="px-40 mt-22 ml-20 min-h-screen">
      {loading && <p className="text-white">Loading...</p>}
      {error && <p className="text-red-500">{error}</p>}
      

          {/* Users Section */}
          <h3 className="text-2xl text-white mt-6 mb-4">Users</h3>
          {results.users?.length === 0 ? (
            <p className="text-white">No users found.</p>
          ) : (
            <div className="flex flex-col">
              {results.users?.map((user) => (
                <Link
                  key={user._id}
                  to={`/@${user.username}`}
                  className="flex  p-4 border-b border-zinc-700 transition"
                >
                  <img
                    src={user.avatar || "/download.webp"}
                    alt={user.username}
                    className="w-20 h-20 rounded-full mr-10"
                  />
                  <div className="flex-1 text-left">
                    <h3 className="text-lg text-white">{user.username}</h3>
                    <p className="text-gray-400">{user.fullName}</p>
                    <p className="text-gray-400">{user.bio}</p>
                  </div>
                </Link>
              ))}
            </div>
          )}
      {/* Videos Section */}
      {!loading && !error && (
        <>
          <h3 className="text-2xl text-white mt-6 mb-4">Videos</h3>
          {results.videos?.length === 0 ? (
            <p className="text-white">No videos found.</p>
          ) : (
            <div className="flex flex-col gap-0">
              {results.videos?.map((video) => (
                <Link
                  key={video._id}
                  to={`/watch/${video._id}`}
                  className="flex items-center justify-between p-4 border-b border-zinc-700 transition"
                >
                  <img
                    src={video.thumbnail}
                    alt={video.title}
                    className="w-80 h-50 object-fill rounded mr-4"
                  />
                  <div className="flex-1 text-left">
                    <h3 className="text-lg text-white">{video.title}</h3>
                    <p className="text-gray-400">{video.description}</p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Search;
