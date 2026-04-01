import React from 'react';
import { NodeUpdateHandler } from './types';
import { Database, HelpCircle } from 'lucide-react';

interface InputEditorProps {
    data: any;
    onUpdate: NodeUpdateHandler;
}

export const InputEditor: React.FC<InputEditorProps> = ({ data, onUpdate }) => {
    return (
        <div className="space-y-6">
            <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest block pl-1">
                    Question to Ask
                </label>
                <textarea
                    className="w-full px-5 py-4 bg-white border-2 border-gray-100 rounded-[1.5rem] text-sm font-bold min-h-[120px] focus:ring-4 focus:ring-[#3B82F6]/5 focus:border-[#3B82F6] transition-all outline-none leading-relaxed resize-none"
                    placeholder="Ask user for their name, email, etc."
                    value={data.question || ''}
                    onChange={(e) => onUpdate('question', e.target.value)}
                />
            </div>

            <div className="space-y-2">
                <div className="flex items-center justify-between px-1">
                    <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest">
                        Save Response To Variable
                    </label>
                </div>
                <div className="relative group">
                    <div className="absolute left-5 top-1/2 -translate-y-1/2 text-blue-500 font-black">@</div>
                    <input
                        className="w-full pl-10 pr-5 py-4 bg-white border-2 border-gray-100 rounded-[1.5rem] text-sm font-bold focus:ring-4 focus:ring-[#3B82F6]/5 focus:border-[#3B82F6] transition-all outline-none"
                        placeholder="user_email"
                        value={data.variable || ''}
                        onChange={(e) => onUpdate('variable', e.target.value.replace(/\s+/g, '_').toLowerCase())}
                    />
                </div>
            </div>

            <div className="p-6 bg-blue-50/30 border border-blue-100/50 rounded-[2rem] flex flex-col gap-3">
                <div className="flex items-center gap-2">
                    <Database size={14} className="text-blue-500" />
                    <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Data Capture</span>
                </div>
                <p className="text-[10px] text-blue-700 font-bold leading-relaxed">
                    The bot will wait for the user to reply and save the response into the variable you define. You can use it later as <span className="text-blue-900 font-black">{"{{variable_name}}"}</span>.
                </p>
            </div>
        </div>
    );
};
