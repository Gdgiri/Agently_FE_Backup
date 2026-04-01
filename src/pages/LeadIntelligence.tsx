
import React, { useState, useEffect } from 'react';
import { SectionHeader, Card, Button } from '../components/shared';
import {
    Map as MapIcon,
    List,
    Database,
    Activity,
    Search,
    Filter,
    Plus
} from 'lucide-react';
import { cn } from '../components/ui';

// Lazy load module components
import type { LeadTableProps } from '../modules/lead-intelligence-ui/LeadTable';
import type { LeadDetailsDrawerProps } from '../modules/lead-intelligence-ui/LeadDetailsDrawer';
import type { CampaignModalProps } from '../modules/lead-intelligence-ui/CampaignModal';
const MapLeadView = React.lazy(() => import('../modules/lead-intelligence-ui/MapLeadView'));
const LeadTable = React.lazy(() => import('../modules/lead-intelligence-ui/LeadTable')) as React.LazyExoticComponent<React.FC<LeadTableProps>>;
// EnrichedLeads tab removed — enriched leads are now visible in Lead List with status filter tabs
// EnrichedLeads tab removed — enriched leads are now visible in Lead List with status filter tabs
const JobsDashboard = React.lazy(() => import('../modules/lead-intelligence-ui/JobsDashboard'));
const LeadDetailsDrawer = React.lazy(() => import('../modules/lead-intelligence-ui/LeadDetailsDrawer')) as React.LazyExoticComponent<React.FC<LeadDetailsDrawerProps>>;
const CampaignModal = React.lazy(() => import('../modules/lead-intelligence-ui/CampaignModal')) as React.LazyExoticComponent<React.FC<CampaignModalProps>>;
import { useAppDispatch, useAppSelector } from '../store';
import { fetchLeads, setFilters } from '../features/leadSlice';
import { fetchDiscoveredLeads } from '../features/mapSlice';
import { completeJobsByType } from '../features/jobSlice';
import { socketClient } from '../lib/socket';

import { botStudioApi } from '../lib/api/botStudioApi';
import toast from 'react-hot-toast';

const LeadIntelligence: React.FC = () => {
    const dispatch = useAppDispatch();
    const [activeTab, setActiveTab] = useState<'map' | 'list' | 'jobs'>('map');



    useEffect(() => {
        // Fetch initially
        dispatch(fetchLeads());

        // Setup Socket Listeners
        const socket = socketClient.connect('default'); // Connect to tenant room

        if (socket) {
            socket.on('lead.created', () => {
                dispatch(completeJobsByType('map_search'));
                dispatch(fetchDiscoveredLeads());
            });

            const handleEnrichment = () => {
                dispatch(completeJobsByType('enrich'));
                dispatch(fetchLeads());
            };

            socket.on('lead.enriched', handleEnrichment);
            socket.on('lead.scored', handleEnrichment);
        }

        return () => {
            if (socket) {
                socket.off('lead.created');
                socket.off('lead.enriched');
                socket.off('lead.scored');
            }
        };
    }, [dispatch]);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [isCampaignModalOpen, setIsCampaignModalOpen] = useState(false);
    const [selectedLead, setSelectedLead] = useState<any>(null);

    const handleViewLead = (lead: any) => {
        setSelectedLead(lead);
        setIsDrawerOpen(true);
    };

    const handleStartCampaign = (lead: any) => {
        setSelectedLead(lead);
        setIsCampaignModalOpen(true);
    };

    const tabs: { id: typeof activeTab; label: string; icon: any }[] = [
        { id: 'map', label: 'Map View', icon: MapIcon },
        { id: 'list', label: 'Lead List', icon: List },
        { id: 'jobs', label: 'Jobs / Activity', icon: Activity },
    ];

    return (
        <div className="h-full bg-[#f9fafb] p-4 md:p-6 flex flex-col gap-4 md:gap-6 overflow-hidden">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shrink-0">
                <div>
                    <h2 className="text-xl md:text-2xl font-black text-gray-900 leading-none">Lead Intelligence</h2>
                    <p className="text-[10px] md:text-sm font-bold text-gray-400 mt-2">Discover, enrich, and manage high-potential business leads with AI</p>
                </div>
                <div className="flex flex-wrap items-center gap-2 md:gap-3 w-full sm:w-auto">
                    <div className="relative flex-1 md:w-64 min-w-[200px]">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                        <input
                            type="text"
                            placeholder="Search keywords, locations, contact..."
                            className="w-full pl-10 pr-4 py-2 bg-white border border-gray-100 rounded-xl text-sm focus:ring-2 focus:ring-[#25D366] outline-none shadow-sm"
                            onChange={(e) => dispatch(setFilters({ search: e.target.value }))}
                        />
                    </div>
                    <Button variant="secondary" className="shadow-sm px-3 md:px-4 py-2 h-auto text-[10px] md:text-xs">
                        <Filter size={14} /> <span className="hidden sm:inline">Filters</span>
                    </Button>
                    <Button className="bg-gray-900 text-white shadow-xl px-3 md:px-4 py-2 h-auto text-[10px] md:text-xs">
                        <Plus size={14} /> <span className="hidden sm:inline">Start Search</span><span className="sm:hidden">Search</span>
                    </Button>
                </div>
            </div>

            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shrink-0">
                <div className="flex gap-1 p-1 bg-gray-100 rounded-2xl w-full sm:w-fit overflow-x-auto scrollbar-hide">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={cn(
                                "px-4 md:px-6 py-2 rounded-xl text-[10px] md:text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2 shrink-0",
                                activeTab === tab.id ? "bg-white text-gray-900 shadow-lg shadow-gray-200/50" : "text-gray-400 hover:text-gray-600"
                            )}
                        >
                            <tab.icon size={14} /> <span className={cn(activeTab === tab.id ? "inline" : "hidden sm:inline")}>{tab.label}</span>
                        </button>
                    ))}
                </div>


            </div>

            <div className={cn(
                "flex-1 flex flex-col min-h-0",
                activeTab === 'map' ? "overflow-hidden" : "overflow-y-auto"
            )}>
                <React.Suspense fallback={
                    <div className="flex-1 flex items-center justify-center">
                        <div className="w-10 h-10 border-4 border-[#25D366] border-t-transparent rounded-full animate-spin" />
                    </div>
                }>
                    {activeTab === 'map' && <div className="flex-1 relative min-h-0"><MapLeadView /></div>}
                    {activeTab === 'list' && (
                        <LeadTable
                            onViewLead={handleViewLead}
                            onStartCampaign={handleStartCampaign}
                        />
                    )}
                    {activeTab === 'jobs' && <JobsDashboard />}
                </React.Suspense>
            </div>

            {/* Interactive Components */}
            <React.Suspense fallback={null}>
                <LeadDetailsDrawer
                    isOpen={isDrawerOpen}
                    onClose={() => setIsDrawerOpen(false)}
                    lead={selectedLead}
                />
                <CampaignModal
                    isOpen={isCampaignModalOpen}
                    onClose={() => setIsCampaignModalOpen(false)}
                    lead={selectedLead}
                />
            </React.Suspense>
        </div>
    );
};

export default LeadIntelligence;
