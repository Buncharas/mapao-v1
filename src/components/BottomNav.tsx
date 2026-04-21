import { Home, PlusCircle, Bell, User } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { cn } from '../lib/utils';

export function BottomNav() {
  const navItems = [
    { to: '/dashboard', icon: Home, label: 'Home' },
    { to: '/create', icon: PlusCircle, label: 'Create' },
    { to: '/alerts', icon: Bell, label: 'Alerts' },
    { to: '/profile', icon: User, label: 'Profile' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 flex justify-around items-end pb-8 px-4 bg-surface/80 backdrop-blur-xl border-t border-outline-variant/10 rounded-t-[2.5rem] shadow-tactile">
      {navItems.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          className={({ isActive }) =>
            cn(
              "flex flex-col items-center justify-center p-2 transition-all duration-300 ease-out",
              isActive 
                ? "bg-gradient-to-br from-primary to-primary-container text-white rounded-full p-4 shadow-active scale-110 -translate-y-4" 
                : "text-on-surface-variant hover:text-primary active:scale-90"
            )
          }
        >
          {({ isActive }) => (
            <>
              <item.icon className={cn("w-6 h-6", isActive ? "mb-0" : "mb-1")} />
              {!isActive && (
                <span className="font-label text-[10px] font-bold uppercase tracking-widest leading-none">
                  {item.label}
                </span>
              )}
            </>
          )}
        </NavLink>
      ))}
    </nav>
  );
}
