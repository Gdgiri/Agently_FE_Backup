import React, { useState } from 'react';
import { X, Save, Zap, Type, MessageSquare, Plus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '../ui';

interface NewFlowModalProps {
    isOpen: boolean;
    onClose: () => void;
    onCreate: (title: string, trigger: string) => void;
}

export const NewFlowModal: React.FC<NewFlowModalProps> = ({ isOpen, onClose, onCreate }) => {
    const [title, setTitle] = useState('');
    const [trigger, setTrigger] = useState('');

    React.useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && isOpen) {
                onClose();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim() || !trigger.trim()) return;
        onCreate(title, trigger);
        setTitle('');
        setTrigger('');
    };

    return (
        <AnimatePresence>
            <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    className="bg-white rounded-[3rem] w-full max-w-md overflow-hidden shadow-2xl"
                >
                    <header className="p-8 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-green-500 rounded-2xl text-white shadow-lg shadow-green-200">
                                <Zap size={24} />
                            </div>
                            <div>
                                <h3 className="text-xl font-black text-gray-900 leading-tight">Create New Flow</h3>
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">Initialize your bot logic</p>
                            </div>
                        </div>
                        <button onClick={onClose} className="p-2 hover:bg-white rounded-xl text-gray-400 transition-colors">
                            <X size={20} />
                        </button>
                    </header>

                    <form onSubmit={handleSubmit} className="p-8 space-y-6">
                        <div className="space-y-3">
                            <label className="text-[11px] font-black uppercase text-gray-400 tracking-[0.15em] px-1 flex items-center gap-2">
                                <Type size={14} className="text-green-500" />
                                Flow Title
                            </label>
                            <input
                                autoFocus
                                className="w-full px-6 py-4 bg-gray-50 border-2 border-gray-100 rounded-[1.8rem] text-sm font-bold focus:ring-8 focus:ring-green-500/5 focus:border-green-500 focus:bg-white transition-all outline-none"
                                placeholder="e.g. Customer Support Flow"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                required
                            />
                        </div>

                        <div className="space-y-3">
                            <label className="text-[11px] font-black uppercase text-gray-400 tracking-[0.15em] px-1 flex items-center gap-2">
                                <MessageSquare size={14} className="text-green-500" />
                                Starting Keyword (Trigger)
                            </label>
                            <input
                                className="w-full px-6 py-4 bg-gray-50 border-2 border-gray-100 rounded-[1.8rem] text-sm font-bold focus:ring-8 focus:ring-green-500/5 focus:border-green-500 focus:bg-white transition-all outline-none"
                                placeholder="e.g. HELLO, START, MENU"
                                value={trigger}
                                onChange={(e) => setTrigger(e.target.value)}
                                required
                            />
                            <p className="text-[9px] font-bold text-gray-400 px-2 italic">The flow will start when a user sends this keyword.</p>
                        </div>

                        <div className="pt-4">
                            <Button
                                type="submit"
                                disabled={!title.trim() || !trigger.trim()}
                                className="w-full py-5 bg-[#25D366] hover:bg-[#1fb355] text-white rounded-[1.8rem] text-sm font-black shadow-lg shadow-[#25D366]/20 transition-all active:scale-[0.98]"
                            >
                                <Plus size={18} className="mr-2" /> Start Architecting Flow
                            </Button>
                        </div>
                    </form>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};
