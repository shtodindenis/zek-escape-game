import { Grid, CellType, Coordinate } from '@/types/game';

export interface MazeSettings {
  corridorWidth: number;
  extraPaths: number;
  deadEndDensity: number;
}

function shuffle<T>(array: T[]): T[] {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

export const generateMaze = (
  width: number,
  height: number,
  startPos: Coordinate,
  endPos: Coordinate,
  settings: MazeSettings
): Grid => {
  const grid: Grid = Array.from({ length: height }, () => Array(width).fill(CellType.WALL));
  const step = settings.corridorWidth + 1;

  function isInside(x: number, y: number, margin = 0) {
    return x >= margin && x < width - margin && y >= margin && y < height - margin;
  }

  const stack: Coordinate[] = [];
  const startX = startPos.x % 2 !== 0 ? startPos.x : startPos.x + 1;
  const startY = startPos.y % 2 !== 0 ? startPos.y : startPos.y + 1;

  if (isInside(startX, startY, 1)) {
    stack.push({ x: startX, y: startY });
    grid[startY][startX] = CellType.EMPTY;
  }

  while (stack.length > 0) {
    const current = stack[stack.length - 1];
    const neighbors = [];

    const directions = shuffle([{ x: 0, y: -step }, { x: 0, y: step }, { x: -step, y: 0 }, { x: step, y: 0 }]);

    for (const dir of directions) {
      const nx = current.x + dir.x;
      const ny = current.y + dir.y;

      if (isInside(nx, ny, 1) && grid[ny][nx] === CellType.WALL) {
        neighbors.push({ x: nx, y: ny });
      }
    }

    if (neighbors.length > 0) {
      const next = neighbors[0];
      for (let i = 0; i <= step; i++) {
        for (let j = 0; j <= step; j++) {
           const wallX = current.x + Math.round(i * (next.x - current.x) / step);
           const wallY = current.y + Math.round(j * (next.y - current.y) / step);
           if(isInside(wallX, wallY)) grid[wallY][wallX] = CellType.EMPTY;
        }
      }
      stack.push(next);
    } else {
      stack.pop();
    }
  }

  for(let i=0; i< settings.extraPaths; i++){
      const x = Math.floor(Math.random() * (width-2)) + 1;
      const y = Math.floor(Math.random() * (height-2)) + 1;
      if(grid[y][x] === CellType.WALL){
          if( (grid[y-1][x] === CellType.EMPTY && grid[y+1][x] === CellType.EMPTY) ||
              (grid[y][x-1] === CellType.EMPTY && grid[y][x+1] === CellType.EMPTY) ){
              grid[y][x] = CellType.EMPTY;
          }
      }
  }

  const deadEnds = [];
  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      if (grid[y][x] === CellType.EMPTY) {
        let emptyNeighbors = 0;
        if (grid[y - 1][x] === CellType.EMPTY) emptyNeighbors++;
        if (grid[y + 1][x] === CellType.EMPTY) emptyNeighbors++;
        if (grid[y][x - 1] === CellType.EMPTY) emptyNeighbors++;
        if (grid[y][x + 1] === CellType.EMPTY) emptyNeighbors++;
        if (emptyNeighbors === 1) deadEnds.push({ x, y });
      }
    }
  }
  shuffle(deadEnds);
  const numToFill = Math.floor(deadEnds.length * (1 - settings.deadEndDensity));
  for(let i=0; i < numToFill; i++){
      grid[deadEnds[i].y][deadEnds[i].x] = CellType.WALL;
  }

  grid[startPos.y][startPos.x] = CellType.START;
  grid[endPos.y][endPos.x] = CellType.END;
  
  const clearAround = (pos: Coordinate) => {
    [-1, 0, 1].forEach(dx => {
      [-1, 0, 1].forEach(dy => {
        if(dx === 0 && dy === 0) return;
        const nx = pos.x + dx;
        const ny = pos.y + dy;
        if(isInside(nx, ny) && grid[ny][nx] === CellType.WALL) {
            grid[ny][nx] = CellType.EMPTY;
        }
      });
    });
  };
  
  if (grid[startPos.y][startPos.x-1] === CellType.WALL) grid[startPos.y][startPos.x-1] = CellType.EMPTY;
  if (grid[endPos.y][endPos.x-1] === CellType.WALL) grid[endPos.y][endPos.x-1] = CellType.EMPTY;

  return grid;
};