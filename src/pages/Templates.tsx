
import React, { useState, useRef, useEffect } from 'react';
import {
    FileText, Plus, Search, RefreshCw, Layout, CheckCircle2, Clock, AlertCircle, Smartphone,
    ChevronRight, Eye, Settings, X, Trash2, PlusCircle, Type, Image as ImageIcon, Video,
    File as FileIcon, MessageSquare, HelpCircle, ExternalLink, Bold, Italic, Strikethrough,
    Code, Phone, Copy, Layers, ChevronLeft, Upload, Link as LinkIcon, MoreVertical,
    Check, ArrowRight, RotateCcw
} from 'lucide-react';
import { cn, Card, Button, Badge, Input, PremiumLoading } from '../components/ui';
import { motion, AnimatePresence } from 'framer-motion';
import AIGenerateTemplateModal from '../components/ai/AIGenerateTemplateModal';
import { Sparkles as SparklesIcon } from 'lucide-react';
import { templateApi, Template } from '../lib/api/templateApi';
import { mediaApi } from '../lib/api/mediaApi';
import toast from 'react-hot-toast';
import { Loader2 } from 'lucide-react';
import { WHATSAPP_LANGUAGES } from '../constants/languages';

const Templates: React.FC = () => {
    // --- State & Logic (Preserved) ---
    const [isCreating, setIsCreating] = useState(false);
    const [activeTab, setActiveTab] = useState('all');
    const [step, setStep] = useState(1);
    const [templates, setTemplates] = useState<Template[]>([]);
    const [loading, setLoading] = useState(true);
    const [syncing, setSyncing] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [showUrlInput, setShowUrlInput] = useState(false);
    const [isAIModalOpen, setIsAIModalOpen] = useState(false);

    const bodyRef = useRef<HTMLTextAreaElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [templateData, setTemplateData] = useState({
        name: '',
        category: 'MARKETING',
        language: 'en_US',
        layout: 'STANDARD' as 'STANDARD' | 'CAROUSEL',
        headerType: 'NONE' as 'NONE' | 'TEXT' | 'IMAGE' | 'VIDEO' | 'DOCUMENT',
        headerText: '',
        headerMediaUrl: '',
        bodyText: '',
        footerText: '',
        buttons: [] as any[],
        variableLabels: {} as Record<string, string>,
        cards: [
            { headerType: 'IMAGE', headerUrl: '', bodyText: '', buttons: [] }
        ]
    });

    useEffect(() => {
        fetchTemplates();
    }, []);

    const fetchTemplates = async () => {
        try {
            setLoading(true);
            const { data } = await templateApi.getAll();
            if (data.success) {
                setTemplates(data.data);
            }
        } catch (error) {
            console.error('Failed to load templates', error);
            toast.error('Failed to load templates');
        } finally {
            setLoading(false);
        }
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const type = templateData.headerType;
        if (type === 'IMAGE' && !file.type.startsWith('image/')) return toast.error('Please upload an image file');
        if (type === 'VIDEO' && !file.type.startsWith('video/')) return toast.error('Please upload a video file');

        setIsUploading(true);
        const toastId = toast.loading(`Uploading ${file.name}...`);
        try {
            const { data } = await mediaApi.upload(file);
            if (data.success) {
                setTemplateData({ ...templateData, headerMediaUrl: data.data.url });
                toast.success('Uploaded', { id: toastId });
            } else {
                toast.error('Upload failed', { id: toastId });
            }
        } catch (error) {
            toast.error('Server error', { id: toastId });
        } finally {
            setIsUploading(false);
        }
    };

    const applyFormatting = (prefix: string, suffix: string) => {
        if (!bodyRef.current) return;
        const start = bodyRef.current.selectionStart;
        const end = bodyRef.current.selectionEnd;
        const text = templateData.bodyText;
        const before = text.substring(0, start);
        const selection = text.substring(start, end);
        const after = text.substring(end);
        const newText = `${before}${prefix}${selection}${suffix}${after}`;
        setTemplateData({ ...templateData, bodyText: newText });
        setTimeout(() => {
            if (bodyRef.current) {
                bodyRef.current.focus();
                bodyRef.current.setSelectionRange(start + prefix.length, end + prefix.length);
            }
        }, 10);
    };

    const handleCreateTemplate = async () => {
        if (!templateData.name || (templateData.layout === 'STANDARD' && !templateData.bodyText)) {
            toast.error('Please fill in required fields');
            return;
        }
        const toastId = toast.loading('Submitting...');
        try {

            const contentObj: any = {
                body: { text: templateData.bodyText }
            };

            if (templateData.headerType !== 'NONE') {
                contentObj.header = {
                    type: templateData.headerType,
                    text: templateData.headerText,
                    format: templateData.headerType,
                    url: templateData.headerMediaUrl
                };
            }

            if (templateData.footerText) {
                contentObj.footer = { text: templateData.footerText };
            }

            if (templateData.variableLabels && Object.keys(templateData.variableLabels).length > 0) {
                contentObj.variableLabels = templateData.variableLabels;
            }

            if (templateData.buttons.length > 0) {
                contentObj.buttons = templateData.buttons;
            }


            const payload = {
                name: templateData.name.toLowerCase().replace(/\s+/g, '_'),
                category: templateData.category,
                language: templateData.language,
                content: contentObj,
                autoSubmit: true,
            };
            const { data } = await templateApi.create(payload);
            if (data.success) {
                toast.success('Created', { id: toastId });
                setIsCreating(false);
                setStep(1);
                fetchTemplates();
            } else {
                toast.error(data.message || 'Failed', { id: toastId });
            }
        } catch (error: any) {
            toast.error('Error occurred', { id: toastId });
        }
    };

    const renderFormattedText = (text: string) => {
        if (!text) return '';
        return text
            .replace(/\*(.*?)\*/g, '<strong class="font-bold underline-offset-2">$1</strong>')
            .replace(/_(.*?)_/g, '<em class="italic">$1</em>')
            .replace(/~(.*?)~/g, '<del class="line-through opacity-70">$1</del>')
            .replace(/`(.*?)`/g, '<code class="bg-[#f0f2f5] text-[#e91e63] px-1 rounded-sm font-mono text-[0.9em]">$1</code>')
            .replace(/\{\{(\d+)\}\}/g, '<span class="text-blue-600 font-medium bg-blue-50 px-1 rounded">[$1]</span>');
    };

    const addVariable = () => {
        const vars = templateData.bodyText.match(/\{\{\d+\}\}/g) || [];
        const nextVar = vars.length + 1;
        setTemplateData({ ...templateData, bodyText: templateData.bodyText + ` {{${nextVar}}}` });
    };

    const handleSyncMeta = async () => {
        setSyncing(true);
        const toastId = toast.loading('Syncing...');
        try {
            const { data } = await (templateApi as any).syncFromMeta();
            if (data.success) {
                toast.success(`Synced ${data.data.length} templates`, { id: toastId });
                fetchTemplates();
            }
        } catch (error) {
            toast.error('Sync failed', { id: toastId });
        } finally {
            setSyncing(false);
        }

    };

    const handleDeleteTemplate = async (templateId: string, status: string) => {
        const isApproved = status === 'APPROVED';
        const msg = isApproved
            ? 'This template is APPROVED on Meta. Deleting it will remove it from Meta and your CRM. Are you sure?'
            : 'Are you sure you want to delete this template?';

        if (!window.confirm(msg)) return;

        const toastId = toast.loading('Deleting...');
        try {
            const { data } = await (templateApi as any).delete(templateId, isApproved);
            if (data.success) {
                toast.success('Deleted successfully', { id: toastId });
                fetchTemplates();
            } else {
                toast.error(data.message || 'Delete failed', { id: toastId });
            }
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Error deleting template', { id: toastId });
        }
    };

    return (
        <div className="p-6 space-y-6 h-full bg-[#FAFBFC] font-sans text-gray-900 selection:bg-green-100 italic-none">
            {/* Header */}
            <header className="flex items-center justify-between">
                <div>
                    <h1 className="text-xl font-semibold tracking-tight text-gray-900">Message Templates</h1>
                    <p className="text-[13px] text-gray-500 mt-0.5">Manage and build high-conversion WhatsApp messages.</p>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm" className="h-9 text-xs font-medium border-gray-200" onClick={handleSyncMeta} disabled={syncing}>
                        <RefreshCw size={14} className={cn("mr-2", syncing && "animate-spin")} />
                        {syncing ? 'Syncing...' : 'Sync from Meta'}
                    </Button>
                    <Button size="sm" className="h-9 px-4 text-xs font-medium bg-[#25D366] hover:bg-[#20bd5b] text-white shadow-sm transition-all" onClick={() => { setIsCreating(true); setStep(1); }}>
                        <Plus size={16} className="mr-1.5" /> New Template
                    </Button>
                </div>
            </header>

            {/* Quick Stats - More Slim */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {[
                    { label: 'Approved', val: templates.filter(t => t.status === 'APPROVED').length, icon: CheckCircle2, color: 'text-emerald-500', bg: 'bg-emerald-50' },
                    { label: 'Pending', val: templates.filter(t => t.status === 'PENDING').length, icon: Clock, color: 'text-amber-500', bg: 'bg-amber-50' },
                    { label: 'Rejected', val: templates.filter(t => t.status === 'REJECTED').length, icon: AlertCircle, color: 'text-rose-500', bg: 'bg-rose-50' },
                    { label: 'Total Used', val: '8.4k', icon: Layers, color: 'text-blue-500', bg: 'bg-blue-50' }
                ].map((s, i) => (
                    <Card key={i} className="p-4 flex items-center gap-4 border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                        <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center shrink-0", s.bg, s.color)}>
                            <s.icon size={20} />
                        </div>
                        <div>
                            <p className="text-[11px] font-medium text-gray-400 uppercase tracking-wider">{s.label}</p>
                            <p className="text-lg font-bold text-gray-900">{s.val}</p>
                        </div>
                    </Card>
                ))}
            </div>

            {/* Template List - Cleaner */}
            <Card className="border-gray-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-[#F8F9FA] border-b border-gray-100">
                            <tr>
                                <th className="px-6 py-3 text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Template</th>
                                <th className="px-6 py-3 text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Category</th>
                                <th className="px-6 py-3 text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-3 text-[11px] font-semibold text-gray-500 uppercase tracking-wider text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50 bg-white">
                            <PremiumLoading
                                show={loading && templates.length === 0}
                                status="Syncing Templates"
                                description="Connecting to Meta and fetching your message assets..."
                            />
                            {loading && templates.length === 0 ? null : (
                                templates.length === 0 ? (
                                    <tr><td colSpan={4} className="py-20 text-center text-gray-400 text-sm italic">No templates found.</td></tr>
                                ) : (
                                    templates.map(t => (
                                        <tr key={t.id} className="hover:bg-[#FAFBFC] transition-colors group">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-md bg-gray-50 flex items-center justify-center text-gray-400 group-hover:text-green-500 transition-colors">
                                                        <FileText size={16} />
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <span className="text-sm font-medium text-gray-900">{t.name}</span>
                                                        <span className="text-[11px] text-gray-400 font-mono">{t.language.toUpperCase()}</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <Badge variant="outline" className="text-[10px] bg-gray-50 border-gray-100 text-gray-600 font-medium px-2 py-0.5">{t.category}</Badge>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <div className={cn("w-1.5 h-1.5 rounded-full animate-pulse", t.status === 'APPROVED' ? 'bg-emerald-500' : t.status === 'PENDING' ? 'bg-amber-500' : 'bg-rose-500')} />
                                                    <span className={cn("text-xs font-medium", t.status === 'APPROVED' ? 'text-emerald-600' : t.status === 'PENDING' ? 'text-amber-600' : 'text-rose-600')}>{t.status}</span>
                                                </div>
                                            </td>

                                            <td className="px-6 py-4 text-right">
                                                <div className="flex items-center justify-end gap-1">
                                                    {t.status !== 'APPROVED' && (
                                                        <button
                                                            onClick={async () => {
                                                                const tid = toast.loading('Submitting to Meta...');
                                                                try {
                                                                    await (templateApi as any).submitToMeta(t.id);
                                                                    toast.success('Submitted', { id: tid });
                                                                    fetchTemplates();
                                                                } catch (e: any) {
                                                                    toast.error(e.response?.data?.message || 'Submission failed', { id: tid });
                                                                }
                                                            }}
                                                            className="p-2 text-amber-500 hover:text-amber-600 transition-all rounded-md hover:bg-amber-50"
                                                            title="Submit to Meta"
                                                        >
                                                            <RefreshCw size={16} />
                                                        </button>
                                                    )}
                                                    <button className="p-2 text-gray-400 hover:text-gray-900 transition-all rounded-md hover:bg-gray-50"><Eye size={16} /></button>
                                                    <button
                                                        onClick={() => handleDeleteTemplate(t.id, t.status)}
                                                        className="p-2 text-gray-400 hover:text-rose-500 transition-all rounded-md hover:bg-rose-50"
                                                        title="Delete Template"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>

            {/* Builder Modal - Fully Refined */}
            <AnimatePresence>
                {isCreating && (
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-10 bg-[#0F172AC0] backdrop-blur-[4px]"
                    >
                        <motion.div
                            initial={{ scale: 0.98, opacity: 0, y: 10 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.98, opacity: 0, y: 10 }}
                            className="bg-white w-full max-w-[1100px] h-[90vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-white/20"
                        >
                            {/* Modal Header */}
                            <header className="px-8 py-4 border-b border-gray-100 flex items-center justify-between shrink-0">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 bg-gray-900 text-white rounded-xl flex items-center justify-center shadow-lg"><Layout size={20} /></div>
                                    <div>
                                        <h2 className="text-base font-semibold text-gray-900 leading-none">Template Builder</h2>
                                        <div className="flex gap-1 mt-1.5">
                                            {[1, 2].map(i => (
                                                <div key={i} className={cn("h-1 w-8 rounded-full transition-all duration-300", i <= step ? "bg-[#25D366]" : "bg-gray-100")} />
                                            ))}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <button
                                        onClick={() => {
                                            if (confirm('Clear all fields?')) setTemplateData({ name: '', category: 'MARKETING', language: 'en_US', layout: 'STANDARD', headerType: 'NONE', headerText: '', headerMediaUrl: '', bodyText: '', footerText: '', buttons: [], cards: [{ headerType: 'IMAGE', headerUrl: '', bodyText: '', buttons: [] }] });
                                        }}
                                        className="text-[12px] font-medium text-gray-400 hover:text-gray-900 flex items-center gap-1.5 transition-colors"
                                    >
                                        <RotateCcw size={14} /> Reset
                                    </button>
                                    <div className="w-px h-8 bg-gray-100 mx-1" />
                                    <button onClick={() => setIsCreating(false)} className="p-2 hover:bg-gray-100 rounded-lg text-gray-400 group"><X size={20} className="group-hover:rotate-90 transition-transform duration-300" /></button>
                                </div>
                            </header>

                            <div className="flex-1 flex overflow-hidden">
                                {/* Editor Column */}
                                <div className="flex-1 overflow-y-auto p-10 scrollbar-hide bg-[#FFFFFF]">
                                    {step === 1 ? (
                                        <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="space-y-8 max-w-[600px]">
                                            <div className="space-y-1">
                                                <h3 className="text-lg font-semibold text-gray-900">General Configuration</h3>
                                                <p className="text-sm text-gray-500">Choose how your customers see your message.</p>
                                            </div>

                                            {/* Segmented Toggle */}
                                            <div className="inline-flex p-1 bg-gray-50 border border-gray-100 rounded-xl w-full">
                                                <button
                                                    onClick={() => setTemplateData({ ...templateData, layout: 'STANDARD' })}
                                                    className={cn("flex-1 py-2 text-[13px] font-semibold rounded-lg transition-all", templateData.layout === 'STANDARD' ? "bg-white text-gray-900 shadow-sm border border-gray-100" : "text-gray-400 hover:text-gray-600")}
                                                >
                                                    Single Message
                                                </button>
                                                <button
                                                    onClick={() => setTemplateData({ ...templateData, layout: 'CAROUSEL' })}
                                                    className={cn("flex-1 py-2 text-[13px] font-semibold rounded-lg transition-all", templateData.layout === 'CAROUSEL' ? "bg-white text-gray-900 shadow-sm border border-gray-100" : "text-gray-400 hover:text-gray-600")}
                                                >
                                                    Carousel Card
                                                </button>
                                            </div>

                                            <div className="grid grid-cols-1 gap-6">
                                                <div className="space-y-2">
                                                    <label className="text-[13px] font-semibold text-gray-700">Internal Template Name</label>
                                                    <Input className="h-10 text-sm focus:ring-green-500/20" placeholder="e.g. order_confirmation_new" value={templateData.name} onChange={(e) => setTemplateData({ ...templateData, name: e.target.value })} />
                                                </div>
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div className="space-y-2">
                                                        <label className="text-[13px] font-semibold text-gray-700">Language</label>
                                                        <select className="w-full h-10 px-3 bg-white border border-gray-200 rounded-lg text-sm focus:ring-4 focus:ring-green-500/5 transition-all outline-none" value={templateData.language} onChange={(e) => setTemplateData({ ...templateData, language: e.target.value })}>
                                                            {WHATSAPP_LANGUAGES.map(l => <option key={l.code} value={l.code}>{l.name}</option>)}
                                                        </select>
                                                    </div>
                                                    <div className="space-y-2">
                                                        <label className="text-[13px] font-semibold text-gray-700">Category</label>
                                                        <select className="w-full h-10 px-3 bg-white border border-gray-200 rounded-lg text-sm focus:ring-4 focus:ring-green-500/5 transition-all outline-none" value={templateData.category} onChange={(e) => setTemplateData({ ...templateData, category: e.target.value })}>
                                                            <option value="MARKETING">Marketing</option>
                                                            <option value="UTILITY">Utility</option>
                                                            <option value="AUTHENTICATION">Authentication</option>
                                                        </select>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="p-5 bg-green-50/50 border border-green-100 rounded-xl flex gap-4">
                                                <SparklesIcon size={20} className="text-green-600 shrink-0" />
                                                <p className="text-[13px] text-green-800 leading-relaxed"><span className="font-bold">Pro Tip:</span> Using variables like <code className="bg-white/50 px-1">{"{{1}}"}</code> increases engagement by personalizing the content.</p>
                                            </div>

                                            <Button className="w-full h-11 text-sm font-semibold rounded-xl bg-[#25D366] hover:bg-[#20bd5b]" onClick={() => setStep(2)}>
                                                Next: Design Message <ArrowRight size={16} className="ml-2" />
                                            </Button>
                                        </motion.div>
                                    ) : (
                                        <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} className="space-y-10">
                                            {/* Header Content Section */}
                                            <div className="space-y-4">
                                                <div className="flex items-center justify-between">
                                                    <h3 className="text-base font-semibold text-gray-900">Header Content</h3>
                                                    <span className="text-[11px] font-medium px-2 py-0.5 bg-gray-100 text-gray-500 rounded uppercase tracking-wider">Optional</span>
                                                </div>
                                                <div className="grid grid-cols-5 gap-2">
                                                    {['NONE', 'TEXT', 'IMAGE', 'VIDEO', 'DOCUMENT'].map(t => {
                                                        const Icon = t === 'TEXT' ? Type : t === 'IMAGE' ? ImageIcon : t === 'VIDEO' ? Video : t === 'DOCUMENT' ? FileIcon : X;
                                                        return (
                                                            <button
                                                                key={t}
                                                                onClick={() => { setTemplateData({ ...templateData, headerType: t as any, headerMediaUrl: '' }); setShowUrlInput(false); }}
                                                                className={cn(
                                                                    "py-3 border rounded-lg flex flex-col items-center gap-1.5 transition-all",
                                                                    templateData.headerType === t ? "bg-[#25D366]/5 border-[#25D366] text-[#25D366] shadow-sm" : "bg-white border-gray-100 text-gray-400 hover:bg-gray-50"
                                                                )}
                                                            >
                                                                <Icon size={16} />
                                                                <span className="text-[10px] font-semibold">{t}</span>
                                                            </button>
                                                        );
                                                    })}
                                                </div>

                                                {templateData.headerType === 'TEXT' && (
                                                    <Input className="text-sm h-11" placeholder="Enter headline text..." value={templateData.headerText} onChange={(e) => setTemplateData({ ...templateData, headerText: e.target.value })} />
                                                )}

                                                {['IMAGE', 'VIDEO', 'DOCUMENT'].includes(templateData.headerType) && (
                                                    <div className="space-y-3">
                                                        {showUrlInput ? (
                                                            <div className="space-y-2">
                                                                <Input className="text-sm h-11" placeholder="Paste direct media URL..." value={templateData.headerMediaUrl} onChange={(e) => setTemplateData({ ...templateData, headerMediaUrl: e.target.value })} />
                                                                <button onClick={() => setShowUrlInput(false)} className="text-[11px] font-semibold text-green-600 flex items-center gap-1 hover:underline"><Upload size={12} /> Switch to Local Upload</button>
                                                            </div>
                                                        ) : (
                                                            <div
                                                                onClick={() => fileInputRef.current?.click()}
                                                                className="h-28 border-2 border-dashed border-gray-100 rounded-xl flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-green-500 hover:bg-green-50/20 group transition-all"
                                                            >
                                                                <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileUpload} accept={templateData.headerType === 'IMAGE' ? 'image/*' : templateData.headerType === 'VIDEO' ? 'video/*' : '*'} />
                                                                {isUploading ? <Loader2 className="animate-spin text-green-500" size={20} /> : <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 group-hover:text-green-600"><Upload size={16} /></div>}
                                                                <span className="text-[12px] font-medium text-gray-500">Tap to upload {templateData.headerType.toLowerCase()}</span>
                                                                <button onClick={(e) => { e.stopPropagation(); setShowUrlInput(true); }} className="text-[10px] font-semibold text-gray-300 hover:text-gray-900 flex items-center gap-1"><LinkIcon size={10} /> or use Link</button>
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                            </div>

                                            {/* Body / Main Message */}
                                            <div className="space-y-4">
                                                <div className="flex items-center justify-between">
                                                    <h3 className="text-base font-semibold text-gray-900">Message Body</h3>
                                                    <Badge className="bg-red-50 text-red-600 border-red-100 text-[10px] font-bold uppercase tracking-tight">Required</Badge>
                                                </div>
                                                <div className="border border-gray-100 rounded-xl overflow-hidden shadow-sm bg-white">
                                                    <div className="flex items-center gap-1 p-2 bg-[#F8F9FA] border-b border-gray-100">
                                                        {[
                                                            { ic: Bold, pr: '*', su: '*' },
                                                            { ic: Italic, pr: '_', su: '_' },
                                                            { ic: Strikethrough, pr: '~', su: '~' },
                                                            { ic: Code, pr: '`', su: '`' }
                                                        ].map((tool, ti) => (
                                                            <button key={ti} onClick={() => applyFormatting(tool.pr, tool.su)} className="p-2 text-gray-500 hover:text-gray-900 hover:bg-white rounded-md transition-all"><tool.ic size={15} /></button>
                                                        ))}
                                                        <div className="w-px h-6 bg-gray-200 mx-1" />
                                                        <button onClick={addVariable} className="px-3 py-1 text-[11px] font-bold text-blue-600 bg-blue-50 border border-blue-100 rounded hover:bg-blue-100 transition-colors">+ ADD VARIABLE</button>
                                                    </div>
                                                    <textarea
                                                        ref={bodyRef}
                                                        className="w-full h-44 p-5 text-sm outline-none resize-none font-sans leading-relaxed text-gray-800 placeholder:text-gray-300"
                                                        placeholder="Hello {{1}}, Your order #{{2}} has been confirmed!"
                                                        value={templateData.bodyText} onChange={(e) => setTemplateData({ ...templateData, bodyText: e.target.value })}
                                                    />
                                                </div>
                                            </div>

                                            {/* Footer & Buttons */}
                                            <div className="grid grid-cols-1 gap-10">
                                                <div className="space-y-3">
                                                    <label className="text-[13px] font-semibold text-gray-700">Footer Text</label>
                                                    <Input className="text-sm h-11" placeholder="e.g. Reply STOP to opt out" value={templateData.footerText} onChange={(e) => setTemplateData({ ...templateData, footerText: e.target.value })} />
                                                </div>

                                                <div className="space-y-4">
                                                    <div className="flex items-center justify-between">
                                                        <h3 className="text-base font-semibold text-gray-900">Quick Actions</h3>
                                                        <div className="flex gap-2">
                                                            <Button variant="outline" size="sm" className="h-8 text-[11px] font-bold rounded-lg px-3 border-gray-200 hover:bg-gray-50 uppercase tracking-tighter" onClick={() => setTemplateData({ ...templateData, buttons: [...templateData.buttons, { type: 'QUICK_REPLY', text: '' }] })}>+ Reply</Button>
                                                            <Button variant="outline" size="sm" className="h-8 text-[11px] font-bold rounded-lg px-3 border-gray-200 hover:bg-gray-50 uppercase tracking-tighter" onClick={() => setTemplateData({ ...templateData, buttons: [...templateData.buttons, { type: 'URL', text: '', url: '' }] })}>+ Website</Button>
                                                            <Button variant="outline" size="sm" className="h-8 text-[11px] font-bold rounded-lg px-3 border-gray-200 hover:bg-gray-50 uppercase tracking-tighter" onClick={() => setTemplateData({ ...templateData, buttons: [...templateData.buttons, { type: 'PHONE_NUMBER', text: '', phone_number: '' }] })}>+ Call</Button>
                                                        </div>
                                                    </div>

                                                    <div className="space-y-2">
                                                        {templateData.buttons.map((btn, i) => (
                                                            <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} key={i} className="flex gap-3 p-3 bg-gray-50/50 border border-gray-100 rounded-xl items-center group">
                                                                <div className="w-8 h-8 rounded-lg bg-white shadow-sm flex items-center justify-center text-gray-400 group-hover:text-green-500 transition-colors">
                                                                    {btn.type === 'QUICK_REPLY' ? <MessageSquare size={14} /> : btn.type === 'URL' ? <ExternalLink size={14} /> : <Phone size={14} />}
                                                                </div>
                                                                <input className="flex-[0.35] h-9 bg-white border border-gray-100 rounded-lg px-3 text-[13px] outline-none placeholder:text-gray-300" placeholder="Button Label" value={btn.text} onChange={(e) => { const n = [...templateData.buttons]; n[i].text = e.target.value; setTemplateData({ ...templateData, buttons: n }); }} />
                                                                {btn.type !== 'QUICK_REPLY' && (
                                                                    <input className="flex-[0.6] h-9 bg-white border border-gray-100 rounded-lg px-3 text-[13px] outline-none placeholder:text-gray-300" placeholder={btn.type === 'URL' ? "https://..." : "+123..."} value={btn.type === 'URL' ? btn.url : btn.phone_number} onChange={(e) => { const n = [...templateData.buttons]; btn.type === 'URL' ? n[i].url = e.target.value : n[i].phone_number = e.target.value; setTemplateData({ ...templateData, buttons: n }); }} />
                                                                )}
                                                                <button onClick={() => setTemplateData({ ...templateData, buttons: templateData.buttons.filter((_, idx) => idx !== i) })} className="p-2 text-gray-300 hover:text-rose-500 transition-colors opacity-0 group-hover:opacity-100"><Trash2 size={14} /></button>
                                                            </motion.div>
                                                        ))}
                                                    </div>
                                                </div>

                                                {/* Variable Labels Section */}
                                                {(templateData.bodyText.match(/\{\{\d+\}\}/g) || []).length > 0 && (
                                                    <div className="space-y-4 p-6 bg-blue-50/30 border border-blue-100/50 rounded-2xl">
                                                        <div className="flex items-center gap-2">
                                                            <div className="p-1.5 bg-blue-100 text-blue-600 rounded-lg">
                                                                <Type size={14} />
                                                            </div>
                                                            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-tight">Describe Your Variables</h3>
                                                        </div>
                                                        <p className="text-[11px] text-gray-500 font-medium">Give each variable a name so you know what to fill in later (e.g. "Customer Name").</p>
                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                            {[...new Set(templateData.bodyText.match(/\{\{\d+\}\}/g) || [])].sort((a, b) => {
                                                                const numA = parseInt((a as string).replace(/\{\{|\}\}/g, ''));
                                                                const numB = parseInt((b as string).replace(/\{\{|\}\}/g, ''));
                                                                return numA - numB;
                                                            }).map((v) => {
                                                                const num = (v as string).replace(/\{\{|\}\}/g, '');
                                                                return (
                                                                    <div key={v as string} className="space-y-1.5">
                                                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Variable {num}</label>
                                                                        <Input
                                                                            className="h-9 text-xs focus:ring-blue-500/20 bg-white"
                                                                            placeholder={`e.g. ${num === '1' ? 'First Name' : 'Order ID'}`}
                                                                            value={templateData.variableLabels?.[num] || ''}
                                                                            onChange={(e) => setTemplateData({
                                                                                ...templateData,
                                                                                variableLabels: {
                                                                                    ...templateData.variableLabels,
                                                                                    [num]: e.target.value
                                                                                }
                                                                            })}
                                                                        />
                                                                    </div>
                                                                );
                                                            })}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>

                                            <Button className="w-full h-14 bg-gray-900 border-b-4 border-black hover:bg-black transition-all font-bold uppercase tracking-widest rounded-2xl text-white mt-10 active:translate-y-1 active:border-b-0" onClick={handleCreateTemplate}>
                                                Submit for Meta Review
                                            </Button>
                                        </motion.div>
                                    )}
                                </div>

                                {/* Preview Column - Slim Premium Mockup */}
                                <div className="w-[440px] bg-slate-50/50 border-l border-gray-100 hidden lg:flex flex-col relative overflow-hidden">
                                    <div className="absolute top-8 left-1/2 -translate-x-1/2 flex items-center gap-2 text-[11px] font-bold uppercase text-gray-400 tracking-[0.2em] whitespace-nowrap">
                                        <Smartphone size={14} className="text-gray-300" />
                                        WhatsApp Live Preview
                                    </div>

                                    <div className="flex-1 flex items-start justify-center p-8 pt-20">
                                        {/* Slimmer Phone Mockup */}
                                        <div className="relative w-[300px] h-[600px] bg-gray-900 rounded-[3rem] p-[10px] shadow-xl ring-1 ring-gray-900/5 ring-inset overflow-hidden flex flex-col scale-[0.95] origin-center">
                                            {/* Top Pill Notch */}
                                            <div className="absolute top-4 left-1/2 -translate-x-1/2 h-5 w-24 bg-gray-900 rounded-full z-20 flex items-center justify-center">
                                                <div className="h-1.5 w-1.5 rounded-full bg-[#1c1c1c] mr-2 shadow-inner" />
                                            </div>

                                            <div className="w-full h-full bg-[#E5DDD5] rounded-[2.2rem] overflow-hidden flex flex-col relative border border-black/20">
                                                {/* Background Wallpaper */}
                                                <div className="absolute inset-0 opacity-[0.06] pointer-events-none" style={{ backgroundImage: "url('https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png')" }} />

                                                <header className="h-14 bg-[#075e54] px-4 py-2 flex items-center gap-2 relative z-10 shrink-0">
                                                    <div className="w-8 h-8 rounded-full bg-white/20 shrink-0" />
                                                    <div className="flex-1 min-w-0 pr-2">
                                                        <div className="h-2.5 w-20 bg-white/20 rounded-md" />
                                                        <div className="h-1.5 w-12 bg-white/10 rounded-md mt-1" />
                                                    </div>
                                                </header>

                                                <div className="flex-1 p-3 overflow-y-auto scrollbar-hide relative flex flex-col gap-2">
                                                    {/* Chat Bubble */}
                                                    <motion.div layout
                                                        className="bg-white rounded-[10px] rounded-tl-none shadow-sm p-2.5 max-w-[88%] space-y-2 relative border-[0.5px] border-black/[0.03]"
                                                    >
                                                        {/* Preview Triangle Notch */}
                                                        <div className="absolute top-0 -left-2 w-0 h-0 border-t-[8px] border-t-white border-l-[8px] border-l-transparent" />

                                                        {/* Header Preview */}
                                                        {templateData.headerType !== 'NONE' && (
                                                            <div className="rounded-lg overflow-hidden bg-gray-50 border border-gray-100/50">
                                                                {templateData.headerType === 'TEXT' ? (
                                                                    <div className="p-2 py-1.5 border-b border-gray-100 bg-gray-50/50">
                                                                        <span className="text-[14px] font-bold text-gray-900 leading-tight block">{templateData.headerText || 'Your Headline'}</span>
                                                                    </div>
                                                                ) : (
                                                                    <div className="aspect-[16/9] flex items-center justify-center bg-gray-100 relative overflow-hidden">
                                                                        {templateData.headerMediaUrl ? (
                                                                            templateData.headerType === 'IMAGE' ? (
                                                                                <img src={templateData.headerMediaUrl} key={templateData.headerMediaUrl} className="w-full h-full object-cover" alt="H" onError={(e) => { (e.target as any).src = 'https://placehold.co/600x400?text=Error'; }} />
                                                                            ) : <video src={templateData.headerMediaUrl} className="w-full h-full object-cover" controls />
                                                                        ) : <div className="text-gray-300 flex flex-col items-center gap-1"><ImageIcon size={20} /><span className="text-[9px] font-bold">{templateData.headerType}</span></div>}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        )}

                                                        <p className="text-[13.5px] leading-[1.4] text-[#1c1d1e] break-words whitespace-pre-wrap font-sans" dangerouslySetInnerHTML={{ __html: renderFormattedText(templateData.bodyText) || '<span class="text-gray-300 italic">Body content...</span>' }} />
                                                        {templateData.footerText && <p className="text-[11px] text-[#8696a0] leading-none mt-1 py-1 border-t border-gray-50 italic">{templateData.footerText}</p>}
                                                        <div className="flex justify-end pt-0.5 gap-1 items-end">
                                                            <span className="text-[9px] font-medium text-[#8696a0] uppercase tracking-tighter">10:45 AM</span>
                                                            <div className="flex text-[#34b7f1] -mb-0.5"><Check size={10} className="stroke-[3px]" /><Check size={10} className="-ml-1 stroke-[3px]" /></div>
                                                        </div>

                                                        {/* Buttons Rendering in Preview */}
                                                        {templateData.buttons.length > 0 && (
                                                            <div className="border-t border-gray-100/80 -mx-2.5 -mb-2.5 mt-2 divide-y divide-gray-100/80 rounded-b-[10px] overflow-hidden">
                                                                {templateData.buttons.map((btn, i) => (
                                                                    <div key={i} className="flex items-center justify-center gap-1.5 py-2.5 text-[#00a884] font-semibold text-[13px] bg-white cursor-default transition-colors active:bg-gray-50">
                                                                        {btn.type === 'URL' ? <ExternalLink size={12} /> : btn.type === 'PHONE_NUMBER' ? <Phone size={12} /> : <MessageSquare size={12} />}
                                                                        {btn.text || `Button ${i + 1}`}
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        )}
                                                    </motion.div>
                                                </div>

                                                <footer className="h-12 bg-white border-t border-black/[0.03] px-3 flex items-center gap-2 shrink-0">
                                                    <div className="flex-1 h-8 bg-gray-100 rounded-full px-4 flex items-center text-gray-300 text-[11px] font-medium">Type a message...</div>
                                                    <div className="w-8 h-8 bg-[#00a884] rounded-full flex items-center justify-center text-white shadow-sm"><RefreshCw size={14} /></div>
                                                </footer>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Footer Helpers */}
                                    <div className="absolute bottom-8 left-0 right-0 px-8 flex justify-center gap-6">
                                        {[
                                            { lab: 'Valid', ico: CheckCircle2, col: 'text-emerald-500' },
                                            { lab: 'SaaS', ico: Layers, col: 'text-blue-500' },
                                            { lab: 'Live', ico: RefreshCw, col: 'text-amber-500', rot: true }
                                        ].map((h, hi) => (
                                            <div key={hi} className="flex flex-col items-center gap-1.5">
                                                <div className="w-10 h-10 rounded-xl bg-white shadow-sm border border-gray-100 flex items-center justify-center">
                                                    <motion.div animate={h.rot ? { rotate: 360 } : {}} transition={h.rot ? { repeat: Infinity, duration: 4, ease: "linear" } : {}}>
                                                        <h.ico size={16} className={h.col} />
                                                    </motion.div>
                                                </div>
                                                <span className="text-[9px] font-bold text-gray-400 uppercase tracking-tighter">{h.lab}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <AIGenerateTemplateModal
                isOpen={isAIModalOpen}
                onClose={() => setIsAIModalOpen(false)}
                onTemplateGenerated={(data) => {
                    setTemplateData({ ...templateData, name: data.name || '', bodyText: data.body || '', headerText: data.header?.content || '', headerType: data.header?.type === 'TEXT' ? 'TEXT' : 'NONE' });
                    setIsCreating(true);
                    setStep(2);
                }}
            />
        </div>
    );
};

export default Templates;
