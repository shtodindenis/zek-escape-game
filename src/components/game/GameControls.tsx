import { GameStore } from '@/store/commonTypes';
import Button from '../common/Button';
import BuilderControls from './BuilderControls';
import { useTranslation } from 'react-i18next';
import { FaRedo } from 'react-icons/fa';

const EscapeControls = () => {
  return null;
}

const GameControls = ({ store }: { store: GameStore }) => {
  const { t } = useTranslation();
  const state = store();
  const isBuilder = 'currentTool' in state;

  return (
    <div className="p-4 bg-zone-gray rounded-lg space-y-4">
       <h3 className="font-bold text-lg">{t('gameControls.controls')}</h3>
       
       {isBuilder ? <BuilderControls /> : <EscapeControls />}
       
       <Button onClick={state.resetGame} variant="secondary" className="w-full flex items-center justify-center gap-2">
         <FaRedo/>
         <span>{t('gameControls.startOver')}</span>
       </Button>
    </div>
  );
};

export default GameControls;