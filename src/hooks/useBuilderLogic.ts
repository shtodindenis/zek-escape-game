import { useEffect } from 'react';
import { useBuilderStore } from '@/store/builderStore';
import { getHighScore, setHighScore } from '@/api/localStorage';

export const useBuilderLogic = () => {
  const {
    simulationTime,
    bestTime,
    setBestTime,
  } = useBuilderStore(state => ({
    simulationTime: state.simulationTime,
    bestTime: state.bestTime,
    setBestTime: state.setBestTime,
  }));

  useEffect(() => {
    setBestTime(getHighScore());
  }, [setBestTime]);
  
  useEffect(() => {
    if (simulationTime !== null && simulationTime > bestTime) {
      setHighScore(simulationTime);
      setBestTime(simulationTime);
    }
  }, [simulationTime, bestTime, setBestTime]);
  
  return useBuilderStore();
};