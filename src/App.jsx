import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { CommentProvider } from "./context/CommentContext";
import { SubscriptionProvider } from "./context/SubscriptionContext";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Login from "./pages/Auth/Login";
import Register from "./pages/Auth/Register";
import isSidebarOpen from "./components/Navbar.jsx";
import { SidebarProvider } from "./context/SideBarContext.jsx";
import Watch from "./pages/Watch.jsx";
import Subscriptions from "./pages/Subscriptions.jsx";
import Channels from "./pages/Channels.jsx"
import Settings from "./pages/Settings.jsx";
import History from "./pages/History.jsx";
import PlayLists from "./pages/PlayLists.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import WatchLater from "./pages/WatchLater.jsx";
import Tweets from "./pages/Tweets.jsx";
import UserVideos from "./pages/UserVideos.jsx";
import Likes from "./pages/Likes.jsx";
import { PlaylistProvider } from './context/PlaylistContext';
import { LikeProvider } from './context/LikeContext';
import { TweetProvider } from './context/TweetContext';
import SingleTweet from "./pages/SingleTweet.jsx";
import CreateVideo from "./pages/CreateVideo.jsx";
import Search from "./pages/Search";

function App() {
  return (
    <Router>
      <div className="max-w-full flex flex-col overflow-hidden bg-black">
        <LikeProvider>
          <SubscriptionProvider>
            <CommentProvider>
              <SidebarProvider>
                <PlaylistProvider>
                  <TweetProvider>
                    <Navbar />
                    <Routes>
                      <Route
                        path="/"
                        element={<Home isSidebarOpen={isSidebarOpen} />}
                      />
                      <Route path="/login" element={<Login />} />
                      <Route path="/register" element={<Register />} />
                      <Route path="/watch/:videoId" element={<Watch />} />
                      <Route path="/feed/subscriptions" element={<Subscriptions />} />
                      <Route path="/feed/channels" element={<Channels />} />
                      <Route path="/feed/history" element={<History />} />
                      <Route path="/feed/playlists" element={<PlayLists />} />
                      <Route path="/feed/watch-later" element={<WatchLater />} />
                      <Route path="/:username/videos" element={<UserVideos />} />
                      <Route path="/feed/tweets" element={<Tweets />} />
                      <Route path="/account" element={<Settings />} />
                      <Route path="/feed/likes" element={<Likes />} />
                      <Route path="/:username" element={<Dashboard />} />
                      <Route path="/tweet/:tweetId" element={<SingleTweet />} />
                      <Route path="/create" element={<CreateVideo />} />
                      <Route path="/search" element={<Search />} />
                    </Routes>
                  </TweetProvider>
                </PlaylistProvider>
              </SidebarProvider>
            </CommentProvider>
          </SubscriptionProvider>
        </LikeProvider>
      </div>
    </Router>
  );
}

export default App;
