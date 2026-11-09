import React, { useState, useEffect, useRef } from 'react';
import { 
  Zap, 
  Clock, 
  RotateCcw, 
  ArrowLeft, 
  Trophy, 
  Star, 
  Flame, 
  CheckCircle2, 
  XCircle, 
  Sparkles,
  ArrowRight
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Question, StudentProfile, ActiveView, ChallengeRecord } from '../types/math';
import { ALL_QUESTIONS, shuffleArray } from '../utils/mathEngine';
import { recordChallengeResult } from '../utils/storage';
import { sound } from '../utils/sound';
import { Numpad } from '../components/Numpad';

interface ChallengeViewProps {
  profile: StudentProfile;
  onUpdateProfile: (updated: StudentProfile) => void;
  onNavigate: (view: ActiveView) => void;
}

export const ChallengeView: React.FC<ChallengeViewProps> = ({
  profile,
  onUpdateProfile,
  onNavigate,
}) => {
  // Configuration states
  const [isConfiguring, setIsConfiguring] = useState(true);
  const [questionCount, setQuestionCount] = useState<10 | 20 | 50>(10);
  const [speedMode, setSpeedMode] = useState<'santai' | 'cepat' | 'kilat'>('cepat');

  // Game active states
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [inputValue, setInputValue] = useState('');
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [incorrectCount, setIncorrectCount] = useState(0);

  // Timing states
  const [timeLeft, setTimeLeft] = useState<number>(10);
  const [totalElapsedTimeSec, setTotalElapsedTimeSec] = useState<number>(0);
  const [isGameOver, setIsGameOver] = useState(false);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const totalTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Maximum time per question based on mode
  const maxQuestionTime = speedMode === 'kilat' ? 5 : speedMode === 'cepat' ? 10 : 0;

  // Start the challenge
  const handleStartChallenge = () => {
    // Pick questions from unlocked levels
    const eligibleQuestions = ALL_QUESTIONS.filter((q) =>
      profile.unlockedLevels.includes(q.levelId)
    );
    const pool = eligibleQuestions.length >= questionCount ? eligibleQuestions : ALL_QUESTIONS;
    const shuffled = shuffleArray(pool).slice(0, questionCount);

    setQuestions(shuffled);
    setCurrentIndex(0);
    setInputValue('');
    setScore(0);
    setStreak(0);
    setCorrectCount(0);
    setIncorrectCount(0);
    setTotalElapsedTimeSec(0);
    setTimeLeft(maxQuestionTime);
    setIsGameOver(false);
    setIsConfiguring(false);

    sound.playClick(profile.settings.soundEnabled);
  };

  // Timer loop for per-question countdown (for 'cepat' and 'kilat')
  useEffect(() => {
    if (isConfiguring || isGameOver || maxQuestionTime === 0) return;

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          // Time expired for this question
          handleTimeExpired();
          return maxQuestionTime;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isConfiguring, isGameOver, currentIndex, maxQuestionTime]);

  // Overall stopwatch timer
  useEffect(() => {
    if (isConfiguring || isGameOver) return;

    totalTimerRef.current = setInterval(() => {
      setTotalElapsedTimeSec((prev) => prev + 1);
    }, 1000);

    return () => {
      if (totalTimerRef.current) clearInterval(totalTimerRef.current);
    };
  }, [isConfiguring, isGameOver]);

  const currentQ: Question | undefined = questions[currentIndex];

  const handleTimeExpired = () => {
    sound.playWrong(profile.settings.soundEnabled);
    setIncorrectCount((prev) => prev + 1);
    setStreak(0);
    advanceToNext(false);
  };

  const handleAnswerSubmit = () => {
    if (!currentQ || inputValue.trim() === '') return;

    const parsed = parseInt(inputValue, 10);
    const isCorrect = parsed === currentQ.answer;

    if (isCorrect) {
      sound.playCorrect(profile.settings.soundEnabled);
      const newStreak = streak + 1;
      setStreak(newStreak);
      setCorrectCount((prev) => prev + 1);

      // Score formula: 100 base + remaining time bonus * 10 + streak bonus * 20
      const timeBonus = maxQuestionTime > 0 ? timeLeft * 15 : 20;
      const streakBonus = Math.min(newStreak * 25, 200);
      const points = 100 + timeBonus + streakBonus;
      setScore((prev) => prev + points);
    } else {
      sound.playWrong(profile.settings.soundEnabled);
      setStreak(0);
      setIncorrectCount((prev) => prev + 1);
    }

    advanceToNext(isCorrect);
  };

  const advanceToNext = (wasCorrect: boolean) => {
    setInputValue('');
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setTimeLeft(maxQuestionTime);
    } else {
      finishGame(wasCorrect);
    }
  };

  const finishGame = (lastWasCorrect: boolean) => {
    setIsGameOver(true);
    sound.playLevelUp(profile.settings.soundEnabled);

    if (timerRef.current) clearInterval(timerRef.current);
    if (totalTimerRef.current) clearInterval(totalTimerRef.current);

    const finalCorrect = correctCount + (lastWasCorrect ? 1 : 0);
    const finalAccuracy = Math.round((finalCorrect / questions.length) * 100);
    const avgTime = questions.length > 0 ? parseFloat((totalElapsedTimeSec / questions.length).toFixed(1)) : 0;

    let predicate = 'Cukup Baik';
    if (finalAccuracy >= 95 && (speedMode === 'kilat' || avgTime <= 4)) {
      predicate = 'Master Kilat Perkalian! ⚡';
    } else if (finalAccuracy >= 90) {
      predicate = 'Bintang Matematika! ⭐';
    } else if (finalAccuracy >= 80) {
      predicate = 'Hebat & Tangkas! 🚀';
    } else if (finalAccuracy >= 60) {
      predicate = 'Bagus, Terus Tingkatkan! 🎯';
    }

    const { updatedProfile: updated } = recordChallengeResult(profile, {
      questionCount: questions.length,
      speedMode,
      correct: finalCorrect,
      totalTimeSec: totalElapsedTimeSec,
      avgTimeSec: avgTime,
      score,
      accuracy: finalAccuracy,
      predicate,
    });

    onUpdateProfile(updated);

    try {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });
    } catch {
      // ignore
    }
  };

  // CONFIGURATION SCREEN
  if (isConfiguring) {
    return (
      <div className="max-w-2xl mx-auto space-y-6 pb-20 md:pb-8">
        
        {/* Banner */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-50 text-amber-800 text-xs font-bold rounded-full mb-3">
            <Zap className="w-3.5 h-3.5 text-amber-600" />
            <span>Tantangan Kecepatan Berhitung</span>
          </div>
          <h1 className="font-display font-black text-2xl sm:text-3xl text-slate-900">
            Mode Tantangan Waktu
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Uji refleks dan ketepatan perkalianmu dalam adu kecepatan seru!
          </p>
        </div>

        {/* Setting 1: Jumlah Soal */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-3">
          <label className="text-sm font-extrabold text-slate-800 flex items-center gap-2">
            <Clock className="w-4 h-4 text-amber-600" />
            <span>Pilih Jumlah Soal:</span>
          </label>
          <div className="grid grid-cols-3 gap-3">
            {[10, 20, 50].map((num) => (
              <button
                key={num}
                type="button"
                onClick={() => setQuestionCount(num as 10 | 20 | 50)}
                className={`py-3.5 px-4 rounded-2xl font-display font-extrabold text-base transition-all cursor-pointer border-2 ${
                  questionCount === num
                    ? 'bg-amber-500 text-slate-950 border-amber-500 shadow-sm'
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                }`}
              >
                {num} Soal
              </button>
            ))}
          </div>
        </div>

        {/* Setting 2: Tingkat Kecepatan */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
          <label className="text-sm font-extrabold text-slate-800 flex items-center gap-2">
            <Flame className="w-4 h-4 text-amber-600" />
            <span>Pilih Tingkat Kecepatan:</span>
          </label>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            
            {/* Santai */}
            <button
              type="button"
              onClick={() => setSpeedMode('santai')}
              className={`p-4 rounded-2xl text-left border-2 transition-all cursor-pointer ${
                speedMode === 'santai'
                  ? 'bg-blue-50 text-blue-900 border-blue-500 shadow-xs'
                  : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
              }`}
            >
              <div className="font-display font-extrabold text-base">1. Santai</div>
              <div className="text-xs text-slate-500 mt-1">Tanpa batas waktu per soal. Timer menghitung total waktu saja.</div>
            </button>

            {/* Cepat */}
            <button
              type="button"
              onClick={() => setSpeedMode('cepat')}
              className={`p-4 rounded-2xl text-left border-2 transition-all cursor-pointer ${
                speedMode === 'cepat'
                  ? 'bg-amber-50 text-amber-950 border-amber-500 shadow-xs'
                  : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
              }`}
            >
              <div className="font-display font-extrabold text-base">2. Cepat (10s)</div>
              <div className="text-xs text-slate-500 mt-1">Batas waktu 10 detik per soal. Cocok untuk menguji refleks.</div>
            </button>

            {/* Kilat */}
            <button
              type="button"
              onClick={() => setSpeedMode('kilat')}
              className={`p-4 rounded-2xl text-left border-2 transition-all cursor-pointer ${
                speedMode === 'kilat'
                  ? 'bg-rose-50 text-rose-950 border-rose-500 shadow-xs'
                  : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
              }`}
            >
              <div className="font-display font-extrabold text-base">3. Kilat (5s) ⚡</div>
              <div className="text-xs text-slate-500 mt-1">Hanya 5 detik per soal! Untuk para master perkalian sejati.</div>
            </button>

          </div>
        </div>

        {/* Start Button */}
        <button
          onClick={handleStartChallenge}
          className="w-full py-4 px-6 bg-linear-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-600 hover:to-orange-600 text-slate-950 font-display font-black text-lg rounded-2xl shadow-lg hover:shadow-xl active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          <Zap className="w-5 h-5 fill-slate-950" />
          <span>MULAI TANTANGAN ({questionCount} SOAL)</span>
        </button>

      </div>
    );
  }

  // RESULTS SCREEN
  if (isGameOver) {
    const accuracy = Math.round((correctCount / questions.length) * 100);
    const avgTime = questions.length > 0 ? (totalElapsedTimeSec / questions.length).toFixed(1) : '0';

    let predicate = 'Cukup Baik';
    if (accuracy >= 95 && (speedMode === 'kilat' || Number(avgTime) <= 4)) {
      predicate = 'Master Kilat Perkalian! ⚡';
    } else if (accuracy >= 90) {
      predicate = 'Bintang Matematika! ⭐';
    } else if (accuracy >= 80) {
      predicate = 'Hebat & Tangkas! 🚀';
    } else if (accuracy >= 60) {
      predicate = 'Bagus, Terus Tingkatkan! 🎯';
    }

    return (
      <div className="max-w-xl mx-auto space-y-6 pb-20 md:pb-8 text-center">
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xl">
          
          <div className="w-20 h-20 mx-auto rounded-3xl bg-amber-100 flex items-center justify-center text-amber-600 mb-4 animate-bounce">
            <Trophy className="w-10 h-10 fill-amber-400" />
          </div>

          <h2 className="font-display font-black text-2xl sm:text-3xl text-slate-900 mb-1">
            Tantangan Selesai!
          </h2>
          <div className="inline-block px-4 py-1.5 bg-amber-100 text-amber-900 font-display font-extrabold text-sm rounded-full mb-6">
            Predikat: {predicate}
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-200 mb-6">
            <div>
              <span className="text-xs text-slate-500 block">Total Soal</span>
              <span className="font-display font-black text-xl text-slate-900 tabular-nums">
                {questions.length}
              </span>
            </div>
            <div>
              <span className="text-xs text-slate-500 block">Benar</span>
              <span className="font-display font-black text-xl text-emerald-600 tabular-nums">
                {correctCount}
              </span>
            </div>
            <div>
              <span className="text-xs text-slate-500 block">Salah</span>
              <span className="font-display font-black text-xl text-rose-600 tabular-nums">
                {incorrectCount}
              </span>
            </div>
            <div>
              <span className="text-xs text-slate-500 block">Akurasi</span>
              <span className="font-display font-black text-xl text-blue-600 tabular-nums">
                {accuracy}%
              </span>
            </div>
          </div>

          {/* Timing details */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            <div className="p-3 bg-blue-50/60 rounded-2xl border border-blue-200 text-left">
              <span className="text-xs text-slate-500 block font-medium">Total Waktu:</span>
              <span className="font-display font-extrabold text-base text-blue-800">
                {totalElapsedTimeSec} detik
              </span>
            </div>
            <div className="p-3 bg-amber-50/60 rounded-2xl border border-amber-200 text-left">
              <span className="text-xs text-slate-500 block font-medium">Rata-rata / Soal:</span>
              <span className="font-display font-extrabold text-base text-amber-900">
                {avgTime} detik
              </span>
            </div>
          </div>

          {/* Final Score */}
          <div className="mb-6 p-4 bg-linear-to-r from-amber-50 to-yellow-50 border border-amber-300 rounded-2xl">
            <span className="text-xs font-bold text-amber-700 block">Total Skor Kamu:</span>
            <span className="font-display font-black text-3xl sm:text-4xl text-amber-950 tabular-nums">
              {score} Poin
            </span>
          </div>

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => {
                setIsGameOver(false);
                setIsConfiguring(true);
              }}
              className="flex-1 py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-display font-bold text-sm rounded-xl transition-colors cursor-pointer"
            >
              Ganti Pengaturan
            </button>

            <button
              onClick={handleStartChallenge}
              className="flex-1 py-3 px-4 bg-amber-500 hover:bg-amber-600 text-slate-950 font-display font-extrabold text-sm rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              <span>ULANGI TANTANGAN</span>
            </button>
          </div>

        </div>
      </div>
    );
  }

  // ACTIVE CHALLENGE GAMEPLAY
  const timerPercent = maxQuestionTime > 0 ? (timeLeft / maxQuestionTime) * 100 : 100;

  return (
    <div className="max-w-xl mx-auto space-y-4 pb-24 md:pb-10">
      
      {/* Top Header: Score, Streak, Soal Counter */}
      <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
        <button
          onClick={() => {
            if (timerRef.current) clearInterval(timerRef.current);
            if (totalTimerRef.current) clearInterval(totalTimerRef.current);
            setIsConfiguring(true);
          }}
          className="text-xs font-bold text-slate-400 hover:text-slate-700 cursor-pointer"
        >
          ✕ Keluar
        </button>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 text-xs font-bold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-lg">
            <Flame className="w-4 h-4 text-amber-500" />
            <span>Streak: {streak}×</span>
          </div>

          <div className="text-xs font-bold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-lg tabular-nums">
            Skor: {score}
          </div>
        </div>

        <div className="text-xs font-bold text-slate-700 tabular-nums">
          {currentIndex + 1} / {questions.length}
        </div>
      </div>

      {/* Countdown Timer Bar (For 'cepat' and 'kilat') */}
      {maxQuestionTime > 0 && (
        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs font-bold px-1">
            <span className="text-slate-500 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" /> Sisa Waktu Soal:
            </span>
            <span className={`font-mono text-sm tabular-nums ${timeLeft <= 2 ? 'text-rose-600 animate-pulse font-black' : 'text-slate-800'}`}>
              {timeLeft} detik
            </span>
          </div>
          <div className="w-full h-3 bg-slate-200 rounded-full overflow-hidden p-0.5">
            <div
              className={`h-full rounded-full transition-all duration-300 ${
                timeLeft <= 2 ? 'bg-rose-500' : timeLeft <= 4 ? 'bg-amber-500' : 'bg-emerald-500'
              }`}
              style={{ width: `${timerPercent}%` }}
            />
          </div>
        </div>
      )}

      {/* Big Question Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-amber-200 text-center shadow-md relative overflow-hidden">
        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">
          {currentQ?.groupName}
        </span>

        <div className="font-display font-black text-5xl sm:text-6xl text-slate-900 flex items-center justify-center gap-3 sm:gap-4 my-4">
          <span className="text-blue-700">{currentQ?.a}</span>
          <span className="text-amber-500 font-light">×</span>
          <span className="text-indigo-700">{currentQ?.b}</span>
          <span className="text-slate-400 font-light">=</span>
          <span className="min-w-[80px] sm:min-w-[100px] border-b-4 border-amber-400 text-slate-950 inline-block font-mono">
            {inputValue || <span className="text-slate-300 font-light">?</span>}
          </span>
        </div>
      </div>

      {/* Virtual Numpad */}
      <Numpad
        value={inputValue}
        onChange={setInputValue}
        onSubmit={handleAnswerSubmit}
        disabled={false}
        submitLabel="KIRIM JAWABAN"
      />

    </div>
  );
};
