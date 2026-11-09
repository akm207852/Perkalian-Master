import React, { useState } from 'react';
import { 
  User, 
  Trophy, 
  Award, 
  Settings, 
  Plus, 
  Trash2, 
  RotateCcw, 
  Volume2, 
  VolumeX, 
  Sparkles, 
  Check, 
  AlertTriangle,
  Star,
  Layers,
  Palette
} from 'lucide-react';
import { StudentProfile, AchievementBadge } from '../types/math';
import { 
  AVATAR_OPTIONS, 
  BADGE_DEFINITIONS, 
  loadProfiles, 
  saveProfiles, 
  setActiveProfileId, 
  createNewProfile, 
  deleteProfile, 
  resetProfileProgress 
} from '../utils/storage';
import { sound } from '../utils/sound';
import trophyImage from '../assets/images/badge_math_trophy_1794129987529.jpg';

interface ProfileViewProps {
  currentProfile: StudentProfile;
  onProfileChanged: (newProfile: StudentProfile) => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  currentProfile,
  onProfileChanged,
}) => {
  const [profiles, setProfiles] = useState<StudentProfile[]>(() => loadProfiles());
  const [editingName, setEditingName] = useState(currentProfile.name);
  const [selectedAvatar, setSelectedAvatar] = useState(currentProfile.avatar);
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [newName, setNewName] = useState('');
  const [newAvatar, setNewAvatar] = useState('robot');

  // Confirmation modal states
  const [showResetModal, setShowResetModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState<string | null>(null);

  const activeAvatarObj = AVATAR_OPTIONS.find((a) => a.id === currentProfile.avatar) || AVATAR_OPTIONS[0];

  // Save current profile name or avatar
  const handleSaveProfileChanges = () => {
    if (!editingName.trim()) return;
    const updated: StudentProfile = {
      ...currentProfile,
      name: editingName.trim(),
      avatar: selectedAvatar,
    };
    const updatedList = profiles.map((p) => (p.id === currentProfile.id ? updated : p));
    setProfiles(updatedList);
    saveProfiles(updatedList);
    onProfileChanged(updated);
    sound.playClick(updated.settings.soundEnabled);
  };

  // Switch active profile
  const handleSelectProfile = (id: string) => {
    setActiveProfileId(id);
    const chosen = profiles.find((p) => p.id === id);
    if (chosen) {
      onProfileChanged(chosen);
      setEditingName(chosen.name);
      setSelectedAvatar(chosen.avatar);
      sound.playClick(chosen.settings.soundEnabled);
    }
  };

  // Create new profile
  const handleCreateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    const created = createNewProfile(newName.trim(), newAvatar);
    setProfiles(loadProfiles());
    onProfileChanged(created);
    setEditingName(created.name);
    setSelectedAvatar(created.avatar);
    setNewName('');
    setIsCreatingNew(false);
    sound.playLevelUp(created.settings.soundEnabled);
  };

  // Delete profile
  const handleDeleteProfile = (id: string) => {
    const remaining = deleteProfile(id);
    setProfiles(remaining);
    const active = remaining[0];
    onProfileChanged(active);
    setEditingName(active.name);
    setSelectedAvatar(active.avatar);
    setShowDeleteModal(null);
  };

  // Reset active profile progress
  const handleResetProgress = () => {
    const reset = resetProfileProgress(currentProfile.id);
    setProfiles(loadProfiles());
    onProfileChanged(reset);
    setShowResetModal(false);
    sound.playWrong(reset.settings.soundEnabled);
  };

  // Toggle settings
  const handleToggleSound = () => {
    const updated: StudentProfile = {
      ...currentProfile,
      settings: {
        ...currentProfile.settings,
        soundEnabled: !currentProfile.settings.soundEnabled,
      },
    };
    onProfileChanged(updated);
    const updatedList = profiles.map((p) => (p.id === currentProfile.id ? updated : p));
    saveProfiles(updatedList);
  };

  const handleToggleTheme = (theme: 'blue' | 'purple' | 'orange') => {
    const updated: StudentProfile = {
      ...currentProfile,
      settings: {
        ...currentProfile.settings,
        colorTheme: theme,
      },
    };
    onProfileChanged(updated);
    const updatedList = profiles.map((p) => (p.id === currentProfile.id ? updated : p));
    saveProfiles(updatedList);
  };

  return (
    <div className="space-y-6 pb-20 md:pb-8">
      
      {/* Top Banner & Profile Header */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs">
        <div className="flex flex-col sm:flex-row items-center sm:items-start justify-between gap-6">
          <div className="flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
            <div className="w-20 h-20 rounded-3xl bg-blue-100 flex items-center justify-center text-4xl shadow-xs border-2 border-white ring-2 ring-blue-200">
              {activeAvatarObj.emoji}
            </div>
            <div>
              <div className="inline-flex items-center gap-1 text-xs font-bold text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-md border border-amber-200 mb-1">
                <Sparkles className="w-3.5 h-3.5 fill-amber-400" />
                <span>{currentProfile.stars} Bintang Juara</span>
              </div>
              <h1 className="font-display font-black text-2xl sm:text-3xl text-slate-900">
                {currentProfile.name}
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Avatar: {activeAvatarObj.name} · Bergabung sejak{' '}
                {new Date(currentProfile.createdAt).toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsCreatingNew((prev) => !prev)}
            className="px-4 py-2.5 bg-blue-50 hover:bg-blue-100 text-blue-700 font-display font-bold text-xs rounded-xl border border-blue-200 transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Siswa Baru</span>
          </button>
        </div>
      </div>

      {/* Create New Profile Form (collapsible) */}
      {isCreatingNew && (
        <form
          onSubmit={handleCreateProfile}
          className="bg-white rounded-3xl p-6 border-2 border-blue-300 shadow-md space-y-4 animate-in slide-in-from-top-4 duration-200"
        >
          <h3 className="font-display font-extrabold text-lg text-slate-900">
            Daftarkan Siswa Baru
          </h3>
          <p className="text-xs text-slate-500">
            Setiap siswa mempunyai progres, bintang, dan riwayat terpisah di perangkat ini.
          </p>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">Nama Siswa:</label>
            <input
              type="text"
              required
              placeholder="Contoh: Rian, Kayla, Budi..."
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              className="w-full p-3 bg-slate-50 border-2 border-slate-200 rounded-xl font-bold text-slate-900 focus:outline-hidden focus:border-blue-500"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-2">Pilih Karakter Avatar:</label>
            <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
              {AVATAR_OPTIONS.map((av) => (
                <button
                  key={av.id}
                  type="button"
                  onClick={() => setNewAvatar(av.id)}
                  className={`p-3 rounded-2xl border-2 flex flex-col items-center gap-1 cursor-pointer transition-all ${
                    newAvatar === av.id
                      ? 'border-blue-500 bg-blue-50 scale-105 shadow-xs'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <span className="text-2xl">{av.emoji}</span>
                  <span className="text-[10px] font-bold text-slate-700 truncate w-full text-center">
                    {av.name.split(' ')[0]}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsCreatingNew(false)}
              className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-display font-bold text-xs rounded-xl shadow-xs cursor-pointer"
            >
              Simpan Profil Baru
            </button>
          </div>
        </form>
      )}

      {/* Profile Switcher List */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs">
        <h3 className="font-display font-extrabold text-lg text-slate-900 mb-2">
          Pilih Akun Belajar di Perangkat Ini
        </h3>
        <p className="text-xs text-slate-500 mb-4">
          Klik untuk mengganti akun siswa yang sedang belajar:
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {profiles.map((p) => {
            const av = AVATAR_OPTIONS.find((a) => a.id === p.avatar) || AVATAR_OPTIONS[0];
            const isActive = p.id === currentProfile.id;

            return (
              <div
                key={p.id}
                onClick={() => handleSelectProfile(p.id)}
                className={`p-4 rounded-2xl border-2 transition-all flex items-center justify-between cursor-pointer ${
                  isActive
                    ? 'border-blue-500 bg-blue-50/70 shadow-xs'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center text-2xl shadow-xs border border-slate-200">
                    {av.emoji}
                  </div>
                  <div>
                    <h4 className="font-display font-bold text-sm text-slate-900 flex items-center gap-1.5">
                      <span>{p.name}</span>
                      {isActive && (
                        <span className="text-[10px] bg-blue-600 text-white px-2 py-0.2 rounded-full">
                          Aktif
                        </span>
                      )}
                    </h4>
                    <span className="text-xs font-medium text-slate-500 flex items-center gap-1 mt-0.5">
                      <Star className="w-3 h-3 text-amber-500 fill-amber-400" />
                      <span>{p.stars} Bintang · {p.masteredCardIds.length} Hafal</span>
                    </span>
                  </div>
                </div>

                {profiles.length > 1 && !isActive && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowDeleteModal(p.id);
                    }}
                    title="Hapus profil ini"
                    className="p-2 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Edit Current Profile (Name & Avatar) */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
        <h3 className="font-display font-extrabold text-lg text-slate-900">
          Ubah Nama & Karakter Avatar
        </h3>

        <div>
          <label className="text-xs font-bold text-slate-700 block mb-1">Nama Siswa:</label>
          <input
            type="text"
            value={editingName}
            onChange={(e) => setEditingName(e.target.value)}
            className="w-full p-3 bg-slate-50 border-2 border-slate-200 rounded-xl font-bold text-slate-900 focus:outline-hidden focus:border-blue-500 max-w-md"
          />
        </div>

        <div>
          <label className="text-xs font-bold text-slate-700 block mb-2">Pilih Avatar:</label>
          <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
            {AVATAR_OPTIONS.map((av) => (
              <button
                key={av.id}
                type="button"
                onClick={() => setSelectedAvatar(av.id)}
                className={`p-3 rounded-2xl border-2 flex flex-col items-center gap-1 cursor-pointer transition-all ${
                  selectedAvatar === av.id
                    ? 'border-blue-500 bg-blue-50 scale-105 shadow-xs'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <span className="text-2xl">{av.emoji}</span>
                <span className="text-[10px] font-bold text-slate-700 truncate w-full text-center">
                  {av.name.split(' ')[0]}
                </span>
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={handleSaveProfileChanges}
          className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-display font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
        >
          Simpan Perubahan
        </button>
      </div>

      {/* Koleksi Penghargaan & Lemari Piala */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-amber-500" />
              <h2 className="font-display font-black text-xl text-slate-900">
                Lemari Penghargaan & Piala
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Raih piala di setiap level dan buka seluruh medali pencapaian!
            </p>
          </div>

          <div className="flex items-center gap-2 bg-amber-50 px-3.5 py-1.5 rounded-xl border border-amber-200 text-amber-900 font-bold text-xs">
            <Award className="w-4 h-4 text-amber-600" />
            <span>{currentProfile.unlockedBadgeIds.length} / {BADGE_DEFINITIONS.length} Lencana</span>
          </div>
        </div>

        {/* 10 Level Trophies */}
        <div>
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-3">
            Piala Kelulusan Level (Level 1 s.d. 10):
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {Array.from({ length: 10 }, (_, i) => i + 1).map((lvl) => {
              const bestScore = currentProfile.levelBestScores[lvl];
              const isPassed = bestScore !== undefined && bestScore >= 80;

              return (
                <div
                  key={lvl}
                  className={`p-3.5 rounded-2xl border-2 text-center transition-all ${
                    isPassed
                      ? 'bg-linear-to-b from-amber-50 to-yellow-50 border-amber-300 shadow-xs'
                      : 'bg-slate-50 border-slate-200/80 opacity-60'
                  }`}
                >
                  <div className="w-12 h-12 mx-auto mb-2 flex items-center justify-center">
                    {isPassed ? (
                      <img
                        src={trophyImage}
                        alt="Piala Juara"
                        referrerPolicy="no-referrer"
                        className="w-12 h-12 object-contain"
                      />
                    ) : (
                      <Trophy className="w-8 h-8 text-slate-300" />
                    )}
                  </div>
                  <h5 className="font-display font-black text-xs text-slate-800">
                    Piala Level {lvl}
                  </h5>
                  <span className={`text-[10px] font-bold block mt-0.5 ${isPassed ? 'text-amber-800' : 'text-slate-400'}`}>
                    {isPassed ? `Lulus (${bestScore}%)` : 'Terkunci'}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Achievement Badges */}
        <div>
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-3">
            Lencana Prestasi Khusus:
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {BADGE_DEFINITIONS.map((badge) => {
              const isUnlocked = currentProfile.unlockedBadgeIds.includes(badge.id);

              return (
                <div
                  key={badge.id}
                  className={`p-4 rounded-2xl border-2 flex items-start gap-3 transition-all ${
                    isUnlocked
                      ? 'bg-linear-to-r from-purple-50/70 to-indigo-50/70 border-purple-200 shadow-xs'
                      : 'bg-slate-50 border-slate-200/70 opacity-50'
                  }`}
                >
                  <span className="text-3xl shrink-0">{badge.icon}</span>
                  <div>
                    <h5 className="font-display font-bold text-sm text-slate-900 flex items-center gap-1.5">
                      <span>{badge.title}</span>
                      {isUnlocked && <Check className="w-3.5 h-3.5 text-purple-600" />}
                    </h5>
                    <p className="text-xs text-slate-500 mt-1 leading-snug">{badge.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Fitur Pengaturan Aplikasi */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
        <div className="flex items-center gap-2">
          <Settings className="w-5 h-5 text-slate-700" />
          <h2 className="font-display font-black text-xl text-slate-900">
            Pengaturan Aplikasi
          </h2>
        </div>

        <div className="space-y-4 max-w-xl">
          
          {/* Sound Effect Toggle */}
          <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-200">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-white text-slate-700 shadow-xs">
                {currentProfile.settings.soundEnabled ? (
                  <Volume2 className="w-5 h-5 text-blue-600" />
                ) : (
                  <VolumeX className="w-5 h-5 text-slate-400" />
                )}
              </div>
              <div>
                <h4 className="font-bold text-sm text-slate-900">Efek Suara</h4>
                <p className="text-xs text-slate-500">
                  Bunyi ceria saat menjawab benar, membalik kartu, dan lulus level
                </p>
              </div>
            </div>

            <button
              onClick={handleToggleSound}
              className={`w-12 h-7 rounded-full transition-colors cursor-pointer p-1 relative ${
                currentProfile.settings.soundEnabled ? 'bg-blue-600' : 'bg-slate-300'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white transition-transform ${
                  currentProfile.settings.soundEnabled ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Reset Progress Button */}
          <div className="flex items-center justify-between p-4 bg-rose-50/60 rounded-2xl border border-rose-200">
            <div>
              <h4 className="font-bold text-sm text-rose-900">Reset Progres Siswa</h4>
              <p className="text-xs text-rose-700">
                Kembalikan level terbuka ke Level 1 dan hapus riwayat hafalan akun ini
              </p>
            </div>

            <button
              onClick={() => setShowResetModal(true)}
              className="px-3.5 py-2 bg-rose-600 hover:bg-rose-700 text-white font-display font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              Reset Data
            </button>
          </div>

        </div>
      </div>

      {/* Safety Confirmation Modal for Reset */}
      {showResetModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-sm bg-white rounded-3xl p-6 text-center shadow-xl border-2 border-rose-300 animate-in zoom-in-95 duration-150">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mb-3">
              <AlertTriangle className="w-7 h-7" />
            </div>
            <h3 className="font-display font-black text-xl text-slate-900 mb-2">
              Yakin Ingin Mereset Progres?
            </h3>
            <p className="text-xs text-slate-600 mb-5">
              Seluruh status hafalan kartu, riwayat tes, dan skor milik <span className="font-bold">{currentProfile.name}</span> akan direset kembali seperti baru.
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setShowResetModal(false)}
                className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl cursor-pointer"
              >
                Batal
              </button>
              <button
                onClick={handleResetProgress}
                className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-display font-extrabold text-xs rounded-xl shadow-sm cursor-pointer"
              >
                Ya, Reset Sekarang
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal for Profile Deletion */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-sm bg-white rounded-3xl p-6 text-center shadow-xl border-2 border-rose-300 animate-in zoom-in-95 duration-150">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mb-3">
              <Trash2 className="w-7 h-7" />
            </div>
            <h3 className="font-display font-black text-xl text-slate-900 mb-2">
              Hapus Akun Siswa Ini?
            </h3>
            <p className="text-xs text-slate-600 mb-5">
              Profil dan data perkembangan siswa ini akan dihapus permanen dari perangkat ini.
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setShowDeleteModal(null)}
                className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl cursor-pointer"
              >
                Batal
              </button>
              <button
                onClick={() => handleDeleteProfile(showDeleteModal)}
                className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-display font-extrabold text-xs rounded-xl shadow-sm cursor-pointer"
              >
                Ya, Hapus
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
