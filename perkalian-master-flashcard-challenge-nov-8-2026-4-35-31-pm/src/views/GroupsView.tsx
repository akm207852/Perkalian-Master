import React from 'react';
import { 
  ArrowLeft, 
  BookOpen, 
  Trophy, 
  Sparkles, 
  CheckCircle2, 
  ArrowRight,
  ChevronRight,
  Flame
} from 'lucide-react';
import { StudentProfile, ActiveView } from '../types/math';
import { LEVEL_CONFIGS, getQuestionsForGroup, getQuestionsForLevel } from '../utils/mathEngine';

interface GroupsViewProps {
  levelId: number;
  profile: StudentProfile;
  onNavigate: (view: ActiveView, extra?: { levelId?: number; groupId?: number }) => void;
}

export const GroupsView: React.FC<GroupsViewProps> = ({
  levelId,
  profile,
  onNavigate,
}) => {
  const levelConfig = LEVEL_CONFIGS.find((l) => l.id === levelId) || LEVEL_CONFIGS[0];
  const levelQuestions = getQuestionsForLevel(levelId);

  // Group range: from startNum to endNum (e.g. 1 to 10 for Level 1, 11 to 20 for Level 2)
  const groups: number[] = [];
  for (let i = levelConfig.startNum; i <= levelConfig.endNum; i++) {
    groups.push(i);
  }

  // Calculate overall level mastery
  const totalMasteredInLevel = levelQuestions.filter((q) =>
    profile.masteredCardIds.includes(q.id)
  ).length;
  const levelMasteryPercent = Math.round((totalMasteredInLevel / levelConfig.totalCards) * 100);

  const bestScore = profile.levelBestScores[levelId];
  const isPassed = bestScore !== undefined && bestScore >= 80;

  return (
    <div className="space-y-6 pb-20 md:pb-8">
      
      {/* Top Banner & Navigation */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs">
        <button
          onClick={() => onNavigate('levels')}
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-blue-600 transition-colors mb-4 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali ke Pilihan Level</span>
        </button>

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-700 text-xs font-extrabold rounded-full mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{levelConfig.name} · {levelConfig.rangeText}</span>
            </div>
            <h1 className="font-display font-black text-2xl sm:text-3xl text-slate-900">
              10 Kelompok Tabel Perkalian
            </h1>
            <p className="text-sm text-slate-500 mt-1 max-w-xl">
              Pilih kelompok tertentu untuk fokus mendalami 10 perkalian, atau pelajari seluruh 100 flashcard sekaligus.
            </p>
          </div>

          {/* Quick Actions */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => onNavigate('flashcard', { levelId })}
              className="px-5 py-3 bg-blue-600 hover:bg-blue-700 text-white font-display font-extrabold text-sm rounded-2xl shadow-xs transition-colors flex items-center gap-2 cursor-pointer"
            >
              <BookOpen className="w-4 h-4" />
              <span>Pelajari Semua (100 Kartu)</span>
            </button>

            <button
              onClick={() => onNavigate('levelTest', { levelId })}
              className="px-5 py-3 bg-purple-600 hover:bg-purple-700 text-white font-display font-extrabold text-sm rounded-2xl shadow-xs transition-colors flex items-center gap-2 cursor-pointer"
            >
              <Trophy className="w-4 h-4" />
              <span>Tes Akhir Level (20 Soal)</span>
            </button>
          </div>
        </div>

        {/* Progress Strip */}
        <div className="mt-6 pt-6 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex-1 max-w-md">
            <div className="flex items-center justify-between text-xs font-bold mb-1.5">
              <span className="text-slate-600">Progres Penguasaan Level</span>
              <span className="text-blue-700 tabular-nums">
                {totalMasteredInLevel} / {levelConfig.totalCards} Kartu ({levelMasteryPercent}%)
              </span>
            </div>
            <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-linear-to-r from-blue-500 to-indigo-600 rounded-full transition-all"
                style={{ width: `${levelMasteryPercent}%` }}
              />
            </div>
          </div>

          {isPassed ? (
            <div className="flex items-center gap-2 text-emerald-700 font-bold text-xs bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>LULUS TES AKHIR ({bestScore}%)</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-amber-700 font-semibold text-xs bg-amber-50 px-3 py-1.5 rounded-xl border border-amber-200">
              <Flame className="w-4 h-4 text-amber-500" />
              <span>Belum Lulus Tes Akhir Level</span>
            </div>
          )}
        </div>
      </div>

      {/* 10 Group Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
        {groups.map((groupVal, index) => {
          const groupQuestions = getQuestionsForGroup(levelId, groupVal);
          const masteredInGroup = groupQuestions.filter((q) =>
            profile.masteredCardIds.includes(q.id)
          ).length;
          const groupPercent = Math.round((masteredInGroup / groupQuestions.length) * 100);
          const isGroupMastered = masteredInGroup === 10;

          return (
            <div
              key={groupVal}
              className={`rounded-2xl p-5 border-2 transition-all flex flex-col justify-between ${
                isGroupMastered
                  ? 'bg-emerald-50/70 border-emerald-300 shadow-xs'
                  : 'bg-white border-slate-200 hover:border-blue-300 hover:shadow-md'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[11px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                    Kelompok {index + 1}
                  </span>
                  {isGroupMastered && (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 fill-emerald-100" />
                  )}
                </div>

                <h3 className="font-display font-black text-xl text-slate-900">
                  Perkalian {groupVal}
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  {groupVal} × 1 s.d. {groupVal} × 10
                </p>

                {/* Group Mastery Bar */}
                <div className="mt-4">
                  <div className="flex items-center justify-between text-xs font-bold mb-1">
                    <span className="text-slate-500 text-[11px]">Dikuasai</span>
                    <span className="text-blue-700 tabular-nums text-[11px]">
                      {masteredInGroup} / 10
                    </span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        isGroupMastered ? 'bg-emerald-500' : 'bg-blue-600'
                      }`}
                      style={{ width: `${groupPercent}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <div className="mt-5 pt-3 border-t border-slate-100/80">
                <button
                  onClick={() => onNavigate('flashcard', { levelId, groupId: groupVal })}
                  className="w-full py-2.5 px-3 bg-blue-50 hover:bg-blue-600 hover:text-white text-blue-700 font-display font-extrabold text-xs rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer group"
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>Pelajari (10 Kartu)</span>
                  <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </button>
              </div>

            </div>
          );
        })}
      </div>

    </div>
  );
};
