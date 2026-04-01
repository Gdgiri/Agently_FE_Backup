import React from 'react';
import { NodeUpdateHandler } from './types';
import { Mail, Info, FileText } from 'lucide-react';

interface EmailReplyEditorProps {
    data: any;
    onUpdate: NodeUpdateHandler;
}

export const EmailReplyEditor: React.FC<EmailReplyEditorProps> = ({ data, onUpdate }) => {
    const variables = [
        '{first_name}', '{last_name}', '{full_name}',
        '{phone_number}', '{email}'
    ];

    const insertVariable = (field: string, variable: string) => {
        const currentText = data[field] || '';
        onUpdate(field, currentText + ' ' + variable);
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
            {/* Step Name */}
            <div className="space-y-3">
                <label className="text-[11px] font-black uppercase text-gray-400 tracking-[0.15em] flex items-center gap-2 px-1">
                    Step Name
                </label>
                <input
                    className="w-full px-6 py-4 bg-white border-2 border-gray-100 rounded-[1.8rem] text-sm font-bold focus:ring-8 focus:ring-blue-500/5 focus:border-blue-500 transition-all outline-none"
                    placeholder="e.g. Order Confirmation Email"
                    value={data.label || ''}
                    onChange={(e) => onUpdate('label', e.target.value)}
                />
            </div>

            {/* Email Subject */}
            <div className="space-y-3">
                <label className="text-[11px] font-black uppercase text-gray-400 tracking-[0.15em] flex items-center gap-2 px-1">
                    Email Subject
                </label>
                <div className="relative">
                    <input
                        className="w-full px-6 py-4 bg-white border-2 border-gray-100 rounded-[1.8rem] text-sm font-bold focus:ring-8 focus:ring-blue-500/5 focus:border-blue-500 transition-all outline-none"
                        placeholder="e.g. Your Order #{{order_id}} is Confirmed"
                        value={data.subject || ''}
                        onChange={(e) => onUpdate('subject', e.target.value)}
                    />
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 flex gap-1">
                        <button
                            onClick={() => insertVariable('subject', '{first_name}')}
                            className="p-1.5 hover:bg-gray-50 rounded-lg text-[10px] font-black text-blue-500 transition-all"
                            title="Insert First Name"
                        >
                            {'{FN}'}
                        </button>
                    </div>
                </div>
            </div>

            {/* Email Body */}
            <div className="space-y-4">
                <div className="flex items-center justify-between px-1">
                    <label className="text-[11px] font-black uppercase text-gray-400 tracking-[0.15em]">
                        Email Body (HTML Supported)
                    </label>
                </div>
                <div className="relative group">
                    <textarea
                        className="w-full px-6 py-5 bg-white border-2 border-gray-100 rounded-[2rem] text-sm font-bold min-h-[220px] focus:ring-8 focus:ring-blue-500/5 focus:border-blue-500 transition-all outline-none leading-relaxed resize-none overflow-hidden"
                        placeholder="Hello {{first_name}},\n\nThank you for your order!..."
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
                <div className="flex items-center gap-2 px-1">
                    <Info size={14} className="text-blue-500" />
                    <p className="text-[11px] text-gray-500 font-bold leading-relaxed">
                        Personalize your email using dynamic variables.
                    </p>
                </div>
                <div className="flex flex-wrap gap-2">
                    {variables.map((v) => (
                        <button
                            key={v}
                            onClick={() => insertVariable('messageText', v)}
                            className="px-4 py-2 bg-white border border-gray-100 rounded-full text-[10px] font-black text-blue-500 hover:border-blue-200 hover:shadow-sm transition-all"
                        >
                            {v}
                        </button>
                    ))}
                </div>
            </div>

            <div className="p-4 bg-amber-50 rounded-2xl border border-amber-100 flex gap-3">
                <div className="p-2 bg-white rounded-xl text-amber-500 h-fit shadow-sm">
                    <Mail size={16} />
                </div>
                <div>
                    <p className="text-[10px] font-black text-amber-900 uppercase tracking-wider">Email Tips</p>
                    <p className="text-[10px] font-bold text-amber-700/80 leading-relaxed mt-1">
                        Use <b>&lt;br&gt;</b> for line breaks and standard HTML tags for formatting if you need rich text.
                    </p>
                </div>
            </div>
        </div>
    );
};
