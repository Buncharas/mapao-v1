import { ArrowLeft, Settings, MapPin, Clock, Calendar, CheckCircle2, QrCode, Share2, MoreHorizontal, UserCheck, AlertCircle, Loader2, Edit2 } from 'lucide-react';
import { IMAGES } from '../constants';
import { useNavigate, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { useApp } from '../context/AppContext';
import { useState, useEffect } from 'react';
import { getAvatarColor, getInitials, cn } from '../lib/utils';
import { getEventIcon } from '../lib/iconMapping';

export function EventDetailScreen() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { events, checkIn, updateEventStatus, user, users } = useApp();
  const [scanning, setScanning] = useState(false);
  const [success, setSuccess] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const event = events.find(e => e.id === id);

  if (!event) {
    return (
      <div className="min-h-screen bg-surface flex flex-col items-center justify-center p-6 text-center">
        <AlertCircle className="w-16 h-16 text-error mb-4 opacity-20" />
        <h2 className="text-2xl font-headline font-bold text-on-surface mb-2">Event Not Found</h2>
        <p className="text-on-surface-variant mb-8">This event might have been removed or the link is invalid.</p>
        <button 
          onClick={() => navigate('/dashboard')}
          className="bg-primary text-on-primary px-8 py-3 rounded-full font-bold shadow-active"
        >
          Back to Home
        </button>
      </div>
    );
  }

  const getParticipantInfo = (p: { id: string; name: string; avatar?: string }) => {
    const liveUser = users.find(u => u.id === p.id);
    return {
      name: liveUser?.name || p.name,
      avatarColorIndex: liveUser?.avatarColorIndex
    };
  };

  const handleConfirm = () => {
    updateEventStatus(event.id, 'confirmed');
    setSuccessMsg("You've joined the event!");
    setSuccess(true);
    setTimeout(() => {
      setSuccess(false);
      navigate('/dashboard');
    }, 2000);
  };

  const handleDecline = () => {
    updateEventStatus(event.id, 'cancelled');
    navigate('/dashboard');
  };

  const handleScan = () => {
    setScanning(true);
    setTimeout(() => {
      setScanning(false);
      setSuccessMsg(`Your attendance has been recorded for ${event.title}.`);
      setSuccess(true);
      checkIn(event.id);
      setTimeout(() => setSuccess(false), 3000);
    }, 2000);
  };

  const isCheckedIn = event.participants.some(p => p.id === user.id && p.status === 'checked-in');
  const me = event.participants.find(p => p.id === user.id);
  const isPending = me?.status === 'pending';
  const isMissed = me?.status === 'missed';
  const isCancelled = event.status === 'cancelled';

  const isHost = event.hostId === user.id;

  // Time-based checks
  const [isWindowValid, setIsWindowValid] = useState(true);

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      const [hours, minutes] = event.time.split(':').map(Number);
      const eventStartTime = new Date();
      eventStartTime.setHours(hours, minutes, 0, 0);
      
      const diffInMinutes = (now.getTime() - eventStartTime.getTime()) / (1000 * 60);
      setIsWindowValid(diffInMinutes <= 15);
    }, 1000);
    return () => clearInterval(timer);
  }, [event.time]);

  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [showQR, setShowQR] = useState(false);

  const handleCancelClick = () => {
    setShowCancelConfirm(true);
  };

  const handleConfirmCancel = () => {
    updateEventStatus(event.id, 'cancelled');
    setShowCancelConfirm(false);
    setSuccessMsg("Event has been cancelled.");
    setSuccess(true);
    setTimeout(() => setSuccess(false), 3000);
  };

  return (
    <div className="min-h-screen bg-surface pb-32">
      <header className="fixed top-0 w-full flex justify-between items-center px-6 py-4 bg-surface/80 backdrop-blur-xl z-50 border-b border-outline-variant/10 shadow-tactile">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate(-1)}
            className="p-2 text-on-surface-variant hover:text-primary transition-colors"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <span className="text-2xl font-black text-primary tracking-tighter">EVENT</span>
        </div>
        <div className="flex items-center gap-2">
          {isHost && !isCancelled && (
            <>
              <button 
                onClick={handleCancelClick}
                className="px-4 py-2 bg-error/10 text-error rounded-full text-xs font-bold hover:bg-error/20 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={() => navigate(`/edit/${event.id}`)}
                className="px-4 py-2 bg-primary/10 text-primary rounded-full text-xs font-bold hover:bg-primary/20 transition-colors flex items-center gap-2"
              >
                <Edit2 className="w-3.5 h-3.5" />
                Edit
              </button>
            </>
          )}
          <button className="p-2 text-on-surface-variant hover:text-primary transition-colors">
            <Share2 className="w-5 h-5" />
          </button>
          <button className="p-2 text-on-surface-variant hover:text-primary transition-colors">
            <MoreHorizontal className="w-5 h-5" />
          </button>
        </div>
      </header>

      <main className={cn("pt-24 px-6 max-w-lg mx-auto space-y-8", isCancelled && "opacity-80")}>
        <section className="space-y-4">
          <div className="flex items-center gap-3">
            {isCancelled ? (
              <span className="bg-surface-container-highest text-on-surface-variant text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full border border-outline-variant/20 flex items-center gap-1.5">
                <AlertCircle className="w-3 h-3" />
                Cancelled
              </span>
            ) : (
              <span className={getPriorityStyle(event.priority)}>{event.priority}</span>
            )}
            <span className="text-xs font-bold text-on-surface-variant bg-surface-container-high px-3 py-1 rounded-full flex items-center gap-2">
              {(() => {
                const Icon = getEventIcon(event.type, event.customTypeIcon);
                return <Icon className="w-3 h-3" />;
              })()}
              {event.type === 'custom' && event.customTypeName ? event.customTypeName : event.type}
            </span>
          </div>
          <h1 className={cn(
            "text-4xl font-headline font-bold text-on-surface tracking-tight leading-tight",
            isCancelled && "line-through decoration-on-surface/30"
          )}>
            {event.title}
          </h1>
          <div className="bg-surface-container-low rounded-3xl p-6 flex flex-col gap-6 shadow-tactile">
            <div className="flex items-center gap-4">
              <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center", isCancelled ? "bg-surface-container-highest text-on-surface-variant/40" : "bg-primary-container text-primary")}>
                <Calendar className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-bold text-on-surface">{event.date}</p>
                <p className="text-xs font-medium text-on-surface-variant">Upcoming Friday</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center", isCancelled ? "bg-surface-container-highest text-on-surface-variant/40" : "bg-secondary-container text-secondary")}>
                <Clock className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-bold text-on-surface">{event.time}</p>
                <p className="text-xs font-medium text-on-surface-variant">Duration: 2 Hours</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-surface-container-highest flex items-center justify-center text-on-surface-variant">
                <MapPin className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-bold text-on-surface">{event.location}</p>
                {!isCancelled && <button className="text-xs font-bold text-primary hover:underline">View on Campus Map</button>}
              </div>
            </div>
          </div>
        </section>

        <section className="space-y-4">
          <div className="flex justify-between items-center px-1">
            <h3 className="font-headline text-xl font-bold text-on-surface">Participants</h3>
            <span className="text-sm font-bold text-primary">{event.participants.filter(p => p.id !== event.hostId && (p.status === 'joined' || p.status === 'checked-in' || p.status === 'late')).length} Joined</span>
          </div>
          <div className={cn("space-y-3", isCancelled && "pointer-events-none")}>
            {event.participants.map((p, idx) => {
              const info = getParticipantInfo(p);
              return (
              <div key={idx} className={cn(
                "bg-surface-container-low rounded-2xl p-4 flex items-center justify-between shadow-sm transition-opacity",
                (p.status === 'declined' || isCancelled) ? "opacity-50 grayscale" : ""
              )}>
                <div className="flex items-center gap-4">
                  <div className={cn(
                    "w-10 h-10 rounded-full overflow-hidden border-2 border-primary-container p-0.5 flex items-center justify-center",
                    getAvatarColor(p.id, info.avatarColorIndex).bg
                  )}>
                    <span className={cn("font-black text-xs", getAvatarColor(p.id, info.avatarColorIndex).text)}>
                      {getInitials(info.name)}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-on-surface">{info.name} {p.id === user.id && "(You)"}</p>
                    <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">{p.role || 'Participant'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <StatusBadge status={isCancelled ? 'cancelled' : (p.id === event.hostId ? 'host' : p.status)} lateTime={p.lateTime} />
                </div>
              </div>
            );})}
          </div>
        </section>

        {!isCancelled && (
          <motion.div 
            className="fixed bottom-10 left-1/2 -translate-x-1/2 w-full max-w-sm px-6 z-40"
            initial={{ y: 100 }}
            animate={{ y: 0 }}
          >
            {isHost ? (
              <button 
                onClick={() => {
                  if (isWindowValid) {
                    setShowQR(true);
                    if (!isCheckedIn) checkIn(event.id);
                  }
                }}
                disabled={!isWindowValid}
                className={cn(
                  "w-full p-6 rounded-[2.5rem] shadow-active transition-all flex items-center justify-center gap-4 active:scale-95",
                  isWindowValid 
                    ? "bg-gradient-to-br from-primary to-primary-container text-on-primary hover:-translate-y-1" 
                    : "bg-surface-container-highest text-on-surface-variant/40"
                )}
              >
                <QrCode className="w-7 h-7" />
                <span className="font-headline text-xl font-bold tracking-tight">
                  {isWindowValid ? 'Generate QR for Check-in' : 'Check-in Window Closed'}
                </span>
              </button>
            ) : isPending ? (
              <div className="flex flex-col gap-3">
                {event.isMajorUpdate && (
                  <motion.div 
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-center gap-2 px-3 py-2 bg-on-surface/5 backdrop-blur-sm rounded-2xl border border-outline-variant/10 self-start mb-1"
                  >
                    <span className="bg-primary text-on-primary text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md flex items-center gap-1 shadow-sm">
                      <AlertCircle className="w-2.5 h-2.5" />
                      Updated
                    </span>
                    <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-tight">Please Confirm Details Again</span>
                  </motion.div>
                )}
                <div className="flex gap-4">
                  <button 
                    onClick={handleConfirm}
                    className="flex-[2] bg-gradient-to-br from-primary to-primary-container text-on-primary p-5 rounded-[2rem] shadow-active font-headline font-bold text-lg active:scale-95 transition-all"
                  >
                    Confirm
                  </button>
                  <button 
                    onClick={handleDecline}
                    className="flex-1 bg-surface-container-high text-on-surface p-5 rounded-[2rem] font-headline font-bold text-lg active:scale-95 transition-all"
                  >
                    Decline
                  </button>
                </div>
              </div>
            ) : isCheckedIn ? (
              <div className="w-full bg-surface-container-lowest border border-success/30 p-5 rounded-[2.5rem] shadow-tactile flex items-center justify-center gap-3">
                <CheckCircle2 className="w-6 h-6 text-success" />
                <div className="flex flex-col">
                  <span className="font-headline text-lg font-bold text-on-surface">Checked In Successfully</span>
                  {me?.checkInTime && <span className="text-[10px] font-mono text-on-surface-variant uppercase">At {new Date(me.checkInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>}
                </div>
              </div>
            ) : isMissed ? (
              <div className="w-full bg-error/10 border border-error/30 p-6 rounded-[2.5rem] shadow-inner flex items-center justify-center gap-4">
                <AlertCircle className="w-7 h-7 text-error" />
                <div className="text-left">
                  <p className="font-headline text-lg font-bold text-error leading-tight">Missed Event</p>
                  <p className="text-[10px] font-bold text-error/60 uppercase tracking-widest">Attendance window closed</p>
                </div>
              </div>
            ) : (
              <button 
                onClick={handleScan}
                disabled={scanning || !isWindowValid}
                className={cn(
                  "w-full p-6 rounded-[2.5rem] shadow-active transition-all flex items-center justify-center gap-4 active:scale-95 disabled:opacity-70",
                  isWindowValid 
                    ? "bg-gradient-to-br from-primary to-primary-container text-on-primary hover:-translate-y-1"
                    : "bg-surface-container-highest text-on-surface-variant/40"
                )}
              >
                <AnimatePresence mode="wait">
                  {scanning ? (
                    <motion.div 
                      key="scanning"
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="flex items-center gap-3"
                    >
                      <Loader2 className="w-7 h-7 animate-spin" />
                      <span className="font-headline text-xl font-bold tracking-tight">Scanning QR...</span>
                    </motion.div>
                  ) : !isWindowValid ? (
                    <motion.div 
                      key="closed"
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="flex items-center gap-3"
                    >
                      <AlertCircle className="w-7 h-7" />
                      <span className="font-headline text-xl font-bold tracking-tight">Check-in Closed</span>
                    </motion.div>
                  ) : (
                    <motion.div 
                      key="idle"
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="flex items-center gap-3"
                    >
                      <QrCode className="w-7 h-7" />
                      <span className="font-headline text-xl font-bold tracking-tight">Check-in at Event</span>
                    </motion.div>
                  )}
                </AnimatePresence>
              </button>
            )}
          </motion.div>
        )}
      </main>

      <AnimatePresence>
        {success && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-surface/80 backdrop-blur-md"
          >
            <div className="bg-surface-container-low p-8 rounded-[3rem] shadow-tactile flex flex-col items-center text-center max-w-xs border border-primary/10">
              <div className="w-20 h-20 bg-primary-container rounded-full flex items-center justify-center mb-6">
                <CheckCircle2 className="w-10 h-10 text-primary" />
              </div>
              <h2 className="text-2xl font-headline font-bold text-on-surface mb-2">
                {isCancelled ? "Action Complete" : (event.status === 'confirmed' && !isCheckedIn ? 'Successfully Joined' : 'Check-in Complete')}
              </h2>
              <p className="text-on-surface-variant font-medium">{successMsg}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Cancel Confirmation Modal */}
      <AnimatePresence>
        {showCancelConfirm && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-on-surface/20 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-surface p-8 rounded-[2.5rem] shadow-2xl max-w-xs w-full text-center border border-outline-variant/20"
            >
              <div className="w-16 h-16 bg-error/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <AlertCircle className="w-8 h-8 text-error" />
              </div>
              <h3 className="text-2xl font-headline font-bold text-on-surface mb-2">Cancel this event?</h3>
              <p className="text-on-surface-variant text-sm mb-8 leading-relaxed">
                This will notify all participants and remove the event from active schedules. This action cannot be undone.
              </p>
              <div className="flex flex-col gap-3">
                <button 
                  onClick={handleConfirmCancel}
                  className="w-full bg-error text-on-error py-4 rounded-2xl font-bold active:scale-95 transition-all shadow-md"
                >
                  Confirm Cancel
                </button>
                <button 
                  onClick={() => setShowCancelConfirm(false)}
                  className="w-full bg-surface-container-high text-on-surface py-4 rounded-2xl font-bold active:scale-95 transition-all"
                >
                  Dismiss
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* QR Code Modal for Host */}
      <AnimatePresence>
        {showQR && (
          <div 
            className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-on-surface/40 backdrop-blur-md"
            onClick={() => setShowQR(false)}
          >
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-surface p-10 rounded-[3rem] shadow-2xl max-w-sm w-full text-center border border-outline-variant/20"
            >
              <div className="flex justify-between items-center mb-8">
                <h3 className="text-2xl font-headline font-bold text-on-surface">Event Check-in</h3>
                <button onClick={() => setShowQR(false)} className="p-2 hover:bg-surface-container-high rounded-full">
                  <MoreHorizontal className="w-5 h-5 text-on-surface-variant" />
                </button>
              </div>
              
              <div className="bg-white p-6 rounded-3xl inline-block shadow-inner mb-8">
                <div className="w-48 h-48 bg-stone-50 flex items-center justify-center relative overflow-hidden rounded-xl border border-stone-100">
                  <QrCode className="w-32 h-32 text-stone-800" />
                  <div className="absolute inset-0 grid grid-cols-6 grid-rows-6 opacity-[0.03] pointer-events-none">
                    {Array.from({ length: 36 }).map((_, i) => (
                      <div key={i} className={cn("m-1", i % 3 === 0 ? "bg-stone-950" : "")} />
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <p className="text-on-surface-variant text-sm font-medium">
                  Scan this code to mark attendance for <br />
                  <span className="text-on-surface font-bold text-base">{event.title}</span>
                </p>
                <div className="flex items-center justify-center gap-2 text-xs font-bold text-primary uppercase tracking-widest bg-primary/5 py-3 rounded-2xl outline-1 outline-dashed outline-primary/20">
                  <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                  Live Attendance Tracking
                </div>
              </div>
              
              <button 
                onClick={() => setShowQR(false)}
                className="w-full mt-8 bg-surface-container-highest text-on-surface py-5 rounded-2xl font-bold active:scale-95 transition-all"
              >
                Done
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function StatusBadge({ status, lateTime }: { status: string, lateTime?: string }) {
  if (status === 'host') return (
    <div className="flex items-center gap-1 bg-primary text-on-primary px-3 py-1 rounded-full shadow-sm">
      <span className="text-[10px] font-bold uppercase tracking-widest">Host</span>
    </div>
  );
  if (status === 'cancelled') return (
    <div className="flex items-center gap-1 bg-surface-container-highest text-on-surface-variant/40 px-3 py-1 rounded-full border border-outline-variant/10">
      <span className="text-[10px] font-bold uppercase tracking-widest">Cancelled</span>
    </div>
  );
  if (status === 'checked-in') return (
    <div className="flex items-center gap-1 bg-primary/10 text-primary px-3 py-1 rounded-full">
      <UserCheck className="w-3 h-3" />
      <span className="text-[10px] font-bold uppercase tracking-widest">Present</span>
    </div>
  );
  if (status === 'late') return (
    <div className="flex items-center gap-1 bg-error-container text-on-error-container px-3 py-1 rounded-full">
      <AlertCircle className="w-3 h-3" />
      <span className="text-[10px] font-bold uppercase tracking-widest">Late {lateTime}</span>
    </div>
  );
  if (status === 'missed') return (
    <div className="flex items-center gap-1 bg-error/10 text-error px-3 py-1 rounded-full">
      <AlertCircle className="w-3 h-3" />
      <span className="text-[10px] font-bold uppercase tracking-widest">Missed</span>
    </div>
  );
  if (status === 'joined') return (
    <div className="flex items-center gap-1 bg-secondary-container text-on-secondary-container px-3 py-1 rounded-full">
      <CheckCircle2 className="w-3 h-3" />
      <span className="text-[10px] font-bold uppercase tracking-widest">Joined</span>
    </div>
  );
  if (status === 'declined') return (
    <div className="flex items-center gap-1 bg-surface-container-high text-on-surface-variant/40 px-3 py-1 rounded-full border border-outline-variant/10">
      <span className="text-[10px] font-bold uppercase tracking-widest">Declined</span>
    </div>
  );
  return (
    <div className="flex items-center gap-1 bg-surface-container-high text-on-surface-variant px-3 py-1 rounded-full">
      <span className="text-[10px] font-bold uppercase tracking-widest">Pending</span>
    </div>
  );
}

function getPriorityStyle(p: string) {
  if (p === 'Very Important') return 'bg-error-container text-on-error-container text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full';
  if (p === 'Important') return 'bg-secondary-container text-on-secondary-container text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full';
  return 'bg-surface-container-high text-on-surface text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full';
}
