import React, { createContext, useContext, useState, ReactNode } from 'react';
import { IMAGES } from '../constants';

export type EventType = 'work' | 'meal' | 'exercise' | 'travel' | 'custom' | 'study' | 'meeting' | 'social' | 'Lecture';
export type Priority = 'Casual' | 'Important' | 'Very Important';
export type EventStatus = 'upcoming' | 'pending' | 'cancelled' | 'confirmed';
export type ParticipantStatus = 'pending' | 'joined' | 'late' | 'checked-in';

export interface Participant {
  id: string;
  name: string;
  avatar?: string;
  status: ParticipantStatus;
  role?: 'Host' | 'Participant';
  lateTime?: string;
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
}

export interface Notification {
  id: string;
  title: string;
  desc: string;
  type: 'invite' | 'update' | 'cancel' | 'reminder';
  unread: boolean;
  time: string;
  actions?: boolean;
  senderId?: string;
  eventId?: string;
}

interface AppContextType {
  user: {
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
  };
  events: AppEvent[];
  notifications: Notification[];
  isAuthenticated: boolean;
  isSettingsOpen: boolean;
  login: () => void;
  logout: () => void;
  updateUser: (data: Partial<AppContextType['user']>) => void;
  addEvent: (event: Omit<AppEvent, 'id' | 'status' | 'participants' | 'hostId'>) => void;
  updateEventStatus: (id: string, status: EventStatus) => void;
  markNotificationRead: (id: string) => void;
  handleNotificationAction: (id: string, action: 'accept' | 'decline') => void;
  checkIn: (eventId: string) => void;
  toggleSettings: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem('mapao_auth') === 'true';
  });

  const [user, setUser] = useState({
    id: 'user_1',
    name: 'P. Buncharas',
    avatar: IMAGES.AVATAR_PROFILE_HERO,
    role: 'Urban Explorer & Coffee Enthusiast',
    campus: 'Campus North',
    year: 'Junior Year',
    reliability: 92,
    appointments: 48,
    onTime: 45,
    avatarColorIndex: 0,
    bannerGradientIndex: 0,
  });

  const updateUser = (data: Partial<typeof user>) => {
    setUser(prev => ({ ...prev, ...data }));
  };

  const login = () => {
    localStorage.setItem('mapao_auth', 'true');
    setIsAuthenticated(true);
  };

  const logout = () => {
    localStorage.removeItem('mapao_auth');
    setIsAuthenticated(false);
  };

  const [events, setEvents] = useState<AppEvent[]>([
    {
      id: 'e1',
      title: 'Advanced Mechanics',
      type: 'Lecture',
      date: '2026-04-24',
      time: '10:00 AM',
      location: 'Hall B',
      priority: 'Very Important',
      status: 'upcoming',
      hostId: 'system',
      participants: [
        { id: user.id, name: user.name, avatar: user.avatar, status: 'joined' }
      ]
    },
    {
      id: 'e2',
      title: 'Coffee with Emma',
      type: 'Meal',
      date: '2026-04-24',
      time: '1:15 PM',
      location: 'Campus Cafe',
      priority: 'Casual',
      status: 'upcoming',
      hostId: 'emma_1',
      participants: [
        { id: 'emma_1', name: 'Emma', avatar: IMAGES.AVATAR_EMMA, status: 'joined' },
        { id: user.id, name: user.name, avatar: user.avatar, status: 'joined' }
      ]
    },
    {
      id: 'e3',
      title: 'Library Shift',
      type: 'Work',
      date: '2026-04-24',
      time: '4:00 PM',
      location: 'Main Lib',
      priority: 'Important',
      status: 'upcoming',
      hostId: 'system',
      participants: [
        { id: user.id, name: user.name, avatar: user.avatar, status: 'joined' }
      ]
    },
    {
      id: 'e4',
      title: 'Advanced Calc Cram Session',
      type: 'Study Group',
      date: '2026-04-25',
      time: '3:00 PM - 5:00 PM',
      location: 'Library, Room 402',
      priority: 'Important',
      status: 'pending',
      hostId: 'sarah_1',
      participants: [
        { id: 'sarah_1', name: 'Sarah Jenkins', avatar: IMAGES.AVATAR_SARAH, status: 'joined', role: 'Host' },
        { id: 'mike_1', name: 'Mike Ross', avatar: IMAGES.AVATAR_MIKE, status: 'checked-in' },
        { id: 'amanda_1', name: 'Amanda Lee', status: 'late', lateTime: '> 15m' }
      ]
    }
  ]);

  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: 'n1',
      title: 'Study Group Invite',
      desc: 'Sarah invited you to join "Advanced Calc Cram Session" tomorrow at 6 PM.',
      type: 'invite',
      unread: true,
      time: '10m ago',
      actions: true,
      senderId: 'sarah_1',
      eventId: 'e4'
    },
    {
      id: 'n2',
      title: 'Assignment Due',
      desc: "Your Physics Lab Report is due in exactly 2 hours. Don't forget to submit via the portal.",
      type: 'reminder',
      unread: true,
      time: 'Just Now',
      senderId: 'system'
    },
    {
      id: 'n3',
      title: 'Room Change',
      desc: 'Intro to Psychology has been moved from Room 302 to Lecture Hall B.',
      type: 'update',
      unread: true,
      time: '1 hour ago',
      senderId: 'system'
    },
    {
      id: 'n4',
      title: 'Class Cancelled',
      desc: "Professor Davis has cancelled today's office hours. Rescheduling info to follow.",
      type: 'cancel',
      unread: false,
      time: 'Yesterday',
      senderId: 'system'
    }
  ]);

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const toggleSettings = () => setIsSettingsOpen(prev => !prev);

  const addEvent = (eventData: Omit<AppEvent, 'id' | 'status' | 'participants' | 'hostId'>) => {
    const newEvent: AppEvent = {
      ...eventData,
      id: `e${events.length + 1}`,
      status: 'upcoming',
      hostId: user.id,
      participants: [{ id: user.id, name: user.name, avatar: user.avatar, status: 'joined', role: 'Host' }]
    };
    setEvents([...events, newEvent]);
  };

  const updateEventStatus = (id: string, status: EventStatus) => {
    setEvents(events.map(e => {
      if (e.id === id) {
        let updatedParticipants = [...e.participants];
        if (status === 'confirmed') {
          const userInParticipants = updatedParticipants.find(p => p.id === user.id);
          if (userInParticipants) {
            updatedParticipants = updatedParticipants.map(p => 
              p.id === user.id ? { ...p, status: 'joined' as ParticipantStatus } : p
            );
          } else {
            updatedParticipants.push({ 
              id: user.id, 
              name: user.name, 
              avatar: user.avatar, 
              status: 'joined' as ParticipantStatus 
            });
          }
        }
        return { ...e, status, participants: updatedParticipants };
      }
      return e;
    }));
  };

  const markNotificationRead = (id: string) => {
    setNotifications(notifications.map(n => n.id === id ? { ...n, unread: false } : n));
  };

  const handleNotificationAction = (id: string, action: 'accept' | 'decline') => {
    const notif = notifications.find(n => n.id === id);
    if (notif && action === 'accept' && notif.eventId) {
      updateEventStatus(notif.eventId, 'confirmed');
    }
    setNotifications(notifications.filter(n => n.id !== id));
  };

  const checkIn = (eventId: string) => {
    setEvents(events.map(e => {
      if (e.id === eventId) {
        const updatedParticipants = e.participants.map(p => 
          p.id === user.id ? { ...p, status: 'checked-in' as ParticipantStatus } : p
        );
        return { ...e, participants: updatedParticipants };
      }
      return e;
    }));
  };

  return (
    <AppContext.Provider value={{
      user,
      events,
      notifications,
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
      toggleSettings
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
