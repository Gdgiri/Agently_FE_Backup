import React, { useEffect, useMemo, useState } from 'react';
import { Card, Button, Badge } from '../../components/shared';
import { cn } from '../../components/ui';
import { 
    Eye, 
    Zap, 
    Send,
    Loader2,
    Sparkles,
    MessageCircle,
    Info,
    ShoppingBag,
    Layout,
    Globe,
    ImageIcon,
    Download,
    ChevronDown,
    FileText
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import LeadScoreBadge from './LeadScoreBadge';
import { useAppDispatch, useAppSelector } from '../../store';
import { fetchLeads } from '../../features/leadSlice';

const BACKEND_URL = import.meta.env.VITE_API_URL?.replace('/api/v1', '') || '';
const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';

export interface LeadTableProps {
    onViewLead?: (lead: any) => void;
    onStartCampaign?: (lead: any) => void;
}

type StatusFilter = 'all' | 'enriched' | 'new' | 'qualified';

/** Return the best available location string from a lead object */
const getLocation = (lead: any): string =>
    lead.location || lead.mlocation || lead.formatted_address || lead.address || lead.city || lead.area || '';

/** Return best available phone entries from a lead object as an array */
const getPhones = (lead: any): string[] => {
    const raw = lead.phone || lead.phone_number || lead.phoneNumber || lead.contact_no || lead.contactNo || lead.mobile || lead.telephone || '';
    if (Array.isArray(raw)) return [...new Set(raw.filter(Boolean))];
    return raw ? [raw] : [];
};

/** Return best available email entries from a lead object as an array */
const getEmails = (lead: any): string[] => {
    const raw = lead.email || '';
    if (Array.isArray(raw)) return [...new Set(raw.filter(Boolean))];
    return raw ? [raw] : [];
};

const LeadTable: React.FC<LeadTableProps> = ({ onViewLead, onStartCampaign }) => {
    const dispatch = useAppDispatch();
    const { leads = [], loading, filters } = useAppSelector(state => state.leads);
    const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
    const [isExportOpen, setIsExportOpen] = useState(false);

    const handleExportCSV = () => {
        if (filteredLeads.length === 0) {
            toast.error('No data to export');
            return;
        }

        const headers = ['Name', 'Website', 'Location', 'Phones', 'Emails', 'Status', 'Score'];
        const csvRows = [
            headers.join(','),
            ...filteredLeads.map(lead => [
                `"${lead.name?.replace(/"/g, '""') || ''}"`,
                `"${lead.website || ''}"`,
                `"${getLocation(lead).replace(/"/g, '""')}"`,
                `"${getPhones(lead).join('; ')}"`,
                `"${getEmails(lead).join('; ')}"`,
                `"${lead.status || ''}"`,
                lead.score || 0
            ].join(','))
        ];

        const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        if (link.download !== undefined) {
            const url = URL.createObjectURL(blob);
            link.setAttribute('href', url);
            link.setAttribute('download', `leads_export_${new Date().toISOString().split('T')[0]}.csv`);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            toast.success('CSV Exported Successfully');
        }
    };

    const handleExportPDF = () => {
        if (filteredLeads.length === 0) {
            toast.error('No data to export');
            return;
        }
        
        toast.loading('Preparing PDF...', { duration: 2000 });
        
        // Simple window.print() based PDF generation for now to avoid large libraries
        const printWindow = window.open('', '_blank');
        if (printWindow) {
            const html = `
                <html>
                    <head>
                        <title>Leads Export - ${new Date().toLocaleDateString()}</title>
                        <style>
                            body { font-family: sans-serif; padding: 20px; }
                            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                            th, td { border: 1px solid #eee; padding: 10px; text-align: left; font-size: 12px; }
                            th { background: #f9fafb; font-weight: bold; text-transform: uppercase; font-size: 10px; }
                            h1 { font-size: 20px; margin-bottom: 5px; }
                            p { font-size: 10px; color: #666; }
                        </style>
                    </head>
                    <body>
                        <h1>Agently Lead Report</h1>
                        <p>Generated on ${new Date().toLocaleString()}</p>
                        <p>Total Leads: ${filteredLeads.length}</p>
                        <table>
                            <thead>
                                <tr>
                                    <th>Lead Name</th>
                                    <th>Location</th>
                                    <th>Phones</th>
                                    <th>Status</th>
                                    <th>Score</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${filteredLeads.map(l => `
                                    <tr>
                                        <td>${l.name || '-'}</td>
                                        <td>${getLocation(l) || '-'}</td>
                                        <td>${getPhones(l).join(', ') || '-'}</td>
                                        <td>${l.status || '-'}</td>
                                        <td>${l.score || 0}</td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </body>
                </html>
            `;
            printWindow.document.write(html);
            printWindow.document.close();
            setTimeout(() => {
                printWindow.print();
                toast.success('PDF Export Ready');
            }, 500);
        }
    };

    useEffect(() => {
        dispatch(fetchLeads());
    }, [dispatch]);

    useEffect(() => {
        if (leads.length > 0) {
            console.log("Lead Table Data Payload:", leads);
        }
    }, [leads]);

    // Count leads per status for the filter tabs (case-insensitive — API may return uppercase)
    const counts = useMemo(() => ({
        all: leads.length,
        enriched: leads.filter(l => l.status?.toLowerCase() === 'enriched').length,
        new: leads.filter(l => l.status?.toLowerCase() === 'new').length,
        qualified: leads.filter(l => l.status?.toLowerCase() === 'qualified').length,
    }), [leads]);

    // Client-side filtering: status + search keyword (name / location / phone)
    const filteredLeads = useMemo(() => {
        let result = leads;

        // Filter by status tab (case-insensitive)
        if (statusFilter !== 'all') {
            result = result.filter(l => l.status?.toLowerCase() === statusFilter);
        }

        // Filter by search keyword
        const q = (filters?.search || '').toLowerCase().trim();
        if (q) {
            result = result.filter(lead => {
                const name     = (lead.name || '').toLowerCase();
                const website  = (lead.website || '').toLowerCase();
                const location = getLocation(lead).toLowerCase();
                const phones   = getPhones(lead).map(p => p.toLowerCase());
                const emails   = getEmails(lead).map(e => e.toLowerCase());
                return name.includes(q) || 
                       website.includes(q) || 
                       location.includes(q) || 
                       phones.some(p => p.includes(q)) ||
                       emails.some(e => e.includes(q));
            });
        }

        return result;
    }, [leads, filters?.search, statusFilter]);

    const statusTabs: { id: StatusFilter; label: string }[] = [
        { id: 'all',       label: `All (${counts.all})` },
        { id: 'enriched',  label: `✨ Enriched (${counts.enriched})` },
        { id: 'new',       label: `New (${counts.new})` },
        { id: 'qualified', label: `Qualified (${counts.qualified})` },
    ];

    return (
        <Card className="overflow-hidden shadow-2xl">
            {/* Header */}
            <div className="p-6 border-b border-gray-100 bg-white">
                {/* Action bar */}
                <div className="flex justify-between items-center mb-4">
                    <div className="flex gap-2 items-center">
                        <Button variant="secondary" className="text-xs px-3 py-1.5 h-auto">Bulk Enrich</Button>
                        <div className="relative">
                            <Button 
                                variant="secondary" 
                                className="text-xs px-3 py-1.5 h-auto flex items-center gap-2"
                                onClick={() => setIsExportOpen(!isExportOpen)}
                            >
                                <Download size={14} /> Export <ChevronDown size={14} className={cn("transition-transform", isExportOpen && "rotate-180")} />
                            </Button>
                            
                            <AnimatePresence>
                                {isExportOpen && (
                                    <>
                                        <div className="fixed inset-0 z-40" onClick={() => setIsExportOpen(false)} />
                                        <motion.div 
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: 10 }}
                                            className="absolute left-0 mt-2 w-40 bg-white border border-gray-100 rounded-xl shadow-2xl z-50 py-2"
                                        >
                                            <button 
                                                className="w-full px-4 py-2 text-left text-[10px] font-black uppercase text-gray-600 hover:bg-gray-50 flex items-center gap-2"
                                                onClick={() => {
                                                    handleExportCSV();
                                                    setIsExportOpen(false);
                                                }}
                                            >
                                                <FileText size={14} className="text-green-600" /> Export CSV
                                            </button>
                                            <button 
                                                className="w-full px-4 py-2 text-left text-[10px] font-black uppercase text-gray-600 hover:bg-gray-50 flex items-center gap-2"
                                                onClick={() => {
                                                    handleExportPDF();
                                                    setIsExportOpen(false);
                                                }}
                                            >
                                                <ImageIcon size={14} className="text-blue-600" /> Export PDF
                                            </button>
                                        </motion.div>
                                    </>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                    <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                        {loading ? 'Refreshing...' : `Showing ${filteredLeads.length} Results`}
                    </div>
                </div>

                {/* Status filter tabs */}
                <div className="flex gap-1">
                    {statusTabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setStatusFilter(tab.id)}
                            className={cn(
                                "px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all",
                                statusFilter === tab.id
                                    ? "bg-gray-900 text-white shadow-lg"
                                    : "text-gray-400 hover:bg-gray-100 hover:text-gray-700"
                            )}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>
            
            <div className="overflow-auto max-h-[700px] w-full block">
                <table className="w-full text-sm text-left">
                    <thead className="bg-gray-50 border-b border-gray-100 sticky top-0 z-10">
                        <tr>
                            <th className="px-6 py-4 font-black text-gray-400 uppercase text-[10px] whitespace-nowrap">Lead Name</th>
                            <th className="px-6 py-4 font-black text-gray-400 uppercase text-[10px] whitespace-nowrap">Location</th>
                            <th className="px-6 py-4 font-black text-gray-400 uppercase text-[10px] whitespace-nowrap">Contact Info</th>
                            <th className="px-6 py-4 font-black text-gray-400 uppercase text-[10px] whitespace-nowrap">AI Score</th>
                            <th className="px-6 py-4 font-black text-gray-400 uppercase text-[10px] whitespace-nowrap">Status</th>
                            <th className="px-6 py-4 font-black text-gray-400 uppercase text-[10px] text-right whitespace-nowrap">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 bg-white">
                        {loading && leads.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="px-6 py-20 text-center">
                                    <div className="flex flex-col items-center gap-2">
                                        <Loader2 className="animate-spin text-[#25D366]" size={32} />
                                        <p className="text-xs font-bold text-gray-400">Loading Intelligence...</p>
                                    </div>
                                </td>
                            </tr>
                        ) : filteredLeads.map(lead => {
                            const locationText = getLocation(lead);
                            const isEnriched   = lead.status?.toLowerCase() === 'enriched';
                            
                            let validPhotos = null;
                            try {
                                const p = typeof (lead as any).photos === 'string' ? JSON.parse((lead as any).photos) : (lead as any).photos;
                                if (Array.isArray(p) && p.length > 0) validPhotos = p;
                            } catch (e) {
                                // ignore parse error
                            }

                            return (
                                <tr key={lead.id} className="hover:bg-gray-50 transition-colors group">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            {validPhotos ? (
                                                <div className="w-10 h-10 rounded-xl overflow-hidden border border-gray-100 shadow-sm shrink-0 bg-gray-50 flex overflow-x-auto snap-x scrollbar-hide">
                                                    {validPhotos.map((photo: any, i: number) => (
                                                        <img 
                                                            key={i}
                                                            src={`https://maps.googleapis.com/maps/api/place/photo?maxwidth=100&photo_reference=${photo.photo_reference}&key=${GOOGLE_MAPS_API_KEY}`}
                                                            alt="Preview" 
                                                            className="w-full h-full object-cover shrink-0 snap-center" 
                                                            loading="lazy"
                                                        />
                                                    ))}
                                                </div>
                                            ) : lead.scraped?.screenshotUrl ? (
                                                <div className="w-10 h-10 rounded-xl overflow-hidden border border-gray-100 shadow-sm shrink-0 bg-gray-50">
                                                    <img 
                                                        src={`${BACKEND_URL}${lead.scraped.screenshotUrl}`} 
                                                        alt="Preview" 
                                                        className="w-full h-full object-cover" 
                                                        loading="lazy"
                                                    />
                                                </div>
                                            ) : (lead as any).icon ? (
                                                <div className="w-10 h-10 rounded-xl overflow-hidden border border-gray-100 bg-white shadow-sm shrink-0 p-1.5 flex items-center justify-center">
                                                    <img 
                                                        src={(lead as any).icon} 
                                                        alt="Icon" 
                                                        className="w-full h-full object-contain opacity-60 flex-shrink-0" 
                                                        loading="lazy"
                                                    />
                                                </div>
                                            ) : (
                                                <div className="w-10 h-10 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center text-gray-300 shrink-0 group-hover:bg-white transition-colors">
                                                    <ImageIcon size={16} />
                                                </div>
                                            )}
                                            <div className="flex flex-col gap-0.5">
                                                <div className="flex items-center gap-2">
                                                    {isEnriched && (
                                                        <span title="Enriched">
                                                            <Sparkles size={12} className="text-[#25D366] shrink-0" />
                                                        </span>
                                                    )}
                                                    <h4 className="font-black text-gray-900 leading-tight flex items-center gap-2">
                                                        {lead.name}
                                                        {lead.scraped?.techStack?.some((t: string) => t.toLowerCase().includes('shopify')) && (
                                                            <ShoppingBag size={12} className="text-[#96bf48]" />
                                                        )}
                                                        {lead.scraped?.techStack?.some((t: string) => t.toLowerCase().includes('wordpress')) && (
                                                            <Layout size={12} className="text-[#21759b]" />
                                                        )}
                                                    </h4>
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
                                                <div className="flex items-center gap-1">
                                                    <p className="text-[10px] text-gray-400 lowercase truncate max-w-[150px]">{lead.website}</p>
                                                    {(getPhones(lead).length > 1 || getEmails(lead).length > 1) && (
                                                        <span title="Verified across Contact, About, and Home pages." className="text-[8px] font-black text-[#25D366] bg-green-50 px-1 rounded flex items-center gap-0.5">
                                                            <Info size={6} /> Deep Crawl
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td
                                        className="px-6 py-4 font-bold text-gray-600 text-xs truncate max-w-[300px]"
                                        title={locationText || undefined}
                                    >
                                        {locationText || '-'}
                                    </td>
                                    <td className="px-6 py-4 font-bold text-gray-600">
                                        <div className="flex flex-wrap gap-1 max-w-[180px]">
                                            {getPhones(lead).map((p, idx) => (
                                                <span key={idx} className="px-2 py-0.5 bg-gray-50 border border-gray-100 rounded-md text-[9px] font-bold text-gray-500 whitespace-nowrap">
                                                    {p}
                                                </span>
                                            ))}
                                            {getPhones(lead).length === 0 && <span className="text-gray-300">-</span>}
                                        </div>
                                        <div className="flex flex-wrap gap-1 max-w-[180px] mt-1">
                                            {getEmails(lead).map((e, idx) => (
                                                <span key={idx} className="px-2 py-0.5 bg-blue-50/50 border border-blue-100/50 rounded-md text-[9px] font-bold text-blue-600 whitespace-nowrap">
                                                    {e}
                                                </span>
                                            ))}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="scale-75 origin-left">
                                            <LeadScoreBadge score={lead.score || 0} size={50} />
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <Badge variant={lead.status === 'qualified' ? 'success' : lead.status === 'enriched' ? 'warning' : 'neutral'}>
                                            {lead.status}
                                        </Badge>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex justify-end gap-1">
                                            <button 
                                                onClick={() => onViewLead?.(lead)}
                                                className="p-2 text-gray-400 hover:text-gray-900 transition-colors"
                                                title="View Details"
                                            >
                                                <Eye size={16} />
                                            </button>
                                            <button 
                                                onClick={() => dispatch(fetchLeads())} 
                                                className="p-2 text-gray-400 hover:text-[#25D366] transition-colors"
                                                title="Enrich Lead"
                                            >
                                                <Zap size={16} />
                                            </button>
                                            <button 
                                                onClick={() => onStartCampaign?.(lead)}
                                                className="p-2 text-gray-400 hover:text-gray-900 transition-colors"
                                                title="Add to Campaign"
                                            >
                                                <Send size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                        {!loading && filteredLeads.length === 0 && (
                            <tr>
                                <td colSpan={6} className="px-6 py-20 text-center">
                                    <div className="flex flex-col items-center gap-3">
                                        <Sparkles size={32} className="text-gray-200" />
                                        <p className="text-sm font-black text-gray-400">
                                            {filters?.search
                                                ? `No leads match "${filters.search}"`
                                                : statusFilter === 'enriched'
                                                    ? 'No enriched leads yet. Select leads in Map View and click "Enrich Selected Leads".'
                                                    : 'No leads found. Start searching on the Map View!'}
                                        </p>
                                    </div>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            <div className="p-4 bg-gray-50 border-t border-gray-100 flex justify-center">
                <div className="flex gap-2">
                    {[1, 2, 3].map(p => (
                        <button key={p} className={cn(
                            "w-8 h-8 rounded-lg text-xs font-black transition-all",
                            p === 1 ? "bg-white shadow-md text-gray-900" : "text-gray-400 hover:bg-gray-200"
                        )}>
                            {p}
                        </button>
                    ))}
                </div>
            </div>

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
        </Card>
    );
};

export default LeadTable;
