import React from 'react';
import { 
  Lock, 
  Unlock, 
  CheckCircle2, 
  Trophy, 
  BookOpen, 
  Sparkles, 
  ArrowRight,
  Flame
} from 'lucide-react';
import { StudentProfile, ActiveView } from '../types/math';
import { LEVEL_CONFIGS, getQuestionsForLevel } from '../utils/mathEngine';

interface LevelsViewProps {
  profile: StudentProfile;
  onNavigate: (view: ActiveView, extra?: { levelId?: number; groupId?: number }) => void;
}

export const LevelsView: React.FC<LevelsViewProps> = ({ profile, onNavigate }) => {
  return (
    <div className="space-y-6 pb-20 md:pb-8">
      
      {/* Header */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-blue-700 text-xs font-bold rounded-full mb-2">
              <Sparkles className="w-3.5 h-3.5 text-blue-500" />
              <span>10 Level Bertahap · 1.000 Flashcard Perkalian</span>
            </div>
            <h1 className="font-display font-black text-2xl sm:text-3xl text-slate-900">
              Pilihan Level Perkalian
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Selesaikan Tes Akhir Level dengan nilai minimal 80% untuk membuka level berikutnya!
            </p>
          </div>

          <div className="flex items-center gap-3 bg-amber-50 px-4 py-2.5 rounded-2xl border border-amber-200 text-amber-900 font-bold text-sm self-start sm:self-center">
            <Trophy className="w-5 h-5 text-amber-500 fill-amber-400" />
            <div>
              <span className="text-xs block text-amber-700">Level Terbuka</span>
              <span className="text-base font-black">
                {profile.unlockedLevels.length} / 10 Level
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Grid of 10 Levels */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {LEVEL_CONFIGS.map((level) => {
          const isUnlocked = profile.unlockedLevels.includes(level.id);
          const bestScore = profile.levelBestScores[level.id];
          const isCompleted = bestScore !== undefined && bestScore >= 80;

          // Calculate mastery of cards in this level
          const levelQuestions = getQuestionsForLevel(level.id);
          const masteredInLevel = levelQuestions.filter((q) =>
            profile.masteredCardIds.includes(q.id)
          ).length;
          const progressPercent = Math.round((masteredInLevel / level.totalCards) * 100);

          return (
            <div
              key={level.id}
              className={`rounded-3xl border-2 transition-all overflow-hidden flex flex-col justify-between ${
                isUnlocked
                  ? 'bg-white border-slate-200 hover:border-blue-300 shadow-xs hover:shadow-md'
                  : 'bg-slate-50/80 border-slate-200/60 opacity-80'
              }`}
            >
              {/* Level Card Header */}
              <div className={`p-5 sm:p-6 bg-linear-to-r ${level.color} text-white relative`}>
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-xs font-black uppercase tracking-wider bg-white/20 backdrop-blur-xs px-2.5 py-1 rounded-lg">
                      {level.name}
                    </span>
                    <h3 className="font-display font-black text-2xl text-white mt-2">
                      {level.rangeText}
                    </h3>
                  </div>

                  {/* Lock/Unlock Badge */}
                  <div className="p-2.5 rounded-2xl bg-white/20 backdrop-blur-md text-white shadow-xs">
                    {isUnlocked ? (
                      isCompleted ? (
                        <CheckCircle2 className="w-6 h-6 text-yellow-300 fill-yellow-400/20" />
                      ) : (
                        <Unlock className="w-6 h-6 text-white" />
                      )
                    ) : (
                      <Lock className="w-6 h-6 text-white/80" />
                    )}
                  </div>
                </div>

                {/* Subtitle count */}
                <div className="mt-3 flex items-center justify-between text-xs text-white/90 font-medium">
                  <span>{level.totalCards} Flashcard (10 Kelompok)</span>
                  {bestScore !== undefined && (
                    <span className="font-bold bg-white/20 px-2 py-0.5 rounded-md">
                      Nilai Tes: {bestScore}%
                    </span>
                  )}
                </div>
              </div>

              {/* Level Card Body */}
              <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between space-y-4">
                
                {/* Progress bar */}
                <div>
                  <div className="flex items-center justify-between text-xs font-bold mb-1.5">
                    <span className="text-slate-600">Kartu Dikuasai</span>
                    <span className="text-blue-700 tabular-nums">
                      {masteredInLevel} / {level.totalCards} ({progressPercent}%)
                    </span>
                  </div>
                  <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-linear-to-r from-blue-500 to-indigo-600 rounded-full transition-all duration-500"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                </div>

                {/* Status info */}
                <div className="text-xs">
                  {isUnlocked ? (
                    isCompleted ? (
                      <div className="flex items-center gap-1.5 text-emerald-700 font-bold bg-emerald-50 p-2.5 rounded-xl border border-emerald-200">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <span>Level ini sudah kamu LULUS! Kamu tetap bisa mengulanginya kapan saja.</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5 text-blue-700 font-semibold bg-blue-50 p-2.5 rounded-xl border border-blue-200">
                        <Flame className="w-4 h-4 text-amber-500" />
                        <span>Level terbuka! Pelajari flashcard lalu ikuti Tes Akhir Level.</span>
                      </div>
                    )
                  ) : (
                    <div className="flex items-center gap-1.5 text-slate-500 font-medium bg-slate-100 p-2.5 rounded-xl">
                      <Lock className="w-4 h-4 text-slate-400" />
                      <span>Selesaikan Level {level.id - 1} dengan nilai minimal 80% untuk membuka level ini.</span>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="pt-2 flex flex-col sm:flex-row gap-2">
                  {isUnlocked ? (
                    <>
                      <button
                        onClick={() => onNavigate('groups', { levelId: level.id })}
                        className="flex-1 py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-display font-extrabold text-sm rounded-xl shadow-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <BookOpen className="w-4 h-4" />
                        <span>MULAI</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => onNavigate('levelTest', { levelId: level.id })}
                        title="Ikuti Tes Akhir Level untuk menguji pemahaman"
                        className="py-3 px-3 bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 font-display font-bold text-xs rounded-xl transition-colors flex items-center justify-center gap-1 cursor-pointer whitespace-nowrap"
                      >
                        <Trophy className="w-4 h-4 text-purple-600" />
                        <span>Tes Level</span>
                      </button>
                    </>
                  ) : (
                    <button
                      disabled
                      className="w-full py-3 px-4 bg-slate-200 text-slate-400 font-display font-bold text-sm rounded-xl cursor-not-allowed flex items-center justify-center gap-1.5"
                    >
                      <Lock className="w-4 h-4" />
                      <span>TERKUNCI</span>
                    </button>
                  )}
                </div>

              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
};
