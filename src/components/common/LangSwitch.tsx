import { useTranslation } from 'react-i18next';
import Switch from './Switch';
import { useSound } from '@/hooks/useSound';
import { SoundType } from '@/lib/soundPlayer';

const LanguageSwitch = () => {
  const { i18n } = useTranslation();
  const { playSound } = useSound();

  const isRu = i18n.language.startsWith('ru');

  const handleToggle = () => {
    playSound(SoundType.BUTTON_CLICK);
    const newLang = isRu ? 'en' : 'ru';
    i18n.changeLanguage(newLang);
  };

  return (
    <Switch
      isOn={isRu}
      onToggle={handleToggle}
      onText="РУС"
      offText="ENG"
    />
  );
};

export default LanguageSwitch;