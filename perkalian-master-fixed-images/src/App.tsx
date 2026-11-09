/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { ActiveView, StudentProfile, AchievementBadge } from './types/math';
import { getActiveProfile, updateActiveProfile, saveProfiles, loadProfiles } from './utils/storage';
import { sound } from './utils/sound';
import { Navbar } from './components/Navbar';
import { CelebrationModal } from './components/CelebrationModal';
import { HomeView } from './views/HomeView';
import { LevelsView } from './views/LevelsView';
import { GroupsView } from './views/GroupsView';
import { FlashcardView } from './views/FlashcardView';
import { PracticeView } from './views/PracticeView';
import { ChallengeView } from './views/ChallengeView';
import { LevelTestView } from './views/LevelTestView';
import { ProgressView } from './views/ProgressView';
import { ProfileView } from './views/ProfileView';

export default function App() {
  const [profile, setProfile] = useState<StudentProfile>(() => getActiveProfile());
  const [currentView, setCurrentView] = useState<ActiveView>('home');
  const [selectedLevelId, setSelectedLevelId] = useState<number>(1);
  const [selectedGroupId, setSelectedGroupId] = useState<number | undefined>(undefined);

  // Celebration modal state
  const [celebration, setCelebration] = useState<{
    isOpen: boolean;
    title: string;
    subtitle: string;
    badges?: AchievementBadge[];
    starsEarned?: number;
    unlockedLevel?: number;
  }>({
    isOpen: false,
    title: '',
    subtitle: '',
    badges: [],
    starsEarned: 0,
  });

  // Keep active profile synced
  const handleUpdateProfile = (updated: StudentProfile) => {
    setProfile(updated);
    const profiles = loadProfiles();
    const list = profiles.map((p) => (p.id === updated.id ? updated : p));
    saveProfiles(list);
  };

  // Sound toggle helper
  const handleToggleSound = () => {
    const updated = {
      ...profile,
      settings: {
        ...profile.settings,
        soundEnabled: !profile.settings.soundEnabled,
      },
    };
    handleUpdateProfile(updated);
  };

  // Navigation router with parameter passing
  const handleNavigate = (
    view: ActiveView,
    extra?: { levelId?: number; groupId?: number }
  ) => {
    if (extra?.levelId !== undefined) {
      setSelectedLevelId(extra.levelId);
    }
    if (extra?.groupId !== undefined) {
      setSelectedGroupId(extra.groupId);
    } else if (view !== 'flashcard') {
      setSelectedGroupId(undefined);
    }

    setCurrentView(view);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    sound.playClick(profile.settings.soundEnabled);
  };

  const handleShowCelebration = (data: {
    title: string;
    subtitle: string;
    badges?: AchievementBadge[];
    starsEarned?: number;
    unlockedLevel?: number;
  }) => {
    setCelebration({
      isOpen: true,
      ...data,
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans antialiased selection:bg-amber-200 selection:text-amber-900">
      
      {/* Top Navbar */}
      <Navbar
        currentView={currentView}
        onNavigate={handleNavigate}
        profile={profile}
        onToggleSound={handleToggleSound}
      />

      {/* Main View Router */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-4 sm:pt-6">
        {currentView === 'home' && (
          <HomeView profile={profile} onNavigate={handleNavigate} />
        )}

        {currentView === 'levels' && (
          <LevelsView profile={profile} onNavigate={handleNavigate} />
        )}

        {currentView === 'groups' && (
          <GroupsView
            levelId={selectedLevelId}
            profile={profile}
            onNavigate={handleNavigate}
          />
        )}

        {currentView === 'flashcard' && (
          <FlashcardView
            levelId={selectedLevelId}
            groupId={selectedGroupId}
            profile={profile}
            onUpdateProfile={handleUpdateProfile}
            onNavigate={handleNavigate}
          />
        )}

        {currentView === 'practice' && (
          <PracticeView
            profile={profile}
            onUpdateProfile={handleUpdateProfile}
            onNavigate={handleNavigate}
          />
        )}

        {currentView === 'challenge' && (
          <ChallengeView
            profile={profile}
            onUpdateProfile={handleUpdateProfile}
            onNavigate={handleNavigate}
          />
        )}

        {currentView === 'levelTest' && (
          <LevelTestView
            levelId={selectedLevelId}
            profile={profile}
            onUpdateProfile={handleUpdateProfile}
            onNavigate={handleNavigate}
            onShowCelebration={handleShowCelebration}
          />
        )}

        {currentView === 'progress' && (
          <ProgressView profile={profile} onNavigate={handleNavigate} />
        )}

        {currentView === 'profile' && (
          <ProfileView
            currentProfile={profile}
            onProfileChanged={handleUpdateProfile}
          />
        )}
      </main>

      {/* Celebration Modal (Confetti, Stars, Badges, Level Unlock) */}
      <CelebrationModal
        isOpen={celebration.isOpen}
        onClose={() => setCelebration((prev) => ({ ...prev, isOpen: false }))}
        title={celebration.title}
        subtitle={celebration.subtitle}
        badges={celebration.badges}
        starsEarned={celebration.starsEarned}
        unlockedLevel={celebration.unlockedLevel}
        onPrimaryAction={() => {
          if (celebration.unlockedLevel) {
            handleNavigate('flashcard', { levelId: celebration.unlockedLevel });
          } else {
            handleNavigate('levels');
          }
        }}
      />

      {/* Quiet Footer */}
      <footer className="hidden md:block py-6 border-t border-slate-200 bg-white/70 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>PERKALIAN MASTER – Flashcard Challenge SD</span>
          <span>10 Level · 1.000 Flashcard Interaktif · Tersimpan Otomatis</span>
        </div>
      </footer>

    </div>
  );
}
