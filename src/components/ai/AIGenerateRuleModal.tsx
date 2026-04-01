
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, X, Zap, ChevronRight, CheckCircle2, AlertCircle, Loader2, Database } from 'lucide-react';
import { cn, Card, Button } from '../ui';
import apiClient from '../../lib/apiClient';
import { AIRuleResponseSchema } from '../../lib/ai/schemaValidators';
import { transformAIToRule } from '../../lib/ai/ruleTransformer';

interface AIGenerateRuleModalProps {
    isOpen: boolean;
    onClose: () => void;
    onRuleGenerated: (rule: any) => void;
}

const AIGenerateRuleModal: React.FC<AIGenerateRuleModalProps> = ({ isOpen, onClose, onRuleGenerated }) => {
    const [prompt, setPrompt] = useState('');
    const [status, setStatus] = useState<'idle' | 'generating' | 'preview' | 'error'>('idle');
    const [error, setError] = useState<string | null>(null);
    const [previewRule, setPreviewRule] = useState<any>(null);

    const handleGenerate = async () => {
        if (!prompt.trim()) return;

        setStatus('generating');
        setError(null);

        try {
            const { data: apiResponse } = await apiClient.post('/ai/generate-rule', { prompt });
            if (!apiResponse.success) throw new Error(apiResponse.error || "Failed to generate rule");

            const response = apiResponse.data.rule; // Access nested rule object from backend
            const validated = AIRuleResponseSchema.safeParse(response);
            if (!validated.success) throw new Error("Invalid logic structure");

            const rule = transformAIToRule(validated.data);
            setPreviewRule(rule);
            setStatus('preview');

        } catch (err: any) {
            setStatus('error');
            setError(err.message || "Failed to distill rule");
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
                        className="relative w-full max-w-lg bg-white rounded-[2.5rem] overflow-hidden shadow-2xl"
                    >
                        <div className="p-8 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-gray-900 text-[#25D366] rounded-xl flex items-center justify-center shadow-lg">
                                    <Zap size={20} />
                                </div>
                                <div>
                                    <h3 className="text-xl font-black text-gray-900">AI Rule Distiller</h3>
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">Logic Inference Engine</p>
                                </div>
                            </div>
                            <button onClick={onClose} className="p-3 hover:bg-white rounded-2xl text-gray-400 hover:text-gray-900 transition-all shadow-sm ring-1 ring-gray-100">
                                <X size={20} />
                            </button>
                        </div>

                        <div className="p-10">
                            {status !== 'preview' ? (
                                <div className="space-y-6">
                                    <div className="space-y-4">
                                        <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Rule Description</label>
                                        <textarea
                                            className="w-full px-6 py-5 bg-gray-50/50 border border-gray-100 rounded-[2rem] text-sm font-bold text-gray-600 outline-none focus:ring-4 focus:ring-[#25D366]/10 focus:border-[#25D366] transition-all min-h-[120px] leading-relaxed shadow-inner"
                                            placeholder="e.g. When someone places an order over $5000, tag them as 'Premium' automatically."
                                            value={prompt}
                                            onChange={(e) => setPrompt(e.target.value)}
                                            disabled={status === 'generating'}
                                        />
                                    </div>

                                    {status === 'error' && (
                                        <div className="p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 text-red-600">
                                            <AlertCircle size={18} />
                                            <span className="text-xs font-bold">{error}</span>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="space-y-6"
                                >
                                    <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest leading-none">Inferred Logic</h4>
                                    <div className="p-6 bg-gray-50/50 rounded-[2rem] border border-gray-100 space-y-4">
                                        <div className="flex items-center gap-4">
                                            <div className="w-8 h-8 rounded-lg bg-white shadow-sm flex items-center justify-center text-blue-500"><Database size={16} /></div>
                                            <div>
                                                <p className="text-[9px] font-black text-gray-400 uppercase">Trigger Event</p>
                                                <p className="text-sm font-black text-gray-900">{previewRule.trigger}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <div className="w-8 h-8 rounded-lg bg-white shadow-sm flex items-center justify-center text-orange-500"><ChevronRight size={16} /></div>
                                            <div>
                                                <p className="text-[9px] font-black text-gray-400 uppercase">Constraint</p>
                                                <p className="text-sm font-black text-gray-900">{previewRule.value}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <div className="w-8 h-8 rounded-lg bg-[#25D366] shadow-sm flex items-center justify-center text-white"><CheckCircle2 size={16} /></div>
                                            <div>
                                                <p className="text-[9px] font-black text-gray-400 uppercase">Automated Action</p>
                                                <p className="text-sm font-black text-gray-900">{previewRule.action}: {previewRule.target}</p>
                                            </div>
                                        </div>
                                    </div>
                                    <Button variant="outline" className="w-full" onClick={() => setStatus('idle')}>Modify Request</Button>
                                </motion.div>
                            )}
                        </div>

                        <div className="p-8 bg-gray-50/50 border-t border-gray-100 flex gap-4">
                            <Button variant="ghost" onClick={onClose} className="flex-1" disabled={status === 'generating'}>Cancel</Button>
                            {status === 'preview' ? (
                                <Button className="flex-1 rounded-2xl bg-gray-900 hover:bg-black" onClick={() => { onRuleGenerated(previewRule); onClose(); }}>
                                    Activate Rule
                                </Button>
                            ) : (
                                <Button
                                    className="flex-1 rounded-2xl px-10 bg-gray-900 hover:bg-black"
                                    onClick={handleGenerate}
                                    disabled={!prompt.trim() || status === 'generating'}
                                >
                                    {status === 'generating' ? (
                                        <div className="flex items-center gap-2">
                                            <Loader2 size={18} className="animate-spin text-[#25D366]" />
                                            <span>Distilling...</span>
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-2">
                                            <Sparkles size={18} className="text-[#25D366]" />
                                            <span>Generate Rule</span>
                                        </div>
                                    )}
                                </Button>
                            )}
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default AIGenerateRuleModal;
