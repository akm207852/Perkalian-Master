import { Question, LevelInfo } from '../types/math';

export const LEVEL_CONFIGS: Omit<LevelInfo, 'unlocked'>[] = [
  {
    id: 1,
    name: 'Level 1',
    startNum: 1,
    endNum: 10,
    rangeText: 'Perkalian 1–10',
    totalCards: 100,
    groupsCount: 10,
    color: 'from-blue-500 to-indigo-600',
    badgeName: 'Pemula Tangkas',
  },
  {
    id: 2,
    name: 'Level 2',
    startNum: 11,
    endNum: 20,
    rangeText: 'Perkalian 11–20',
    totalCards: 100,
    groupsCount: 10,
    color: 'from-emerald-500 to-teal-600',
    badgeName: 'Penjelajah Puluhan',
  },
  {
    id: 3,
    name: 'Level 3',
    startNum: 21,
    endNum: 30,
    rangeText: 'Perkalian 21–30',
    totalCards: 100,
    groupsCount: 10,
    color: 'from-amber-500 to-orange-600',
    badgeName: 'Ksatria Hitung',
  },
  {
    id: 4,
    name: 'Level 4',
    startNum: 31,
    endNum: 40,
    rangeText: 'Perkalian 31–40',
    totalCards: 100,
    groupsCount: 10,
    color: 'from-purple-500 to-pink-600',
    badgeName: 'Ahli Aljabar Cilik',
  },
  {
    id: 5,
    name: 'Level 5',
    startNum: 41,
    endNum: 50,
    rangeText: 'Perkalian 41–50',
    totalCards: 100,
    groupsCount: 10,
    color: 'from-cyan-500 to-blue-600',
    badgeName: 'Bintang Paruh Jalan',
  },
  {
    id: 6,
    name: 'Level 6',
    startNum: 51,
    endNum: 60,
    rangeText: 'Perkalian 51–60',
    totalCards: 100,
    groupsCount: 10,
    color: 'from-rose-500 to-red-600',
    badgeName: 'Penakluk Angka Enam',
  },
  {
    id: 7,
    name: 'Level 7',
    startNum: 61,
    endNum: 70,
    rangeText: 'Perkalian 61–70',
    totalCards: 100,
    groupsCount: 10,
    color: 'from-violet-500 to-indigo-700',
    badgeName: 'Pakar Perkalian',
  },
  {
    id: 8,
    name: 'Level 8',
    startNum: 71,
    endNum: 80,
    rangeText: 'Perkalian 71–80',
    totalCards: 100,
    groupsCount: 10,
    color: 'from-amber-600 to-yellow-600',
    badgeName: 'Master Kecepatan',
  },
  {
    id: 9,
    name: 'Level 9',
    startNum: 81,
    endNum: 90,
    rangeText: 'Perkalian 81–90',
    totalCards: 100,
    groupsCount: 10,
    color: 'from-teal-600 to-cyan-700',
    badgeName: 'Juara Sembilan Puluh',
  },
  {
    id: 10,
    name: 'Level 10',
    startNum: 91,
    endNum: 100,
    rangeText: 'Perkalian 91–100',
    totalCards: 100,
    groupsCount: 10,
    color: 'from-fuchsia-600 to-purple-800',
    badgeName: 'Multiplication Master 100',
  },
];

// Generates helpful tips tailored for children
function generateMultiplicationTip(a: number, b: number): string {
  if (b === 1) return 'Perkalian dengan 1 selalu menghasilkan angka itu sendiri!';
  if (b === 10) return `Cukup tambahkan angka 0 di belakang ${a}, jadi ${a * 10}!`;
  if (b === 2) return `Mengalikan dengan 2 sama saja dengan menambahkan angka itu ke dirinya sendiri: ${a} + ${a} = ${a * 2}.`;
  if (b === 5) return `Tips cepat × 5: Kalikan dengan 10 (${a * 10}), lalu bagi 2!`;
  if (b === 9 && a <= 10) return `Tips × 9: Jumlah digit dari jawabannya selalu 9! (${Math.floor((a * 9) / 10)} + ${(a * 9) % 10} = 9)`;
  
  if (a > 10) {
    const tens = Math.floor(a / 10) * 10;
    const ones = a % 10;
    if (ones === 0) {
      return `Karena ${a} berakhiran 0, kalikan ${tens / 10} × ${b} = ${(tens / 10) * b}, lalu beri 0 di belakang!`;
    }
    return `Trik pecah angka: (${tens} × ${b}) + (${ones} × ${b}) = ${tens * b} + ${ones * b} = ${a * b}.`;
  }

  if (a === b) return `Perkalian kembar (kuadrat): ${a} dikali ${a} sama dengan ${a * b}!`;

  return `${a} dikali ${b} artinya menjumlahkan ${b} sebanyak ${a} kali, atau sebaliknya!`;
}

// Generate the visual addition breakdown
function generateBreakdown(a: number, b: number): string {
  if (a <= 5) {
    const parts = Array(a).fill(b).join(' + ');
    return `${a} × ${b} = ${parts} = ${a * b}`;
  }
  if (b <= 5) {
    const parts = Array(b).fill(a).join(' + ');
    return `${a} × ${b} = ${parts} = ${a * b}`;
  }
  if (a > 10) {
    const tens = Math.floor(a / 10) * 10;
    const ones = a % 10;
    if (ones > 0) {
      return `(${tens} × ${b}) + (${ones} × ${b}) = ${tens * b} + ${ones * b} = ${a * b}`;
    }
  }
  return `${a} × ${b} = ${a * b}`;
}

// Algorithmic 1,000 Question Generator
function buildAllQuestions(): Question[] {
  const questions: Question[] = [];

  LEVEL_CONFIGS.forEach((level) => {
    for (let groupVal = level.startNum; groupVal <= level.endNum; groupVal++) {
      for (let multiplier = 1; multiplier <= 10; multiplier++) {
        const answer = groupVal * multiplier;
        const q: Question = {
          id: `${groupVal}_${multiplier}`,
          a: groupVal,
          b: multiplier,
          answer,
          levelId: level.id,
          groupId: groupVal,
          groupName: `Perkalian ${groupVal}`,
          explanation: `${groupVal} × ${multiplier} menghasilkan ${answer}. Menjumlahkan ${groupVal} sebanyak ${multiplier} kali (atau ${multiplier} sebanyak ${groupVal} kali).`,
          breakdown: generateBreakdown(groupVal, multiplier),
          tip: generateMultiplicationTip(groupVal, multiplier),
        };
        questions.push(q);
      }
    }
  });

  return questions;
}

// In-memory catalog of all 1,000 questions
export const ALL_QUESTIONS: Question[] = buildAllQuestions();

// Map by ID for quick O(1) lookup
export const QUESTIONS_BY_ID: Map<string, Question> = new Map(
  ALL_QUESTIONS.map((q) => [q.id, q])
);

// Helpers
export function getQuestionsForLevel(levelId: number): Question[] {
  return ALL_QUESTIONS.filter((q) => q.levelId === levelId);
}

export function getQuestionsForGroup(levelId: number, groupId: number): Question[] {
  return ALL_QUESTIONS.filter((q) => q.levelId === levelId && q.groupId === groupId);
}

export function getQuestionById(id: string): Question | undefined {
  return QUESTIONS_BY_ID.get(id);
}

// Shuffle array algorithm (Fisher-Yates)
export function shuffleArray<T>(array: T[]): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

// Generate 20 distinct random questions for Level Final Test
export function generateLevelTestQuestions(levelId: number): Question[] {
  const levelQuestions = getQuestionsForLevel(levelId);
  const shuffled = shuffleArray(levelQuestions);
  return shuffled.slice(0, 20);
}

// Generate practice questions based on source and count
export function generatePracticeQuestions(
  sourceType: 'group' | 'level' | 'all_unlocked',
  sourceId: number,
  count: number,
  unlockedLevels: number[]
): Question[] {
  let pool: Question[] = [];

  if (sourceType === 'group') {
    pool = ALL_QUESTIONS.filter((q) => q.groupId === sourceId);
  } else if (sourceType === 'level') {
    pool = getQuestionsForLevel(sourceId);
  } else {
    // all unlocked levels
    pool = ALL_QUESTIONS.filter((q) => unlockedLevels.includes(q.levelId));
  }

  if (pool.length === 0) {
    pool = getQuestionsForLevel(1);
  }

  const shuffled = shuffleArray(pool);
  
  // If count exceeds pool length, cycle with shuffle
  if (count <= shuffled.length) {
    return shuffled.slice(0, count);
  }

  const result: Question[] = [];
  while (result.length < count) {
    result.push(...shuffleArray(pool));
  }
  return result.slice(0, count);
}

// Motivational quotes for students
export const MOTIVATION_QUOTES = [
  'Sedikit demi sedikit, perkalian jadi mudah!',
  'Hebat! Otak matematikamu semakin kuat setiap hari!',
  'Jangan takut salah, dari situlah kita belajar!',
  'Latihan 5 menit sehari membuatmu jadi juara perkalian!',
  'Fokus dan percaya diri, kamu pasti bisa!',
  'Keren sekali! Angka-angka ini adalah sahabat belajarmu!',
  'Satu langkah lagi menuju gelar Juara Perkalian!',
  'Trik perkalian tersimpan rapi di kepalamu, ayo buktikan!',
];
