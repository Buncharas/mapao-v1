import { Settings, MapPin, School, History, Calendar as CalendarIcon, Award, Star, Users, Map, Edit, Check, LogOut, Edit2, X, Save } from 'lucide-react';
import { IMAGES } from '../constants';
import { BottomNav } from '../components/BottomNav';
import { motion, AnimatePresence } from 'motion/react';
import { useApp } from '../context/AppContext';
import { useState, useEffect } from 'react';
import { getAvatarColor, getInitials, cn, bannerGradients } from '../lib/utils';
import { SettingsPanel } from '../components/SettingsPanel';
import { EditProfileModal } from '../components/EditProfileModal';

type AvailabilityStatus = 'none' | 'definitely' | 'probably' | 'unavailable';

export function ProfileScreen() {
  const { user, events, logout, isSettingsOpen, toggleSettings } = useApp();
  const [isEditing, setIsEditing] = useState(false);

  // Calculation logic as requested
  const userEvents = events.filter(event =>
    event.hostId === user.id ||
    event.participants.some(p => p.id === user.id && ['joined', 'checked-in', 'late', 'missed'].includes(p.status))
  );

  const pastEvents = userEvents.filter(event => {
    // Combine date and time. Assuming event.date is YYYY-MM-DD
    const eventDateTime = new Date(`${event.date}T${event.time}`);
    // If invalid date (e.g. date string is "Mon", we fallback to current date comparison)
    if (isNaN(eventDateTime.getTime())) {
      const [hours, minutes] = event.time.split(':').map(Number);
      const today = new Date();
      today.setHours(hours, minutes, 0, 0);
      return today < new Date();
    }
    return eventDateTime < new Date();
  });

  const totalAppointments = pastEvents.length;

  const onTimeCount = pastEvents.filter(event => {
    const p = event.participants.find(part => part.id === user.id);
    return p?.status === "checked-in";
  }).length;

  const reliabilityScore = totalAppointments > 0
    ? Math.round((onTimeCount / totalAppointments) * 100)
    : 0;

  useEffect(() => {
    console.log("DEBUG - App Stats Calculation:");
    console.log("events:", events);
    console.log("userEvents:", userEvents);
    console.log("pastEvents:", pastEvents);
    console.log("Calculated:", { totalAppointments, onTimeCount, reliabilityScore });
  }, [events, user.id, totalAppointments, onTimeCount, reliabilityScore]);

  const colors = getAvatarColor(user.id, user.avatarColorIndex);
  const currentBanner = bannerGradients[user.bannerGradientIndex || 0];
  
  const [availability, setAvailability] = useState<Record<string, AvailabilityStatus[]>>(() => {
    const saved = localStorage.getItem(`mapao_availability_${user.id}`);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Normalize: if any slot is missing or null, treat it as 'none'
        const normalized: Record<string, AvailabilityStatus[]> = {};
        ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].forEach(day => {
          normalized[day] = (parsed[day] || ['none', 'none', 'none']).map((val: string) => 
            (val === 'definitely' || val === 'probably' || val === 'unavailable') ? val as AvailabilityStatus : 'none'
          );
        });
        return normalized;
      } catch (e) {
        console.error('Failed to parse availability', e);
      }
    }
    return {
      Monday: ['none', 'none', 'none'],
      Tuesday: ['none', 'none', 'none'],
      Wednesday: ['none', 'none', 'none'],
      Thursday: ['none', 'none', 'none'],
      Friday: ['none', 'none', 'none'],
    };
  });

  const toggleStatus = (day: string, index: number) => {
    setAvailability(prev => {
      const current = prev[day] ? prev[day][index] : 'none';
      let next: AvailabilityStatus;

      // Interaction Logic:
      // None -> Definitely
      // Definitely -> Probably -> Unavailable -> Definitely (cycle)
      if (current === 'none' || !current) {
        next = 'definitely';
      } else if (current === 'definitely') {
        next = 'probably';
      } else if (current === 'probably') {
        next = 'unavailable';
      } else {
        next = 'definitely';
      }

      const newDay = [...(prev[day] || ['none', 'none', 'none'])];
      newDay[index] = next;
      const newState = { ...prev, [day]: newDay };
      localStorage.setItem(`mapao_availability_${user.id}`, JSON.stringify(newState));
      return newState;
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
              <span className="font-semibold text-primary text-sm">{user.campus || "Chula University"}</span>
            </div>
            <div className="bg-surface-container-lowest px-4 py-2 rounded-full flex items-center gap-2 shadow-sm">
              <School className="w-4 h-4 text-secondary" />
              <span className="font-semibold text-secondary-dim text-sm">{user.year || "3rd Year"}</span>
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
                      strokeDashoffset={351.85 * (1 - reliabilityScore / 100)}
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="flex flex-col items-center">
                    <span className="text-3xl font-black text-on-surface leading-none">{reliabilityScore}%</span>
                  </div>
                </div>
                <p className="text-[10px] font-bold text-on-surface-variant mt-4 uppercase tracking-[0.2em] text-center">Reliability Score</p>
              </div>
            </div>
            <div className="space-y-3">
              <div className="bg-surface-container-lowest p-3 rounded-lg flex justify-between items-center">
                <span className="text-sm text-on-surface-variant font-medium">Total Appointments</span>
                <span className="font-bold text-primary">{totalAppointments}</span>
              </div>
              <div className="bg-surface-container-lowest p-3 rounded-lg flex justify-between items-center">
                <span className="text-sm text-on-surface-variant font-medium">On-Time Count</span>
                <span className="font-bold text-secondary">{onTimeCount}</span>
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
          <div className="flex flex-col items-center justify-center py-8 px-4 text-center bg-surface-container-lowest rounded-2xl border-2 border-dashed border-outline-variant/30">
            <div className="w-16 h-16 rounded-full bg-surface-container-highest flex items-center justify-center mb-4">
              <Star className="w-8 h-8 text-on-surface-variant/30" />
            </div>
            <h4 className="font-bold text-on-surface text-lg">No achievements yet</h4>
            <p className="text-on-surface-variant/60 text-sm mt-1 max-w-[200px]">
              Start creating events to earn your own achievements!
            </p>
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
    none: "bg-surface-container-highest/20 text-on-surface-variant/30 border-dashed border-outline-variant",
    definitely: "bg-primary/20 text-primary border-primary/20",
    probably: "bg-secondary-container/50 text-on-secondary-container border-secondary-container",
    unavailable: "bg-surface-variant/40 text-on-surface-variant opacity-60 border-outline-variant",
  };
  return (
    <button 
      onClick={onClick}
      className={cn(
        "py-1.5 px-2 rounded-full text-center text-[11px] font-bold w-full shadow-sm border transition-all active:scale-95",
        styles[status]
      )}
    >
      {status === 'none' ? 'None' : status.charAt(0).toUpperCase() + status.slice(1)}
    </button>
  );
}

