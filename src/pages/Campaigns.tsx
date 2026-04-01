import React, { useState, useEffect } from 'react';
import { Card, SectionHeader, Button, Input, Badge, PremiumLoading } from '../components/ui';
import {
    Plus, History, Check, ChevronRight, X, FileText, Send, Users, Zap, Loader2, Tag as TagIcon, RefreshCcw, Instagram, Eye, ChevronDown, Search, Layout, Smartphone
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../components/ui';
import { useAppDispatch, useAppSelector } from '../store';
import { fetchCampaignsAsync, createCampaignAsync, executeCampaignAsync } from '../features/campaignSlice';
import { fetchTemplatesAsync } from '../features/templateSlice';
import { fetchTagsAsync } from '../features/contactSlice';
import { socketClient } from '../lib/socket';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { productApi } from '../lib/api/productApi';
import { flowApi } from '../lib/api/flowApi';
import { Product } from '../types';

const Campaigns: React.FC = () => {
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const { campaigns, loading: campaignsLoading } = useAppSelector(state => state.campaigns);
    const { templates, loading: templatesLoading } = useAppSelector(state => state.templates);
    const { tags } = useAppSelector(state => state.contacts);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [step, setStep] = useState(1);
    const [isCreating, setIsCreating] = useState(false);
    const [campaignData, setCampaignData] = useState<{
        name: string;
        channel: 'WHATSAPP' | 'INSTAGRAM' | 'FACEBOOK' | 'TELEGRAM';
        templateId: string;
        tagId: string;
        serviceInterest: string;
        templateParams: string[];
        triggerKeywords: string;
        productIds: string[];
    }>({
        name: '',
        channel: 'WHATSAPP',
        templateId: '',
        tagId: '',
        serviceInterest: '',
        templateParams: [],
        triggerKeywords: '',
        productIds: []
    });
    
    const [products, setProducts] = useState<Product[]>([]);
    const [flows, setFlows] = useState<any[]>([]);
    const [productSearch, setProductSearch] = useState('');
    const [isKeywordVerified, setIsKeywordVerified] = useState<boolean | null>(null);
    const [isVerifyingKeyword, setIsVerifyingKeyword] = useState(false);

    useEffect(() => {
        dispatch(fetchCampaignsAsync());
        dispatch(fetchTemplatesAsync());
        dispatch(fetchTagsAsync());
        
        // Fetch products and flows for the wizard
        productApi.getAll().then(res => {
            const data = res.data;
            if (data.success && Array.isArray(data.data)) setProducts(data.data);
            else if (Array.isArray(data)) setProducts(data);
        }).catch(console.error);

        flowApi.getAll().then(res => {
            const data = res.data;
            if (data.success && Array.isArray(data.data)) setFlows(data.data);
            else if (Array.isArray(data)) setFlows(data);
        }).catch(console.error);

        // Step 3 & 4: Stable Listener with Logging
        const socket = socketClient.socket;

        const handleUpdate = (data: any) => {
            console.log('[Campaigns] Live update received:', data);
            dispatch(fetchCampaignsAsync());
        };

        if (socket) {
            console.log('[Campaigns] Attaching socket listener. Status:', socket.connected ? 'Connected' : 'Disconnected');
            socket.on('campaign:updated', handleUpdate);
        }

        return () => {
            if (socket) {
                console.log('[Campaigns] Detaching socket listener');
                socket.off('campaign:updated', handleUpdate);
            }
        };
    }, [dispatch, socketClient.socket]); // Re-attach if socket instance changes

    const handleRefresh = () => {
        const toastId = toast.loading('Refreshing campaigns...');
        dispatch(fetchCampaignsAsync())
            .unwrap()
            .then(() => toast.success('Campaigns updated', { id: toastId }))
            .catch(() => toast.error('Refresh failed', { id: toastId }));
    };

    const handleCreateCampaign = async () => {
        if (!campaignData.name || !campaignData.tagId) {
            toast.error('Please fill in all required fields');
            return;
        }

        if (campaignData.channel === 'WHATSAPP' && !campaignData.templateId) {
            toast.error('Template is required for WhatsApp campaigns');
            return;
        }

        setIsCreating(true);
        const toastId = toast.loading('Initializing campaign...');
        try {
            const payload = {
                name: campaignData.name,
                channel: campaignData.channel,
                templateId: campaignData.channel === 'WHATSAPP' ? campaignData.templateId : undefined,
                serviceInterest: campaignData.serviceInterest || undefined,
                audience: {
                    tagIds: [campaignData.tagId]
                },
                templateParams: campaignData.templateParams,
                triggerKeywords: campaignData.triggerKeywords,
                productIds: campaignData.productIds
            };

            // 1. Create the campaign
            const createResult = await dispatch(createCampaignAsync(payload)).unwrap();

            // 2. Execute immediately for "Blast Now"
            toast.loading('Blasting to recipients...', { id: toastId });
            await dispatch(executeCampaignAsync(createResult.id)).unwrap();

            toast.success('Campaign launched successfully!', { id: toastId });
            setIsModalOpen(false);
            setStep(1);
            setCampaignData({ name: '', channel: 'WHATSAPP', templateId: '', tagId: '', serviceInterest: '', templateParams: [], triggerKeywords: '', productIds: [] });
            dispatch(fetchCampaignsAsync());
        } catch (error: any) {
            toast.error(error || 'Failed to launch campaign', { id: toastId });
        } finally {
            setIsCreating(false);
        }
    };

    const approvedTemplates = templates.filter(t => t.status === 'APPROVED');
    const selectedTemplate = templates.find(t => t.id === campaignData.templateId);
    const selectedTag = tags.find(t => t.id === campaignData.tagId);

    const getTemplateBodyText = (template: any) => {
        if (!template) return '';
        const components = template.components || template.content;
        if (Array.isArray(components)) {
            const body = components.find((c: any) => c.type === 'BODY');
            return body?.text || '';
        }
        return components?.body?.text || '';
    };

    const renderTemplateWithPlaceholders = (text: string, params: string[]) => {
        if (!text) return null;

        // Split by variable placeholders like {{1}}, {{2}}, etc.
        const parts = text.split(/(\{\{\d+\}\})/g);

        return parts.map((part, index) => {
            const match = part.match(/\{\{(\d+)\}\}/);
            if (match) {
                const varNum = parseInt(match[1]);
                const value = params[varNum - 1];
                return (
                    <span
                        key={index}
                        className={cn(
                            "px-1.5 py-0.5 rounded font-bold transition-all mx-0.5",
                            value ? "bg-[#25D366] text-white" : "bg-gray-700 text-gray-400 border border-dashed border-gray-600"
                        )}
                    >
                        {value || `{{${varNum}}}`}
                    </span>
                );
            }
            return <span key={index}>{part}</span>;
        });
    };

    const getVariableLabel = (template: any, index: number, text: string) => {
        const varNum = (index + 1).toString();

        // 1. Check for custom label from Template Builder
        const customLabels = template?.content?.variableLabels || template?.components?.variableLabels || template?.variableLabels;
        if (customLabels && customLabels[varNum]) {
            return customLabels[varNum];
        }

        // 2. Automatic Context Hint
        if (text) {
            const placeholder = `{{${varNum}}}`;
            const pos = text.indexOf(placeholder);
            if (pos !== -1) {
                const before = text.substring(Math.max(0, pos - 15), pos).trim();
                const after = text.substring(pos + placeholder.length, Math.min(text.length, pos + placeholder.length + 15)).trim();

                let hint = '';
                if (before) hint += `${before.slice(-10)}`;
                hint += ` {{${varNum}}} `;
                if (after) hint += `${after.slice(0, 10)}`;

                return hint.trim() || `Variable ${varNum}`;
            }
        }

        return `Variable ${varNum}`;
    };

    return (
        <div className="p-8 space-y-8 bg-[#f9fafb]">
            <SectionHeader
                title="Campaign Manager"
                subtitle="Run mass WhatsApp broadcasts to your contact segments"
                action={
                    <div className="flex gap-3">
                        <Button variant="ghost" onClick={handleRefresh} className="rounded-2xl border border-gray-100 bg-white shadow-sm">
                            <RefreshCcw size={18} className={campaignsLoading ? 'animate-spin' : ''} />
                        </Button>
                        <Button onClick={() => { setIsModalOpen(true); setStep(1); }} className="rounded-2xl">
                            <Plus size={18} /> New Campaign
                        </Button>
                    </div>
                }
            />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="p-6 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-110 transition-transform">
                        <Send size={80} className="text-gray-900" />
                    </div>
                    <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Total Broadcasts</h4>
                    <div className="text-3xl font-black text-gray-900">{campaigns.length}</div>
                    <div className="flex items-center gap-1.5 mt-2">
                        <span className="text-xs font-black text-[#25D366] bg-green-50 px-2 py-0.5 rounded-lg">Active system</span>
                    </div>
                </Card>

                <Card className="p-6 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-110 transition-transform">
                        <Check size={80} className="text-gray-900" />
                    </div>
                    <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Total Delivered</h4>
                    <div className="text-3xl font-black text-gray-900">
                        {campaigns.reduce((acc, curr) => acc + (curr.totalDelivered || 0), 0)}
                    </div>
                    <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden mt-4">
                        <div className="bg-[#25D366] h-full" style={{ width: '100%' }} />
                    </div>
                </Card>

                <Card className="p-6 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-110 transition-transform">
                        <Zap size={80} className="text-gray-900" />
                    </div>
                    <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Total Read</h4>
                    <div className="text-3xl font-black text-gray-900">
                        {campaigns.reduce((acc, curr) => acc + (curr.totalRead || 0), 0)}
                    </div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase mt-3">Read Rate: {
                        campaigns.length > 0
                            ? ((campaigns.reduce((acc, curr) => acc + (curr.totalRead || 0), 0) / (campaigns.reduce((acc, curr) => acc + curr.totalSent, 0) || 1)) * 100).toFixed(1)
                            : 0
                    }%</p>
                </Card>
            </div>

            <Card className="border-none shadow-xl shadow-gray-200/50">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-gray-50">
                                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Campaign</th>
                                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Status</th>
                                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Engagement</th>
                                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Date Launched</th>
                                <th className="px-8 py-5"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {campaignsLoading && campaigns.length === 0 ? (
                                <tr>
                                    <td colSpan={5}>
                                        <PremiumLoading
                                            show={true}
                                            status="Loading Campaigns"
                                            description="Analyzing your recent broadcasts and harvesting engagement data..."
                                        />
                                    </td>
                                </tr>
                            ) : (
                                campaigns.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="py-20 text-center text-gray-400 font-bold">No campaigns found in database</td>
                                    </tr>
                                ) : (
                                    campaigns.map(camp => (
                                        <tr
                                            key={camp.id}
                                            onClick={() => navigate(`/campaigns/${camp.id}`)}
                                            className="group hover:bg-gray-50/50 transition-colors cursor-pointer"
                                        >
                                            <td className="px-8 py-5">
                                                <div className="flex items-center gap-3">
                                                    <div className={cn(
                                                        "w-10 h-10 rounded-xl flex items-center justify-center transition-all",
                                                        (camp as any).channel === 'INSTAGRAM'
                                                            ? "bg-pink-50 text-pink-600 group-hover:bg-pink-600 group-hover:text-white"
                                                            : "bg-green-50 text-green-600 group-hover:bg-[#25D366] group-hover:text-white"
                                                    )}>
                                                        {(camp as any).channel === 'INSTAGRAM' ? <Instagram size={18} /> : <Send size={18} />}
                                                    </div>
                                                    <span className="font-bold text-gray-900">{camp.name}</span>
                                                </div>
                                            </td>
                                            <td className="px-8 py-5">
                                                <Badge variant={camp.status === 'COMPLETED' ? 'success' : camp.status === 'RUNNING' ? 'warning' : 'neutral'}>
                                                    {camp.status}
                                                </Badge>
                                            </td>
                                            <td className="px-8 py-5">
                                                <div className="flex gap-4">
                                                    <div className="flex flex-col">
                                                        <span className="text-[9px] font-black text-gray-400 uppercase">Sent</span>
                                                        <span className="text-sm font-black text-gray-900">{camp.totalSent}</span>
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <span className="text-[9px] font-black text-blue-400 uppercase">Seen</span>
                                                        <span className="text-sm font-black text-blue-600">{camp.totalDelivered || 0}</span>
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <span className="text-[9px] font-black text-[#25D366] uppercase">Read</span>
                                                        <span className="text-sm font-black text-[#25D366] font-black">{camp.totalRead || 0}</span>
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <span className="text-[9px] font-black text-red-400 uppercase">Error</span>
                                                        <span className="text-sm font-black text-red-600">{camp.totalFailed}</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-5">
                                                <span className="text-xs font-bold text-gray-500">
                                                    {format(new Date(camp.createdAt), 'MMM d, yyyy HH:mm')}
                                                </span>
                                            </td>
                                            <td className="px-8 py-5 text-right">
                                                <Button variant="ghost" size="sm" className="p-2 opacity-0 group-hover:opacity-100"><ChevronRight size={18} /></Button>
                                            </td>
                                        </tr>
                                    ))
                                )
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>

            {/* Campaign Wizard */}
            <AnimatePresence>
                {isModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm"
                            onClick={() => !isCreating && setIsModalOpen(false)}
                        />
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            className="relative w-full max-w-2xl bg-white rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
                        >
                            <div className="p-8 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                                <div>
                                    <h3 className="text-xl font-black text-gray-900">Create New Campaign</h3>
                                    <div className="flex gap-1.5 mt-2">
                                        {[1, 2, 3, 4, 5, 6].map(i => (
                                            <div key={i} className={`h-1.5 w-10 rounded-full transition-all duration-500 ${i <= step ? 'bg-[#25D366]' : 'bg-gray-200'}`} />
                                        ))}
                                    </div>
                                    <p className="text-[10px] font-black text-gray-400 mt-2 uppercase tracking-widest">Step {step} of 6</p>
                                </div>
                                <button onClick={() => setIsModalOpen(false)} disabled={isCreating} className="p-3 hover:bg-white rounded-2xl text-gray-400 hover:text-gray-900 transition-all shadow-sm ring-1 ring-gray-100"><X size={20} /></button>
                            </div>

                            <div className="p-10 min-h-[400px] overflow-y-auto scrollbar-hide flex-1">
                                {step === 1 && (
                                    <motion.div
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        className="space-y-8"
                                    >
                                        <div className="space-y-6">
                                            <h4 className="text-lg font-black text-gray-900">Campaign Details</h4>
                                            
                                            <Input
                                                label="Campaign Name"
                                                placeholder="e.g. Q1 Project Launch"
                                                value={campaignData.name}
                                                onChange={(e) => setCampaignData({ ...campaignData, name: e.target.value })}
                                            />

                                            <div className="space-y-4">
                                                <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Select Target Audience</label>
                                                <div className="relative group">
                                                    <select 
                                                        className="w-full h-14 px-6 bg-gray-50 border-2 border-gray-100 rounded-2xl text-sm font-bold text-gray-900 outline-none focus:border-[#25D366] transition-all appearance-none cursor-pointer"
                                                        value={campaignData.tagId}
                                                        onChange={(e) => setCampaignData({ ...campaignData, tagId: e.target.value })}
                                                    >
                                                        <option value="">Select a segment...</option>
                                                        {tags.map(tag => (
                                                            <option key={tag.id} value={tag.id}>{tag.name} ({tag.contactCount || 0} Leads)</option>
                                                        ))}
                                                    </select>
                                                    <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400"><ChevronDown size={18} /></div>
                                                </div>
                                                {tags.length === 0 && (
                                                    <p className="text-center py-4 text-gray-400 text-xs font-bold">No tags available. Go to Contacts to create one.</p>
                                                )}
                                            </div>
                                        </div>
                                    </motion.div>
                                )}

                                {step === 2 && (
                                    <motion.div
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        className="space-y-8"
                                    >
                                        <div className="space-y-6">
                                            <div>
                                                <h4 className="text-lg font-black text-gray-900">Select Listings</h4>
                                                <p className="text-xs font-bold text-gray-400 mt-1">Attach properties or vehicles to this campaign.</p>
                                            </div>

                                            <div className="relative">
                                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                                <input 
                                                    type="text"
                                                    placeholder="Search products by name or brand..."
                                                    className="w-full h-12 pl-12 pr-6 bg-gray-50 border-2 border-gray-100 rounded-2xl text-sm font-bold outline-none focus:border-[#25D366] transition-all"
                                                    value={productSearch}
                                                    onChange={(e) => setProductSearch(e.target.value)}
                                                />
                                            </div>

                                            <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2 scrollbar-hide border border-gray-100 rounded-3xl p-4 bg-gray-50/30">
                                                {products.filter(p => !p.metaId && ((p.title || '').toLowerCase().includes(productSearch.toLowerCase()) || (p.brand || '').toLowerCase().includes(productSearch.toLowerCase()))).map(p => (
                                                    <label 
                                                        key={p.id}
                                                        className={cn(
                                                            "w-full p-4 border-2 rounded-2xl flex items-center justify-between transition-all cursor-pointer",
                                                            campaignData.productIds.includes(p.id) ? "border-[#25D366] bg-green-50/50 shadow-sm" : "border-gray-50 bg-white hover:border-gray-100"
                                                        )}
                                                    >
                                                        <div className="flex items-center gap-4">
                                                            <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center text-gray-400 shrink-0 overflow-hidden">
                                                                {p.imageUrl ? <img src={p.imageUrl} className="w-full h-full object-cover" /> : <Plus size={18} />}
                                                            </div>
                                                            <div className="text-left min-w-0">
                                                                <p className="font-bold text-gray-900 truncate">{p.title}</p>
                                                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{p.brand} • {p.price}</p>
                                                            </div>
                                                        </div>
                                                        <div className={cn(
                                                            "w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all",
                                                            campaignData.productIds.includes(p.id) ? "bg-[#25D366] border-[#25D366] text-white" : "border-gray-200"
                                                        )}>
                                                            <input 
                                                                type="checkbox" 
                                                                className="hidden"
                                                                checked={campaignData.productIds.includes(p.id)}
                                                                onChange={(e) => {
                                                                    const checked = e.target.checked;
                                                                    setCampaignData(prev => ({
                                                                        ...prev,
                                                                        productIds: checked 
                                                                            ? [...prev.productIds, p.id]
                                                                            : prev.productIds.filter(id => id !== p.id)
                                                                    }));
                                                                }}
                                                            />
                                                            {campaignData.productIds.includes(p.id) && <Check size={14} />}
                                                        </div>
                                                    </label>
                                                ))}
                                                {products.length === 0 && (
                                                    <p className="text-center py-10 text-gray-400 font-bold">No products found in inventory.</p>
                                                )}
                                            </div>
                                        </div>
                                    </motion.div>
                                )}

                                {step === 3 && (
                                    <motion.div
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        className="space-y-8"
                                    >
                                        <div className="space-y-6">
                                            <h4 className="text-lg font-black text-gray-900">Select Channel</h4>
                                            
                                            <div className="grid grid-cols-2 gap-4">
                                                {[
                                                    { id: 'WHATSAPP', name: 'WhatsApp', icon: <Send size={20} />, color: 'text-[#25D366]', bg: 'bg-green-50/50', border: 'border-[#25D366]' },
                                                    { id: 'INSTAGRAM', name: 'Instagram', icon: <Instagram size={20} />, color: 'text-[#E4405F]', bg: 'bg-pink-50/50', border: 'border-pink-500' },
                                                    { id: 'FACEBOOK', name: 'Facebook', icon: <Layout size={20} />, color: 'text-[#1877F2]', bg: 'bg-blue-50/50', border: 'border-blue-500' },
                                                    { id: 'TELEGRAM', name: 'Telegram', icon: <Smartphone size={20} />, color: 'text-[#0088CC]', bg: 'bg-sky-50/50', border: 'border-sky-400' }
                                                ].map(ch => (
                                                    <button
                                                        key={ch.id}
                                                        onClick={() => setCampaignData({ ...campaignData, channel: ch.id as any })}
                                                        className={cn(
                                                            "p-5 border-2 rounded-[2rem] flex flex-col items-center gap-3 transition-all",
                                                            campaignData.channel === ch.id ? `${ch.bg} ${ch.border}` : "border-gray-50 bg-white hover:border-gray-100"
                                                        )}
                                                    >
                                                        <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm", campaignData.channel === ch.id ? "bg-white " + ch.color : "bg-gray-100 text-gray-400")}>
                                                            {ch.icon}
                                                        </div>
                                                        <span className="font-black text-sm text-gray-900">{ch.name}</span>
                                                    </button>
                                                ))}
                                            </div>

                                            {campaignData.channel === 'WHATSAPP' && (
                                                <div className="p-8 bg-gray-900 rounded-[2.5rem] mt-6 space-y-4">
                                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                                        <Zap size={12} className="text-[#25D366]" /> WhatsApp Template Select
                                                    </p>
                                                    <div className="space-y-3 max-h-[250px] overflow-y-auto pr-2 scrollbar-hide">
                                                        {templatesLoading ? (
                                                            <div className="flex flex-col items-center py-10 gap-3">
                                                                <Loader2 className="animate-spin text-[#25D366]" size={24} />
                                                            </div>
                                                        ) : approvedTemplates.length === 0 ? (
                                                            <p className="text-gray-500 text-xs font-bold text-center py-10">No approved templates found</p>
                                                        ) : (
                                                            approvedTemplates.map(t => (
                                                                <button
                                                                    key={t.id}
                                                                    onClick={() => setCampaignData({ ...campaignData, templateId: t.id })}
                                                                    className={`w-full p-4 border-2 rounded-2xl flex items-center justify-between transition-all ${campaignData.templateId === t.id ? 'border-[#25D366] bg-green-500/10' : 'border-gray-800 bg-gray-800/50 hover:bg-gray-800'}`}
                                                                >
                                                                    <div className="flex items-center gap-4">
                                                                        <div className="text-left">
                                                                            <p className="text-[11px] font-black text-white">{t.name}</p>
                                                                            <p className="text-[9px] font-bold text-gray-500 uppercase tracking-widest mt-0.5">{t.category}</p>
                                                                        </div>
                                                                    </div>
                                                                    {campaignData.templateId === t.id && <div className="w-5 h-5 bg-[#25D366] rounded-full flex items-center justify-center text-white"><Check size={12} /></div>}
                                                                </button>
                                                            ))
                                                        )}
                                                    </div>
                                                </div>
                                            )}

                                            {campaignData.channel === 'WHATSAPP' && selectedTemplate && (
                                                <div className="p-8 bg-gray-50 border-2 border-gray-100 rounded-[2.5rem] mt-6 space-y-6">
                                                    <div>
                                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                                            <FileText size={12} className="text-[#25D366]" /> Template Variables
                                                        </p>
                                                        <p className="text-[10px] font-bold text-gray-500 mt-1 uppercase tracking-widest">
                                                            Fill in the placeholders for "{selectedTemplate.name}"
                                                        </p>
                                                    </div>

                                                    <div className="space-y-4">
                                                        {(selectedTemplate.variables || []).length > 0 ? (
                                                            selectedTemplate.variables?.map((variable, idx) => (
                                                                <div key={idx} className="space-y-1.5">
                                                                    <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">Variable {idx + 1} ({variable})</label>
                                                                    <input 
                                                                        type="text"
                                                                        placeholder={`Enter value for ${variable}...`}
                                                                        className="w-full h-12 px-5 bg-white border border-gray-100 rounded-xl text-sm font-bold outline-none focus:border-[#25D366] transition-all"
                                                                        value={campaignData.templateParams[idx] || ''}
                                                                        onChange={(e) => {
                                                                            const newParams = [...campaignData.templateParams];
                                                                            newParams[idx] = e.target.value;
                                                                            setCampaignData({ ...campaignData, templateParams: newParams });
                                                                        }}
                                                                    />
                                                                </div>
                                                            ))
                                                        ) : (
                                                            <div className="py-4 text-center">
                                                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">No variables required for this template</p>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </motion.div>
                                )}

                                {step === 4 && (
                                    <motion.div
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        className="space-y-8"
                                    >
                                        <div className="space-y-6">
                                            <div>
                                                <h4 className="text-lg font-black text-gray-900">Define Campaign Keyword</h4>
                                                <p className="text-xs font-bold text-gray-400 mt-1">When customers reply with this keyword, the system maps the conversation to this campaign.</p>
                                            </div>

                                            <div className="space-y-4">
                                                <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Keyword Trigger</label>
                                                <div className="flex gap-3">
                                                    <div className="flex-1">
                                                        <input 
                                                            type="text"
                                                            placeholder="e.g. VIEW, TESTDRIVE, INVEST"
                                                            className={cn(
                                                                "w-full h-14 px-6 bg-gray-50 border-2 rounded-2xl text-sm font-bold outline-none uppercase transition-all",
                                                                isKeywordVerified === true ? "border-green-500 bg-green-50/30" : 
                                                                isKeywordVerified === false ? "border-red-500 bg-red-50/30" : "border-gray-100 focus:border-[#25D366]"
                                                            )}
                                                            value={campaignData.triggerKeywords}
                                                            onChange={(e) => {
                                                                setIsKeywordVerified(null);
                                                                setCampaignData({ ...campaignData, triggerKeywords: e.target.value.toUpperCase() });
                                                            }}
                                                        />
                                                    </div>
                                                    <Button 
                                                        variant="secondary"
                                                        className="h-14 px-8 rounded-2xl"
                                                        onClick={() => {
                                                            if (!campaignData.triggerKeywords) return;
                                                            setIsVerifyingKeyword(true);
                                                            
                                                            // Logic: Check against existing keywords in flows and campaigns
                                                            const keyword = campaignData.triggerKeywords.trim().toUpperCase();
                                                            const existingInCampaigns = campaigns.some(c => c.triggerKeywords?.toUpperCase().split(',').map(k => k.trim()).includes(keyword));
                                                            const existingInFlows = flows.some(f => f.trigger?.toUpperCase().split(',').map(k => k.trim()).includes(keyword));
                                                            
                                                            setTimeout(() => {
                                                                if (existingInCampaigns || existingInFlows) {
                                                                    toast.error(`"${keyword}" is already in use by another flow or campaign.`);
                                                                    setIsKeywordVerified(false);
                                                                } else {
                                                                    toast.success(`"${keyword}" is available!`);
                                                                    setIsKeywordVerified(true);
                                                                }
                                                                setIsVerifyingKeyword(false);
                                                            }, 800);
                                                        }}
                                                        disabled={isVerifyingKeyword || !campaignData.triggerKeywords}
                                                    >
                                                        {isVerifyingKeyword ? <Loader2 className="animate-spin" size={18} /> : 'Verify'}
                                                    </Button>
                                                </div>
                                                <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest pl-1">
                                                    {isKeywordVerified === true ? "✓ keyword verified and available" : 
                                                     isKeywordVerified === false ? "✗ keyword collision detected" : "Keywords are automatically converted to uppercase."}
                                                </p>
                                            </div>

                                            <Input
                                                label="Default Service Interest (RAG Priority)"
                                                placeholder="e.g. Vaan Megam Plots or Toyota Camry Test Drive"
                                                value={campaignData.serviceInterest}
                                                onChange={(e) => setCampaignData({ ...campaignData, serviceInterest: e.target.value })}
                                                description="This helps the AI instantly know what the user is inquiring about."
                                            />
                                        </div>
                                    </motion.div>
                                )}

                                {step === 5 && (
                                    <motion.div
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        className="space-y-8"
                                    >
                                        <div className="space-y-6">
                                            <div>
                                                <h4 className="text-lg font-black text-gray-900">Generate Campaign Tracking Link</h4>
                                                <p className="text-sm font-bold text-gray-400 mt-2 leading-relaxed">
                                                    Use this deep link in your ads or social media bio. Conversations started from this link will be attributed to this campaign.
                                                </p>
                                            </div>

                                            <div className="bg-gray-50 border-2 border-gray-100 rounded-[2rem] p-6 flex flex-col gap-4">
                                                <div className="flex items-center gap-3 bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
                                                    <input 
                                                        readOnly
                                                        className="flex-1 bg-transparent border-none text-sm font-bold text-gray-600 outline-none"
                                                        value={`https://agently.ai/chat?campaign=${campaignData.name.toLowerCase().replace(/\s+/g, '-') || 'campaign-id'}`}
                                                    />
                                                    <Button 
                                                        variant="ghost" 
                                                        className="h-10 rounded-xl gap-2 font-black border border-gray-100 hover:bg-gray-50"
                                                        onClick={() => {
                                                            navigator.clipboard.writeText(`https://agently.ai/chat?campaign=${campaignData.name.toLowerCase().replace(/\s+/g, '-') || 'campaign-id'}`);
                                                            toast.success('Link copied to clipboard');
                                                        }}
                                                    >
                                                        <FileText size={16} /> Copy
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}

                                {step === 6 && (
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        className="space-y-8"
                                    >
                                        <div className="space-y-6">
                                            <h4 className="text-lg font-black text-gray-900">Review & Publish</h4>
                                            
                                            <div className="bg-gray-50 border-2 border-gray-100 rounded-[2.5rem] p-8 space-y-4">
                                                <div className="grid grid-cols-2 gap-y-4 text-sm font-bold">
                                                    <span className="text-gray-400">Campaign Name:</span>
                                                    <span className="text-gray-900 text-right">{campaignData.name}</span>
                                                    
                                                    <span className="text-gray-400">Channel:</span>
                                                    <span className="text-gray-900 text-right">{campaignData.channel}</span>
                                                    
                                                    <span className="text-gray-400">Audience:</span>
                                                    <span className="text-gray-900 text-right">{selectedTag?.name || 'All Leads'}</span>
                                                    
                                                    <span className="text-gray-400">Keyword:</span>
                                                    <span className="text-gray-900 text-right">{campaignData.triggerKeywords}</span>
                                                    
                                                    {campaignData.channel === 'WHATSAPP' && (
                                                        <>
                                                            <span className="text-gray-400">WA Template:</span>
                                                            <span className="text-gray-900 text-right truncate pl-4">{selectedTemplate?.name || 'None Selected'}</span>
                                                        </>
                                                    )}
                                                </div>
                                            </div>

                                            <p className="text-sm font-bold text-gray-500 leading-relaxed text-center px-4">
                                                Ready to launch? Your campaign will be marked as <span className="text-gray-900">Active</span> and tracking will begin immediately.
                                            </p>
                                        </div>
                                    </motion.div>
                                )}
                            </div>

                            <div className="p-8 bg-gray-50/50 border-t border-gray-100 flex justify-between items-center">
                                <Button
                                    variant="ghost"
                                    onClick={() => step > 1 ? setStep(step - 1) : setIsModalOpen(false)}
                                    disabled={isCreating}
                                >
                                    {step > 1 ? 'Back' : 'Cancel'}
                                </Button>

                                <div className="flex gap-4">
                                    {step < 6 ? (
                                        <Button
                                            onClick={() => {
                                                if (step === 1 && (!campaignData.name || !campaignData.tagId)) {
                                                    toast.error('Name and Audience are required');
                                                    return;
                                                }
                                                if (step === 4 && isKeywordVerified !== true) {
                                                    toast.error('Please verify your keyword first');
                                                    return;
                                                }
                                                setStep(step + 1);
                                            }}
                                            className="rounded-2xl px-10 gap-2"
                                        >
                                            Next Step <ChevronRight size={18} />
                                        </Button>
                                    ) : (
                                        <Button
                                            onClick={handleCreateCampaign}
                                            disabled={isCreating}
                                            className="rounded-2xl px-10 gap-2 bg-[#25D366] hover:bg-[#1ebe5d] text-white shadow-xl shadow-green-200"
                                        >
                                            {isCreating ? <Loader2 className="animate-spin" size={18} /> : <Zap size={18} />}
                                            Publish Campaign
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Campaigns;
