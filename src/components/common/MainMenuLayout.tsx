import { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

type MainMenuLayoutProps = {
  children: ReactNode;
};

const MainMenuLayout = ({ children }: MainMenuLayoutProps) => {
  const { t } = useTranslation();
  return (
    <div className="main-menu-wrapper">
      <div className="main-menu-background" />
      <div className="main-menu-overlay">
        <header className="main-menu-header">
          <h1 className="game-title">{t('mainMenu.title')}</h1>
        </header>
        <main className="main-menu-content">
          {children}
        </main>
      </div>
    </div>
  );
};

export default MainMenuLayout;