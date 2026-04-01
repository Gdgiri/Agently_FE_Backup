import React from 'react';
import { NodeUpdateHandler } from './types';
import { MousePointerClick, Link, List, Plus, Trash2, FlaskConical, GripVertical } from 'lucide-react';

interface InteractiveBotReplyEditorProps {
    data: any;
    onUpdate: NodeUpdateHandler;
}

export const InteractiveBotReplyEditor: React.FC<InteractiveBotReplyEditorProps> = ({ data, onUpdate }) => {
    const interactionTypes = [
        { id: 'buttons', label: 'Reply Buttons', icon: MousePointerClick },
        { id: 'cta', label: 'CTA URL Button', icon: Link },
        { id: 'list', label: 'List Message', icon: List }
    ];

    const variables = ['{first_name}', '{last_name}', '{full_name}', '{phone_number}'];

    const handleAddButton = () => {
        const buttons = data.buttons || [];
        if (buttons.length < 3) {
            onUpdate('buttons', [...buttons, { id: Date.now().toString(), title: `Button ${buttons.length + 1}` }]);
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300 pb-20">
            {/* Step Name */}
            <div className="space-y-3">
                <label className="text-[11px] font-black uppercase text-gray-400 tracking-[0.15em] px-1">Name</label>
                <input
                    className="w-full px-6 py-4 bg-white border-2 border-gray-100 rounded-[1.8rem] text-sm font-bold focus:ring-8 focus:ring-blue-500/5 focus:border-blue-500 transition-all outline-none"
                    placeholder="e.g. Interactive Menu"
                    value={data.label || ''}
                    onChange={(e) => onUpdate('label', e.target.value)}
                />
            </div>

            {/* Interaction Type Toggles */}
            <div className="flex bg-gray-50 p-2 rounded-[2rem] gap-1">
                {interactionTypes.map((t) => (
                    <button
                        key={t.id}
                        onClick={() => onUpdate('interactionType', t.id)}
                        className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-[1.5rem] text-[10px] font-black uppercase transition-all ${(data.interactionType || 'buttons') === t.id
                            ? 'bg-white text-blue-600 shadow-sm border border-gray-100'
                            : 'text-gray-400 hover:text-gray-600'
                            }`}
                    >
                        <t.icon size={14} />
                        {t.label}
                    </button>
                ))}
            </div>

            {/* Header Type */}
            <div className="space-y-3">
                <label className="text-[11px] font-black uppercase text-gray-400 tracking-[0.15em] px-1">Header Type (Optional)</label>
                <select
                    className="w-full px-6 py-4 bg-white border-2 border-gray-100 rounded-[1.8rem] text-sm font-bold outline-none cursor-pointer"
                    value={data.headerType || 'none'}
                    onChange={(e) => onUpdate('headerType', e.target.value)}
                >
                    <option value="none">None</option>
                    <option value="text">Text</option>
                    <option value="image">Image</option>
                    <option value="video">Video</option>
                </select>
            </div>

            {/* Reply Text */}
            <div className="space-y-4">
                <label className="text-[11px] font-black uppercase text-gray-400 tracking-[0.15em] px-1">Reply Text</label>
                <textarea
                    className="w-full px-6 py-5 bg-white border-2 border-gray-100 rounded-[2rem] text-sm font-bold min-h-[120px] focus:ring-8 focus:ring-blue-500/5 focus:border-blue-500 transition-all outline-none resize-none leading-relaxed"
                    placeholder="Add your main message body text here..."
                    value={data.messageText || ''}
                    onChange={(e) => onUpdate('messageText', e.target.value)}
                />
            </div>

            {/* Variable Badges */}
            <div className="flex flex-wrap gap-1.5">
                {variables.map(v => (
                    <button
                        key={v}
                        onClick={() => onUpdate('messageText', (data.messageText || '') + ' ' + v)}
                        className="px-3 py-1.5 bg-pink-50 text-pink-500 rounded-full text-[10px] font-bold border border-pink-100 hover:bg-pink-100 transition-colors"
                    >
                        {v}
                    </button>
                ))}
            </div>

            {/* CTA Specific Fields */}
            {data.interactionType === 'cta' && (
                <div className="space-y-4 pt-4 border-t border-gray-100">
                    <div className="space-y-2">
                        <label className="text-[11px] font-black uppercase text-gray-400 tracking-[0.15em] px-1">Button Label</label>
                        <input
                            className="w-full px-6 py-4 bg-white border-2 border-gray-100 rounded-[1.5rem] text-sm font-bold"
                            placeholder="e.g. Visit Website"
                            value={data.ctaLabel || ''}
                            onChange={(e) => onUpdate('ctaLabel', e.target.value)}
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[11px] font-black uppercase text-gray-400 tracking-[0.15em] px-1">Website URL</label>
                        <input
                            className="w-full px-6 py-4 bg-white border-2 border-gray-100 rounded-[1.5rem] text-sm font-bold"
                            placeholder="https://..."
                            value={data.ctaUrl || ''}
                            onChange={(e) => onUpdate('ctaUrl', e.target.value)}
                        />
                    </div>
                </div>
            )}

            {/* Buttons Builder */}
            {data.interactionType === 'buttons' && (
                <div className="space-y-4">
                    <div className="flex items-center justify-between px-1">
                        <label className="text-[11px] font-black uppercase text-gray-400 tracking-[0.15em]">Buttons ({data.buttons?.length || 0}/3)</label>
                        <button
                            onClick={handleAddButton}
                            disabled={(data.buttons?.length || 0) >= 3}
                            className="p-2 text-blue-500 hover:bg-blue-50 rounded-xl disabled:opacity-30 transition-all"
                        >
                            <Plus size={16} />
                        </button>
                    </div>
                    <div className="space-y-3">
                        {(data.buttons || []).map((btn: any, idx: number) => (
                            <div key={btn.id} className="space-y-2">
                                <div className="group relative">
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300">
                                        <GripVertical size={14} />
                                    </div>
                                    <input
                                        className="w-full pl-10 pr-12 py-4 bg-white border-2 border-gray-100 rounded-[1.5rem] text-sm font-bold focus:border-blue-500 transition-all outline-none shadow-sm"
                                        placeholder="Button Title"
                                        value={btn.title}
                                        onChange={(e) => {
                                            const newBtns = [...data.buttons];
                                            newBtns[idx] = { ...newBtns[idx], title: e.target.value };
                                            onUpdate('buttons', newBtns);
                                        }}
                                    />
                                    <button
                                        onClick={() => onUpdate('buttons', data.buttons.filter((b: any) => b.id !== btn.id))}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 p-2 text-gray-400 hover:text-red-500 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                                <div className="px-2">
                                    <div className="relative group">
                                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-blue-500">
                                            <Link size={12} />
                                        </div>
                                        <input
                                            className="w-full pl-10 pr-4 py-2.5 bg-gray-50/50 border border-gray-100 rounded-xl text-[11px] font-bold focus:bg-white focus:border-blue-200 transition-all outline-none"
                                            placeholder="Website URL (Optional - will navigate if set)"
                                            value={btn.url || ''}
                                            onChange={(e) => {
                                                const newBtns = [...data.buttons];
                                                newBtns[idx] = { ...newBtns[idx], url: e.target.value };
                                                onUpdate('buttons', newBtns);
                                            }}
                                        />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Meta Limitation Notice */}
                    {data.buttons?.some((b: any) => b.url) && (
                        <div className="p-4 bg-amber-50 rounded-2xl border border-amber-100 space-y-2">
                            <div className="flex items-center gap-2 text-amber-600">
                                <FlaskConical size={14} />
                                <span className="text-[10px] font-black uppercase tracking-wider">Meta Restriction</span>
                            </div>
                            <p className="text-[10px] font-bold text-amber-700/80 leading-relaxed">
                                Meta Cloud API only supports **ONE URL button** per message. If you include a URL, other buttons will be ignored by Meta.
                            </p>
                        </div>
                    )}
                </div>
            )}

            {/* List Builder */}
            {data.interactionType === 'list' && (
                <div className="space-y-6">
                    {(data.sections || [{ title: 'Main Menu', rows: [] }]).map((section: any, sIdx: number) => (
                        <div key={sIdx} className="p-6 bg-gray-50 rounded-[2.5rem] border border-gray-100 space-y-4">
                            <div className="flex items-center justify-between">
                                <input
                                    className="bg-transparent text-[11px] font-black uppercase tracking-wider outline-none text-gray-900"
                                    value={section.title || ''}
                                    placeholder="Section Title"
                                    onChange={(e) => {
                                        const nextSections = [...(data.sections || [{ title: 'Main Menu', rows: [] }])];
                                        nextSections[sIdx].title = e.target.value;
                                        onUpdate('sections', nextSections);
                                    }}
                                />
                                <button className="text-gray-400 hover:text-red-500"><Trash2 size={14} /></button>
                            </div>
                            <div className="space-y-2">
                                {(section.rows || []).map((row: any, rIdx: number) => (
                                    <div key={rIdx} className="bg-white p-4 rounded-2xl border border-gray-100 space-y-2">
                                        <input
                                            className="w-full bg-transparent text-sm font-bold outline-none"
                                            value={row.title}
                                            placeholder="Option Title"
                                            onChange={(e) => {
                                                const nextSections = [...data.sections];
                                                nextSections[sIdx].rows[rIdx].title = e.target.value;
                                                onUpdate('sections', nextSections);
                                            }}
                                        />
                                        <input
                                            className="w-full bg-transparent text-[10px] font-bold text-gray-400 outline-none"
                                            value={row.description}
                                            placeholder="Description (Optional)"
                                            onChange={(e) => {
                                                const nextSections = [...data.sections];
                                                nextSections[sIdx].rows[rIdx].description = e.target.value;
                                                onUpdate('sections', nextSections);
                                            }}
                                        />
                                    </div>
                                ))}
                                <button
                                    onClick={() => {
                                        const nextSections = [...(data.sections || [{ title: 'Main Menu', rows: [] }])];
                                        if (!nextSections[sIdx].rows) nextSections[sIdx].rows = [];
                                        nextSections[sIdx].rows.push({ title: 'New Option', description: '' });
                                        onUpdate('sections', nextSections);
                                    }}
                                    className="w-full py-3 bg-white border-2 border-dashed border-gray-200 rounded-2xl text-[10px] font-black uppercase text-gray-400 hover:border-blue-200 hover:text-blue-500 transition-all"
                                >
                                    + Add Option
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Footer Text */}
            <div className="space-y-3 pt-4 border-t border-gray-100">
                <label className="text-[11px] font-black uppercase text-gray-400 tracking-[0.15em] px-1">Footer Text (Optional)</label>
                <input
                    className="w-full px-6 py-4 bg-white border-2 border-gray-100 rounded-[1.8rem] text-sm font-bold outline-none"
                    placeholder="e.g. Team Support"
                    value={data.footerText || ''}
                    onChange={(e) => onUpdate('footerText', e.target.value)}
                />
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
