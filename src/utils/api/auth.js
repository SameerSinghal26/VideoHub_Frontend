const BASE_URL = "https://videohub-backend-0gcp.onrender.com/api/v1";

const isTokenExpired = (token) => {
  if (!token) return true;
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload.exp * 1000 < Date.now();
  } catch (error) {
    return true;
  }
};

export const refreshAccessToken = async () => {
  try {
    const res = await fetch(`${BASE_URL}/users/refresh-token`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json"
      }
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.message || "Failed to refresh token");
    }

    const data = await res.json();
    
    // Update localStorage with new token
    if (data.data?.accessToken) {
      localStorage.setItem("accessToken", data.data.accessToken);
      return data.data.accessToken;
    }
    
    throw new Error("No access token received");
  } catch (error) {
    // If refresh fails, clear auth state
    localStorage.removeItem("user");
    localStorage.removeItem("accessToken");
    throw error;
  }
};

const fetchData = async (url, options = {}) => {
  let accessToken = localStorage.getItem("accessToken");

  // If token is expired, try to refresh it
  if (accessToken && isTokenExpired(accessToken)) {
    try {
      await refreshAccessToken();
      accessToken = localStorage.getItem("accessToken"); // get the new token
    } catch (error) {
      // If refresh fails, throw error
      localStorage.removeItem("user");
      localStorage.removeItem("accessToken");
      throw new Error("Session expired. Please login again.");
    }
  }

  const headers = {
    ...(options.headers || {}),
    ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
  };

  // Don't set Content-Type for FormData, let the browser set it with the boundary
  if (!(options.body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  }

  const res = await fetch(url, {
    ...options,
    headers,
    credentials: "include",
  });

  // Check if the response is JSON
  const contentType = res.headers.get("content-type");
  let data;
  if (contentType && contentType.includes("application/json")) {
    data = await res.json();
  } else {
    // fallback: get text (probably HTML error page)
    const text = await res.text();
    throw new Error(text || "Something went wrong");
  }

  if (!res.ok) {
    // Extract error message from the response
    const errorMessage = data?.message || "Something went wrong";
    const error = new Error(errorMessage);
    error.status = res.status;
    throw error;
  }

  return data;
};

export const loginUser = async (credentials) => {
  try {
    const response = await fetch(`${BASE_URL}/users/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(credentials),
      credentials: "include",
    });

    // Check content type
    const contentType = response.headers.get("content-type");
    let data;

    if (contentType && contentType.includes("application/json")) {
      data = await response.json();
      if (!response.ok) {
        throw new Error(data?.message || "Login failed");
      }
    } else {
      // Handle HTML error response
      const text = await response.text();
      // Extract error message from HTML response
      const match = text.match(/Error: (.*?)<br>/);
      const errorMessage = match ? match[1] : "Login failed";
      throw new Error(errorMessage);
    }

    return data;
  } catch (error) {
    // If the error is already in the correct format, throw it directly
    if (error.message) {
      throw error;
    }
    // Otherwise, throw a generic error
    throw new Error("Login failed. Please try again.");
  }
};

export const registerUser = async (userData) => {
  try {
    const response = await fetch(`${BASE_URL}/users/register`, {
      method: "POST",
      body: userData, // FormData directly
      credentials: "include",
    });

    // Check content type
    const contentType = response.headers.get("content-type");
    let data;

    if (contentType && contentType.includes("application/json")) {
      data = await response.json();
      if (!response.ok) {
        throw new Error(data?.message || "Registration failed");
      }
    } else {
      // Handle HTML error response
      const text = await response.text();
      // Extract error message from HTML response
      const match = text.match(/Error: (.*?)<br>/);
      const errorMessage = match ? match[1] : "Registration failed";
      throw new Error(errorMessage);
    }

    return data;
  } catch (error) {
    // If the error is already in the correct format, throw it directly
    if (error.message) {
      throw error;
    }
    // Otherwise, throw a generic error
    throw new Error("Registration failed. Please try again.");
  }
};

export const logoutUser = async () => {
  return fetchData(`${BASE_URL}/users/logout`, {
    method: "POST",
    credentials: "include",
  });
};

export const getCurrentUser = async () => {
  return fetchData(`${BASE_URL}/users/current-user`, {
    method: "GET",
  });
};

export const getWatchHistory = async () => {
  return fetchData(`${BASE_URL}/users/history`, {
    method: "GET",
  });
};

export const clearWatchHistory = async () => {
  return fetchData(`${BASE_URL}/users/history`,{
    method: "DELETE",
  });
}

export const fetchAllPublicVideos = async () => {
  const response = await fetchData(`${BASE_URL}/videos/all`, {
    method: "GET",
  });
  return response.data.videos;
};

export const fetchSingleVideoByPublicId = async (videoId) => {
  const response = await fetchData(`${BASE_URL}/videos/user-video/${videoId}`, {
    method: "GET",
  });

  return response.data;
};

export const fetchUserAllVideos = async (userId) => {
  const response = await fetchData(`${BASE_URL}/videos/user/${userId}`, {
    method: "GET",
  });
  return response.data;
};

export const fetchUserById = async (userId) => {
  const response = await fetchData(`${BASE_URL}/users/${userId}`, {
    method: "GET",
  });
  return response.data;
};

export const deleteVideo = async (videoId) => {
  const response = await fetchData(`${BASE_URL}/videos/delete-video/${videoId}`, {
    method: "DELETE",
  });
  return response.data;
};

export const fetchCommentsByVideoId = async (videoId) => {
  const response = await fetchData(`${BASE_URL}/comments/${videoId}`, {
    method: "GET",
  });
  return response.data;
};

export const postComment = async ({ videoId, content }) => {
  const response = await fetchData(`${BASE_URL}/comments/${videoId}`, {
    method: "POST",
    body: JSON.stringify({ content }),
  });
  return response.data;
};

export const deleteComment = async (commentId) => {
  const response = await fetchData(`${BASE_URL}/comments/c/${commentId}`, {
    method: "DELETE",
  });
  return response;
};

export const UpdateComment = async (commentId, content) => {
  const response = await fetchData(`${BASE_URL}/comments/c/${commentId}`, {
    method: "PATCH",
    body: JSON.stringify({ content }),
  });
  return response;
};

export const postReplyToComment = async ({ commentId, content }) => {
  const response = await fetchData(`${BASE_URL}/comments/c/${commentId}`, {
    method: "POST",
    body: JSON.stringify({ content }),
  });
  return response.data;
};

export const fetchCommentsofUserComment = async (commentId) => {
  const response = await fetchData(`${BASE_URL}/comments/c/${commentId}`, {
    method: "GET",
  });
  return response.data;
};

export const toggleSubscription = async (channelId) => {
  const response = await fetchData(
    `${BASE_URL}/subscriptions/channel/${channelId}`,
    {
      method: "POST",
    }
  );
  return response;
};

export const getSubscribedChannels = async (subscriberId) => {
  const response = await fetchData(
    `${BASE_URL}/subscriptions/subscribed/${subscriberId}`,
    {
      method: "GET",
    }
  );
  return response.data;
};

export const getUserChannelSubscribers = async (channelId) => {
  try {
    const response = await fetchData(
      `${BASE_URL}/subscriptions/channel/${channelId}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    return response.data || { totalSubscribers: 0, subscribers: [] };
  } catch (error) {
    // If it's a 404, return default data instead of throwing
    if (error.status === 404) {
      return { totalSubscribers: 0, subscribers: [] };
    }
    throw error;
  }
};

export const getUserChannelProfile = async (username) => {
  const cleanUsername = username.replace('@', '');
  const response = await fetchData(`${BASE_URL}/users/channel/${cleanUsername}`, {
    method: "GET",
  });
  return response.data;
};

export const getSubscribedChannelsVideos = async () => {
  const response = await fetchData(`${BASE_URL}/subscriptions/videos`, {
    method: "GET",
  });
  return response.data;
};

export const toggleVideoLike = async (videoId) => {
  const response = await fetchData(`${BASE_URL}/likes/toggle/v/${videoId}`, {
    method: "POST",
  });
  return response;
};

export const toggleCommentLike = async (commentId) => {
  const response = await fetchData(`${BASE_URL}/likes/toggle/c/${commentId}`, {
    method: "POST",
  });
  return response;
};

export const toggleTweetLike = async (tweetId) => {
  const response = await fetchData(`${BASE_URL}/likes/toggle/t/${tweetId}`, {
    method: "POST",
  });
  return response;
};

export const getLikedVideos = async () => {
  const response = await fetchData(`${BASE_URL}/likes/videos`, {
    method: "GET",
  });
  return response.data;
};

export const checkVideoLike = async (videoId) => {
  const response = await fetchData(`${BASE_URL}/likes/check/v/${videoId}`, {
    method: "GET",
  });
  return response.data;
};

export const checkCommentLike = async (commentId) => {
  const response = await fetchData(`${BASE_URL}/likes/check/c/${commentId}`, {
    method: "GET",
  });
  return response.data;
};

export const checkTweetLike = async (tweetId) => {
  const response = await fetchData(`${BASE_URL}/likes/check/t/${tweetId}`, {
    method: "GET",
  });
  return response.data;
};

export const createPlaylist = async (playlistData) => {
  const response = await fetchData(`${BASE_URL}/playlist`, {
    method: "POST",
    body: JSON.stringify(playlistData),
  });
  return response.data;
};

export const getUserPlaylists = async (userId) => {
  const response = await fetchData(`${BASE_URL}/playlist/user/${userId}`, {
    method: "GET",
  });
  return response.data;
};

export const getPlaylistById = async (playlistId) => {
  const response = await fetchData(`${BASE_URL}/playlist/${playlistId}`, {
    method: "GET",
  });
  return response.data;
};

export const updatePlaylist = async (playlistId, updateData) => {
  const response = await fetchData(`${BASE_URL}/playlist/${playlistId}`, {
    method: "PATCH",
    body: JSON.stringify(updateData),
  });
  return response.data;
};

export const deletePlaylist = async (playlistId) => {
  const response = await fetchData(`${BASE_URL}/playlist/${playlistId}`, {
    method: "DELETE",
  });
  return response.data;
};

export const addVideoToPlaylist = async (videoId, playlistId) => {
  const response = await fetchData(`${BASE_URL}/playlist/add/${videoId}/${playlistId}`, {
    method: "PATCH",
  });
  return response.data;
};

export const removeVideoFromPlaylist = async (videoId, playlistId) => {
  const response = await fetchData(`${BASE_URL}/playlist/remove/${videoId}/${playlistId}`, {
    method: "PATCH",
  });
  return response.data;
};


export const createTweet = async (tweetData) => {
  const response = await fetch(`${BASE_URL}/tweets/`, {
    method: "POST",
    body: tweetData, // FormData will automatically set the correct Content-Type
    credentials: "include",
  });
  return response.data;
};

export const getAllTweets = async (page = 1) => {
  const response = await fetchData(`${BASE_URL}/tweets/?page=${page}`, {
    method: "GET",
  });
  return response.data;
};

export const getUserTweets = async (userId) => {
  const response = await fetchData(`${BASE_URL}/tweets/user/${userId}`, {
    method: "GET",
  });
  return response.data;
};

export const updateTweet = async (tweetId, tweetData) => {
  const response = await fetchData(`${BASE_URL}/tweets/${tweetId}`, {
    method: "PATCH",
    body: JSON.stringify(tweetData),
    headers: { "Content-Type": "application/json" },
  });
  return response.data;
};

export const deleteTweet = async (tweetId) => {
  const response = await fetchData(`${BASE_URL}/tweets/${tweetId}`, {
    method: "DELETE",
  });
  return response.data;
};

export const reactToTweet = async (tweetId, reactionType) => {
  const response = await fetchData(`${BASE_URL}/tweets/${tweetId}/react`, {
    method: "POST",
    body: JSON.stringify({ reactionType }),
    headers: { "Content-Type": "application/json" },
  });
  return response.data;
};

export const voteInPoll = async (tweetId, optionIndex) => {
  const response = await fetch(`${BASE_URL}/tweets/${tweetId}/vote`, {
    method: "POST",
    body: JSON.stringify({ optionIndex }),
    headers: { "Content-Type": "application/json" },
    credentials: "include"
  });
  return response;
};

export const fetchCommentsByTweetId = async (tweetId) => {
  const response = await fetchData(`${BASE_URL}/comments/tweets/${tweetId}/comment`, { method: "GET" });
  return response.data;
};

export const postTweetComment = async ({ tweetId, content }) => {
  const response = await fetchData(`${BASE_URL}/comments/tweets/${tweetId}/comment`, {
    method: "POST",
    body: JSON.stringify({ content }),
    headers: { "Content-Type": "application/json" },
  });
  return response.data;
};

export const deleteTweetComment = async (commentId) => {
  const response = await fetchData(`${BASE_URL}/comments/tweet-comments/${commentId}`, {
    method: "DELETE",
  });
  return response.data;
};

export const updateTweetComment = async (commentId, content) => {
  const response = await fetchData(`${BASE_URL}/comments/tweet-comments/${commentId}`, {
    method: "PATCH",
    body: JSON.stringify({ content }),
    headers: { "Content-Type": "application/json" },
  });
  return response.data;
};

export const updateVideo = async (videoId, videoData) => {
  const response = await fetchData(`${BASE_URL}/videos/update-video`, {
    method: "PATCH",
    body: videoData,
  });
  return response.data;
};

export const toggleVideoPublishStatus = async (videoId) => {
  const response = await fetchData(`${BASE_URL}/videos/toggle/publish/${videoId}`, {
    method: "PATCH",
  });
  return response.data;
};

export const updateUserAccount = async (userData) => {
  const response = await fetchData(`${BASE_URL}/users/update-account`, {
    method: "PATCH",
    body: JSON.stringify(userData),
  });
  return response.data;
};

export const updateUserAvatar = async (avatarData) => {
  const response = await fetchData(`${BASE_URL}/users/avatar`, {
    method: "PATCH",
    body: avatarData, // FormData
  });
  return response;
};

export const updateUserCoverImage = async (coverImageData) => {
  const response = await fetchData(`${BASE_URL}/users/cover-image`, {
    method: "PATCH",
    body: coverImageData, // FormData
  });
  return response;
};

export const updateUserBio = async (bioData) => {
  const response = await fetchData(`${BASE_URL}/users/update-bio`, {
    method: "PATCH",
    body: JSON.stringify(bioData),
  });
  return response.data;
};

export const changePassword = async (passwordData) => {
  const response = await fetchData(`${BASE_URL}/users/change-password`, {
    method: "PATCH",
    body: JSON.stringify(passwordData),
  });
  return response.data;
};

export const createVideo = async (videoData) => {
  const response = await fetchData(`${BASE_URL}/videos/upload-video`, {
    method: "POST",
    body: videoData,
  });
  return response.data;
};

export const searchAll = async (query) => {
  const response = await fetchData(`${BASE_URL}/search/all?q=${encodeURIComponent(query)}`, {
    method: "GET",
  });
  return response.data;
};