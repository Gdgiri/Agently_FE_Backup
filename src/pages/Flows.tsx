import React, { useState } from 'react';
import {
    Plus, GitBranch, Eye, Zap, MoreVertical, Workflow, FileText, Tag,
    PlusCircle, CheckCircle2, MessageCircle, X, Send, Mail
} from 'lucide-react';
import { cn, Card, Button, Badge, SectionHeader, Input } from '../components/ui';
import { MOCK_FLOWS } from '../constants';
import { motion, AnimatePresence } from 'framer-motion';
import AIGenerateRuleModal from '../components/ai/AIGenerateRuleModal';
import { Sparkles as SparklesIcon, Instagram, Smartphone } from 'lucide-react';
import { flowApi } from '../lib/api/flowApi';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const MOCK_RULES = [
    { id: 'r1', trigger: 'Keyword', value: 'PROPERTY', action: 'Add Tag', target: 'Prospect', status: 'Active' },
    { id: 'r2', trigger: 'CTA', value: 'Schedule View', action: 'Add Tag', target: 'High Intent', status: 'Active' },
    { id: 'r3', trigger: 'Keyword', value: 'INVEST', action: 'Add Tag', target: 'Investor', status: 'Active' },
];

const MOCK_TAGS = [
    { id: 't1', name: 'VIP', color: '#25D366' },
    { id: 't2', name: 'Prospect', color: '#3b82f6' },
    { id: 't3', name: 'High Intent', color: '#f59e0b' },
];

const Flows: React.FC = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState<'flows' | 'auto'>('flows');
    const [selectedChannel, setSelectedChannel] = useState<'WHATSAPP' | 'INSTAGRAM' | 'FACEBOOK' | 'TELEGRAM' | 'EMAIL'>('WHATSAPP');
    const [flows, setFlows] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [navigatingId, setNavigatingId] = useState<string | null>(null);
    const [isRuleModalOpen, setIsRuleModalOpen] = useState(false);
    const [isAIRuleModalOpen, setIsAIRuleModalOpen] = useState(false);
    const [newRule, setNewRule] = useState({ trigger: 'Keyword', value: '', action: 'Add Tag', target: '' });

    const handleToggleStatus = async (e: React.MouseEvent, flowId: string, currentStatus: boolean) => {
        e.stopPropagation();
        try {
            await flowApi.toggleEnabled(flowId, !currentStatus);
            toast.success(`Flow ${!currentStatus ? 'activated' : 'deactivated'}`);
            fetchFlows();
        } catch (error) {
            toast.error('Failed to update status');
        }
    };

    const fetchFlows = async () => {
        setIsLoading(true);
        try {
            const res = await flowApi.getAll(selectedChannel);
            setFlows(res.data.data);
        } catch (error) {
            console.error('Fetch flows error:', error);
            toast.error('Failed to fetch flows');
        } finally {
            setIsLoading(false);
        }
    };

    React.useEffect(() => {
        if (activeTab === 'flows') {
            fetchFlows();
        }
    }, [activeTab, selectedChannel]);

    const handleCreateNewFlow = () => {
        navigate(`/flow-builder?channel=${selectedChannel}`);
    };

    const handleAIRuleGenerated = (rule: any) => {
        setNewRule({
            trigger: rule.trigger,
            value: rule.value,
            action: rule.action,
            target: rule.target
        });
        setIsRuleModalOpen(true);
    };

    return (
        <div className="p-8 space-y-8 bg-[#f9fafb] min-h-screen">
            <SectionHeader
                title="Automation Center"
                subtitle="Design and manage your interactive customer journeys"
                action={
                    <Button
                        onClick={handleCreateNewFlow}
                        className={cn(
                            "rounded-2xl shadow-xl",
                            selectedChannel === 'INSTAGRAM' ? "bg-pink-600 hover:bg-pink-700 shadow-pink-100" :
                                selectedChannel === 'FACEBOOK' ? "bg-blue-600 hover:bg-blue-700 shadow-blue-100" :
                                    selectedChannel === 'TELEGRAM' ? "bg-sky-500 hover:bg-sky-600 shadow-sky-100" :
                                        selectedChannel === 'EMAIL' ? "bg-amber-500 hover:bg-amber-600 shadow-amber-100" : "shadow-green-100"
                        )}
                    >
                        <Plus size={18} /> Create New Flow
                    </Button>
                }
            />

            {/* Main Tabs */}
            <div className="flex items-center justify-between">
                <div className="flex gap-1 p-1 bg-gray-100 rounded-2xl w-fit">
                    {[
                        { id: 'flows', label: 'Canvas Flows' },
                        { id: 'auto', label: 'Auto-Tagging Rules' },
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={cn(
                                "px-8 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all whitespace-nowrap",
                                activeTab === tab.id
                                    ? "bg-white text-gray-900 shadow-md shadow-gray-200/50"
                                    : "text-gray-400 hover:text-gray-600"
                            )}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                {activeTab === 'flows' && (
                    <div className="flex gap-1 p-1 bg-[#25D366]/5 rounded-2xl">
                        {[
                            { id: 'WHATSAPP', label: 'WhatsApp', icon: <Smartphone size={14} /> },
                            { id: 'INSTAGRAM', label: 'Instagram', icon: <Instagram size={14} /> },
                            { id: 'FACEBOOK', label: 'Facebook', icon: <MessageCircle size={14} /> },
                            { id: 'TELEGRAM', label: 'Telegram', icon: <Send size={14} /> },
                            { id: 'EMAIL', label: 'Email', icon: <Mail size={14} /> },
                        ].map(channel => (
                            <button
                                key={channel.id}
                                onClick={() => setSelectedChannel(channel.id as any)}
                                className={cn(
                                    "px-6 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all whitespace-nowrap flex items-center gap-2",
                                    selectedChannel === channel.id
                                        ? channel.id === 'INSTAGRAM'
                                            ? "bg-pink-600 text-white shadow-md shadow-pink-200"
                                            : channel.id === 'FACEBOOK'
                                                ? "bg-blue-600 text-white shadow-md shadow-blue-200"
                                                : channel.id === 'TELEGRAM'
                                                    ? "bg-sky-500 text-white shadow-md shadow-sky-200"
                                                    : channel.id === 'EMAIL'
                                                        ? "bg-amber-500 text-white shadow-md shadow-amber-200"
                                                        : "bg-[#25D366] text-white shadow-md shadow-green-200"
                                        : "text-gray-400 hover:text-gray-600"
                                )}
                            >
                                {channel.icon}
                                {channel.label}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {activeTab === 'flows' ? (
                <div className="space-y-6 animate-in fade-in duration-500">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <Card className="p-8 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-110 transition-transform"><Workflow size={60} className="text-gray-900" /></div>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Active Flows</p>
                            <div className="text-3xl font-black text-gray-900 mt-2">12</div>
                            <p className={cn("text-[10px] font-bold uppercase mt-2 tracking-widest", selectedChannel === 'INSTAGRAM' ? "text-pink-500" : selectedChannel === 'FACEBOOK' ? "text-blue-500" : selectedChannel === 'EMAIL' ? "text-amber-500" : "text-green-500")}>+2 this week</p>
                        </Card>
                        <Card className="p-8 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-110 transition-transform"><CheckCircle2 size={60} className="text-gray-900" /></div>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Completion Rate</p>
                            <div className="text-3xl font-black text-gray-900 mt-2">68.4%</div>
                            <div className="w-full h-1.5 bg-gray-100 rounded-full mt-4 overflow-hidden">
                                <div
                                    className={cn("h-full transition-all duration-500", selectedChannel === 'INSTAGRAM' ? "bg-pink-500" : selectedChannel === 'FACEBOOK' ? "bg-blue-500" : selectedChannel === 'TELEGRAM' ? "bg-sky-500" : selectedChannel === 'EMAIL' ? "bg-amber-500" : "bg-[#25D366]")}
                                    style={{ width: '68.4%' }}
                                />
                            </div>
                        </Card>
                        <Card className="p-8 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-110 transition-transform"><Zap size={60} className="text-gray-900" /></div>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Interactions</p>
                            <div className="text-3xl font-black text-gray-900 mt-2">4,120</div>
                            <p className="text-[10px] font-bold text-gray-400 mt-2 uppercase tracking-widest leading-none">Aggregated reach</p>
                        </Card>
                    </div>

                    <Card className="overflow-hidden border-none shadow-xl shadow-gray-200/50">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-gray-50/50 border-b border-gray-100">
                                <tr>
                                    <th className="px-8 py-5 font-black text-gray-400 uppercase text-[10px] tracking-widest">Flow Name</th>
                                    <th className="px-8 py-5 font-black text-gray-400 uppercase text-[10px] tracking-widest">Trigger</th>
                                    <th className="px-8 py-5 font-black text-gray-400 uppercase text-[10px] tracking-widest">Steps</th>
                                    <th className="px-8 py-5 font-black text-gray-400 uppercase text-[10px] tracking-widest">Completions</th>
                                    <th className="px-8 py-5 font-black text-gray-400 uppercase text-[10px] tracking-widest">Status</th>
                                    <th className="px-8 py-5 text-right"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50 bg-white">
                                {isLoading ? (
                                    <tr>
                                        <td colSpan={6} className="px-8 py-10 text-center">
                                            <div className="flex flex-col items-center gap-2 text-gray-400">
                                                <div className="w-8 h-8 border-4 border-t-[#25D366] border-gray-100 rounded-full animate-spin" />
                                                <p className="text-[10px] font-black uppercase tracking-widest">Loading flows...</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : flows.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="px-8 py-20 text-center">
                                            <div className="max-w-xs mx-auto space-y-4">
                                                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center text-gray-300 mx-auto">
                                                    <Workflow size={32} />
                                                </div>
                                                <div>
                                                    <p className="text-gray-900 font-black">No {selectedChannel.toLowerCase()} flows yet</p>
                                                    <p className="text-xs text-gray-400 font-bold mt-1">Start by architecting your first journey for this channel.</p>
                                                </div>
                                                <Button onClick={handleCreateNewFlow} size="sm" variant="ghost" className={cn(
                                                    selectedChannel === 'INSTAGRAM' ? "text-pink-600 hover:bg-pink-50" : selectedChannel === 'FACEBOOK' ? "text-blue-600 hover:bg-blue-50" : selectedChannel === 'TELEGRAM' ? "text-sky-500 hover:bg-sky-50" : "text-[#25D366] hover:bg-green-50"
                                                )}>
                                                    Create Now
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    flows.map((f, idx) => (
                                        <tr
                                            key={f.id}
                                            className={cn(
                                                "hover:bg-gray-50/50 transition-colors group cursor-pointer",
                                                navigatingId === f.id && "bg-gray-50/80 pointer-events-none"
                                            )}
                                            onClick={() => {
                                                setNavigatingId(f.id);
                                                navigate(`/flow-builder/${f.id}`);
                                            }}
                                        >
                                            <td className="px-8 py-5">
                                                <div className="flex items-center gap-4">
                                                    <div className={cn(
                                                        "w-10 h-10 rounded-xl flex items-center justify-center transition-all shadow-sm",
                                                        navigatingId === f.id
                                                            ? (selectedChannel === 'INSTAGRAM' ? "bg-pink-600 text-white" : selectedChannel === 'TELEGRAM' ? "bg-sky-500 text-white" : "bg-[#25D366] text-white")
                                                            : (selectedChannel === 'INSTAGRAM' ? "bg-gray-50 text-gray-400 group-hover:bg-pink-600 group-hover:text-white" : selectedChannel === 'FACEBOOK' ? "bg-gray-50 text-gray-400 group-hover:bg-blue-600 group-hover:text-white" : selectedChannel === 'TELEGRAM' ? "bg-gray-50 text-gray-400 group-hover:bg-sky-500 group-hover:text-white" : "bg-gray-50 text-gray-400 group-hover:bg-[#25D366] group-hover:text-white")
                                                    )}>
                                                        {navigatingId === f.id ? (
                                                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                        ) : (
                                                            <GitBranch size={18} />
                                                        )}
                                                    </div>
                                                    <div className={cn(navigatingId === f.id && "animate-pulse")}>
                                                        <p className="font-black text-gray-900">{f.name}</p>
                                                        <p className="text-[9px] text-gray-400 uppercase font-black tracking-widest mt-1">
                                                            {navigatingId === f.id ? 'Opening Designer...' : `Modified ${new Date(f.updatedAt).toLocaleDateString()}`}
                                                        </p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-5">
                                                <span className="px-3 py-1 bg-gray-100 text-[10px] font-black uppercase text-gray-500 rounded-lg">
                                                    {f.triggerType}
                                                </span>
                                            </td>
                                            <td className="px-8 py-5 font-black text-gray-500 text-xs">{f.nodes?.length || 0} steps</td>
                                            <td className="px-8 py-5 font-black text-gray-900">{f._count?.executions?.toLocaleString() || 0}</td>
                                            <td className="px-8 py-5">
                                                <div className="flex items-center gap-3">
                                                    <button
                                                        onClick={(e) => handleToggleStatus(e, f.id, f.isEnabled)}
                                                        className={cn(
                                                            "relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none",
                                                            f.isEnabled ? (selectedChannel === 'INSTAGRAM' ? "bg-pink-500" : selectedChannel === 'FACEBOOK' ? "bg-blue-500" : "bg-[#25D366]") : "bg-gray-200"
                                                        )}
                                                    >
                                                        <span
                                                            className={cn(
                                                                "pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out",
                                                                f.isEnabled ? "translate-x-4" : "translate-x-0"
                                                            )}
                                                        />
                                                    </button>
                                                    <Badge variant={f.isEnabled ? 'success' : 'neutral'} className={cn(
                                                        f.isEnabled && (selectedChannel === 'INSTAGRAM' ? "bg-pink-50 text-pink-600 border-pink-100" : selectedChannel === 'FACEBOOK' ? "bg-blue-50 text-blue-600 border-blue-100" : "")
                                                    )}>
                                                        {f.isEnabled ? 'active' : 'draft'}
                                                    </Badge>
                                                </div>
                                            </td>
                                            <td className="px-8 py-5 text-right">
                                                <div className="flex justify-end gap-2">
                                                    <button className="p-2 text-gray-400 hover:text-gray-900 transition-all opacity-0 group-hover:opacity-100"><Eye size={18} /></button>
                                                    <button className={cn("p-2 text-gray-400 transition-all opacity-0 group-hover:opacity-100", selectedChannel === 'INSTAGRAM' ? "hover:text-pink-500" : selectedChannel === 'FACEBOOK' ? "hover:text-blue-500" : "hover:text-[#25D366]")}><Zap size={18} /></button>
                                                    <button className="p-2 text-gray-400 hover:text-gray-900"><MoreVertical size={18} /></button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </Card>
                </div>
            ) : (
                <div className="space-y-8 animate-in fade-in duration-500">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {MOCK_RULES.map(rule => (
                            <Card key={rule.id} className="p-8 space-y-6 hover:shadow-2xl transition-all border-none shadow-xl shadow-gray-200/50">
                                <div className="flex items-center justify-between">
                                    <Badge variant={rule.trigger === 'Keyword' ? 'info' : 'success'}>{rule.trigger}</Badge>
                                    <button className="p-2 text-gray-300 hover:text-gray-900 transition-colors"><MoreVertical size={18} /></button>
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">If message contains</p>
                                    <h4 className="text-xl font-black text-gray-900 mt-1">"{rule.value}"</h4>
                                </div>
                                <div className="p-4 bg-gray-50 rounded-2xl flex items-center gap-4">
                                    <div className={cn(
                                        "w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm",
                                        selectedChannel === 'INSTAGRAM' ? "text-pink-600" :
                                            selectedChannel === 'FACEBOOK' ? "text-blue-600" : "text-[#25D366]"
                                    )}><CheckCircle2 size={18} /></div>
                                    <div>
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{rule.action}</p>
                                        <p className="text-sm font-bold text-gray-900">{rule.target}</p>
                                    </div>
                                </div>
                                <div className="pt-6 border-t border-gray-50 flex items-center justify-between">
                                    <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest">Status: <span className={cn(selectedChannel === 'INSTAGRAM' ? "text-pink-600" : "text-[#25D366]")}>{rule.status}</span></span>
                                    <button className="text-xs font-black uppercase text-gray-400 hover:text-gray-900">Configure Rule</button>
                                </div>
                            </Card>
                        ))}
                        <button
                            onClick={() => setIsRuleModalOpen(true)}
                            className={cn(
                                "border-[3px] border-dashed border-gray-100 rounded-[2.5rem] p-12 flex flex-col items-center justify-center gap-4 transition-all group min-h-[300px]",
                                selectedChannel === 'INSTAGRAM' ? "hover:bg-white hover:border-pink-500/30" : "hover:bg-white hover:border-[#25D366]/30"
                            )}
                        >
                            <div className={cn(
                                "w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center text-gray-300 transition-all shadow-inner",
                                selectedChannel === 'INSTAGRAM' ? "group-hover:bg-pink-50 group-hover:text-pink-600" : "group-hover:bg-[#25D366]/10 group-hover:text-[#25D366]"
                            )}>
                                <Plus size={32} />
                            </div>
                            <span className="text-sm font-black text-gray-400 group-hover:text-gray-600 uppercase tracking-widest">Add New Rule</span>
                        </button>
                        <button onClick={() => setIsAIRuleModalOpen(true)} className="bg-gray-900 border-none rounded-[2.5rem] p-12 flex flex-col items-center justify-center gap-4 hover:bg-black transition-all group min-h-[300px] shadow-2xl relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:rotate-12 transition-transform"><SparklesIcon size={120} className="text-white" /></div>
                            <div className={cn(
                                "w-16 h-16 rounded-full flex items-center justify-center group-hover:scale-110 transition-all shadow-inner relative z-10",
                                selectedChannel === 'INSTAGRAM' ? "bg-pink-500/20 text-pink-500 group-hover:text-pink-400" :
                                    selectedChannel === 'FACEBOOK' ? "bg-blue-500/20 text-blue-500 group-hover:text-blue-400" : "bg-[#25D366]/20 text-[#25D366] group-hover:text-[#25D366]"
                            )}>
                                <SparklesIcon size={32} />
                            </div>
                            <span className={cn("text-sm font-black uppercase tracking-widest relative z-10", selectedChannel === 'INSTAGRAM' ? "text-white group-hover:text-pink-400" : selectedChannel === 'FACEBOOK' ? "text-white group-hover:text-blue-400" : "text-white group-hover:text-[#25D366]")}>
                                AI Auto-Generator
                            </span>
                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider relative z-10 mt-2">Natural Language Logic</p>
                        </button>
                    </div>

                    <Card className="p-10 bg-gray-900 relative overflow-hidden group border-none shadow-2xl">
                        <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:rotate-12 transition-transform"><MessageCircle size={120} className="text-white" /></div>
                        <div className="relative z-10 max-w-2xl">
                            <h3 className="text-2xl font-black text-white">Automation Intelligence</h3>
                            <p className="text-gray-400 mt-4 leading-relaxed font-bold">
                                Combine these lightweight auto-tagging rules with your Canvas Flows for a powerful multi-stage customer journey.
                                Rules process incoming intent immediately, ensuring your lead segments are always up-to-date.
                            </p>
                            <Button className={cn(
                                "mt-8 border-none shadow-xl rounded-2xl px-10 text-white",
                                selectedChannel === 'INSTAGRAM' ? "bg-pink-600 hover:bg-pink-700 shadow-pink-900/20" :
                                    selectedChannel === 'FACEBOOK' ? "bg-blue-600 hover:bg-blue-700 shadow-blue-900/20" : "bg-[#25D366] hover:bg-[#25D366]/90 shadow-green-900/20"
                            )}>
                                Read Integration Guide
                            </Button>
                        </div>
                    </Card>
                </div>
            )}

            {/* Rule Modal */}
            <AnimatePresence>
                {isRuleModalOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm"
                            onClick={() => setIsRuleModalOpen(false)}
                        />
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            className="relative w-full max-w-lg bg-white rounded-[2.5rem] overflow-hidden shadow-2xl"
                        >
                            <div className="p-8 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                                <div>
                                    <h3 className="text-xl font-black text-gray-900">New Automation Rule</h3>
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">Lightweight trigger processing</p>
                                </div>
                                <button onClick={() => setIsRuleModalOpen(false)} className="p-3 hover:bg-white rounded-2xl text-gray-400 hover:text-gray-900 transition-all shadow-sm ring-1 ring-gray-100"><X size={20} /></button>
                            </div>

                            <div className="p-10 space-y-8">
                                <div className="space-y-4">
                                    <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Trigger Type</label>
                                    <div className="grid grid-cols-2 gap-3">
                                        {['Keyword', 'CTA Click'].map(t => (
                                            <button
                                                key={t}
                                                onClick={() => setNewRule({ ...newRule, trigger: t })}
                                                className={cn(
                                                    "px-6 py-4 rounded-2xl text-sm font-black transition-all border-2",
                                                    newRule.trigger === t
                                                        ? (selectedChannel === 'INSTAGRAM' ? "border-pink-500 bg-pink-50/50 text-gray-900" :
                                                            selectedChannel === 'FACEBOOK' ? "border-blue-500 bg-blue-50/50 text-gray-900" : "border-[#25D366] bg-green-50/50 text-gray-900")
                                                        : "border-gray-50 text-gray-400 hover:bg-gray-50"
                                                )}
                                            >
                                                {t}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <Input
                                    label={newRule.trigger === 'Keyword' ? 'Target Keyword' : 'Button Label'}
                                    placeholder="e.g. Schedule View"
                                    value={newRule.value}
                                    onChange={(e) => setNewRule({ ...newRule, value: e.target.value })}
                                />

                                <div className="space-y-4">
                                    <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Target Segment</label>
                                    <div className="grid grid-cols-2 gap-3">
                                        {MOCK_TAGS.map(t => (
                                            <button
                                                key={t.id}
                                                onClick={() => setNewRule({ ...newRule, target: t.name })}
                                                className={cn(
                                                    "flex items-center gap-3 px-4 py-3 rounded-2xl border-2 transition-all",
                                                    newRule.target === t.name
                                                        ? (selectedChannel === 'INSTAGRAM' ? "border-pink-500 bg-pink-50/50" :
                                                            selectedChannel === 'FACEBOOK' ? "border-blue-500 bg-blue-50/50" : "border-[#25D366] bg-green-50/50")
                                                        : "border-gray-50 hover:bg-gray-50"
                                                )}
                                            >
                                                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: t.color }} />
                                                <span className="text-sm font-bold text-gray-900">{t.name}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="p-8 bg-gray-50/50 border-t border-gray-100 flex gap-4">
                                <Button variant="ghost" onClick={() => setIsRuleModalOpen(false)} className="flex-1">Cancel</Button>
                                <Button
                                    className="flex-1 rounded-2xl px-10 bg-gray-900 hover:bg-black"
                                    onClick={() => setIsRuleModalOpen(false)}
                                    disabled={!newRule.value || !newRule.target}
                                >
                                    Activate
                                </Button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
            {/* Builder Modal (Mock) */}
            {activeTab === 'flows' && (
                <div className="mt-8">
                    {/* Integrated via /flows route */}
                </div>
            )}
            <AIGenerateRuleModal
                isOpen={isAIRuleModalOpen}
                onClose={() => setIsAIRuleModalOpen(false)}
                onRuleGenerated={handleAIRuleGenerated}
            />
        </div>
    );
};

export default Flows;
