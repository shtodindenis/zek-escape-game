import { useEffect } from 'react';
import { useSettingsStore } from '@/store/settingsStore';
import { musicPlayer } from '@/lib/musicPlayer';

export const useMusic = () => {
  const { isMusicOn, musicVolume } = useSettingsStore();

  useEffect(() => {
    musicPlayer.toggle(isMusicOn);
  }, [isMusicOn]);

  useEffect(() => {
    musicPlayer.setVolume(musicVolume);
  }, [musicVolume]);
};