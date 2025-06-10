import React, { useEffect } from 'react';
import { usePlaylist } from '../context/PlaylistContext';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

const UsersPlaylist = () => {
    const { userId } = useParams(); // Get userId from URL
    const { otherUserPlaylists, loading, error, fetchOtherUserPlaylists } = usePlaylist();
    const navigate = useNavigate();
    const auth = useSelector((state) => state.auth);

    // Authentication check
    useEffect(() => {
        if (!auth.user) {
            navigate('/login', { state: { error: "Please login to view playlists" } });
            return;
        }
    }, [auth.user, navigate]);

    useEffect(() => {
        if (userId) {
            fetchOtherUserPlaylists(userId);
        }
    }, [userId, fetchOtherUserPlaylists]);

    if (loading) return <div>Loading...</div>;
    if (error) return <div>{error}</div>;

    return (
        <div className="playlists-container">
            <h2>User's Playlists</h2>
            {otherUserPlaylists.map((playlist) => (
                <div key={playlist._id} className="playlist-card">
                    <h3>{playlist.name}</h3>
                    <p>{playlist.description}</p>
                    <p>{playlist.videos.length} videos</p>
                    <button onClick={() => handleCopyPlaylist(playlist._id)}>
                        Copy Playlist
                    </button>
                </div>
            ))}
        </div>
    );
};

export default UsersPlaylist;
