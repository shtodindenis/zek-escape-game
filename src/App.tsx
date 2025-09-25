import AppRouter from '@/routes/AppRouter';
import { AnimatePresence } from 'framer-motion';
import { useMusic } from '@/hooks/useMusic';

function App() {
  useMusic();

  return (
    <div className="bg-zone-dark text-zone-light min-h-screen font-sans">
      <AnimatePresence mode="wait">
        <AppRouter />
      </AnimatePresence>
    </div>
  );
}

export default App;