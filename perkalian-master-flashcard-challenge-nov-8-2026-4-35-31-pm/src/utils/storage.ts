import { StudentProfile, AchievementBadge, LevelTestRecord, ChallengeRecord } from '../types/math';

const PROFILES_STORAGE_KEY = 'perkalian_master_profiles_v2';
const ACTIVE_PROFILE_ID_KEY = 'perkalian_master_active_profile_id_v2';

export const AVATAR_OPTIONS = [
  { id: 'robot', name: 'Kiko Robot', emoji: '🤖', bg: 'bg-blue-100 text-blue-600' },
  { id: 'cat', name: 'Moli Kucing', emoji: '🐱', bg: 'bg-amber-100 text-amber-600' },
  { id: 'owl', name: 'Boni Burung Hantu', emoji: '🦉', bg: 'bg-purple-100 text-purple-600' },
  { id: 'astronaut', name: 'Astro Penjelajah', emoji: '👨‍🚀', bg: 'bg-indigo-100 text-indigo-600' },
  { id: 'panda', name: 'Panpan Panda', emoji: '🐼', bg: 'bg-emerald-100 text-emerald-600' },
  { id: 'tiger', name: 'Tora Harimau', emoji: '🐯', bg: 'bg-orange-100 text-orange-600' },
  { id: 'fox', name: 'Foxy Cerdik', emoji: '🦊', bg: 'bg-rose-100 text-rose-600' },
  { id: 'star', name: 'Bintang Juara', emoji: '⭐', bg: 'bg-yellow-100 text-yellow-600' },
];

export const BADGE_DEFINITIONS: AchievementBadge[] = [
  {
    id: 'first_step',
    title: 'Langkah Pertama',
    description: 'Selesaikan Tes Akhir Level 1 dengan nilai minimal 80%',
    icon: '🚀',
    category: 'level',
  },
  {
    id: 'math_champion',
    title: 'Juara Matematika',
    description: 'Buka dan selesaikan hingga Level 5',
    icon: '🏆',
    category: 'level',
  },
  {
    id: 'multiplication_master',
    title: 'Multiplication Master',
    description: 'Selesaikan seluruh 10 level perkalian 1 s.d. 100!',
    icon: '👑',
    category: 'level',
  },
  {
    id: 'perfect_100',
    title: 'Nilai Sempurna',
    description: 'Dapatkan nilai 100% pada Tes Akhir Level',
    icon: '💯',
    category: 'score',
  },
  {
    id: 'speed_thinker',
    title: 'Pemikir Cepat',
    description: 'Selesaikan Mode Tantangan Cepat atau Kilat dengan akurasi 90%+',
    icon: '⚡',
    category: 'speed',
  },
  {
    id: 'practice_lover',
    title: 'Rajin Berlatih',
    description: 'Jawab total 50 soal dalam Mode Latihan',
    icon: '📚',
    category: 'practice',
  },
  {
    id: 'master_cards_50',
    title: 'Hafal Tangguh',
    description: 'Kuasai minimal 50 flashcard perkalian',
    icon: '🧠',
    category: 'practice',
  },
  {
    id: 'flash_speed',
    title: 'Kilat Berhitung',
    description: 'Selesaikan tantangan Mode Kilat (5 detik/soal)',
    icon: '⏱️',
    category: 'speed',
  },
];

function createDefaultProfile(name: string = 'Siswa Juara', avatar: string = 'robot'): StudentProfile {
  return {
    id: 'profile_' + Date.now(),
    name,
    avatar,
    stars: 25,
    createdAt: new Date().toISOString(),
    lastActive: new Date().toISOString(),
    unlockedLevels: [1], // Level 1 is always unlocked initially
    levelBestScores: {},
    masteredCardIds: [],
    needsReviewCardIds: [],
    cardStats: {},
    practiceStats: {
      totalAnswered: 0,
      totalCorrect: 0,
      totalSessions: 0,
    },
    challengeHistory: [],
    testHistory: [],
    unlockedBadgeIds: [],
    settings: {
      soundEnabled: true,
      animationsEnabled: true,
      colorTheme: 'blue',
    },
  };
}

export function loadProfiles(): StudentProfile[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(PROFILES_STORAGE_KEY);
    if (!raw) {
      const def = createDefaultProfile('Siswa Hebat', 'robot');
      saveProfiles([def]);
      setActiveProfileId(def.id);
      return [def];
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) {
      const def = createDefaultProfile('Siswa Hebat', 'robot');
      saveProfiles([def]);
      setActiveProfileId(def.id);
      return [def];
    }
    return parsed;
  } catch {
    const def = createDefaultProfile('Siswa Hebat', 'robot');
    return [def];
  }
}

export function saveProfiles(profiles: StudentProfile[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(PROFILES_STORAGE_KEY, JSON.stringify(profiles));
  } catch (err) {
    console.error('Failed to save profiles to localStorage', err);
  }
}

export function getActiveProfileId(): string {
  if (typeof window === 'undefined') return '';
  const id = localStorage.getItem(ACTIVE_PROFILE_ID_KEY);
  if (id) return id;
  const profiles = loadProfiles();
  return profiles[0]?.id || '';
}

export function setActiveProfileId(id: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(ACTIVE_PROFILE_ID_KEY, id);
}

export function getActiveProfile(): StudentProfile {
  const profiles = loadProfiles();
  const activeId = getActiveProfileId();
  const found = profiles.find((p) => p.id === activeId);
  return found || profiles[0] || createDefaultProfile();
}

export function updateActiveProfile(updater: (prev: StudentProfile) => StudentProfile): StudentProfile {
  const profiles = loadProfiles();
  const activeId = getActiveProfileId();
  let updatedActive: StudentProfile | null = null;

  const updatedProfiles = profiles.map((p) => {
    if (p.id === activeId) {
      const updated = updater(p);
      updated.lastActive = new Date().toISOString();
      updatedActive = updated;
      return updated;
    }
    return p;
  });

  if (!updatedActive) {
    const def = createDefaultProfile();
    updatedActive = def;
    updatedProfiles.push(def);
    setActiveProfileId(def.id);
  }

  saveProfiles(updatedProfiles);
  return updatedActive;
}

export function createNewProfile(name: string, avatar: string): StudentProfile {
  const newProfile = createDefaultProfile(name, avatar);
  const profiles = loadProfiles();
  profiles.push(newProfile);
  saveProfiles(profiles);
  setActiveProfileId(newProfile.id);
  return newProfile;
}

export function deleteProfile(profileId: string): StudentProfile[] {
  const profiles = loadProfiles();
  const remaining = profiles.filter((p) => p.id !== profileId);
  if (remaining.length === 0) {
    const def = createDefaultProfile('Siswa Baru', 'cat');
    saveProfiles([def]);
    setActiveProfileId(def.id);
    return [def];
  }
  saveProfiles(remaining);
  if (getActiveProfileId() === profileId) {
    setActiveProfileId(remaining[0].id);
  }
  return remaining;
}

export function resetProfileProgress(profileId: string): StudentProfile {
  const profiles = loadProfiles();
  let resultProfile: StudentProfile | null = null;

  const updatedProfiles = profiles.map((p) => {
    if (p.id === profileId) {
      const reset = createDefaultProfile(p.name, p.avatar);
      reset.id = p.id;
      reset.settings = p.settings;
      reset.createdAt = p.createdAt;
      resultProfile = reset;
      return reset;
    }
    return p;
  });

  saveProfiles(updatedProfiles);
  return resultProfile || profiles[0];
}

// Check and award badges automatically
export function checkBadges(profile: StudentProfile): { profile: StudentProfile; newBadges: AchievementBadge[] } {
  const newBadges: AchievementBadge[] = [];
  const existingBadgeIds = new Set(profile.unlockedBadgeIds);

  const award = (badgeId: string) => {
    if (!existingBadgeIds.has(badgeId)) {
      existingBadgeIds.add(badgeId);
      const def = BADGE_DEFINITIONS.find((b) => b.id === badgeId);
      if (def) {
        newBadges.push(def);
      }
    }
  };

  // 1. First Step: passed Level 1 test
  if (profile.unlockedLevels.includes(2) || (profile.levelBestScores[1] && profile.levelBestScores[1] >= 80)) {
    award('first_step');
  }

  // 2. Math Champion: completed 5 levels (level 6 unlocked or 5 levels with >=80%)
  const passedLevelCount = Object.values(profile.levelBestScores).filter((s) => s >= 80).length;
  if (passedLevelCount >= 5 || profile.unlockedLevels.includes(6)) {
    award('math_champion');
  }

  // 3. Multiplication Master: completed all 10 levels
  if (passedLevelCount >= 10 || (profile.unlockedLevels.length >= 10 && profile.levelBestScores[10] >= 80)) {
    award('multiplication_master');
  }

  // 4. Perfect 100
  if (Object.values(profile.levelBestScores).some((score) => score === 100)) {
    award('perfect_100');
  }

  // 5. Speed Thinker: speed challenge with >=90% in 'cepat' or 'kilat'
  if (
    profile.challengeHistory.some(
      (c) => (c.speedMode === 'cepat' || c.speedMode === 'kilat') && c.accuracy >= 90
    )
  ) {
    award('speed_thinker');
  }

  // 6. Practice Lover: total answered >= 50
  if (profile.practiceStats.totalAnswered >= 50) {
    award('practice_lover');
  }

  // 7. Master Cards 50: mastered >= 50
  if (profile.masteredCardIds.length >= 50) {
    award('master_cards_50');
  }

  // 8. Flash Speed: completed kilat mode
  if (profile.challengeHistory.some((c) => c.speedMode === 'kilat')) {
    award('flash_speed');
  }

  const updatedProfile: StudentProfile = {
    ...profile,
    unlockedBadgeIds: Array.from(existingBadgeIds),
    stars: profile.stars + newBadges.length * 15, // 15 stars per badge!
  };

  return { profile: updatedProfile, newBadges };
}

// Mark flashcard status
export function updateCardMastery(
  profile: StudentProfile,
  cardId: string,
  isMastered: boolean
): StudentProfile {
  const masteredSet = new Set(profile.masteredCardIds);
  const needsReviewSet = new Set(profile.needsReviewCardIds);

  const prevCard = profile.cardStats[cardId] || {
    id: cardId,
    mastered: false,
    reviewedCount: 0,
    correctCount: 0,
    incorrectCount: 0,
  };

  if (isMastered) {
    masteredSet.add(cardId);
    needsReviewSet.delete(cardId);
  } else {
    masteredSet.delete(cardId);
    needsReviewSet.add(cardId);
  }

  const updatedCard = {
    ...prevCard,
    mastered: isMastered,
    reviewedCount: prevCard.reviewedCount + 1,
    lastPracticed: new Date().toISOString(),
  };

  const updated = {
    ...profile,
    masteredCardIds: Array.from(masteredSet),
    needsReviewCardIds: Array.from(needsReviewSet),
    cardStats: {
      ...profile.cardStats,
      [cardId]: updatedCard,
    },
    stars: isMastered && !prevCard.mastered ? profile.stars + 1 : profile.stars,
  };

  const { profile: finalProfile } = checkBadges(updated);
  return finalProfile;
}

// Record level test
export function recordLevelTestResult(
  profile: StudentProfile,
  record: Omit<LevelTestRecord, 'id' | 'date'>
): { updatedProfile: StudentProfile; newlyUnlockedLevel?: number; newBadges: AchievementBadge[] } {
  const newRecord: LevelTestRecord = {
    ...record,
    id: 'test_' + Date.now(),
    date: new Date().toISOString(),
  };

  const currentBest = profile.levelBestScores[record.levelId] || 0;
  const bestScore = Math.max(currentBest, record.score);

  const unlockedSet = new Set(profile.unlockedLevels);
  let newlyUnlockedLevel: number | undefined = undefined;

  // If score >= 80, unlock next level (up to 10)
  if (record.passed && record.levelId < 10) {
    const nextLevel = record.levelId + 1;
    if (!unlockedSet.has(nextLevel)) {
      unlockedSet.add(nextLevel);
      newlyUnlockedLevel = nextLevel;
    }
  }

  // Also add missed questions to needsReview
  const needsReviewSet = new Set(profile.needsReviewCardIds);
  record.missedQuestionIds.forEach((qId) => needsReviewSet.add(qId));

  const starsEarned = record.passed ? 20 : 5;

  const baseUpdated: StudentProfile = {
    ...profile,
    stars: profile.stars + starsEarned,
    unlockedLevels: Array.from(unlockedSet).sort((a, b) => a - b),
    levelBestScores: {
      ...profile.levelBestScores,
      [record.levelId]: bestScore,
    },
    needsReviewCardIds: Array.from(needsReviewSet),
    testHistory: [newRecord, ...profile.testHistory].slice(0, 50),
  };

  const { profile: finalProfile, newBadges } = checkBadges(baseUpdated);
  return { updatedProfile: finalProfile, newlyUnlockedLevel, newBadges };
}

// Record challenge result
export function recordChallengeResult(
  profile: StudentProfile,
  record: Omit<ChallengeRecord, 'id' | 'date'>
): { updatedProfile: StudentProfile; newBadges: AchievementBadge[] } {
  const newRecord: ChallengeRecord = {
    ...record,
    id: 'chal_' + Date.now(),
    date: new Date().toISOString(),
  };

  const starsEarned = Math.round(record.score / 10) + (record.accuracy >= 90 ? 10 : 0);

  const baseUpdated: StudentProfile = {
    ...profile,
    stars: profile.stars + starsEarned,
    challengeHistory: [newRecord, ...profile.challengeHistory].slice(0, 50),
  };

  const { profile: updatedProfile, newBadges } = checkBadges(baseUpdated);
  return { updatedProfile, newBadges };
}

// Record practice answer
export function recordPracticeAnswer(
  profile: StudentProfile,
  cardId: string,
  isCorrect: boolean
): StudentProfile {
  const prevCard = profile.cardStats[cardId] || {
    id: cardId,
    mastered: false,
    reviewedCount: 0,
    correctCount: 0,
    incorrectCount: 0,
  };

  const updatedCard = {
    ...prevCard,
    reviewedCount: prevCard.reviewedCount + 1,
    correctCount: prevCard.correctCount + (isCorrect ? 1 : 0),
    incorrectCount: prevCard.incorrectCount + (isCorrect ? 0 : 1),
    lastPracticed: new Date().toISOString(),
    mastered: isCorrect && prevCard.correctCount >= 2 ? true : prevCard.mastered,
  };

  const masteredSet = new Set(profile.masteredCardIds);
  const needsReviewSet = new Set(profile.needsReviewCardIds);

  if (isCorrect) {
    if (updatedCard.mastered) {
      masteredSet.add(cardId);
      needsReviewSet.delete(cardId);
    }
  } else {
    needsReviewSet.add(cardId);
    masteredSet.delete(cardId);
  }

  const updated: StudentProfile = {
    ...profile,
    stars: profile.stars + (isCorrect ? 1 : 0),
    masteredCardIds: Array.from(masteredSet),
    needsReviewCardIds: Array.from(needsReviewSet),
    cardStats: {
      ...profile.cardStats,
      [cardId]: updatedCard,
    },
    practiceStats: {
      totalAnswered: profile.practiceStats.totalAnswered + 1,
      totalCorrect: profile.practiceStats.totalCorrect + (isCorrect ? 1 : 0),
      totalSessions: profile.practiceStats.totalSessions,
    },
  };

  const { profile: finalProfile } = checkBadges(updated);
  return finalProfile;
}
