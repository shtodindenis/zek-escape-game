import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { FaStar, FaUndo, FaTimesCircle } from 'react-icons/fa';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { useEscapeStore } from '@/store/escapeStore';
import { useLevelSelectStore } from '@/store/selectStore';
import GameBoard from '@/components/game/GameBoard';
import GameHeader from '@/components/game/GameHeader';
import HelpModal from '@/components/game/HelpModal';
import LevelTooltip from '@/components/game/LevelTooltip';
import clsx from 'clsx';
import Button from '@/components/common/Button';

const tooltips: Record<number, string> = {
  1: "Первый ход, он трудный самый. Доберись до выхода, используя стрелки или WASD.",
  3: "Видишь красные зоны? Это владения блатных и охраны. Обходи их стороной, если не ищешь проблем.",
  4: "На пути замок? Ищи ключ, он где-то поблизости. Без него дверь не поддастся.",
  8: "Некоторые стены сделаны из досок. Найди лом, и сможешь пробить себе новый путь.",
  15: "Ну все, доигрался, облава на выходе, петухам нет места на свободе.",
};

const EscapePage = () => {
  const { t } = useTranslation();
  const { levelId } = useParams<{ levelId: string }>();
  const navigate = useNavigate();

  const state = useEscapeStore();
  const {
    isFinished,
    playerPath,
    optimalPath,
    loadAndResetGame,
    isLoading,
    grid,
    resetGame: resetStore,
    isPathInvalid,
    undoMove,
    movePlayer,
  } = state;

  const { levels, setStars, unlockNextLevel } = useLevelSelectStore();

  const [showHelp, setShowHelp] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);
  const [showTooltip, setShowTooltip] = useState(false);

  const numericLevelId = levelId ? parseInt(levelId, 10) : 0;
  const maxLevel = levels.length;
  const isLastLevel = numericLevelId === maxLevel;

  useEffect(() => {
    if (numericLevelId > 0) {
      setInitialLoad(true);
      setShowTooltip(false);
      loadAndResetGame(numericLevelId).then(() => {
        setTimeout(() => setInitialLoad(false), 1000);
        if (tooltips[numericLevelId]) {
          setShowTooltip(true);
          setTimeout(() => setShowTooltip(false), 10000);
        }
      });
    } else {
      navigate('/escape');
    }
  }, [numericLevelId, loadAndResetGame, navigate]);

  const calculateStars = useCallback(() => {
    if (isPathInvalid || !isFinished || playerPath.length === 0 || optimalPath.length === 0) return 0;
    const similarity = optimalPath.length / playerPath.length;
    if (similarity >= 0.98) return 3;
    if (similarity >= 0.8) return 2;
    return 1;
  }, [isFinished, isPathInvalid, playerPath, optimalPath]);

  const stars = calculateStars();

  const handleRestart = () => {
    setInitialLoad(true);
    setShowTooltip(false);
    resetStore();
     if (tooltips[numericLevelId]) {
        setTimeout(() => {
            setShowTooltip(true);
            setTimeout(() => setShowTooltip(false), 10000);
        }, 500);
    }
    setTimeout(() => setInitialLoad(false), 500);
  };

  const handleNextLevel = () => {
    if (!isLastLevel) {
      navigate(`/escape/${numericLevelId + 1}`);
    }
  };
  
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (isFinished) return;
    
    let dx = 0, dy = 0;
    switch (e.key) {
      case 'w':
      case 'ArrowUp':
        dy = -1;
        break;
      case 's':
      case 'ArrowDown':
        dy = 1;
        break;
      case 'a':
      case 'ArrowLeft':
        dx = -1;
        break;
      case 'd':
      case 'ArrowRight':
        dx = 1;
        break;
      case 'z':
      case 'Backspace':
        e.preventDefault();
        undoMove();
        return;
    }
    
    if (dx !== 0 || dy !== 0) {
        e.preventDefault();
        movePlayer(dx, dy);
    }
  }, [movePlayer, undoMove, isFinished]);
  
  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);


  useEffect(() => {
    if (isFinished && numericLevelId > 0) {
      const finalStars = calculateStars();
      setStars(numericLevelId, finalStars);
      if (finalStars > 0) {
        unlockNextLevel(numericLevelId);
      }
    }
  }, [isFinished, numericLevelId, setStars, unlockNextLevel, calculateStars]);

  if (isLoading || !grid || grid.length === 0 || !grid[0] || grid[0].length === 0) {
    return (
      <div className="game-wrapper">
         <div className="game-background"></div>
         <div className="flex items-center justify-center h-full text-white text-3xl font-bold">
            {t('common.loadingLevel', { levelId: numericLevelId })}...
         </div>
      </div>
    );
  }

  const modalVariants: Variants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { opacity: 1, scale: 1, transition: { type: "spring", stiffness: 200, damping: 20 } },
    exit: { opacity: 0, scale: 0.8, transition: { duration: 0.2 } }
  };

  return (
    <div className="game-wrapper">
      <div className="game-background"></div>
      <GameHeader levelId={numericLevelId} onHelpClick={() => setShowHelp(true)} onRestart={handleRestart} />

      <LevelTooltip message={tooltips[numericLevelId]} isVisible={showTooltip} />
      
      <main className="game-board-container">
        <GameBoard store={useEscapeStore} animate={initialLoad} />
      </main>
      
      <AnimatePresence>
        {!isFinished && playerPath.length > 1 && (
             <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex gap-4"
            >
              <Button onClick={undoMove} variant="secondary" className="flex items-center gap-2">
                <FaUndo /> {t('gameControls.undo')}
              </Button>
            </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isFinished && (
          <motion.div
            className="game-success-overlay"
            initial={{ backdropFilter: "blur(0px)", backgroundColor: "rgba(0,0,0,0)" }}
            animate={{ backdropFilter: "blur(4px)", backgroundColor: "rgba(0,0,0,0.6)" }}
            exit={{ backdropFilter: "blur(0px)", backgroundColor: "rgba(0,0,0,0)" }}
          >
            <motion.div
              className="game-success-modal"
              variants={modalVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              {isPathInvalid ? (
                <>
                  <FaTimesCircle className="text-8xl text-red-500 mb-4" />
                  <h3 className="game-success-title text-red-500">{t('escapePage.failure')}</h3>
                  <p>{t('escapePage.failureDescription')}</p>
                </>
              ) : (
                <>
                  <h3 className="game-success-title">{t('escapePage.success')}</h3>
                  <div className="game-success-stars">
                    {[...Array(3)].map((_, i) => (
                      <FaStar key={i} className={clsx(i < stars ? 'collected' : '')} />
                    ))}
                  </div>
                  <p>{t('escapePage.yourPath', { count: playerPath.length })}</p>
                  <p>{t('escapePage.optimalPath', { count: optimalPath.length })}</p>
                </>
              )}
              <div className="game-success-actions">
                 <button onClick={handleRestart}>{t('gameControls.startOver')}</button>
                 <button onClick={() => navigate('/escape')}>{t('gameHeader.levelSelect')}</button>
                 {!isPathInvalid && !isLastLevel && (
                    <button onClick={handleNextLevel}>Следующий уровень</button>
                 )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {showHelp && <HelpModal onClose={() => setShowHelp(false)} />}
    </div>
  );
};

export default EscapePage;