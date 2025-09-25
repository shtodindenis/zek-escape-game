import { useState, useEffect } from 'react';
import clsx from 'clsx';

type SwitchProps = {
  isOn: boolean;
  onToggle: () => void;
  onText?: string;
  offText?: string;
  className?: string;
};

const Switch = ({ isOn, onToggle, onText = 'On', offText = 'Off', className }: SwitchProps) => {
  const [isMoving, setIsMoving] = useState(false);

  useEffect(() => {
    setIsMoving(true);
    const timer = setTimeout(() => {
      setIsMoving(false);
    }, 500);

    return () => clearTimeout(timer);
  }, [isOn]);

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    onToggle();
  };

  return (
    <button
      onClick={handleClick}
      className={clsx(
        'toggle-switch',
        isOn ? 'toggle-switch--on' : 'toggle-switch--off',
        isMoving && 'toggle-switch--moving',
        className
      )}
      data-on-text={onText}
      data-off-text={offText}
      aria-pressed={isOn}
    />
  );
};

export default Switch;