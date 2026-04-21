import { Calendar, Clock, MapPin, AlertCircle } from 'lucide-react';
import { IMAGES } from '../constants';
import { motion, AnimatePresence } from 'motion/react';
import { Header } from '../components/Header';
import { BottomNav } from '../components/BottomNav';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { useState } from 'react';
import { getAvatarColor, getInitials, cn } from '../lib/utils';
import { getEventIcon } from '../lib/iconMapping';

export function DashboardScreen() {
  const navigate = useNavigate();
  const { events, updateEventStatus, user } = useApp();
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  
  const days = [
    { day: 'Tue', date: '24', active: true },
    { day: 'Wed', date: '25' },
    { day: 'Thu', date: '26' },
    { day: 'Fri', date: '27' },
    { day: 'Sat', date: '28' },
  ];

  const pendingEvent = events.find(e => e.status === 'pending');
  const upcomingEvents = events.filter(e => e.status === 'upcoming' || e.status === 'confirmed');

  const getHostName = (event: typeof events[0]) => {
    const host = event.participants.find(p => p.id === event.hostId);
    if (host) return host.name;
    if (event.hostId === 'sarah_1') return 'Sarah Jenkins';
    if (event.hostId === 'emma_1') return 'Emma';
    if (event.hostId === 'user_1') return user.name;
    return 'User';
  };

  const handleAction = (id: string, status: 'confirmed' | 'cancelled') => {
    updateEventStatus(id, status);
    if (status === 'confirmed') {
      setSuccessMsg("You've joined the event!");
      setTimeout(() => setSuccessMsg(null), 3000);
    }
  };

  return (
    <div className="min-h-screen bg-surface pb-32">
      <Header />

      <AnimatePresence>
        {successMsg && (
          <motion.div 
            initial={{ opacity: 0, y: -20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="fixed top-24 left-1/2 -translate-x-1/2 z-[100] w-full max-w-xs"
          >
            <div className="bg-primary text-on-primary px-6 py-4 rounded-[2rem] shadow-active flex items-center justify-center gap-3 border-2 border-white/20">
              <span className="font-headline font-bold">{successMsg}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      <main className="pt-24 px-4 space-y-8 max-w-lg mx-auto">
        <section className="space-y-4">
          <h2 className="font-headline text-2xl font-extrabold text-on-surface tracking-tight px-2">Today</h2>
          <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2 px-2">
            {days.map((d) => (
              <div 
                key={d.date}
                className={`flex flex-col items-center justify-center rounded-2xl min-w-[4.5rem] py-4 shrink-0 transition-all ${
                  d.active 
                    ? "bg-gradient-to-br from-primary to-primary-container text-on-primary shadow-active" 
                    : "bg-surface-container-low text-on-surface-variant"
                }`}
              >
                <span className={`text-xs font-semibold uppercase tracking-widest ${d.active ? "opacity-90" : ""}`}>{d.day}</span>
                <span className={`text-2xl font-black mt-1 ${d.active ? "" : "text-xl font-bold"}`}>{d.date}</span>
              </div>
            ))}
          </div>
        </section>

        {pendingEvent && (
          <section className="bg-surface-container-low rounded-[2rem] p-5 relative overflow-hidden">
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-secondary-container rounded-full blur-3xl opacity-50 pointer-events-none" />
            <div className="flex items-center gap-2 mb-5 relative z-10">
              <AlertCircle className="w-5 h-5 text-secondary fill-current" />
              <h3 className="font-headline text-lg font-bold text-on-surface">Pending Action</h3>
            </div>
            <div className="bg-surface-container-lowest rounded-2xl p-5 shadow-tactile relative z-10">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <span className="text-xs font-bold text-secondary text-on-secondary-container uppercase tracking-widest mb-1 flex items-center gap-1.5">
                    {(() => {
                      const Icon = getEventIcon(pendingEvent.type, pendingEvent.customTypeIcon);
                      return <Icon className="w-3 h-3" />;
                    })()}
                    {pendingEvent.type === 'custom' && pendingEvent.customTypeName ? pendingEvent.customTypeName : pendingEvent.type}
                  </span>
                  <h4 className="font-bold text-on-surface text-xl">{pendingEvent.title}</h4>
                  <p className="text-sm text-on-surface-variant mt-1 flex items-center gap-1">
                    <Clock className="w-3 h-3" /> {pendingEvent.time}
                  </p>
                </div>
                <div 
                  className={cn(
                    "w-10 h-10 rounded-full overflow-hidden flex items-center justify-center cursor-pointer shadow-sm",
                    getAvatarColor(pendingEvent.hostId, pendingEvent.hostId === user.id ? user.avatarColorIndex : undefined).bg
                  )} 
                  onClick={() => navigate(`/event-detail/${pendingEvent.id}`)}
                >
                  <span className={cn("font-black text-sm", getAvatarColor(pendingEvent.hostId, pendingEvent.hostId === user.id ? user.avatarColorIndex : undefined).text)}>
                    {getInitials(getHostName(pendingEvent))}
                  </span>
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button 
                  onClick={() => handleAction(pendingEvent.id, 'confirmed')}
                  className="flex-1 bg-gradient-to-br from-primary to-primary-container text-on-primary font-bold py-3 px-4 rounded-full text-sm active:scale-95 transition-transform shadow-md"
                >
                  Confirm
                </button>
                <button 
                  onClick={() => handleAction(pendingEvent.id, 'cancelled')}
                  className="flex-1 bg-surface-container-high text-on-surface font-bold py-3 px-4 rounded-full text-sm active:scale-95 transition-transform"
                >
                  Decline
                </button>
              </div>
            </div>
          </section>
        )}

        <section className="space-y-4">
          <h3 className="font-headline text-xl font-extrabold text-on-surface tracking-tight px-2">Up Next</h3>
          <div className="space-y-4">
            {upcomingEvents.length > 0 ? upcomingEvents.map((event) => (
              <motion.div 
                key={event.id}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate(`/event-detail/${event.id}`)}
                className="bg-surface-container-lowest rounded-[2rem] p-5 shadow-tactile flex flex-col gap-4 cursor-pointer"
              >
                <div className="flex justify-between items-start">
                  <span className={getPriorityStyle(event.priority)}>
                    {event.priority}
                  </span>
                  <span className="text-xs font-semibold text-on-surface-variant bg-surface px-2 py-1 rounded-md flex items-center gap-1.5">
                    {(() => {
                      const Icon = getEventIcon(event.type, event.customTypeIcon);
                      return <Icon className="w-3 h-3" />;
                    })()}
                    {event.type === 'custom' && event.customTypeName ? event.customTypeName : event.type}
                  </span>
                </div>
                <div className="flex gap-4 items-center">
                  {event.hostId !== 'system' ? (
                    <div className={cn(
                      "w-12 h-12 rounded-full overflow-hidden shrink-0 flex items-center justify-center shadow-sm",
                      getAvatarColor(event.hostId, event.hostId === user.id ? user.avatarColorIndex : undefined).bg
                    )}>
                      <span className={cn("font-black text-lg", getAvatarColor(event.hostId, event.hostId === user.id ? user.avatarColorIndex : undefined).text)}>
                        {getInitials(getHostName(event))}
                      </span>
                    </div>
                  ) : (
                    <div className={`w-1.5 rounded-full ${getPriorityColor(event.priority)} self-stretch`} />
                  )}
                  <div className="flex-1">
                    <h4 className="font-bold text-on-surface text-lg">{event.title}</h4>
                    <div className="flex items-center gap-4 mt-2 text-sm text-on-surface-variant">
                      <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {event.time}</span>
                      <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {event.location}</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            )) : (
              <p className="text-center text-on-surface-variant py-8 font-medium">No upcoming events today.</p>
            )}
          </div>
        </section>
      </main>

      <BottomNav />
    </div>
  );
}

function getPriorityStyle(p: string) {
  if (p === 'Very Important') return 'bg-error-container text-on-error-container text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full';
  if (p === 'Important') return 'bg-secondary-container text-on-secondary-container text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full';
  return 'bg-surface-container-high text-on-surface text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full';
}

function getPriorityColor(p: string) {
  if (p === 'Very Important') return 'bg-error';
  if (p === 'Important') return 'bg-secondary';
  return 'bg-surface-container-high';
}
