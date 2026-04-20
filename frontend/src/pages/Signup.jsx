import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { Mail, Lock, User, UserPlus, Image as ImageIcon } from 'lucide-react';

const Signup = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    profile_image: ''
  });
  const [error, setError] = useState('');
  const [imagePreview, setImagePreview] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    // Use FormData for file upload
    const data = new FormData();
    data.append('name', formData.name);
    data.append('email', formData.email);
    data.append('password', formData.password);
    if (imageFile) {
        data.append('profile_image', imageFile);
    }

    const res = await register(data);
    if (res.success) {
      navigate('/');
    } else {
      setError(res.message);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md p-8 glass rounded-3xl"
      >
        <div className="flex flex-col items-center mb-6">
          <div className="p-4 mb-4 bg-violet-600 rounded-2xl shadow-xl shadow-violet-500/20">
            <UserPlus size={32} className="text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Create Account</h1>
          <p className="text-gray-400 text-center">Join our community and start chatting</p>
        </div>

        {error && (
          <div className="p-3 mb-6 bg-red-500/10 border border-red-500/50 rounded-xl text-red-500 text-sm text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Profile Image Upload */}
          <div className="flex flex-col items-center mb-4">
            <label className="relative cursor-pointer group">
              <div className="w-24 h-24 rounded-full border-2 border-dashed border-violet-500/50 flex items-center justify-center overflow-hidden bg-dark-surface/50 transition-all group-hover:border-violet-500">
                {imagePreview ? (
                  <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <div className="flex flex-col items-center text-gray-500">
                    <ImageIcon size={24} />
                    <span className="text-[10px] mt-1">Upload</span>
                  </div>
                )}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                    <UserPlus size={20} className="text-white" />
                </div>
              </div>
              <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
            </label>
            <p className="text-[10px] text-gray-500 mt-2 uppercase tracking-widest font-bold">Set Profile Picture</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Full Name</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
              <input 
                type="text" 
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="w-full pl-11 pr-4 py-2.5 bg-dark-surface/50 border border-white/5 rounded-xl focus:border-indigo-500 outline-none transition-all text-white"
                placeholder="John Doe"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
              <input 
                type="email" 
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                className="w-full pl-11 pr-4 py-2.5 bg-dark-surface/50 border border-white/5 rounded-xl focus:border-indigo-500 outline-none transition-all text-white"
                placeholder="yours@example.com"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
              <input 
                type="password" 
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                className="w-full pl-11 pr-4 py-2.5 bg-dark-surface/50 border border-white/5 rounded-xl focus:border-indigo-500 outline-none transition-all text-white"
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          <button 
                type="submit"
                className="w-full py-3 mt-4 bg-violet-600 hover:bg-violet-700 text-white font-semibold rounded-xl shadow-lg shadow-violet-500/30 transition-all active:scale-95"
          >
            Create Account
          </button>
        </form>

        <p className="mt-6 text-center text-gray-400 text-sm">
          Already have an account? {' '}
          <Link to="/login" className="text-violet-400 hover:text-violet-300 font-semibold underline underline-offset-4">
            Sign In
          </Link>
        </p>
      </motion.div>
    </div>
  );
};

export default Signup;
