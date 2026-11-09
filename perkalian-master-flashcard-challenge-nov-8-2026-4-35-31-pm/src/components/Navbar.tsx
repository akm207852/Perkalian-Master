import React from 'react';
import { 
  Home, 
  BookOpen, 
  PenTool, 
  Zap, 
  BarChart3, 
  User, 
  Volume2, 
  VolumeX, 
  Sparkles,
  Award
} from 'lucide-react';
import { ActiveView, StudentProfile } from '../types/math';
import { AVATAR_OPTIONS } from '../utils/storage';

interface NavbarProps {
  currentView: ActiveView;
  onNavigate: (view: ActiveView) => void;
  profile: StudentProfile;
  onToggleSound: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  onNavigate,
  profile,
  onToggleSound,
}) => {
  const currentAvatar = AVATAR_OPTIONS.find((a) => a.id === profile.avatar) || AVATAR_OPTIONS[0];

  const navItems = [
    { view: 'home' as ActiveView, label: 'Beranda', icon: Home },
    { view: 'levels' as ActiveView, label: 'Belajar', icon: BookOpen },
    { view: 'practice' as ActiveView, label: 'Latihan', icon: PenTool },
    { view: 'challenge' as ActiveView, label: 'Tantangan', icon: Zap },
    { view: 'progress' as ActiveView, label: 'Progres', icon: BarChart3 },
    { view: 'profile' as ActiveView, label: 'Profil', icon: User },
  ];

  return (
    <>
      {/* Top Bar for Desktop and Tablet */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          
          {/* Brand Logo & Name */}
          <button 
            onClick={() => onNavigate('home')}
            className="flex items-center gap-3 text-left focus-visible:outline-hidden group cursor-pointer"
          >
            <div className="w-10 h-10 rounded-xl bg-linear-to-tr from-blue-600 via-indigo-600 to-amber-500 p-0.5 shadow-sm group-hover:scale-105 transition-transform">
              <div className="w-full h-full bg-blue-600 rounded-[10px] flex items-center justify-center text-white font-black text-lg">
                ×
              </div>
            </div>
            <div className="leading-tight">
              <span className="font-display font-extrabold text-lg tracking-tight bg-linear-to-r from-blue-700 via-indigo-700 to-amber-600 bg-clip-text text-transparent">
                PERKALIAN MASTER
              </span>
              <p className="text-[11px] font-medium text-slate-500 hidden sm:block">
                Flashcard Challenge SD
              </p>
            </div>
          </button>

          {/* Nav Links for Desktop */}
          <nav className="hidden md:flex items-center gap-1 lg:gap-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = 
                currentView === item.view || 
                (item.view === 'levels' && (currentView === 'groups' || currentView === 'flashcard' || currentView === 'levelTest'));
              return (
                <button
                  key={item.view}
                  onClick={() => onNavigate(item.view)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-semibold transition-all cursor-pointer whitespace-nowrap ${
                    isActive
                      ? 'bg-blue-50 text-blue-700 shadow-xs ring-1 ring-blue-200'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-blue-600' : 'text-slate-500'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Right Action & Profile Area */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Stars counter */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 border border-amber-200/80 rounded-xl text-amber-800 font-bold text-xs sm:text-sm shadow-xs">
              <Sparkles className="w-4 h-4 text-amber-500 fill-amber-400" />
              <span className="tabular-nums">{profile.stars}</span>
              <span className="text-[11px] font-medium text-amber-700 hidden sm:inline">Bintang</span>
            </div>

            {/* Sound Toggle */}
            <button
              onClick={onToggleSound}
              title={profile.settings.soundEnabled ? 'Matikan Suara' : 'Nyalakan Suara'}
              className="p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer border border-slate-200"
              aria-label="Toggle Sound"
            >
              {profile.settings.soundEnabled ? (
                <Volume2 className="w-4 h-4 text-blue-600" />
              ) : (
                <VolumeX className="w-4 h-4 text-slate-400" />
              )}
            </button>

            {/* Profile Avatar Button */}
            <button
              onClick={() => onNavigate('profile')}
              className="flex items-center gap-2 pl-2 pr-3 py-1 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all cursor-pointer border border-slate-200/70"
            >
              <span className="text-xl leading-none" role="img" aria-label={currentAvatar.name}>
                {currentAvatar.emoji}
              </span>
              <span className="text-xs font-bold text-slate-800 max-w-[80px] sm:max-w-[120px] truncate">
                {profile.name}
              </span>
            </button>
          </div>

        </div>
      </header>

      {/* Bottom Navigation for Mobile Devices */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-lg border-t border-slate-200 shadow-lg px-2 py-1.5 safe-area-bottom">
        <div className="grid grid-cols-6 gap-1 max-w-md mx-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = 
              currentView === item.view || 
              (item.view === 'levels' && (currentView === 'groups' || currentView === 'flashcard' || currentView === 'levelTest'));
            return (
              <button
                key={item.view}
                onClick={() => onNavigate(item.view)}
                className={`flex flex-col items-center justify-center py-1 px-0.5 rounded-lg transition-colors cursor-pointer ${
                  isActive 
                    ? 'text-blue-600 font-bold' 
                    : 'text-slate-500 hover:text-slate-800 font-medium'
                }`}
              >
                <div className={`p-1 rounded-lg ${isActive ? 'bg-blue-100 text-blue-700' : ''}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <span className="text-[10px] mt-0.5 tracking-tight truncate w-full text-center">
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </nav>
    </>
  );
};
