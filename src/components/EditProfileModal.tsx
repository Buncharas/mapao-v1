import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Save, User, Palette } from 'lucide-react';
import { cn, getAvatarColor, getInitials, avatarColors, bannerGradients } from '../lib/utils';
import { useApp } from '../context/AppContext';

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function EditProfileModal({ isOpen, onClose }: EditProfileModalProps) {
  const { user, updateUser } = useApp();
  const [editName, setEditName] = useState(user.name);
  const [editAvatarIndex, setEditAvatarIndex] = useState(user.avatarColorIndex || 0);
  const [editBannerIndex, setEditBannerIndex] = useState(user.bannerGradientIndex || 0);

  const colors = getAvatarColor(user.id, editAvatarIndex);
  const currentBanner = bannerGradients[editBannerIndex];

  const handleSave = () => {
    if (!editName.trim()) return;
    updateUser({
      name: editName,
      avatarColorIndex: editAvatarIndex,
      bannerGradientIndex: editBannerIndex,
    });
    onClose();
  };

  const handleCancel = () => {
    setEditName(user.name);
    setEditAvatarIndex(user.avatarColorIndex || 0);
    setEditBannerIndex(user.bannerGradientIndex || 0);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleCancel}
            className="fixed inset-0 bg-on-surface/40 backdrop-blur-md z-[100]"
          />

          {/* Modal Container */}
          <div className="fixed inset-0 flex items-center justify-center pointer-events-none z-[101] px-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="w-full max-w-lg bg-surface rounded-[2.5rem] shadow-2xl overflow-hidden pointer-events-auto border border-outline-variant/10"
            >
              {/* Modal Header/Banner */}
              <div className="relative h-40 w-full overflow-hidden">
                <div className={cn(
                  "absolute inset-0 bg-gradient-to-br transition-all duration-500",
                  currentBanner
                )} />
                <button
                  onClick={handleCancel}
                  className="absolute top-4 right-4 w-10 h-10 rounded-full bg-surface/20 backdrop-blur-md text-white flex items-center justify-center hover:bg-surface/40 transition-all active:scale-95 z-20"
                >
                  <X className="w-5 h-5" />
                </button>
                <div className="absolute inset-0 bg-black/10 pointer-events-none" />
              </div>

              {/* Profile Preview (Floating) */}
              <div className="px-8 -mt-16 relative z-10 flex flex-col items-center">
                <div className={cn(
                  "w-32 h-32 rounded-full border-4 border-surface shadow-tactile flex items-center justify-center transition-colors duration-500 mb-4",
                  colors.bg
                )}>
                  <span className={cn("font-black text-4xl", colors.text)}>
                    {getInitials(editName)}
                  </span>
                </div>
              </div>

              {/* Modal Body */}
              <div className="px-8 pb-8 pt-4 space-y-8">
                {/* Name Input */}
                <div className="space-y-3">
                  <label className="flex items-center gap-2 text-xs font-black text-primary uppercase tracking-widest pl-1">
                    <User className="w-3 h-3" /> Display Name
                  </label>
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    placeholder="Your display name..."
                    className="w-full bg-surface-container-low border-2 border-transparent focus:border-primary/20 rounded-2xl px-6 py-4 text-xl font-bold text-on-surface outline-none transition-all"
                  />
                  {!editName.trim() && (
                    <p className="text-[10px] text-error font-black uppercase tracking-widest pl-2">Name cannot be empty</p>
                  )}
                </div>

                {/* Avatar Color Selector */}
                <div className="space-y-3">
                  <label className="flex items-center gap-2 text-xs font-black text-primary uppercase tracking-widest pl-1">
                    <Palette className="w-3 h-3" /> Avatar Style
                  </label>
                  <div className="flex flex-wrap gap-3 p-4 bg-surface-container-low rounded-2xl">
                    {avatarColors.map((color, idx) => (
                      <button
                        key={idx}
                        onClick={() => setEditAvatarIndex(idx)}
                        className={cn(
                          "w-8 h-8 rounded-full transition-all relative",
                          color.bg,
                          editAvatarIndex === idx ? "ring-2 ring-primary ring-offset-2 scale-110 shadow-active" : "opacity-60 hover:opacity-100"
                        )}
                      >
                        {editAvatarIndex === idx && <div className="absolute inset-0 flex items-center justify-center"><div className="w-1.5 h-1.5 rounded-full bg-primary" /></div>}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Banner Gradient Selector */}
                <div className="space-y-3">
                  <label className="flex items-center gap-2 text-xs font-black text-primary uppercase tracking-widest pl-1">
                    <Palette className="w-3 h-3" /> Background Theme
                  </label>
                  <div className="flex gap-3 p-4 bg-surface-container-low rounded-2xl overflow-x-auto no-scrollbar">
                    {bannerGradients.map((gradient, idx) => (
                      <button
                        key={gradient}
                        onClick={() => setEditBannerIndex(idx)}
                        className={cn(
                          "w-12 h-10 rounded-xl bg-gradient-to-br transition-all shrink-0 relative",
                          gradient,
                          editBannerIndex === idx ? "ring-2 ring-primary ring-offset-2 shadow-active scale-105" : "opacity-60 hover:opacity-100"
                        )}
                      >
                         {editBannerIndex === idx && <div className="absolute inset-0 flex items-center justify-center"><div className="w-2 h-2 rounded-full bg-white shadow-sm" /></div>}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-4 pt-4">
                  <button
                    onClick={handleCancel}
                    className="flex-1 bg-surface-container-high text-on-surface font-bold py-4 px-6 rounded-2xl active:scale-95 transition-all text-sm uppercase tracking-widest"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={!editName.trim()}
                    className="flex-[2] bg-gradient-to-br from-primary to-primary-container text-on-primary font-black py-4 px-6 rounded-2xl shadow-active active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50 text-sm uppercase tracking-widest"
                  >
                    <Save className="w-4 h-4" /> Save Changes
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
