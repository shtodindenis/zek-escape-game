import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { FaPlay, FaHammer, FaCog } from 'react-icons/fa';
import MainMenuLayout from '@/components/common/MainMenuLayout';
import { process } from '@tauri-apps/api';
import { useSound } from '@/hooks/useSound';
import { SoundType } from '@/lib/soundPlayer';

const isTauri = !!window.__TAURI__;

const MainMenuPage = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { playSound } = useSound();

  const menuItems = [
    { text: t('mainMenu.escapeMode'), path: '/escape', icon: <FaPlay /> },
    { text: t('mainMenu.builderMode'), path: '/builder', icon: <FaHammer /> },
    { text: t('mainMenu.settings'), path: '/settings', icon: <FaCog /> },
  ];

  const handleNavigate = (path: string) => {
    playSound(SoundType.BUTTON_CLICK);
    navigate(path);
  };

  const handleExit = async () => {
    playSound(SoundType.BUTTON_CLICK);
    if (isTauri) {
      await process.exit(0);
    }
  };

  return (
    <MainMenuLayout>
      <nav className="menu-nav">
        <ul>
          {menuItems.map((item, index) => (
            <li key={item.path}>
              <button
                onClick={() => handleNavigate(item.path)}
                className="menu-button"
                style={{ '--delay': `${index * 0.1 + 0.5}s` } as React.CSSProperties}
              >
                <span className="menu-icon">{item.icon}</span>
                <span className="menu-text">{item.text}</span>
              </button>
            </li>
          ))}
           {isTauri && (
             <li>
                <button
                  onClick={handleExit}
                  className="menu-button exit-button"
                  style={{ '--delay': `${menuItems.length * 0.1 + 0.5}s` } as React.CSSProperties}
                >
                  <span className="menu-text">{t('mainMenu.exit')}</span>
                </button>
              </li>
           )}
        </ul>
      </nav>
    </MainMenuLayout>
  );
};

export default MainMenuPage;