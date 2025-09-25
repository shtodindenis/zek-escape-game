import GameBoard from '@/components/game/GameBoard';
import BuilderControls from '@/components/game/BuilderControls';
import BuilderPresets from '@/components/game/BuilderPresets';
import { useBuilderStore } from '@/store/builderStore';
import { useTranslation } from 'react-i18next';
import { useBuilderLogic } from '@/hooks/useBuilderLogic';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft } from 'react-icons/fa';

const BuilderPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  
  const { 
    isSimulating, 
    simulationTime, 
    isPathPossible,
    bestTime
  } = useBuilderLogic();

  return (
    <div className="builder-wrapper">
        <div className="builder-background" />
        <div className="builder-overlay">
            <header className="builder-header">
                <button 
                  onClick={() => navigate('/')} 
                  className="absolute top-4 left-6 z-10 flex items-center gap-2 px-4 py-2 bg-gray-700/80 text-white rounded-lg hover:bg-gray-600 transition-colors"
                >
                  <FaArrowLeft />
                  <span>{t('levelSelect.back')}</span>
                </button>
                <h1 className="builder-title">{t('builderPage.title')}</h1>
            </header>
            
            <main className="builder-main-content">
                <BuilderPresets />
                
                <div className="builder-board-container">
                    <GameBoard store={useBuilderStore} />
                </div>
                
                <aside className="builder-controls-container">
                    <div className="builder-info-panel">
                        <h3 className="font-bold text-lg">{t('gameControls.controls')}</h3>
                        <p className="text-gray-300 text-sm">{t('builderPage.description')}</p>
                        <hr className="border-gray-600 my-2" />
                        <p className="text-sm">{t('builderPage.recordTime', { time: bestTime.toFixed(2) })}</p>
                        <AnimatePresence>
                        {isSimulating && (
                            <motion.p 
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="text-yellow-400 text-sm"
                            >
                                {t('builderPage.simulationInProgress')}
                            </motion.p>
                        )}
                        </AnimatePresence>
                        {simulationTime !== null && (
                            <motion.div 
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="text-sm"
                            >
                                <p>{t('builderPage.escapeTime', { time: simulationTime.toFixed(2) })}</p>
                                {!isPathPossible && <p className="text-red-500 font-bold mt-1">{t('builderPage.escapeImpossible')}</p>}
                            </motion.div>
                        )}
                    </div>
                    <BuilderControls />
                </aside>
            </main>
        </div>
    </div>
  );
};

export default BuilderPage;