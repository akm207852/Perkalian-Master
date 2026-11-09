import React, { useState } from 'react';
import { 
  PenTool, 
  CheckCircle2, 
  XCircle, 
  Star, 
  Sparkles, 
  RotateCcw, 
  ArrowRight, 
  Check, 
  BookOpen,
  SlidersHorizontal,
  Flame
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Question, StudentProfile, ActiveView } from '../types/math';
import { 
  LEVEL_CONFIGS, 
  ALL_QUESTIONS, 
  generatePracticeQuestions 
} from '../utils/mathEngine';
import { recordPracticeAnswer } from '../utils/storage';
import { sound } from '../utils/sound';
import { Numpad } from '../components/Numpad';

interface PracticeViewProps {
  profile: StudentProfile;
  onUpdateProfile: (updated: StudentProfile) => void;
  onNavigate: (view: ActiveView, extra?: { levelId?: number; groupId?: number }) => void;
}

export const PracticeView: React.FC<PracticeViewProps> = ({
  profile,
  onUpdateProfile,
  onNavigate,
}) => {
  // Practice configuration states
  const [isConfiguring, setIsConfiguring] = useState(true);
  const [questionCount, setQuestionCount] = useState<number>(10);
  const [sourceType, setSourceType] = useState<'group' | 'level' | 'all_unlocked'>('level');
  const [selectedLevelId, setSelectedLevelId] = useState<number>(profile.unlockedLevels[0] || 1);
  const [selectedGroupId, setSelectedGroupId] = useState<number>(1);

  // Active session states
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [inputValue, setInputValue] = useState('');
  const [feedback, setFeedback] = useState<{
    status: 'correct' | 'incorrect';
    message: string;
    correctAnswer: number;
    explanation: string;
  } | null>(null);

  // Session results tracker
  const [correctCount, setCorrectCount] = useState(0);
  const [incorrectQuestions, setIncorrectQuestions] = useState<Question[]>([]);
  const [isFinished, setIsFinished] = useState(false);

  // Start a new practice session
  const handleStartPractice = () => {
    const sourceId = sourceType === 'group' ? selectedGroupId : selectedLevelId;
    const generated = generatePracticeQuestions(
      sourceType,
      sourceId,
      questionCount,
      profile.unlockedLevels
    );

    setQuestions(generated);
    setCurrentIndex(0);
    setInputValue('');
    setFeedback(null);
    setCorrectCount(0);
    setIncorrectQuestions([]);
    setIsFinished(false);
    setIsConfiguring(false);
    sound.playClick(profile.settings.soundEnabled);
  };

  const currentQ: Question | undefined = questions[currentIndex];

  const handleCheckAnswer = () => {
    if (!currentQ || inputValue.trim() === '' || feedback) return;

    const parsed = parseInt(inputValue, 10);
    const isCorrect = parsed === currentQ.answer;

    if (isCorrect) {
      sound.playCorrect(profile.settings.soundEnabled);
      setCorrectCount((prev) => prev + 1);
      setFeedback({
        status: 'correct',
        message: 'Hebat! Jawabanmu tepat sekali!',
        correctAnswer: currentQ.answer,
        explanation: `${currentQ.a} × ${currentQ.b} = ${currentQ.answer}`,
      });
      // Mini confetti on correct
      try {
        confetti({
          particleCount: 30,
          spread: 45,
          origin: { y: 0.7 },
        });
      } catch {
        // ignore
      }
    } else {
      sound.playWrong(profile.settings.soundEnabled);
      setIncorrectQuestions((prev) => [...prev, currentQ]);
      setFeedback({
        status: 'incorrect',
        message: 'Belum tepat, jangan menyerah ya!',
        correctAnswer: currentQ.answer,
        explanation: `${currentQ.a} × ${currentQ.b} = ${currentQ.answer}. ${currentQ.explanation}`,
      });
    }

    // Record answer in profile stats & mastery
    const updated = recordPracticeAnswer(profile, currentQ.id, isCorrect);
    onUpdateProfile(updated);
  };

  const handleNextQuestion = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setInputValue('');
      setFeedback(null);
      sound.playClick(profile.settings.soundEnabled);
    } else {
      // Completed session
      sound.playLevelUp(profile.settings.soundEnabled);
      setIsFinished(true);
      try {
        confetti({
          particleCount: 80,
          spread: 60,
          origin: { y: 0.6 },
        });
      } catch {
        // ignore
      }
    }
  };

  // CONFIGURATION SCREEN
  if (isConfiguring) {
    return (
      <div className="max-w-2xl mx-auto space-y-6 pb-20 md:pb-8">
        
        {/* Banner */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-full mb-3">
            <PenTool className="w-3.5 h-3.5" />
            <span>Mode Latihan Mandiri</span>
          </div>
          <h1 className="font-display font-black text-2xl sm:text-3xl text-slate-900">
            Atur Sesi Latihanmu
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Pilih jumlah soal dan materi perkalian yang ingin kamu latih.
          </p>
        </div>

        {/* Setting 1: Jumlah Soal */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-3">
          <label className="text-sm font-extrabold text-slate-800 flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-emerald-600" />
            <span>Pilih Jumlah Soal:</span>
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
            {[10, 20, 50, 100].map((num) => (
              <button
                key={num}
                type="button"
                onClick={() => setQuestionCount(num)}
                className={`py-3 px-4 rounded-2xl font-display font-extrabold text-base transition-all cursor-pointer border-2 ${
                  questionCount === num
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                }`}
              >
                {num} Soal
              </button>
            ))}
          </div>
        </div>

        {/* Setting 2: Sumber Soal */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
          <label className="text-sm font-extrabold text-slate-800 flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-emerald-600" />
            <span>Pilih Sumber Soal:</span>
          </label>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => setSourceType('level')}
              className={`p-3.5 rounded-2xl text-left border-2 transition-all cursor-pointer ${
                sourceType === 'level'
                  ? 'bg-emerald-50 text-emerald-900 border-emerald-500 font-bold'
                  : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
              }`}
            >
              <div className="text-sm font-extrabold">Satu Level</div>
              <div className="text-[11px] text-slate-500 mt-0.5">100 soal dalam level</div>
            </button>

            <button
              type="button"
              onClick={() => setSourceType('group')}
              className={`p-3.5 rounded-2xl text-left border-2 transition-all cursor-pointer ${
                sourceType === 'group'
                  ? 'bg-emerald-50 text-emerald-900 border-emerald-500 font-bold'
                  : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
              }`}
            >
              <div className="text-sm font-extrabold">Satu Kelompok</div>
              <div className="text-[11px] text-slate-500 mt-0.5">Fokus 1 perkalian saja</div>
            </button>

            <button
              type="button"
              onClick={() => setSourceType('all_unlocked')}
              className={`p-3.5 rounded-2xl text-left border-2 transition-all cursor-pointer ${
                sourceType === 'all_unlocked'
                  ? 'bg-emerald-50 text-emerald-900 border-emerald-500 font-bold'
                  : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
              }`}
            >
              <div className="text-sm font-extrabold">Semua Level Terbuka</div>
              <div className="text-[11px] text-slate-500 mt-0.5">Campuran acak</div>
            </button>
          </div>

          {/* Sub Selector for Level */}
          {sourceType === 'level' && (
            <div className="pt-2">
              <span className="text-xs font-bold text-slate-600 block mb-2">Pilih Level:</span>
              <select
                value={selectedLevelId}
                onChange={(e) => setSelectedLevelId(Number(e.target.value))}
                className="w-full p-3 bg-slate-50 border-2 border-slate-200 rounded-xl font-bold text-slate-800 focus:outline-hidden focus:border-emerald-500"
              >
                {LEVEL_CONFIGS.map((lvl) => {
                  const isUnlocked = profile.unlockedLevels.includes(lvl.id);
                  return (
                    <option key={lvl.id} value={lvl.id} disabled={!isUnlocked}>
                      {lvl.name} ({lvl.rangeText}) {!isUnlocked ? '🔒 Terkunci' : '✓ Terbuka'}
                    </option>
                  );
                })}
              </select>
            </div>
          )}

          {/* Sub Selector for Group */}
          {sourceType === 'group' && (
            <div className="pt-2">
              <span className="text-xs font-bold text-slate-600 block mb-2">
                Pilih Kelompok Perkalian:
              </span>
              <select
                value={selectedGroupId}
                onChange={(e) => setSelectedGroupId(Number(e.target.value))}
                className="w-full p-3 bg-slate-50 border-2 border-slate-200 rounded-xl font-bold text-slate-800 focus:outline-hidden focus:border-emerald-500"
              >
                {Array.from({ length: 100 }, (_, i) => i + 1).map((val) => (
                  <option key={val} value={val}>
                    Perkalian {val} ({val} × 1 s.d. {val} × 10)
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Start Button */}
        <button
          onClick={handleStartPractice}
          className="w-full py-4 px-6 bg-emerald-600 hover:bg-emerald-700 text-white font-display font-black text-lg rounded-2xl shadow-lg hover:shadow-xl active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          <PenTool className="w-5 h-5" />
          <span>MULAI LATIHAN ({questionCount} SOAL)</span>
        </button>

      </div>
    );
  }

  // RESULTS SCREEN
  if (isFinished) {
    const accuracy = Math.round((correctCount / questions.length) * 100);
    const starsEarned = Math.round(correctCount / 2);

    return (
      <div className="max-w-xl mx-auto space-y-6 pb-20 md:pb-8 text-center">
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xl">
          
          <div className="w-20 h-20 mx-auto rounded-3xl bg-amber-100 flex items-center justify-center text-amber-600 mb-4 animate-bounce">
            <Star className="w-10 h-10 fill-amber-400" />
          </div>

          <h2 className="font-display font-black text-2xl sm:text-3xl text-slate-900 mb-1">
            Latihan Selesai! 🎉
          </h2>
          <p className="text-sm font-semibold text-slate-500 mb-6">
            Kerja bagus! Terus berlatih agar perkalianmu semakin lancar.
          </p>

          {/* Results Score Box */}
          <div className="grid grid-cols-3 gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-200 mb-6">
            <div>
              <span className="text-xs text-slate-500 block">Benar</span>
              <span className="font-display font-black text-2xl text-emerald-600 tabular-nums">
                {correctCount}
              </span>
            </div>
            <div>
              <span className="text-xs text-slate-500 block">Salah</span>
              <span className="font-display font-black text-2xl text-rose-600 tabular-nums">
                {questions.length - correctCount}
              </span>
            </div>
            <div>
              <span className="text-xs text-slate-500 block">Akurasi</span>
              <span className="font-display font-black text-2xl text-blue-600 tabular-nums">
                {accuracy}%
              </span>
            </div>
          </div>

          {/* Star Reward */}
          <div className="mb-6 p-3 bg-amber-50 border border-amber-200 rounded-2xl inline-flex items-center gap-2 text-amber-800 font-extrabold text-sm">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>Kamu mendapatkan +{starsEarned} Bintang Belajar!</span>
          </div>

          {/* List of Incorrect questions to review if any */}
          {incorrectQuestions.length > 0 && (
            <div className="mb-6 text-left p-4 bg-rose-50/70 border border-rose-200 rounded-2xl">
              <span className="text-xs font-bold text-rose-800 block mb-2">
                Soal yang perlu kamu pelajari lagi:
              </span>
              <div className="space-y-1.5 max-h-48 overflow-y-auto">
                {incorrectQuestions.map((q) => (
                  <div key={q.id} className="text-xs font-semibold text-slate-700 bg-white p-2 rounded-lg border border-rose-100 flex justify-between">
                    <span>{q.a} × {q.b}</span>
                    <span className="font-bold text-emerald-700">Jawaban: {q.answer}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => {
                setIsFinished(false);
                setIsConfiguring(true);
              }}
              className="flex-1 py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-display font-bold text-sm rounded-xl transition-colors cursor-pointer"
            >
              Ganti Pengaturan
            </button>

            <button
              onClick={handleStartPractice}
              className="flex-1 py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-display font-extrabold text-sm rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Ulangi Latihan</span>
            </button>
          </div>

        </div>
      </div>
    );
  }

  // ACTIVE QUESTION SCREEN
  const progressPercent = Math.round(((currentIndex + 1) / questions.length) * 100);

  return (
    <div className="max-w-xl mx-auto space-y-4 pb-24 md:pb-10">
      
      {/* Top Header: Progress and Quit Button */}
      <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
        <button
          onClick={() => setIsConfiguring(true)}
          className="text-xs font-bold text-slate-500 hover:text-slate-800 cursor-pointer"
        >
          ✕ Batalkan Latihan
        </button>

        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-500">Soal:</span>
          <span className="font-display font-black text-base text-emerald-700 tabular-nums">
            {currentIndex + 1} / {questions.length}
          </span>
        </div>

        <div className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg">
          Benar: {correctCount}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
        <div
          className="h-full bg-emerald-500 rounded-full transition-all duration-300"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* Main Question Display Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-emerald-100 text-center shadow-md relative overflow-hidden">
        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">
          {currentQ?.groupName}
        </span>

        {/* Big Equation */}
        <div className="font-display font-black text-5xl sm:text-6xl text-slate-900 flex items-center justify-center gap-3 sm:gap-4 my-3">
          <span className="text-emerald-700">{currentQ?.a}</span>
          <span className="text-amber-500 font-light">×</span>
          <span className="text-indigo-700">{currentQ?.b}</span>
          <span className="text-slate-400 font-light">=</span>
          <span className="min-w-[80px] sm:min-w-[100px] border-b-4 border-emerald-400 text-emerald-950 inline-block font-mono">
            {inputValue || <span className="text-slate-300 font-light">?</span>}
          </span>
        </div>

        {/* Inline Feedback Banner when answered */}
        {feedback && (
          <div
            className={`mt-4 p-4 rounded-2xl text-left border animate-in zoom-in-95 duration-200 ${
              feedback.status === 'correct'
                ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                : 'bg-rose-50 border-rose-300 text-rose-900'
            }`}
          >
            <div className="flex items-center gap-2 font-display font-extrabold text-base mb-1">
              {feedback.status === 'correct' ? (
                <>
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  <span>{feedback.message}</span>
                </>
              ) : (
                <>
                  <XCircle className="w-5 h-5 text-rose-600" />
                  <span>{feedback.message}</span>
                </>
              )}
            </div>
            <p className="text-xs font-semibold">{feedback.explanation}</p>

            <button
              onClick={handleNextQuestion}
              className="mt-3 w-full py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white font-display font-bold text-sm rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs"
            >
              <span>{currentIndex === questions.length - 1 ? 'Lihat Hasil' : 'Soal Berikutnya'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Touch-Friendly Numpad (Disabled when feedback is active) */}
      {!feedback && (
        <Numpad
          value={inputValue}
          onChange={setInputValue}
          onSubmit={handleCheckAnswer}
          disabled={false}
          submitLabel="PERIKSA JAWABAN"
        />
      )}

    </div>
  );
};
