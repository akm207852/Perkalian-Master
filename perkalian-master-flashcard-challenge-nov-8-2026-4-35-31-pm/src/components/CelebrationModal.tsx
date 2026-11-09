import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Trophy, Star, Sparkles, X, ArrowRight } from 'lucide-react';
import { AchievementBadge } from '../types/math';

interface CelebrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle: string;
  badges?: AchievementBadge[];
  starsEarned?: number;
  unlockedLevel?: number;
  primaryActionLabel?: string;
  onPrimaryAction?: () => void;
}

export const CelebrationModal: React.FC<CelebrationModalProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  badges = [],
  starsEarned = 0,
  unlockedLevel,
  primaryActionLabel = 'Lanjut Belajar',
  onPrimaryAction,
}) => {
  useEffect(() => {
    if (isOpen) {
      try {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#3b82f6', '#f59e0b', '#10b981', '#8b5cf6', '#ec4899'],
        });
      } catch {
        // ignore if canvas-confetti fails
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 text-center shadow-2xl border-2 border-amber-300">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors"
          aria-label="Tutup"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Trophy / Star Hero Icon */}
        <div className="w-24 h-24 mx-auto mb-4 relative flex items-center justify-center">
          <div className="w-20 h-20 rounded-3xl bg-linear-to-tr from-amber-400 via-yellow-400 to-orange-400 p-0.5 shadow-lg flex items-center justify-center animate-bounce">
            <div className="w-full h-full bg-linear-to-tr from-amber-500 to-yellow-300 rounded-[22px] flex items-center justify-center">
              <Trophy className="w-10 h-10 text-white fill-white/80" />
            </div>
          </div>
          <Sparkles className="w-6 h-6 text-amber-400 fill-amber-300 absolute -top-1 -right-1 animate-pulse" />
          <Star className="w-5 h-5 text-yellow-500 fill-yellow-400 absolute bottom-1 -left-1" />
        </div>

        {/* Main Title & Subtitle */}
        <h3 className="font-display font-extrabold text-2xl sm:text-3xl text-slate-900 mb-2">
          {title}
        </h3>
        <p className="text-sm sm:text-base font-semibold text-slate-600 mb-6">
          {subtitle}
        </p>

        {/* Star & Level Rewards */}
        <div className="flex items-center justify-center gap-4 mb-6">
          {starsEarned > 0 && (
            <div className="flex items-center gap-1.5 px-4 py-2 bg-amber-50 border border-amber-200 rounded-2xl text-amber-800 font-extrabold text-base">
              <Star className="w-5 h-5 text-amber-500 fill-amber-400" />
              <span>+{starsEarned} Bintang!</span>
            </div>
          )}

          {unlockedLevel && (
            <div className="flex items-center gap-1.5 px-4 py-2 bg-blue-50 border border-blue-200 rounded-2xl text-blue-800 font-extrabold text-base">
              <Sparkles className="w-5 h-5 text-blue-500" />
              <span>Level {unlockedLevel} Terbuka!</span>
            </div>
          )}
        </div>

        {/* Badges unlocked section if any */}
        {badges.length > 0 && (
          <div className="mb-6 p-4 bg-linear-to-r from-purple-50 to-indigo-50 border border-purple-200 rounded-2xl text-left">
            <span className="text-xs font-extrabold uppercase tracking-wider text-purple-700 block mb-2">
              🎉 Lencana Baru Terbuka!
            </span>
            <div className="space-y-2">
              {badges.map((b) => (
                <div key={b.id} className="flex items-center gap-3">
                  <span className="text-2xl">{b.icon}</span>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">{b.title}</h4>
                    <p className="text-xs text-slate-600">{b.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action Button */}
        <button
          onClick={() => {
            if (onPrimaryAction) onPrimaryAction();
            onClose();
          }}
          className="w-full py-3.5 px-6 bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-display font-extrabold text-base rounded-2xl shadow-lg hover:shadow-xl active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          <span>{primaryActionLabel}</span>
          <ArrowRight className="w-5 h-5" />
        </button>

      </div>
    </div>
  );
};
