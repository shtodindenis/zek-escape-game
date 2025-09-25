import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface LevelState {
  id: number;
  stars: number;
  unlocked: boolean;
}

interface LevelStoreState {
  levels: LevelState[];
  unlockNextLevel: (currentLevelId: number) => void;
  setStars: (levelId: number, stars: number) => void;
}

const initialLevels: LevelState[] = Array.from({ length: 15 }, (_, i) => ({
  id: i + 1,
  stars: 0,
  unlocked: i === 0,
}));

export const useLevelSelectStore = create<LevelStoreState>()(
  persist(
    (set, get) => ({
      levels: initialLevels,

      setStars: (levelId, stars) => {
        set((state) => ({
          levels: state.levels.map((level) =>
            level.id === levelId ? { ...level, stars: Math.max(level.stars, stars) } : level
          ),
        }));
      },

      unlockNextLevel: (currentLevelId: number) => {
        const currentLevel = get().levels.find(l => l.id === currentLevelId);
        if (!currentLevel || currentLevel.stars === 0) return;

        const nextLevelId = currentLevelId + 1;
        if (nextLevelId > get().levels.length) return;

        set(state => ({
          levels: state.levels.map(level => 
            level.id === nextLevelId ? { ...level, unlocked: true } : level
          )
        }));
      },
    }),
    {
      name: 'level-select-storage',
    }
  )
);