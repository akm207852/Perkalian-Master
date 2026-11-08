import React from 'react';
import { 
  BarChart3, 
  BookOpen, 
  CheckCircle2, 
  AlertCircle, 
  Trophy, 
  TrendingUp, 
  Sparkles, 
  Flame, 
  RotateCcw,
  ArrowRight,
  Layers
} from 'lucide-react';
import { StudentProfile, ActiveView } from '../types/math';
import { LEVEL_CONFIGS, ALL_QUESTIONS, getQuestionsForLevel } from '../utils/mathEngine';

interface ProgressViewProps {
  profile: StudentProfile;
  onNavigate: (view: ActiveView, extra?: { levelId?: number; groupId?: number }) => void;
}

export const ProgressView: React.FC<ProgressViewProps> = ({ profile, onNavigate }) => {
  const totalMastered = profile.masteredCardIds.length;
  const totalNeedsReview = profile.needsReviewCardIds.length;
  const totalCards = 1000;
  const masteredPercentage = Math.round((totalMastered / totalCards) * 100);

  const highestLevel = Math.max(...profile.unlockedLevels, 1);
  const completedLevelsCount = Object.values(profile.levelBestScores).filter((s) => s >= 80).length;

  const totalAnswered = profile.practiceStats.totalAnswered;
  const totalCorrect = profile.practiceStats.totalCorrect;
  const averageAccuracy = totalAnswered > 0 ? Math.round((totalCorrect / totalAnswered) * 100) : 0;

  // Identify groups needing review (based on needsReviewCardIds)
  const groupErrorCount: Record<number, number> = {};
  profile.needsReviewCardIds.forEach((cardId) => {
    const [groupStr] = cardId.split('_');
    const groupVal = parseInt(groupStr, 10);
    if (!isNaN(groupVal)) {
      groupErrorCount[groupVal] = (groupErrorCount[groupVal] || 0) + 1;
    }
  });

  const recommendedGroups = Object.entries(groupErrorCount)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 4)
    .map(([groupStr, count]) => {
      const gVal = parseInt(groupStr, 10);
      const levelId = Math.min(10, Math.max(1, Math.ceil(gVal / 10)));
      return {
        groupVal: gVal,
        levelId,
        count,
      };
    });

  return (
    <div className="space-y-6 pb-20 md:pb-8">
      
      {/* Banner */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-blue-700 text-xs font-bold rounded-full mb-2">
          <TrendingUp className="w-3.5 h-3.5" />
          <span>Dashboard Perkembangan & Analisis Belajar</span>
        </div>
        <h1 className="font-display font-black text-2xl sm:text-3xl text-slate-900">
          Progres Belajar {profile.name}
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Lacak penguasaan 1.000 perkalianmu secara menyeluruh dan lihat materi yang perlu ditingkatkan.
        </p>
      </div>

      {/* Primary KPI Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        
        <div className="p-5 bg-white rounded-3xl border border-slate-200 shadow-xs">
          <div className="flex items-center gap-2 text-slate-500 text-xs font-semibold mb-1">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Kartu Dikuasai</span>
          </div>
          <div className="font-display font-black text-2xl sm:text-3xl text-emerald-600 tabular-nums">
            {totalMastered} <span className="text-sm text-slate-400 font-normal">/ 1.000</span>
          </div>
          <p className="text-[11px] font-bold text-emerald-700 mt-1">
            {masteredPercentage}% Telah Hafal Mantap
          </p>
        </div>

        <div className="p-5 bg-white rounded-3xl border border-slate-200 shadow-xs">
          <div className="flex items-center gap-2 text-slate-500 text-xs font-semibold mb-1">
            <AlertCircle className="w-4 h-4 text-amber-500" />
            <span>Perlu Diulang</span>
          </div>
          <div className="font-display font-black text-2xl sm:text-3xl text-amber-600 tabular-nums">
            {totalNeedsReview} <span className="text-sm text-slate-400 font-normal">kartu</span>
          </div>
          <p className="text-[11px] font-bold text-amber-700 mt-1">
            Bisa dipelajari lewat Flashcard
          </p>
        </div>

        <div className="p-5 bg-white rounded-3xl border border-slate-200 shadow-xs">
          <div className="flex items-center gap-2 text-slate-500 text-xs font-semibold mb-1">
            <Trophy className="w-4 h-4 text-purple-600" />
            <span>Level Lulus</span>
          </div>
          <div className="font-display font-black text-2xl sm:text-3xl text-purple-600 tabular-nums">
            {completedLevelsCount} <span className="text-sm text-slate-400 font-normal">/ 10</span>
          </div>
          <p className="text-[11px] font-bold text-purple-700 mt-1">
            Level Tertinggi: Level {highestLevel}
          </p>
        </div>

        <div className="p-5 bg-white rounded-3xl border border-slate-200 shadow-xs">
          <div className="flex items-center gap-2 text-slate-500 text-xs font-semibold mb-1">
            <Flame className="w-4 h-4 text-blue-600" />
            <span>Akurasi Latihan</span>
          </div>
          <div className="font-display font-black text-2xl sm:text-3xl text-blue-600 tabular-nums">
            {averageAccuracy}%
          </div>
          <p className="text-[11px] font-bold text-blue-700 mt-1">
            Total {totalAnswered} Soal Dijawab
          </p>
        </div>

      </div>

      {/* Smart Recommendations: Kelompok yang Perlu Dipelajari Lagi */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="w-5 h-5 text-amber-500" />
          <h2 className="font-display font-black text-xl text-slate-900">
            Rekomendasi Materi Perlu Diulang
          </h2>
        </div>
        <p className="text-xs sm:text-sm text-slate-500 mb-5">
          Sistem mendeteksi kelompok perkalian yang paling sering membuatmu keliru:
        </p>

        {recommendedGroups.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {recommendedGroups.map((rec) => (
              <div
                key={rec.groupVal}
                className="p-4 bg-amber-50/70 rounded-2xl border border-amber-200 flex flex-col justify-between"
              >
                <div>
                  <span className="text-[11px] font-extrabold uppercase text-amber-800">
                    Level {rec.levelId}
                  </span>
                  <h4 className="font-display font-black text-lg text-slate-900 mt-1">
                    Perkalian {rec.groupVal}
                  </h4>
                  <p className="text-xs text-amber-900 font-medium mt-1">
                    {rec.count} kartu tersimpan dalam daftar ulang
                  </p>
                </div>
                <button
                  onClick={() => onNavigate('flashcard', { levelId: rec.levelId, groupId: rec.groupVal })}
                  className="mt-4 py-2 px-3 bg-amber-500 hover:bg-amber-600 text-slate-950 font-display font-bold text-xs rounded-xl transition-colors flex items-center justify-center gap-1 cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Pelajari Lagi Sekarang</span>
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-6 bg-emerald-50 rounded-2xl border border-emerald-200 text-center">
            <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
            <h4 className="font-display font-bold text-base text-emerald-900">
              Hebat! Tidak Ada Kartu Bermasalah
            </h4>
            <p className="text-xs text-emerald-700 mt-1">
              Seluruh soal yang kamu pelajari sejauh ini sudah terjawab dengan baik. Terus pertahankan!
            </p>
          </div>
        )}
      </div>

      {/* Progress Breakdown across 10 Levels */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="font-display font-black text-xl text-slate-900">
              Rincian Penguasaan Tiap Level
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Pantau progres kartu di setiap 10 kelompok dari Level 1 sampai 10
            </p>
          </div>
        </div>

        <div className="space-y-4">
          {LEVEL_CONFIGS.map((level) => {
            const isUnlocked = profile.unlockedLevels.includes(level.id);
            const levelQuestions = getQuestionsForLevel(level.id);
            const masteredCount = levelQuestions.filter((q) =>
              profile.masteredCardIds.includes(q.id)
            ).length;
            const percent = Math.round((masteredCount / level.totalCards) * 100);
            const bestScore = profile.levelBestScores[level.id];

            return (
              <div
                key={level.id}
                className="p-4 bg-slate-50 rounded-2xl border border-slate-200/90 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="sm:w-1/3">
                  <div className="flex items-center gap-2">
                    <span className="font-display font-extrabold text-sm text-slate-900">
                      {level.name}
                    </span>
                    <span className="text-xs text-slate-500">({level.rangeText})</span>
                    {!isUnlocked && (
                      <span className="text-[10px] font-bold text-slate-400 bg-slate-200 px-1.5 py-0.5 rounded-md">
                        Terkunci
                      </span>
                    )}
                  </div>
                  {bestScore !== undefined && (
                    <span className="text-[11px] font-bold text-purple-700">
                      Nilai Ujian: {bestScore}% {bestScore >= 80 ? '✓ Lulus' : ''}
                    </span>
                  )}
                </div>

                <div className="flex-1 max-w-md">
                  <div className="flex items-center justify-between text-xs font-semibold mb-1">
                    <span className="text-slate-500">Kartu Hafal</span>
                    <span className="text-blue-700 font-bold tabular-nums">
                      {masteredCount} / 100 ({percent}%)
                    </span>
                  </div>
                  <div className="w-full h-2.5 bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-600 rounded-full transition-all"
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>

                <button
                  disabled={!isUnlocked}
                  onClick={() => onNavigate('flashcard', { levelId: level.id })}
                  className="self-end sm:self-center px-3 py-1.5 bg-white hover:bg-slate-100 disabled:opacity-40 text-blue-700 border border-slate-200 text-xs font-bold rounded-xl transition-colors cursor-pointer"
                >
                  Buka Level
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Activity History Logs (Recent Challenges & Tests) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Test History */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs">
          <h3 className="font-display font-extrabold text-lg text-slate-900 mb-4 flex items-center gap-2">
            <Trophy className="w-5 h-5 text-purple-600" />
            <span>Riwayat Tes Akhir Level</span>
          </h3>

          {profile.testHistory.length > 0 ? (
            <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
              {profile.testHistory.slice(0, 10).map((t) => (
                <div key={t.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs flex items-center justify-between">
                  <div>
                    <span className="font-bold text-slate-900">Level {t.levelId}</span>
                    <span className="text-slate-400 text-[11px] block">
                      {new Date(t.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className={`font-display font-black text-sm block ${t.passed ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {t.score}% {t.passed ? '✓ Lulus' : '✗ Coba Lagi'}
                    </span>
                    <span className="text-[11px] text-slate-500">{t.correct} / 20 Benar</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-400 py-4 text-center">Belum ada riwayat tes akhir.</p>
          )}
        </div>

        {/* Challenge History */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs">
          <h3 className="font-display font-extrabold text-lg text-slate-900 mb-4 flex items-center gap-2">
            <Flame className="w-5 h-5 text-amber-500" />
            <span>Riwayat Mode Tantangan</span>
          </h3>

          {profile.challengeHistory.length > 0 ? (
            <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
              {profile.challengeHistory.slice(0, 10).map((c) => (
                <div key={c.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs flex items-center justify-between">
                  <div>
                    <span className="font-bold text-slate-900">
                      {c.questionCount} Soal · Mode {c.speedMode.toUpperCase()}
                    </span>
                    <span className="text-slate-400 text-[11px] block">
                      Skor: {c.score} Poin · {c.predicate}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="font-display font-bold text-sm text-blue-600 block">
                      {c.accuracy}%
                    </span>
                    <span className="text-[11px] text-slate-500">{c.totalTimeSec} detik</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-400 py-4 text-center">Belum ada riwayat tantangan.</p>
          )}
        </div>

      </div>

    </div>
  );
};
