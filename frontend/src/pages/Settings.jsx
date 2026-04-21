import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Shield, Moon, Sun, Camera, Copy, Lock, Eye, Trash2, ShieldAlert, Check } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';
import axios from 'axios';

const Settings = () => {
  const { user, updateProfile, logout } = useAuth();
  const [copied, setCopied] = useState(false);
  const [name, setName] = useState(user.name);
  const [profileImage, setProfileImage] = useState(user.profile_image);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  const copyId = () => {
    navigator.clipboard.writeText(user.user_id);
    setCopied(true);
    toast.success('User ID copied to sanctuary clipboard', {
        style: {
            background: '#0B1120',
            color: '#fff',
            border: '1px solid rgba(139,92,246,0.2)',
            fontSize: '10px',
            textTransform: 'uppercase',
            fontWeight: 'bold',
            letterSpacing: '0.1em'
        }
    });
    setTimeout(() => setCopied(false), 2000);
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('image', file);

    setUploading(true);
    try {
        const { data } = await axios.post('http://localhost:5000/api/upload', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
                Authorization: `Bearer ${user.token}`
            }
        });
        setProfileImage(data.url);
        toast.success('Image uploaded successfully');
    } catch (error) {
        toast.error('Failed to upload image');
    } finally {
        setUploading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    const result = await updateProfile({ name, profile_image: profileImage });
    if (result.success) {
        toast.success('Sanctuary settings updated securely', {
            style: {
                background: '#0B1120',
                color: '#fff',
                border: '1px solid rgba(139,92,246,0.2)',
                fontSize: '10px',
                textTransform: 'uppercase',
                fontWeight: 'bold',
                letterSpacing: '0.1em'
            }
        });
    } else {
        toast.error(result.message);
    }
    setSaving(false);
  };

  const handleDiscard = () => {
    setName(user.name);
    setProfileImage(user.profile_image);
    toast('Changes discarded', { icon: '🔄' });
  };

  return (
    <div className="h-full flex flex-col p-6 md:p-10 overflow-hidden relative">
      {/* Bg Decor */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-pulse-indigo/5 blur-[120px] -z-10" />

      <div className="mb-8 md:mb-12">
        <h1 className="text-3xl md:text-5xl font-black text-white mb-2 md:mb-3 tracking-tight">Settings</h1>
        <p className="text-gray-500 font-medium text-sm md:text-lg leading-relaxed">Manage your digital sanctuary.</p>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar pr-4 pb-32">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Profile Identity */}
          <div className="glass p-10 rounded-[3rem] bg-[#0B1120]/40 border-white/5 col-span-1">
             <h4 className="text-[10px] text-gray-600 font-black uppercase tracking-[0.3em] mb-8">Profile Identity</h4>
             
             <div className="flex items-center gap-8 mb-10">
                <div className="relative group">
                    <div className="w-24 h-24 rounded-[2rem] overflow-hidden border-4 border-white/5 relative">
                        <img 
                            src={profileImage} 
                            className={`w-full h-full object-cover transition-opacity ${uploading ? 'opacity-30' : 'opacity-100'}`} 
                            alt="" 
                        />
                        {uploading && (
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div className="w-6 h-6 border-2 border-pulse-violet border-t-transparent rounded-full animate-spin" />
                            </div>
                        )}
                    </div>
                    <label className="absolute -bottom-2 -right-2 w-10 h-10 bg-pulse-violet rounded-2xl flex items-center justify-center border-4 border-[#020617] text-white cursor-pointer hover:scale-110 transition-transform active:scale-95 shadow-lg">
                        <Camera size={18} />
                        <input 
                            type="file" 
                            className="hidden" 
                            accept="image/*"
                            onChange={handleImageUpload}
                        />
                    </label>
                </div>
                <div className="flex-1 space-y-6">
                    <div>
                        <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-3 text-left">Display Name</label>
                        <input 
                            type="text" 
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Enter your name"
                            className="pulse-input bg-[#020617]/50 focus:border-pulse-violet/50 transition-all font-bold text-white"
                        />
                    </div>
                </div>
             </div>

             <div>
                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-3 text-left">Unique User ID</label>
                <div className="relative group">
                    <input 
                       type="text" 
                       readOnly
                       value={user.user_id}
                       className="pulse-input bg-[#020617]/80 pr-12 text-gray-400 font-mono tracking-widest border-white/5 group-hover:border-pulse-violet/20"
                    />
                    <button 
                        onClick={copyId}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-pulse-violet transition-colors"
                    >
                        {copied ? <Check size={18} className="text-green-500" /> : <Copy size={18} />}
                    </button>
                </div>
             </div>
          </div>

          {/* Security Controls */}
          <div className="glass p-10 rounded-[3rem] bg-[#0B1120]/40 border-white/5">
             <h4 className="text-[10px] text-gray-600 font-black uppercase tracking-[0.3em] mb-8">System Access</h4>
             <div className="space-y-6">
                <div className="flex items-center justify-between p-2">
                    <div>
                        <h4 className="text-sm font-black text-white uppercase tracking-tight mb-1">Email Visibility</h4>
                        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">{user.email}</p>
                    </div>
                    <div className="p-2 bg-green-500/10 rounded-lg text-green-500">
                        <Shield size={16} />
                    </div>
                </div>

                <div className="pt-6 border-t border-white/5">
                   <button 
                       onClick={logout}
                       className="flex items-center gap-3 text-red-500/50 hover:text-red-500 transition-colors group"
                   >
                      <Trash2 size={16} className="group-hover:scale-110 transition-transform" />
                      <span className="text-[10px] font-black uppercase tracking-widest">Sign Out Everywhere</span>
                   </button>
                </div>
             </div>
          </div>
        </div>
      </div>

      {/* Footer Actions */}
      <div className="absolute bottom-24 md:bottom-10 right-6 md:right-10 flex flex-col md:flex-row items-center gap-4 md:gap-8 bg-[#020617]/80 backdrop-blur-md p-4 md:p-2 md:pl-8 rounded-3xl border border-white/5 z-40">
        <button 
            onClick={handleDiscard}
            className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 hover:text-white transition-colors"
        >
            Discard
        </button>
        <button 
            onClick={handleSave}
            disabled={saving || uploading}
            className="w-full md:w-auto px-6 md:px-10 py-3 md:py-4 bg-pulse-indigo hover:bg-pulse-violet text-white font-black uppercase tracking-[0.1em] md:tracking-[0.2em] rounded-2xl shadow-[0_10px_35px_rgba(139,92,246,0.4)] transition-all active:scale-95 text-[10px] md:text-xs disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
        >
            {saving ? (
                <>
                    <div className="w-3 h-3 md:w-4 md:h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Saving...
                </>
            ) : 'Update Sanctuary'}
        </button>
      </div>
    </div>
  );
};

export default Settings;
