import { 
  Briefcase, Utensils, Dumbbell, Plane, Plus, BookOpen, 
  PartyPopper, Coffee, Music, Code, Camera, Book, 
  Flag, Heart, Trophy, Zap, Ghost, Moon, Sun, 
  Calendar, Clock, MapPin, Users, Gamepad2, Star, Info,
  Search, MessageCircle, Phone, RefreshCcw, XCircle, ChevronRight,
  Bell, Settings, UserCheck, AlertCircle, Loader2, ArrowLeft,
  Share2, MoreHorizontal, CheckCircle2, Bookmark, Home, BarChart3, Mail
} from 'lucide-react';

export const EVENT_ICONS = {
  work: Briefcase,
  meal: Utensils,
  exercise: Dumbbell,
  travel: Plane,
  study: BookOpen,
  custom: Plus,
  social: Users,
  meeting: Users,
  Lecture: BookOpen,
};

export const CUSTOM_ICONS_LIST = [
  { name: 'PartyPopper', icon: PartyPopper },
  { name: 'Coffee', icon: Coffee },
  { name: 'Music', icon: Music },
  { name: 'Code', icon: Code },
  { name: 'Camera', icon: Camera },
  { name: 'Book', icon: Book },
  { name: 'Flag', icon: Flag },
  { name: 'Heart', icon: Heart },
  { name: 'Trophy', icon: Trophy },
  { name: 'Zap', icon: Zap },
  { name: 'Ghost', icon: Ghost },
  { name: 'Moon', icon: Moon },
  { name: 'Sun', icon: Sun },
];

export function getEventIcon(type: string, customIconName?: string) {
  if (type === 'custom' && customIconName) {
    const custom = CUSTOM_ICONS_LIST.find(i => i.name === customIconName);
    if (custom) return custom.icon;
  }
  
  const standard = (EVENT_ICONS as any)[type];
  if (standard) return standard;
  
  return Plus;
}
