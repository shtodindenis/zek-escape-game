import { Grid, CellType, Coordinate } from '@/types/game';

interface PathState {
  hasRedKey: boolean;
  hasBlueKey: boolean;
  hasCrowbar: boolean;
}

class Node {
  constructor(
    public parent: Node | null,
    public pos: Coordinate,
    public g: number = 0,
    public h: number = 0,
    public f: number = 0,
    public state: PathState = { hasRedKey: false, hasBlueKey: false, hasCrowbar: false }
  ) {}
}

const getHeuristic = (a: Coordinate, b: Coordinate): number => {
  return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
};

const getCost = (cellType: CellType): number => {
  switch (cellType) {
    case CellType.GUARD:
      return 10;
    case CellType.THUG:
      return 5;
    default:
      return 1;
  }
};

const isNeighboringDanger = (pos: Coordinate, grid: Grid): boolean => {
    const directions = [[0, -1], [0, 1], [-1, 0], [1, 0]];
    if (!grid || grid.length === 0) return false;
    const width = grid[0].length;
    const height = grid.length;

    for (const [dx, dy] of directions) {
        const checkPos = { x: pos.x + dx, y: pos.y + dy };
        if (checkPos.x >= 0 && checkPos.x < width && checkPos.y >= 0 && checkPos.y < height) {
            const cell = grid[checkPos.y][checkPos.x];
            if (cell === CellType.GUARD || cell === CellType.THUG) {
                return true;
            }
        }
    }
    return false;
};

export const getPath = (grid: Grid, start: Coordinate, end: Coordinate): Coordinate[] | null => {
  if (!grid || grid.length === 0 || !grid[0] || grid[0].length === 0 || !start || !end) {
    console.error("Pathfinding error: Invalid or empty grid provided, or start/end is missing.");
    return null;
  }

  const startNode = new Node(null, start);
  const endNode = new Node(null, end);

  const openList: Node[] = [startNode];
  const closedList: Set<string> = new Set();

  const width = grid[0].length;
  const height = grid.length;

  while (openList.length > 0) {
    openList.sort((a, b) => a.f - b.f);
    const currentNode = openList.shift()!;
    
    const posKey = `${currentNode.pos.x}-${currentNode.pos.y}-${currentNode.state.hasRedKey}-${currentNode.state.hasBlueKey}-${currentNode.state.hasCrowbar}`;
    if (closedList.has(posKey)) {
        continue;
    }
    
    closedList.add(posKey);

    if (currentNode.pos.x === endNode.pos.x && currentNode.pos.y === endNode.pos.y) {
      const path: Coordinate[] = [];
      let current: Node | null = currentNode;
      while (current) {
        path.unshift(current.pos);
        current = current.parent;
      }
      return path;
    }

    const directions = [[0, -1], [0, 1], [-1, 0], [1, 0]];
    for (const [dx, dy] of directions) {
      const nodePos = { x: currentNode.pos.x + dx, y: currentNode.pos.y + dy };

      if (nodePos.x < 0 || nodePos.x >= width || nodePos.y < 0 || nodePos.y >= height) {
        continue;
      }

      if ( (nodePos.x !== end.x || nodePos.y !== end.y) && isNeighboringDanger(nodePos, grid)) {
          continue;
      }

      const cellType = grid[nodePos.y][nodePos.x];
      
      if (cellType === CellType.WALL || cellType === CellType.WALL_BRICK) continue;
      if (cellType === CellType.DOOR_RED && !currentNode.state.hasRedKey) continue;
      if (cellType === CellType.DOOR_BLUE && !currentNode.state.hasBlueKey) continue;
      if (cellType === CellType.PLANK && !currentNode.state.hasCrowbar) continue;
      
      const newG = currentNode.g + getCost(cellType);
      
      const existingNodeIndex = openList.findIndex(node => 
        node.pos.x === nodePos.x && 
        node.pos.y === nodePos.y &&
        node.state.hasRedKey === currentNode.state.hasRedKey &&
        node.state.hasBlueKey === currentNode.state.hasBlueKey &&
        node.state.hasCrowbar === currentNode.state.hasCrowbar
      );

      if (existingNodeIndex !== -1 && newG >= openList[existingNodeIndex].g) {
          continue;
      }

      const newState: PathState = { ...currentNode.state };
      if (cellType === CellType.KEY_RED) newState.hasRedKey = true;
      if (cellType === CellType.KEY_BLUE) newState.hasBlueKey = true;
      if (cellType === CellType.CROWBAR) newState.hasCrowbar = true;

      const newNode = new Node(currentNode, nodePos, newG, getHeuristic(nodePos, endNode.pos), 0, newState);
      newNode.f = newNode.g + newNode.h;

      if(existingNodeIndex !== -1) {
        openList[existingNodeIndex] = newNode;
      } else {
        openList.push(newNode);
      }
    }
  }

  return null;
};