
import React, { useState, useEffect, useCallback } from 'react';
import {
    Plus,
    Search,
    Filter,
    Download,
    Upload,
    MoreVertical,
    Mail,
    Phone,
    ChevronRight,
    TrendingUp,
    MessageCircle,
    Clock,
    ExternalLink,
    Edit2,
    Trash2,
    CheckCircle2,
    X,
    PlusCircle,
    Hash,
    ShoppingBag,
    Zap,
    Loader2,
    User,
    Sparkles,
    Instagram,
    Facebook,
    Globe,
    Send
} from 'lucide-react';
import { cn, Card, Button, Badge, Input, PremiumLoading } from '../components/ui';
import { motion, AnimatePresence } from 'framer-motion';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../store';
import { fetchContactsAsync, fetchTagsAsync, createContactAsync, importContactsAsync, deleteContactAsync, createTagAsync } from '../features/contactSlice';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { updateContactAsync, addTagAsync, removeTagAsync } from '../features/chatSlice';

import { contactApi, tagApi, appointmentApi, staffApi } from '../lib/api';

const Contacts: React.FC = () => {
    const dispatch = useDispatch<AppDispatch>();
    const navigate = useNavigate();
    const { contacts, tags, loading } = useSelector((state: RootState) => state.contacts);

    const [activeTab, setActiveTab] = useState<'list' | 'tags' | 'auto'>('list');
    const [selectedContact, setSelectedContact] = useState<any | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedTag, setSelectedTag] = useState<string | null>(null);
    const [appointments, setAppointments] = useState<any[]>([]);

    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [newContact, setNewContact] = useState({ name: '', phoneNumber: '' });
    const [staff, setStaff] = useState<any[]>([]);
    const [isStaffDropdownOpen, setIsStaffDropdownOpen] = useState<string | null>(null);

    const [isTagModalOpen, setIsTagModalOpen] = useState(false);
    const [newTag, setNewTag] = useState({ name: '', color: '#25D366' });

    // Edit State
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editFormData, setEditFormData] = useState({ id: '', name: '', email: '', company: '', phoneNumber: '' });

    const [isSubmitting, setIsSubmitting] = useState(false);
    const fileInputRef = React.useRef<HTMLInputElement>(null);

    const fetchData = useCallback(async () => {
        try {
            dispatch(fetchContactsAsync());
            dispatch(fetchTagsAsync());
            const [apptRes, staffRes] = await Promise.all([
                appointmentApi.getAll(),
                staffApi.getAll()
            ]);
            setAppointments(apptRes.data?.data || []);
            setStaff(staffRes.data?.data || []);
        } catch (error) {
            console.error('Failed to fetch enrichment data', error);
        }
    }, [dispatch]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // ... (keep handleCreateContact, handleImportClick, handleFileChange)

    const handleCreateContact = async () => {
        if (!newContact.phoneNumber) {
            toast.error('Phone number is required');
            return;
        }
        setIsSubmitting(true);
        try {
            // @ts-ignore
            await dispatch(createContactAsync(newContact)).unwrap();
            setIsAddModalOpen(false);
            // @ts-ignore
            setNewContact({ name: '', phoneNumber: '', tags: [] });
            toast.success('Contact created successfully');
            dispatch(fetchContactsAsync()); // Refresh to get tags linked
        } catch (error: any) {
            console.error('Failed to create contact:', error);
            toast.error(error.message || 'Failed to create contact');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleImportClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const formData = new FormData();
            formData.append('file', file);
            const loadingToast = toast.loading('Importing contacts...');
            try {
                // @ts-ignore
                await dispatch(importContactsAsync(formData)).unwrap();
                toast.success('Contacts imported successfully', { id: loadingToast });
            } catch (error: any) {
                console.error('Failed to import contacts:', error);
                toast.error(error.message || 'Failed to import contacts', { id: loadingToast });
            }
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const handleEditClick = () => {
        if (selectedContact) {
            setEditFormData({
                id: selectedContact.id,
                name: selectedContact.name || '',
                email: selectedContact.email || '',
                company: selectedContact.company || '',
                phoneNumber: selectedContact.phoneNumber || ''
            });
            setIsEditModalOpen(true);
        }
    };

    const handleUpdateContact = async () => {
        setIsSubmitting(true);
        try {
            const { id, ...data } = editFormData;
            // @ts-ignore
            await dispatch(updateContactAsync({ id, data })).unwrap();

            // Update local state immediately for perceived performance
            setSelectedContact({ ...selectedContact, ...data });
            setIsEditModalOpen(false);
            toast.success('Contact updated successfully');
            dispatch(fetchContactsAsync()); // Refresh list
        } catch (error: any) {
            console.error('Failed to update contact:', error);
            toast.error(error.message || 'Failed to update contact');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleOpenChat = () => {
        if (selectedContact) {
            navigate('/inbox');
        }
    };

    const handleDeleteContact = async (id: string) => {
        if (window.confirm('Are you sure you want to delete this contact?')) {
            try {
                await dispatch(deleteContactAsync(id)).unwrap();
                setSelectedContact(null);
                toast.success('Contact deleted');
            } catch (error: any) {
                toast.error(error.message || 'Failed to delete contact');
            }
        }
    };

    const handleCreateTag = async () => {
        if (!newTag.name) return;
        try {
            await dispatch(createTagAsync(newTag)).unwrap();
            setIsTagModalOpen(false);
            setNewTag({ name: '', color: '#25D366' });
            toast.success('Tag created');
        } catch (error: any) {
            toast.error('Failed to create tag');
        }
    };

    const handleExport = () => {
        const headers = ['Name', 'Phone', 'Email', 'Company', 'Created At'];
        const rows = contacts.map(c => [
            c.name || '',
            c.phoneNumber || '',
            c.email || '',
            c.company || '',
            format(new Date(c.createdAt), 'yyyy-MM-dd')
        ]);

        const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", "contacts_export.csv");
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast.success('Export started');
    };

    const getLeadStageStyles = (stage: string = '') => {
        const s = stage.toLowerCase();
        if (s.includes('hot') || s.includes('urgent')) return { text: 'text-red-600', bg: 'bg-red-50', border: 'border-red-100' };
        if (s.includes('viewing') || s.includes('scheduled')) return { text: 'text-purple-600', bg: 'bg-purple-50', border: 'border-purple-100' };
        if (s.includes('negotiat')) return { text: 'text-orange-600', bg: 'bg-orange-50', border: 'border-orange-100' };
        if (s.includes('new')) return { text: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-100' };
        if (s.includes('won') || s.includes('closed')) return { text: 'text-green-600', bg: 'bg-green-50', border: 'border-green-100' };
        if (s.includes('lost')) return { text: 'text-gray-400', bg: 'bg-gray-50', border: 'border-gray-200' };
        return { text: 'text-gray-500', bg: 'bg-gray-50', border: 'border-gray-100' };
    };

    const getChannelIcon = (channel: string = '', email?: string) => {
        const c = channel.toUpperCase();
        if (!c && email) return <Mail size={14} className="text-blue-500" />;
        switch (c) {
            case 'WHATSAPP': return <MessageCircle size={14} className="text-[#25D366]" />;
            case 'INSTAGRAM': return <Instagram size={14} className="text-pink-500" />;
            case 'FACEBOOK': return <Facebook size={14} className="text-blue-600" />;
            case 'EMAIL':
            case 'MAIL': return <Mail size={14} className="text-blue-500" />;
            default: return <Globe size={14} className="text-gray-400" />;
        }
    };

    const filteredContacts = contacts.filter(c => {
        const matchesSearch = (c.name?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
            (c.phoneNumber || '').includes(searchQuery) ||
            (c.email?.toLowerCase() || '').includes(searchQuery.toLowerCase());

        const matchesTag = !selectedTag || c.tags?.some((t: any) => {
            const tagName = typeof t === 'string' ? t : (t.tag?.name || t.name);
            return tagName === selectedTag;
        });

        return matchesSearch && matchesTag;
    });

    return (
        <div className="p-8 space-y-8 h-full bg-[#f9fafb]">
            {/* ... (Header, Tabs, Filters - kept same) */}
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-black text-gray-900 leading-none">Audience & Segments</h2>
                    <p className="text-sm font-bold text-gray-400 mt-2">Manage your contacts, lead segments and CRM synchronization</p>
                </div>
                <div className="flex gap-3">
                    <input
                        type="file"
                        ref={fileInputRef}
                        className="hidden"
                        accept=".csv"
                        onChange={handleFileChange}
                    />
                    <Button variant="outline" className="border-gray-200" onClick={handleExport}><Download size={16} /> Export</Button>
                    <Button variant="outline" className="border-gray-200" onClick={handleImportClick}><Upload size={16} /> Import CSV</Button>
                    <Button onClick={() => setIsAddModalOpen(true)}><Plus size={18} /> Add Contact</Button>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 p-1 bg-gray-100 rounded-2xl w-fit">
                {[
                    { id: 'list', label: 'Contact List' },
                    { id: 'tags', label: 'Tag Manager' },
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

            {activeTab === 'list' ? (
                <div className="space-y-6 animate-in fade-in duration-500">
                    {/* Filters */}
                    <Card className="p-4 flex gap-4 bg-white border-gray-100 items-center">
                        <div className="flex-1 px-4 py-2.5 bg-gray-50/50 rounded-xl border border-gray-100 flex items-center gap-3 focus-within:ring-4 focus-within:ring-[#25D366]/10 transition-all">
                            <Search size={18} className="text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search contacts..."
                                className="bg-transparent text-sm w-full outline-none"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <div className="flex gap-2">
                            {selectedTag && (
                                <Badge variant="info" className="h-11 px-4 flex gap-2 items-center">
                                    Tag: {selectedTag}
                                    <X size={14} className="cursor-pointer" onClick={() => setSelectedTag(null)} />
                                </Badge>
                            )}
                            <div className="relative group">
                                <Button variant="outline" className="h-11"><Filter size={18} /> Filter by Tag</Button>
                                <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-2xl shadow-2xl border border-gray-100 p-2 hidden group-hover:block z-50">
                                    {tags.map(t => (
                                        <button
                                            key={t.id}
                                            className="w-full text-left px-4 py-2 hover:bg-gray-50 rounded-xl text-xs font-bold"
                                            onClick={() => setSelectedTag(t.name)}
                                        >
                                            {t.name}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </Card>

                    {/* Table */}
                    <Card className="overflow-hidden border-gray-100">
                        <PremiumLoading
                            show={loading && contacts.length === 0}
                            status="Syncing Audience"
                            description="Fetching your latest contacts and segments from the database..."
                        />
                        {!(loading && contacts.length === 0) && (
                            <table className="w-full text-sm text-left">
                                <thead className="bg-gray-50 border-b border-gray-100">
                                    <tr>
                                        <th className="px-6 py-4 font-black text-gray-400 uppercase text-[10px] tracking-widest whitespace-nowrap">Name</th>
                                        <th className="px-6 py-4 font-black text-gray-400 uppercase text-[10px] tracking-widest whitespace-nowrap">Contact Info</th>
                                        <th className="px-6 py-4 font-black text-gray-400 uppercase text-[10px] tracking-widest whitespace-nowrap">Segments</th>
                                        <th className="px-6 py-4 font-black text-gray-400 uppercase text-[10px] tracking-widest whitespace-nowrap">Source & Campaign</th>
                                        <th className="px-6 py-4 font-black text-gray-400 uppercase text-[10px] tracking-widest whitespace-nowrap">Interest</th>
                                        <th className="px-6 py-4 font-black text-gray-400 uppercase text-[10px] tracking-widest whitespace-nowrap">Lead Stage</th>
                                        <th className="px-6 py-4 font-black text-gray-400 uppercase text-[10px] tracking-widest whitespace-nowrap">Assigned To</th>
                                        <th className="px-6 py-4 font-black text-gray-400 uppercase text-[10px] tracking-widest whitespace-nowrap text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 bg-white">
                                    {filteredContacts.map(c => {
                                        // Find latest appointment for this contact to derive status/interest
                                        const contactAppointments = appointments
                                            .filter(a => (a.contactId === c.id || a.customerPhone === c.phoneNumber))
                                            .sort((a, b) => new Date(b.startTime || b.scheduledTime).getTime() - new Date(a.startTime || a.scheduledTime).getTime());
                                        
                                        const latestAppt = contactAppointments[0];
                                        const derivedLeadStage = c.leadStage || (latestAppt ? 
                                            (latestAppt.status === 'CONFIRMED' || latestAppt.status === 'confirmed' ? 'Viewing Scheduled' : 
                                             latestAppt.status === 'COMPLETED' || latestAppt.status === 'completed' ? 'Closed-Won' : 
                                             latestAppt.status === 'CANCELLED' || latestAppt.status === 'cancelled' ? 'Lost' : 'Warm Lead') 
                                            : 'New Lead');
                                        
                                        const derivedInterest = c.serviceInterest || latestAppt?.serviceInterest || latestAppt?.serviceName || 'General Inquiry';

                                        return (
                                            <tr key={c.id} className="hover:bg-gray-50 transition-colors group cursor-pointer" onClick={() => setSelectedContact(c)}>
                                            <td className="px-6 py-5">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-11 h-11 rounded-2xl bg-gray-100 flex items-center justify-center text-gray-400 font-black uppercase shadow-inner group-hover:bg-[#25D366]/10 group-hover:text-[#25D366] transition-all">
                                                        {c.name?.charAt(0) || <User size={18} />}
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-gray-900">{c.name || 'Unknown Contact'}</p>
                                                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mt-0.5">{c.company || 'Private Lead'}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-5">
                                                <div className="space-y-1">
                                                    <div className="flex items-center gap-2 text-xs text-gray-600 font-medium">
                                                        <Phone size={12} className="text-gray-400 group-hover:text-[#25D366] transition-colors" /> {c.phoneNumber}
                                                    </div>
                                                    {c.email && (
                                                        <div className="flex items-center gap-2 text-[11px] text-gray-500 font-medium">
                                                            <Mail size={12} className="text-gray-400" /> {c.email}
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-5">
                                                <div className="flex flex-wrap gap-1 max-w-[150px]">
                                                    {c.tags?.slice(0, 3).map((t: any, idx: number) => {
                                                        const tagName = typeof t === 'string' ? t : (t.tag?.name || t.name);
                                                        return (
                                                            <Badge key={`${c.id}-tag-${idx}`} variant="info" className="text-[8px] py-0 px-1.5">{tagName}</Badge>
                                                        );
                                                    })}
                                                    {c.tags?.length > 3 && <span className="text-[8px] font-bold text-gray-400">+{c.tags.length - 3}</span>}
                                                    {(!c.tags || c.tags.length === 0) && <span className="text-[9px] text-gray-300 italic">No tags</span>}
                                                </div>
                                            </td>
                                            <td className="px-6 py-5">
                                                <div className="space-y-1.5">
                                                    <div className="flex items-center gap-2 text-[11px] font-bold text-gray-500 uppercase tracking-tight">
                                                        {getChannelIcon(c.channel || '', c.email)}
                                                        {c.channel ? (c.channel.charAt(0) + c.channel.slice(1).toLowerCase()) : (c.email ? 'Email' : 'Direct')}
                                                    </div>
                                                    {c.sourceCampaign?.name && (
                                                        <div className="space-y-0.5">
                                                            <div className="flex items-center gap-1.5 text-[11px] font-black text-blue-600">
                                                                <Send size={10} /> {c.sourceCampaign.name}
                                                            </div>
                                                            {c.sourceCampaign.key && (
                                                                <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest ml-4">
                                                                    KEY: {c.sourceCampaign.key}
                                                                </p>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-5">
                                                <div className="space-y-1">
                                                    <p className="text-sm font-black text-gray-900 truncate max-w-[150px]">{derivedInterest}</p>
                                                    {c.interestPrice && <p className="text-[11px] font-bold text-[#25D366]">{c.interestPrice}</p>}
                                                </div>
                                            </td>
                                            <td className="px-6 py-5">
                                                <span className={cn(
                                                    "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border",
                                                    getLeadStageStyles(derivedLeadStage).bg,
                                                    getLeadStageStyles(derivedLeadStage).text,
                                                    getLeadStageStyles(derivedLeadStage).border
                                                )}>
                                                    {derivedLeadStage}
                                                </span>
                                            </td>
                                            <td className="px-6 py-5">
                                                <div className="relative">
                                                    <div 
                                                        className="flex items-center gap-2 cursor-pointer hover:bg-gray-100 p-1.5 rounded-xl transition-all"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setIsStaffDropdownOpen(isStaffDropdownOpen === c.id ? null : c.id);
                                                        }}
                                                    >
                                                        <div className="w-7 h-7 rounded-full bg-gray-100 border border-white shadow-sm flex items-center justify-center text-[10px] font-black text-gray-400 overflow-hidden">
                                                            {c.assignedStaff?.avatar || latestAppt?.staff?.avatar ? (
                                                                <img src={c.assignedStaff?.avatar || latestAppt?.staff?.avatar} alt="" className="w-full h-full object-cover" />
                                                            ) : (
                                                                (c.assignedStaff?.name || latestAppt?.staffName || latestAppt?.staff?.name || 'U')[0]
                                                            )}
                                                        </div>
                                                        <span className="text-xs font-bold text-gray-600">
                                                            {c.assignedStaff?.name || latestAppt?.staffName || latestAppt?.staff?.name || 'Unassigned'}
                                                        </span>
                                                    </div>

                                                    {isStaffDropdownOpen === c.id && (
                                                        <div className="absolute left-0 top-full mt-2 w-48 bg-white rounded-2xl shadow-2xl border border-gray-100 p-2 z-50 animate-in fade-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
                                                            <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest px-3 py-2">Assign Lead To</p>
                                                            {staff.map(s => (
                                                                <button
                                                                    key={s.id}
                                                                    className="w-full text-left px-3 py-2 hover:bg-[#25D366]/5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all"
                                                                    onClick={async () => {
                                                                        try {
                                                                            // @ts-ignore
                                                                            await dispatch(updateContactAsync({ 
                                                                                id: c.id, 
                                                                                data: { assignedStaffId: s.id, assignedStaff: { name: s.name, avatar: s.avatar } } 
                                                                            })).unwrap();
                                                                            toast.success(`Assigned to ${s.name}`);
                                                                            setIsStaffDropdownOpen(null);
                                                                            dispatch(fetchContactsAsync());
                                                                        } catch (err) {
                                                                            toast.error('Failed to assign staff');
                                                                        }
                                                                    }}
                                                                >
                                                                    <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-[8px] overflow-hidden">
                                                                        {s.avatar ? <img src={s.avatar} alt="" className="w-full h-full object-cover" /> : s.name[0]}
                                                                    </div>
                                                                    {s.name}
                                                                </button>
                                                            ))}
                                                            <button 
                                                                className="w-full text-left px-3 py-2 hover:bg-red-50 text-red-500 rounded-xl text-xs font-bold mt-1 border-t border-gray-50 pt-2"
                                                                onClick={async () => {
                                                                    try {
                                                                        // @ts-ignore
                                                                        await dispatch(updateContactAsync({ id: c.id, data: { assignedStaffId: null, assignedStaff: null } })).unwrap();
                                                                        toast.success('Unassigned staff');
                                                                        setIsStaffDropdownOpen(null);
                                                                        dispatch(fetchContactsAsync());
                                                                    } catch (err) {
                                                                        toast.error('Failed to unassign');
                                                                    }
                                                                }}
                                                            >
                                                                Unassign
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-5 text-right relative group">
                                                <button className="p-2 text-gray-400 hover:text-gray-900 transition-all"><MoreVertical size={18} /></button>
                                                <div className="absolute right-6 top-1/2 -translate-y-1/2 hidden group-hover:flex gap-1">
                                                    <Button variant="danger" size="sm" className="w-8 h-8 rounded-lg" onClick={(e) => { e.stopPropagation(); handleDeleteContact(c.id); }}><Trash2 size={14} /></Button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                            </table>
                        )}
                        <div className="p-6 bg-gray-50/50 border-t border-gray-100 flex items-center justify-between">
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Showing {filteredContacts.length} results</p>
                        </div>
                    </Card>
                </div>
            ) : activeTab === 'tags' ? (
                // Tags Tab View
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-in slide-in-from-bottom-8 duration-500">
                    {tags.map(t => (
                        <Card key={t.id} className="p-8 space-y-6 hover:shadow-2xl hover:shadow-gray-200 transition-all group relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-full h-1.5" style={{ backgroundColor: t.color || '#25D366' }} />
                            <div className="flex items-center justify-between">
                                <div className="p-3 bg-gray-50 rounded-2xl text-gray-400 group-hover:bg-gray-100 group-hover:text-gray-900 transition-all shadow-inner"><Hash size={24} /></div>
                                <button className="p-2 text-gray-300 hover:text-red-500 transition-colors" onClick={async () => {
                                    if (window.confirm('Delete this tag?')) {
                                        try {
                                            const { tagApi } = await import('../lib/api/contactApi');
                                            await tagApi.delete(t.id);
                                            dispatch(fetchTagsAsync());
                                            toast.success('Tag deleted');
                                        } catch (error) {
                                            toast.error('Failed to delete tag');
                                        }
                                    }
                                }}><Trash2 size={18} /></button>
                            </div>
                            <div>
                                <h4 className="text-xl font-black text-gray-900">{t.name}</h4>
                                <p className="text-sm font-bold text-gray-400 mt-1">{t.contactCount || 0} contacts assigned</p>
                            </div>
                            <div className="pt-6 border-t border-gray-50 flex items-center justify-between">
                                <button className="text-xs font-black uppercase tracking-[0.2em] text-[#25D366] hover:underline">Edit Rules</button>
                                <div className="flex -space-x-2">
                                    {[1, 2].map(i => <div key={i} className="w-8 h-8 rounded-full border-2 border-white bg-gray-100 shadow-sm flex items-center justify-center text-[10px] font-black text-gray-300"><User size={12} /></div>)}
                                </div>
                            </div>
                        </Card>
                    ))}
                    <button onClick={() => setIsTagModalOpen(true)} className="border-[3px] border-dashed border-gray-100 rounded-[2.5rem] p-12 flex flex-col items-center justify-center gap-4 hover:bg-gray-50 hover:border-[#25D366]/30 transition-all group text-center">
                        <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center text-gray-300 group-hover:bg-[#25D366]/10 group-hover:text-[#25D366] transition-all shadow-inner"><PlusCircle size={32} /></div>
                        <span className="text-sm font-black text-gray-400 group-hover:text-gray-600 uppercase tracking-widest">Create New Tag</span>
                    </button>
                </div>
            ) : (
                <div className="flex items-center justify-center py-20 bg-white border border-gray-100 rounded-[3rem]">
                    <div className="text-center space-y-4 max-w-sm">
                        <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center text-[#25D366] mx-auto shadow-inner"><Zap size={32} /></div>
                        <h4 className="text-xl font-black text-gray-900">Auto-Tagging Engine</h4>
                        <p className="text-sm font-bold text-gray-400 leading-relaxed">Automation rules will be migrated to the new Flow Engine for unified workflow management.</p>
                        <Button variant="ghost" className="text-[#25D366] font-black uppercase tracking-[0.2em]" onClick={() => navigate('/flow/builder')}>Open Flow Builder</Button>
                    </div>
                </div>
            )}

            {/* Contact Details Drawer */}
            <AnimatePresence>
                {selectedContact && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm z-[60]"
                            onClick={() => setSelectedContact(null)}
                        />
                        <motion.div
                            initial={{ x: 600 }} animate={{ x: 0 }} exit={{ x: 600 }}
                            className="fixed top-0 right-0 h-full w-[500px] bg-white z-[70] shadow-2xl flex flex-col"
                        >
                            <header className="p-8 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white z-10">
                                <h3 className="text-xl font-black text-gray-900">Contact Details</h3>
                                <button onClick={() => setSelectedContact(null)} className="p-3 hover:bg-gray-50 rounded-full text-gray-400"><X size={24} /></button>
                            </header>

                            <div className="flex-1 overflow-y-auto p-12 space-y-12">
                                <section className="flex flex-col items-center">
                                    <div className="w-32 h-32 rounded-[3.5rem] bg-gray-100 flex items-center justify-center text-4xl font-black text-gray-300 shadow-2xl border-4 border-white mb-6 uppercase">
                                        {selectedContact.name?.charAt(0) || <User size={48} />}
                                    </div>
                                    <h4 className="text-2xl font-black text-gray-900">{selectedContact.name || 'Unknown Contact'}</h4>
                                    <p className="text-sm font-bold text-gray-400 mt-2">{selectedContact.company || 'Private Lead'} • Joined {format(new Date(selectedContact.createdAt), 'MMM yyyy')}</p>
                                    <div className="flex gap-3 mt-8">
                                        <Button variant="outline" className="h-10 px-6" onClick={handleEditClick}><Edit2 size={16} /> Edit Info</Button>
                                        <Button className="h-10 px-6" onClick={handleOpenChat}><MessageCircle size={16} /> Open Chat</Button>
                                    </div>
                                </section>

                                <section className="space-y-6">
                                    <h5 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] flex items-center gap-3">
                                        <Zap size={14} className="text-blue-500" /> Lead Attribution
                                    </h5>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="p-4 bg-blue-50/50 rounded-2xl border border-blue-100 flex flex-col gap-1">
                                            <span className="text-[9px] font-black text-blue-400 uppercase tracking-widest flex items-center gap-1.5">
                                                {getChannelIcon(selectedContact.channel || '', selectedContact.email)}
                                                Source Channel
                                            </span>
                                            <span className="text-xs font-black text-blue-700 truncate">{selectedContact.sourceCampaign?.name || selectedContact.campaignName || 'Direct Organic'}</span>
                                        </div>
                                        <div className="p-4 bg-green-50/50 rounded-2xl border border-green-100 flex flex-col gap-1">
                                            <span className="text-[9px] font-black text-[#25D366] uppercase tracking-widest">Initial Interest</span>
                                            <span className="text-xs font-black text-green-700 truncate">{selectedContact.serviceInterest || 'General Inquiry'}</span>
                                        </div>
                                    </div>
                                </section>

                                <section className="space-y-6">
                                    <h5 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] flex items-center gap-3">
                                        <Mail size={14} /> Contact Information
                                    </h5>
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
                                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Phone</span>
                                            <span className="text-sm font-bold text-gray-900">{selectedContact.phoneNumber}</span>
                                        </div>
                                        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
                                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Email</span>
                                            <span className="text-sm font-bold text-gray-900">{selectedContact.email || 'N/A'}</span>
                                        </div>
                                    </div>
                                </section>

                                <section className="space-y-6">
                                    <div className="flex items-center justify-between">
                                        <h5 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] flex items-center gap-3">
                                            <Hash size={14} /> Current Segments
                                        </h5>
                                        <div className="relative group/tags">
                                            <Button variant="outline" size="sm" className="h-7 text-[9px] border-[#25D366] text-[#25D366] hover:bg-[#25D366]/5">+ Add Tag</Button>
                                            <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-2xl shadow-2xl border border-gray-100 p-2 hidden group-hover/tags:block z-50">
                                                {tags.map(t => (
                                                    <button
                                                        key={t.id}
                                                        className="w-full text-left px-4 py-2 hover:bg-gray-50 rounded-xl text-xs font-bold"
                                                        onClick={async () => {
                                                            const currentTags = selectedContact.tags || [];
                                                            const tagName = t.name;
                                                            const isAlreadyTagged = currentTags.some((ct: any) => {
                                                                const n = typeof ct === 'string' ? ct : (ct.tag?.name || ct.name);
                                                                return n === tagName;
                                                            });

                                                            if (!isAlreadyTagged) {
                                                                try {
                                                                    // @ts-ignore
                                                                    await dispatch(addTagAsync({ contactId: selectedContact.id, tagId: t.id, tagName: t.name })).unwrap();
                                                                    setSelectedContact({ ...selectedContact, tags: [...currentTags, t] });
                                                                    toast.success(`Tag "${tagName}" added`);
                                                                    dispatch(fetchContactsAsync());
                                                                } catch (err) {
                                                                    toast.error('Failed to add tag');
                                                                }
                                                            } else {
                                                                toast.error('Tag already assigned');
                                                            }
                                                        }}
                                                    >
                                                        {t.name}
                                                    </button>
                                                ))}
                                                <button
                                                    className="w-full text-left px-4 py-2 hover:bg-[#25D366]/5 rounded-xl text-xs font-black text-[#25D366] border-t border-gray-50 mt-1"
                                                    onClick={() => { setIsTagModalOpen(true); }}
                                                >
                                                    + Create New Tag
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {selectedContact.tags?.map((t: any, idx: any) => {
                                            const tagName = typeof t === 'string' ? t : (t.tag?.name || t.name || 'Tag');
                                            const tagId = typeof t === 'string' ? null : (t.id || t.tag?.id);

                                            return (
                                                <Badge key={`${selectedContact.id}-details-tag-${idx}`} variant="info" className="flex items-center gap-1">
                                                    {tagName}
                                                    <X
                                                        size={12}
                                                        className="cursor-pointer hover:text-red-500"
                                                        onClick={async () => {
                                                            try {
                                                                if (tagId) {
                                                                    // @ts-ignore
                                                                    await dispatch(removeTagAsync({ contactId: selectedContact.id, tagId, tagName })).unwrap();
                                                                } else {
                                                                    // Fallback if we only have the name
                                                                    const updatedTags = selectedContact.tags.filter((_: any, i: number) => i !== idx);
                                                                    // @ts-ignore
                                                                    await dispatch(updateContactAsync({ id: selectedContact.id, data: { tags: updatedTags } })).unwrap();
                                                                }

                                                                const updatedTagsState = selectedContact.tags.filter((_: any, i: number) => i !== idx);
                                                                setSelectedContact({ ...selectedContact, tags: updatedTagsState });
                                                                toast.success('Tag removed');
                                                                dispatch(fetchContactsAsync());
                                                            } catch (err) {
                                                                toast.error('Failed to remove tag');
                                                            }
                                                        }}
                                                    />
                                                </Badge>
                                            );
                                        })}
                                        {(!selectedContact.tags || selectedContact.tags.length === 0) && <span className="text-xs text-gray-400 italic font-bold">No segments assigned</span>}
                                    </div>
                                </section>
                            </div>

                            <footer className="p-8 border-t border-gray-100 bg-gray-50/50 flex gap-4 sticky bottom-0 z-10">
                                <Button variant="outline" className="flex-1"><ExternalLink size={16} /> Sync CRM</Button>
                                <Button variant="danger" className="p-3" onClick={() => handleDeleteContact(selectedContact.id)}><Trash2 size={18} /></Button>
                            </footer>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            {/* Add Contact Modal */}
            <AnimatePresence>
                {isAddModalOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm z-[60]"
                            onClick={() => setIsAddModalOpen(false)}
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
                            className="fixed inset-0 m-auto w-full max-w-md h-fit bg-white rounded-3xl z-[70] shadow-2xl p-8 space-y-6"
                        >
                            <div className="flex items-center justify-between">
                                <h3 className="text-xl font-black text-gray-900">Add New Contact</h3>
                                <button onClick={() => setIsAddModalOpen(false)} className="p-2 hover:bg-gray-50 rounded-full text-gray-400"><X size={20} /></button>
                            </div>

                            <div className="space-y-4">
                                <Input
                                    label="Full Name (Optional)"
                                    placeholder="e.g. John Doe"
                                    value={newContact.name}
                                    onChange={(e) => setNewContact({ ...newContact, name: e.target.value })}
                                />
                                <Input
                                    label="Phone Number (Required)"
                                    placeholder="e.g. 919876543210"
                                    value={newContact.phoneNumber}
                                    onChange={(e) => setNewContact({ ...newContact, phoneNumber: e.target.value })}
                                />
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest pl-1">Assign Segments</label>
                                    <div className="flex flex-wrap gap-2 p-1">
                                        {tags.map(t => (
                                            <button
                                                key={t.id}
                                                onClick={() => {
                                                    // @ts-ignore
                                                    const currentTags = newContact.tags || [];
                                                    // @ts-ignore
                                                    const hasTag = currentTags.includes(t.name);
                                                    setNewContact({
                                                        ...newContact,
                                                        // @ts-ignore
                                                        tags: hasTag ? currentTags.filter(n => n !== t.name) : [...currentTags, t.name]
                                                    });
                                                }}
                                                className={cn(
                                                    "px-3 py-1.5 rounded-xl text-[10px] font-black uppercase border transition-all",
                                                    // @ts-ignore
                                                    (newContact.tags || []).includes(t.name)
                                                        ? "bg-[#25D366] border-[#25D366] text-white"
                                                        : "bg-gray-50 border-gray-100 text-gray-400 hover:border-gray-200"
                                                )}
                                            >
                                                {t.name}
                                            </button>
                                        ))}
                                        <button
                                            onClick={() => setIsTagModalOpen(true)}
                                            className="px-3 py-1.5 rounded-xl text-[10px] font-black uppercase border border-dashed border-[#25D366] text-[#25D366] hover:bg-[#25D366]/5"
                                        >
                                            + New
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div className="pt-2 flex gap-3">
                                <Button variant="outline" className="flex-1" onClick={() => setIsAddModalOpen(false)}>Cancel</Button>
                                <Button className="flex-1" onClick={handleCreateContact} disabled={isSubmitting || !newContact.phoneNumber}>
                                    {isSubmitting ? <Loader2 className="animate-spin" size={18} /> : 'Create Contact'}
                                </Button>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            {/* Edit Contact Modal */}
            <AnimatePresence>
                {isEditModalOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm z-[60]"
                            onClick={() => setIsEditModalOpen(false)}
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
                            className="fixed inset-0 m-auto w-full max-w-md h-fit bg-white rounded-3xl z-[70] shadow-2xl p-8 space-y-6"
                        >
                            <div className="flex items-center justify-between">
                                <h3 className="text-xl font-black text-gray-900">Edit Contact Details</h3>
                                <button onClick={() => setIsEditModalOpen(false)} className="p-2 hover:bg-gray-50 rounded-full text-gray-400"><X size={20} /></button>
                            </div>

                            <div className="space-y-4">
                                <Input
                                    label="Full Name"
                                    placeholder="e.g. John Doe"
                                    value={editFormData.name}
                                    onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                                />
                                <Input
                                    label="Phone Number"
                                    placeholder="e.g. 919876543210"
                                    value={editFormData.phoneNumber}
                                    onChange={(e) => setEditFormData({ ...editFormData, phoneNumber: e.target.value })}
                                />
                                <Input
                                    label="Email Address"
                                    placeholder="e.g. john@example.com"
                                    value={editFormData.email}
                                    onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                                />
                                <Input
                                    label="Company"
                                    placeholder="e.g. Acme Corp"
                                    value={editFormData.company}
                                    onChange={(e) => setEditFormData({ ...editFormData, company: e.target.value })}
                                />
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest pl-1">Segments</label>
                                    <div className="flex flex-wrap gap-2 p-1">
                                        {tags.map(t => {
                                            const contactTags = selectedContact?.tags || [];
                                            const hasTag = contactTags.some((ct: any) => {
                                                const n = typeof ct === 'string' ? ct : (ct.tag?.name || ct.name);
                                                return n === t.name;
                                            });

                                            return (
                                                <button
                                                    key={t.id}
                                                    onClick={async () => {
                                                        try {
                                                            if (hasTag) {
                                                                const tagId = typeof contactTags.find((ct: any) => (typeof ct === 'string' ? ct : (ct.tag?.name || ct.name)) === t.name) === 'object' ? (contactTags.find((ct: any) => (typeof ct === 'string' ? ct : (ct.tag?.name || ct.name)) === t.name).tag?.id || contactTags.find((ct: any) => (typeof ct === 'string' ? ct : (ct.tag?.name || ct.name)) === t.name).id) : null;
                                                                if (tagId) {
                                                                    // @ts-ignore
                                                                    await dispatch(removeTagAsync({ contactId: selectedContact.id, tagId, tagName: t.name })).unwrap();
                                                                }
                                                            } else {
                                                                // @ts-ignore
                                                                await dispatch(addTagAsync({ contactId: selectedContact.id, tagId: t.id, tagName: t.name })).unwrap();
                                                            }
                                                            dispatch(fetchContactsAsync());
                                                            // Update local selected contact
                                                            const updatedInfo = await (contactApi.getById(selectedContact.id));
                                                            setSelectedContact(updatedInfo.data.data);
                                                        } catch (err) {
                                                            toast.error('Operation failed');
                                                        }
                                                    }}
                                                    className={cn(
                                                        "px-3 py-1.5 rounded-xl text-[10px] font-black uppercase border transition-all",
                                                        hasTag
                                                            ? "bg-[#25D366] border-[#25D366] text-white shadow-sm"
                                                            : "bg-gray-50 border-gray-100 text-gray-400 hover:border-gray-200"
                                                    )}
                                                >
                                                    {t.name}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>

                            <div className="pt-2 flex gap-3">
                                <Button variant="outline" className="flex-1" onClick={() => setIsEditModalOpen(false)}>Cancel</Button>
                                <Button className="flex-1" onClick={handleUpdateContact} disabled={isSubmitting}>
                                    {isSubmitting ? <Loader2 className="animate-spin" size={18} /> : 'Save Changes'}
                                </Button>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
            {/* Create Tag Modal */}
            <AnimatePresence>
                {isTagModalOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm z-[120]"
                            onClick={() => setIsTagModalOpen(false)}
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
                            className="fixed inset-0 m-auto w-full max-w-md h-fit bg-white rounded-3xl z-[130] shadow-2xl p-8 space-y-6"
                        >
                            <h3 className="text-xl font-black text-gray-900">Create New Segment</h3>
                            <div className="space-y-4">
                                <Input label="Tag Name" placeholder="e.g. High Value" value={newTag.name} onChange={e => setNewTag({ ...newTag, name: e.target.value })} />
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest pl-1">Theme Color</label>
                                    <div className="flex gap-2">
                                        {['#25D366', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6'].map(c => (
                                            <button key={c} onClick={() => setNewTag({ ...newTag, color: c })} className={cn("w-10 h-10 rounded-xl border-4 transition-all", newTag.color === c ? "border-gray-900" : "border-transparent")} style={{ backgroundColor: c }} />
                                        ))}
                                    </div>
                                </div>
                            </div>
                            <div className="pt-2 flex gap-3">
                                <Button variant="outline" className="flex-1" onClick={() => setIsTagModalOpen(false)}>Cancel</Button>
                                <Button className="flex-1" onClick={handleCreateTag}>Create Tag</Button>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Contacts;
