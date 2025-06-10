import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useSidebar } from '../context/SideBarContext';
import { updateUserAccount, updateUserBio, updateUserAvatar, updateUserCoverImage, changePassword } from '../utils/api/auth';
import Toast from '../Toast';

function Settings() {
  const { user } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  const { isSidebarOpen } = useSidebar();
  const [activeTab, setActiveTab] = useState('account');
  const [toast, setToast] = useState(null);
  const [loading, setLoading] = useState(false);

  // Authentication check
  useEffect(() => {
    if (!user) {
      navigate('/login', { state: { error: "Please login to access settings" } });
      return;
    }
  }, [user, navigate]);

  // Account update form
  const [accountForm, setAccountForm] = useState({
    fullName: '',
    email: '',
  });

  // Bio update form
  const [bioForm, setBioForm] = useState({
    bio: '',
  });

  // Password change form
  const [passwordForm, setPasswordForm] = useState({
    oldpassword: '',
    newpassword: '',
    confpassword: '',
  });

  // File upload states
  const [selectedAvatar, setSelectedAvatar] = useState(null);
  const [selectedCover, setSelectedCover] = useState(null);
  const avatarInputRef = React.useRef(null);
  const coverInputRef = React.useRef(null);

  useEffect(() => {
    if (!user) {
      navigate('/login', { state: { error: 'Please login to access settings' } });
      return;
    }

    // Initialize forms with user data
    setAccountForm({
      fullName: user.fullName || '',
      email: user.email || '',
    });
    setBioForm({
      bio: user.bio || '',
    });
  }, [user, navigate]);

  const showToast = (message) => {
    setToast({ message });
    setTimeout(() => setToast(null), 3000);
  };

  const handleAccountUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await updateUserAccount(accountForm);
      showToast('Account updated successfully');
    } catch (error) {
      showToast(error.message || 'Failed to update account');
    } finally {
      setLoading(false);
    }
  };

  const handleBioUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await updateUserBio(bioForm);
      showToast('Bio updated successfully');
    } catch (error) {
      showToast(error.message || 'Failed to update bio');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (passwordForm.newpassword !== passwordForm.confpassword) {
      showToast('New passwords do not match');
      return;
    }
    setLoading(true);
    try {
      await changePassword({
        oldpassword: passwordForm.oldpassword,
        newpassword: passwordForm.newpassword,
        confpassword: passwordForm.confpassword,
      });
      showToast('Password changed successfully');
      setPasswordForm({
        oldpassword: '',
        newpassword: '',
        confpassword: '',
      });
    } catch (error) {
      showToast(error.message || 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setSelectedAvatar(file);
    const formData = new FormData();
    formData.append('avatar', file);

    try {
      await updateUserAvatar(formData);
      showToast('Profile picture updated successfully');
    } catch (error) {
      showToast(error.message || 'Failed to update profile picture');
    }
  };

  const handleCoverChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setSelectedCover(file);
    const formData = new FormData();
    formData.append('coverImage', file);

    try {
      await updateUserCoverImage(formData);
      showToast('Cover image updated successfully');
    } catch (error) {
      showToast(error.message || 'Failed to update cover image');
    }
  };

  if (!user) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className={`min-h-screen bg-black text-white p-4 mt-22 ${isSidebarOpen ? 'ml-60' : 'ml-20'}`}>
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Settings</h1>

        {/* Tabs */}
        <div className="flex gap-8 border-b border-gray-700 mb-8">
          <button
            className={`pb-2 px-2 text-lg font-semibold transition relative ${
              activeTab === 'account'
                ? 'text-white'
                : 'text-gray-400 hover:text-white'
            }`}
            onClick={() => setActiveTab('account')}
          >
            Account
            {activeTab === 'account' && (
              <span className="absolute left-0 right-0 -bottom-[2px] h-[3px] bg-white rounded-full"></span>
            )}
          </button>
          <button
            className={`pb-2 px-2 text-lg font-semibold transition relative ${
              activeTab === 'profile'
                ? 'text-white'
                : 'text-gray-400 hover:text-white'
            }`}
            onClick={() => setActiveTab('profile')}
          >
            Profile
            {activeTab === 'profile' && (
              <span className="absolute left-0 right-0 -bottom-[2px] h-[3px] bg-white rounded-full"></span>
            )}
          </button>
          <button
            className={`pb-2 px-2 text-lg font-semibold transition relative ${
              activeTab === 'security'
                ? 'text-white'
                : 'text-gray-400 hover:text-white'
            }`}
            onClick={() => setActiveTab('security')}
          >
            Security
            {activeTab === 'security' && (
              <span className="absolute left-0 right-0 -bottom-[2px] h-[3px] bg-white rounded-full"></span>
            )}
          </button>
        </div>

        {/* Account Settings */}
        {activeTab === 'account' && (
          <div className="space-y-6">
            <form onSubmit={handleAccountUpdate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Full Name</label>
                <input
                  type="text"
                  value={accountForm.fullName}
                  onChange={(e) => setAccountForm({ ...accountForm, fullName: e.target.value })}
                  className="w-full px-4 py-2 bg-neutral-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Email</label>
                <input
                  type="email"
                  value={accountForm.email}
                  onChange={(e) => setAccountForm({ ...accountForm, email: e.target.value })}
                  className="w-full px-4 py-2 bg-neutral-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? 'Updating...' : 'Update Account'}
              </button>
            </form>
          </div>
        )}

        {/* Profile Settings */}
        {activeTab === 'profile' && (
          <div className="space-y-6">
            {/* Avatar Upload */}
            <div>
              <label className="block text-sm font-medium mb-2">Profile Picture</label>
              <div className="flex items-center gap-4">
                <img
                  src={user.avatar || "/download.webp"}
                  alt="Profile"
                  className="w-20 h-20 rounded-full object-cover"
                />
                <input
                  type="file"
                  ref={avatarInputRef}
                  onChange={handleAvatarChange}
                  accept="image/*"
                  className="hidden"
                />
                <button
                  onClick={() => avatarInputRef.current?.click()}
                  className="px-4 py-2 bg-neutral-800 rounded-lg hover:bg-neutral-700"
                >
                  Change Picture
                </button>
              </div>
            </div>

            {/* Cover Image Upload */}
            <div>
              <label className="block text-sm font-medium mb-2">Cover Image</label>
              <div className="space-y-2">
                <img
                  src={user.coverImage || "/DeafultBanner.png"}
                  alt="Cover"
                  className="w-full h-40 object-cover rounded-lg"
                />
                <input
                  type="file"
                  ref={coverInputRef}
                  onChange={handleCoverChange}
                  accept="image/*"
                  className="hidden"
                />
                <button
                  onClick={() => coverInputRef.current?.click()}
                  className="px-4 py-2 bg-neutral-800 rounded-lg hover:bg-neutral-700"
                >
                  Change Cover Image
                </button>
              </div>
            </div>

            {/* Bio Update */}
            <form onSubmit={handleBioUpdate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Bio</label>
                <textarea
                  value={bioForm.bio}
                  onChange={(e) => setBioForm({ ...bioForm, bio: e.target.value })}
                  rows="4"
                  className="w-full px-4 py-2 bg-neutral-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? 'Updating...' : 'Update Bio'}
              </button>
            </form>
          </div>
        )}

        {/* Security Settings */}
        {activeTab === 'security' && (
          <div className="space-y-6">
            <form onSubmit={handlePasswordChange} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Current Password</label>
                <input
                  type="password"
                  value={passwordForm.oldpassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, oldpassword: e.target.value })}
                  className="w-full px-4 py-2 bg-neutral-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">New Password</label>
                <input
                  type="password"
                  value={passwordForm.newpassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, newpassword: e.target.value })}
                  className="w-full px-4 py-2 bg-neutral-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Confirm New Password</label>
                <input
                  type="password"
                  value={passwordForm.confpassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, confpassword: e.target.value })}
                  className="w-full px-4 py-2 bg-neutral-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? 'Changing...' : 'Change Password'}
              </button>
            </form>
          </div>
        )}
      </div>

      {/* Toast Messages */}
      {toast && <Toast message={toast.message} />}
    </div>
  );
}

export default Settings;