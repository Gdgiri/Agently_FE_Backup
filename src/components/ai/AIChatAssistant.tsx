
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Brain, Loader2, Send, Copy, RefreshCw } from 'lucide-react';
import { cn, Button } from '../ui';
import apiClient from '../../lib/apiClient';

interface AIChatAssistantProps {
    lastMessage: string | undefined;
    onSuggestionAccepted: (text: string) => void;
}

const AIChatAssistant: React.FC<AIChatAssistantProps> = ({ lastMessage, onSuggestionAccepted }) => {
    const [status, setStatus] = useState<'idle' | 'loading' | 'suggested'>('idle');
    const [suggestion, setSuggestion] = useState('');

    const handleSuggest = async () => {
        if (!lastMessage) return;
        setStatus('loading');
        try {
            const { data: apiResponse } = await apiClient.post('/ai/chat-assist', {
                prompt: lastMessage,
                context: {} // Optional: could pass conversation history here
            });

            if (!apiResponse.success) throw new Error("Failed to get suggestion");

            setSuggestion(apiResponse.data.reply);
            setStatus('suggested');
        } catch (err) {
            setStatus('idle');
        }
    };

    return (
        <div className="flex flex-col gap-3">
            <AnimatePresence mode="wait">
                {status === 'idle' && (
                    <motion.div
                        key="idle"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                    >
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleSuggest}
                            className="px-4 py-2 hover:bg-gray-100 text-[#25D366] font-black text-[10px] uppercase tracking-widest border border-dashed border-gray-200 rounded-xl"
                        >
                            <Sparkles size={14} /> Suggest Smart Reply
                        </Button>
                    </motion.div>
                )}

                {status === 'loading' && (
                    <motion.div
                        key="loading"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-xl border border-gray-100 shadow-inner"
                    >
                        <Loader2 size={12} className="animate-spin text-[#25D366]" />
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Bot is thinking...</span>
                    </motion.div>
                )}

                {status === 'suggested' && (
                    <motion.div
                        key="suggested"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-gray-900 rounded-[1.5rem] p-4 shadow-2xl space-y-3 border border-white/5"
                    >
                        <div className="flex justify-between items-center">
                            <div className="flex items-center gap-2">
                                <Brain size={14} className="text-[#25D366]" />
                                <span className="text-[9px] font-black text-white/40 uppercase tracking-widest">AI Suggested Reply</span>
                            </div>
                            <button
                                onClick={handleSuggest}
                                className="text-white/40 hover:text-[#25D366] transition-colors"
                                title="Regenerate"
                            >
                                <RefreshCw size={12} />
                            </button>
                        </div>
                        <p className="text-xs font-bold text-white/90 leading-relaxed italic">
                            "{suggestion}"
                        </p>
                        <div className="flex gap-2">
                            <Button
                                size="sm"
                                className="flex-1 rounded-lg bg-[#25D366] hover:bg-[#1ebe5d] text-[10px] h-8"
                                onClick={() => { onSuggestionAccepted(suggestion); setStatus('idle'); }}
                            >
                                Use This
                            </Button>
                            <Button
                                size="sm"
                                variant="ghost"
                                className="rounded-lg text-white/40 hover:bg-white/5 text-[10px] h-8"
                                onClick={() => setStatus('idle')}
                            >
                                Discard
                            </Button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default AIChatAssistant;
