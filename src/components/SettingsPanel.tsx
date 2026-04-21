import { motion, AnimatePresence } from 'motion/react';
import { useApp } from '../context/AppContext';
import { Settings, Bell, Shield, Moon, Volume2, HelpCircle, LogOut, ChevronRight } from 'lucide-react';
import { cn } from '../lib/utils';

export function SettingsPanel() {
  const { isSettingsOpen, toggleSettings, logout } = useApp();

  return (
    <AnimatePresence>
      {isSettingsOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={toggleSettings}
            className="fixed inset-0 bg-on-surface/40 backdrop-blur-sm z-40"
          />
          
          {/* Panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 h-full w-full max-w-sm bg-surface shadow-2xl z-40 flex flex-col pt-24"
          >
            <div className="flex-1 overflow-y-auto px-6 py-8 space-y-8">
              <section className="space-y-4">
                <h3 className="text-[10px] font-black text-on-surface-variant uppercase tracking-[0.2em] px-2 flex items-center gap-2">
                  <Shield className="w-3 h-3" /> Account & Security
                </h3>
                <div className="bg-surface-container-low rounded-[2rem] overflow-hidden border border-outline-variant/10 shadow-tactile">
                  <SettingItem icon={Settings} label="Global Preferences" />
                  <SettingItem icon={Bell} label="Notification Settings" />
                  <SettingItem icon={Shield} label="Privacy & Security" />
                </div>
              </section>

              <section className="space-y-4">
                <h3 className="text-[10px] font-black text-on-surface-variant uppercase tracking-[0.2em] px-2 flex items-center gap-2">
                  <Moon className="w-3 h-3" /> App Settings
                </h3>
                <div className="bg-surface-container-low rounded-[2rem] overflow-hidden border border-outline-variant/10 shadow-tactile">
                  <SettingItem icon={Moon} label="Appearance" detail="System Default" />
                  <SettingItem icon={Volume2} label="Sounds & Haptics" />
                  <SettingItem icon={HelpCircle} label="Help & Support" border={false} />
                </div>
              </section>

              <div className="pt-8">
                <button 
                  onClick={() => {
                    toggleSettings();
                    logout();
                  }}
                  className="w-full flex items-center justify-between p-6 rounded-[2rem] bg-error-container/10 border border-error/10 text-error hover:bg-error-container/20 transition-all active:scale-[0.98]"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-2xl bg-error-container flex items-center justify-center">
                      <LogOut className="w-5 h-5 text-on-error-container" />
                    </div>
                    <span className="font-headline font-bold">Log Out</span>
                  </div>
                </button>
              </div>
            </div>
            
            <div className="p-8 text-center bg-surface-container-lowest/50 border-t border-outline-variant/5">
              <span className="text-[10px] font-bold text-outline uppercase tracking-widest">MAPAO? v1.4.2 (Stable)</span>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

function SettingItem({ icon: Icon, label, detail, border = true }: { icon: any; label: string; detail?: string; border?: boolean }) {
  return (
    <button className={cn(
      "w-full flex items-center justify-between p-5 hover:bg-surface-container-high transition-colors active:bg-surface-container-highest group",
      border && "border-b border-outline-variant/5"
    )}>
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 rounded-2xl bg-surface-container-lowest flex items-center justify-center text-primary group-active:scale-90 transition-transform shadow-sm">
          <Icon className="w-5 h-5" />
        </div>
        <div className="text-left">
          <p className="font-bold text-on-surface text-sm">{label}</p>
          {detail && <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">{detail}</p>}
        </div>
      </div>
      <ChevronRight className="w-4 h-4 text-outline group-hover:translate-x-1 transition-transform" />
    </button>
  );
}
