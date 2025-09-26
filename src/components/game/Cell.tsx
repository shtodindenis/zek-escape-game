import { CellType, Coordinate, BuilderTool } from '@/types/game';
import clsx from 'clsx';
import { memo } from 'react';
import { motion } from 'framer-motion';
import {
  FaUserSecret, FaUserFriends, FaKey, FaLock, FaShoePrints, FaArrowsAlt, FaPaintBrush, FaMousePointer
} from 'react-icons/fa';
import { GiBrickWall, GiWoodPile, GiCrowbar, GiBrickPile } from 'react-icons/gi';
import { BsFillDoorOpenFill } from 'react-icons/bs';
import { MdSecurity } from 'react-icons/md';

type CellProps = {
  type: CellType;
  onMouseDown?: () => void;
  onMouseEnter?: () => void;
  prevPos?: Coordinate | null;
  currentPos: Coordinate;
  isBuilder?: boolean;
  animate?: boolean;
  isDangerZone?: boolean;
  visitedCount?: number;
  isSelected?: boolean;
};

const getRotationClass = (prevPos: Coordinate | null, currentPos: Coordinate): string => {
  if (!prevPos) return '-rotate-90';
  const dx = currentPos.x - prevPos.x;
  const dy = currentPos.y - prevPos.y;
  if (dx === 1) return 'rotate-0';
  if (dx === -1) return 'rotate-180';
  if (dy === 1) return 'rotate-90';
  if (dy === -1) return '-rotate-90';
  return '-rotate-90';
};

const iconMap: Record<CellType | BuilderTool, (rotationClass: string) => JSX.Element | null> = {
  [CellType.EMPTY]: () => null,
  [CellType.WALL]: () => <GiBrickWall className="text-gray-400" />,
  [CellType.WALL_BRICK]: () => <GiBrickPile className="text-gray-500" />,
  [CellType.START]: () => <FaUserSecret className="text-blue-400" />,
  [CellType.PLAYER]: () => <FaUserSecret className="text-blue-400" />,
  [CellType.END]: () => <BsFillDoorOpenFill className="text-green-400" />,
  [CellType.GUARD]: () => <MdSecurity className="text-red-500 guard-icon-animated" />,
  [CellType.THUG]: () => <FaUserFriends className="text-yellow-500 guard-icon-animated" />,
  [CellType.PLAYER_PATH]: (rotation) => <FaShoePrints className={clsx("text-blue-300 transition-transform", rotation)} />,
  [CellType.OPTIMAL_PATH]: (rotation) => <FaShoePrints className={clsx("text-green-400 opacity-70 transition-transform", rotation)} />,
  [CellType.PLANK]: () => <GiWoodPile className="text-yellow-600" />,
  [CellType.CROWBAR]: () => <GiCrowbar className="text-orange-400" />,
  [CellType.DOOR_RED]: () => <FaLock className="text-red-500" />,
  [CellType.KEY_RED]: () => <FaKey className="text-red-500" />,
  [CellType.DOOR_BLUE]: () => <FaLock className="text-sky-500" />,
  [CellType.KEY_BLUE]: () => <FaKey className="text-sky-500" />,
  [BuilderTool.MOVE]: () => <FaArrowsAlt />,
  [BuilderTool.FILL]: () => <FaPaintBrush />,
  [BuilderTool.SELECT]: () => <FaMousePointer />,
};

const cellBgClasses: Record<CellType, string> = {
  [CellType.EMPTY]: 'bg-zone-gray hover:bg-opacity-80',
  [CellType.WALL]: 'bg-gray-800',
  [CellType.WALL_BRICK]: 'bg-gray-800',
  [CellType.START]: 'bg-blue-900',
  [CellType.PLAYER]: 'bg-blue-900',
  [CellType.END]: 'bg-green-900',
  [CellType.GUARD]: 'bg-red-900',
  [CellType.THUG]: 'bg-yellow-900',
  [CellType.PLAYER_PATH]: 'bg-blue-900/50',
  [CellType.OPTIMAL_PATH]: 'bg-green-900/50',
  [CellType.PLANK]: 'bg-yellow-900',
  [CellType.CROWBAR]: 'bg-orange-900',
  [CellType.DOOR_RED]: 'bg-red-900',
  [CellType.KEY_RED]: 'bg-red-900',
  [CellType.DOOR_BLUE]: 'bg-sky-900',
  [CellType.KEY_BLUE]: 'bg-sky-900',
};

const cellVariants = {
  hidden: { opacity: 0, scale: 0.5 },
  visible: { opacity: 1, scale: 1 },
};

const Cell = memo(({ type, onMouseDown, onMouseEnter, prevPos, currentPos, isBuilder = false, animate = false, isDangerZone = false, visitedCount = 0, isSelected = false }: CellProps) => {
  const rotationClass = getRotationClass(prevPos || null, currentPos);
  
  const pathStyle = type === CellType.PLAYER_PATH && visitedCount > 1
    ? {
        filter: `saturate(${Math.max(0, 1 - (visitedCount - 1) * 0.2)}) brightness(${1 + (visitedCount - 1) * 0.1})`
      }
    : {};

  return (
    <motion.div
      variants={cellVariants}
      transition={animate ? {} : { duration: 0, delay: 0 }}
      onMouseDown={onMouseDown}
      onMouseEnter={onMouseEnter}
      className={clsx(
        'cell-base',
        cellBgClasses[type],
        isDangerZone && 'danger-zone',
        isSelected && 'cell-selected',
      )}
      style={pathStyle}
    >
      <div className="cell-icon">
        {iconMap[type as CellType | BuilderTool](rotationClass)}
      </div>
    </motion.div>
  );
});

export default Cell;