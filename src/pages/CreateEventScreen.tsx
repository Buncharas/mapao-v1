import { ArrowLeft, Settings, Sparkles, Calendar, Clock, MapPin, BookOpen, Users, Gamepad2, Plus, ArrowRight, MessageCircle, Phone, Briefcase, Utensils, Dumbbell, Plane, Star, Info, Check, Edit2, X, Search, PartyPopper, Coffee, Music, Code, Camera, Book, Flag, Heart, Trophy, Zap, Ghost, Moon, Sun } from 'lucide-react';
import { IMAGES } from '../constants';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { BottomNav } from '../components/BottomNav';
import { useState } from 'react';
import { cn, getAvatarColor, getInitials } from '../lib/utils';
import { useApp } from '../context/AppContext';
import { getEventIcon, CUSTOM_ICONS_LIST } from '../lib/iconMapping';
import { SettingsPanel } from '../components/SettingsPanel';

type EventType = 'work' | 'meal' | 'exercise' | 'travel' | 'custom' | 'study' | 'meeting' | 'social';
type Priority = 'Casual' | 'Important' | 'Very Important';

interface Participant {
  id: string;
  name: string;
  avatar?: string;
  type: 'LINE' | 'Phone';
}

export function CreateEventScreen() {
  const navigate = useNavigate();
  const { addEvent, user, isSettingsOpen, toggleSettings } = useApp();
  const colors = getAvatarColor(user.id, user.avatarColorIndex);
  const [currentStep, setCurrentStep] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [showParticipantSelector, setShowParticipantSelector] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    type: 'study' as EventType,
    customTypeName: '',
    customTypeIcon: 'PartyPopper',
    date: '',
    time: '',
    location: '',
    priority: 'Casual' as Priority,
    participants: [] as Participant[],
  });

  const [draftCustomTypeName, setDraftCustomTypeName] = useState(formData.customTypeName);
  const [draftCustomTypeIcon, setDraftCustomTypeIcon] = useState(formData.customTypeIcon);

  const nextStep = () => {
    if (currentStep === 1 && formData.type === 'custom' && !formData.customTypeName.trim()) {
      setError("Please enter a name for your custom event type.");
      return;
    }
    setError(null);
    setCurrentStep((prev) => Math.min(prev + 1, 4));
  };
  const prevStep = () => setCurrentStep((prev) => Math.max(prev - 1, 1));

  const handleSendInvite = () => {
    addEvent({
      title: formData.title || 'Untitled Event',
      type: formData.type,
      customTypeName: formData.customTypeName,
      customTypeIcon: formData.customTypeIcon,
      date: formData.date,
      time: formData.time,
      location: formData.location || 'No Location',
      priority: formData.priority,
    });
    navigate('/dashboard');
  };

  const favorites: Participant[] = [
    { id: '1', name: 'Emma Watson', avatar: IMAGES.AVATAR_EMMA, type: 'LINE' },
    { id: '2', name: 'Mike Ross', avatar: IMAGES.AVATAR_MIKE, type: 'Phone' },
  ];

  const recent: Participant[] = [
    { id: '3', name: 'Sarah J.', avatar: IMAGES.AVATAR_SARAH, type: 'LINE' },
    { id: '4', name: 'Alex T.', type: 'Phone' },
    { id: '5', name: 'James Wilson', type: 'LINE' },
    { id: '6', name: 'Olivia Brown', type: 'Phone' },
  ];

  const allContacts = [...favorites, ...recent];

  const toggleParticipant = (p: Participant) => {
    setFormData(prev => {
      const isSelected = prev.participants.find(u => u.id === p.id);
      if (isSelected) {
        return { ...prev, participants: prev.participants.filter(u => u.id !== p.id) };
      } else {
        return { ...prev, participants: [...prev.participants, p] };
      }
    });
  };

  const removeParticipant = (id: string) => {
    setFormData(prev => ({
      ...prev,
      participants: prev.participants.filter(p => p.id !== id)
    }));
  };

  const handleStepClick = (step: number) => {
    if (step < currentStep) setCurrentStep(step);
  };

  return (
    <div className="min-h-screen bg-surface pb-32">
      <header className="fixed top-0 w-full flex justify-between items-center px-6 py-4 bg-surface/80 backdrop-blur-xl z-50 border-b border-outline-variant/10 shadow-tactile">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => currentStep === 1 ? navigate(-1) : prevStep()}
            className="p-2 text-on-surface-variant hover:text-primary transition-colors"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <span className="text-2xl font-black text-primary tracking-tighter">MAPAO?</span>
        </div>
        <div className="flex items-center gap-4">
          <div className={cn(
            "w-10 h-10 rounded-full overflow-hidden border-2 border-primary-container flex items-center justify-center shadow-sm",
            colors.bg
          )}>
            <span className={cn("font-black text-xs", colors.text)}>
              {getInitials(user.name)}
            </span>
          </div>
          <button 
            onClick={toggleSettings}
            className={cn(
              "p-2 transition-all active:scale-90 duration-300 relative z-[60]",
              isSettingsOpen ? "text-primary bg-primary/10 rounded-full" : "text-on-surface-variant hover:text-primary"
            )}
          >
            <motion.div
              animate={{ rotate: isSettingsOpen ? 180 : 0 }}
              transition={{ type: "spring", damping: 15 }}
            >
              <Settings className={cn("w-6 h-6", isSettingsOpen && "fill-current")} />
            </motion.div>
          </button>
        </div>
      </header>

      <SettingsPanel />

      <main className="pt-28 px-6 max-w-3xl mx-auto flex flex-col gap-8">
        {/* Progress Indicator */}
        <div className="flex items-center justify-between relative px-2">
          <div className="absolute top-4 left-0 w-full h-1 bg-surface-container-high rounded-full -z-10" />
          <motion.div 
            initial={false}
            animate={{ width: `${(currentStep - 1) * 33.33}%` }}
            className="absolute top-4 left-0 h-1 bg-gradient-to-r from-primary to-primary-container rounded-full -z-10" 
          />
          
          <Step num={1} label="Details" active={currentStep >= 1} current={currentStep === 1} onClick={() => handleStepClick(1)} />
          <Step num={2} label="Setup" active={currentStep >= 2} current={currentStep === 2} onClick={() => handleStepClick(2)} />
          <Step num={3} label="Priority" active={currentStep >= 3} current={currentStep === 3} onClick={() => handleStepClick(3)} />
          <Step num={4} label="Review" active={currentStep >= 4} current={currentStep === 4} onClick={() => handleStepClick(4)} />
        </div>

        <AnimatePresence mode="wait">
          {currentStep === 1 && (
            <motion.div 
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex flex-col gap-8"
            >
              <section className="flex flex-col gap-2">
                <h2 className="text-4xl font-headline font-bold text-on-surface tracking-tight">Event Details</h2>
                <p className="text-on-surface-variant font-medium">Start with the basics of your gathering.</p>
              </section>

              <div className="bg-surface-container-low rounded-xl p-6 sm:p-8 flex flex-col gap-8 shadow-tactile">
                <div className="flex flex-col gap-3">
                  <label className="font-label text-sm font-bold uppercase tracking-widest text-on-surface">Event Title</label>
                  <input 
                    type="text" 
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g. Study Group: Advanced Calc"
                    className="w-full bg-surface-container-lowest border-none focus:ring-4 focus:ring-primary/10 rounded-2xl px-5 py-4 text-on-surface placeholder:text-outline transition-all outline-none shadow-sm"
                  />
                </div>

                <div className="flex flex-col gap-3">
                  <label className="font-label text-sm font-bold uppercase tracking-widest text-on-surface">Event Type</label>
                  <div className="flex flex-wrap gap-3">
                    <TypeChip 
                      icon={Briefcase} 
                      label="Work" 
                      active={formData.type === 'work'} 
                      onClick={() => setFormData({ ...formData, type: 'work' })} 
                    />
                    <TypeChip 
                      icon={Utensils} 
                      label="Meal" 
                      active={formData.type === 'meal'} 
                      onClick={() => setFormData({ ...formData, type: 'meal' })} 
                    />
                    <TypeChip 
                      icon={Dumbbell} 
                      label="Exercise" 
                      active={formData.type === 'exercise'} 
                      onClick={() => setFormData({ ...formData, type: 'exercise' })} 
                    />
                    <TypeChip 
                      icon={Plane} 
                      label="Travel" 
                      active={formData.type === 'travel'} 
                      onClick={() => setFormData({ ...formData, type: 'travel' })} 
                    />
                    <TypeChip 
                      icon={getEventIcon('custom', formData.customTypeName ? formData.customTypeIcon : undefined)} 
                      label={formData.customTypeName || "Custom"} 
                      active={formData.type === 'custom'} 
                      onClick={() => {
                        setFormData({ ...formData, type: 'custom' });
                        setDraftCustomTypeName(formData.customTypeName);
                        setDraftCustomTypeIcon(formData.customTypeIcon);
                      }} 
                    />
                  </div>
                </div>

                <AnimatePresence>
                  {formData.type === 'custom' && (
                    <motion.div 
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="bg-surface-container-highest/20 rounded-2xl p-6 border border-primary/10 space-y-6">
                        <div className="flex flex-col gap-3">
                          <label className="font-label text-[10px] font-bold uppercase tracking-widest text-primary">Custom Type Name</label>
                          <input 
                            type="text" 
                            value={draftCustomTypeName}
                            onChange={(e) => setDraftCustomTypeName(e.target.value)}
                            placeholder="Enter event type name"
                            className="bg-surface-container-lowest border-none focus:ring-4 focus:ring-primary/10 rounded-xl px-4 py-3 text-sm text-on-surface placeholder:text-outline transition-all outline-none"
                          />
                        </div>
                        <div className="flex flex-col gap-3">
                          <label className="font-label text-[10px] font-bold uppercase tracking-widest text-primary">Select Icon</label>
                          <div className="grid grid-cols-8 gap-2">
                            {CUSTOM_ICONS_LIST.map((i) => {
                              const Icon = i.icon;
                              const isActive = draftCustomTypeIcon === i.name;
                              return (
                                <button
                                  key={i.name}
                                  onClick={() => setDraftCustomTypeIcon(i.name)}
                                  className={cn(
                                    "p-2 rounded-lg flex items-center justify-center transition-all",
                                    isActive ? "bg-primary text-on-primary shadow-active scale-110" : "bg-surface-container-low text-on-surface hover:bg-surface-container-high"
                                  )}
                                >
                                  <Icon className="w-5 h-5" />
                                </button>
                              );
                            })}
                          </div>
                        </div>
                        <div className="flex gap-3 pt-2">
                          <button 
                            onClick={() => {
                              setFormData({ 
                                ...formData, 
                                customTypeName: draftCustomTypeName,
                                customTypeIcon: draftCustomTypeIcon
                              });
                            }}
                            className="flex-1 bg-primary text-on-primary py-3 rounded-xl font-bold text-sm shadow-sm active:scale-95 transition-all"
                          >
                            Save Changes
                          </button>
                          <button 
                            onClick={() => {
                              setDraftCustomTypeName(formData.customTypeName);
                              setDraftCustomTypeIcon(formData.customTypeIcon);
                              // We could potentially deselect custom type if it was empty, 
                              // but sticking to instructions: "Cancel / Close: Discard draft changes, Keep previous saved state, Do NOT update UI"
                            }}
                            className="flex-1 bg-surface-container-high text-on-surface py-3 rounded-xl font-bold text-sm active:scale-95 transition-all"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {error && currentStep === 1 && (
                  <motion.div 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-2 p-4 bg-error-container text-on-error-container rounded-2xl border border-error/20"
                  >
                    <Info className="w-4 h-4" />
                    <p className="text-xs font-bold">{error}</p>
                  </motion.div>
                )}

                <div className="flex flex-col gap-3">
                  <div className="flex justify-between items-center">
                    <label className="font-label text-sm font-bold uppercase tracking-widest text-on-surface">Participants</label>
                    <button 
                      onClick={() => setShowParticipantSelector(true)}
                      className="bg-primary/10 text-primary p-2 rounded-full hover:bg-primary/20 transition-colors shadow-sm active:scale-90"
                    >
                      <Plus className="w-5 h-5" />
                    </button>
                  </div>
                  
                  <div className="flex flex-wrap gap-4 min-h-[80px] p-4 bg-surface-container-lowest rounded-2xl border border-outline-variant/10 shadow-inner">
                    {formData.participants.length > 0 ? (
                      formData.participants.map((p) => (
                        <div key={p.id} className="relative group">
                          <ParticipantCircle p={p} />
                          <button 
                            onClick={() => removeParticipant(p.id)}
                            className="absolute -top-1 -right-1 bg-error-container text-on-error-container p-1 rounded-full shadow-active scale-0 group-hover:scale-100 transition-transform"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))
                    ) : (
                      <div className="w-full flex flex-col items-center justify-center py-4 border-2 border-dashed border-outline-variant/30 rounded-xl">
                        <Users className="w-8 h-8 text-outline mb-2 opacity-30" />
                        <span className="text-xs font-bold text-outline uppercase tracking-widest opacity-50">No participants added yet</span>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-4 mt-2">
                    <button 
                      onClick={() => setShowParticipantSelector(true)}
                      className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-br from-primary to-primary-container text-white p-4 rounded-2xl shadow-sm text-sm font-bold active:scale-95 transition-transform"
                    >
                      <MessageCircle className="w-5 h-5 fill-current" /> LINE
                    </button>
                    <button 
                      onClick={() => setShowParticipantSelector(true)}
                      className="flex-1 flex items-center justify-center gap-2 bg-surface-container-highest text-primary p-4 rounded-2xl shadow-sm text-sm font-bold active:scale-95 transition-transform"
                    >
                      <Phone className="w-5 h-5" /> Phone
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {currentStep === 2 && (
            <motion.div 
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex flex-col gap-8"
            >
              <section className="flex flex-col gap-2">
                <h2 className="text-4xl font-headline font-bold text-on-surface tracking-tight">Event Details</h2>
                <p className="text-on-surface-variant font-medium">Let's lock in the specifics for your gathering.</p>
              </section>

              {/* Exact copy of original Step 2 UI */}
              <div className="bg-surface-container-low rounded-xl p-6 sm:p-8 flex flex-col gap-8 shadow-tactile">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex flex-col gap-3">
                    <label className="font-label text-sm font-bold uppercase tracking-widest text-on-surface">Date</label>
                    <div className="relative">
                      <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-outline" />
                      <input 
                        type="date" 
                        value={formData.date}
                        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                        className="w-full bg-surface-container-lowest border-none focus:ring-4 focus:ring-primary/10 rounded-2xl pl-12 pr-5 py-4 text-on-surface outline-none shadow-sm"
                      />
                    </div>
                  </div>
                  <div className="flex flex-col gap-3">
                    <label className="font-label text-sm font-bold uppercase tracking-widest text-on-surface">Time</label>
                    <div className="relative">
                      <Clock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-outline" />
                      <input 
                        type="time" 
                        value={formData.time}
                        onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                        className="w-full bg-surface-container-lowest border-none focus:ring-4 focus:ring-primary/10 rounded-2xl pl-12 pr-5 py-4 text-on-surface outline-none shadow-sm"
                      />
                    </div>
                  </div>
                </div>

                <div className="bg-surface-container-lowest rounded-2xl p-5 flex flex-col sm:flex-row items-center gap-4 justify-between border border-outline-variant/15 shadow-tactile relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-primary-container/20 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
                  <div className="flex items-center gap-4 z-10">
                    <div className="w-10 h-10 rounded-full bg-secondary-container flex items-center justify-center shrink-0">
                      <Sparkles className="w-5 h-5 text-on-secondary-container fill-current" />
                    </div>
                    <div>
                      <h4 className="font-bold text-on-surface">Smart Schedule</h4>
                      <p className="text-sm text-on-surface-variant font-medium">Find the earliest time everyone is free.</p>
                    </div>
                  </div>
                  <button className="bg-secondary-container text-on-secondary-container font-bold px-6 py-3 rounded-full text-sm hover:opacity-90 transition-opacity whitespace-nowrap w-full sm:w-auto z-10">
                    Auto-fill Time
                  </button>
                </div>

                <div className="flex flex-col gap-3">
                  <label className="font-label text-sm font-bold uppercase tracking-widest text-on-surface">Location</label>
                  <div className="relative">
                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-outline" />
                    <input 
                      type="text" 
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      placeholder="Search campus map or enter address..."
                      className="w-full bg-surface-container-lowest border-none focus:ring-4 focus:ring-primary/10 rounded-2xl pl-12 pr-5 py-4 text-on-surface placeholder:text-outline outline-none shadow-sm"
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {currentStep === 3 && (
            <motion.div 
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex flex-col gap-8"
            >
              <section className="flex flex-col gap-2">
                <h2 className="text-4xl font-headline font-bold text-on-surface tracking-tight">Priority</h2>
                <p className="text-on-surface-variant font-medium">How critical is this event for the group?</p>
              </section>

              <div className="grid grid-cols-1 gap-4">
                <PriorityCard 
                  title="Casual" 
                  desc="Low-stakes hangouts or optional meetups."
                  icon={Clock}
                  active={formData.priority === 'Casual'}
                  onClick={() => setFormData({ ...formData, priority: 'Casual' })}
                />
                <PriorityCard 
                  title="Important" 
                  desc="Key milestones or regular team alignment."
                  icon={Star}
                  active={formData.priority === 'Important'}
                  onClick={() => setFormData({ ...formData, priority: 'Important' })}
                  color="secondary"
                />
                <PriorityCard 
                  title="Very Important" 
                  desc="Critical deadlines or high-impact sessions."
                  icon={Info}
                  active={formData.priority === 'Very Important'}
                  onClick={() => setFormData({ ...formData, priority: 'Very Important' })}
                  color="error"
                />
              </div>
            </motion.div>
          )}

          {currentStep === 4 && (
            <motion.div 
              key="step4"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex flex-col gap-8"
            >
              <section className="flex flex-col gap-2">
                <h2 className="text-4xl font-headline font-bold text-on-surface tracking-tight">Review</h2>
                <p className="text-on-surface-variant font-medium">One last double-check before we send.</p>
              </section>

              <div className="space-y-4">
                <ReviewSection 
                  title="General" 
                  onEdit={() => setCurrentStep(1)}
                  items={[
                    { label: 'Title', value: formData.title || 'Untitled Event' },
                    { 
                      label: 'Type', 
                      value: formData.type === 'custom' && formData.customTypeName 
                        ? formData.customTypeName 
                        : formData.type.charAt(0).toUpperCase() + formData.type.slice(1) 
                    },
                    { label: 'Participants', value: formData.participants.length > 0 ? formData.participants.map(p => p.name).join(', ') : 'None added' },
                  ]}
                />
                <ReviewSection 
                  title="Setup" 
                  onEdit={() => setCurrentStep(2)}
                  items={[
                    { label: 'Date', value: formData.date || 'TBD' },
                    { label: 'Time', value: formData.time || 'TBD' },
                    { label: 'Location', value: formData.location || 'TBD' },
                  ]}
                />
                <ReviewSection 
                  title="Priority" 
                  onEdit={() => setCurrentStep(3)}
                  items={[
                    { label: 'Level', value: formData.priority },
                  ]}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex gap-4 justify-between mt-4">
          {currentStep > 1 && (
            <button 
              onClick={prevStep}
              className="px-8 py-4 rounded-full text-primary font-bold text-sm hover:bg-surface-container-low transition-colors"
            >
              Back
            </button>
          )}
          
          <button 
            onClick={() => currentStep === 4 ? handleSendInvite() : nextStep()}
            className={cn(
              "bg-gradient-to-br from-primary to-primary-container text-on-primary px-10 py-4 rounded-full font-bold text-sm shadow-active hover:opacity-90 transition-all flex items-center gap-2 active:scale-95",
              currentStep === 1 && "ml-auto"
            )}
          >
            {currentStep === 4 ? 'Send Invite' : 'Continue'} <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </main>

      <AnimatePresence>
        {showParticipantSelector && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowParticipantSelector(false)}
              className="fixed inset-0 bg-on-surface/40 backdrop-blur-sm z-[60]"
            />
            <motion.div 
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed bottom-0 left-0 w-full h-[85vh] bg-surface rounded-t-[3rem] z-[70] shadow-2xl flex flex-col overflow-hidden border-t-2 border-primary/5"
            >
              <div className="p-6 flex flex-col gap-6">
                <div className="flex justify-between items-center px-2">
                  <h3 className="text-2xl font-headline font-bold text-primary">Add Participants</h3>
                  <button 
                    onClick={() => setShowParticipantSelector(false)}
                    className="p-3 bg-surface-container-high rounded-full text-on-surface-variant active:scale-90 transition-transform"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="relative group">
                  <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-outline group-focus-within:text-primary transition-colors" />
                  <input 
                    type="text" 
                    placeholder="Search LINE or Contacts..."
                    className="w-full bg-surface-container-low border-none focus:ring-4 focus:ring-primary/10 rounded-3xl py-5 pl-14 pr-6 text-on-surface placeholder:text-outline outline-none transition-all shadow-tactile"
                  />
                </div>
              </div>

              <div className="flex-1 overflow-y-auto px-6 pb-24 space-y-8 no-scrollbar">
                <section>
                  <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest block mb-4 px-2">Favorites</span>
                  <div className="grid grid-cols-1 gap-3">
                    {favorites.map(p => (
                      <ContactRow 
                        key={p.id} 
                        p={p} 
                        isSelected={!!formData.participants.find(u => u.id === p.id)}
                        onClick={() => toggleParticipant(p)}
                      />
                    ))}
                  </div>
                </section>

                <section>
                  <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest block mb-4 px-2">Recent</span>
                  <div className="grid grid-cols-1 gap-3">
                    {recent.map(p => (
                      <ContactRow 
                        key={p.id} 
                        p={p} 
                        isSelected={!!formData.participants.find(u => u.id === p.id)}
                        onClick={() => toggleParticipant(p)}
                      />
                    ))}
                  </div>
                </section>
              </div>

              <div className="absolute bottom-0 w-full p-6 bg-surface/80 backdrop-blur-xl border-t border-outline-variant/10">
                <button 
                  onClick={() => setShowParticipantSelector(false)}
                  className="w-full bg-gradient-to-br from-primary to-primary-container text-on-primary py-5 rounded-3xl font-headline font-bold shadow-active active:scale-95 transition-all"
                >
                  Confirm Selection ({formData.participants.length})
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <BottomNav />
    </div>
  );
}

function Step({ num, label, active, current, onClick }: any) {
  return (
    <button onClick={onClick} className="flex flex-col items-center gap-2 group">
      <div className={cn(
        "w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm shadow-sm transition-all relative overflow-hidden",
        active || current ? "bg-primary text-on-primary" : "bg-surface-container-highest text-on-surface-variant",
        current ? "scale-125 ring-4 ring-primary/20" : "hover:scale-110"
      )}>
        {active && !current && num < 4 ? <Check className="w-4 h-4" /> : num}
      </div>
      <span className={cn(
        "text-[10px] font-bold uppercase tracking-widest transition-colors",
        active || current ? "text-primary" : "text-on-surface-variant",
        current ? "opacity-100" : "opacity-70 group-hover:opacity-100"
      )}>
        {label}
      </span>
    </button>
  );
}

function TypeChip({ icon: Icon, label, active, onClick }: any) {
  return (
    <button 
      onClick={onClick}
      className={`px-5 py-2.5 rounded-full text-sm font-bold flex items-center gap-2 transition-all shadow-sm ${
        active ? "bg-primary text-on-primary" : "bg-surface-container-high text-on-surface hover:bg-surface-variant"
      }`}
    >
      <Icon className="w-4 h-4" />
      {label}
    </button>
  );
}

function ParticipantCircle({ p }: any) {
  const pColors = getAvatarColor(p.id);
  return (
    <div className="flex flex-col items-center gap-2 shrink-0">
      <div className={cn(
        "w-14 h-14 rounded-full overflow-hidden border-2 border-primary-container shadow-sm p-0.5 flex items-center justify-center",
        pColors.bg
      )}>
        <span className={cn("font-black text-xs uppercase", pColors.text)}>
          {getInitials(p.name)}
        </span>
      </div>
      <span className="text-[10px] font-bold text-on-surface truncate w-14 text-center">{p.name}</span>
    </div>
  );
}

function ContactRow({ p, isSelected, onClick }: any) {
  const pColors = getAvatarColor(p.id);
  return (
    <button 
      onClick={onClick}
      className={cn(
        "w-full flex items-center justify-between p-4 rounded-3xl transition-all active:scale-[0.98]",
        isSelected ? "bg-primary/10 border-2 border-primary/20 shadow-inner" : "bg-surface-container-low border-2 border-transparent hover:border-outline-variant/30 shadow-tactile"
      )}
    >
      <div className="flex items-center gap-4">
        <div className={cn(
          "w-14 h-14 rounded-full overflow-hidden border-2 border-primary-container p-0.5 relative flex items-center justify-center",
          pColors.bg
        )}>
          <span className={cn("font-black text-xs uppercase", pColors.text)}>
            {getInitials(p.name)}
          </span>
          <div className="absolute -bottom-1 -right-1 bg-white p-1 rounded-full shadow-sm border border-outline-variant/10">
            {p.type === 'LINE' ? <MessageCircle className="w-3 h-3 text-[#06C755] fill-current" /> : <Phone className="w-3 h-3 text-primary" />}
          </div>
        </div>
        <div className="text-left">
          <h5 className="font-bold text-on-surface">{p.name}</h5>
          <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">{p.type} Contact</span>
        </div>
      </div>
      <div className={cn(
        "w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all",
        isSelected ? "bg-primary border-primary text-white scale-110 shadow-active" : "border-outline-variant text-transparent"
      )}>
        <Check className="w-5 h-5 stroke-[3]" />
      </div>
    </button>
  );
}

function PriorityCard({ title, desc, icon: Icon, active, onClick, color }: any) {
  const colorBorders = {
    primary: "border-primary/20",
    secondary: "border-secondary/20",
    error: "border-error/20",
  };
  const activeColors = {
    primary: "bg-primary text-on-primary",
    secondary: "bg-secondary-container text-on-secondary-container",
    error: "bg-error-container text-on-error-container",
  };
  
  const c = color || 'primary';

  return (
    <button 
      onClick={onClick}
      className={cn(
        "p-6 rounded-3xl flex items-center gap-6 text-left transition-all border-2",
        active ? `${activeColors[c as keyof typeof activeColors]} border-transparent shadow-active` : `bg-surface-container-low border-transparent hover:border-outline-variant/30`
      )}
    >
      <div className={cn(
        "w-12 h-12 rounded-2xl flex items-center justify-center shrink-0",
        active ? "bg-white/20" : "bg-surface-container-lowest text-primary"
      )}>
        <Icon className="w-6 h-6" />
      </div>
      <div>
        <h4 className="font-bold text-lg">{title}</h4>
        <p className={cn("text-xs font-medium leading-relaxed opacity-80")}>{desc}</p>
      </div>
    </button>
  );
}

function ReviewSection({ title, items, onEdit }: any) {
  return (
    <div className="bg-surface-container-low rounded-3xl p-6 shadow-tactile relative overflow-hidden">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-headline font-bold text-primary uppercase tracking-widest text-[10px]">{title}</h3>
        <button onClick={onEdit} className="p-2 hover:bg-surface-container-high rounded-full transition-colors text-primary">
          <Edit2 className="w-4 h-4" />
        </button>
      </div>
      <div className="space-y-3">
        {items.map((item: any) => (
          <div key={item.label} className="flex justify-between items-baseline gap-4">
            <span className="text-xs font-bold text-on-surface-variant uppercase tracking-widest shrink-0">{item.label}</span>
            <span className="text-sm font-bold text-on-surface text-right">{item.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
