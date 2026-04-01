import React from 'react';
import { NodeUpdateHandler } from './types';
import { MessageSquare, Info, FlaskConical } from 'lucide-react';

interface SimpleBotReplyEditorProps {
    data: any;
    onUpdate: NodeUpdateHandler;
}

export const SimpleBotReplyEditor: React.FC<SimpleBotReplyEditorProps> = ({ data, onUpdate }) => {
    const variables = [
        '{first_name}', '{last_name}', '{full_name}',
        '{phone_number}', '{email}', '{country}',
        '{language_code}', '{website}'
    ];

    const insertVariable = (variable: string) => {
        const currentText = data.messageText || '';
        onUpdate('messageText', currentText + ' ' + variable);
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
            {/* Step Name */}
            <div className="space-y-3">
                <label className="text-[11px] font-black uppercase text-gray-400 tracking-[0.15em] flex items-center gap-2 px-1">
                    Name
                </label>
                <input
                    className="w-full px-6 py-4 bg-white border-2 border-gray-100 rounded-[1.8rem] text-sm font-bold focus:ring-8 focus:ring-green-500/5 focus:border-[#25D366] transition-all outline-none"
                    placeholder="e.g. Welcome Message"
                    value={data.label || ''}
                    onChange={(e) => onUpdate('label', e.target.value)}
                />
            </div>

            {/* Tab Header (Simplified) */}
            <div className="border-b border-gray-100">
                <div className="inline-flex items-center gap-2 pb-4 border-b-2 border-gray-900">
                    <MessageSquare size={16} className="text-gray-900" />
                    <span className="text-[11px] font-black uppercase tracking-wider text-gray-900">Reply Message</span>
                </div>
            </div>

            {/* Reply Text */}
            <div className="space-y-4">
                <div className="flex items-center justify-between px-1">
                    <label className="text-[11px] font-black uppercase text-gray-400 tracking-[0.15em]">
                        Reply Text
                    </label>
                </div>
                <div className="relative group">
                    <textarea
                        className="w-full px-6 py-5 bg-white border-2 border-gray-100 rounded-[2rem] text-sm font-bold min-h-[160px] focus:ring-8 focus:ring-green-500/5 focus:border-[#25D366] transition-all outline-none leading-relaxed resize-none overflow-hidden"
                        placeholder="Add your main message body text here..."
                        value={data.messageText || ''}
                        onChange={(e) => onUpdate('messageText', e.target.value)}
                        onInput={(e) => {
                            const target = e.target as HTMLTextAreaElement;
                            target.style.height = 'auto';
                            target.style.height = `${target.scrollHeight}px`;
                        }}
                    />
                </div>
            </div>

            {/* Variables Section */}
            <div className="p-8 bg-gray-50/50 border border-gray-100 rounded-[2.5rem] space-y-4">
                <p className="text-[11px] text-gray-500 font-bold leading-relaxed px-1">
                    You are free to use following dynamic variables for reply text, which will get replaced with contact's concerned field value.
                </p>
                <div className="flex flex-wrap gap-2">
                    {variables.map((v) => (
                        <button
                            key={v}
                            onClick={() => insertVariable(v)}
                            className="px-4 py-2 bg-white border border-gray-100 rounded-full text-[10px] font-black text-pink-500 hover:border-pink-200 hover:shadow-sm transition-all"
                        >
                            {v}
                        </button>
                    ))}
                </div>
            </div>

            {/* Validation Toggle */}
            <div className="flex items-center justify-between p-6 bg-white border-2 border-gray-100 rounded-[2rem]">
                <div className="flex items-center gap-3">
                    <div className="p-3 bg-gray-50 rounded-2xl text-gray-400">
                        <FlaskConical size={18} />
                    </div>
                    <div>
                        <p className="text-xs font-black text-gray-800">Validate Bot Reply</p>
                        <p className="text-[10px] font-bold text-gray-400">Send a test message to your number</p>
                    </div>
                </div>
                <button
                    onClick={() => onUpdate('validate', !data.validate)}
                    className={`w-12 h-6 rounded-full transition-all relative ${data.validate ? 'bg-[#25D366]' : 'bg-gray-200'}`}
                >
                    <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${data.validate ? 'left-7' : 'left-1'}`} />
                </button>
            </div>
        </div>
    );
};
