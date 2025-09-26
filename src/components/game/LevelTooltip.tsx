import { motion, AnimatePresence } from 'framer-motion';

type LevelTooltipProps = {
  message: string | null;
  isVisible: boolean;
};

const LevelTooltip = ({ message, isVisible }: LevelTooltipProps) => {
  return (
    <AnimatePresence>
      {isVisible && message && (
        <div className="level-tooltip-container">
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.9 }}
            transition={{ type: 'spring', stiffness: 200, damping: 20 }}
            className="level-tooltip-content"
          >
            <p>{message}</p>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default LevelTooltip;