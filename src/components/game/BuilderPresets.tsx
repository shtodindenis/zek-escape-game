import { useBuilderStore } from '@/store/builderStore';
import { FaSave, FaTrash } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';

const BuilderPresets = () => {
    const { t } = useTranslation();
    const { 
        presets, 
        savePreset, 
        loadPreset, 
        deletePreset 
    } = useBuilderStore(state => ({
        presets: state.presets,
        savePreset: state.savePreset,
        loadPreset: state.loadPreset,
        deletePreset: state.deletePreset,
    }));

    return (
        <aside className="builder-presets-container">
            <div className="builder-presets-surface">
                <h3 className="text-lg font-bold text-center mb-3">
                    {t('builderPage.presets')}
                </h3>
                
                <ul className="presets-list">
                    <AnimatePresence>
                        {presets.map((preset, index) => (
                            <motion.li
                                key={preset.id}
                                layout
                                initial={{ opacity: 0, y: -20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, x: -50 }}
                                transition={{ duration: 0.3 }}
                                className="preset-item"
                                onClick={() => loadPreset(preset.id)}
                            >
                                <span>{preset.name}</span>
                                <button 
                                    className="preset-delete-btn" 
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        deletePreset(preset.id);
                                    }}
                                >
                                    <FaTrash />
                                </button>
                            </motion.li>
                        ))}
                    </AnimatePresence>
                </ul>

                <button 
                    onClick={savePreset} 
                    className="save-preset-btn"
                >
                    <FaSave />
                    <span>{t('builderPage.savePreset')}</span>
                </button>
            </div>
        </aside>
    );
};

export default BuilderPresets;