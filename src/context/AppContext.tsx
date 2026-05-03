import React, { createContext, useContext, useState, ReactNode } from 'react';
import { IMAGES } from '../constants';

export type EventType = 'work' | 'meal' | 'exercise' | 'travel' | 'custom' | 'study' | 'meeting' | 'social' | 'Lecture';
export type Priority = 'Casual' | 'Important' | 'Very Important';
export type EventStatus = 'upcoming' | 'pending' | 'cancelled' | 'confirmed';
export type ParticipantStatus = 'pending' | 'joined' | 'late' | 'checked-in' | 'declined' | 'missed';

export interface Participant {
  id: string;
  name: string;
  avatar?: string;
  status: ParticipantStatus;
  role?: 'Host' | 'Participant';
  lateTime?: string;
  checkInTime?: number;
}

export interface AppEvent {
  id: string;
  title: string;
  type: EventType | string;
  customTypeName?: string;
  customTypeIcon?: string;
  date: string;
  time: string;
  location: string;
  priority: Priority;
  status: EventStatus;
  participants: Participant[];
  hostId: string;
  isMajorUpdate?: boolean;
}

export interface Notification {
  id: string;
  title: string;
  desc: string;
  type: 'invitation' | 'update' | 'cancel' | 'reminder';
  unread: boolean;
  time: string;
  createdAt: number;
  actions?: boolean;
  senderId?: string;
  targetUserId?: string;
  eventId?: string;
}

interface User {
  id: string;
  name: string;
  avatar: string;
  role: string;
  campus: string;
  year: string;
  reliability: number;
  appointments: number;
  onTime: number;
  avatarColorIndex?: number;
  bannerGradientIndex?: number;
}

const DEFAULT_USERS: User[] = [
  {
    id: 'user_1',
    name: 'P. Buncharas',
    avatar: '',
    role: 'Urban Explorer & Coffee Enthusiast',
    campus: 'Chula University',
    year: '3rd Year',
    reliability: 0,
    appointments: 0,
    onTime: 0,
    avatarColorIndex: 0,
    bannerGradientIndex: 0,
  },
  {
    id: '1',
    name: 'S. Boss-man',
    avatar: '',
    role: 'Senior Project Manager & Tactician',
    campus: 'Chula University',
    year: '4th Year',
    reliability: 0,
    appointments: 0,
    onTime: 0,
    avatarColorIndex: 1,
    bannerGradientIndex: 1,
  }
];

interface AppContextType {
  user: User;
  users: User[];
  events: AppEvent[];
  notifications: Notification[];
  isAuthenticated: boolean;
  isSettingsOpen: boolean;
  login: (userId: string) => void;
  logout: () => void;
  updateUser: (data: Partial<User>) => void;
  addEvent: (event: Omit<AppEvent, 'id' | 'status' | 'participants' | 'hostId'>) => void;
  updateEventStatus: (id: string, status: EventStatus) => void;
  markNotificationRead: (id: string) => void;
  handleNotificationAction: (id: string, action: 'accept' | 'decline') => void;
  checkIn: (eventId: string) => void;
  toggleSettings: () => void;
  updateEvent: (id: string, eventData: Partial<AppEvent>) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [users, setUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem('mapao_users');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse users', e);
      }
    }
    return DEFAULT_USERS;
  });

  const [currentUserId, setCurrentUserId] = useState(() => {
    return localStorage.getItem('mapao_user_id') || 'user_1';
  });

  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem('mapao_auth') === 'true';
  });

  const [events, setEvents] = useState<AppEvent[]>(() => {
    const saved = localStorage.getItem('mapao_events');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse events', e);
      }
    }
    return [];
  });

  // Derived stats helper
  const calculateUserStats = (userId: string, allEvents: AppEvent[]) => {
    let appointments = 0;
    let onTime = 0;

    allEvents.forEach(e => {
      // Ignore cancelled events
      if (e.status === 'cancelled') return;

      const participant = e.participants.find(p => p.id === userId);
      if (!participant) return;

      // Event time has passed (start + 15 mins cutoff)
      const [hours, minutes] = e.time.split(':').map(Number);
      const eventStartTime = new Date();
      eventStartTime.setHours(hours, minutes, 0, 0);
      const passed = (Date.now() - eventStartTime.getTime()) / (1000 * 60) > 15;

      if (passed) {
        // Requirement: Host OR in confirmed list (joined, checked-in, late, missed)
        // Non-participating roles (declined) or stale unconfirmed pending invitations are excluded
        const isHost = e.hostId === userId;
        const isConfirmed = ['joined', 'checked-in', 'late', 'missed'].includes(participant.status);

        if (isHost || isConfirmed) {
          appointments++;
          if (participant.status === 'checked-in') {
            onTime++;
          }
        }
      }
    });

    const reliability = appointments > 0 ? Math.round((onTime / appointments) * 100) : 0;
    return { appointments, onTime, reliability };
  };

  // Compute users with stats
  const usersWithStats = React.useMemo(() => {
    return users.map(u => {
      const stats = calculateUserStats(u.id, events);
      return { ...u, ...stats };
    });
  }, [users, events]);

  const user = usersWithStats.find(u => u.id === currentUserId) || usersWithStats[0];

  const updateUser = (data: Partial<User> | ((prev: User) => Partial<User>)) => {
    setUsers(prevUsers => {
      const newUsers = prevUsers.map(u => {
        if (u.id === currentUserId) {
          const updateData = typeof data === 'function' ? data(u) : data;
          const updatedUser = { ...u, ...updateData };
          // Stats are derived, so we don't need to manually calculate here
          // but we keep the logic consistent if manual updates happen
          return updatedUser;
        }
        return u;
      });
      localStorage.setItem('mapao_users', JSON.stringify(newUsers));
      return newUsers;
    });
  };

  const login = (userId: string) => {
    localStorage.setItem('mapao_auth', 'true');
    localStorage.setItem('mapao_user_id', userId);
    setCurrentUserId(userId);
    setIsAuthenticated(true);
  };

  const logout = () => {
    localStorage.removeItem('mapao_auth');
    setIsAuthenticated(false);
  };

  // Persist events to localStorage
  React.useEffect(() => {
    localStorage.setItem('mapao_events', JSON.stringify(events));
  }, [events]);

  const [notifications, setNotifications] = useState<Notification[]>([]);

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const toggleSettings = () => setIsSettingsOpen(prev => !prev);
  
  // Background logic to mark missed events and update totals
  React.useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      setEvents(prevEvents => {
        let changed = false;
        const newEvents = prevEvents.map(e => {
          // Only check non-cancelled events
          if (e.status === 'cancelled') return e;

          const [hours, minutes] = e.time.split(':').map(Number);
          const eventStartTime = new Date();
          eventStartTime.setHours(hours, minutes, 0, 0);

          const diffInMinutes = (now.getTime() - eventStartTime.getTime()) / (1000 * 60);

          // If more than 15 minutes passed
          if (diffInMinutes > 15) {
            let eventChanged = false;
            const updatedParticipants = e.participants.map(p => {
              // If participant is still pending or joined but hasn't checked in
              if (p.id === user.id && (p.status === 'pending' || p.status === 'joined')) {
                // Mark as missed if they were supposed to join
                // Note: We only count it as an appointment if they WERE expected (joined or pending)
                // Actually, the requirement says "For users still attendanceStatus = pending -> update to missed"
                // and "Total Appointments: Count events where user is in event AND event time has passed"
                eventChanged = true;
                changed = true;
                return { ...p, status: 'missed' as ParticipantStatus };
              }
              return p;
            });

            if (eventChanged) {
              return { ...e, participants: updatedParticipants, status: 'upcoming' }; // Status 'upcoming' is just current schema
            }
          }
          return e;
        });

        return changed ? newEvents : prevEvents;
      });
    }, 30000); // Check every 30 seconds

    return () => clearInterval(interval);
  }, [user.id]);

  // Filter events for the current user
  const userEvents = events.filter(e => 
    e.hostId === user.id || 
    e.participants.some(p => p.id === user.id)
  );

  // Filter notifications for current user, sorted by newest first
  const userNotifications = notifications
    .filter(n => n.targetUserId === user.id || (!n.targetUserId && !n.senderId))
    .sort((a, b) => b.createdAt - a.createdAt || b.id.localeCompare(a.id));

  const addNotifications = (newNotifs: Notification[]) => {
    setNotifications(prev => {
      let filtered = [...prev];
      newNotifs.forEach(newNotif => {
        // Uniqueness check: eventId + senderId + targetUserId + type
        // If type is 'update', also check title to distinguish between 'joined' and 'declined'
        filtered = filtered.filter(n => {
          const isSameEvent = n.eventId === newNotif.eventId;
          const isSameSender = n.senderId === newNotif.senderId;
          const isSameTarget = n.targetUserId === newNotif.targetUserId;
          const isSameType = n.type === newNotif.type;
          const isSameTitle = n.title === newNotif.title;

          if (isSameEvent && isSameSender && isSameTarget && isSameType) {
            if (newNotif.type === 'update') {
              return !isSameTitle; // Replace if title is same too
            }
            return false; // Replace for other types
          }
          return true;
        });
      });
      return [...filtered, ...newNotifs];
    });
  };

  const addEvent = (eventData: Omit<AppEvent, 'id' | 'status' | 'participants' | 'hostId'>) => {
    const newEventId = `e${events.length + 1}`;
    
    const participantsData = (eventData as any).participants || [];

    const newEvent: AppEvent = {
      ...eventData,
      id: newEventId,
      status: 'upcoming',
      hostId: user.id,
      participants: [
        { id: user.id, name: user.name, avatar: user.avatar, status: 'joined', role: 'Host' },
        ...participantsData.map((p: any) => ({ ...p, status: 'pending' }))
      ]
    };

    setEvents(prev => [...prev, newEvent]);

    // Send invitations to other participants
    const invites = participantsData.filter((p: any) => p.id !== user.id);
    if (invites.length > 0) {
      const newNotifications: Notification[] = invites.map((p: any) => ({
        id: `n_invite_${newEventId}_${p.id}`,
        title: 'Event Invitation',
        desc: `You've been invited to "${newEvent.title}" by ${user.name}`,
        type: 'invitation' as const,
        unread: true,
        time: 'Just now',
        createdAt: Date.now(),
        actions: true,
        senderId: user.id,
        targetUserId: p.id,
        eventId: newEventId,
      }));
      addNotifications(newNotifications);
    }
  };

  const updateEventStatus = (id: string, status: EventStatus) => {
    setEvents(prevEvents => {
      const eventToUpdate = prevEvents.find(e => e.id === id);
      if (!eventToUpdate) return prevEvents;

      const isHost = eventToUpdate.hostId === user.id;
      let newGlobalStatus = eventToUpdate.status;
      
      const newEvents = prevEvents.map(e => {
        if (e.id === id) {
          let updatedParticipants = [...e.participants];

          if (status === 'confirmed') {
            updatedParticipants = updatedParticipants.map(p => 
              p.id === user.id ? { ...p, status: 'joined' as ParticipantStatus } : p
            );
            newGlobalStatus = 'upcoming'; 
          } else if (status === 'cancelled') {
            updatedParticipants = updatedParticipants.map(p => 
              p.id === user.id ? { ...p, status: declinerStatus(e.hostId) } : p
            );
            
            function declinerStatus(hostId: string) {
              return user.id === hostId ? 'declined' : 'declined';
            }

            if (isHost) {
              newGlobalStatus = 'cancelled';
            }
          }
          return { ...e, status: newGlobalStatus, participants: updatedParticipants };
        }
        return e;
      });

      // If host cancels, notify all other participants
      if (isHost && status === 'cancelled') {
        const otherParticipants = eventToUpdate.participants.filter(p => p.id !== user.id);
        if (otherParticipants.length > 0) {
          const cancelNotifs: Notification[] = otherParticipants.map(p => ({
            id: `n_cancel_${Date.now()}_${p.id}`,
            title: 'Event Cancelled',
            desc: `"${eventToUpdate.title}" has been cancelled by ${user.name}`,
            type: 'cancel',
            unread: true,
            time: 'Just now',
            createdAt: Date.now(),
            senderId: user.id,
            targetUserId: p.id,
            eventId: id
          }));
          addNotifications(cancelNotifs);
        }
      }

      // Notify host if participant responded
      if (!isHost && (status === 'confirmed' || status === 'cancelled')) {
        const responseNotif: Notification = {
          id: `n_resp_${Date.now()}_${eventToUpdate.hostId}`,
          title: status === 'confirmed' ? 'New Participant' : 'Invitation Declined',
          desc: status === 'confirmed' 
            ? `${user.name} has joined your event "${eventToUpdate.title}"`
            : `${user.name} can't make it to "${eventToUpdate.title}"`,
          type: 'update',
          unread: true,
          time: 'Just now',
          createdAt: Date.now(),
          senderId: user.id,
          targetUserId: eventToUpdate.hostId,
          eventId: id
        };
        addNotifications([responseNotif]);
      }

      return newEvents;
    });
  };

  const markNotificationRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, unread: false } : n));
  };

  const handleNotificationAction = (id: string, action: 'accept' | 'decline') => {
    setNotifications(prev => {
      const notif = prev.find(n => n.id === id);
      if (notif && notif.eventId) {
        if (action === 'accept') {
          updateEventStatus(notif.eventId, 'confirmed');
        } else if (action === 'decline') {
          updateEventStatus(notif.eventId, 'cancelled');
        }
      }
      return prev.filter(n => n.id !== id);
    });
  };

  const checkIn = (eventId: string) => {
    const now = new Date();
    setEvents(prev => prev.map(e => {
      if (e.id === eventId) {
        const [hours, minutes] = e.time.split(':').map(Number);
        const eventStartTime = new Date();
        eventStartTime.setHours(hours, minutes, 0, 0);
        
        const diffInMinutes = (now.getTime() - eventStartTime.getTime()) / (1000 * 60);
        
        if (diffInMinutes <= 15) {
          const updatedParticipants = e.participants.map(p => 
            p.id === user.id ? { ...p, status: 'checked-in' as ParticipantStatus, checkInTime: now.getTime() } : p
          );
          return { ...e, participants: updatedParticipants };
        } else {
          return e;
        }
      }
      return e;
    }));
  };

  const updateEvent = (id: string, eventData: Partial<AppEvent>) => {
    setEvents(prevEvents => prevEvents.map(e => {
      if (e.id === id) {
        // Detect major changes: Date, Time, Location
        const isDateChanged = eventData.date && eventData.date !== e.date;
        const isTimeChanged = eventData.time && eventData.time !== e.time;
        const isLocationChanged = eventData.location && eventData.location !== e.location;
        const isMajorUpdate = isDateChanged || isTimeChanged || isLocationChanged;

        // Prepare updated participants
        let updatedParticipants = [...e.participants];
        
        if (eventData.participants) {
          // If participants were sent from Edit screen, merge them
          const newParticipantList = eventData.participants;
          
          updatedParticipants = newParticipantList.map(newP => {
            const existingP = e.participants.find(p => p.id === newP.id);
            if (existingP) {
              return { ...newP, status: existingP.status, role: existingP.role };
            }
            return { ...newP, status: 'pending' as ParticipantStatus };
          });

          // Ensure host is always in the list
          const hostInList = updatedParticipants.find(p => p.id === e.hostId);
          if (!hostInList) {
            const hostRecord = e.participants.find(p => p.id === e.hostId);
            if (hostRecord) {
              updatedParticipants.unshift(hostRecord);
            }
          }
        }

        // If major update, reset all non-host participants to pending
        if (isMajorUpdate) {
          updatedParticipants = updatedParticipants.map(p => 
            p.id === e.hostId ? p : { ...p, status: 'pending' as ParticipantStatus }
          );
        }

        const updatedEvent = { ...e, ...eventData, participants: updatedParticipants, isMajorUpdate: isMajorUpdate || e.isMajorUpdate };
        
        // Notify other participants (all except sender)
        const otherParticipants = updatedEvent.participants.filter(p => p.id !== user.id);
        if (otherParticipants.length > 0) {
          const newNotifications: Notification[] = otherParticipants.map(p => ({
            id: `n_update_${Date.now()}_${p.id}`,
            title: isMajorUpdate ? 'Event details updated — please confirm again' : 'Event details updated',
            desc: isMajorUpdate 
              ? `"${updatedEvent.title}" has major changes. Please re-confirm your attendance.`
              : `"${updatedEvent.title}" details have been changed.`,
            type: 'update' as const,
            unread: true,
            time: 'Just now',
            createdAt: Date.now(),
            eventId: id,
            senderId: user.id,
            targetUserId: p.id
          }));
          addNotifications(newNotifications);
        }
        
        return updatedEvent;
      }
      return e;
    }));
  };

  return (
    <AppContext.Provider value={{
      user,
      users: usersWithStats,
      events: userEvents,
      notifications: userNotifications,
      isAuthenticated,
      isSettingsOpen,
      login,
      logout,
      updateUser,
      addEvent,
      updateEventStatus,
      markNotificationRead,
      handleNotificationAction,
      checkIn,
      toggleSettings,
      updateEvent
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
