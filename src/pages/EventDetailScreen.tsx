import { ArrowLeft, Settings, MapPin, Clock, Calendar, CheckCircle2, QrCode, Share2, MoreHorizontal, UserCheck, AlertCircle, Loader2 } from 'lucide-react';
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
  const { events, checkIn, updateEventStatus, user } = useApp();
  const [scanning, setScanning] = useState(false);
  const [success, setSuccess] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const event = events.find(e => e.id === id) || events[0];

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
          <button className="p-2 text-on-surface-variant hover:text-primary transition-colors">
            <Share2 className="w-5 h-5" />
          </button>
          <button className="p-2 text-on-surface-variant hover:text-primary transition-colors">
            <MoreHorizontal className="w-5 h-5" />
          </button>
        </div>
      </header>

      <main className="pt-24 px-6 max-w-lg mx-auto space-y-8">
        <section className="space-y-4">
          <div className="flex items-center gap-3">
            <span className={getPriorityStyle(event.priority)}>{event.priority}</span>
            <span className="text-xs font-bold text-on-surface-variant bg-surface-container-high px-3 py-1 rounded-full flex items-center gap-2">
              {(() => {
                const Icon = getEventIcon(event.type, event.customTypeIcon);
                return <Icon className="w-3 h-3" />;
              })()}
              {event.type === 'custom' && event.customTypeName ? event.customTypeName : event.type}
            </span>
          </div>
          <h1 className="text-4xl font-headline font-bold text-on-surface tracking-tight leading-tight">
            {event.title}
          </h1>
          <div className="bg-surface-container-low rounded-3xl p-6 flex flex-col gap-6 shadow-tactile">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-primary-container flex items-center justify-center text-primary">
                <Calendar className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-bold text-on-surface">{event.date}</p>
                <p className="text-xs font-medium text-on-surface-variant">Upcoming Friday</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-secondary-container flex items-center justify-center text-secondary">
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
                <button className="text-xs font-bold text-primary hover:underline">View on Campus Map</button>
              </div>
            </div>
          </div>
        </section>

        <section className="space-y-4">
          <div className="flex justify-between items-center px-1">
            <h3 className="font-headline text-xl font-bold text-on-surface">Participants</h3>
            <span className="text-sm font-bold text-primary">{event.participants.length} Joined</span>
          </div>
          <div className="space-y-3">
            {event.participants.map((p, idx) => (
              <div key={idx} className="bg-surface-container-low rounded-2xl p-4 flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-4">
                  <div className={cn(
                    "w-10 h-10 rounded-full overflow-hidden border-2 border-primary-container p-0.5 flex items-center justify-center",
                    getAvatarColor(p.id, p.id === user.id ? user.avatarColorIndex : undefined).bg
                  )}>
                    <span className={cn("font-black text-xs", getAvatarColor(p.id, p.id === user.id ? user.avatarColorIndex : undefined).text)}>
                      {getInitials(p.name)}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-on-surface">{p.name} {p.id === user.id && "(You)"}</p>
                    <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">{p.role || 'Participant'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <StatusBadge status={p.status} lateTime={p.lateTime} />
                </div>
              </div>
            ))}
          </div>
        </section>

        <motion.div 
          className="fixed bottom-10 left-1/2 -translate-x-1/2 w-full max-w-sm px-6 z-50"
          initial={{ y: 100 }}
          animate={{ y: 0 }}
        >
          {event.status === 'pending' ? (
            <div className="flex gap-4">
              <button 
                onClick={handleConfirm}
                className="flex-[2] bg-gradient-to-br from-primary to-primary-container text-on-primary p-5 rounded-[2rem] shadow-active font-headline font-bold text-lg active:scale-95 transition-all"
              >
                Confirm Join
              </button>
              <button 
                onClick={handleDecline}
                className="flex-1 bg-surface-container-high text-on-surface p-5 rounded-[2rem] font-headline font-bold text-lg active:scale-95 transition-all"
              >
                Decline
              </button>
            </div>
          ) : isCheckedIn ? (
            <div className="w-full bg-surface-container-lowest border border-success/30 p-5 rounded-[2.5rem] shadow-tactile flex items-center justify-center gap-3">
              <CheckCircle2 className="w-6 h-6 text-success" />
              <span className="font-headline text-lg font-bold text-on-surface">Checked In Successfully</span>
            </div>
          ) : (
            <button 
              onClick={handleScan}
              disabled={scanning}
              className="w-full bg-gradient-to-br from-primary to-primary-container text-on-primary p-6 rounded-[2.5rem] shadow-active hover:-translate-y-1 transition-all flex items-center justify-center gap-4 active:scale-95 disabled:opacity-70"
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
                {event.status === 'confirmed' && !isCheckedIn ? 'Successfully Joined' : 'Check-in Complete'}
              </h2>
              <p className="text-on-surface-variant font-medium">{successMsg}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function StatusBadge({ status, lateTime }: { status: string, lateTime?: string }) {
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
  if (status === 'joined') return (
    <div className="flex items-center gap-1 bg-secondary-container text-on-secondary-container px-3 py-1 rounded-full">
      <CheckCircle2 className="w-3 h-3" />
      <span className="text-[10px] font-bold uppercase tracking-widest">Joined</span>
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
