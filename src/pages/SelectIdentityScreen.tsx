import { motion } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { getAvatarColor, getInitials, cn } from '../lib/utils';
import { Loader2 } from 'lucide-react';
import { useState } from 'react';

export function SelectIdentityScreen() {
  const navigate = useNavigate();
  const { users, login } = useApp();
  const [loading, setLoading] = useState<string | null>(null);

  const handleSelect = (userId: string) => {
    setLoading(userId);
    setTimeout(() => {
      login(userId);
      setLoading(null);
      navigate('/dashboard');
    }, 800);
  };

  return (
    <div className="min-h-screen bg-surface relative flex flex-col items-center justify-center p-8 overflow-hidden">
      {/* Background Elements - Matching WelcomeScreen */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary-container/10 rounded-full blur-[100px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-secondary-container/10 rounded-full blur-[120px]" />
        
        <motion.div 
          animate={{ 
            y: [0, -20, 0],
            scale: [1, 1.05, 1],
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-[20%] right-[15%] w-32 h-32 bg-primary/5 rounded-full blur-2xl"
        />
        <motion.div 
          animate={{ 
            y: [0, 30, 0],
            scale: [1, 1.1, 1],
          }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className="absolute bottom-[25%] left-[10%] w-48 h-48 bg-secondary/5 rounded-full blur-3xl"
        />
      </div>

      <div className="relative z-10 w-full max-w-sm flex flex-col items-center justify-center h-full py-20 px-2 text-center">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          className="mb-12"
        >
          <h2 className="font-headline text-4xl font-black text-on-surface tracking-tighter leading-tight mb-4">
            Welcome back !
          </h2>
          <p className="text-on-surface-variant/60 font-medium text-sm px-8 leading-relaxed">
            Choose your identity to access your academic planner and shared events.
          </p>
        </motion.div>

        <div className="w-full space-y-4">
          {users.map((user, idx) => (
            <motion.button
              key={user.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + idx * 0.1, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleSelect(user.id)}
              disabled={!!loading}
              className={cn(
                "w-full group relative flex items-center gap-4 bg-surface-container-lowest border border-outline-variant/10 text-on-surface p-5 rounded-[2rem] font-label shadow-sm transition-all disabled:opacity-70",
                loading === user.id ? "ring-2 ring-primary border-transparent" : "hover:shadow-active hover:border-outline-variant/30"
              )}
            >
              <div className={cn(
                "w-16 h-16 rounded-full flex items-center justify-center shrink-0 shadow-sm border border-white/20",
                getAvatarColor(user.id, user.avatarColorIndex).bg
              )}>
                <span className={cn("font-black text-xl", getAvatarColor(user.id, user.avatarColorIndex).text)}>
                  {getInitials(user.name)}
                </span>
              </div>
              <div className="flex-1 text-left">
                <h4 className="font-black text-xl tracking-tight leading-none group-hover:text-primary transition-colors">{user.name}</h4>
                <p className="text-xs text-on-surface-variant mt-2 font-medium opacity-60 leading-tight">
                  {user.role}
                </p>
              </div>
              {loading === user.id ? (
                <Loader2 className="w-5 h-5 animate-spin text-primary" />
              ) : (
                <div className="w-10 h-10 rounded-full bg-surface-variant/30 flex items-center justify-center text-on-surface-variant group-hover:bg-primary group-hover:text-on-primary transition-all duration-300">
                  <span className="text-2xl">→</span>
                </div>
              )}
            </motion.button>
          ))}
        </div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 1 }}
          className="text-[10px] text-on-surface-variant/40 text-center mt-12 font-bold uppercase tracking-widest px-8"
        >
          SIMULATED MULTI-USER SESSION ACTIVE
        </motion.p>
      </div>
    </div>
  );
}

