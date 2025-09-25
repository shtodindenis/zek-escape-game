import { Outlet } from 'react-router-dom';
import { useSettingsStore } from '@/store/settingsStore';
import clsx from 'clsx';

const Layout = () => {
  const { aspectRatio } = useSettingsStore();

  const aspectRatios: Record<string, string> = {
    '16:9': 'aspect-[16/9]',
    '4:3': 'aspect-[4/3]',
    '21:9': 'aspect-[21/9]',
    'auto': '',
  };

  const wrapperClasses = clsx(
    "mx-auto transition-all duration-300 w-full h-full",
    aspectRatio !== 'auto' 
      ? `max-h-[calc(100vh-4rem)] ${aspectRatios[aspectRatio]}`
      : 'max-w-7xl'
  );
  
  return (
    <div className="fixed inset-0 p-4 flex flex-col">
      <div className={wrapperClasses}>
          <Outlet />
      </div>
    </div>
  );
};

export default Layout;