
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, X, Layout, Wand2, CheckCircle2, AlertCircle, Loader2, MessageSquare } from 'lucide-react';
import { cn, Card, Button } from '../ui';
import apiClient from '../../lib/apiClient';
import { AITemplateResponseSchema } from '../../lib/ai/schemaValidators';
import { transformAIToTemplate } from '../../lib/ai/templateTransformer';

interface AIGenerateTemplateModalProps {
    isOpen: boolean;
    onClose: () => void;
    onTemplateGenerated: (template: any) => void;
}

const AIGenerateTemplateModal: React.FC<AIGenerateTemplateModalProps> = ({ isOpen, onClose, onTemplateGenerated }) => {
    const [prompt, setPrompt] = useState('');
    const [status, setStatus] = useState<'idle' | 'generating' | 'preview' | 'error'>('idle');
    const [error, setError] = useState<string | null>(null);
    const [generatedData, setGeneratedData] = useState<any>(null);

    const handleGenerate = async () => {
        if (!prompt.trim()) return;

        setStatus('generating');
        setError(null);

        try {
            const { data: apiResponse } = await apiClient.post('/ai/generate-template', { prompt });
            if (!apiResponse.success) throw new Error(apiResponse.error || "Failed to generate template");

            const response = apiResponse.data.template; // Access nested template object from backend

            const validated = AITemplateResponseSchema.safeParse(response);
            if (!validated.success) {
                throw new Error("Invalid AI response format");
            }

            const transformed = transformAIToTemplate(validated.data);
            setGeneratedData(transformed);
            setStatus('preview');

        } catch (err: any) {
            setStatus('error');
            setError(err.message || "Failed to generate template");
        }
    };

    const handleConfirm = () => {
        onTemplateGenerated(generatedData);
        onClose();
        setStatus('idle');
        setPrompt('');
        setGeneratedData(null);
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
                        className="relative w-full max-w-2xl bg-white rounded-[2.5rem] overflow-hidden shadow-2xl"
                    >
                        <div className="p-8 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-gray-900 text-[#25D366] rounded-xl flex items-center justify-center shadow-lg">
                                    <Layout size={20} />
                                </div>
                                <div>
                                    <h3 className="text-xl font-black text-gray-900">AI Template Studio</h3>
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">Generative Copywriting Engine</p>
                                </div>
                            </div>
                            <button onClick={onClose} className="p-3 hover:bg-white rounded-2xl text-gray-400 hover:text-gray-900 transition-all shadow-sm ring-1 ring-gray-100">
                                <X size={20} />
                            </button>
                        </div>

                        <div className="p-10">
                            {status !== 'preview' ? (
                                <div className="space-y-8">
                                    <div className="space-y-4">
                                        <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Describe your message</label>
                                        <textarea
                                            className="w-full px-6 py-5 bg-gray-50/50 border border-gray-100 rounded-[2rem] text-sm font-bold text-gray-600 outline-none focus:ring-4 focus:ring-[#25D366]/10 focus:border-[#25D366] transition-all min-h-[140px] leading-relaxed shadow-inner"
                                            placeholder="e.g. A friendly appointment reminder for the salon. Include a 24-hour cancellation notice and a button to reschedule."
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

                                    <div className="p-6 bg-blue-50/30 rounded-[2rem] border border-blue-100 flex items-start gap-4">
                                        <div className="p-2 bg-blue-500 rounded-xl text-white"><Sparkles size={16} /></div>
                                        <div>
                                            <p className="text-xs font-black text-blue-900 uppercase tracking-tight">AI Smart-Sense</p>
                                            <p className="text-[10px] font-bold text-blue-600/70 mt-1 leading-relaxed">The AI will automatically identify variables like customer names, order IDs, and dates to create {'{{1}}'} placeholders for Meta compatibility.</p>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="space-y-6">
                                        <div>
                                            <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4">Meta Structure</h4>
                                            <Card className="p-6 space-y-4 border-gray-100 bg-gray-50/30">
                                                <div>
                                                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Header</p>
                                                    <p className="text-sm font-bold text-gray-900">{generatedData.header?.content || 'None'}</p>
                                                </div>
                                                <div>
                                                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Body (Clean Source)</p>
                                                    <p className="text-sm font-bold text-gray-700 leading-relaxed">{generatedData.body}</p>
                                                </div>
                                                <div className="flex flex-wrap gap-2">
                                                    {generatedData.variables.map((v: string, i: number) => (
                                                        <span key={i} className="px-2 py-1 bg-white border border-gray-100 rounded-lg text-[10px] font-bold text-blue-500">Var {i + 1}: {v}</span>
                                                    ))}
                                                </div>
                                            </Card>
                                        </div>
                                        <Button variant="outline" className="w-full" onClick={() => setStatus('idle')}>Redraft with AI</Button>
                                    </div>

                                    <div>
                                        <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4">WhatsApp Preview</h4>
                                        <div className="rounded-[2.5rem] bg-[#efeae2] p-6 shadow-inner ring-4 ring-gray-100 h-full flex flex-col items-center">
                                            <div className="w-full bg-white rounded-2xl rounded-tl-none p-4 shadow-sm relative space-y-2">
                                                {generatedData.header && <p className="text-[11px] font-black text-gray-900 mb-1">{generatedData.header.content}</p>}
                                                <p className="text-[11px] text-gray-700 leading-relaxed">{generatedData.body}</p>
                                                {generatedData.footer && <p className="text-[9px] text-gray-400">{generatedData.footer}</p>}
                                                <div className="absolute top-2 -left-2 w-0 h-0 border-t-[8px] border-t-white border-l-[8px] border-l-transparent" />
                                            </div>

                                            {generatedData.buttons?.map((b: any, i: number) => (
                                                <div key={i} className="w-full mt-2 bg-white/80 backdrop-blur-sm rounded-xl py-2 flex items-center justify-center gap-2 text-[#00a884] text-[11px] font-bold shadow-sm">
                                                    <MessageSquare size={12} /> {b.text}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="p-8 bg-gray-50/50 border-t border-gray-100 flex gap-4">
                            <Button variant="ghost" onClick={onClose} className="flex-1" disabled={status === 'generating'}>Cancel</Button>
                            {status === 'preview' ? (
                                <Button className="flex-1 rounded-2xl bg-[#00a884] hover:bg-[#008f70] text-white shadow-xl shadow-green-900/10" onClick={handleConfirm}>
                                    Ready to Submit
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
                                            <span>Synthesizing Copy...</span>
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-2">
                                            <Wand2 size={18} className="text-[#25D366]" />
                                            <span>Draft Template</span>
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

export default AIGenerateTemplateModal;
