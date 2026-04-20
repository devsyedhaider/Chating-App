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
    <div className="flex flex-col items-center justify-center h-screen w-full p-4 bg-[#020617] relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-pulse-indigo/5 blur-[120px] -z-10" />
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-pulse-violet/5 blur-[120px] -z-10" />

      <div className="mb-6 text-center">
        <p className="text-pulse-violet text-[10px] font-bold tracking-[0.4em] mb-2 uppercase italic">Nocturnal</p>
        <h1 className="text-4xl font-bold text-white mb-2 tracking-tight">Join Sanctuary</h1>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-[420px] p-8 glass rounded-[2.5rem] border-white/5 relative bg-[#0B1120]/60"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Profile Identity Section */}
          <div className="flex flex-col items-center mb-6 relative">
            <label className="relative cursor-pointer group">
              <div className="w-24 h-24 rounded-[2rem] border border-white/10 flex items-center justify-center overflow-hidden bg-[#020617] transition-all group-hover:border-pulse-violet/50 shadow-2xl relative">
                {imagePreview ? (
                  <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <div className="flex flex-col items-center text-gray-700">
                    <Camera size={24} strokeWidth={1.5} />
                  </div>
                )}
                {/* Plus Button Overlay */}
                <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-pulse-violet rounded-xl flex items-center justify-center shadow-lg border-2 border-[#0B1120]">
                    <UserPlus size={14} className="text-white" />
                </div>
              </div>
              <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
            </label>
            <p className="text-[9px] text-gray-600 mt-4 uppercase tracking-[0.4em] font-black">Identity</p>
          </div>

          {error && (
            <div className="p-3 mb-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-[10px] text-center font-bold">
              {error}
            </div>
          )}

          <div>
            <label className="block text-[9px] font-bold text-gray-500 uppercase tracking-widest mb-2">Full Name</label>
            <input 
                type="text" 
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="w-full py-3 px-5 bg-[#020617]/50 border border-white/5 rounded-xl text-white text-sm outline-none transition-all focus:border-pulse-violet/30"
                placeholder="Alex Sterling"
                required
              />
          </div>

          <div>
            <label className="block text-[9px] font-bold text-gray-500 uppercase tracking-widest mb-2">Email Address</label>
            <input 
                type="email" 
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                className="w-full py-3 px-5 bg-[#020617]/50 border border-white/5 rounded-xl text-white text-sm outline-none transition-all focus:border-pulse-violet/30"
                placeholder="alex@pulse.io"
                required
              />
          </div>

          <div>
            <label className="block text-[9px] font-bold text-gray-500 uppercase tracking-widest mb-2">Secret Password</label>
            <input 
                type="password" 
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                className="w-full py-3 px-5 bg-[#020617]/50 border border-white/5 rounded-xl text-white text-sm outline-none transition-all focus:border-pulse-violet/30"
                placeholder="••••••••"
                required
              />
          </div>

          <button 
                type="submit"
                className="w-full py-3.5 mt-4 bg-pulse-indigo hover:bg-pulse-violet text-white text-xs font-black uppercase tracking-[0.2em] rounded-xl shadow-xl transition-all active:scale-95 flex items-center justify-center gap-3"
          >
            Create <ArrowRight size={18} />
          </button>
        </form>
      </motion.div>

      <p className="mt-8 text-center text-gray-600 text-[10px] font-bold uppercase tracking-widest">
        Active resident? {' '}
        <Link to="/login" className="text-white hover:text-pulse-violet transition-colors">
          Login here
        </Link>
      </p>
    </div>
  );
};

export default Signup;
