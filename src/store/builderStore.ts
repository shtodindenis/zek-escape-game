import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { GameState, BuilderState, MajorTool, MinorTool } from './commonTypes';
import { CellType, GAME_CONFIG, Coordinate, Grid } from '@/types/game';
import { getPath } from '@/lib/pathfinding';
import { generateMaze as generateMazeLib, MazeSettings } from '@/lib/mazeGenerator';
import { parseLevelLayout } from '@/lib/levelLoader';

const cellToCharMap: Record<number, string> = {
  [CellType.EMPTY]: '_',
  [CellType.WALL]: 'W',
  [CellType.WALL_BRICK]: 'B',
  [CellType.START]: 'S',
  [CellType.END]: 'E',
  [CellType.GUARD]: 'G',
  [CellType.THUG]: 'T',
  [CellType.PLANK]: 'p',
  [CellType.CROWBAR]: 'c',
  [CellType.DOOR_RED]: '1',
  [CellType.KEY_RED]: '!',
  [CellType.DOOR_BLUE]: '2',
  [CellType.KEY_BLUE]: '@',
};

interface Preset {
  id: string;
  name: string;
  grid: Grid;
  gridSize: { width: number; height: number };
}

interface BuilderStateExtended extends BuilderState {
  presets: Preset[];
  savePreset: () => void;
  loadPreset: (id: string) => void;
  deletePreset: (id: string) => void;
}

const createInitialBuilderState = (width = GAME_CONFIG.WIDTH, height = GAME_CONFIG.HEIGHT): Omit<GameState & BuilderState,
  'setGrid' | 'handleCellClick' | 'resetGame' | 'setMajorTool' | 'setMinorTool' | 'setCurrentMaterial' | 'setBestTime' | 'setMazeSettings' | 'resizeGrid' |
  'startSimulation' | 'resetBuilder' | 'generateMaze' | 'exportLevel' | 'importLevel' | 'setSelectionStart' | 'setSelectionEnd' |
  'applySelectionAction'
> => {
  const grid = Array.from({ length: height }, () =>
    Array.from({ length: width }, () => CellType.EMPTY)
  );
  const startPos = { x: 1, y: Math.floor(height / 2) };
  const endPos = { x: width - 2, y: Math.floor(height / 2) };
  grid[startPos.y][startPos.x] = CellType.START;
  grid[endPos.y][endPos.x] = CellType.END;
  return {
    grid,
    gridSize: { width, height },
    startPos,
    endPos,
    isFinished: false,
    majorTool: 'build',
    minorTool: 'brush',
    currentMaterial: CellType.WALL,
    isSimulating: false,
    simulationTime: null,
    isPathPossible: true,
    bestTime: 0,
    mazeSettings: { corridorWidth: 1, extraPaths: 0, deadEndDensity: 0.5 },
    movingObject: null,
    selectionStart: null,
    selectionEnd: null,
    selection: [],
    clipboard: null,
  };
};

export const useBuilderStore = create<GameState & BuilderStateExtended>()(
  persist(
    (set, get) => ({
      ...createInitialBuilderState(),
      presets: [],

      setGrid: (newGrid) => set({ grid: newGrid }),

      setMajorTool: (tool) => {
        const defaultMinorTools: Record<MajorTool, MinorTool> = {
          build: 'brush',
          select: 'select_area',
          erase: 'brush',
        };
        set({ majorTool: tool, minorTool: defaultMinorTools[tool], selection: [], selectionStart: null, selectionEnd: null, clipboard: null });
      },

      setMinorTool: (tool) => {
        const { minorTool, applySelectionAction, selection } = get();
        if (minorTool === 'select_area' && tool !== 'select_area' && selection.length > 0) {
            applySelectionAction(tool);
        } else {
            set({ minorTool: tool });
        }
      },
      setCurrentMaterial: (material) => set({ currentMaterial: material }),
      setMazeSettings: (settings) => set(state => ({ mazeSettings: { ...state.mazeSettings, ...settings }})),
      setBestTime: (time) => set({ bestTime: time }),
      resizeGrid: (width, height) => set(createInitialBuilderState(width, height)),

      setSelectionStart: (pos) => {
        if (get().isSimulating) return;
        set({ selectionStart: pos, selectionEnd: pos, selection: [pos] });
      },
      setSelectionEnd: (pos) => {
          const { selectionStart } = get();
          if (!selectionStart || get().isSimulating) return;
          const newSelection: Coordinate[] = [];
          const x1 = Math.min(selectionStart.x, pos.x);
          const y1 = Math.min(selectionStart.y, pos.y);
          const x2 = Math.max(selectionStart.x, pos.x);
          const y2 = Math.max(selectionStart.y, pos.y);
          for (let y = y1; y <= y2; y++) {
              for (let x = x1; x <= x2; x++) {
                  newSelection.push({ x, y });
              }
          }
          set({ selectionEnd: pos, selection: newSelection });
      },

      applySelectionAction: (actionTool?: MinorTool) => {
        const { majorTool, selection, currentMaterial, grid, startPos, endPos } = get();
        const toolToApply = actionTool || get().minorTool;
        if (!selection.length) return;

        let newGrid = grid.map(r => [...r]);
        const material = majorTool === 'build' ? currentMaterial : CellType.EMPTY;

        if (toolToApply === 'rect') {
            selection.forEach(pos => {
                const isStartOrEnd = (pos.x === startPos.x && pos.y === startPos.y) || (pos.x === endPos.x && pos.y === endPos.y);
                if (!isStartOrEnd) {
                    newGrid[pos.y][pos.x] = material;
                }
            });
            set({ grid: newGrid, selection: [], selectionStart: null, selectionEnd: null });
        } else if (toolToApply === 'move') {
            const x1 = Math.min(...selection.map(p => p.x));
            const y1 = Math.min(...selection.map(p => p.y));
            const x2 = Math.max(...selection.map(p => p.x));
            const y2 = Math.max(...selection.map(p => p.y));

            const clipboardGrid: Grid = [];
            for (let y = y1; y <= y2; y++) {
                const row: CellType[] = [];
                for (let x = x1; x <= x2; x++) {
                    const cell = newGrid[y][x];
                    row.push(cell);
                    if (cell !== CellType.START && cell !== CellType.END) {
                        newGrid[y][x] = CellType.EMPTY;
                    }
                }
                clipboardGrid.push(row);
            }
            set({ clipboard: { grid: clipboardGrid, relativeStart: { x: x1, y: y1 } }, grid: newGrid, minorTool: 'move', selection: [], selectionStart: null, selectionEnd: null });
        } else if (toolToApply === 'rotate') {
            const x1 = Math.min(...selection.map(p => p.x));
            const y1 = Math.min(...selection.map(p => p.y));
            const x2 = Math.max(...selection.map(p => p.x));
            const y2 = Math.max(...selection.map(p => p.y));

            const width = x2 - x1 + 1;
            const height = y2 - y1 + 1;
            
            const fragment = Array.from({ length: height }, (_, i) => grid[y1 + i].slice(x1, x2 + 1));
            const rotatedFragment = Array.from({ length: width }, () => Array(height).fill(null));

            for (let y = 0; y < height; y++) {
                for (let x = 0; x < width; x++) {
                    rotatedFragment[x][height - 1 - y] = fragment[y][x];
                }
            }

            selection.forEach(pos => {
                const cell = grid[pos.y][pos.x];
                if (cell !== CellType.START && cell !== CellType.END) {
                    newGrid[pos.y][pos.x] = CellType.EMPTY;
                }
            });

            const newSelection: Coordinate[] = [];
            for (let y = 0; y < width; y++) {
                for (let x = 0; x < height; x++) {
                    const targetX = x1 + x;
                    const targetY = y1 + y;
                    if (targetX < get().gridSize.width && targetY < get().gridSize.height && rotatedFragment[y][x] !== null) {
                        newGrid[targetY][targetX] = rotatedFragment[y][x];
                        newSelection.push({x: targetX, y: targetY});
                    }
                }
            }
            set({ grid: newGrid, selection: newSelection, minorTool: 'rotate' });
        }
      },

      handleCellClick: (pos: Coordinate) => {
        const { grid, startPos, endPos, majorTool, minorTool, currentMaterial, isSimulating, gridSize, clipboard } = get();
        if (isSimulating) return;

        let newGrid = grid.map(r => [...r]);
        const isStartOrEnd = (pos.x === startPos.x && pos.y === startPos.y) || (pos.x === endPos.x && pos.y === endPos.y);

        if (clipboard && minorTool === 'move') {
            const pasteGrid = clipboard.grid;
            const pasteHeight = pasteGrid.length;
            const pasteWidth = pasteGrid[0].length;
            for (let y = 0; y < pasteHeight; y++) {
                for (let x = 0; x < pasteWidth; x++) {
                    const targetX = pos.x + x;
                    const targetY = pos.y + y;
                    if (targetX < gridSize.width && targetY < gridSize.height) {
                        newGrid[targetY][targetX] = pasteGrid[y][x];
                    }
                }
            }
            set({ grid: newGrid, clipboard: null, selection: [], selectionStart: null, selectionEnd: null, minorTool: 'select_area' });
            return;
        }

        const material = majorTool === 'build' ? currentMaterial : CellType.EMPTY;

        if (majorTool === 'build' || majorTool === 'erase') {
            if (minorTool === 'brush') {
                if (!isStartOrEnd) newGrid[pos.y][pos.x] = material;
            } else if (minorTool === 'fill') {
                if (isStartOrEnd) return;
                const targetType = grid[pos.y][pos.x];
                if (targetType === material) return;

                const q: Coordinate[] = [pos];
                const visited = new Set([`${pos.x},${pos.y}`]);
                newGrid[pos.y][pos.x] = material;

                while (q.length > 0) {
                    const current = q.shift()!;
                    const neighbors = [{x:0, y:1}, {x:0, y:-1}, {x:1, y:0}, {x:-1, y:0}];
                    for (const n of neighbors) {
                        const nextPos = { x: current.x + n.x, y: current.y + n.y };
                        const key = `${nextPos.x},${nextPos.y}`;
                        if (
                            nextPos.x >= 0 && nextPos.x < gridSize.width &&
                            nextPos.y >= 0 && nextPos.y < gridSize.height &&
                            !visited.has(key) &&
                            grid[nextPos.y][nextPos.x] === targetType
                        ) {
                            visited.add(key);
                            newGrid[nextPos.y][nextPos.x] = material;
                            q.push(nextPos);
                        }
                    }
                }
            }
        }
        set({ grid: newGrid, simulationTime: null });
      },

      startSimulation: () => {
        set({ isSimulating: true, simulationTime: null, isPathPossible: true, selection: [], selectionStart: null, selectionEnd: null, clipboard: null });
        setTimeout(() => {
          const { grid, startPos, endPos } = get();
          const path = getPath(grid, startPos, endPos);
          const newGrid: Grid = grid.map(row => row.map(cell =>
            (cell === CellType.OPTIMAL_PATH || cell === CellType.PLAYER_PATH) ? CellType.EMPTY : cell
          ));

          if (path) {
            path.slice(1, -1).forEach(p => {
              if (newGrid[p.y]?.[p.x] !== undefined) {
                newGrid[p.y][p.x] = CellType.OPTIMAL_PATH;
              }
            });
            const time = path.length * GAME_CONFIG.STEP_TIME_MS;
            set({ isSimulating: false, simulationTime: time / 1000, isPathPossible: true, grid: newGrid });
          } else {
            set({ isSimulating: false, simulationTime: 0, isPathPossible: false, grid: newGrid });
          }
        }, 500);
      },
      
      savePreset: () => {
        const { grid, gridSize, presets } = get();
        const newPreset: Preset = {
            id: new Date().toISOString(),
            name: `Preset ${presets.length + 1}`,
            grid: JSON.parse(JSON.stringify(grid)),
            gridSize: { ...gridSize }
        };
        set({ presets: [...presets, newPreset] });
      },

      loadPreset: (id) => {
          const preset = get().presets.find(p => p.id === id);
          if (preset) {
              const { grid, gridSize } = preset;
              const newGrid = JSON.parse(JSON.stringify(grid));
              let startPos = { x: -1, y: -1 };
              let endPos = { x: -1, y: -1 };
              newGrid.forEach((row: CellType[], y: number) => row.forEach((cell, x) => {
                  if (cell === CellType.START) startPos = { x, y };
                  if (cell === CellType.END) endPos = { x, y };
              }));
              
              set({ 
                  grid: newGrid, 
                  gridSize: { ...gridSize }, 
                  startPos, 
                  endPos,
                  simulationTime: null, 
                  isPathPossible: true,
              });
          }
      },

      deletePreset: (id) => {
          set(state => ({
              presets: state.presets.filter(p => p.id !== id)
          }));
      },

      generateMaze: () => {
        const { gridSize, startPos, endPos, mazeSettings } = get();
        const newGrid = generateMazeLib(gridSize.width, gridSize.height, startPos, endPos, mazeSettings);
        set({ grid: newGrid, simulationTime: null, selection: [], selectionStart: null, selectionEnd: null, clipboard: null });
      },

      importLevel: (jsonString) => {
        try {
            const levelData = JSON.parse(jsonString);
            if (!levelData.layout || !Array.isArray(levelData.layout)) throw new Error("Invalid format");
            const { grid, startPos, endPos, width, height } = parseLevelLayout(levelData);
            set({ grid, startPos, endPos, gridSize: { width, height }, simulationTime: null, movingObject: null, selection: [], selectionStart: null, selectionEnd: null, clipboard: null });
        } catch (e) {
            console.error("Failed to parse imported level JSON:", e);
        }
      },

      exportLevel: (grid) => {
        const layout = grid.map(row => row.map(cell => cellToCharMap[cell] || '_').join(''));
        const levelData = { id: 99, layout };
        const jsonString = JSON.stringify(levelData, null, 2);
        const blob = new Blob([jsonString], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'custom-level.json';
        a.click();
        URL.revokeObjectURL(url);
      },

      resetBuilder: () => {
        const { width, height } = get().gridSize;
        const initialState = createInitialBuilderState(width, height);
        set({
            ...initialState,
            bestTime: get().bestTime, 
        });
      },
      resetGame: () => get().resetBuilder(),
    }),
    {
      name: 'builder-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        grid: state.grid,
        gridSize: state.gridSize,
        startPos: state.startPos,
        endPos: state.endPos,
        mazeSettings: state.mazeSettings,
        presets: state.presets,
      }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.isSimulating = false;
          state.simulationTime = null;
          state.isPathPossible = true;
          state.selection = [];
          state.selectionStart = null;
          state.selectionEnd = null;
          state.clipboard = null;
        }
      }
    }
  )
);