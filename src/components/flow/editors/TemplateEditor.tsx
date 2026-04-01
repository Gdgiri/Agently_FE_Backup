import React, { useState, useEffect } from 'react';
import { NodeUpdateHandler } from './types';
import { Zap, AlertCircle, RefreshCw } from 'lucide-react';
import apiClient from '../../../lib/apiClient';

interface TemplateEditorProps {
    data: any;
    onUpdate: NodeUpdateHandler;
}

export const TemplateEditor: React.FC<TemplateEditorProps> = ({ data, onUpdate }) => {
    const [templates, setTemplates] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        fetchTemplates();
    }, []);

    const fetchTemplates = async () => {
        setIsLoading(true);
        try {
            const response = await apiClient.get('/whatsapp/templates');
            setTemplates(response.data.data || []);
        } catch (error) {
            console.error('Failed to fetch templates:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const selectedTemplate = templates.find(t => t.name === data.templateName);

    return (
        <div className="space-y-6">
            <div className="space-y-2">
                <div className="flex items-center justify-between px-1">
                    <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest">
                        Select Template
                    </label>
                    <button onClick={fetchTemplates} className="text-gray-400 hover:text-blue-500 transition-colors">
                        <RefreshCw size={12} className={isLoading ? 'animate-spin' : ''} />
                    </button>
                </div>
                <select
                    className="w-full px-5 py-4 bg-white border-2 border-gray-100 rounded-[1.5rem] text-sm font-bold focus:ring-4 focus:ring-[#F59E0B]/5 focus:border-[#F59E0B] transition-all outline-none appearance-none"
                    value={data.templateName || ''}
                    onChange={(e) => onUpdate('templateName', e.target.value)}
                >
                    <option value="">Choose a template...</option>
                    {templates.map(t => (
                        <option key={t.id} value={t.name}>{t.name} ({t.language})</option>
                    ))}
                </select>
            </div>

            {data.templateName && (
                <div className="p-6 bg-orange-50/30 border border-orange-100/50 rounded-[2rem] space-y-4">
                    <div className="flex items-center gap-2">
                        <Zap size={14} className="text-orange-500" />
                        <span className="text-[10px] font-black text-orange-600 uppercase tracking-widest">Template Variables</span>
                    </div>

                    {/* Placeholder for variable mapping - In a real app we'd parse the template body */}
                    <p className="text-[10px] text-orange-700 font-bold leading-relaxed">
                        WhatsApp templates are pre-approved by Meta. Variables like <span className="text-orange-900 font-black">{"{{1}}"}</span> can be mapped to contact data.
                    </p>

                    <div className="space-y-4 mt-4">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-orange-600 uppercase tracking-widest">Variable {"{{1}}"}</label>
                            <input
                                className="w-full bg-white border border-orange-200 rounded-xl px-4 py-2 text-xs font-bold"
                                placeholder="e.g. {first_name}"
                                value={data.var1 || ''}
                                onChange={(e) => onUpdate('var1', e.target.value)}
                            />
                        </div>
                    </div>
                </div>
            )}

            {!data.templateName && (
                <div className="p-6 bg-gray-50 border border-gray-100 rounded-[2rem] flex flex-col items-center gap-3 text-center">
                    <AlertCircle size={24} className="text-gray-300" />
                    <p className="text-[10px] text-gray-400 font-bold leading-relaxed">
                        Please select a template to configure variable mappings.
                    </p>
                </div>
            )}
        </div>
    );
};
