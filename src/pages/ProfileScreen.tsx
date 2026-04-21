import { Settings, MapPin, School, History, Calendar as CalendarIcon, Award, Star, Users, Map, Edit, Check, LogOut, Edit2, X, Save } from 'lucide-react';
import { IMAGES } from '../constants';
import { BottomNav } from '../components/BottomNav';
import { motion, AnimatePresence } from 'motion/react';
import { useApp } from '../context/AppContext';
import { useState } from 'react';
import { getAvatarColor, getInitials, cn, bannerGradients } from '../lib/utils';
import { SettingsPanel } from '../components/SettingsPanel';
import { EditProfileModal } from '../components/EditProfileModal';

type AvailabilityStatus = 'Definitely' | 'Probably' | 'Unavailable';

export function ProfileScreen() {
  const { user, logout, isSettingsOpen, toggleSettings } = useApp();
  const [isEditing, setIsEditing] = useState(false);

  const colors = getAvatarColor(user.id, user.avatarColorIndex);
  const currentBanner = bannerGradients[user.bannerGradientIndex || 0];
  const [availability, setAvailability] = useState<Record<string, AvailabilityStatus[]>>({
    Monday: ['Definitely', 'Unavailable', 'Probably'],
    Tuesday: ['Probably', 'Definitely', 'Unavailable'],
    Wednesday: ['Definitely', 'Probably', 'Unavailable'],
    Thursday: ['Unavailable', 'Definitely', 'Probably'],
    Friday: ['Probably', 'Probably', 'Definitely'],
  });

  const toggleStatus = (day: string, index: number) => {
    const statuses: AvailabilityStatus[] = ['Definitely', 'Probably', 'Unavailable'];
    setAvailability(prev => {
      const newDay = [...prev[day]];
      const currentIdx = statuses.indexOf(newDay[index]);
      newDay[index] = statuses[(currentIdx + 1) % 3];
      return { ...prev, [day]: newDay };
    });
  };

  return (
    <div className="min-h-screen bg-surface pb-32">
      <header className="fixed top-0 w-full flex justify-between items-center px-6 py-4 bg-surface/80 backdrop-blur-xl z-50 border-b border-outline-variant/10 shadow-tactile">
        <div className="flex items-center gap-4">
          <div className={cn(
            "w-10 h-10 rounded-full overflow-hidden border-2 border-primary-container flex items-center justify-center",
            colors.bg
          )}>
            <span className={cn("font-black text-xs", colors.text)}>
              {getInitials(user.name)}
            </span>
          </div>
          <h1 className="text-primary text-2xl font-black tracking-tighter">MAPAO?</h1>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setIsEditing(true)}
            className="w-10 h-10 rounded-full flex items-center justify-center bg-surface-container-low text-secondary hover:opacity-80 transition-all active:scale-95"
          >
            <Edit2 className="w-5 h-5" />
          </button>
          <button 
            onClick={toggleSettings}
            className={cn(
              "w-10 h-10 flex items-center justify-center rounded-full transition-all active:scale-90 duration-300 relative z-50",
              isSettingsOpen ? "bg-primary text-on-primary shadow-active" : "bg-surface-container-low text-primary hover:opacity-80"
            )}
          >
            <motion.div
              animate={{ rotate: isSettingsOpen ? 180 : 0 }}
              transition={{ type: "spring", damping: 15 }}
            >
              <Settings className={cn("w-5 h-5", isSettingsOpen && "fill-current")} />
            </motion.div>
          </button>
        </div>
      </header>
      <SettingsPanel />
      <EditProfileModal isOpen={isEditing} onClose={() => setIsEditing(false)} />

      <main className="pt-28 px-4 md:px-8 max-w-4xl mx-auto space-y-8">
        <section className="bg-surface-container-low rounded-xl p-8 flex flex-col items-center text-center relative overflow-hidden transition-all duration-300">
          <div className={cn(
            "absolute top-0 left-0 w-full h-32 opacity-20 bg-gradient-to-br transition-all duration-500",
            currentBanner
          )} />
          
          <div className="relative z-10 w-32 h-32 mb-4">
            <div className={cn(
              "w-full h-full rounded-full overflow-hidden border-4 border-surface-container-lowest shadow-tactile flex items-center justify-center transition-colors duration-500",
              colors.bg
            )}>
              <span className={cn("font-black text-4xl", colors.text)}>
                {getInitials(user.name)}
              </span>
            </div>
          </div>

          <div className="relative z-10 w-full max-w-sm">
            <h2 className="text-3xl font-headline font-extrabold text-primary">{user.name}</h2>
            <p className="text-on-surface-variant mt-2 font-medium">{user.role || "Urban Explorer & Coffee Enthusiast"}</p>
          </div>
          <div className="flex gap-4 mt-6">
            <div className="bg-surface-container-lowest px-4 py-2 rounded-full flex items-center gap-2 shadow-sm">
              <MapPin className="w-4 h-4 text-primary" />
              <span className="font-semibold text-primary text-sm">{user.campus || "Campus North"}</span>
            </div>
            <div className="bg-surface-container-lowest px-4 py-2 rounded-full flex items-center gap-2 shadow-sm">
              <School className="w-4 h-4 text-secondary" />
              <span className="font-semibold text-secondary-dim text-sm">{user.year || "Junior Year"}</span>
            </div>
          </div>
        </section>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <section className="md:col-span-1 bg-surface-container-low rounded-xl p-6 flex flex-col justify-between">
            <div>
              <h3 className="font-headline font-bold text-xl text-primary mb-6 flex items-center gap-2">
                <History className="w-5 h-5" /> History
              </h3>
              <div className="flex flex-col items-center mb-8">
                <div className="w-32 h-32 flex items-center justify-center relative">
                  <svg className="absolute w-full h-full -rotate-90">
                    <circle
                      cx="64" cy="64" r="56"
                      fill="transparent"
                      className="stroke-surface-container-highest/50"
                      strokeWidth="6"
                    />
                    <circle
                      cx="64" cy="64" r="56"
                      fill="transparent"
                      className="stroke-primary"
                      strokeWidth="6"
                      strokeDasharray="351.85"
                      strokeDashoffset={351.85 * (1 - user.reliability / 100)}
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="flex flex-col items-center">
                    <span className="text-3xl font-black text-on-surface leading-none">{user.reliability}%</span>
                  </div>
                </div>
                <p className="text-[10px] font-bold text-on-surface-variant mt-4 uppercase tracking-[0.2em] text-center">Reliability Score</p>
              </div>
            </div>
            <div className="space-y-3">
              <div className="bg-surface-container-lowest p-3 rounded-lg flex justify-between items-center">
                <span className="text-sm text-on-surface-variant font-medium">Total Appointments</span>
                <span className="font-bold text-primary">{user.appointments}</span>
              </div>
              <div className="bg-surface-container-lowest p-3 rounded-lg flex justify-between items-center">
                <span className="text-sm text-on-surface-variant font-medium">On-Time Count</span>
                <span className="font-bold text-secondary">{user.onTime}</span>
              </div>
            </div>
          </section>

          <section className="md:col-span-2 bg-surface-container-low rounded-xl p-6 overflow-hidden">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-headline font-bold text-xl text-primary flex items-center gap-2">
                <CalendarIcon className="w-5 h-5" /> Availability Grid
              </h3>
              <span className="text-[10px] font-bold text-outline uppercase tracking-widest">Tap to Toggle</span>
            </div>
            <div className="overflow-x-auto no-scrollbar pb-2">
              <table className="w-full min-w-[400px] border-separate border-spacing-y-2">
                <thead>
                  <tr className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest text-center">
                    <th className="text-left font-bold pb-2 w-1/4">Day</th>
                    <th className="pb-2 w-1/4">Morning</th>
                    <th className="pb-2 w-1/4">Afternoon</th>
                    <th className="pb-2 w-1/4">Evening</th>
                  </tr>
                </thead>
                <tbody className="text-sm font-medium">
                  {Object.keys(availability).map((day) => (
                    <tr key={day}>
                      <td className="text-on-surface py-2 pr-2">{day}</td>
                      <td><StatusChip status={availability[day][0]} onClick={() => toggleStatus(day, 0)} /></td>
                      <td><StatusChip status={availability[day][1]} onClick={() => toggleStatus(day, 1)} /></td>
                      <td><StatusChip status={availability[day][2]} onClick={() => toggleStatus(day, 2)} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </div>

        <section className="bg-surface-container-low rounded-xl p-6">
          <h3 className="font-headline font-bold text-xl text-primary mb-6 flex items-center gap-2">
            <Award className="w-5 h-5" /> Achievements
          </h3>
          <div className="grid grid-cols-3 gap-4">
            <AchievementCard 
              icon={Star} 
              title="Punctual Pro" 
              desc="20x On-Time" 
              color="bg-[#FFF9C4]" 
              iconColor="text-[#FBC02D]"
              borderColor="border-[#FFD700]/40"
            />
            <AchievementCard 
              icon={Users} 
              title="Team Player" 
              desc="10 Collabs" 
              color="bg-[#F5F5F5]" 
              iconColor="text-[#9E9E9E]"
              borderColor="border-[#C0C0C0]/40"
            />
            <AchievementCard 
              icon={Map} 
              title="Explorer" 
              desc="5 New Spots" 
              color="bg-[#EFEBE9]" 
              iconColor="text-[#8D6E63]"
              borderColor="border-[#CD7F32]/40"
            />
          </div>
        </section>

        <div className="flex justify-center pt-4">
          <button 
            onClick={logout}
            className="flex items-center gap-2 px-8 py-3 rounded-full bg-error-container text-on-error-container font-bold text-sm shadow-tactile active:scale-95 transition-all"
          >
            <LogOut className="w-5 h-5" /> Log Out
          </button>
        </div>
      </main>
      <BottomNav />
    </div>
  );
}

function StatusChip({ status, onClick }: { status: AvailabilityStatus; onClick: () => void }) {
  const styles = {
    Definitely: "bg-primary/20 text-primary border-primary/20",
    Probably: "bg-secondary-container/50 text-on-secondary-container border-secondary-container",
    Unavailable: "bg-surface-variant/40 text-on-surface-variant opacity-60 border-outline-variant",
  };
  return (
    <button 
      onClick={onClick}
      className={`py-1.5 px-2 rounded-full text-center text-[11px] font-bold w-full shadow-sm border transition-all active:scale-95 ${styles[status]}`}
    >
      {status}
    </button>
  );
}

function AchievementCard({ icon: Icon, title, desc, color, iconColor, borderColor }: any) {
  return (
    <div className={`bg-surface-container-lowest rounded-xl p-4 flex flex-col items-center justify-center text-center shadow-tactile border-b-4 ${borderColor}`}>
      <div className={`w-16 h-16 rounded-full ${color} flex items-center justify-center mb-3`}>
        <Icon className={`w-8 h-8 ${iconColor}`} />
      </div>
      <span className="font-bold text-sm text-on-surface">{title}</span>
      <span className="text-[10px] text-on-surface-variant font-bold uppercase tracking-widest mt-1">{desc}</span>
    </div>
  );
}
