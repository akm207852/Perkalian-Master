export interface Question {
  id: string; // e.g. "7_8"
  a: number; // e.g. 7
  b: number; // e.g. 8 (1..10)
  answer: number; // 56
  levelId: number; // 1..10
  groupId: number; // e.g. 7
  groupName: string; // e.g. "Perkalian 7"
  explanation: string;
  breakdown: string; // e.g. "7 + 7 + 7 + 7 + 7 + 7 + 7 + 7 = 56"
  tip?: string;
}

export interface LevelInfo {
  id: number; // 1..10
  name: string; // "Level 1"
  startNum: number; // 1
  endNum: number; // 10
  rangeText: string; // "Perkalian 1–10"
  totalCards: number; // 100
  groupsCount: number; // 10
  unlocked: boolean;
  color: string;
  badgeName: string;
}

export interface CardProgress {
  id: string;
  mastered: boolean;
  reviewedCount: number;
  correctCount: number;
  incorrectCount: number;
  lastPracticed?: string;
}

export interface ChallengeRecord {
  id: string;
  date: string;
  questionCount: number;
  speedMode: 'santai' | 'cepat' | 'kilat';
  correct: number;
  totalTimeSec: number;
  avgTimeSec: number;
  score: number;
  accuracy: number;
  predicate: string;
}

export interface LevelTestRecord {
  id: string;
  levelId: number;
  date: string;
  score: number; // 0..100
  correct: number;
  total: number; // 20
  passed: boolean;
  missedQuestionIds: string[];
}

export interface AchievementBadge {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: 'level' | 'speed' | 'score' | 'practice';
  unlockedAt?: string;
}

export interface StudentProfile {
  id: string;
  name: string;
  avatar: string; // 'robot' | 'cat' | 'owl' | 'astronaut' | 'panda' | 'tiger' | 'fox' | 'star'
  stars: number;
  createdAt: string;
  lastActive: string;
  unlockedLevels: number[]; // e.g. [1]
  levelBestScores: Record<number, number>; // levelId -> best score %
  masteredCardIds: string[];
  needsReviewCardIds: string[];
  cardStats: Record<string, CardProgress>;
  practiceStats: {
    totalAnswered: number;
    totalCorrect: number;
    totalSessions: number;
  };
  challengeHistory: ChallengeRecord[];
  testHistory: LevelTestRecord[];
  unlockedBadgeIds: string[];
  settings: {
    soundEnabled: boolean;
    animationsEnabled: boolean;
    colorTheme: 'blue' | 'purple' | 'orange';
  };
}

export type ActiveView = 
  | 'home'
  | 'levels'
  | 'groups'
  | 'flashcard'
  | 'practice'
  | 'challenge'
  | 'levelTest'
  | 'progress'
  | 'profile';
