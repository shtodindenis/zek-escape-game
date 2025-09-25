import { useTranslation } from 'react-i18next';
import { FaTimes } from 'react-icons/fa';
import { CellType } from '@/types/game';
import Cell from './Cell';

type HelpModalProps = {
  onClose: () => void;
};

const HelpModal = ({ onClose }: HelpModalProps) => {
  const { t } = useTranslation();

  const helpItems = [
    { type: CellType.START, text: t('helpModal.player') },
    { type: CellType.END, text: t('helpModal.exit') },
    { type: CellType.WALL, text: t('helpModal.wall') },
    { type: CellType.WALL_BRICK, text: t('helpModal.wallBrick') },
    { type: CellType.GUARD, text: t('helpModal.guard') },
    { type: CellType.THUG, text: t('helpModal.thug') },
    { type: CellType.PLANK, text: t('helpModal.plank') },
    { type: CellType.CROWBAR, text: t('helpModal.crowbar') },
    { type: CellType.DOOR_RED, text: t('helpModal.doorRed') },
    { type: CellType.KEY_RED, text: t('helpModal.keyRed') },
    { type: CellType.DOOR_BLUE, text: t('helpModal.doorBlue') },
    { type: CellType.KEY_BLUE, text: t('helpModal.keyBlue') },
  ];

  return (
    <div className="help-modal-backdrop" onClick={onClose}>
      <div className="help-modal-content" onClick={(e) => e.stopPropagation()}>
        <header className="help-modal-header">
          <h2>{t('helpModal.title')}</h2>
          <button onClick={onClose}><FaTimes /></button>
        </header>
        <div className="help-modal-body">
          <p className="help-modal-description">{t('helpModal.description')}</p>
          <ul className="help-modal-grid">
            {helpItems.map(item => (
              <li key={item.text} className="help-item">
                <div className="help-item-cell-wrapper">
                  {/* ИСПРАВЛЕНИЕ: Удалено несуществующее свойство onClick */}
                  <Cell type={item.type} currentPos={{ x: 0, y: 0 }} />
                </div>
                <span>{item.text}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default HelpModal;