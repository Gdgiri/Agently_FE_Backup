import React, { useState, useEffect } from 'react';
import { NodeUpdateHandler } from './types';
import { Zap, Search, ChevronDown, Check, FlaskConical, Info } from 'lucide-react';
import apiClient from '../../../lib/apiClient';
import { toast } from 'react-hot-toast';

interface TemplateBotReplyEditorProps {
    data: any;
    onUpdate: NodeUpdateHandler;
}

export const TemplateBotReplyEditor: React.FC<TemplateBotReplyEditorProps> = ({ data, onUpdate }) => {
    const [templates, setTemplates] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState('');
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        fetchTemplates();
    }, []);

    const fetchTemplates = async () => {
        try {
            setLoading(true);
            const response = await apiClient.get('/templates'); // Updated path
            setTemplates(response.data.data || []);
        } catch (error) {
            toast.error('Failed to fetch templates');
        } finally {
            setLoading(false);
        }
    };

    const handleSyncMeta = async () => {
        try {
            toast.loading('Syncing with Meta...', { id: 'sync-meta' });
            await apiClient.post('/templates/sync-meta');
            await fetchTemplates();
            toast.success('Templates synced successfully', { id: 'sync-meta' });
        } catch (error) {
            toast.error('Failed to sync templates', { id: 'sync-meta' });
        }
    };

    const filteredTemplates = templates.filter(t =>
        t.name.toLowerCase().includes(search.toLowerCase()) ||
        t.category.toLowerCase().includes(search.toLowerCase())
    );

    const selectedTemplate = templates.find(t => t.name === data.templateName);

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
            {/* Step Name */}
            <div className="space-y-3">
                <label className="text-[11px] font-black uppercase text-gray-400 tracking-[0.15em] px-1 font-inter">Step Name</label>
                <input
                    className="w-full px-6 py-4 bg-white border-2 border-gray-100 rounded-[1.8rem] text-sm font-bold focus:ring-8 focus:ring-yellow-500/5 focus:border-yellow-500 transition-all outline-none font-inter"
                    placeholder="e.g. Welcome Template"
                    value={data.label || ''}
                    onChange={(e) => onUpdate('label', e.target.value)}
                />
            </div>

            {/* Template Selector */}
            <div className="space-y-3 relative">
                <div className="flex items-center justify-between px-1">
                    <label className="text-[11px] font-black uppercase text-gray-400 tracking-[0.15em] font-inter">Select Template</label>
                    <button
                        onClick={handleSyncMeta}
                        className="text-[10px] font-black text-yellow-600 hover:text-yellow-700 uppercase tracking-widest flex items-center gap-1.5 transition-colors"
                    >
                        <Zap size={10} className="fill-current" /> Sync from Meta
                    </button>
                </div>
                <div
                    onClick={() => setIsOpen(!isOpen)}
                    className={`w-full px-6 py-4 bg-white border-2 rounded-[1.8rem] flex items-center justify-between cursor-pointer transition-all ${isOpen ? 'border-yellow-500 ring-8 ring-yellow-500/5' : 'border-gray-100'
                        }`}
                >
                    <div className="flex items-center gap-3">
                        <Zap size={16} className={data.templateName ? 'text-yellow-500' : 'text-gray-300'} />
                        <span className={`text-sm font-bold ${data.templateName ? 'text-gray-900' : 'text-gray-400'} font-inter`}>
                            {data.templateName || 'Choose Meta Template...'}
                        </span>
                    </div>
                    <ChevronDown size={18} className={`text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                </div>

                {isOpen && (
                    <div className="absolute top-full left-0 right-0 mt-3 bg-white border border-gray-100 rounded-[2rem] shadow-2xl p-4 z-50 space-y-4 animate-in zoom-in-95 duration-200">
                        {/* Search */}
                        <div className="relative">
                            <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                className="w-full pl-10 pr-4 py-3 bg-gray-50 rounded-2xl text-[13px] font-bold outline-none border border-transparent focus:border-gray-200"
                                placeholder="Search templates..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                onClick={(e) => e.stopPropagation()}
                                autoFocus
                            />
                        </div>

                        {/* List */}
                        <div className="max-h-[300px] overflow-y-auto custom-scrollbar space-y-1">
                            {loading ? (
                                <div className="py-8 text-center text-gray-400 text-xs font-bold italic">Loading Meta templates...</div>
                            ) : filteredTemplates.length > 0 ? (
                                filteredTemplates.map(t => (
                                    <div
                                        key={t.id}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            const updates: any = {
                                                templateName: t.name,
                                                languageCode: t.language
                                            };
                                            // Initialize empty params for all variables
                                            if (t.variables?.length > 0) {
                                                const initialParams: Record<string, string> = {};
                                                t.variables.forEach((v: string) => {
                                                    initialParams[v] = '';
                                                });
                                                updates.templateParams = initialParams;
                                            }
                                            onUpdate(updates);
                                            setIsOpen(false);
                                        }}
                                        className="group flex items-center justify-between p-4 hover:bg-yellow-50 rounded-2xl cursor-pointer transition-all"
                                    >
                                        <div className="flex flex-col gap-0.5">
                                            <span className="text-sm font-black text-gray-800 group-hover:text-yellow-700 transition-colors">{t.name} ({t.language})</span>
                                            <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 group-hover:text-yellow-600/60 transition-colors">({t.category})</span>
                                        </div>
                                        {data.templateName === t.name && <Check size={16} className="text-yellow-500" />}
                                    </div>
                                ))
                            ) : (
                                <div className="py-8 text-center text-gray-400 text-xs font-bold">No templates found</div>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* Template Info Card & Dynamic Parameters */}
            {selectedTemplate && (
                <div className="space-y-6 animate-in zoom-in-95 duration-300">
                    <div className="p-6 bg-yellow-50 border border-yellow-100 rounded-[2.5rem] flex items-start gap-4 shadow-sm">
                        <div className="p-3 bg-white rounded-2xl text-yellow-500 shadow-sm border border-yellow-50">
                            <Info size={18} />
                        </div>
                        <div>
                            <p className="text-xs font-black text-yellow-800">Template Logic</p>
                            <p className="text-[11px] font-bold text-yellow-700/70 leading-relaxed mt-1">
                                {selectedTemplate.variables?.length > 0
                                    ? `This template contains ${selectedTemplate.variables.length} parameters. Please assign content for each.`
                                    : "This template is ready to send. No parameters required."}
                            </p>
                        </div>
                    </div>

                    {/* Parameter Mapping Fields */}
                    {selectedTemplate.variables?.length > 0 && (
                        <div className="space-y-6 p-8 bg-gray-50/50 border-2 border-gray-100 rounded-[2.5rem] relative overflow-hidden">
                            <div className="flex items-center gap-2 mb-2 px-1">
                                <label className="text-[11px] font-black uppercase text-gray-400 tracking-[0.15em] font-inter">Parameter Assignments</label>
                            </div>

                            <div className="grid grid-cols-1 gap-6">
                                {selectedTemplate.variables.map((v: string) => (
                                    <div key={v} className="space-y-3">
                                        <div className="flex items-center justify-between px-2">
                                            <p className="text-[11px] font-black text-gray-500 uppercase tracking-[0.1em]">
                                                Assign content for <span className="text-yellow-600">{"{{"}{v}{"}}"}</span> variable
                                            </p>
                                            <span className="text-[8px] font-black text-white bg-yellow-500 px-2 py-0.5 rounded-full uppercase tracking-tighter">Required</span>
                                        </div>
                                        <div className="relative group">
                                            <div className="absolute left-6 top-1/2 -translate-y-1/2 text-yellow-500 pointer-events-none opacity-40 group-focus-within:opacity-100 transition-opacity">
                                                <FlaskConical size={16} />
                                            </div>
                                            <input
                                                className="w-full pl-14 pr-6 py-4 bg-white border-2 border-gray-100 rounded-[1.8rem] text-sm font-bold focus:ring-8 focus:ring-yellow-500/5 focus:border-yellow-500 transition-all outline-none font-inter shadow-sm"
                                                placeholder={`Choose or Write content for {{${v}}}...`}
                                                value={(data.templateParams || {})[v] || ''}
                                                onChange={(e) => {
                                                    const newParams = { ...(data.templateParams || {}), [v]: e.target.value };
                                                    onUpdate('templateParams', newParams);
                                                }}
                                            />
                                        </div>

                                        {/* Quick Select Buttons */}
                                        <div className="flex flex-wrap gap-2 px-2">
                                            {[
                                                { label: 'First Name', value: '{first_name}' },
                                                { label: 'Full Name', value: '{full_name}' },
                                                { label: 'Phone', value: '{phone_number}' }
                                            ].map(btn => (
                                                <button
                                                    key={btn.value}
                                                    onClick={() => {
                                                        const newParams = { ...(data.templateParams || {}), [v]: btn.value };
                                                        onUpdate('templateParams', newParams);
                                                    }}
                                                    className="px-3 py-1.5 bg-white border border-gray-200 rounded-xl text-[10px] font-black text-gray-400 hover:border-yellow-500 hover:text-yellow-600 hover:bg-yellow-50 transition-all active:scale-95"
                                                >
                                                    {btn.label}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}

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
