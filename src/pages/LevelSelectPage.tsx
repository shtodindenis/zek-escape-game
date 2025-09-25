import { useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaStar, FaLock } from 'react-icons/fa';
import clsx from 'clsx';
import { useTranslation } from 'react-i18next';
import { useLevelSelectStore } from '@/store/selectStore';
import { useSound } from '@/hooks/useSound';
import { SoundType } from '@/lib/soundPlayer';

const LevelSelectPage = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { levels } = useLevelSelectStore();
  const { playSound } = useSound();

  const handleLevelSelect = (levelId: number) => {
    playSound(SoundType.BUTTON_CLICK);
    navigate(`/escape/${levelId}`);
  };

  const handleBack = () => {
    playSound(SoundType.BUTTON_CLICK);
    navigate('/');
  };

  const getStarColorClass = (starCount: number): string => {
    if (starCount >= 3) return 'gold';
    if (starCount === 2) return 'silver';
    return '';
  };

  return (
    <div className="level-select-wrapper">
      <div className="level-select-background"></div>
      <div className="level-select-overlay">
        <button onClick={handleBack} className="level-select-back-button">
            <FaArrowLeft />
        </button>
        <header className="level-select-header">
           <h1 className="level-select-title">{t('levelSelect.title')}</h1>
        </header>

        <main className="level-select-grid">
          {levels.map(level => (
            <button
              key={level.id}
              className={clsx('level-card', !level.unlocked && 'locked')}
              onClick={() => level.unlocked && handleLevelSelect(level.id)}
              disabled={!level.unlocked}
            >
              <div className="level-card-shine"></div>
              <div className="level-number">{level.id}</div>
              <div className="level-stars">
                {level.unlocked ? (
                  [...Array(3)].map((_, i) => (
                    <FaStar
                      key={i}
                      className={clsx(
                        'star-icon',
                        i < level.stars && 'collected',
                        i < level.stars && getStarColorClass(level.stars)
                      )}
                    />
                  ))
                ) : (
                  <FaLock className="lock-icon" />
                )}
              </div>
            </button>
          ))}
        </main>
      </div>
    </div>
  );
};

export default LevelSelectPage;