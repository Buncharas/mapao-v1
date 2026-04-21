import { Settings } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { getAvatarColor, getInitials, cn } from '../lib/utils';
import { motion } from 'motion/react';
import { SettingsPanel } from './SettingsPanel';

export function Header() {
  const navigate = useNavigate();
  const { user, isSettingsOpen, toggleSettings } = useApp();
  const colors = getAvatarColor(user.id, user.avatarColorIndex);
  
  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 bg-surface/80 backdrop-blur-xl border-b border-outline-variant/10 shadow-tactile">
        <div className="flex items-center gap-3">
          <div className={cn(
            "w-10 h-10 rounded-full overflow-hidden border-2 border-primary-container shadow-sm flex items-center justify-center",
            colors.bg
          )}>
            <span className={cn("font-black text-xs", colors.text)}>
              {getInitials(user.name)}
            </span>
          </div>
          <span 
            onClick={() => navigate('/dashboard')}
            className="text-2xl font-black text-primary tracking-tighter cursor-pointer"
          >
            MAPAO?
          </span>
        </div>
        <button 
          onClick={toggleSettings}
          className={cn(
            "w-10 h-10 flex items-center justify-center rounded-full transition-all active:scale-90 duration-300 relative z-50",
            isSettingsOpen ? "bg-primary text-on-primary shadow-active" : "bg-surface-container-highest/50 hover:bg-surface-container-highest text-primary"
          )}
        >
          <motion.div
            animate={{ rotate: isSettingsOpen ? 180 : 0 }}
            transition={{ type: "spring", damping: 15 }}
          >
            <Settings className={cn("w-5 h-5", isSettingsOpen && "fill-current")} />
          </motion.div>
        </button>
      </header>
      <SettingsPanel />
    </>
  );
}
