import React from 'react';
import { X, Mail, Phone, Globe, Linkedin, Facebook, Instagram, Zap, ExternalLink, Tag, ShieldCheck, Loader2, MessageCircle, Info, Cpu, ShoppingBag, Layout, Terminal, Sparkles, Eye, Image as ImageIcon } from 'lucide-react';
import { Button, Badge } from '../../components/shared';
import LeadScoreBadge from './LeadScoreBadge';
import { cn } from '../../components/ui';
import { useAppDispatch, useAppSelector } from '../../store';
import { enrichLeads } from '../../features/leadSlice';
import toast from 'react-hot-toast';

const BACKEND_URL = import.meta.env.VITE_API_URL?.replace('/api/v1', '') || '';

export interface LeadDetailsDrawerProps {
    isOpen: boolean;
    onClose: () => void;
    lead: any | null;
}

const LeadDetailsDrawer: React.FC<LeadDetailsDrawerProps> = ({ isOpen, onClose, lead }) => {
    const dispatch = useAppDispatch();
    const { loading } = useAppSelector(state => state.leads);

    if (!lead) return null;

    const handleEnrich = async () => {
        try {
            await dispatch(enrichLeads([lead.id])).unwrap();
            toast.success('Enrichment job started!');
        } catch (error) {
            toast.error('Failed to start enrichment');
        }
    };

    return (
        <>
            {/* Backdrop */}
            <div 
                className={cn(
                    "fixed inset-0 bg-gray-900/40 backdrop-blur-sm z-[100] transition-opacity duration-300",
                    isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
                )}
                onClick={onClose}
            />

            {/* Drawer */}
            <div className={cn(
                "fixed inset-y-0 right-0 w-full max-w-lg bg-white shadow-2xl z-[101] transform transition-transform duration-500 ease-in-out flex flex-col",
                isOpen ? "translate-x-0" : "translate-x-full"
            )}>
                {/* Header */}
                <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-white rounded-xl shadow-sm"><ShieldCheck size={20} className="text-[#25D366]" /></div>
                        <h3 className="font-black text-gray-900 uppercase tracking-tight">Lead Intelligence Analysis</h3>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-white rounded-full text-gray-400 group transition-colors">
                        <X size={24} className="group-hover:rotate-90 transition-transform" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-8 space-y-10">
                    {/* Basic Info */}
                    <div className="flex flex-col items-center text-center space-y-4">
                        <div className="relative">
                            <LeadScoreBadge score={lead.score || 0} size={120} />
                            <div className="absolute -bottom-2 -right-2 bg-white p-2 rounded-xl shadow-lg">
                                <Zap size={20} className="text-[#25D366]" />
                            </div>
                        </div>
                        <div>
                            <h2 className="text-2xl font-black text-gray-900">{lead.name}</h2>
                            <p className="text-sm font-bold text-gray-400 mt-1 flex items-center justify-center gap-1">
                                <Globe size={14} /> {lead.website || 'No website'}
                            </p>
                        </div>
                        <div className="flex gap-2">
                            <Badge variant={lead.status === 'qualified' ? 'success' : 'neutral'}>{lead.status || 'new'}</Badge>
                            {lead.location && <Badge variant="neutral">{lead.location}</Badge>}
                        </div>
                    </div>

                    {/* Section: Website Screenshot (Phase 3) */}
                    {lead.scraped?.screenshotUrl && (
                        <div className="space-y-4">
                            <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Visual Verification</h4>
                            <div className="relative group rounded-[2.5rem] overflow-hidden border border-gray-100 shadow-2xl bg-gray-50 aspect-video">
                                <img 
                                    src={`${BACKEND_URL}${lead.scraped.screenshotUrl}`} 
                                    alt="Website Preview" 
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
                                    loading="lazy"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                <a 
                                    href={lead.website} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="absolute bottom-4 right-4 p-3 bg-white/90 backdrop-blur-md rounded-2xl shadow-xl opacity-0 group-hover:opacity-100 transition-all translate-y-2 group-hover:translate-y-0"
                                >
                                    <ExternalLink size={18} className="text-gray-900" />
                                </a>
                            </div>
                        </div>
                    )}

                    {/* Section: Contact Info (Phase 1: Deep Crawl Arrays) */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between px-1">
                            <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Contact Intelligence</h4>
                            {(Array.isArray(lead.email) && lead.email.length > 1) && (
                                <span className="text-[8px] font-black text-[#25D366] uppercase flex items-center gap-0.5">
                                    <Info size={8} /> Verified by Deep Crawl
                                </span>
                            )}
                        </div>
                        <div className="grid grid-cols-1 gap-4">
                            {/* Phones */}
                            <div className="space-y-2">
                                {Array.isArray(lead.phone || lead.phoneNumber) ? (
                                    (lead.phone || lead.phoneNumber).map((p: string, i: number) => (
                                        <div key={i} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100 group hover:border-[#25D366] transition-colors">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 bg-white rounded-xl shadow-sm text-gray-400"><Phone size={16} /></div>
                                                <span className="text-sm font-bold text-gray-900">{p}</span>
                                            </div>
                                            <Button variant="ghost" className="text-[10px] font-black uppercase text-[#25D366]">Call Now</Button>
                                        </div>
                                    ))
                                ) : (lead.phone || lead.phoneNumber) && (
                                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100 group hover:border-[#25D366] transition-colors">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-white rounded-xl shadow-sm text-gray-400"><Phone size={16} /></div>
                                            <span className="text-sm font-bold text-gray-900">{lead.phone || lead.phoneNumber}</span>
                                        </div>
                                        <Button variant="ghost" className="text-[10px] font-black uppercase text-[#25D366]">Call Now</Button>
                                    </div>
                                )}
                            </div>

                            {/* Emails */}
                            <div className="space-y-2">
                                {Array.isArray(lead.email) ? (
                                    lead.email.map((e: string, i: number) => (
                                        <div key={i} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100 group hover:border-blue-500 transition-colors">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 bg-white rounded-xl shadow-sm text-gray-400"><Mail size={16} /></div>
                                                <span className="text-sm font-bold text-gray-900">{e}</span>
                                            </div>
                                            <Button variant="ghost" className="text-[10px] font-black uppercase text-blue-500">Email</Button>
                                        </div>
                                    ))
                                ) : lead.email && (
                                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100 group hover:border-blue-500 transition-colors">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-white rounded-xl shadow-sm text-gray-400"><Mail size={16} /></div>
                                            <span className="text-sm font-bold text-gray-900">{lead.email}</span>
                                        </div>
                                        <Button variant="ghost" className="text-[10px] font-black uppercase text-blue-500">Email</Button>
                                    </div>
                                )}
                                {!lead.email && !loading && (
                                    <Button 
                                        variant="ghost" 
                                        className="w-full py-4 border-2 border-dashed border-gray-100 rounded-2xl text-[10px] font-black uppercase text-gray-400 hover:border-blue-200 hover:text-blue-500 transition-all"
                                        onClick={handleEnrich}
                                    >
                                        <Zap size={14} className="mr-2" /> Enrich Lead for Email
                                    </Button>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Section: AI Insights (Phase 2: Enhanced reasoning) */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between px-1">
                            <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">AI Sales Intelligence</h4>
                            <Badge variant="success" className="bg-green-50 text-[#25D366] border-green-100 animate-pulse">Live Reasoning</Badge>
                        </div>
                        <div className="p-6 bg-gradient-to-br from-gray-900 to-gray-800 rounded-[2.5rem] border border-white/10 shadow-2xl relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-40 h-40 bg-[#25D366]/10 rounded-bl-[5rem] blur-2xl" />
                            <div className="flex items-start gap-4 relative z-10">
                                <div className="p-3 bg-white/10 rounded-2xl backdrop-blur-md border border-white/20">
                                    <Sparkles size={24} className="text-[#25D366]" />
                                </div>
                                <div className="space-y-3">
                                    <p className="text-sm font-bold text-white leading-relaxed">
                                        {lead.aiScore?.reasons?.[0] || `High conversion potential based on ${lead.tags?.[0] || 'business'} profile.`}
                                    </p>
                                    <div className="space-y-2">
                                        {lead.aiScore?.reasons?.slice(1).map((reason: string, i: number) => (
                                            <div key={i} className="flex items-start gap-2 text-[11px] text-white/60 leading-snug">
                                                <div className="mt-1.5 w-1 h-1 rounded-full bg-[#25D366] shrink-0" />
                                                {reason}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Section: Technology Stack (Phase 2: Digital Footprint) */}
                    {(lead.scraped?.techStack || lead.tags) && (
                        <div className="space-y-4">
                            <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Digital Footprint (Tech Stack)</h4>
                            <div className="flex flex-wrap gap-2">
                                {lead.scraped?.techStack?.map((tech: string) => {
                                    const isShopify = tech.toLowerCase().includes('shopify');
                                    const isWP = tech.toLowerCase().includes('wordpress');
                                    const isWix = tech.toLowerCase().includes('wix');
                                    
                                    return (
                                        <div 
                                            key={tech} 
                                            className={cn(
                                                "flex items-center gap-2 px-3 py-1.5 rounded-xl border backdrop-blur-md transition-all hover:scale-105 cursor-default shadow-sm hover:shadow-md",
                                                isShopify ? "bg-[#96bf48]/10 border-[#96bf48]/30 text-[#96bf48]" :
                                                isWP ? "bg-[#21759b]/10 border-[#21759b]/30 text-[#21759b]" :
                                                isWix ? "bg-gray-100 border-gray-200 text-gray-900" :
                                                "bg-gray-50/50 border-gray-200 text-gray-600"
                                            )}
                                        >
                                            {isShopify ? <ShoppingBag size={12} /> : 
                                             isWP ? <Layout size={12} /> : 
                                             isWix ? <Globe size={12} /> : 
                                             <Terminal size={12} />}
                                            <span className="text-[10px] font-black uppercase tracking-tight">{tech}</span>
                                        </div>
                                    );
                                })}
                                {/* Fallback to tags if techStack is empty */}
                                {(!lead.scraped?.techStack || lead.scraped.techStack.length === 0) && lead.tags?.map((tag: string) => (
                                    <div key={tag} className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 border border-gray-100 rounded-xl text-gray-400">
                                        <Cpu size={12} />
                                        <span className="text-[10px] font-black uppercase tracking-tight">{tag}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Section: AI Visual Audit (Phase 3) */}
                    {lead.aiScore?.reasons?.some((r: string) => /modern|outdated|ui|layout|design|widget|chat/i.test(r)) && (
                        <div className="space-y-4">
                            <div className="flex items-center justify-between px-1">
                                <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">AI Visual Audit</h4>
                                <Badge variant="warning" className="bg-amber-50 text-amber-600 border-amber-100 lowercase">Visual Hook Detected</Badge>
                            </div>
                            <div className="p-6 bg-amber-50/20 backdrop-blur-md rounded-[2.5rem] border border-amber-200/30 shadow-xl shadow-amber-500/5 space-y-4 overflow-hidden relative group">
                                <div className="absolute -top-12 -right-12 w-24 h-24 bg-amber-400/10 rounded-full blur-2xl group-hover:scale-125 transition-transform duration-700" />
                                <div className="flex items-start gap-4 relative z-10">
                                    <div className="p-3 bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-amber-100/50">
                                        <Eye size={20} className="text-amber-500" />
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-sm font-black text-gray-900 uppercase tracking-tight">Design Consistency & UX</p>
                                        <p className="text-xs text-gray-500 leading-relaxed italic">
                                            Gemini analyzed the layout and identified key visual opportunities:
                                        </p>
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 gap-2 relative z-10">
                                    {lead.aiScore.reasons
                                        .filter((r: string) => /modern|outdated|ui|layout|design|widget|chat/i.test(r))
                                        .map((reason: string, i: number) => (
                                            <div key={i} className="flex items-center gap-3 p-3 bg-white/40 backdrop-blur-sm rounded-xl border border-amber-50 group/item hover:border-amber-200 transition-all hover:translate-x-1">
                                                <div className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0 group-hover/item:scale-125 transition-transform" />
                                                <span className="text-[11px] font-bold text-gray-800">{reason}</span>
                                            </div>
                                        ))
                                    }
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Section: Website Data */}
                    <div className="space-y-4">
                        <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">AI Website Extraction</h4>
                        <div className="p-6 bg-gray-900 rounded-[2rem] border border-white/5 space-y-4 shadow-2xl relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-white/[0.02] rounded-bl-[4rem]" />
                            <p className="text-xs text-white/70 leading-relaxed italic">
                                {lead.tags && lead.tags.length > 0 
                                    ? `AI identified this business as: ${lead.tags.join(', ')}.`
                                    : "No AI analysis performed yet. Click 'Scrape Site' to begin extraction."}
                            </p>
                            <div className="flex gap-3 pt-2">
                                {lead.tags?.slice(0, 2).map((tag: string) => (
                                    <div key={tag} className="px-3 py-1 bg-white/10 rounded-lg text-[9px] font-black text-white uppercase tracking-widest">{tag}</div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Section: Social & Tags */}
                    <div className="grid grid-cols-2 gap-8">
                        <div className="space-y-4">
                            <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Social Fingerprint</h4>
                            <div className="flex gap-3">
                                {lead.socialLinks?.whatsapp && (
                                    <a 
                                        href={lead.socialLinks.whatsapp} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="p-3 bg-[#25D366] text-white rounded-2xl transition-all shadow-[0_0_15px_rgba(37,211,102,0.3)] animate-whatsapp-pulse hover:scale-110"
                                    >
                                        <MessageCircle size={20} fill="currentColor" />
                                    </a>
                                )}
                                <button className={cn("p-3 rounded-2xl transition-colors shadow-sm", lead.socialLinks?.linkedin ? "bg-blue-50 text-blue-700" : "bg-gray-50 text-gray-300")}><Linkedin size={20} /></button>
                                <button className={cn("p-3 rounded-2xl transition-colors shadow-sm", lead.socialLinks?.facebook ? "bg-blue-50 text-blue-900" : "bg-gray-50 text-gray-300")}><Facebook size={20} /></button>
                                <button className={cn("p-3 rounded-2xl transition-colors shadow-sm", lead.socialLinks?.instagram ? "bg-pink-50 text-pink-600" : "bg-gray-50 text-gray-300")}><Instagram size={20} /></button>
                            </div>
                        </div>
                        <div className="space-y-4">
                            <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Meta Tags</h4>
                            <div className="flex flex-wrap gap-2">
                                {lead.tags?.map((tag: string) => (
                                    <div key={tag} className="flex items-center gap-1 bg-gray-100 px-2 py-1 rounded-lg text-[9px] font-black text-gray-900 border border-gray-200 uppercase"><Tag size={10} /> {tag}</div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer Actions */}
                <div className="p-8 border-t border-gray-100 flex gap-4 bg-white sticky bottom-0">
                    <Button variant="secondary" className="flex-1 py-4 rounded-2xl shadow-lg" onClick={handleEnrich} disabled={loading}>
                        {loading ? <Loader2 className="animate-spin" size={18} /> : <ExternalLink size={18} />} Scrape Site
                    </Button>
                    <Button className="flex-1 py-4 rounded-2xl bg-[#25D366] text-white shadow-xl shadow-green-100 hover:shadow-green-200">
                        <Zap size={18} /> Start Campaign
                    </Button>
                </div>
            </div>

            <style>{`
                @keyframes whatsapp-pulse {
                    0% { box-shadow: 0 0 0 0 rgba(37, 211, 102, 0.4); }
                    70% { box-shadow: 0 0 0 10px rgba(37, 211, 102, 0); }
                    100% { box-shadow: 0 0 0 0 rgba(37, 211, 102, 0); }
                }
                .animate-whatsapp-pulse {
                    animation: whatsapp-pulse 2s infinite;
                }
            `}</style>
        </>
    );
};

export default LeadDetailsDrawer;
