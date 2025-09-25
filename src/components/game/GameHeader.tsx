import { useState } from 'react';
import { FaBars, FaRedo, FaListUl, FaCog, FaQuestionCircle, FaTimes, FaArrowLeft } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import clsx from 'clsx';

type GameHeaderProps = {
  levelId: number;
  onHelpClick: () => void;
  onRestart: () => void;
};

const GameHeader = ({ levelId, onHelpClick, onRestart }: GameHeaderProps) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleRestart = () => {
    onRestart();
    setIsMenuOpen(false);
  };

  const menuItems = [
    { text: t('gameHeader.restart'), icon: <FaRedo />, action: handleRestart },
    { text: t('gameHeader.levelSelect'), icon: <FaListUl />, action: () => navigate('/escape') },
    { text: t('gameHeader.settings'), icon: <FaCog />, action: () => navigate('/settings') },
    { text: t('gameHeader.help'), icon: <FaQuestionCircle />, action: onHelpClick },
  ];

  return (
    <>
      <header className="game-header">
        <button onClick={() => navigate('/escape')} className="game-header-button back-button">
          <FaArrowLeft />
        </button>
        <div className="game-header-level-title">
          {t('escapePage.titleShort', { levelId })}
        </div>
        <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="game-header-button menu-button">
          <FaBars />
        </button>
      </header>
      <div className={clsx("game-menu-overlay", isMenuOpen && "open")}>
        <div className="game-menu-content">
          <button onClick={() => setIsMenuOpen(false)} className="game-menu-close-button">
            <FaTimes />
          </button>
          <nav>
            <ul>
              {menuItems.map((item, index) => (
                <li key={index}>
                  <button onClick={item.action}>
                    <span>{item.icon}</span>
                    <p>{item.text}</p>
                  </button>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </div>
    </>
  );
};

export default GameHeader;