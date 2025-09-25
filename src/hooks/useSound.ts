import { useEffect } from 'react';
import { useSettingsStore } from '@/store/settingsStore';
import { soundPlayer, SoundType } from '@/lib/soundPlayer';

export const useSound = () => {
  const { isSoundOn, soundVolume } = useSettingsStore();

  useEffect(() => {
    soundPlayer.setEnabled(isSoundOn);
  }, [isSoundOn]);

  useEffect(() => {
    soundPlayer.setVolume(soundVolume);
  }, [soundVolume]);

  const playSound = (type: SoundType) => {
    soundPlayer.play(type);
  };
  
  const stopSound = (type: SoundType) => {
    soundPlayer.stop(type);
  }

  return { playSound, stopSound };
};