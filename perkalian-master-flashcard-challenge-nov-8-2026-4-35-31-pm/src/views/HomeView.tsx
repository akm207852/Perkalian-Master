import React from 'react';
import { 
  BookOpen, 
  PenTool, 
  Zap, 
  Trophy, 
  Sparkles, 
  Flame, 
  ArrowRight, 
  CheckCircle2, 
  Award, 
  Star,
  Layers,
  ChevronRight
} from 'lucide-react';
import { StudentProfile, ActiveView } from '../types/math';
import { LEVEL_CONFIGS, MOTIVATION_QUOTES } from '../utils/mathEngine';
import { MascotMessage } from '../components/MascotMessage';

interface HomeViewProps {
  profile: StudentProfile;
  onNavigate: (view: ActiveView, extra?: { levelId?: number; groupId?: number }) => void;
}

export const HomeView: React.FC<HomeViewProps> = ({ profile, onNavigate }) => {
  // Current active level is the highest unlocked level
  const currentLevelId = Math.max(...profile.unlockedLevels, 1);
  const currentLevelConfig = LEVEL_CONFIGS.find((l) => l.id === currentLevelId) || LEVEL_CONFIGS[0];

  // Calculated metrics
  const totalMastered = profile.masteredCardIds.length;
  const totalCards = 1000;
  const masteryPercentage = Math.min(100, Math.round((totalMastered / totalCards) * 100));

  const totalAnswered = profile.practiceStats.totalAnswered;
  const totalCorrect = profile.practiceStats.totalCorrect;
  const overallAccuracy = totalAnswered > 0 ? Math.round((totalCorrect / totalAnswered) * 100) : 0;

  const completedLevelsCount = Object.values(profile.levelBestScores).filter((s) => s >= 80).length;

  // Pick quote based on date or profile activity
  const quoteIndex = (profile.stars + completedLevelsCount) % MOTIVATION_QUOTES.length;
  const dailyQuote = MOTIVATION_QUOTES[quoteIndex];

  return (
    <div className="space-y-6 pb-20 md:pb-8">
      
      {/* Hero Welcome Card */}
      <div className="relative overflow-hidden rounded-3xl bg-linear-to-r from-blue-600 via-indigo-600 to-amber-500 text-white shadow-xl">
        {/* Background artwork */}
        <div className="absolute inset-0 opacity-20 pointer-events-none">
          <img
            src="/src/assets/images/hero_math_adventure_1794129987884.jpg"
            alt="Petualangan Matematika"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover"
          />
        </div>

        <div className="relative z-10 p-6 sm:p-8 lg:p-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="text-center md:text-left max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs sm:text-sm font-bold text-amber-200 mb-3">
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>Media Pembelajaran Interaktif Siswa SD</span>
            </div>

            <h1 className="font-display font-black text-3xl sm:text-4xl lg:text-5xl tracking-tight text-white mb-2 leading-tight">
              PERKALIAN MASTER
            </h1>
            <p className="text-base sm:text-lg text-blue-100 font-medium mb-6">
              Halo, <span className="font-bold text-yellow-300">{profile.name}</span>! Siap menaklukkan perkalian 1 sampai 100 hari ini?
            </p>

            {/* Main Action CTAs */}
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
              <button
                onClick={() => onNavigate('flashcard', { levelId: currentLevelId })}
                className="px-6 py-3.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-display font-extrabold text-base rounded-2xl shadow-lg hover:shadow-xl active:scale-95 transition-all flex items-center gap-2 cursor-pointer"
              >
                <BookOpen className="w-5 h-5 text-amber-950" />
                <span>MULAI BELAJAR</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => onNavigate('levels')}
                className="px-5 py-3.5 bg-white/15 hover:bg-white/25 backdrop-blur-sm text-white font-display font-bold text-base rounded-2xl border border-white/30 transition-all flex items-center gap-2 cursor-pointer"
              >
                <Layers className="w-5 h-5" />
                <span>PILIH LEVEL</span>
              </button>
            </div>
          </div>

          {/* Quick Mascot Box on the right */}
          <div className="shrink-0 flex flex-col items-center">
            <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-3xl overflow-hidden border-4 border-white/60 shadow-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <img
                src="/src/assets/images/mascot_kiko_robot_1794129987412.jpg"
                alt="Robot Kiko"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="mt-2 text-center text-xs font-bold text-blue-100 bg-black/20 px-3 py-1 rounded-full">
              Kiko siap membantumu! 🤖
            </div>
          </div>
        </div>
      </div>

      {/* Mascot Speech Bubble Motivation */}
      <MascotMessage quote={dailyQuote} badge="Semangat Hari Ini" />

      {/* Quick Action Hub: 4 Key Modes */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        
        {/* Card 1: Belajar Flashcard */}
        <button
          onClick={() => onNavigate('levels')}
          className="p-5 bg-white rounded-3xl border-2 border-blue-100 hover:border-blue-300 shadow-xs hover:shadow-md transition-all text-left group cursor-pointer flex flex-col justify-between"
        >
          <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-display font-extrabold text-lg text-slate-900 group-hover:text-blue-600 transition-colors">
              Pilih Level
            </h3>
            <p className="text-xs text-slate-500 mt-1 line-clamp-2">
              10 Level pembelajaran dari 1 s.d. 100 dengan 1.000 flashcard.
            </p>
          </div>
          <div className="mt-4 flex items-center gap-1 text-xs font-bold text-blue-600">
            <span>Buka Level</span>
            <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </div>
        </button>

        {/* Card 2: Mode Latihan */}
        <button
          onClick={() => onNavigate('practice')}
          className="p-5 bg-white rounded-3xl border-2 border-emerald-100 hover:border-emerald-300 shadow-xs hover:shadow-md transition-all text-left group cursor-pointer flex flex-col justify-between"
        >
          <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <PenTool className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-display font-extrabold text-lg text-slate-900 group-hover:text-emerald-600 transition-colors">
              Mode Latihan
            </h3>
            <p className="text-xs text-slate-500 mt-1 line-clamp-2">
              Uji kemampuan dengan 10, 20, 50, atau 100 soal pilihanmu.
            </p>
          </div>
          <div className="mt-4 flex items-center gap-1 text-xs font-bold text-emerald-600">
            <span>Mulai Latihan</span>
            <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </div>
        </button>

        {/* Card 3: Mode Tantangan */}
        <button
          onClick={() => onNavigate('challenge')}
          className="p-5 bg-white rounded-3xl border-2 border-amber-100 hover:border-amber-300 shadow-xs hover:shadow-md transition-all text-left group cursor-pointer flex flex-col justify-between"
        >
          <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <Zap className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-display font-extrabold text-lg text-slate-900 group-hover:text-amber-600 transition-colors">
              Mode Tantangan
            </h3>
            <p className="text-xs text-slate-500 mt-1 line-clamp-2">
              Tantangan kecepatan berhitung: Santai, Cepat (10s), Kilat (5s).
            </p>
          </div>
          <div className="mt-4 flex items-center gap-1 text-xs font-bold text-amber-600">
            <span>Tantang Diri</span>
            <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </div>
        </button>

        {/* Card 4: Tes Akhir Level */}
        <button
          onClick={() => onNavigate('levelTest', { levelId: currentLevelId })}
          className="p-5 bg-white rounded-3xl border-2 border-purple-100 hover:border-purple-300 shadow-xs hover:shadow-md transition-all text-left group cursor-pointer flex flex-col justify-between"
        >
          <div className="w-12 h-12 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <Trophy className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-display font-extrabold text-lg text-slate-900 group-hover:text-purple-600 transition-colors">
              Tes Akhir Level
            </h3>
            <p className="text-xs text-slate-500 mt-1 line-clamp-2">
              Luluskan 20 soal (minimal 80%) untuk membuka level berikutnya!
            </p>
          </div>
          <div className="mt-4 flex items-center gap-1 text-xs font-bold text-purple-600">
            <span>Uji Kelulusan</span>
            <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </div>
        </button>

      </div>

      {/* Ringkasan Perkembangan Siswa (Dashboard Stats) */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="font-display font-extrabold text-xl sm:text-2xl text-slate-900">
              Ringkasan Perkembanganmu
            </h2>
            <p className="text-sm text-slate-500">
              Pantau terus hasil latihan dan hafalan perkalianmu
            </p>
          </div>
          <button
            onClick={() => onNavigate('progress')}
            className="text-xs sm:text-sm font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 cursor-pointer self-start sm:self-center"
          >
            <span>Lihat Detail Statistik</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* 5 Key Metric Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
          
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80">
            <div className="flex items-center gap-2 text-slate-500 text-xs font-semibold mb-1">
              <Layers className="w-4 h-4 text-blue-600" />
              <span>Level Terakhir</span>
            </div>
            <div className="font-display font-extrabold text-xl sm:text-2xl text-slate-900">
              {currentLevelConfig.name}
            </div>
            <span className="text-[11px] font-medium text-slate-500">
              {currentLevelConfig.rangeText}
            </span>
          </div>

          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80">
            <div className="flex items-center gap-2 text-slate-500 text-xs font-semibold mb-1">
              <BookOpen className="w-4 h-4 text-emerald-600" />
              <span>Hafal Terdata</span>
            </div>
            <div className="font-display font-extrabold text-xl sm:text-2xl text-slate-900 tabular-nums">
              {totalMastered} <span className="text-xs font-normal text-slate-500">/ 1.000</span>
            </div>
            <span className="text-[11px] font-medium text-emerald-600">
              {masteryPercentage}% dari 1.000 kartu
            </span>
          </div>

          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80">
            <div className="flex items-center gap-2 text-slate-500 text-xs font-semibold mb-1">
              <CheckCircle2 className="w-4 h-4 text-blue-600" />
              <span>Jawaban Benar</span>
            </div>
            <div className="font-display font-extrabold text-xl sm:text-2xl text-slate-900 tabular-nums">
              {totalCorrect}
            </div>
            <span className="text-[11px] font-medium text-slate-500">
              dari {totalAnswered} soal latihan
            </span>
          </div>

          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80">
            <div className="flex items-center gap-2 text-slate-500 text-xs font-semibold mb-1">
              <Flame className="w-4 h-4 text-amber-500" />
              <span>Akurasi Latihan</span>
            </div>
            <div className="font-display font-extrabold text-xl sm:text-2xl text-slate-900 tabular-nums">
              {overallAccuracy}%
            </div>
            <span className="text-[11px] font-medium text-amber-600">
              {overallAccuracy >= 80 ? 'Sangat Baik' : totalAnswered > 0 ? 'Perlu Terus Latihan' : 'Belum Mulai'}
            </span>
          </div>

          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 col-span-2 lg:col-span-1">
            <div className="flex items-center gap-2 text-slate-500 text-xs font-semibold mb-1">
              <Trophy className="w-4 h-4 text-purple-600" />
              <span>Level Selesai</span>
            </div>
            <div className="font-display font-extrabold text-xl sm:text-2xl text-slate-900 tabular-nums">
              {completedLevelsCount} <span className="text-xs font-normal text-slate-500">/ 10</span>
            </div>
            <span className="text-[11px] font-medium text-purple-600">
              {10 - completedLevelsCount} level tersisa
            </span>
          </div>

        </div>

        {/* Continue Learning Banner */}
        <div className="mt-6 p-4 sm:p-5 rounded-2xl bg-linear-to-r from-blue-50 to-indigo-50 border border-blue-200 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-blue-600 text-white flex items-center justify-center font-black text-xl">
              {currentLevelId}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-blue-700 bg-blue-200/60 px-2 py-0.5 rounded-md">
                  Target Kamu
                </span>
                <span className="text-xs font-semibold text-slate-500">
                  {currentLevelConfig.rangeText}
                </span>
              </div>
              <h4 className="font-display font-bold text-base text-slate-900">
                Lanjutkan {currentLevelConfig.name} sekarang
              </h4>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={() => onNavigate('flashcard', { levelId: currentLevelId })}
              className="flex-1 sm:flex-none px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-display font-bold text-sm rounded-xl shadow-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <BookOpen className="w-4 h-4" />
              <span>Buka Flashcard</span>
            </button>
            <button
              onClick={() => onNavigate('groups', { levelId: currentLevelId })}
              className="px-4 py-2.5 bg-white hover:bg-slate-50 text-slate-700 font-display font-bold text-sm rounded-xl border border-slate-200 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <span>Daftar Kelompok</span>
            </button>
          </div>
        </div>

      </div>

    </div>
  );
};
