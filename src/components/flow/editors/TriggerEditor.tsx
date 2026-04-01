import React from 'react';
import { NodeUpdateHandler } from './types';
import { Zap, MessageSquare, Info } from 'lucide-react';

interface TriggerEditorProps {
    data: any;
    onUpdate: NodeUpdateHandler;
}

export const TriggerEditor: React.FC<TriggerEditorProps> = ({ data, onUpdate }) => {
    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
            {/* Step Name */}
            <div className="space-y-3">
                <label className="text-[11px] font-black uppercase text-gray-400 tracking-[0.15em] px-1 font-inter">Step Name</label>
                <input
                    className="w-full px-6 py-4 bg-white border-2 border-gray-100 rounded-[1.8rem] text-sm font-bold focus:ring-8 focus:ring-[#25D366]/5 focus:border-[#25D366] transition-all outline-none font-inter"
                    placeholder="e.g. Welcome Trigger"
                    value={data.label || ''}
                    onChange={(e) => onUpdate('label', e.target.value)}
                />
            </div>

            {/* Trigger Keyword */}
            <div className="space-y-3">
                <div className="flex items-center justify-between px-1">
                    <label className="text-[11px] font-black uppercase text-gray-400 tracking-[0.15em] font-inter">Starting Keyword</label>
                </div>
                <div className="relative group">
                    <div className="absolute left-6 top-1/2 -translate-y-1/2 text-[#25D366]">
                        <MessageSquare size={18} />
                    </div>
                    <input
                        className="w-full pl-14 pr-6 py-4 bg-white border-2 border-gray-100 rounded-[1.8rem] text-sm font-bold focus:ring-8 focus:ring-[#25D366]/5 focus:border-[#25D366] transition-all outline-none font-inter uppercase"
                        placeholder="e.g. START, HELLO, MENU"
                        value={data.keyword || ''}
                        onChange={(e) => {
                            const val = e.target.value.toUpperCase();
                            onUpdate({
                                keyword: val,
                                description: `Entry: ${val}`
                            });
                        }}
                    />
                </div>
                <p className="text-[10px] font-bold text-gray-400 px-2 italic leading-relaxed">
                    This flow will automatically start whenever a user sends this exact word.
                </p>
            </div>

            {/* Trigger Info Card */}
            <div className="p-6 bg-green-50 border border-green-100 rounded-[2.5rem] flex items-start gap-4">
                <div className="p-3 bg-white rounded-2xl text-[#25D366] shadow-sm">
                    <Info size={18} />
                </div>
                <div>
                    <p className="text-xs font-black text-green-800">Trigger Logic</p>
                    <p className="text-[11px] font-bold text-green-700/70 leading-relaxed mt-1">
                        Keywords are case-insensitive. You can also use "ALL" (meta-keyword) if you want this flow to capture every incoming message (Advanced).
                    </p>
                </div>
            </div>
        </div>
    );
};
