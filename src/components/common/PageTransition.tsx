import { motion, Variants } from 'framer-motion';
import { ReactNode } from 'react';
import { useLocation } from 'react-router-dom';

type PageTransitionProps = {
  children: ReactNode;
};

const pageVariants: Variants = {
  initial: {
    opacity: 0,
  },
  in: {
    opacity: 1,
    transition: {
      duration: 0.4,
      ease: 'easeOut',
    },
  },
  out: {
    opacity: 0,
    transition: {
      duration: 0.4,
      ease: 'easeOut',
    },
  },
};

const PageTransition = ({ children }: PageTransitionProps) => {
  const location = useLocation();

  return (
    <motion.div
      key={location.pathname}
      className="page-transition-wrapper"
      initial="initial"
      animate="in" // Добавляем animate
      exit="out"   // Добавляем exit
      variants={pageVariants}
    >
      {children}
    </motion.div>
  );
};

export default PageTransition;