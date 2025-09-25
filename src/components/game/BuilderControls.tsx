import { useState, useRef, useEffect } from 'react';
import { useBuilderStore } from '@/store/builderStore';
import { CellType } from '@/types/game';
import clsx from 'clsx';
import {
  FaPaintBrush, FaVectorSquare, FaFillDrip, FaMousePointer, FaSyncAlt,
  FaFileExport, FaRandom, FaRedo, FaFileImport, FaChevronDown, FaArrowsAlt, FaBroom, FaObjectGroup
} from 'react-icons/fa';
import { GiBrickWall, GiWoodPile, GiCrowbar, GiBrickPile } from 'react-icons/gi';
import { MdSecurity, MdGroup } from 'react-icons/md';
import { BsKeyFill, BsFillDoorOpenFill } from 'react-icons/bs';
import { useTranslation } from 'react-i18next';
import Button from '../common/Button';
import { motion, AnimatePresence } from 'framer-motion';
import { MinorTool } from '@/store/commonTypes';

const materialIcons: Partial<Record<CellType, JSX.Element>> = {
  [CellType.WALL]: <GiBrickWall />,
  [CellType.WALL_BRICK]: <GiBrickPile />,
  [CellType.GUARD]: <MdSecurity />,
  [CellType.THUG]: <MdGroup />,
  [CellType.PLANK]: <GiWoodPile />,
  [CellType.CROWBAR]: <GiCrowbar />,
  [CellType.DOOR_RED]: <BsFillDoorOpenFill className="text-red-500"/>,
  [CellType.KEY_RED]: <BsKeyFill className="text-red-500"/>,
  [CellType.DOOR_BLUE]: <BsFillDoorOpenFill className="text-sky-500"/>,
  [CellType.KEY_BLUE]: <BsKeyFill className="text-sky-500"/>,
};

const materialTools: { type: CellType, name: string }[] = [
  { type: CellType.WALL, name: 'Wall' },
  { type: CellType.WALL_BRICK, name: 'Brick Wall' },
  { type: CellType.GUARD, name: 'Guard' },
  { type: CellType.THUG, name: 'Thug' },
  { type: CellType.PLANK, name: 'Plank' },
  { type: CellType.CROWBAR, name: 'Crowbar' },
  { type: CellType.DOOR_RED, name: 'Red Door' },
  { type: CellType.KEY_RED, name: 'Red Key' },
  { type: CellType.DOOR_BLUE, name: 'Blue Door' },
  { type: CellType.KEY_BLUE, name: 'Blue Key' },
];

const accordionVariants = {
    open: { opacity: 1, height: "auto", marginTop: "1rem" },
    collapsed: { opacity: 0, height: 0, marginTop: 0 }
};

const AccordionSection = ({ title, children, isOpen, onToggle }: any) => (
    <div className="builder-section">
        <button onClick={onToggle} className="builder-section-header">
            <span>{title}</span>
            <motion.div animate={{ rotate: isOpen ? 180 : 0 }}>
                <FaChevronDown />
            </motion.div>
        </button>
        <AnimatePresence initial={false}>
            {isOpen && (
                <motion.div
                    key="content"
                    initial="collapsed"
                    animate="open"
                    exit="collapsed"
                    variants={accordionVariants}
                    transition={{ duration: 0.4, ease: [0.04, 0.62, 0.23, 0.98] }}
                    className="overflow-hidden"
                >
                    <div className="builder-section-content">
                        {children}
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    </div>
);


const BuilderControls = () => {
  const { t } = useTranslation();
  const state = useBuilderStore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [openSection, setOpenSection] = useState<string | null>(null);

  const buildTools: { id: MinorTool, icon: JSX.Element }[] = [
    { id: 'brush', icon: <FaPaintBrush/> },
    { id: 'rect', icon: <FaVectorSquare/> },
    { id: 'fill', icon: <FaFillDrip/> },
  ];
  const selectTools: { id: MinorTool, icon: JSX.Element }[] = [
    { id: 'select_area', icon: <FaObjectGroup/> },
    { id: 'move', icon: <FaArrowsAlt/> },
    { id: 'rotate', icon: <FaSyncAlt/> },
  ];
  
  const handleSetMinorTool = (tool: MinorTool) => {
    state.setMinorTool(tool);
  }

  useEffect(() => {
    const keydownHandler = (e: KeyboardEvent) => {
        if(e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
        if (e.key === '1') state.setMajorTool('build');
        if (e.key === '2') state.setMajorTool('select');
        if (e.key === '3') state.setMajorTool('erase');
    };

    window.addEventListener('keydown', keydownHandler);
    return () => window.removeEventListener('keydown', keydownHandler);
  }, [state.setMajorTool]);

  const handleFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result;
      if (typeof text === 'string') {
        state.importLevel(text);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const toggleSection = (section: string) => {
    setOpenSection(openSection === section ? null : section);
  };

  return (
    <div className="builder-controls-surface">
      <div className="major-tools-tabs">
        <button onClick={() => state.setMajorTool('build')} className={clsx(state.majorTool === 'build' && 'active')}><FaPaintBrush /><span>{t('builderPage.build')} (1)</span></button>
        <button onClick={() => state.setMajorTool('select')} className={clsx(state.majorTool === 'select' && 'active')}><FaMousePointer /><span>{t('builderPage.select')} (2)</span></button>
        <button onClick={() => state.setMajorTool('erase')} className={clsx(state.majorTool === 'erase' && 'active')}><FaBroom /><span>{t('builderPage.erase')} (3)</span></button>
      </div>
      
      <AnimatePresence mode="wait">
        <motion.div
            key={state.majorTool}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
        >
          {state.majorTool === 'build' && (<>
            <div className="tools-grid mb-2">
              {buildTools.map(tool => (
                <button key={tool.id} onClick={() => handleSetMinorTool(tool.id)} className={clsx('tool-button', state.minorTool === tool.id && 'active')}>{tool.icon}</button>
              ))}
            </div>
            <div className="tools-grid">
              {materialTools.map(tool => (
                <button
                  key={tool.type}
                  onClick={() => state.setCurrentMaterial(tool.type)}
                  className={clsx('tool-button', state.currentMaterial === tool.type && state.minorTool !== 'fill' && 'active')}
                >{materialIcons[tool.type]}</button>
              ))}
            </div>
          </>)}

          {state.majorTool === 'select' && (
            <div className="tools-grid">
                {selectTools.map(tool => (
                   <button key={tool.id} onClick={() => handleSetMinorTool(tool.id)} className={clsx('tool-button', state.minorTool === tool.id && 'active')}>{tool.icon}</button>
                ))}
            </div>
          )}

          {state.majorTool === 'erase' && (
             <div className="tools-grid">
                {buildTools.map(tool => (
                   <button key={tool.id} onClick={() => handleSetMinorTool(tool.id)} className={clsx('tool-button', state.minorTool === tool.id && 'active')}>{tool.icon}</button>
                ))}
            </div>
          )}
        </motion.div>
      </AnimatePresence>
      
      <Button onClick={state.startSimulation} disabled={state.isSimulating} className="w-full mt-4">
        {state.isSimulating ? t('gameControls.simulating') : t('gameControls.runZek')}
      </Button>
      
      <AccordionSection title={t('builderPage.gridSizeSettings')} isOpen={openSection === 'size'} onToggle={() => toggleSection('size')}>
          <div className="space-y-1">
              <label htmlFor="gridWidth">{t('builderPage.width')}: {state.gridSize.width}</label>
              <input type="range" id="gridWidth" min="15" max="51" step="2" value={state.gridSize.width} onChange={e => state.resizeGrid(+e.target.value, state.gridSize.height)} className="w-full" />
          </div>
          <div className="space-y-1">
              <label htmlFor="gridHeight">{t('builderPage.height')}: {state.gridSize.height}</label>
              <input type="range" id="gridHeight" min="9" max="31" step="2" value={state.gridSize.height} onChange={e => state.resizeGrid(state.gridSize.width, +e.target.value)} className="w-full" />
          </div>
      </AccordionSection>

      <AccordionSection title={t('builderPage.mazeSettingsTitle')} isOpen={openSection === 'maze'} onToggle={() => toggleSection('maze')}>
          <div className="space-y-1">
              <label>{t('builderPage.corridorWidth')}: {state.mazeSettings.corridorWidth}</label>
              <input type="range" min="1" max="3" value={state.mazeSettings.corridorWidth} onChange={e => state.setMazeSettings({ corridorWidth: +e.target.value })} className="w-full" />
          </div>
          <div className="space-y-1">
              <label>{t('builderPage.extraPaths')}: {state.mazeSettings.extraPaths}</label>
              <input type="range" min="0" max="10" value={state.mazeSettings.extraPaths} onChange={e => state.setMazeSettings({ extraPaths: +e.target.value })} className="w-full" />
          </div>
          <div className="space-y-1">
              <label>{t('builderPage.deadEndDensity')}: {state.mazeSettings.deadEndDensity}</label>
              <input type="range" min="0" max="1" step="0.1" value={state.mazeSettings.deadEndDensity} onChange={e => state.setMazeSettings({ deadEndDensity: +e.target.value })} className="w-full" />
          </div>
      </AccordionSection>

      <div className="grid grid-cols-2 gap-2 mt-4">
        <Button onClick={state.generateMaze} variant="secondary" className="action-button"><FaRandom /><span>{t('builderPage.generateMaze')}</span></Button>
        <Button onClick={() => state.exportLevel(state.grid)} variant="secondary" className="action-button"><FaFileExport /><span>{t('builderPage.exportLevel')}</span></Button>
        <Button onClick={() => fileInputRef.current?.click()} variant="secondary" className="action-button"><FaFileImport /><span>{t('builderPage.importLevel')}</span></Button>
        <input type="file" ref={fileInputRef} onChange={handleFileImport} accept=".json" className="hidden" />
        <Button onClick={state.resetGame} variant="secondary" className="action-button"><FaRedo/><span>{t('gameControls.startOver')}</span></Button>
      </div>
    </div>
  );
}

export default BuilderControls;