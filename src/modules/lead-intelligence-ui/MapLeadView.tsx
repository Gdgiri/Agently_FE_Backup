import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { Card, Button, Input, Badge } from '../../components/shared';
import {
    Layers,
    MapPin,
    Search,
    Navigation,
    Loader2,
    Star,
    Sparkles,
    Building2,
    ExternalLink,
    RefreshCw,
    CheckSquare,
    Square,
    X as CloseIcon,
    Trash2,
    ArrowRight,
    MessageCircle,
    Info,
    Eye,
    ShoppingBag,
    Layout,
    Image as ImageIcon,
    History,
    Clock,
    Phone,
    Mail,
    Globe
} from 'lucide-react';
import { cn } from '../../components/ui';
import { useAppDispatch, useAppSelector } from '../../store';
import { enrichLeads, fetchLeads, setFilters } from '../../features/leadSlice';
import {
    searchMap,
    setSearchParams,
    setActivePinId,
    setActiveJobId,
    fetchDiscoveredLeads,
    fetchJobResults,
    saveSelectedLeadsToDB,
    toggleDiscoveredLeadSelection,
    selectAllDiscoveredLeads,
    deselectAllDiscoveredLeads,
    removeDiscoveredLead
} from '../../features/mapSlice';
import { completeJobsByType, setJobResults, removeJobResult, updateJob } from '../../features/jobSlice';
import toast from 'react-hot-toast';
import Autocomplete from 'react-google-autocomplete';

// Google Maps imports
import { GoogleMap, useJsApiLoader, MarkerF, InfoWindowF } from '@react-google-maps/api';

const mapOptions = {
    disableDefaultUI: false,
    zoomControl: true,
    streetViewControl: false,
    mapTypeControl: false,
    fullscreenControl: true,
};

const BACKEND_URL = import.meta.env.VITE_API_URL?.replace('/api/v1', '') || '';
const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';
const mapContainerStyle = {
    width: '100%',
    height: '100%',
};

const MapLeadView: React.FC = () => {
    const dispatch = useAppDispatch();
    const {
        searchParams,
        loading,
        discoveredLeads = [],
        selectedDiscoveredIds = [],
        activePinId,
        activeJobId
    } = useAppSelector(state => state.map);

    const jobs = useAppSelector(state => state.jobs.jobs);
    const activeJob = jobs.find(j => j.id === activeJobId);
    const isJobLoading = loading || (activeJobId && activeJob && (activeJob.status === 'running' || activeJob.status === 'pending'));

    const { isLoaded } = useJsApiLoader({
        id: 'google-map-script',
        googleMapsApiKey: GOOGLE_MAPS_API_KEY,
        libraries: ['places']
    });

    const [map, setMap] = useState<google.maps.Map | null>(null);
    const [showHistory, setShowHistory] = useState(false);
    const [showFilters, setShowFilters] = useState(false);
    const [showResults, setShowResults] = useState(false);

    const onMapLoad = useCallback((map: google.maps.Map) => {
        setMap(map);
    }, []);

    React.useEffect(() => {
        dispatch(fetchDiscoveredLeads());
    }, [dispatch]);

    // Sync map with active pin or updated leads
    React.useEffect(() => {
        if (map && discoveredLeads.length > 0) {
            const bounds = new google.maps.LatLngBounds();
            let hasPoints = false;
            discoveredLeads.forEach(lead => {
                const lat = lead.latitude || lead.lat || lead.geometry?.location?.lat || lead.location?.lat;
                const lng = lead.longitude || lead.lng || lead.geometry?.location?.lng || lead.location?.lng;
                if (lat && lng) {
                    bounds.extend({ lat: Number(lat), lng: Number(lng) });
                    hasPoints = true;
                }
            });
            if (hasPoints) {
                map.fitBounds(bounds);
                // Don't zoom in too far for a single point
                if (discoveredLeads.length === 1) map.setZoom(15);
            }
        }
    }, [discoveredLeads, map]);

    React.useEffect(() => {
        if (map && activePinId) {
            const activeLead = discoveredLeads.find(l => (l.id === activePinId || l.place_id === activePinId));
            if (activeLead) {
                const lat = activeLead.latitude || activeLead.lat || activeLead.geometry?.location?.lat || activeLead.location?.lat;
                const lng = activeLead.longitude || activeLead.lng || activeLead.geometry?.location?.lng || activeLead.location?.lng;
                if (lat && lng) {
                    map.panTo({ lat: Number(lat), lng: Number(lng) });
                    map.setZoom(17);
                }
            }
        }
    }, [activePinId, map, discoveredLeads]);

    useEffect(() => {
        let pollInterval: NodeJS.Timeout | null = null;

        if (activeJobId && activeJob && (activeJob.status === 'running' || activeJob.status === 'pending')) {
            pollInterval = setInterval(async () => {
                const jobResult = await dispatch(fetchJobResults(activeJobId));
                if (fetchJobResults.fulfilled.match(jobResult)) {
                    if (pollInterval) clearInterval(pollInterval);
                    dispatch(completeJobsByType('map_search'));
                    dispatch(updateJob({ id: activeJobId, status: 'completed', progress: 100 }));
                    dispatch(setJobResults({ id: activeJobId, results: jobResult.payload }));
                    console.log("Map Search Results:", jobResult.payload);
                    toast.success(`Found ${jobResult.payload.length} leads!`);
                } else if (fetchJobResults.rejected.match(jobResult) && jobResult.payload !== 'Job still in progress') {
                    if (pollInterval) clearInterval(pollInterval);
                }
            }, 3000);
        }

        return () => {
            if (pollInterval) clearInterval(pollInterval);
        };
    }, [loading, activeJobId, dispatch]);

    const handleSearch = async () => {
        if (!searchParams.query || !searchParams.location) {
            toast.error('Please enter both query and location');
            return;
        }
        const apiPayload = {
            ...searchParams,
            radius: searchParams.radius * 1000
        };

        console.log("API", apiPayload);
        console.log('--- MAP SEARCH FILTERS ---');
        console.log('Has Email:', searchParams.hasEmail);
        console.log('Has Phone:', searchParams.hasPhone);
        console.log('Has Website:', searchParams.hasWebsite);
        console.log('---------------------------');

        const result = await dispatch(searchMap(apiPayload));
        if (searchMap.fulfilled.match(result)) {
            toast.success('Search job queued!');
        }
    };

    const handleEnrichSelected = async () => {
        if (selectedDiscoveredIds.length === 0) {
            toast.error('Please select at least one lead to enrich');
            return;
        }

        // V3: Filter selected leads from the discovered list
        const selectedLeads = discoveredLeads.filter(l =>
            selectedDiscoveredIds.includes(l.id || l.place_id)
        );

        if (selectedLeads.length === 0) return;

        console.log("Enrich Selected Payload:", selectedLeads);

        toast.loading('Saving and preparing enrichment...', { id: 'enrich-status' });

        // 1. Save to DB (Sanitized Storage)
        const saveResult = await dispatch(saveSelectedLeadsToDB(selectedLeads));

        if (saveSelectedLeadsToDB.fulfilled.match(saveResult)) {
            // 2. Start Enrichment
            await dispatch(enrichLeads(selectedDiscoveredIds));
            toast.success(`Enrichment job queued for ${selectedDiscoveredIds.length} lead(s).`, { id: 'enrich-status' });
            dispatch(deselectAllDiscoveredLeads());

            setTimeout(() => {
                dispatch(completeJobsByType('enrich'));
                dispatch(fetchLeads()); // Refresh the main lead table
            }, 10000);
        } else {
            toast.error('Failed to save leads for enrichment', { id: 'enrich-status' });
        }
    };

    const handleRemoveLead = (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        dispatch(removeDiscoveredLead(id));
        if (activeJobId) {
            dispatch(removeJobResult({ jobId: activeJobId, resultId: id }));
        }
        toast.success('Lead removed from list');
    };

    const handleLoadHistory = async (job: any) => {
        console.log("Loading History Job:", job.id);
        
        // 1. Set active job context
        dispatch(setActiveJobId(job.id));
        
        // 2. Update search params to match history item
        if (job.params) {
            dispatch(setSearchParams(job.params));
        }
        
        // 3. Explicitly fetch results for this jobId
        const result = await dispatch(fetchJobResults(job.id));
        
        if (fetchJobResults.fulfilled.match(result)) {
            toast.success(`Loaded ${result.payload.length} results from history`);
        } else {
            toast.error("Failed to load history results");
        }
        
        setShowHistory(false);
    };

    const displayLeads = discoveredLeads ? [...discoveredLeads].reverse() : [];

    if (!isLoaded || !GOOGLE_MAPS_API_KEY) {
        return (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-50/50 backdrop-blur-sm">
                <div className="flex flex-col items-center gap-4 p-8 bg-white rounded-3xl shadow-2xl border border-red-50 max-w-md text-center">
                    {!GOOGLE_MAPS_API_KEY ? (
                        <>
                            <div className="h-16 w-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-2">
                                <Info size={32} />
                            </div>
                            <h3 className="text-lg font-black text-gray-900 leading-tight uppercase tracking-tight">Missing Maps API Key</h3>
                            <p className="text-xs font-bold text-gray-500 leading-relaxed">
                                Google Maps requires a valid API key to function. Please add <code className="bg-gray-100 px-1.5 py-0.5 rounded text-red-500">VITE_GOOGLE_MAPS_API_KEY</code> to your <code className="bg-gray-100 px-1.5 py-0.5 rounded">.env</code> file and restart the server.
                            </p>
                            <Button 
                                variant="secondary" 
                                className="mt-4 text-[10px] font-black uppercase"
                                onClick={() => window.open('https://developers.google.com/maps/documentation/javascript/get-api-key', '_blank')}
                            >
                                Get API Key <ExternalLink size={12} className="ml-2" />
                            </Button>
                        </>
                    ) : (
                        <>
                            <Loader2 className="animate-spin text-[#25D366]" size={40} />
                            <p className="text-sm font-black text-gray-500 uppercase tracking-widest">Initialising Discovery Network...</p>
                        </>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div className="flex-1 flex flex-col sm:flex-row gap-4 min-h-0 h-full relative">
            {/* Mobile Toggles Bar */}
            <div className="sm:hidden flex items-center justify-between p-2 bg-white rounded-2xl shadow-sm border border-gray-100 shrink-0 mx-1 mb-2">
                <button 
                    onClick={() => { setShowFilters(!showFilters); setShowResults(false); }}
                    className={cn(
                        "flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-[10px] font-black uppercase transition-all",
                        showFilters ? "bg-gray-900 text-white" : "text-gray-500 hover:bg-gray-50"
                    )}
                >
                    <Search size={14} /> Filters
                </button>
                <div className="w-px h-6 bg-gray-100 mx-2" />
                <button 
                    onClick={() => { setShowResults(!showResults); setShowFilters(false); }}
                    className={cn(
                        "flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-[10px] font-black uppercase transition-all",
                        showResults ? "bg-[#25D366] text-white" : "text-gray-500 hover:bg-gray-50"
                    )}
                >
                    <Layout size={14} /> Results ({displayLeads.length})
                </button>
            </div>

            {/* Left Sidebar: Search & Filters */}
            <div className={cn(
                "sm:w-[260px] md:w-[280px] lg:w-[320px] h-full shrink-0 transition-all duration-300 z-40 bg-white sm:bg-transparent sm:static absolute inset-y-0 left-0 shadow-2xl sm:shadow-none",
                showFilters ? "translate-x-0" : "-translate-x-full sm:translate-x-0"
            )}>
                <Card className="h-full flex flex-col shadow-xl border-none overflow-hidden bg-white sm:rounded-[2rem]">
                    <div className="p-4 sm:p-6 pb-2 shrink-0 flex items-center justify-between">
                        <div>
                            <h4 className="text-[10px] font-black uppercase text-gray-400 tracking-widest mb-1">Discovery Engine</h4>
                            <p className="text-[9px] font-bold text-gray-400">Configure your ideal lead profile</p>
                        </div>
                        <div className="flex items-center gap-2">
                            <button 
                                onClick={() => setShowHistory(true)}
                                className="p-2 hover:bg-gray-50 rounded-xl text-gray-400 hover:text-[#25D366] transition-all"
                                title="Search History"
                            >
                                <History size={16} />
                            </button>
                            <button 
                                onClick={() => setShowFilters(false)}
                                className="sm:hidden p-2 hover:bg-gray-50 rounded-xl text-gray-400"
                            >
                                <CloseIcon size={16} />
                            </button>
                        </div>
                    </div>
                
                <div className="flex-1 overflow-y-auto p-6 pt-2 scrollbar-hide">
                    <div className="space-y-6">
                        <Input
                            label="What kind of business?"
                            placeholder="e.g. Electric scooter showroom"
                            value={searchParams.query}
                            onChange={(e) => dispatch(setSearchParams({ query: e.target.value }))}
                        />
                        <div className="flex flex-col gap-1.5">
                            <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Target Location</label>
                            <div className="relative flex items-center bg-gray-50 border border-gray-100 rounded-2xl overflow-hidden focus-within:ring-2 focus-within:ring-[#25D366] transition-all">
                                <Autocomplete
                                    apiKey={GOOGLE_MAPS_API_KEY}
                                    onPlaceSelected={(place) => {
                                        if (place) {
                                            dispatch(setSearchParams({ location: place.formatted_address || place.name || '' }));
                                        }
                                    }}
                                    defaultValue={searchParams.location}
                                    className="w-full bg-transparent px-4 py-3.5 text-xs focus:outline-none placeholder:text-gray-300 font-bold text-gray-900"
                                    placeholder="City, area or address..."
                                />
                            </div>
                        </div>

                        <div>
                            <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest flex justify-between items-center mb-4">
                                <span>Radius ({searchParams.radius}km)</span>
                            </label>
                            <input
                                type="range"
                                min="1"
                                max="50"
                                value={searchParams.radius}
                                onChange={(e) => dispatch(setSearchParams({ radius: parseInt(e.target.value) }))}
                                className="w-full h-1.5 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-[#25D366]"
                            />
                        </div>

                        <label className="flex items-center gap-3 cursor-pointer p-4 bg-gray-50 rounded-2xl border border-gray-100 hover:border-[#25D366] transition-all shadow-sm">
                            <div className={`relative w-8 h-4 rounded-full transition-colors flex-shrink-0 ${searchParams.autoEnrich ? 'bg-[#25D366]' : 'bg-gray-200'}`}>
                                <div className={`absolute top-0.5 left-0.5 w-3 h-3 bg-white rounded-full transition-transform ${searchParams.autoEnrich ? 'translate-x-4' : 'translate-x-0'}`} />
                            </div>
                            <div className="flex flex-col flex-1">
                                <span className="text-[10px] font-black text-gray-800 tracking-wide flex items-center gap-1">
                                    <Sparkles size={10} className={searchParams.autoEnrich ? "text-[#25D366]" : "text-gray-400"} />
                                    Auto-Pilot
                                </span>
                            </div>
                            <input
                                type="checkbox"
                                className="hidden"
                                checked={searchParams.autoEnrich}
                                onChange={(e) => dispatch(setSearchParams({ autoEnrich: e.target.checked }))}
                            />
                        </label>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest mb-2 block">Quick Filters</label>
                            {[
                                { label: 'Has Email', key: 'hasEmail' },
                                { label: 'Has Phone', key: 'hasPhone' },
                                { label: 'Has Website', key: 'hasWebsite' }
                            ].map((filter) => (
                                <label key={filter.key} className="flex items-center justify-between p-3 bg-gray-50/50 rounded-xl border border-gray-100 cursor-pointer hover:border-gray-200 transition-all">
                                    <span className="text-[10px] font-bold text-gray-600 uppercase tracking-tight">{filter.label}</span>
                                    <div className={`relative w-7 h-3.5 rounded-full transition-colors ${searchParams[filter.key as keyof typeof searchParams] ? 'bg-[#25D366]' : 'bg-gray-200'}`}>
                                        <div className={`absolute top-0.5 left-0.5 w-2.5 h-2.5 bg-white rounded-full transition-transform ${searchParams[filter.key as keyof typeof searchParams] ? 'translate-x-3.5' : 'translate-x-0'}`} />
                                    </div>
                                    <input
                                        type="checkbox"
                                        className="hidden"
                                        checked={!!searchParams[filter.key as keyof typeof searchParams]}
                                        onChange={(e) => dispatch(setSearchParams({ [filter.key]: e.target.checked }))}
                                    />
                                </label>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="p-6 border-t border-gray-50 bg-white shadow-[0_-10px_20px_rgba(0,0,0,0.02)]">
                    <Button
                        className="w-full py-4 bg-gray-900 hover:bg-black text-white rounded-2xl shadow-xl shadow-gray-200 font-black text-[10px] uppercase tracking-widest"
                        onClick={() => { handleSearch(); if (window.innerWidth < 768) setShowFilters(false); }} 
                        disabled={isJobLoading}
                    >
                        {isJobLoading ? <Loader2 className="animate-spin mr-2" size={14} /> : <Search className="mr-2" size={14} />}
                        {isJobLoading ? 'Searching...' : 'Explore Area'}
                    </Button>
                </div>
                </Card>
            </div>

            {/* Center: Google Map */}
            <div className="flex-1 bg-white sm:rounded-[2rem] overflow-hidden relative shadow-2xl border border-gray-100 min-h-[400px] sm:min-h-0">
                {isJobLoading && (
                    <div className="absolute inset-0 z-20 bg-white/60 backdrop-blur-[2px] flex items-center justify-center">
                        <div className="flex flex-col items-center gap-4 p-8 bg-white/90 rounded-[2rem] shadow-2xl border border-white/50 border-t-[#25D366] border-t-4">
                            <div className="w-12 h-12 border-4 border-[#25D366] border-t-transparent rounded-full animate-spin" />
                            <p className="text-[10px] font-black uppercase tracking-widest text-[#25D366] animate-pulse text-center">
                                Scanning Local Area for Intelligence...
                            </p>
                        </div>
                    </div>
                )}
                <GoogleMap
                    mapContainerStyle={{ width: '100%', height: '100%' }}
                    zoom={12}
                    center={{ lat: 10.787, lng: 79.1378 }} // Thanjavur default
                    options={mapOptions}
                    onLoad={onMapLoad}
                    onClick={() => dispatch(setActivePinId(null))}
                >
                    {displayLeads.map((lead: any) => {
                        const lat = Number(lead.latitude || lead.lat || lead.geometry?.location?.lat || lead.location?.lat);
                        const lng = Number(lead.longitude || lead.lng || lead.geometry?.location?.lng || lead.location?.lng);
                        if (!lat || !lng) return null;

                        const position = { lat, lng };
                        const id = lead.id || lead.place_id;

                        return (
                            <MarkerF
                                key={id}
                                position={position}
                                onClick={() => dispatch(setActivePinId(id))}
                                icon={(activePinId === id) ? {
                                    url: 'http://maps.google.com/mapfiles/ms/icons/green-dot.png'
                                } : undefined}
                            >
                                {activePinId === id && (
                                    <InfoWindowF
                                        position={position}
                                        onCloseClick={() => dispatch(setActivePinId(null))}
                                    >
                                        <div className="p-0 overflow-hidden w-[240px] flex flex-col">
                                            {/* Header with Background/Image */}
                                            <div className="relative h-20 bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center overflow-hidden">
                                                {lead.photos && lead.photos.length > 0 ? (
                                                    <div className="flex overflow-x-auto snap-x w-full h-full scrollbar-hide">
                                                        {lead.photos.map((photo: any, i: number) => (
                                                            <img 
                                                                key={i}
                                                                src={`https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photo_reference=${photo.photo_reference}&key=${GOOGLE_MAPS_API_KEY}`}
                                                                alt={`${lead.name} photo ${i + 1}`}
                                                                className="w-full h-full object-cover shrink-0 snap-center opacity-80" 
                                                                loading="lazy"
                                                            />
                                                        ))}
                                                    </div>
                                                ) : lead.scraped?.screenshotUrl ? (
                                                    <img 
                                                        src={`${BACKEND_URL}${lead.scraped.screenshotUrl}`} 
                                                        alt={lead.name}
                                                        className="w-full h-full object-cover opacity-60 transition-all hover:scale-110 duration-500" 
                                                    />
                                                ) : (
                                                    <div className="flex flex-col items-center gap-2 text-white/20 uppercase tracking-[0.2em]">
                                                        <Building2 size={32} />
                                                        <span className="text-[8px] font-black">Lead Intelligence</span>
                                                    </div>
                                                )}
                                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />
                                                <div className="absolute bottom-3 left-4 right-4">
                                                    <h3 className="text-white font-black text-xs uppercase tracking-tight leading-tight line-clamp-1">
                                                        {lead.name}
                                                    </h3>
                                                </div>
                                            </div>

                                            <div className="p-3 space-y-3">
                                                {/* Intelligence Row */}
                                                <div className="flex items-center gap-3">
                                                    <div className="flex -space-x-1.5">
                                                        {(lead.socialLinks?.whatsapp || lead.whatsapp) && (
                                                            <div className="w-6 h-6 rounded-full bg-[#25D366] border-2 border-white flex items-center justify-center text-white shadow-sm" title="WhatsApp Active">
                                                                <MessageCircle size={10} fill="currentColor" />
                                                            </div>
                                                        )}
                                                        {(lead.scraped?.email || lead.email) && (
                                                            <div className="w-6 h-6 rounded-full bg-blue-500 border-2 border-white flex items-center justify-center text-white shadow-sm" title="Email Available">
                                                                <Mail size={10} />
                                                            </div>
                                                        )}
                                                        {(lead.international_phone_number || lead.formatted_phone_number || lead.phone) && (
                                                            <div className="w-6 h-6 rounded-full bg-gray-900 border-2 border-white flex items-center justify-center text-white shadow-sm" title="Phone Verified">
                                                                <Phone size={10} />
                                                            </div>
                                                        )}
                                                        {(lead.website || lead.scraped?.website) && (
                                                            <div className="w-6 h-6 rounded-full bg-indigo-500 border-2 border-white flex items-center justify-center text-white shadow-sm" title="Website Online">
                                                                <Globe size={10} />
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="h-4 w-[1px] bg-gray-100" />
                                                    {lead.rating && (
                                                        <div className="flex items-center gap-0.5 bg-amber-50 text-amber-600 px-1.5 py-0.5 rounded-full text-[9px] font-black">
                                                            {lead.rating} <Star size={8} className="fill-amber-500 text-amber-500" />
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Details List */}
                                                <div className="space-y-2 text-[9px] font-bold text-gray-500 leading-normal">
                                                    {(lead.formatted_address || lead.vicinity || lead.address) && (
                                                        <div className="flex items-start gap-2">
                                                            <MapPin size={10} className="shrink-0 text-gray-400" />
                                                            <span className="line-clamp-3">{lead.formatted_address || lead.vicinity || lead.address}</span>
                                                        </div>
                                                    )}
                                                    {(lead.international_phone_number || lead.formatted_phone_number || lead.phone) && (
                                                        <a 
                                                            href={`tel:${lead.international_phone_number || lead.formatted_phone_number || lead.phone}`}
                                                            className="flex items-center gap-2 text-[#25D366] hover:underline transition-all"
                                                            onClick={e => e.stopPropagation()}
                                                        >
                                                            <Phone size={10} />
                                                            <span>{lead.international_phone_number || lead.formatted_phone_number || lead.phone}</span>
                                                        </a>
                                                    )}
                                                </div>

                                                {/* Modern Footer Actions */}
                                                <div className="pt-4 border-t border-gray-50 flex items-center justify-between gap-3">
                                                    <div className="flex items-center gap-2">
                                                        <a 
                                                            href={`https://www.google.com/maps/search/?api=1&query=${lat},${lng}&query_place_id=${lead.place_id || lead.id}`}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="text-blue-500 hover:text-blue-600 text-[10px] font-black flex items-center gap-1.5 transition-all group/link"
                                                            onClick={e => e.stopPropagation()}
                                                        >
                                                            <span>View Map</span>
                                                            <ExternalLink size={10} className="group-hover/link:translate-x-0.5 transition-transform" />
                                                        </a>
                                                        {(lead.website || lead.scraped?.website) && (
                                                            <>
                                                                <div className="w-1 h-1 bg-gray-200 rounded-full" />
                                                                <a 
                                                                    href={lead.website || lead.scraped?.website}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    className="text-indigo-500 hover:text-indigo-600 text-[10px] font-black flex items-center gap-1.5 transition-all"
                                                                    onClick={e => e.stopPropagation()}
                                                                >
                                                                    <span>Visit Site</span>
                                                                    <Globe size={10} />
                                                                </a>
                                                            </>
                                                        )}
                                                    </div>
                                                </div>

                                                <Button
                                                    className={`w-full py-2.5 text-[10px] font-black uppercase tracking-widest transition-all ${
                                                        selectedDiscoveredIds.includes(id) 
                                                            ? 'bg-gray-100 text-gray-400 hover:bg-gray-200' 
                                                            : 'bg-[#25D366] text-white hover:bg-[#1fad53] shadow-lg shadow-green-100/50'
                                                    }`}
                                                    onClick={() => dispatch(toggleDiscoveredLeadSelection(id))}
                                                >
                                                    {selectedDiscoveredIds.includes(id) ? (
                                                        <span className="flex items-center gap-2"><CheckSquare size={12} /> Lead Selected</span>
                                                    ) : (
                                                        'Select Lead'
                                                    )}
                                                </Button>
                                            </div>
                                        </div>
                                    </InfoWindowF>
                                )}
                            </MarkerF>
                        );
                    })}
                </GoogleMap>
            </div>

            {/* Right Sidebar: Discovered Results */}
            <div className={cn(
                "w-[260px] md:w-[300px] lg:w-[380px] h-full shrink-0 transition-all duration-300 z-40 bg-white sm:bg-transparent sm:static absolute inset-y-0 right-0 shadow-2xl sm:shadow-none",
                showResults ? "translate-x-0" : "translate-x-full sm:translate-x-0"
            )}>
                <Card className="h-full flex flex-col shadow-xl border-none overflow-hidden bg-white sm:rounded-[2rem]">
                    <div className="p-4 sm:p-6 border-b border-gray-50 shrink-0">
                        <div className="flex items-center justify-between">
                            <div>
                                <h4 className="text-[10px] font-black uppercase text-gray-400 tracking-widest mb-1">Discovered Results</h4>
                                <p className="text-[10px] font-bold text-gray-900">{displayLeads.length} leads found</p>
                            </div>
                            <div className="flex gap-2">
                                <button onClick={() => dispatch(fetchDiscoveredLeads())} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
                                    <RefreshCw size={14} className={loading ? "animate-spin text-gray-400" : "text-gray-900"} />
                                </button>
                                {displayLeads.length > 0 && (
                                    <button
                                        onClick={() => selectedDiscoveredIds.length === displayLeads.length ? dispatch(deselectAllDiscoveredLeads()) : dispatch(selectAllDiscoveredLeads(displayLeads.map((l: any) => l.id)))}
                                        className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
                                    >
                                        {selectedDiscoveredIds.length === displayLeads.length ? <CheckSquare size={14} className="text-[#25D366]" /> : <Square size={14} className="text-gray-400" />}
                                    </button>
                                )}
                                <button 
                                    onClick={() => setShowResults(false)}
                                    className="sm:hidden p-2 hover:bg-gray-50 rounded-xl text-gray-400"
                                >
                                    <CloseIcon size={16} />
                                </button>
                            </div>
                        </div>
                    </div>

                <div className="flex-1 overflow-y-auto p-6 scrollbar-hide space-y-3">
                    {displayLeads.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center opacity-30 text-center px-6">
                            <Building2 size={40} className="mb-4" />
                            <p className="text-xs font-black uppercase tracking-widest">No discovered leads</p>
                            <p className="text-[10px] font-bold mt-2">Run a search to populate this list.</p>
                        </div>
                    ) : (
                        displayLeads.map((lead: any) => {
                            const isSelected = selectedDiscoveredIds.includes(lead.id || lead.place_id);
                            const isActive = activePinId === lead.id;
                            return (
                                <div
                                    key={lead.id}
                                    className={`group relative p-4 rounded-2xl border transition-all cursor-pointer ${isActive
                                            ? 'bg-blue-50 border-blue-200 shadow-lg'
                                            : isSelected
                                                ? 'bg-green-50/50 border-green-200'
                                                : 'bg-white border-gray-100 hover:border-gray-200 hover:shadow-md'
                                        }`}
                                    onClick={() => dispatch(setActivePinId(lead.id || lead.place_id))}
                                >
                                    <button
                                        onClick={(e) => handleRemoveLead(e, lead.id || lead.place_id)}
                                        className="absolute -top-1 -right-1 p-1.5 bg-white border border-gray-100 rounded-full text-gray-400 hover:text-red-500 hover:border-red-100 shadow-sm opacity-0 group-hover:opacity-100 transition-all z-10"
                                    >
                                        <CloseIcon size={10} />
                                    </button>

                                    <div className="flex gap-4 items-center">
                                        <div className="shrink-0 relative">
                                            {lead.photos && lead.photos.length > 0 ? (
                                                <div className="w-14 h-14 rounded-2xl overflow-hidden border-2 border-white shadow-xl bg-gray-50 flex overflow-x-auto snap-x scrollbar-hide">
                                                    {lead.photos.map((photo: any, i: number) => (
                                                        <img 
                                                            key={i}
                                                            src={`https://maps.googleapis.com/maps/api/place/photo?maxwidth=100&photo_reference=${photo.photo_reference}&key=${GOOGLE_MAPS_API_KEY}`}
                                                            alt="" 
                                                            className="w-full h-full object-cover shrink-0 snap-center group-hover:scale-110 transition-transform duration-500" 
                                                            loading="lazy"
                                                        />
                                                    ))}
                                                </div>
                                            ) : lead.scraped?.screenshotUrl ? (
                                                <div className="w-14 h-14 rounded-2xl overflow-hidden border-2 border-white shadow-xl bg-gray-50 group-hover:scale-110 transition-transform duration-500">
                                                    <img 
                                                        src={`${BACKEND_URL}${lead.scraped.screenshotUrl}`} 
                                                        alt="" 
                                                        className="w-full h-full object-cover" 
                                                        loading="lazy"
                                                    />
                                                </div>
                                            ) : lead.icon ? (
                                                <div className="w-14 h-14 rounded-2xl overflow-hidden border border-gray-100 bg-white p-2">
                                                    <img 
                                                        src={lead.icon} 
                                                        alt="" 
                                                        className="w-full h-full object-contain opacity-60" 
                                                        loading="lazy"
                                                    />
                                                </div>
                                            ) : (
                                                <div className={`w-14 h-14 rounded-2xl border flex items-center justify-center transition-all ${isSelected ? 'border-green-200 bg-white shadow-green-100/50 shadow-lg' : 'border-gray-100 bg-gray-50'}`}>
                                                    <ImageIcon size={24} className="text-gray-200" />
                                                </div>
                                            )}
                                            <button
                                                onClick={(e) => { e.stopPropagation(); dispatch(toggleDiscoveredLeadSelection(lead.id || lead.place_id)); }}
                                                className={`absolute -top-1.5 -left-1.5 z-20 w-5 h-5 rounded-lg shadow-xl border flex items-center justify-center transition-all ${isSelected ? 'bg-[#25D366] border-[#25D366] text-white scale-110' : 'bg-white border-gray-100 text-gray-200 opacity-0 group-hover:opacity-100'}`}
                                            >
                                                {isSelected ? <CheckSquare size={12} /> : <Square size={12} />}
                                            </button>
                                        </div>
                                        <div className="space-y-1 min-w-0 flex-1">
                                            <div className="flex justify-between items-start gap-2">
                                                <div className="flex items-center gap-2 min-w-0">
                                                    <h4 className="font-black text-gray-900 text-[11px] truncate leading-tight uppercase tracking-tight">{lead.name}</h4>
                                                    {lead.scraped?.techStack?.some((t: string) => t.toLowerCase().includes('shopify')) && (
                                                            <ShoppingBag size={10} className="text-[#96bf48]" />
                                                        )}
                                                        {lead.scraped?.techStack?.some((t: string) => t.toLowerCase().includes('wordpress')) && (
                                                            <Layout size={10} className="text-[#21759b]" />
                                                        )}
                                                    {(lead.socialLinks?.whatsapp || lead.whatsapp) && (
                                                        <div className="p-0.5 bg-[#25D366] text-white rounded shadow-sm">
                                                            <MessageCircle size={8} fill="currentColor" />
                                                        </div>
                                                    )}
                                                </div>
                                                {lead.rating && (
                                                    <div className="flex items-center gap-0.5 shrink-0 bg-amber-50 text-amber-600 px-1 rounded-md text-[8px] font-black">
                                                        {lead.rating} <Star size={8} className="fill-amber-500 text-amber-500" />
                                                    </div>
                                                )}
                                            </div>
                                            <p className="text-[9px] font-bold text-gray-400 truncate leading-relaxed lowercase">{lead.address}</p>
                                            
                                            <div className="flex flex-wrap items-center gap-2 pt-2">
                                                {(lead.international_phone_number || lead.formatted_phone_number || lead.phone) && (
                                                    <span className="text-[9px] font-black text-[#25D366] flex items-center gap-1 bg-green-50 px-2 py-0.5 rounded-full border border-green-100">
                                                        <Phone size={8} />
                                                        {lead.international_phone_number || lead.formatted_phone_number || lead.phone}
                                                    </span>
                                                )}
                                                {(lead.website || lead.scraped?.website) && (
                                                    <a 
                                                        href={lead.website || lead.scraped?.website}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="text-[9px] font-black text-blue-500 flex items-center gap-1 bg-blue-50 px-3 py-1 rounded-full border border-blue-100 hover:bg-blue-100 transition-all shadow-sm"
                                                        onClick={(e) => e.stopPropagation()}
                                                    >
                                                        Visit Site
                                                        <Globe size={8} />
                                                    </a>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>

                <div className="p-6 border-t border-gray-50 bg-white">
                    <Button
                        className="w-full py-4 bg-[#25D366] hover:bg-[#1fad53] text-white rounded-2xl shadow-xl shadow-green-100/50 font-black text-[10px] uppercase tracking-widest disabled:opacity-50"
                        onClick={() => { handleEnrichSelected(); if (window.innerWidth < 768) setShowResults(false); }}
                        disabled={selectedDiscoveredIds.length === 0}
                    >
                        <Sparkles size={14} className="mr-2" />
                        Enrich Selected ({selectedDiscoveredIds.length})
                    </Button>
                </div>
                </Card>
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
                .gm-style-iw-c { 
                    padding: 0 !important; 
                    border-radius: 1rem !important; 
                    overflow: hidden !important; 
                    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04) !important;
                }
                .gm-style-iw-d { 
                    overflow: hidden !important; 
                    min-height: 100% !important; 
                    max-height: none !important;
                }
                .gm-ui-hover-effect {
                    top: 8px !important;
                    right: 8px !important;
                    background: rgba(255,255,255,0.7) !important;
                    backdrop-filter: blur(4px) !important;
                    border-radius: 50% !important;
                }
            `}</style>

            {/* History Modal */}
            {showHistory && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
                    <div className="bg-white rounded-[2.5rem] w-full max-w-lg overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200">
                        <div className="p-8 border-b border-gray-50 flex items-center justify-between bg-white">
                            <div className="flex items-center gap-3">
                                <div className="p-3 bg-gray-50 rounded-2xl text-gray-900 border border-gray-100">
                                    <Clock size={20} />
                                </div>
                                <div>
                                    <h3 className="text-lg font-black text-gray-900 uppercase tracking-tight">Search History</h3>
                                    <p className="text-xs font-bold text-gray-400">Revisit past discovery results</p>
                                </div>
                            </div>
                            <button 
                                onClick={() => setShowHistory(false)}
                                className="p-2 hover:bg-gray-50 rounded-xl text-gray-400 hover:text-red-500 transition-all"
                            >
                                <CloseIcon size={20} />
                            </button>
                        </div>

                        <div className="max-h-[60vh] overflow-y-auto p-4 space-y-2">
                            {jobs.filter(j => j.type === 'map_search').length === 0 ? (
                                <div className="p-12 text-center opacity-30">
                                    <History size={40} className="mx-auto mb-4" />
                                    <p className="text-xs font-black uppercase">No search history yet</p>
                                </div>
                            ) : (
                                jobs.filter(j => j.type === 'map_search').map(job => (
                                    <div 
                                        key={job.id}
                                        onClick={() => handleLoadHistory(job)}
                                        className="p-5 rounded-3xl border border-gray-100 hover:border-[#25D366] hover:bg-green-50/30 transition-all cursor-pointer group"
                                    >
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="min-w-0">
                                                <h4 className="font-black text-gray-900 text-sm uppercase truncate group-hover:text-[#25D366] transition-colors">
                                                    {job.params?.query || 'Untitled Search'}
                                                </h4>
                                                <p className="text-xs font-bold text-gray-400 mt-0.5 truncate">{job.params?.location || 'Unknown Location'}</p>
                                                <div className="flex items-center gap-3 mt-3">
                                                    <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-lg ${
                                                        job.status === 'completed' ? 'bg-green-100 text-[#25D366]' : 
                                                        job.status === 'failed' ? 'bg-red-100 text-red-500' : 'bg-blue-100 text-blue-500'
                                                    }`}>
                                                        {job.status}
                                                    </span>
                                                    <span className="text-[10px] font-bold text-gray-300">
                                                        {new Date(job.createdAt).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="p-2 bg-gray-50 rounded-xl text-gray-300 group-hover:bg-[#25D366] group-hover:text-white transition-all">
                                                <ArrowRight size={16} />
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MapLeadView;
