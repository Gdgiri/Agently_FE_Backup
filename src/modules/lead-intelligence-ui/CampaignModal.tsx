import React, { useState, useEffect } from 'react';
import { X, Send, Mail, Instagram, MessageSquare, Zap, Eye, ChevronRight, Loader2 } from 'lucide-react';
import { Card, Button, Badge } from '../../components/shared';
import { cn } from '../../components/ui';
import { useAppDispatch, useAppSelector } from '../../store';
import { fetchTemplatesAsync } from '../../features/templateSlice';
import { createCampaignAsync } from '../../features/campaignSlice';
import toast from 'react-hot-toast';

export interface CampaignModalProps {
    isOpen: boolean;
    onClose: () => void;
    lead?: any;
}

const CampaignModal: React.FC<CampaignModalProps> = ({ isOpen, onClose, lead }) => {
    const dispatch = useAppDispatch();
    const { templates, loading: templatesLoading } = useAppSelector(state => state.templates);
    const { loading: campaignLoading } = useAppSelector(state => state.campaigns);
    
    const [channel, setChannel] = useState<'whatsapp' | 'email' | 'instagram'>('whatsapp');
    const [selectedTemplateId, setSelectedTemplateId] = useState<string>('');

    useEffect(() => {
        if (isOpen) {
            dispatch(fetchTemplatesAsync());
        }
    }, [isOpen, dispatch]);

    useEffect(() => {
        if (templates.length > 0 && !selectedTemplateId) {
            setSelectedTemplateId(templates[0].id);
        }
    }, [templates, selectedTemplateId]);

    const handleLaunch = async () => {
        if (!selectedTemplateId) {
            toast.error('Please select a template');
            return;
        }

        try {
            await dispatch(createCampaignAsync({
                name: `One-off: ${lead?.name || 'New Lead'}`,
                templateId: selectedTemplateId,
                audience: { contactIds: [lead?.id || ''] } // Note: Assuming lead ID can be used as a contact target or backend handles promotion
            })).unwrap();
            
            toast.success('Campaign launched successfully!');
            onClose();
        } catch (error: any) {
            toast.error(error || 'Failed to launch campaign');
        }
    };

    if (!isOpen) return null;

    const selectedTemplate = templates.find(t => t.id === selectedTemplateId);

    const getTemplateBody = (template: any) => {
        if (!template) return '';
        const components = template.components;
        if (Array.isArray(components)) {
            const body = components.find((c: any) => c.type === 'BODY');
            return body?.text || '';
        }
        return '';
    };

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-md" onClick={onClose} />
            
            <Card className="relative w-full max-w-2xl bg-white rounded-[2.5rem] shadow-[0_32px_64px_-12px_rgba(0,0,0,0.2)] overflow-hidden animate-in zoom-in duration-300">
                <div className="h-2 bg-gradient-to-r from-[#25D366] via-blue-500 to-purple-600" />
                
                <div className="p-8 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-gray-900 text-white rounded-2xl shadow-xl">
                            <Zap size={24} />
                        </div>
                        <div>
                            <h3 className="text-xl font-black text-gray-900">Push to Campaign</h3>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">Automated Lead Engagement</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-white rounded-full text-gray-400 transition-colors"><X size={24} /></button>
                </div>

                <div className="p-10 space-y-10 max-h-[70vh] overflow-y-auto">
                    {/* Step 1: Choose Channel */}
                    <div className="space-y-6">
                        <h4 className="text-sm font-black text-gray-900 flex items-center gap-2">
                            <span className="w-6 h-6 rounded-full bg-gray-900 text-white text-[10px] flex items-center justify-center">1</span>
                            Select Conversation Channel
                        </h4>
                        <div className="grid grid-cols-3 gap-6">
                            {[
                                { id: 'whatsapp', icon: MessageSquare, color: 'text-[#25D366]', bg: 'bg-green-50', label: 'WhatsApp' },
                                { id: 'email', icon: Mail, color: 'text-blue-500', bg: 'bg-blue-50', label: 'Email' },
                                { id: 'instagram', icon: Instagram, color: 'text-pink-600', bg: 'bg-pink-50', label: 'Instagram' },
                            ].map(opt => (
                                <button 
                                    key={opt.id}
                                    onClick={() => setChannel(opt.id as any)}
                                    className={cn(
                                        "p-6 rounded-3xl border-2 transition-all group relative overflow-hidden",
                                        channel === opt.id ? "border-gray-900 bg-gray-50 shadow-xl scale-105" : "border-gray-100 hover:border-gray-200"
                                    )}
                                >
                                    <opt.icon size={28} className={cn("mx-auto mb-3 transition-transform group-hover:scale-110", opt.color)} />
                                    <p className="text-[10px] font-black uppercase tracking-widest">{opt.label}</p>
                                    {channel === opt.id && (
                                        <div className="absolute top-2 right-2 w-4 h-4 bg-gray-900 rounded-full flex items-center justify-center">
                                            <div className="w-1.5 h-1.5 bg-white rounded-full" />
                                        </div>
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Step 2: Select Template */}
                    <div className="space-y-6">
                        <div className="flex justify-between items-center">
                            <h4 className="text-sm font-black text-gray-900 flex items-center gap-2">
                                <span className="w-6 h-6 rounded-full bg-gray-900 text-white text-[10px] flex items-center justify-center">2</span>
                                Choose Message Template
                            </h4>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-3">
                            {templatesLoading ? (
                                <div className="col-span-2 py-8 flex justify-center"><Loader2 className="animate-spin text-gray-400" /></div>
                            ) : templates.map(t => (
                                <button
                                    key={t.id}
                                    onClick={() => setSelectedTemplateId(t.id)}
                                    className={cn(
                                        "p-4 rounded-2xl border text-left transition-all",
                                        selectedTemplateId === t.id ? "border-[#25D366] bg-green-50/30" : "border-gray-100 hover:border-gray-200"
                                    )}
                                >
                                    <p className="text-xs font-black text-gray-900">{t.name}</p>
                                    <p className="text-[10px] text-gray-400 truncate mt-1">{getTemplateBody(t)}</p>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Step 3: Preview */}
                    <div className="space-y-6">
                        <div className="flex justify-between items-center">
                            <h4 className="text-sm font-black text-gray-900 flex items-center gap-2">
                                <span className="w-6 h-6 rounded-full bg-gray-900 text-white text-[10px] flex items-center justify-center">3</span>
                                Preview Message
                            </h4>
                        </div>
                        
                        <div className="bg-gray-900 rounded-[2rem] p-8 relative overflow-hidden shadow-inner group">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-white/[0.03] rounded-bl-[4rem]" />
                            <div className="flex items-start gap-4">
                                <div className="p-3 bg-white/10 text-white/50 rounded-xl group-hover:bg-white/20 transition-colors"><Eye size={20} /></div>
                                <div className="space-y-2">
                                    <p className="text-xs text-white/90 leading-relaxed">
                                        {selectedTemplate ? getTemplateBody(selectedTemplate).replace('{{1}}', lead?.name || 'Lead') : 'Select a template to preview...'}
                                    </p>
                                    <p className="text-[10px] text-white/40 italic">Note: Dynamic values will be injected automatically.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="p-8 border-t border-gray-100 bg-gray-50 flex items-center justify-between">
                    <p className="text-[10px] font-bold text-gray-400 flex items-center gap-1.5">
                        <Zap size={14} className="text-[#25D366] font-black" /> Processing with AI Intelligence Engine
                    </p>
                    <div className="flex gap-4">
                        <Button variant="ghost" onClick={onClose}>Cancel</Button>
                        <Button 
                            className="bg-[#25D366] text-white px-10 rounded-2xl shadow-xl shadow-green-100 hover:shadow-green-200"
                            onClick={handleLaunch}
                            disabled={campaignLoading || !selectedTemplateId}
                        >
                            {campaignLoading ? <Loader2 className="animate-spin mr-2" size={18} /> : 'Launch Campaign'} 
                            {!campaignLoading && <ChevronRight size={18} className="ml-2" />}
                        </Button>
                    </div>
                </div>
            </Card>
        </div>
    );
};

export default CampaignModal;
