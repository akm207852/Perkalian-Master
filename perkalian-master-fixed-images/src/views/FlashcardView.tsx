import React, { useState, useMemo, useEffect } from 'react';
import { 
  ArrowLeft, 
  RotateCw, 
  ChevronLeft, 
  ChevronRight, 
  Shuffle, 
  Check, 
  X, 
  Sparkles, 
  Lightbulb, 
  Volume2, 
  HelpCircle,
  Repeat
} from 'lucide-react';
import { Question, StudentProfile, ActiveView } from '../types/math';
import { 
  LEVEL_CONFIGS, 
  getQuestionsForLevel, 
  getQuestionsForGroup, 
  shuffleArray 
} from '../utils/mathEngine';
import { updateCardMastery } from '../utils/storage';
import { sound } from '../utils/sound';

interface FlashcardViewProps {
  levelId: number;
  groupId?: number;
  profile: StudentProfile;
  onUpdateProfile: (updated: StudentProfile) => void;
  onNavigate: (view: ActiveView, extra?: { levelId?: number; groupId?: number }) => void;
}

export const FlashcardView: React.FC<FlashcardViewProps> = ({
  levelId,
  groupId,
  profile,
  onUpdateProfile,
  onNavigate,
}) => {
  const levelConfig = LEVEL_CONFIGS.find((l) => l.id === levelId) || LEVEL_CONFIGS[0];

  // Base question set
  const baseQuestions = useMemo(() => {
    if (groupId) {
      return getQuestionsForGroup(levelId, groupId);
    }
    return getQuestionsForLevel(levelId);
  }, [levelId, groupId]);

  // Mode filters: 'all' | 'unmastered' | 'mastered'
  const [filterMode, setFilterMode] = useState<'all' | 'unmastered' | 'mastered'>('all');
  const [isShuffled, setIsShuffled] = useState(false);
  const [deck, setDeck] = useState<Question[]>(baseQuestions);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [showVisualAid, setShowVisualAid] = useState(false);

  // Initialize or update deck when filter or shuffle changes
  useEffect(() => {
    let filtered = [...baseQuestions];
    if (filterMode === 'unmastered') {
      const needsReview = new Set(profile.needsReviewCardIds);
      const mastered = new Set(profile.masteredCardIds);
      filtered = baseQuestions.filter((q) => needsReview.has(q.id) || !mastered.has(q.id));
      if (filtered.length === 0) {
        filtered = [...baseQuestions]; // Fallback if all mastered
      }
    } else if (filterMode === 'mastered') {
      const mastered = new Set(profile.masteredCardIds);
      filtered = baseQuestions.filter((q) => mastered.has(q.id));
      if (filtered.length === 0) {
        filtered = [...baseQuestions];
      }
    }

    if (isShuffled) {
      setDeck(shuffleArray(filtered));
    } else {
      setDeck(filtered);
    }
    setCurrentIndex(0);
    setIsFlipped(false);
    setShowVisualAid(false);
  }, [baseQuestions, filterMode, isShuffled]);

  const currentCard: Question | undefined = deck[currentIndex] || deck[0];

  const isCurrentCardMastered = currentCard
    ? profile.masteredCardIds.includes(currentCard.id)
    : false;

  const isCurrentCardNeedsReview = currentCard
    ? profile.needsReviewCardIds.includes(currentCard.id)
    : false;

  const handleFlip = () => {
    sound.playFlip(profile.settings.soundEnabled);
    setIsFlipped((prev) => !prev);
  };

  const handleNext = () => {
    if (currentIndex < deck.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setIsFlipped(false);
      setShowVisualAid(false);
      sound.playClick(profile.settings.soundEnabled);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
      setIsFlipped(false);
      setShowVisualAid(false);
      sound.playClick(profile.settings.soundEnabled);
    }
  };

  const handleToggleShuffle = () => {
    const nextShuffled = !isShuffled;
    setIsShuffled(nextShuffled);
    sound.playClick(profile.settings.soundEnabled);
  };

  const handleResetDeck = () => {
    setCurrentIndex(0);
    setIsFlipped(false);
    setShowVisualAid(false);
    if (isShuffled) {
      setDeck(shuffleArray(deck));
    }
    sound.playClick(profile.settings.soundEnabled);
  };

  const handleMarkMastered = () => {
    if (!currentCard) return;
    sound.playCorrect(profile.settings.soundEnabled);
    const updated = updateCardMastery(profile, currentCard.id, true);
    onUpdateProfile(updated);
    // Auto advance to next card after a small moment if not at end
    if (currentIndex < deck.length - 1) {
      setTimeout(() => {
        handleNext();
      }, 400);
    }
  };

  const handleMarkNeedsReview = () => {
    if (!currentCard) return;
    sound.playWrong(profile.settings.soundEnabled);
    const updated = updateCardMastery(profile, currentCard.id, false);
    onUpdateProfile(updated);
    // Auto advance
    if (currentIndex < deck.length - 1) {
      setTimeout(() => {
        handleNext();
      }, 400);
    }
  };

  if (!currentCard) {
    return (
      <div className="p-8 text-center bg-white rounded-3xl">
        <p>Tidak ada kartu yang ditemukan.</p>
        <button
          onClick={() => onNavigate('levels')}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-xl"
        >
          Kembali ke Level
        </button>
      </div>
    );
  }

  const progressPercent = Math.round(((currentIndex + 1) / deck.length) * 100);

  return (
    <div className="max-w-4xl mx-auto space-y-5 pb-24 md:pb-10">
      
      {/* Top Bar with back link, level name & deck mode */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs">
        <button
          onClick={() => {
            if (groupId) {
              onNavigate('groups', { levelId });
            } else {
              onNavigate('levels');
            }
          }}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-blue-600 transition-colors cursor-pointer self-start"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali ke {groupId ? 'Kelompok' : 'Level'}</span>
        </button>

        <div className="flex items-center gap-2">
          <span className="text-xs font-bold px-2.5 py-1 bg-blue-100 text-blue-700 rounded-lg">
            {levelConfig.name}
          </span>
          <span className="text-xs font-bold text-slate-700">
            {groupId ? `Kelompok Perkalian ${groupId}` : levelConfig.rangeText}
          </span>
        </div>

        {/* Filter Tabs: Semua / Belum Hafal / Sudah Hafal */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl self-start sm:self-auto">
          <button
            onClick={() => setFilterMode('all')}
            className={`px-3 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              filterMode === 'all'
                ? 'bg-white text-blue-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Semua ({baseQuestions.length})
          </button>
          <button
            onClick={() => setFilterMode('unmastered')}
            className={`px-3 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              filterMode === 'unmastered'
                ? 'bg-white text-amber-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Belum Hafal
          </button>
          <button
            onClick={() => setFilterMode('mastered')}
            className={`px-3 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              filterMode === 'mastered'
                ? 'bg-white text-emerald-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Sudah Hafal
          </button>
        </div>
      </div>

      {/* Progress & Card Index Tracker */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-2">
        <div className="flex items-center justify-between text-xs font-bold">
          <div className="flex items-center gap-2">
            <span className="text-slate-500">Nomor Kartu:</span>
            <span className="text-blue-700 font-extrabold text-sm tabular-nums">
              {currentIndex + 1} / {deck.length}
            </span>
          </div>

          <div className="flex items-center gap-3">
            {isCurrentCardMastered && (
              <span className="inline-flex items-center gap-1 text-[11px] font-extrabold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                <Check className="w-3.5 h-3.5" /> Sudah Hafal
              </span>
            )}
            {isCurrentCardNeedsReview && (
              <span className="inline-flex items-center gap-1 text-[11px] font-extrabold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                <Repeat className="w-3.5 h-3.5" /> Perlu Diulang
              </span>
            )}
            <span className="text-slate-400 font-medium tabular-nums">{progressPercent}%</span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-linear-to-r from-blue-500 via-indigo-500 to-amber-500 rounded-full transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* 3D Interactive Flashcard Container */}
      <div className="perspective-1000 w-full min-h-[340px] sm:min-h-[400px]">
        <div
          onClick={handleFlip}
          className={`relative w-full h-[340px] sm:h-[400px] cursor-pointer rounded-3xl transition-transform duration-500 transform-style-preserve-3d shadow-xl select-none ${
            isFlipped ? 'rotate-y-180' : ''
          }`}
        >
          
          {/* FRONT OF CARD (Question) */}
          <div className="absolute inset-0 w-full h-full backface-hidden rounded-3xl bg-linear-to-b from-white to-blue-50/50 border-3 border-blue-200 p-6 sm:p-8 flex flex-col justify-between">
            {/* Top corner indicators */}
            <div className="flex items-center justify-between text-xs font-bold text-slate-400">
              <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full uppercase tracking-wider text-[11px]">
                {currentCard.groupName}
              </span>
              <span className="flex items-center gap-1 text-slate-500">
                <RotateCw className="w-3.5 h-3.5" /> Ketuk untuk membalik kartu
              </span>
            </div>

            {/* Central Big Math Equation */}
            <div className="text-center my-auto py-4">
              <div className="font-display font-black text-5xl sm:text-7xl lg:text-8xl tracking-tight text-slate-900 flex items-center justify-center gap-3 sm:gap-6">
                <span className="text-blue-700">{currentCard.a}</span>
                <span className="text-amber-500 font-light">×</span>
                <span className="text-indigo-700">{currentCard.b}</span>
                <span className="text-slate-400 font-light">=</span>
                <span className="text-amber-600">?</span>
              </div>
              <p className="mt-4 text-xs sm:text-sm font-semibold text-slate-500">
                Berapa hasil perkalian di atas? Tebak di dalam hati, lalu balik kartu!
              </p>
            </div>

            {/* Card Footer Hint */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs">
              <span className="text-slate-500 font-medium">
                {isShuffled ? '🔀 Mode Acak' : '🔢 Mode Berurutan'}
              </span>
              <span className="font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-lg">
                Balik Kartu ➜
              </span>
            </div>
          </div>

          {/* BACK OF CARD (Answer & Breakdown) */}
          <div className="absolute inset-0 w-full h-full backface-hidden rotate-y-180 rounded-3xl bg-linear-to-b from-white to-emerald-50/40 border-3 border-emerald-300 p-6 sm:p-8 flex flex-col justify-between">
            {/* Top Bar */}
            <div className="flex items-center justify-between text-xs font-bold">
              <span className="bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full uppercase tracking-wider text-[11px]">
                Jawaban Benar
              </span>
              <span className="text-emerald-700 font-bold flex items-center gap-1">
                <Check className="w-4 h-4" /> Kunci Jawaban
              </span>
            </div>

            {/* Central Answer */}
            <div className="text-center my-auto py-2">
              <div className="font-display font-black text-5xl sm:text-7xl tracking-tight text-slate-900 flex items-center justify-center gap-2 sm:gap-4">
                <span>{currentCard.a} × {currentCard.b} =</span>
                <span className="text-emerald-600 underline decoration-amber-400 decoration-wavy">
                  {currentCard.answer}
                </span>
              </div>

              {/* Step-by-step addition breakdown */}
              <div className="mt-4 max-w-lg mx-auto bg-slate-50 border border-slate-200/90 rounded-2xl p-3 text-xs sm:text-sm font-bold text-slate-700">
                <span className="text-slate-500 block text-[11px] mb-1 font-semibold">
                  Penjelasan Penjumlahan Berulang:
                </span>
                <p className="font-mono text-blue-800">{currentCard.breakdown}</p>
              </div>

              {/* Memory Tip if present */}
              {currentCard.tip && (
                <div className="mt-2.5 max-w-lg mx-auto bg-amber-50 border border-amber-200 rounded-xl p-2.5 text-xs text-amber-900 font-medium flex items-center gap-2 text-left">
                  <Lightbulb className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>{currentCard.tip}</span>
                </div>
              )}
            </div>

            {/* Bottom flip guide */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs text-slate-500">
              <span>Ketuk untuk kembali ke soal</span>
              <span className="font-bold text-emerald-600">Jawaban: {currentCard.answer}</span>
            </div>
          </div>

        </div>
      </div>

      {/* Mastery Feedback Controls */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <span className="text-xs font-bold text-slate-600">
          Apakah kamu sudah hafal kartu ini?
        </span>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            onClick={handleMarkNeedsReview}
            className={`flex-1 sm:flex-none px-4 py-2.5 rounded-xl font-display font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-1.5 cursor-pointer border ${
              isCurrentCardNeedsReview
                ? 'bg-amber-100 text-amber-900 border-amber-300 ring-2 ring-amber-300'
                : 'bg-amber-50 hover:bg-amber-100 text-amber-800 border-amber-200'
            }`}
          >
            <X className="w-4 h-4 text-amber-600" />
            <span>Belum Hafal (Ulangi)</span>
          </button>

          <button
            onClick={handleMarkMastered}
            className={`flex-1 sm:flex-none px-4 py-2.5 rounded-xl font-display font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-1.5 cursor-pointer border ${
              isCurrentCardMastered
                ? 'bg-emerald-600 text-white border-emerald-600 ring-2 ring-emerald-300'
                : 'bg-emerald-50 hover:bg-emerald-600 hover:text-white text-emerald-800 border-emerald-200'
            }`}
          >
            <Check className="w-4 h-4" />
            <span>Sudah Hafal (+1★)</span>
          </button>
        </div>
      </div>

      {/* Flashcard Bottom Navigation Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-2 bg-white p-3 sm:p-4 rounded-2xl border border-slate-200 shadow-xs">
        
        {/* Left: Previous & Flip */}
        <div className="flex items-center gap-2">
          <button
            onClick={handlePrev}
            disabled={currentIndex === 0}
            className="p-3 bg-slate-100 hover:bg-slate-200 disabled:opacity-40 disabled:cursor-not-allowed rounded-xl text-slate-700 transition-colors cursor-pointer flex items-center gap-1 text-xs font-bold"
          >
            <ChevronLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Sebelumnya</span>
          </button>

          <button
            onClick={handleFlip}
            className="px-4 py-3 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-xl transition-colors cursor-pointer flex items-center gap-1.5 text-xs font-bold border border-indigo-200"
          >
            <RotateCw className="w-4 h-4" />
            <span>Balik Kartu</span>
          </button>
        </div>

        {/* Center: Shuffle & Reset Deck */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleToggleShuffle}
            title={isShuffled ? 'Matikan Mode Acak' : 'Nyalakan Mode Acak'}
            className={`px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 border ${
              isShuffled
                ? 'bg-amber-100 text-amber-900 border-amber-300 ring-1 ring-amber-300'
                : 'bg-slate-50 hover:bg-slate-100 text-slate-600 border-slate-200'
            }`}
          >
            <Shuffle className="w-3.5 h-3.5" />
            <span>{isShuffled ? 'Acak (Aktif)' : 'Acak Kartu'}</span>
          </button>

          <button
            onClick={handleResetDeck}
            title="Ulangi dari kartu pertama"
            className="p-2.5 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-xl border border-slate-200 transition-colors cursor-pointer text-xs font-bold"
          >
            <Repeat className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Right: Next */}
        <button
          onClick={handleNext}
          disabled={currentIndex === deck.length - 1}
          className="p-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl transition-colors cursor-pointer flex items-center gap-1 text-xs font-bold shadow-xs"
        >
          <span className="hidden sm:inline">Berikutnya</span>
          <ChevronRight className="w-4 h-4" />
        </button>

      </div>

    </div>
  );
};
