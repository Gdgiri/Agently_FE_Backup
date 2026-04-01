import React from 'react';
import { Card, Badge, Button } from '../../components/shared';
import { Mail, Globe, Share2, TrendingUp, Filter, Linkedin, Facebook, Instagram, MessageCircle, Info, ShoppingBag, Layout, Terminal, ImageIcon } from 'lucide-react';
import LeadScoreBadge from './LeadScoreBadge';
import { useAppSelector } from '../../store';
import { cn } from '../../components/ui';

const BACKEND_URL = import.meta.env.VITE_API_URL?.replace('/api/v1', '') || '';

const EnrichedLeads: React.FC = () => {
    const { leads } = useAppSelector(state => state.leads);
    const enrichedLeads = leads.filter(l => l.status === 'enriched');

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
                <div className="flex gap-4">
                    <button className="text-[10px] font-black uppercase text-[#25D366] px-3 py-1 bg-green-50 rounded-lg border border-green-100">All Enriched</button>
                    <button className="text-[10px] font-black uppercase text-gray-400 px-3 py-1 hover:bg-gray-50 rounded-lg">High Score (80+)</button>
                    <button className="text-[10px] font-black uppercase text-gray-400 px-3 py-1 hover:bg-gray-50 rounded-lg">Has Email</button>
                </div>
                <Button variant="ghost" className="text-xs">
                    <Filter size={14} /> Advanced Sort
                </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {enrichedLeads.length === 0 ? (
                    <Card className="col-span-2 p-12 text-center text-gray-400 font-bold italic">
                        No leads have been enriched yet. Use the Lead List or Map to start enrichment.
                    </Card>
                ) : enrichedLeads.map(lead => (
                    <Card key={lead.id} className="p-6 hover:shadow-2xl transition-all border-none shadow-xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-[#25D366]/5 rounded-bl-[4rem] group-hover:scale-110 transition-transform" />
                        
                        <div className="flex gap-6 relative z-10">
                            <div className="shrink-0 space-y-3 flex flex-col items-center">
                                <LeadScoreBadge score={lead.score || 0} size={80} />
                                {lead.scraped?.screenshotUrl && (
                                    <div className="w-20 aspect-video rounded-xl overflow-hidden border border-gray-100 shadow-sm">
                                        <img 
                                            src={`${BACKEND_URL}${lead.scraped.screenshotUrl}`} 
                                            alt="Preview" 
                                            className="w-full h-full object-cover" 
                                            loading="lazy"
                                        />
                                    </div>
                                )}
                            </div>
                            
                            <div className="flex-1 space-y-4">
                                <div className="flex justify-between items-start">
                                    <div className="flex flex-col gap-1">
                                        <div className="flex items-center gap-2">
                                            <h4 className="text-lg font-black text-gray-900 leading-tight">{lead.name}</h4>
                                            {lead.scraped?.techStack?.some((t: string) => t.toLowerCase().includes('shopify')) && (
                                                <span title="Shopify Store" className="text-[#96bf48]"><ShoppingBag size={14} /></span>
                                            )}
                                            {lead.scraped?.techStack?.some((t: string) => t.toLowerCase().includes('wordpress')) && (
                                                <span title="WordPress Site" className="text-[#21759b]"><Layout size={14} /></span>
                                            )}
                                            {lead.socialLinks?.whatsapp && (
                                                <a 
                                                    href={lead.socialLinks.whatsapp} 
                                                    target="_blank" 
                                                    rel="noopener noreferrer"
                                                    className="flex items-center gap-1 px-1.5 py-0.5 bg-[#25D366] text-white rounded-md text-[8px] font-black uppercase shadow-[0_0_10px_rgba(37,211,102,0.3)] animate-whatsapp-pulse hover:scale-105 transition-transform"
                                                    onClick={(e) => e.stopPropagation()}
                                                >
                                                    <MessageCircle size={10} fill="currentColor" />
                                                    Direct Chat
                                                </a>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-4 mt-1">
                                            <div className="flex gap-2">
                                                <Linkedin size={14} className={lead.socialLinks?.linkedin ? "text-blue-600" : "text-gray-300"} />
                                                <Facebook size={14} className={lead.socialLinks?.facebook ? "text-blue-800" : "text-gray-300"} />
                                                <Instagram size={14} className={lead.socialLinks?.instagram ? "text-pink-600" : "text-gray-300"} />
                                            </div>
                                            <div className="h-3 w-px bg-gray-200" />
                                            {lead.email ? (
                                                <div className="flex items-center gap-2">
                                                    <div className="flex items-center gap-1 text-[10px] font-black text-[#25D366] uppercase">
                                                        <Mail size={12} /> {Array.isArray(lead.email) && lead.email.length > 1 ? `${lead.email.length} Emails Discovered` : 'Email Discovered'}
                                                    </div>
                                                    {Array.isArray(lead.email) && lead.email.length > 1 && (
                                                        <span className="text-[8px] font-black text-blue-500 uppercase flex items-center gap-0.5 bg-blue-50 px-1.5 py-0.5 rounded">
                                                            <Info size={8} /> Deep Crawl
                                                        </span>
                                                    )}
                                                </div>
                                            ) : (
                                                <div className="text-[10px] font-black text-red-400 uppercase">No Emails Found</div>
                                            )}
                                        </div>
                                    </div>
                                    <Badge variant="success">Enriched</Badge>
                                </div>

                                <div className="bg-gray-50/50 backdrop-blur-sm rounded-3xl p-5 border border-gray-100 shadow-sm relative overflow-hidden group/analysis">
                                    <div className="absolute top-0 right-0 w-24 h-24 bg-gray-900/[0.02] rounded-bl-[3rem] group-hover/analysis:scale-110 transition-transform" />
                                    <h5 className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-1.5 relative z-10">
                                        <Globe size={10} className="text-[#25D366]" /> AI Analysis & Reasoning
                                    </h5>
                                    <p className="text-xs text-gray-600 leading-relaxed italic line-clamp-2 mb-4 relative z-10 group-hover/analysis:text-gray-900 transition-colors">
                                        "{lead.aiScore?.reasons?.[0] || lead.tags.join(', ')}"
                                    </p>
                                    
                                    {/* Tech Stack Preview */}
                                    {lead.scraped?.techStack && (
                                        <div className="flex flex-wrap gap-1.5 pt-1 relative z-10">
                                            {lead.scraped.techStack.slice(0, 3).map((tech: string) => {
                                                const isShopify = tech.toLowerCase().includes('shopify');
                                                const isWP = tech.toLowerCase().includes('wordpress');
                                                const isWix = tech.toLowerCase().includes('wix');
                                                return (
                                                    <div 
                                                        key={tech} 
                                                        className={cn(
                                                            "flex items-center gap-1 px-2 py-0.5 rounded-md text-[8px] font-black uppercase border transition-all hover:scale-105",
                                                            isShopify ? "bg-[#96bf48]/10 border-[#96bf48]/20 text-[#96bf48] shadow-sm shadow-[#96bf48]/5" :
                                                            isWP ? "bg-[#21759b]/10 border-[#21759b]/20 text-[#21759b] shadow-sm shadow-[#21759b]/5" :
                                                            "bg-white/80 border-gray-100 text-gray-500 shadow-sm"
                                                        )}
                                                    >
                                                        {isShopify ? <ShoppingBag size={8} /> : isWP ? <Layout size={8} /> : <Terminal size={8} />}
                                                        {tech}
                                                    </div>
                                                );
                                            })}
                                            {lead.scraped.techStack.length > 3 && (
                                                <div className="px-2 py-0.5 bg-white/50 border border-gray-100 rounded-md text-[8px] font-black text-gray-300 self-center">
                                                    +{lead.scraped.techStack.length - 3} More
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>

                                <div className="flex gap-2">
                                    <Button className="flex-1 py-1.5 text-xs bg-gray-900">View Data</Button>
                                    <Button variant="secondary" className="flex-1 py-1.5 text-xs">Campaign</Button>
                                </div>
                            </div>
                        </div>
                    </Card>
                ))}
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
        </div>
    );
};

export default EnrichedLeads;
