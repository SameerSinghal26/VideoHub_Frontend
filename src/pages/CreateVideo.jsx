import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import Toast from '../Toast.jsx';
import { createVideo } from '../utils/api/auth';

function CreateVideo() {
  const { isAuthenticated } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  const [toast, setToast] = useState(null);

  const [form, setForm] = useState({
    title: '',
    description: '',
    videoFile: null,
    thumbnail: null,
  });

  const [loading, setLoading] = useState(false);

  // Redirect if not logged in
  React.useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login', { state: { error: 'Please login to upload a video.' } });
    }
  }, [isAuthenticated, navigate]);

  const showToast = (msg) => {
    setToast({ msg });
    setTimeout(() => setToast(null), 4000);
  };

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: files ? files[0] : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Validate fields
    if (!form.title || !form.description || !form.videoFile || !form.thumbnail) {
      showToast('All fields are required!');
      setLoading(false);
      return;
    }

    const formData = new FormData();
    formData.append('title', form.title);
    formData.append('description', form.description);
    formData.append('videoFile', form.videoFile);
    formData.append('thumbnail', form.thumbnail);

    try {
      await createVideo(formData);
      showToast('Video uploaded successfully!');
      setTimeout(() => navigate('/'), 1500);
    } catch (err) {
      showToast(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-black">
      <div className="fixed top-20 right-4 z-50">
        {toast && <Toast message={toast.msg} />}
      </div>
      <form
        onSubmit={handleSubmit}
        className="bg-zinc-800 p-8 rounded-lg shadow-lg w-full max-w-md space-y-4"
        encType="multipart/form-data"
      >
        <h2 className="text-2xl font-bold text-white mb-6 text-center">Upload Video</h2>
        <input
          type="text"
          name="title"
          placeholder="Title"
          className="w-full p-3 bg-zinc-700 text-white rounded border border-zinc-600"
          value={form.title}
          onChange={handleChange}
        />
        <textarea
          name="description"
          placeholder="Description"
          className="w-full p-2 bg-zinc-700 text-white rounded border border-zinc-600"
          value={form.description}
          onChange={handleChange}
        />
        <span className='text-white'>Video</span>
        <input
          type="file"
          name="videoFile"
          accept="video/*"
          className="w-full p-3 bg-zinc-700 text-white rounded border border-zinc-600"
          onChange={handleChange}
        />
        <span className='text-white'>Thumbnail</span>
        <input
          type="file"
          name="thumbnail"
          accept="image/*"
          className="w-full p-3 bg-zinc-700 text-white rounded border border-zinc-600"
          onChange={handleChange}
        />
        <button
          type="submit"
          className="w-full bg-red-600 text-white p-3 rounded hover:bg-red-700 transition-colors disabled:opacity-50"
          disabled={loading}
        >
          {loading ? 'Uploading...' : 'Upload Video'}
        </button>
      </form>
    </div>
  );
}

export default CreateVideo;