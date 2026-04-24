import { Calendar as CalendarIcon, Clock, MapPin, AlertCircle, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { IMAGES } from '../constants';
import { motion, AnimatePresence } from 'motion/react';
import { Header } from '../components/Header';
import { BottomNav } from '../components/BottomNav';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { useState, useMemo } from 'react';
import { getAvatarColor, getInitials, cn } from '../lib/utils';
import { getEventIcon } from '../lib/iconMapping';

export function DashboardScreen() {
  const navigate = useNavigate();
  const { events, updateEventStatus, user, users } = useApp();
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState(new Date('2026-04-24'));
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  
  // Format as YYYY-MM-DD for comparison with event data
  const selectedDateStr = formatDate(selectedDate);

  // Generate 7 days for the strip starting from the selected date (or around it)
  // To keep existing behavior, we'll show 5 days starting from selectedDate
  const days = useMemo(() => {
    return Array.from({ length: 7 }).map((_, i) => {
      const d = new Date(selectedDate);
      d.setDate(selectedDate.getDate() + i);
      return {
        day: d.toLocaleDateString('en-US', { weekday: 'short' }),
        date: d.getDate().toString(),
        fullDate: d.toISOString().split('T')[0],
        active: i === 0
      };
    });
  }, [selectedDate]);

  const invitations = events.filter(e => {
    const me = e.participants.find(p => p.id === user.id);
    return me && me.status === 'pending' && e.hostId !== user.id && e.status !== 'cancelled';
  });
  
  const upcomingEvents = events.filter(e => {
    const me = e.participants.find(p => p.id === user.id);
    const isHost = e.hostId === user.id;
    const isJoined = me && (me.status === 'joined' || me.status === 'checked-in' || me.status === 'late');
    return (isHost || isJoined) && e.date === selectedDateStr && e.status !== 'cancelled';
  });

  const getHostName = (event: typeof events[0]) => {
    // Priority 1: Live user data
    const liveHost = users.find(u => u.id === event.hostId);
    if (liveHost) return liveHost.name;

    // Priority 2: Snapshot in participants
    const host = event.participants.find(p => p.id === event.hostId);
    if (host) return host.name;
    
    const contacts: Record<string, string> = {
      'user_1': 'P. Buncharas',
      '1': 'S. Boss-man',
      '2': 'annabemee',
      '3': 'qreiissss',
      '4': 'primpraowsss',
      '5': 'sarisaaa__',
      '6': 'i.arin.u',
      'emma_1': 'S. Boss-man',
      'sarah_1': 'qreiissss'
    };
    return contacts[event.hostId] || 'User';
  };

  const handleAction = (id: string, status: 'confirmed' | 'cancelled') => {
    updateEventStatus(id, status);
    
    // Also mark related notifications as read
    const relatedNotifs = notifications.filter(n => n.eventId === id && n.unread);
    relatedNotifs.forEach(n => markNotificationRead(n.id));

    if (status === 'confirmed') {
      setSuccessMsg("You've joined the event!");
      setTimeout(() => setSuccessMsg(null), 3000);
    }
  };

  const { notifications, markNotificationRead } = useApp();

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
          <h2 className="font-headline text-2xl font-extrabold text-on-surface tracking-tight px-2">
            {selectedDateStr === new Date('2026-04-24').toISOString().split('T')[0] 
              ? 'Today' 
              : selectedDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
          </h2>
          <motion.div 
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            onDragEnd={(_, info) => {
              if (info.offset.x < -50) {
                setIsCalendarOpen(true);
              }
            }}
            className="flex gap-3 overflow-x-auto no-scrollbar pb-2 px-2 items-stretch"
          >
            {days.map((d) => (
              <button 
                key={d.fullDate}
                onClick={() => setSelectedDate(new Date(d.fullDate))}
                className={`flex flex-col items-center justify-center rounded-2xl min-w-[4.5rem] py-4 shrink-0 transition-all ${
                  d.active 
                    ? "bg-gradient-to-br from-primary to-primary-container text-on-primary shadow-active scale-105" 
                    : "bg-surface-container-low text-on-surface-variant hover:bg-surface-container-high"
                }`}
              >
                <span className={`text-xs font-semibold uppercase tracking-widest ${d.active ? "opacity-90" : ""}`}>{d.day}</span>
                <span className={`text-2xl font-black mt-1 ${d.active ? "" : "text-xl font-bold"}`}>{d.date}</span>
              </button>
            ))}
            
            {/* End-of-strip button */}
            <button 
              onClick={() => setIsCalendarOpen(true)}
              className="flex flex-col items-center justify-center rounded-2xl min-w-[4.5rem] py-4 shrink-0 transition-all bg-surface-container-highest text-primary hover:bg-primary-container/20 group"
            >
              <CalendarIcon className="w-6 h-6 group-hover:scale-110 transition-transform" />
              <span className="text-[10px] font-bold uppercase tracking-tighter mt-1">Full View</span>
            </button>
          </motion.div>
        </section>

        {invitations.length > 0 && (
          <section className="space-y-4">
            <div className="flex items-center justify-between px-2">
              <h3 className="font-headline text-xl font-extrabold text-on-surface tracking-tight">Invitations</h3>
              <span className="bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full">
                {invitations.length} New
              </span>
            </div>
            <div className="space-y-3">
              {invitations.map((invite) => (
                <motion.div 
                  key={invite.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="bg-surface-container-low/50 border border-outline-variant/10 rounded-[2rem] p-5 shadow-sm"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex gap-4 items-center">
                      <div className={cn(
                        "w-10 h-10 rounded-full flex items-center justify-center shadow-sm shrink-0",
                        getAvatarColor(invite.hostId, undefined).bg
                      )}>
                        <span className={cn("font-black text-sm", getAvatarColor(invite.hostId, undefined).text)}>
                          {getInitials(getHostName(invite))}
                        </span>
                      </div>
                      <div>
                        <h4 className="font-bold text-on-surface text-base leading-tight">{invite.title}</h4>
                        <p className="text-xs text-on-surface-variant/70 mt-0.5">
                          Invited by <span className="font-bold text-primary">{getHostName(invite)}</span>
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-on-surface-variant/60 mb-5 bg-surface-container-lowest/50 p-3 rounded-2xl">
                    <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> {invite.time}</span>
                    <span className="flex items-center gap-1.5"><CalendarIcon className="w-3.5 h-3.5" /> {invite.date}</span>
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => handleAction(invite.id, 'confirmed')}
                      className="flex-1 bg-surface-container-highest text-primary font-bold py-2.5 px-4 rounded-xl text-xs active:scale-95 transition-all hover:bg-primary hover:text-on-primary"
                    >
                      Confirm
                    </button>
                    <button 
                      onClick={() => handleAction(invite.id, 'cancelled')}
                      className="flex-1 bg-transparent text-on-surface-variant font-bold py-2.5 px-4 rounded-xl text-xs active:scale-95 transition-all hover:bg-surface-container-high"
                    >
                      Decline
                    </button>
                  </div>
                </motion.div>
              ))}
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
                <div className={cn(
                  "flex gap-4 items-center",
                  event.hostId === user.id ? "pl-2" : ""
                )}>
                  {event.hostId !== 'system' ? (
                    event.hostId === user.id ? (
                      <div className={cn("w-1.5 h-12 rounded-full shrink-0", getPriorityColor(event.priority))} />
                    ) : (
                      <div className={cn(
                        "w-12 h-12 rounded-full overflow-hidden shrink-0 flex items-center justify-center shadow-sm",
                        getAvatarColor(event.hostId, undefined).bg
                      )}>
                        <span className={cn("font-black text-lg", getAvatarColor(event.hostId, undefined).text)}>
                          {getInitials(getHostName(event))}
                        </span>
                      </div>
                    )
                  ) : (
                    <div className={`w-1.5 rounded-full ${getPriorityColor(event.priority)} self-stretch`} />
                  )}
                  <div className="flex-1">
                    <h4 className={cn(
                      "font-bold text-on-surface text-lg",
                      event.hostId === user.id ? "text-primary" : ""
                    )}>{event.title}</h4>
                    <div className="flex items-center gap-4 mt-2 text-sm text-on-surface-variant">
                      <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {event.time}</span>
                      <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {event.location}</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            )) : (
              <div className="flex flex-col items-center justify-center py-12 px-6 bg-surface-container-low rounded-[2rem] border-2 border-dashed border-outline-variant/30">
                <div className="w-16 h-16 bg-surface-container-high rounded-full flex items-center justify-center mb-4">
                  <CalendarIcon className="w-8 h-8 text-primary/40" />
                </div>
                <h4 className="font-headline text-lg font-bold text-on-surface text-center">No plans yet?</h4>
                <p className="text-sm text-on-surface-variant/70 text-center mt-2 mb-6">
                  Plan together, show up together. Start by creating your first event!
                </p>
                <button 
                  onClick={() => navigate('/create')}
                  className="bg-primary text-on-primary font-bold py-3 px-8 rounded-full text-sm active:scale-95 transition-all shadow-md hover:shadow-lg"
                >
                  Create Event
                </button>
              </div>
            )}
          </div>
        </section>
      </main>

      <BottomNav />

      {/* Calendar Panel Overlay */}
      <AnimatePresence>
        {isCalendarOpen && (
          <>
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsCalendarOpen(false)}
              className="fixed inset-0 bg-on-surface/30 backdrop-blur-sm z-[150]"
            />
            
            {/* Panel */}
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={{ left: 0, right: 0.1 }}
              onDragEnd={(_, info) => {
                if (info.offset.x > 100) {
                  setIsCalendarOpen(false);
                }
              }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 h-full w-[85%] max-w-sm bg-surface shadow-2xl z-[160] overflow-hidden flex flex-col border-l border-outline-variant"
            >
              <div className="p-6 flex flex-col h-full">
                <div className="flex justify-between items-center mb-8">
                  <h2 className="font-headline text-2xl font-black text-primary">Calendar</h2>
                  <button 
                    onClick={() => setIsCalendarOpen(false)}
                    className="p-2 rounded-full hover:bg-surface-container-high transition-colors"
                  >
                    <X className="w-6 h-6 text-on-surface-variant" />
                  </button>
                </div>

                <CalendarView 
                  selectedDate={selectedDate}
                  events={events}
                  onSelect={(date) => {
                    setSelectedDate(date);
                    setIsCalendarOpen(false);
                  }}
                />

                <div className="mt-auto pt-8">
                  <button 
                    onClick={() => {
                      setSelectedDate(new Date('2026-04-24'));
                      setIsCalendarOpen(false);
                    }}
                    className="w-full py-4 bg-surface-container-high text-primary font-bold rounded-2xl active:scale-95 transition-all text-sm uppercase tracking-widest"
                  >
                    Back to Today
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

function CalendarView({ selectedDate, events, onSelect }: { selectedDate: Date, events: any[], onSelect: (date: Date) => void }) {
  const [viewDate, setViewDate] = useState(new Date(selectedDate));
  
  const daysInMonth = useMemo(() => {
    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const days = new Array(firstDay).fill(null);
    
    const lastDay = new Date(year, month + 1, 0).getDate();
    for (let i = 1; i <= lastDay; i++) {
      days.push(new Date(year, month, i));
    }
    return days;
  }, [viewDate]);

  const monthName = viewDate.toLocaleString('en-US', { month: 'long', year: 'numeric' });
  const weekDays = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

  const hasEvents = (d: Date) => {
    const dateStr = formatDate(d);
    return events.some(e => e.date === dateStr);
  };

  const isToday = (d: Date) => {
    return formatDate(d) === '2026-04-24';
  };

  const isSelected = (d: Date) => {
    return formatDate(d) === formatDate(selectedDate);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between px-2">
        <h3 className="font-bold text-on-surface text-lg">{monthName}</h3>
        <div className="flex gap-1">
          <button 
            onClick={() => {
              const nd = new Date(viewDate);
              nd.setMonth(nd.getMonth() - 1);
              setViewDate(nd);
            }}
            className="p-2 rounded-lg hover:bg-surface-container-high"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button 
            onClick={() => {
              const nd = new Date(viewDate);
              nd.setMonth(nd.getMonth() + 1);
              setViewDate(nd);
            }}
            className="p-2 rounded-lg hover:bg-surface-container-high"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1">
        {weekDays.map(wd => (
          <div key={wd} className="text-center text-[10px] font-black text-on-surface-variant/40 py-2">
            {wd}
          </div>
        ))}
        {daysInMonth.map((d, i) => (
          <div key={i} className="aspect-square flex items-center justify-center p-0.5">
            {d ? (
              <button
                onClick={() => onSelect(d)}
                className={cn(
                  "w-full h-full rounded-xl flex flex-col items-center justify-center relative transition-all group",
                  isSelected(d) ? "bg-primary text-on-primary shadow-lg" : "hover:bg-surface-container-high",
                  isToday(d) && !isSelected(d) && "border-2 border-primary/20 bg-primary/5 shadow-sm"
                )}
              >
                <span className={cn(
                  "text-sm font-bold",
                  isSelected(d) ? "text-on-primary" : isToday(d) ? "text-primary" : "text-on-surface"
                )}>
                  {d.getDate()}
                </span>
                {hasEvents(d) && (
                  <div className={cn(
                    "w-1 h-1 rounded-full mt-0.5",
                    isSelected(d) ? "bg-on-primary/50" : "bg-primary/40"
                  )} />
                )}
                {isToday(d) && (
                  <div className="absolute -top-1 right-0 w-1.5 h-1.5 bg-secondary rounded-full" />
                )}
              </button>
            ) : (
              <div className="w-full h-full" />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function getPriorityStyle(p: string) {
  if (p === 'Very Important') return 'bg-error-container text-on-error-container text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full';
  if (p === 'Important') return 'bg-secondary-container text-on-secondary-container text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full';
  return 'bg-surface-container-high text-on-surface text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full';
}

function getPriorityColor(p: string) {
  if (p === 'Very Important') return 'bg-error-container';
  if (p === 'Important') return 'bg-secondary-container';
  return 'bg-surface-container-high';
}

function getPriorityBorderColor(p: string) {
  if (p === 'Very Important') return 'border-error-container';
  if (p === 'Important') return 'border-secondary-container';
  return 'border-surface-container-high';
}

function formatDate(d: Date) {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}
