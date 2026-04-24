import { Bell, Settings, Users, AlarmClock, RefreshCcw, XCircle, Info, ChevronRight, CheckCircle2 } from 'lucide-react';
import { IMAGES } from '../constants';
import { Header } from '../components/Header';
import { BottomNav } from '../components/BottomNav';
import { motion, AnimatePresence } from 'motion/react';
import { useApp } from '../context/AppContext';
import { useState } from 'react';
import { getAvatarColor, getInitials, cn } from '../lib/utils';
import { useNavigate } from 'react-router-dom';

type FilterType = 'all' | 'invitations' | 'updates';

export function AlertsScreen() {
  const navigate = useNavigate();
  const { user, notifications, markNotificationRead, events } = useApp();
  const [activeTab, setActiveTab] = useState<FilterType>('all');

  const getSenderName = (id: string) => {
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
    return contacts[id] || 'User';
  };

  const filteredNotifications = notifications.filter(notif => {
    // Hide invitation notifications if the user has already responded
    if (notif.type === 'invitation' && notif.eventId) {
      const event = events.find(e => e.id === notif.eventId);
      if (event) {
        const me = event.participants.find(p => p.id === user.id);
        if (me && me.status !== 'pending') return false;
      }
    }

    if (activeTab === 'all') return true;
    if (activeTab === 'invitations') return notif.type === 'invitation';
    if (activeTab === 'updates') return ['update', 'cancel', 'reminder'].includes(notif.type);
    return true;
  });

  const handleNotificationClick = (notif: typeof notifications[0]) => {
    markNotificationRead(notif.id);
    if (notif.eventId) {
      navigate(`/event-detail/${notif.eventId}`);
    }
  };

  return (
    <div className="min-h-screen bg-surface pb-32">
      <Header />
      
      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pt-24">
        <header className="mb-8 pt-4">
          <h1 className="text-4xl font-headline font-black text-primary tracking-tight mb-2">Notifications</h1>
          <p className="text-on-surface-variant text-lg font-medium">You have {notifications.filter(n => n.unread).length} unread messages.</p>
        </header>

        <div className="flex gap-3 mb-8 overflow-x-auto no-scrollbar pb-2">
          <button 
            onClick={() => setActiveTab('all')}
            className={`px-6 py-2.5 rounded-full font-bold text-sm whitespace-nowrap transition-all ${
              activeTab === 'all' 
                ? "bg-primary text-on-primary shadow-active" 
                : "bg-surface-container-high text-on-surface hover:bg-surface-container-highest"
            }`}
          >
            All
          </button>
          <button 
            onClick={() => setActiveTab('invitations')}
            className={`px-6 py-2.5 rounded-full font-bold text-sm whitespace-nowrap transition-all ${
              activeTab === 'invitations' 
                ? "bg-primary text-on-primary shadow-active" 
                : "bg-surface-container-high text-on-surface hover:bg-surface-container-highest"
            }`}
          >
            Invitations
          </button>
          <button 
            onClick={() => setActiveTab('updates')}
            className={`px-6 py-2.5 rounded-full font-bold text-sm whitespace-nowrap transition-all ${
              activeTab === 'updates' 
                ? "bg-primary text-on-primary shadow-active" 
                : "bg-surface-container-high text-on-surface hover:bg-surface-container-highest"
            }`}
          >
            Updates
          </button>
        </div>

        <div className="flex flex-col gap-4">
          <AnimatePresence initial={false} mode="wait">
            {filteredNotifications.length > 0 ? (
              <motion.div 
                key={activeTab}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col gap-4"
              >
                {filteredNotifications.map((notif) => (
                  <motion.div 
                    key={notif.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    onClick={() => handleNotificationClick(notif)}
                    className={`bg-surface-container-lowest rounded-[2rem] p-5 shadow-tactile relative flex gap-4 items-center cursor-pointer active:scale-[0.99] transition-all ${!notif.unread ? "opacity-60 grayscale-[0.2]" : ""}`}
                  >
                    {notif.unread && (
                      <div className="absolute top-5 right-5 w-3 h-3 bg-error-container rounded-full ring-2 ring-white" />
                    )}
                    <div className={cn(
                      "w-12 h-12 rounded-full flex items-center justify-center shrink-0 shadow-sm",
                      notif.senderId && notif.senderId !== 'system' 
                        ? getAvatarColor(notif.senderId, notif.senderId === user.id ? user.avatarColorIndex : undefined).bg 
                        : getIconColor(notif.type)
                    )}>
                      {notif.senderId && notif.senderId !== 'system' ? (
                        <span className={cn("font-black text-lg", getAvatarColor(notif.senderId, notif.senderId === user.id ? user.avatarColorIndex : undefined).text)}>
                          {getInitials(getSenderName(notif.senderId))}
                        </span>
                      ) : (
                        getIcon(notif.type)
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-headline font-bold text-on-surface text-lg mb-1 leading-tight">{notif.title}</h3>
                      <p className="text-on-surface-variant text-sm font-medium leading-relaxed">
                        {notif.desc}
                      </p>
                      <p className="text-[10px] text-outline font-bold uppercase tracking-widest mt-2">
                        {notif.time}
                      </p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-outline-variant" />
                  </motion.div>
                ))}
              </motion.div>
            ) : (
              <motion.div 
                key={`empty-${activeTab}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center py-20 text-center space-y-4"
              >
                <div className="w-16 h-16 bg-surface-container-low rounded-full flex items-center justify-center">
                  <CheckCircle2 className="w-8 h-8 text-outline" />
                </div>
                <p className="text-on-surface-variant font-medium">
                  {activeTab === 'all' ? "All caught up!" : `No ${activeTab} yet.`}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      <BottomNav />
    </div>
  );
}

function getIcon(type: string) {
  switch (type) {
    case 'invitation': return <Users className="w-6 h-6 fill-current" />;
    case 'reminder': return <AlarmClock className="w-6 h-6 fill-current" />;
    case 'update': return <RefreshCcw className="w-6 h-6" />;
    case 'cancel': return <XCircle className="w-6 h-6" />;
    default: return <Info className="w-6 h-6" />;
  }
}

function getIconColor(type: string) {
  switch (type) {
    case 'invitation': return 'bg-primary-container/20 text-primary';
    case 'reminder': return 'bg-secondary-container/20 text-secondary';
    case 'update': return 'bg-secondary-container/30 text-on-secondary-container';
    default: return 'bg-surface-variant text-on-surface-variant';
  }
}
