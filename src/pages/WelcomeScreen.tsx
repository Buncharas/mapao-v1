import { MessageCircle, Phone, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { getAvatarColor, getInitials, cn } from '../lib/utils';

export function WelcomeScreen() {
  const navigate = useNavigate();
  const { login } = useApp();
  const [loading, setLoading] = useState<string | null>(null);

  const [logoColor, setLogoColor] = useState('var(--color-primary)');

  const randomColors = [
    'var(--color-primary)',
    '#6366f1', // Indigo
    '#ec4899', // Pink
    '#f59e0b', // Amber
    '#10b981', // Emerald
    '#3b82f6', // Blue
    '#8b5cf6', // Violet
  ];

  const handleLogoClick = () => {
    const currentIndex = randomColors.indexOf(logoColor);
    let nextIndex;
    do {
      nextIndex = Math.floor(Math.random() * randomColors.length);
    } while (nextIndex === currentIndex);
    setLogoColor(randomColors[nextIndex]);
  };

  const handleLogin = (method: string) => {
    setLoading(method);
    // Simulate login delay
    setTimeout(() => {
      setLoading(null);
      // Mark that step 1 is done
      localStorage.setItem('mapao_auth_step1', 'true');
      navigate('/select-identity');
    }, 1000);
  };

  const { users } = useApp();

  return (
    <div className="min-h-screen bg-surface relative flex flex-col items-center justify-center p-8 overflow-hidden">
      {/* Background Elements */}
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

      <div className="relative z-10 w-full max-w-sm flex flex-col items-center justify-between h-full py-20 px-2">
        <div className="flex-1 flex flex-col items-center justify-center w-full">
          <motion.div 
            className="mb-12 relative cursor-pointer"
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleLogoClick}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
          >
            <h1 
              className="font-headline text-[4rem] font-black tracking-tighter leading-none text-center flex items-center transition-colors duration-300"
              style={{ color: logoColor }}
            >
              MAPAO?
            </h1>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 1 }}
            className="space-y-4 text-center"
          >
            <p className="text-on-surface-variant font-bold text-xl tracking-tight px-4">
              Plan together, show up together.
            </p>
            <p className="text-on-surface-variant/50 font-medium text-sm">
              Your academic life, beautifully sorted.
            </p>
          </motion.div>
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="w-full flex flex-col gap-4 pt-12"
        >
          <button 
            onClick={() => handleLogin('LINE')}
            disabled={!!loading}
            className="w-full group relative flex items-center justify-center gap-3 bg-[#06C755] text-white py-5 px-8 rounded-[2rem] font-label font-bold text-lg shadow-active active:scale-95 transition-all disabled:opacity-70 hover:shadow-lg hover:-translate-y-0.5"
          >
            {loading === 'LINE' ? <Loader2 className="w-5 h-5 animate-spin" /> : <MessageCircle className="w-5 h-5 fill-current" />}
            Continue with LINE
          </button>
          
          <button 
            onClick={() => handleLogin('Phone')}
            disabled={!!loading}
            className="w-full group relative flex items-center justify-center gap-3 bg-surface-container-highest text-primary py-5 px-8 rounded-[2rem] font-label font-bold text-lg active:scale-95 transition-all disabled:opacity-70 hover:bg-surface-container-highest/80"
          >
            {loading === 'Phone' ? <Loader2 className="w-5 h-5 animate-spin" /> : <Phone className="w-5 h-5" />}
            Continue with Phone
          </button>
          
          <p className="text-[10px] text-on-surface-variant/40 text-center mt-6 font-bold uppercase tracking-widest px-8">
            By continuing, you agree to our Terms & Privacy.
          </p>
        </motion.div>
      </div>
    </div>
  );
}
