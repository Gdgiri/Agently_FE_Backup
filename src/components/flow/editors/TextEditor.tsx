import React from 'react';
import { NodeUpdateHandler } from './types';

interface TextEditorProps {
    data: any;
    onUpdate: NodeUpdateHandler;
}

export const TextEditor: React.FC<TextEditorProps> = ({ data, onUpdate }) => {
    return (
        <div className="space-y-6">
            <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest block pl-1">
                    Message Content
                </label>
                <textarea
                    className="w-full px-5 py-4 bg-white border-2 border-gray-100 rounded-[1.5rem] text-sm font-bold min-h-[150px] focus:ring-4 focus:ring-[#25D366]/5 focus:border-[#25D366] transition-all outline-none leading-relaxed resize-none"
                    placeholder="Type your message here... Use {{name}} for variables."
                    value={data.messageText || ''}
                    onChange={(e) => onUpdate('messageText', e.target.value)}
                />
                <div className="flex items-center justify-between px-2">
                    <span className="text-[10px] text-gray-400 font-bold">Tip: Click to insert @variables</span>
                    <span className="text-[10px] text-gray-400 font-bold">{(data.messageText || '').length} characters</span>
                </div>
            </div>

            <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                <h4 className="text-[10px] font-black uppercase text-gray-400 tracking-widest mb-3">Quick Variables</h4>
                <div className="flex flex-wrap gap-2">
                    {['full_name', 'first_name', 'phone_number'].map(v => (
                        <button
                            key={v}
                            onClick={() => onUpdate('messageText', (data.messageText || '') + ` {${v}}`)}
                            className="px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-[10px] font-bold text-gray-600 hover:border-[#25D366] hover:text-[#25D366] transition-colors"
                        >
                            {v}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};
