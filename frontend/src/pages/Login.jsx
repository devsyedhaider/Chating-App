import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { Mail, Lock, ArrowRight, Eye, EyeOff } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const res = await login(email, password);
    if (res.success) {
      navigate('/');
    } else {
      setError(res.message);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-[#020617] relative">
      {/* Background Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-pulse-violet/5 blur-[120px] rounded-full -z-10" />

      <div className="mb-12 text-center">
        <h1 className="text-5xl font-bold text-white mb-2 tracking-tight">Pulse</h1>
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500">The Nocturnal Sanctuary</p>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-[440px] p-10 glass rounded-[2.5rem] border-white/5 relative bg-[#0B1120]/60"
      >
        <div className="mb-10">
          <h2 className="text-3xl font-bold text-white mb-2">Welcome back</h2>
          <p className="text-gray-500 text-sm">Enter your credentials to access your sanctuary.</p>
        </div>

        {error && (
          <div className="p-4 mb-6 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400 text-xs text-center font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-3">Email Address</label>
            <div className="relative group">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 transition-colors group-focus-within:text-pulse-violet" size={18} />
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pulse-input pl-12 bg-[#020617]/50 border-white/5 hover:border-white/10"
                placeholder="julian.rossi@pulse.io"
                required
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-3">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Password</label>
                <button type="button" className="text-[10px] font-bold text-pulse-violet uppercase tracking-widest hover:text-white transition-colors">Forgot?</button>
            </div>
            <div className="relative group">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 transition-colors group-focus-within:text-pulse-violet" size={18} />
              <input 
                type={showPassword ? "text" : "password"} 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pulse-input pl-12 pr-12 bg-[#020617]/50 border-white/5 hover:border-white/10"
                placeholder="••••••••"
                required
              />
              <button 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gray-400"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button 
            type="submit"
            className="w-full py-4 mt-4 bg-pulse-indigo hover:bg-pulse-violet text-white font-bold rounded-2xl shadow-[0_0_20px_rgba(139,92,246,0.2)] transition-all active:scale-95 flex items-center justify-center gap-2"
          >
            Login to Pulse <ArrowRight size={20} />
          </button>
        </form>

        <div className="relative mt-8 mb-8 flex items-center justify-center">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/5"></div></div>
            <span className="relative px-4 bg-[#0B1120] text-[10px] font-bold text-gray-600 uppercase tracking-widest">Or Secure Connect</span>
        </div>

        <div className="grid grid-cols-2 gap-4">
            <button className="flex items-center justify-center py-3 bg-[#020617]/50 border border-white/5 rounded-2xl hover:bg-white/5 transition-colors">
                <div className="w-5 h-5 bg-gray-800 rounded-sm"></div>
            </button>
            <button className="flex items-center justify-center py-3 bg-[#020617]/50 border border-white/5 rounded-2xl hover:bg-white/5 transition-colors">
                <div className="w-5 h-5 bg-gray-800 rounded-sm"></div>
            </button>
        </div>
      </motion.div>

      <p className="mt-12 text-center text-gray-500 text-xs">
        New to the pulse? {' '}
        <Link to="/signup" className="text-white hover:text-pulse-violet font-bold transition-all">
          Create Account
        </Link>
      </p>

      {/* Footer Branding */}
      <div className="absolute bottom-8 right-8 text-[10px] font-bold text-gray-700 uppercase tracking-[0.3em]">
        Encrypted Sanctuary V2.4
      </div>
    </div>
  );
};

export default Login;
