
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, X, Brain, Wand2, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { cn, Card, Button } from '../ui';
import apiClient from '../../lib/apiClient';
import { AIFlowResponseSchema } from '../../lib/ai/schemaValidators';
import { transformAIToFlow } from '../../lib/ai/flowTransformer';

interface AIGenerateFlowModalProps {
    isOpen: boolean;
    onClose: () => void;
    onFlowGenerated: (nodes: any[], edges: any[]) => void;
}

const AIGenerateFlowModal: React.FC<AIGenerateFlowModalProps> = ({ isOpen, onClose, onFlowGenerated }) => {
    const [prompt, setPrompt] = useState('');
    const [status, setStatus] = useState<'idle' | 'generating' | 'success' | 'error'>('idle');
    const [error, setError] = useState<string | null>(null);

    const handleGenerate = async () => {
        if (!prompt.trim()) return;

        setStatus('generating');
        setError(null);

        try {
            const { data: apiResponse } = await apiClient.post('/ai/generate-flow', { prompt });
            if (!apiResponse.success) throw new Error(apiResponse.error || "Failed to generate flow");

            const response = apiResponse.data.flow; // Access nested flow object from backend

            // Validate with Zod
            const validated = AIFlowResponseSchema.safeParse(response);
            if (!validated.success) {
                throw new Error("Invalid AI response format");
            }

            const { nodes, edges } = transformAIToFlow(validated.data);

            setStatus('success');
            setTimeout(() => {
                onFlowGenerated(nodes, edges);
                onClose();
                setStatus('idle');
                setPrompt('');
            }, 1500);

        } catch (err: any) {
            setStatus('error');
            setError(err.message || "Failed to generate flow");
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm"
                        onClick={onClose}
                    />
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.9, opacity: 0, y: 20 }}
                        className="relative w-full max-w-xl bg-white rounded-[2.5rem] overflow-hidden shadow-2xl"
                    >
                        <div className="p-8 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-gray-900 text-[#25D366] rounded-xl flex items-center justify-center shadow-lg">
                                    <Sparkles size={20} />
                                </div>
                                <div>
                                    <h3 className="text-xl font-black text-gray-900">AI Flow Architect</h3>
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">Generative Canvas Engine</p>
                                </div>
                            </div>
                            <button
                                onClick={onClose}
                                className="p-3 hover:bg-white rounded-2xl text-gray-400 hover:text-gray-900 transition-all shadow-sm ring-1 ring-gray-100"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <div className="p-10 space-y-8">
                            {status === 'idle' || status === 'generating' || status === 'error' ? (
                                <div className="space-y-6">
                                    <div className="space-y-4">
                                        <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Natural Language Instruction</label>
                                        <textarea
                                            className="w-full px-6 py-5 bg-gray-50/50 border border-gray-100 rounded-[2rem] text-sm font-bold text-gray-600 outline-none focus:ring-4 focus:ring-[#25D366]/10 focus:border-[#25D366] transition-all min-h-[160px] leading-relaxed shadow-inner"
                                            placeholder="e.g. Create a flow for new order reminders. If it's a first time customer, offer a 10% discount, otherwise thank them for coming back."
                                            value={prompt}
                                            onChange={(e) => setPrompt(e.target.value)}
                                            disabled={status === 'generating'}
                                        />
                                    </div>

                                    {status === 'error' && (
                                        <motion.div
                                            initial={{ opacity: 0, y: -10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 text-red-600"
                                        >
                                            <AlertCircle size={18} />
                                            <span className="text-xs font-bold">{error}</span>
                                        </motion.div>
                                    )}

                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="p-4 border border-gray-100 rounded-2xl hover:bg-gray-50 transition-colors cursor-pointer" onClick={() => setPrompt("Welcome message with catalog items")}>
                                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none">Preset</p>
                                            <p className="text-xs font-bold text-gray-900 mt-2">Product Catalog Bot</p>
                                        </div>
                                        <div className="p-4 border border-gray-100 rounded-2xl hover:bg-gray-50 transition-colors cursor-pointer" onClick={() => setPrompt("Tag customers above 10k as VIP")}>
                                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none">Preset</p>
                                            <p className="text-xs font-bold text-gray-900 mt-2">VIP Segmentation</p>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="py-12 flex flex-col items-center justify-center text-center space-y-6"
                                >
                                    <div className="w-20 h-20 bg-green-50 text-[#25D366] rounded-full flex items-center justify-center shadow-inner">
                                        <CheckCircle2 size={40} />
                                    </div>
                                    <div>
                                        <h4 className="text-xl font-black text-gray-900">Flow Synthesized!</h4>
                                        <p className="text-sm font-bold text-gray-400 mt-2">Injecting intelligent nodes into your canvas...</p>
                                    </div>
                                </motion.div>
                            )}
                        </div>

                        <div className="p-8 bg-gray-50/50 border-t border-gray-100 flex gap-4">
                            <Button variant="ghost" onClick={onClose} className="flex-1" disabled={status === 'generating'}>Cancel</Button>
                            <Button
                                className="flex-1 rounded-2xl px-10 bg-gray-900 hover:bg-black relative overflow-hidden group"
                                onClick={handleGenerate}
                                disabled={!prompt.trim() || status === 'generating' || status === 'success'}
                            >
                                {status === 'generating' ? (
                                    <div className="flex items-center gap-2">
                                        <Loader2 size={18} className="animate-spin text-[#25D366]" />
                                        <span>Processing Logic...</span>
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-2">
                                        <Brain size={18} className="text-[#25D366] group-hover:scale-110 transition-transform" />
                                        <span>Generate Flow</span>
                                    </div>
                                )}
                            </Button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default AIGenerateFlowModal;
