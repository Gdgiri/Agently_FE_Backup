import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, Zap } from 'lucide-react';
import { NODE_REGISTRY, CATEGORY_CONFIG, NodeCategory } from './nodeRegistry';
import { cn } from '../ui';

interface NodeTypeSelectorProps {
    isOpen: boolean;
    onClose: () => void;
    category: NodeCategory;
    onSelect: (subtype: string) => void;
}

export const NodeTypeSelector: React.FC<NodeTypeSelectorProps> = ({
    isOpen,
    onClose,
    category,
    onSelect
}) => {
    const [searchQuery, setSearchQuery] = useState('');

    const filteredSubtypes = useMemo(() => {
        return Object.values(NODE_REGISTRY).filter(item =>
            item.category === category &&
            (item.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
                item.description.toLowerCase().includes(searchQuery.toLowerCase()))
        );
    }, [category, searchQuery]);

    React.useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && isOpen) {
                onClose();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, onClose]);

    const config = CATEGORY_CONFIG[category] || { hex: '#000', label: 'Unknown' };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm"
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="relative w-full max-w-2xl bg-white rounded-[2rem] shadow-2xl overflow-hidden border border-gray-100"
                    >
                        {/* Header */}
                        <div className="px-8 py-6 border-b border-gray-50 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div
                                    className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg"
                                    style={{ backgroundColor: `${config.hex}15`, color: config.hex }}
                                >
                                    <Zap size={24} className="fill-current" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-black text-gray-900 leading-none mb-1">
                                        Select {config.label} Type
                                    </h3>
                                    <p className="text-xs font-medium text-gray-400 uppercase tracking-widest">
                                        Customize your workflow step
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={onClose}
                                className="p-2 hover:bg-gray-100 rounded-xl transition-colors text-gray-400"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* Search */}
                        <div className="px-8 py-4 bg-gray-50/50 border-b border-gray-50">
                            <div className="relative group">
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#25D366] transition-colors">
                                    <Search size={18} />
                                </div>
                                <input
                                    type="text"
                                    placeholder={`Search ${config.label.toLowerCase()} types...`}
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-12 pr-6 py-3 bg-white border border-gray-100 rounded-2xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#25D366]/20 focus:border-[#25D366] transition-all shadow-sm"
                                    autoFocus
                                />
                            </div>
                        </div>

                        {/* Subtypes Grid */}
                        <div className="p-8 max-h-[60vh] overflow-y-auto custom-scrollbar">
                            <div className="grid grid-cols-2 gap-4">
                                {filteredSubtypes.map((subtype) => (
                                    <button
                                        key={subtype.type}
                                        onClick={() => onSelect(subtype.type)}
                                        className="group relative flex items-start gap-4 p-5 rounded-2xl border border-gray-100 hover:border-[#25D366] hover:bg-[#25D366]/[0.02] hover:shadow-[0_8px_30px_rgba(0,0,0,0.04)] transition-all text-left"
                                    >
                                        <div
                                            className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 shadow-sm border border-gray-50 bg-white group-hover:scale-110 group-hover:shadow-md transition-all duration-300"
                                            style={{ color: config.hex }}
                                        >
                                            <subtype.icon size={22} />
                                        </div>
                                        <div>
                                            <h4 className="text-sm font-bold text-gray-900 mb-1 group-hover:text-[#25D366] transition-colors">
                                                {subtype.label}
                                            </h4>
                                            <p className="text-[11px] font-medium text-gray-400 leading-relaxed">
                                                {subtype.description}
                                            </p>
                                        </div>

                                        <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all">
                                            <Zap size={14} className="text-[#25D366] fill-current" />
                                        </div>
                                    </button>
                                ))}
                            </div>

                            {filteredSubtypes.length === 0 && (
                                <div className="py-12 text-center text-gray-400 italic text-sm">
                                    No node types found matching "{searchQuery}"
                                </div>
                            )}
                        </div>

                        {/* Footer Tips */}
                        <div className="px-8 py-4 bg-gray-50/50 border-t border-gray-50 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-[#25D366] animate-pulse" />
                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                                    Pro Tip: Keyboard shortcuts supported
                                </span>
                            </div>
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                                ESC to cancel
                            </span>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};
