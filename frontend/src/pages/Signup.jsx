import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { Mail, Lock, User, ArrowRight, Camera, UserPlus } from 'lucide-react';

const Signup = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
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
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-[#020617] relative">
      {/* Background Decor */}
      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-pulse-indigo/5 blur-[150px] -z-10 animate-glow" />
      <div className="absolute bottom-0 left-0 w-[800px] h-[800px] bg-pulse-violet/5 blur-[150px] -z-10 animate-glow" />

      <div className="mb-8 text-center">
        <p className="text-pulse-violet text-sm font-bold tracking-[0.2em] mb-4 uppercase">Nocturnal</p>
        <h1 className="text-6xl font-bold text-white mb-6 tracking-tight">Join the Sanctuary</h1>
        <p className="text-gray-400 text-center max-w-md mx-auto text-lg leading-relaxed">
            Experience the pulse of a premium digital sanctuary. Create your presence.
        </p>
      </div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-[480px] p-10 glass rounded-[3rem] border-white/5 relative bg-[#0B1120]/60 overflow-hidden"
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Profile Identity Section */}
          <div className="flex flex-col items-center mb-10 relative">
            <label className="relative cursor-pointer group">
              <div className="w-32 h-32 rounded-3xl border border-white/10 flex items-center justify-center overflow-hidden bg-[#020617] transition-all group-hover:border-pulse-violet/50 shadow-2xl relative">
                {imagePreview ? (
                  <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <div className="flex flex-col items-center text-gray-700">
                    <div className="w-16 h-16 rounded-full border-2 border-white/5 flex items-center justify-center mb-2">
                        <Camera size={32} strokeWidth={1.5} />
                    </div>
                  </div>
                )}
                {/* Plus Button Overlay */}
                <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-pulse-violet rounded-2xl flex items-center justify-center shadow-[0_0_15px_rgba(139,92,246,0.5)] border-2 border-[#0B1120]">
                    <UserPlus size={18} className="text-white" />
                </div>
              </div>
              <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
            </label>
            <p className="text-[10px] text-gray-500 mt-6 uppercase tracking-[0.4em] font-black">Profile Identity</p>
          </div>

          {error && (
            <div className="p-4 mb-6 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400 text-xs text-center">
              {error}
            </div>
          )}

          <div>
            <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-3">Full Name</label>
            <div className="relative group">
              <input 
                type="text" 
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="pulse-input bg-[#020617]/50"
                placeholder="Alex Sterling"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-3">Email Address</label>
            <div className="relative">
              <input 
                type="email" 
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                className="pulse-input bg-[#020617]/50"
                placeholder="alex@sanctuary.com"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-3">Secret Password</label>
            <div className="relative">
              <input 
                type="password" 
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                className="pulse-input bg-[#020617]/50"
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          <button 
                type="submit"
                className="w-full py-4 mt-8 bg-pulse-indigo hover:bg-pulse-violet text-white font-bold rounded-2xl shadow-[0_10px_25px_rgba(99,102,241,0.2)] transition-all active:scale-95 flex items-center justify-center gap-3"
          >
            Create Account <ArrowRight size={22} />
          </button>
        </form>
      </motion.div>

      <p className="mt-12 text-center text-gray-500 text-sm">
        Already have an account? {' '}
        <Link to="/login" className="text-white hover:text-pulse-violet font-bold transition-all">
          Login
        </Link>
      </p>
    </div>
  );
};

export default Signup;
