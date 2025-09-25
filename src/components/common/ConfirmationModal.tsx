import { motion, AnimatePresence, Variants } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { FaExclamationTriangle } from 'react-icons/fa';

type ConfirmationModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
};

const backdropVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
};

const modalVariants: Variants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: { opacity: 1, scale: 1, transition: { type: "spring" as const, stiffness: 200, damping: 20 } },
  exit: { opacity: 0, scale: 0.8, transition: { duration: 0.2 } }
};

const ConfirmationModal = ({ isOpen, onClose, onConfirm, title, message }: ConfirmationModalProps) => {
  const { t } = useTranslation();

  if (!isOpen) {
    return null;
  }

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      variants={backdropVariants}
      initial="hidden"
      animate="visible"
      exit="hidden"
      onClick={onClose}
    >
      <motion.div
        className="bg-gray-800 border border-gray-600 rounded-2xl p-8 text-center text-white shadow-lg flex flex-col items-center gap-4 w-full max-w-md"
        variants={modalVariants}
        onClick={(e) => e.stopPropagation()}
      >
        <FaExclamationTriangle className="text-5xl text-yellow-400 mb-2" />
        <h3 className="text-2xl font-bold">{title}</h3>
        <p className="text-gray-300">{message}</p>
        <div className="flex gap-4 mt-6">
          <button
            onClick={onConfirm}
            className="px-6 py-2 bg-red-600 hover:bg-red-700 rounded-lg font-semibold uppercase tracking-wide transition-all"
          >
            {t('settingsPage.confirmReset')}
          </button>
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-600 hover:bg-gray-500 rounded-lg font-semibold uppercase tracking-wide transition-all"
          >
            {t('settingsPage.cancel')}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default ConfirmationModal;