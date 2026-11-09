import React from 'react';
import { Sparkles, MessageCircle } from 'lucide-react';

interface MascotMessageProps {
  quote?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  badge?: string;
}

export const MascotMessage: React.FC<MascotMessageProps> = ({
  quote = 'Sedikit demi sedikit, perkalian jadi mudah!',
  size = 'md',
  className = '',
  badge = 'Tips Kiko',
}) => {
  return (
    <div className={`flex items-center gap-3 sm:gap-4 p-3 sm:p-4 bg-linear-to-r from-blue-50/90 via-indigo-50/90 to-amber-50/80 rounded-2xl border border-blue-200/80 shadow-xs ${className}`}>
      
      {/* Mascot Image with fallback */}
      <div className="relative shrink-0">
        <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl overflow-hidden border-2 border-white shadow-md bg-blue-100 flex items-center justify-center">
          <img
            src="/src/assets/images/mascot_kiko_robot_1794129987412.jpg"
            alt="Mascot Kiko si Robot Matematika"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover"
            onError={(e) => {
              // Graceful fallback to mascot emoji if image fails
              (e.currentTarget as HTMLElement).style.display = 'none';
            }}
          />
          <span className="text-3xl select-none" aria-hidden="true">🤖</span>
        </div>
        <div className="absolute -bottom-1 -right-1 bg-amber-400 text-amber-950 p-1 rounded-full shadow-xs">
          <Sparkles className="w-3 h-3 fill-amber-300" />
        </div>
      </div>

      {/* Speech Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-blue-700 bg-blue-100/80 px-2 py-0.5 rounded-md">
            {badge}
          </span>
          <span className="text-xs font-semibold text-slate-500">Kiko si Robot Pintar</span>
        </div>
        <p className="text-sm sm:text-base font-bold text-slate-800 leading-snug">
          "{quote}"
        </p>
      </div>

    </div>
  );
};
