import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  loginUser,
  registerUser,
  logoutUser,
  fetchAllPublicVideos,
  fetchSingleVideoByPublicId,
  fetchUserById,
  fetchCommentsByVideoId,
  postComment,
  deleteComment as deleteCommentApi,
} from "../../utils/api/auth";

const initialState = {
  user: JSON.parse(localStorage.getItem("user")) || null,
  isAuthenticated: !!localStorage.getItem("accessToken"),
  loading: false,
  error: null,
  videos: [],
  allVideos: [],
  selectedVideo: null,
  selectedUser: null,
  comments: [],
};

// Async thunks

export const getCommentsByVideoId = createAsyncThunk(
  "auth/getCommentsByVideoId",
  async (videoId, thunkAPI) => {
    try {
      const comments = await fetchCommentsByVideoId(videoId);
      return comments;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.message);
    }
  }
);

export const addComment = createAsyncThunk(
  "auth/addComment",
  async ({ videoId, content }, thunkAPI) => {
    try {
      const newComment = await postComment({ videoId, content });
      return newComment;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.message);
    }
  }
);

export const getUserById = createAsyncThunk(
  "auth/getUserById",
  async (userId, thunkAPI) => {
    try {
      const user = await fetchUserById(userId);
      return user;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.message);
    }
  }
);

export const login = createAsyncThunk("auth/login", async (data, thunkAPI) => {
  try {
    const res = await loginUser(data);
    return res;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.message || "Login failed. Please try again.");
  }
});

export const register = createAsyncThunk(
  "auth/register",
  async (data, thunkAPI) => {
    try {
      const res = await registerUser(data);
      return res.message; // Fix the typo here (was messgae)
    } catch (error) {
      return thunkAPI.rejectWithValue("Something went wrong!!!");
    }
  }
);

export const logout = createAsyncThunk("auth/logout", async (_, thunkAPI) => {
  try {
    await logoutUser();
    return {};
  } catch (error) {
    return thunkAPI.rejectWithValue(error.message);
  }
});

export const getAllVideosPublic = createAsyncThunk(
  "auth/getAllVideos",
  async (_, thunkAPI) => {
    try {
      const videos = await fetchAllPublicVideos();
      return videos;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.message);
    }
  }
);

export const fetchSingleVideo = createAsyncThunk(
  "auth/fetchSingleVideo",
  async (videoId, { rejectWithValue }) => {
    try {
      const data = await fetchSingleVideoByPublicId(videoId);
      return data;
    } catch (error) {
      // If error is HTML and contains jwt expired, handle it
      if (
        (typeof error.message === "string" && error.message.includes("jwt expired")) ||
        (typeof error === "string" && error.includes("jwt expired"))
      ) {
        return rejectWithValue("please login or register to continue.");
      }
      if (
        (typeof error.message === "string" && error.message.includes("Unauthorized request")) ||
        (typeof error === "string" && error.includes("jwt expired"))
      ) {
        return rejectWithValue("please login or register to continue.");
      }
      if (error.status === 401) {
        return rejectWithValue("please login or register to continue.");
      }
      return rejectWithValue(error.message || "Failed to fetch video");
    }
  }
);

export const deleteComment = createAsyncThunk(
  "auth/deleteComment",
  async ({ commentId }, thunkAPI) => {
    try {
      await deleteCommentApi(commentId);
      return commentId;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.message);
    }
  }
);

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Comments
      .addCase(getCommentsByVideoId.pending, (state) => {
        state.loading = true;
      })
      .addCase(getCommentsByVideoId.fulfilled, (state, action) => {
        state.loading = false;
        state.comments = action.payload;
      })
      .addCase(getCommentsByVideoId.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Add Comment
      .addCase(addComment.pending, (state) => {
        state.loading = true;
      })
      .addCase(addComment.fulfilled, (state, action) => {
        state.loading = false;
        state.comments.unshift(action.payload); // prepend new comment
      })
      .addCase(addComment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Get User By Id
      .addCase(getUserById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getUserById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedUser = action.payload;
      })
      .addCase(getUserById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Get Single video
      .addCase(fetchSingleVideo.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSingleVideo.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedVideo = action.payload; // Add this field in initialState
      })
      .addCase(fetchSingleVideo.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Login 
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        const { data } = action.payload;
        const { user, accessToken } = data;
        state.loading = false;
        state.user = user;
        state.accessToken = accessToken;
        state.isAuthenticated = true;
        localStorage.setItem("user", JSON.stringify(user));
        localStorage.setItem("accessToken", accessToken);
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Register
      .addCase(register.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.loading = false;
      })
      .addCase(register.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Logout
      .addCase(logout.fulfilled, (state) => {
        state.user = null;
        state.isAuthenticated = false;
        state.loading = false;
        state.error = null;
      })

      // Get All Videos
      .addCase(getAllVideosPublic.fulfilled, (state, action) => {
        state.loading = false;
        state.videos = action.payload;
        state.error = null;
      })

      // Delete Comment
      .addCase(deleteComment.pending, (state) => {
        state.loading = true;
      })
      .addCase(deleteComment.fulfilled, (state, action) => {
        state.loading = false;
        state.comments = state.comments.filter(comment => comment._id !== action.payload);
      })
      .addCase(deleteComment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError } = authSlice.actions;
export default authSlice.reducer;
