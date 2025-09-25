import { Routes, Route, useLocation } from 'react-router-dom';
import MainMenuPage from '@/pages/MainMenuPage';
import EscapePage from '@/pages/EscapePage';
import BuilderPage from '@/pages/BuilderPage';
import SettingsPage from '@/pages/SettingsPage';
import LevelSelectPage from '@/pages/LevelSelectPage';
import PageTransition from '@/components/common/PageTransition';

const AppRouter = () => {
  const location = useLocation();

  return (
    <Routes location={location}>
      <Route path="/" element={<PageTransition><MainMenuPage /></PageTransition>} />
      <Route path="settings" element={<PageTransition><SettingsPage /></PageTransition>} />
      <Route path="escape" element={<PageTransition><LevelSelectPage /></PageTransition>} />
      <Route path="escape/:levelId" element={<PageTransition><EscapePage /></PageTransition>} />
      <Route path="builder" element={<PageTransition><BuilderPage /></PageTransition>} />
    </Routes>
  );
};

export default AppRouter;