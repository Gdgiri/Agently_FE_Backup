import React, { useEffect, useState } from 'react';
import { 
    X, 
    Loader2, 
    Search, 
    Building2, 
    Star, 
    ExternalLink, 
    CheckCircle2,
    Sparkles,
    MessageCircle,
    Info,
    ShoppingBag,
    Layout,
    CheckSquare,
    Square,
    Image as ImageIcon
} from 'lucide-react';
import { Card, Button, Input } from '../../components/shared';
import { leadIntelligenceApi } from '../../lib/api/leadIntelligenceApi';
import { useAppDispatch, useAppSelector } from '../../store';
import { enrichLeads } from '../../features/leadSlice';
import { saveSelectedLeadsToDB } from '../../features/mapSlice';
import { setJobResults, removeJobResult } from '../../features/jobSlice';
import toast from 'react-hot-toast';

const BACKEND_URL = import.meta.env.VITE_API_URL?.replace('/api/v1', '') || '';

interface JobDetailsModalProps {
    isOpen: boolean;
    onClose: () => void;
    jobId: string;
    jobType: string;
}

const JobDetailsModal: React.FC<JobDetailsModalProps> = ({ isOpen, onClose, jobId, jobType }) => {
    const dispatch = useAppDispatch();
    const job = useAppSelector(state => state.jobs.jobs.find(j => j.id === jobId));
    const [leads, setLeads] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedIds, setSelectedIds] = useState<string[]>([]);

    useEffect(() => {
        if (isOpen && jobId) {
            // If we have persistent results, use them!
            if (job?.results && job.results.length > 0) {
                setLeads(job.results);
                setLoading(false);
                return;
            }

            // Otherwise fetch from API
            const fetchLeads = async () => {
                setLoading(true);
                try {
                    const response = await leadIntelligenceApi.getJob(jobId);
                    const data = response.data?.data || response.data;
                    
                    // V3: Results are in data.result
                    const resultLeads = Array.isArray(data.result) ? data.result : (Array.isArray(data) ? data : []);
                    setLeads(resultLeads);
                    
                    // Save results persistently so we don't have to fetch again next time
                    if (resultLeads.length > 0) {
                        dispatch(setJobResults({ id: jobId, results: resultLeads }));
                    }
                } catch (error) {
                    console.error('Failed to fetch job leads', error);
                    toast.error('Failed to load job results');
                } finally {
                    setLoading(false);
                }
            };
            fetchLeads();
        }
    }, [isOpen, jobId, job?.results]);

    // Update local leads state if persistent results change (e.g. from a clear/remove action elsewhere)
    useEffect(() => {
        if (job?.results) {
            setLeads(job.results);
        }
    }, [job?.results]);

    const filteredLeads = leads.filter(l => 
        l.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        l.address?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const toggleSelection = (id: string) => {
        setSelectedIds(prev => 
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    const handleRemoveResult = (e: React.MouseEvent, resultId: string) => {
        e.stopPropagation();
        // Remove from persistent storage
        dispatch(removeJobResult({ jobId, resultId }));
        // Also update local selection if needed
        setSelectedIds(prev => prev.filter(id => id !== resultId));
        toast.success('Removed from history');
    };

    const handleEnrich = async () => {
        if (selectedIds.length === 0) return;
        
        // V3: Get full lead objects for the selected IDs
        const selectedLeads = leads.filter(l => selectedIds.includes(l.pt_id || l.id || l.place_id));
        
        if (selectedLeads.length === 0) {
            toast.error('Selected leads not found in results');
            return;
        }

        toast.loading('Saving and preparing enrichment...', { id: 'modal-enrich' });
        
        try {
            // 1. Save to DB first (Sanitized Storage)
            const saveResult = await dispatch(saveSelectedLeadsToDB(selectedLeads));
            
            if (saveSelectedLeadsToDB.fulfilled.match(saveResult)) {
                // 2. Start Enrichment
                await dispatch(enrichLeads(selectedIds));
                toast.success(`Enrichment started for ${selectedIds.length} lead(s)`, { id: 'modal-enrich' });
                setSelectedIds([]);
            } else {
                toast.error('Failed to save leads for enrichment', { id: 'modal-enrich' });
            }
        } catch (error) {
            toast.error('Failed to start enrichment', { id: 'modal-enrich' });
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm" onClick={onClose} />
            
            <Card className="relative w-full max-w-4xl max-h-[85vh] flex flex-col shadow-2xl border-none overflow-hidden bg-white rounded-[2.5rem]">
                {/* Header */}
                <div className="p-8 border-b border-gray-50 flex items-center justify-between shrink-0">
                    <div>
                        <div className="flex items-center gap-3 mb-1">
                            <span className="px-2 py-0.5 bg-gray-900 text-white text-[8px] font-black uppercase tracking-widest rounded-md">
                                {jobType.replace('_', ' ')}
                            </span>
                            <h3 className="text-xl font-black text-gray-900 leading-none">Job Results</h3>
                        </div>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">ID: {jobId}</p>
                    </div>
                    <button 
                        onClick={onClose}
                        className="p-3 hover:bg-gray-100 rounded-2xl transition-all text-gray-400 hover:text-gray-900 shadow-sm border border-gray-50"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Toolbar */}
                <div className="px-8 py-4 bg-gray-50/50 flex items-center justify-between gap-4 shrink-0">
                    <div className="relative flex-1 max-w-sm">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300" size={14} />
                        <input 
                            type="text" 
                            placeholder="Filter results..." 
                            className="w-full pl-9 pr-4 py-2 bg-white border border-gray-100 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-[#25D366] shadow-sm transition-all"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        {leads.length > 0 && (
                            <Button 
                                variant="secondary" 
                                className="text-[10px] font-black uppercase tracking-widest px-4"
                                onClick={() => setSelectedIds(selectedIds.length === filteredLeads.length ? [] : filteredLeads.map(l => l.id || l.place_id))}
                            >
                                {selectedIds.length === filteredLeads.length ? 'Deselect All' : 'Select All'}
                            </Button>
                        )}
                        <Button 
                            className="bg-[#25D366] text-white text-[10px] font-black uppercase tracking-widest px-6 shadow-lg shadow-green-100"
                            disabled={selectedIds.length === 0}
                            onClick={handleEnrich}
                        >
                            <Sparkles size={14} className="mr-2" />
                            Enrich Selected ({selectedIds.length})
                        </Button>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-8 pt-4 scrollbar-hide min-h-[400px]">
                    {loading ? (
                        <div className="h-full flex flex-col items-center justify-center gap-4 opacity-50">
                            <Loader2 className="animate-spin text-[#25D366]" size={40} />
                            <p className="text-sm font-black text-gray-400 uppercase tracking-[0.2em]">Loading results...</p>
                        </div>
                    ) : filteredLeads.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center gap-4 opacity-30 text-center">
                            <Building2 size={64} className="text-gray-300" />
                            <div>
                                <h4 className="text-lg font-black text-gray-900 uppercase">No leads discovered</h4>
                                <p className="text-sm font-bold text-gray-500 mt-1 italic">This job didn't yield any results or leads were already saved.</p>
                            </div>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {filteredLeads.map((lead) => {
                                const leadId = lead.id || lead.place_id;
                                return (
                                    <div 
                                        key={leadId}
                                        className={`group relative p-5 rounded-3xl border transition-all cursor-pointer ${
                                            selectedIds.includes(leadId) 
                                            ? 'bg-green-50 border-green-200 shadow-md' 
                                            : 'bg-white border-gray-100 hover:border-gray-200 hover:shadow-lg'
                                        }`}
                                        onClick={() => toggleSelection(leadId)}
                                    >
                                        {/* Remove Button */}
                                        <button 
                                            onClick={(e) => handleRemoveResult(e, leadId)}
                                            className="absolute -top-1 -right-1 p-1.5 bg-white border border-gray-100 rounded-full text-gray-400 hover:text-red-500 hover:border-red-100 shadow-sm opacity-0 group-hover:opacity-100 transition-all z-10"
                                        >
                                            <X size={10} />
                                        </button>

                                        <div className="flex gap-4">
                                            <div className={`shrink-0 transition-colors flex flex-col items-center gap-2 ${selectedIds.includes(leadId) ? 'text-[#25D366]' : 'text-gray-200 group-hover:text-gray-400'}`}>
                                                {selectedIds.includes(leadId) ? <CheckSquare size={20} /> : <Square size={20} />}
                                                {lead.scraped?.screenshotUrl ? (
                                                    <div className="w-12 h-12 rounded-xl overflow-hidden border border-gray-100 shadow-sm bg-gray-50">
                                                        <img 
                                                            src={`${BACKEND_URL}${lead.scraped.screenshotUrl}`} 
                                                            alt="" 
                                                            className="w-full h-full object-cover" 
                                                            loading="lazy"
                                                        />
                                                    </div>
                                                ) : (
                                                    <div className="w-12 h-12 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center text-gray-200">
                                                        <ImageIcon size={20} />
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0 space-y-1">
                                                <div className="flex justify-between items-start gap-2">
                                                    <div className="flex items-center gap-2 min-w-0">
                                                        <h4 className="font-black text-gray-900 text-sm truncate uppercase tracking-tight">{lead.name}</h4>
                                                        {lead.scraped?.techStack?.some((t: string) => t.toLowerCase().includes('shopify')) && (
                                                            <ShoppingBag size={12} className="text-[#96bf48]" />
                                                        )}
                                                        {lead.scraped?.techStack?.some((t: string) => t.toLowerCase().includes('wordpress')) && (
                                                            <Layout size={12} className="text-[#21759b]" />
                                                        )}
                                                        {lead.socialLinks?.whatsapp && (
                                                            <a 
                                                                href={lead.socialLinks.whatsapp} 
                                                                target="_blank" 
                                                                rel="noopener noreferrer"
                                                                className="flex items-center gap-1 px-1.5 py-0.5 bg-[#25D366] text-white rounded-md text-[8px] font-black uppercase tracking-tighter shadow-[0_0_10px_rgba(37,211,102,0.4)] animate-whatsapp-pulse hover:scale-105 transition-transform"
                                                                title="WhatsApp Enabled"
                                                                onClick={(e) => e.stopPropagation()}
                                                            >
                                                                <MessageCircle size={8} fill="currentColor" />
                                                                WhatsApp
                                                            </a>
                                                        )}
                                                    </div>
                                                    {lead.rating && (
                                                        <div className="flex items-center gap-1 shrink-0 bg-amber-50 text-amber-600 px-2 py-0.5 rounded-lg text-[10px] font-black">
                                                            {lead.rating} <Star size={10} className="fill-amber-500 text-amber-500" />
                                                        </div>
                                                    )}
                                                </div>
                                                <p className="text-[10px] font-bold text-gray-400 line-clamp-2 leading-relaxed lowercase">{lead.address}</p>
                                                
                                                {/* Contact Info (Phase 1: Deep Crawl Arrays) */}
                                                <div className="flex flex-wrap gap-1.5 mt-2">
                                                    {Array.isArray(lead.phone || lead.phoneNumber) ? (
                                                        (lead.phone || lead.phoneNumber).map((p: string, i: number) => (
                                                            <span key={i} className="px-2 py-0.5 bg-gray-50 border border-gray-100 rounded-md text-[9px] font-bold text-gray-500">
                                                                {p}
                                                            </span>
                                                        ))
                                                    ) : (lead.phone || lead.phoneNumber) && (
                                                        <span className="px-2 py-0.5 bg-gray-50 border border-gray-100 rounded-md text-[9px] font-bold text-gray-500">
                                                            {lead.phone || lead.phoneNumber}
                                                        </span>
                                                    )}

                                                    {Array.isArray(lead.email) ? (
                                                        lead.email.map((e: string, i: number) => (
                                                            <span key={i} className="px-2 py-0.5 bg-blue-50 border border-blue-100 rounded-md text-[9px] font-bold text-blue-600">
                                                                {e}
                                                            </span>
                                                        ))
                                                    ) : lead.email && (
                                                        <span className="px-2 py-0.5 bg-blue-50 border border-blue-100 rounded-md text-[9px] font-bold text-blue-600">
                                                            {lead.email}
                                                        </span>
                                                    )}

                                                    {(Array.isArray(lead.phone || lead.phoneNumber) && (lead.phone || lead.phoneNumber).length > 1) && (
                                                        <span title="Verified across Contact, About, and Home pages." className="px-2 py-0.5 bg-green-50 text-[#25D366] border border-green-100 rounded-md text-[9px] font-black uppercase flex items-center gap-1">
                                                            <Info size={8} /> Deep Crawl
                                                        </span>
                                                    )}
                                                </div>

                                                <div className="flex items-center gap-2 mt-2">
                                                    {lead.website && (
                                                        <span className="p-1 px-2 bg-gray-50 text-gray-400 rounded-md text-[8px] font-black uppercase flex items-center gap-1">
                                                            <ExternalLink size={8} /> {lead.website}
                                                        </span>
                                                    )}
                                                    {lead.category && (
                                                        <span className="p-1 px-2 bg-gray-50 text-gray-500 rounded-md text-[8px] font-black uppercase lowercase">
                                                            {lead.category}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Footer Footer */}
                <div className="p-6 bg-gray-50 text-center shrink-0">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                        Total Results: {filteredLeads.length} {searchQuery && `(Filtered from ${leads.length})`}
                    </p>
                </div>
            </Card>

            <style>{`
                @keyframes whatsapp-pulse {
                    0% { box-shadow: 0 0 0 0 rgba(37, 211, 102, 0.4); }
                    70% { box-shadow: 0 0 0 6px rgba(37, 211, 102, 0); }
                    100% { box-shadow: 0 0 0 0 rgba(37, 211, 102, 0); }
                }
                .animate-whatsapp-pulse {
                    animation: whatsapp-pulse 2s infinite;
                }
            `}</style>
        </div>
    );
};

export default JobDetailsModal;
