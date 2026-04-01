import React from 'react';
import { NodeUpdateHandler } from './types';
import { Clock, Info } from 'lucide-react';

interface DelayEditorProps {
    data: any;
    onUpdate: NodeUpdateHandler;
}

export const DelayEditor: React.FC<DelayEditorProps> = ({ data, onUpdate }) => {
    return (
        <div className="space-y-6">
            <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest block pl-1">
                    Wait Time (Seconds)
                </label>
                <div className="relative">
                    <input
                        type="number"
                        min="1"
                        max="3600"
                        className="w-full px-5 py-4 bg-white border-2 border-gray-100 rounded-[1.5rem] text-sm font-bold focus:ring-4 focus:ring-[#8B5CF6]/5 focus:border-[#8B5CF6] transition-all outline-none"
                        value={data.delaySeconds || 5}
                        onChange={(e) => onUpdate('delaySeconds', parseInt(e.target.value) || 0)}
                    />
                    <div className="absolute right-5 top-1/2 -translate-y-1/2 text-[10px] font-black uppercase text-gray-400">
                        Seconds
                    </div>
                </div>
            </div>

            <div className="p-6 bg-purple-50/30 border border-purple-100/50 rounded-[2rem] flex flex-col gap-3">
                <div className="flex items-center gap-2">
                    <Clock size={14} className="text-purple-500" />
                    <span className="text-[10px] font-black text-purple-600 uppercase tracking-widest">Efficiency Tip</span>
                </div>
                <p className="text-[10px] text-purple-700 font-bold leading-relaxed">
                    Delays make the bot feel more "human" by simulating typing time. For short messages, 2-3 seconds is ideal.
                </p>
            </div>
        </div>
    );
};
