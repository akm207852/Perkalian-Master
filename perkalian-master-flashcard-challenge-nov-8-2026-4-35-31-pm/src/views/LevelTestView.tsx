import React, { useState } from 'react';
import { 
  Trophy, 
  ArrowLeft, 
  CheckCircle2, 
  XCircle, 
  RotateCcw, 
  Star, 
  Sparkles, 
  BookOpen, 
  ArrowRight,
  Flame,
  Award
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Question, StudentProfile, ActiveView, AchievementBadge } from '../types/math';
import { LEVEL_CONFIGS, generateLevelTestQuestions } from '../utils/mathEngine';
import { recordLevelTestResult } from '../utils/storage';
import { sound } from '../utils/sound';
import { Numpad } from '../components/Numpad';

interface LevelTestViewProps {
  levelId: number;
  profile: StudentProfile;
  onUpdateProfile: (updated: StudentProfile) => void;
  onNavigate: (view: ActiveView, extra?: { levelId?: number; groupId?: number }) => void;
  onShowCelebration: (data: {
    title: string;
    subtitle: string;
    badges?: AchievementBadge[];
    starsEarned?: number;
    unlockedLevel?: number;
  }) => void;
}

export const LevelTestView: React.FC<LevelTestViewProps> = ({
  levelId,
  profile,
  onUpdateProfile,
  onNavigate,
  onShowCelebration,
}) => {
  const levelConfig = LEVEL_CONFIGS.find((l) => l.id === levelId) || LEVEL_CONFIGS[0];

  // Test setup
  const [questions, setQuestions] = useState<Question[]>(() => generateLevelTestQuestions(levelId));
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [inputValue, setInputValue] = useState('');
  const [isCompleted, setIsCompleted] = useState(false);

  // Result state
  const [scoreResult, setScoreResult] = useState<{
    correctCount: number;
    score: number;
    passed: boolean;
    missed: Question[];
  } | null>(null);

  const currentQ: Question | undefined = questions[currentIndex];

  const handleRecordAnswer = () => {
    if (!currentQ || inputValue.trim() === '') return;

    const parsed = parseInt(inputValue, 10);
    const updatedAnswers = {
      ...answers,
      [currentQ.id]: parsed,
    };
    setAnswers(updatedAnswers);
    setInputValue('');

    sound.playClick(profile.settings.soundEnabled);

    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      finishTest(updatedAnswers);
    }
  };

  const finishTest = (finalAnswers: Record<string, number>) => {
    let correct = 0;
    const missedList: Question[] = [];

    questions.forEach((q) => {
      const studentAns = finalAnswers[q.id];
      if (studentAns === q.answer) {
        correct++;
      } else {
        missedList.push(q);
      }
    });

    const finalScore = Math.round((correct / questions.length) * 100);
    const isPassed = finalScore >= 80;

    const missedIds = missedList.map((m) => m.id);

    const { updatedProfile, newlyUnlockedLevel, newBadges } = recordLevelTestResult(profile, {
      levelId,
      score: finalScore,
      correct,
      total: questions.length,
      passed: isPassed,
      missedQuestionIds: missedIds,
    });

    onUpdateProfile(updatedProfile);

    setScoreResult({
      correctCount: correct,
      score: finalScore,
      passed: isPassed,
      missed: missedList,
    });
    setIsCompleted(true);

    if (isPassed) {
      sound.playLevelUp(profile.settings.soundEnabled);
      try {
        confetti({
          particleCount: 120,
          spread: 80,
          origin: { y: 0.6 },
        });
      } catch {
        // ignore
      }

      onShowCelebration({
        title: `Selamat! Kamu LULUS ${levelConfig.name}!`,
        subtitle: `Kamu berhasil menjawab ${correct} dari 20 soal dengan benar (Nilai: ${finalScore}%).`,
        badges: newBadges,
        starsEarned: 20,
        unlockedLevel: newlyUnlockedLevel,
      });
    } else {
      sound.playWrong(profile.settings.soundEnabled);
    }
  };

  const handleRetest = () => {
    setQuestions(generateLevelTestQuestions(levelId));
    setCurrentIndex(0);
    setAnswers({});
    setInputValue('');
    setIsCompleted(false);
    setScoreResult(null);
    sound.playClick(profile.settings.soundEnabled);
  };

  // RESULTS SCREEN
  if (isCompleted && scoreResult) {
    const { correctCount, score, passed, missed } = scoreResult;

    return (
      <div className="max-w-xl mx-auto space-y-6 pb-20 md:pb-8 text-center">
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xl">
          
          <div className={`w-20 h-20 mx-auto rounded-3xl flex items-center justify-center mb-4 ${
            passed ? 'bg-emerald-100 text-emerald-600 animate-bounce' : 'bg-rose-100 text-rose-600'
          }`}>
            {passed ? (
              <Trophy className="w-10 h-10 fill-emerald-500" />
            ) : (
              <Flame className="w-10 h-10 text-rose-500" />
            )}
          </div>

          <span className="text-xs font-black uppercase tracking-wider text-slate-400 block mb-1">
            Hasil Tes Akhir · {levelConfig.name} ({levelConfig.rangeText})
          </span>

          <h2 className="font-display font-black text-2xl sm:text-3xl text-slate-900 mb-2">
            {passed ? 'LULUS DENGAN BAIK! 🎉' : 'BELUM LULUS (Minimal 80%)'}
          </h2>

          <p className="text-sm font-semibold text-slate-600 mb-6">
            {passed
              ? `Hebat sekali! Level berikutnya telah terbuka untukmu.`
              : `Kamu menjawab benar ${correctCount} dari 20 soal. Jangan berkecil hati, ayo pelajari soal yang keliru dan coba lagi!`}
          </p>

          {/* Score Box */}
          <div className="grid grid-cols-3 gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-200 mb-6">
            <div>
              <span className="text-xs text-slate-500 block">Nilai Tes</span>
              <span className={`font-display font-black text-3xl tabular-nums ${
                passed ? 'text-emerald-600' : 'text-rose-600'
              }`}>
                {score}%
              </span>
            </div>
            <div>
              <span className="text-xs text-slate-500 block">Benar</span>
              <span className="font-display font-black text-2xl text-slate-900 tabular-nums">
                {correctCount} / 20
              </span>
            </div>
            <div>
              <span className="text-xs text-slate-500 block">Status</span>
              <span className={`font-display font-extrabold text-sm block mt-1 ${
                passed ? 'text-emerald-700' : 'text-rose-700'
              }`}>
                {passed ? '✓ LULUS' : '✗ COBA LAGI'}
              </span>
            </div>
          </div>

          {/* Missed questions list */}
          {missed.length > 0 && (
            <div className="text-left mb-6 p-4 bg-rose-50/70 border border-rose-200 rounded-2xl">
              <span className="text-xs font-extrabold text-rose-800 block mb-2">
                Soal yang perlu dipelajari lagi ({missed.length} Soal):
              </span>
              <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                {missed.map((q) => {
                  const studentAnswer = answers[q.id];
                  return (
                    <div key={q.id} className="p-2.5 bg-white rounded-xl border border-rose-100 text-xs">
                      <div className="flex items-center justify-between font-bold">
                        <span className="text-slate-800">{q.a} × {q.b}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-rose-600">Jawabanmu: {studentAnswer ?? 'Kosong'}</span>
                          <span className="text-emerald-700 font-extrabold">Kunci: {q.answer}</span>
                        </div>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-1">{q.explanation}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => onNavigate('flashcard', { levelId })}
              className="flex-1 py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-display font-bold text-sm rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-1.5"
            >
              <BookOpen className="w-4 h-4" />
              <span>Belajar Flashcard</span>
            </button>

            <button
              onClick={handleRetest}
              className="flex-1 py-3 px-4 bg-purple-600 hover:bg-purple-700 text-white font-display font-extrabold text-sm rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Ulangi Tes</span>
            </button>
          </div>

          {passed && levelId < 10 && (
            <button
              onClick={() => onNavigate('flashcard', { levelId: levelId + 1 })}
              className="mt-3 w-full py-3.5 px-4 bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-display font-extrabold text-sm rounded-xl shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Lanjut ke Level {levelId + 1}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}

        </div>
      </div>
    );
  }

  // ACTIVE TEST EXAM
  const progressPercent = Math.round(((currentIndex + 1) / questions.length) * 100);

  return (
    <div className="max-w-xl mx-auto space-y-4 pb-24 md:pb-10">
      
      {/* Top Header */}
      <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
        <button
          onClick={() => onNavigate('levels')}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-800 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali</span>
        </button>

        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-500">Soal Tes:</span>
          <span className="font-display font-black text-base text-purple-700 tabular-nums">
            {currentIndex + 1} / {questions.length}
          </span>
        </div>

        <div className="text-xs font-bold text-purple-700 bg-purple-50 px-2.5 py-1 rounded-lg">
          {levelConfig.name}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
        <div
          className="h-full bg-purple-600 rounded-full transition-all duration-300"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* Question Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-purple-200 text-center shadow-md relative overflow-hidden">
        <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-purple-700 bg-purple-50 max-w-fit mx-auto px-3 py-1 rounded-full mb-3">
          <Award className="w-3.5 h-3.5" />
          <span>Uji Kelulusan (Kunci Jawaban Disembunyikan)</span>
        </div>

        <div className="font-display font-black text-5xl sm:text-6xl text-slate-900 flex items-center justify-center gap-3 sm:gap-4 my-4">
          <span className="text-purple-700">{currentQ?.a}</span>
          <span className="text-amber-500 font-light">×</span>
          <span className="text-indigo-700">{currentQ?.b}</span>
          <span className="text-slate-400 font-light">=</span>
          <span className="min-w-[80px] sm:min-w-[100px] border-b-4 border-purple-400 text-slate-950 inline-block font-mono">
            {inputValue || <span className="text-slate-300 font-light">?</span>}
          </span>
        </div>
        <p className="text-xs text-slate-500">
          Masukkan jawaban dengan teliti, lalu tekan SIMPAN JAWABAN.
        </p>
      </div>

      {/* Numpad */}
      <Numpad
        value={inputValue}
        onChange={setInputValue}
        onSubmit={handleRecordAnswer}
        disabled={false}
        submitLabel={currentIndex === questions.length - 1 ? 'SELESAIKAN TES' : 'SIMPAN & LANJUT'}
      />

    </div>
  );
};
