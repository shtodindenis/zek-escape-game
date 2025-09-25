import { useState, useRef, useEffect, ReactNode } from 'react';
import { FaChevronDown } from 'react-icons/fa';

type DropMenuOption<T> = {
  value: T;
  label: string;
};

type DropMenuProps<T> = {
  options: DropMenuOption<T>[];
  selectedOption: DropMenuOption<T>;
  onSelect: (option: DropMenuOption<T>) => void;
  label?: string;
};

const DropMenu = <T extends string>({ options, selectedOption, onSelect, label }: DropMenuProps<T>) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (option: DropMenuOption<T>) => {
    onSelect(option);
    setIsOpen(false);
  };

  return (
    <div className="drop-menu-container" ref={menuRef}>
      {label && <span className="drop-menu-label">{label}</span>}
      <button className="drop-menu-toggle" onClick={() => setIsOpen(!isOpen)}>
        <span>{selectedOption.label}</span>
        <FaChevronDown className={`drop-menu-chevron ${isOpen ? 'open' : ''}`} />
      </button>
      {isOpen && (
        <ul className="drop-menu-list">
          {options.map((option) => (
            <li key={option.value}>
              <button
                className={`drop-menu-item ${selectedOption.value === option.value ? 'selected' : ''}`}
                onClick={() => handleSelect(option)}
              >
                {option.label}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default DropMenu;