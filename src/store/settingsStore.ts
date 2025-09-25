import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { AspectRatio } from '@/types/game';

interface SettingsState {
  isMusicOn: boolean;
  isSoundOn: boolean;
  isFullscreen: boolean;
  musicVolume: number;
  soundVolume: number;
  aspectRatio: AspectRatio;
  toggleMusic: () => void;
  toggleSound: () => void;
  setIsFullscreen: (value: boolean) => void;
  setMusicVolume: (volume: number) => void;
  setSoundVolume: (volume: number) => void;
  setAspectRatio: (ratio: AspectRatio) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      isMusicOn: true,
      isSoundOn: true,
      isFullscreen: false,
      musicVolume: 0.23,
      soundVolume: 0.7,
      aspectRatio: 'auto',

      toggleMusic: () => set((state) => ({ isMusicOn: !state.isMusicOn })),
      
      toggleSound: () => set((state) => ({ isSoundOn: !state.isSoundOn })),
      
      setIsFullscreen: (value) => set({ isFullscreen: value }),
      
      setMusicVolume: (volume) => set({ musicVolume: volume }),
      
      setSoundVolume: (volume) => set({ soundVolume: volume }),
      
      setAspectRatio: (ratio) => set({ aspectRatio: ratio }),
    }),
    {
      name: 'game-settings-storage',
      partialize: (state) => ({
        isMusicOn: state.isMusicOn,
        isSoundOn: state.isSoundOn,
        musicVolume: state.musicVolume,
        soundVolume: state.soundVolume,
        aspectRatio: state.aspectRatio,
      }),
    }
  )
);