import { GameStore, EscapeState, BuilderState } from '@/store/commonTypes';
import Cell from './Cell';
import { useMemo, useState } from 'react';
import { CellType, Coordinate } from '@/types/game';
import { motion } from 'framer-motion';

type GameBoardProps = {
  store: GameStore;
  animate?: boolean;
};

const GameBoard = ({ store, animate = false }: GameBoardProps) => {
  const state = store();
  const { grid } = state;

  const isBuilder = 'majorTool' in state;
  const builderState = isBuilder ? (state as BuilderState) : null;
  const escapeState = !isBuilder ? (state as EscapeState) : null;
  
  const dangerZones = escapeState?.dangerZones || [];
  const playerPos = escapeState?.playerPos || null;
  const selection = builderState?.selection || [];
  
  const [isMouseDown, setIsMouseDown] = useState(false);

  const handleMouseDown = (pos: Coordinate) => {
    if (!builderState) return;
    setIsMouseDown(true);
    if (builderState.minorTool === 'brush' || builderState.minorTool === 'fill' || builderState.minorTool === 'move') {
      state.handleCellClick(pos);
    } else if (builderState.minorTool === 'rect' || builderState.minorTool === 'select_area') {
      builderState.setSelectionStart(pos);
    }
  };

  const handleMouseEnter = (pos: Coordinate) => {
    if (!builderState || !isMouseDown) return;
    if (builderState.minorTool === 'brush') {
      state.handleCellClick(pos);
    } else if (builderState.minorTool === 'rect' || builderState.minorTool === 'select_area') {
      builderState.setSelectionEnd(pos);
    }
  };

  const handleMouseUp = () => {
    if (!builderState) return;
    setIsMouseDown(false);
    if (builderState.minorTool === 'rect') {
      builderState.applySelectionAction();
    }
  };

  const selectionSet = useMemo(() => {
    return new Set(selection.map(c => `${c.x}-${c.y}`));
  }, [selection]);

  const dangerZoneSet = useMemo(() => {
    return new Set(dangerZones.map(c => `${c.x}-${c.y}`));
  }, [dangerZones]);

  const pathCoordinates = useMemo(() => {
    const pathCoords = new Map<string, { prev: Coordinate | null, visitedCount: number }>();
    if (!escapeState) return pathCoords;

    const path = escapeState.playerPath;
    if (!path) return pathCoords;

    for (let i = 0; i < path.length; i++) {
        const current = path[i];
        const key = `${current.x}-${current.y}`;
        const prev = i > 0 ? path[i - 1] : null;
        
        const existing = pathCoords.get(key);
        pathCoords.set(key, { 
            prev: prev, 
            visitedCount: (existing?.visitedCount || 0) + 1 
        });
    }

    return pathCoords;
  }, [escapeState]);

  if (!grid || grid.length === 0 || grid[0].length === 0) {
    return null;
  }
  
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.001,
      },
    },
  };

  const getCellType = (originalType: CellType, x: number, y: number): CellType => {
      if (playerPos && playerPos.x === x && playerPos.y === y) {
        if (originalType !== CellType.END) {
          return CellType.PLAYER;
        }
      }
      
      const pathInfo = pathCoordinates.get(`${x}-${y}`);
      if (pathInfo) {
          const isStart = x === state.startPos.x && y === state.startPos.y;
          if(!isStart && (!playerPos || playerPos.x !== x || playerPos.y !== y)) {
            return CellType.PLAYER_PATH;
          }
      }
      
      return originalType;
  }

  return (
    <motion.div
      variants={containerVariants}
      initial={animate ? "hidden" : "visible"}
      animate="visible"
      className="grid bg-zone-dark p-2 border-2 border-zone-border rounded-lg"
      style={{
        gridTemplateColumns: `repeat(${grid[0].length}, minmax(0, 1fr))`,
        aspectRatio: `${grid[0].length} / ${grid.length}`,
      }}
      onMouseUp={handleMouseUp}
      onMouseLeave={() => isMouseDown && handleMouseUp()}
    >
      {grid.map((row, y) =>
        row.map((originalCellType, x) => {
          const pathInfo = pathCoordinates.get(`${x}-${y}`);
          const cellType = getCellType(originalCellType, x, y);
          return (
            <Cell
              key={`${y}-${x}`}
              type={cellType}
              onMouseDown={() => handleMouseDown({x, y})}
              onMouseEnter={() => handleMouseEnter({x, y})}
              prevPos={pathInfo?.prev || null}
              currentPos={{ x, y }}
              isBuilder={isBuilder}
              animate={animate}
              isDangerZone={!isBuilder && dangerZoneSet.has(`${x}-${y}`)}
              visitedCount={pathInfo?.visitedCount || 0}
              isSelected={isBuilder && selectionSet.has(`${x}-${y}`)}
            />
          );
        })
      )}
    </motion.div>
  );
};

export default GameBoard;