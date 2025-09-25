import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { appWindow } from '@tauri-apps/api/window';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import Switch from '@/components/common/Switch';
import LanguageSwitch from '@/components/common/LangSwitch';
import ConfirmationModal from '@/components/common/ConfirmationModal';
import { clearHighScore } from '@/api/localStorage';
import { useSettingsStore } from '@/store/settingsStore';
import { useSound } from '@/hooks/useSound';
import { SoundType } from '@/lib/soundPlayer';
import { FaArrowLeft, FaMusic, FaSoundcloud, FaDesktop, FaTrashAlt, FaLanguage, FaCheckCircle } from 'react-icons/fa';
import clsx from 'clsx';

const isTauri = !!window.__TAURI__;

const SettingsPage = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [cleared, setCleared] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { 
    isMusicOn, isSoundOn, isFullscreen, musicVolume, soundVolume, 
    toggleMusic, toggleSound, setIsFullscreen, setMusicVolume, setSoundVolume 
  } = useSettingsStore();
  const { playSound } = useSound();

  const syncTauriWindowState = useCallback(async () => {
    if (!isTauri) return;
    try {
      const tauriIsFullscreen = await appWindow.isFullscreen();
      if (isFullscreen !== tauriIsFullscreen) {
        setIsFullscreen(tauriIsFullscreen);
      }
    } catch (e) {
      console.error(t('common.errorTauriSync'), e);
    }
  }, [isFullscreen, setIsFullscreen, t]);

  useEffect(() => {
    syncTauriWindowState();
    if (!isTauri) return;
    const unlistenPromise = appWindow.onResized(syncTauriWindowState);

    return () => {
      unlistenPromise.then(unlisten => unlisten());
    };
  }, [syncTauriWindowState]);
  
  const handleBack = () => {
    playSound(SoundType.BUTTON_CLICK);
    navigate('/');
  };

  const handleToggleSound = () => {
    toggleSound();
    playSound(SoundType.BUTTON_CLICK);
  };
  
  const handleToggleMusic = () => {
    toggleMusic();
    playSound(SoundType.BUTTON_CLICK);
  };

  const handleToggleFullscreen = async () => {
    playSound(SoundType.BUTTON_CLICK);
    if (isTauri) {
      try {
        const currentIsFullscreen = await appWindow.isFullscreen();
        await appWindow.setFullscreen(!currentIsFullscreen);
        setIsFullscreen(!currentIsFullscreen);
      } catch (error) {
        console.error(t('common.errorTauriFullscreen'), error);
      }
    } else {
      if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen()
          .then(() => setIsFullscreen(true))
          .catch(err => console.error(t('common.errorBrowserFullscreen', { message: err.message })));
      } else {
        document.exitFullscreen()
          .then(() => setIsFullscreen(false));
      }
    }
  };

  const handleConfirmClear = () => {
    playSound(SoundType.BUTTON_CLICK);
    clearHighScore();
    setCleared(true);
    setIsModalOpen(false);
    setTimeout(() => setCleared(false), 2000);
  };

  const surfaceVariants: Variants = {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, delay: 0.2, ease: "easeOut" } }
  };

  return (
    <div className="settings-wrapper">
      <div className="settings-background"></div>
      <div className="settings-overlay">
        <header className="settings-header">
          <button 
            onClick={handleBack} 
            className="absolute top-4 left-6 z-10 flex items-center gap-2 px-4 py-2 bg-gray-700/80 text-white rounded-lg hover:bg-gray-600 transition-colors"
          >
            <FaArrowLeft />
            <span>{t('levelSelect.back')}</span>
          </button>
          <h1 className="settings-title">{t('settingsPage.title')}</h1>
        </header>

        <motion.main
          className="settings-surface"
          variants={surfaceVariants}
          initial="hidden"
          animate="visible"
        >
            <div className="settings-section">
              <div className="flex justify-between items-center w-full">
                <div className="settings-label">
                  <FaMusic />
                  <p>{t('settingsPage.music')}</p>
                </div>
                <Switch isOn={isMusicOn} onToggle={handleToggleMusic} />
              </div>
              <div className="volume-slider-container">
                <input 
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={musicVolume}
                  onChange={(e) => setMusicVolume(parseFloat(e.target.value))}
                  className="volume-slider"
                  disabled={!isMusicOn}
                />
                <span className="volume-slider-percentage">{Math.round(musicVolume * 100)}%</span>
              </div>
            </div>

            <div className="settings-section">
              <div className="flex justify-between items-center w-full">
                <div className="settings-label">
                  <FaSoundcloud />
                  <p>{t('settingsPage.sounds')}</p>
                </div>
                <Switch isOn={isSoundOn} onToggle={handleToggleSound} />
              </div>
              <div className="volume-slider-container">
                <input 
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={soundVolume}
                  onChange={(e) => setSoundVolume(parseFloat(e.target.value))}
                  className="volume-slider"
                  disabled={!isSoundOn}
                />
                <span className="volume-slider-percentage">{Math.round(soundVolume * 100)}%</span>
              </div>
            </div>

            <div className="settings-section">
              <div className="settings-label">
                <FaDesktop />
                <p>{t('settingsPage.fullscreen')}</p>
              </div>
              <Switch isOn={isFullscreen} onToggle={handleToggleFullscreen} />
            </div>

            <div className="settings-section">
              <div className="settings-label">
                <FaLanguage />
                <p>{t('settingsPage.language')}</p>
              </div>
              <LanguageSwitch />
            </div>

            <div className="settings-section">
              <div className="settings-label">
                <FaTrashAlt />
                <p>{t('settingsPage.resetBuilderRecord')}</p>
              </div>
              <button
                onClick={() => { playSound(SoundType.BUTTON_CLICK); setIsModalOpen(true); }}
                className={clsx('reset-button', cleared && 'cleared')}
              >
                 <AnimatePresence mode="wait">
                    <motion.span
                      key={cleared ? 'cleared' : 'reset'}
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      transition={{ duration: 0.2 }}
                      className="flex items-center gap-2"
                    >
                      {cleared ? <><FaCheckCircle /> {t('settingsPage.resetButtonCleared')}</> : t('settingsPage.resetButton')}
                    </motion.span>
                  </AnimatePresence>
              </button>
            </div>
        </motion.main>
      </div>
      <AnimatePresence>
        <ConfirmationModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onConfirm={handleConfirmClear}
          title={t('settingsPage.resetConfirmationTitle')}
          message={t('settingsPage.resetConfirmationMessage')}
        />
      </AnimatePresence>
    </div>
  );
};

export default SettingsPage;