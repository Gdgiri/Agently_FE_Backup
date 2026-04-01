import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { appointmentApi, staffApi, contactApi } from '../lib/api';
import { toast } from 'react-hot-toast';
import {
    Calendar,
    ChevronLeft,
    ChevronRight,
    Search,
    Plus,
    MoreVertical,
    Clock,
    User,
    Phone,
    CheckCircle2,
    X,
    PlusCircle,
    Edit2,
    Hash,
    Filter,
    Users,
    MessageCircle,
    ExternalLink,
    MapPin,
    Sparkles,
    Zap,
    Loader2,
    Trash2,
    Mail,
    Send
} from 'lucide-react';
import { cn, Card, Button, Badge, Input } from '../components/ui';
import { motion, AnimatePresence } from 'framer-motion';

import { socketClient } from '../lib/socket';

const MOCK_APPOINTMENTS = [
    { id: '1', customer: 'John Doe', service: 'Property Tour: Sunset Villa', staff: 'Alex Rivera', time: 'Today, 2:00 PM', status: 'CONFIRMED' },
    { id: '2', customer: 'Sarah Smith', service: 'Consultation: Investment', staff: 'Emma Stone', time: 'Today, 4:30 PM', status: 'PENDING' },
    { id: '3', customer: 'Robert Fox', service: 'Contract Signing', staff: 'Alex Rivera', time: 'Tomorrow, 10:00 AM', status: 'COMPLETED' },
];

const Appointments: React.FC = () => {
    const navigate = useNavigate();
    const getStatusStyles = (status: string = '') => {
        const s = status.toUpperCase();
        switch (s) {
            case 'CONFIRMED': return { bg: 'bg-[#25D366]', border: 'border-[#128C7E]', text: 'text-green-600', shadow: 'shadow-green-100', badge: 'success' };
            case 'SCHEDULED':
            case 'PENDING': return { bg: 'bg-amber-400', border: 'border-amber-500', text: 'text-amber-600', shadow: 'shadow-amber-100', badge: 'warning' };
            case 'COMPLETED': return { bg: 'bg-gray-400', border: 'border-gray-500', text: 'text-gray-600', shadow: 'shadow-gray-100', badge: 'neutral' };
            case 'CANCELLED': return { bg: 'bg-rose-500', border: 'border-rose-600', text: 'text-rose-600', shadow: 'shadow-rose-100', badge: 'error' };
            default: return { bg: 'bg-gray-400', border: 'border-gray-500', text: 'text-gray-600', shadow: 'shadow-gray-100', badge: 'neutral' };
        }
    };

    const [appointments, setAppointments] = useState<any[]>([]);
    const [staff, setStaff] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [view, setView] = useState<'list' | 'calendar' | 'kanban'>('kanban');
    const [selected, setSelected] = useState<any | null>(null);
    const [draggedId, setDraggedId] = useState<string | null>(null);

    const [isStaffManagerOpen, setIsStaffManagerOpen] = useState(false);
    const [staffTab, setStaffTab] = useState<'list' | 'create'>('list');
    const [editingStaff, setEditingStaff] = useState<any | null>(null);

    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            const [apptRes, staffRes] = await Promise.all([
                appointmentApi.getAll(),
                staffApi.getAll()
            ]);
            setAppointments(apptRes.data?.data || []);
            setStaff(staffRes.data?.data || []);
        } catch (error) {
            toast.error('Failed to fetch data');
            console.error(error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();

        // Listen for global real-time refresh events from AuthBootstrap
        const handleRefresh = () => {
            console.log('[Appointments] 🔃 Real-time refresh triggered');
            fetchData();
        };

        window.addEventListener('refresh-appointments', handleRefresh);

        return () => {
            window.removeEventListener('refresh-appointments', handleRefresh);
        };
    }, [fetchData]);

    const currentMonthYear = new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' }).format(new Date());

    const formatDate = (dateStr: string) => {
        if (!dateStr) return 'Not set';
        try {
            const date = new Date(dateStr);
            if (isNaN(date.getTime())) return dateStr; // Fallback for old mock data
            return new Intl.DateTimeFormat('en-US', {
                month: 'short',
                day: 'numeric',
                hour: 'numeric',
                minute: 'numeric',
                hour12: true
            }).format(date);
        } catch (e) {
            return dateStr;
        }
    };

    const handleStatusChange = async (id: string, newStatus: string) => {
        try {
            setAppointments(prev => prev.map(a => a.id === id ? { ...a, status: newStatus } : a));
            await appointmentApi.update(id, { status: newStatus });
            toast.success(`Status updated to ${newStatus}`);
        } catch (error) {
            toast.error('Failed to update status');
            fetchData(); // Rollback
        }
    };



    const handleAddStaff = async (name: string, phoneNumber: string, role: string) => {
        try {
            if (editingStaff) {
                const { data } = await staffApi.update(editingStaff.id, { name, phoneNumber, role });
                if (data.success) {
                    setStaff(prev => prev.map(s => s.id === editingStaff.id ? data.data : s));
                    toast.success('Staff updated');
                    setEditingStaff(null);
                }
            } else {
                const { data } = await staffApi.create({ name, phoneNumber, role });
                if (data.success) {
                    setStaff(prev => [...prev, data.data]);
                    toast.success('Staff added');
                }
            }
        } catch (error) {
            toast.error(editingStaff ? 'Failed to update staff' : 'Failed to add staff');
        }
    };

    const onDragStart = (id: string) => {
        setDraggedId(id);
    };

    const onDragOver = (e: React.DragEvent) => {
        e.preventDefault();
    };

    const onDrop = (status: string) => {
        if (draggedId) {
            handleStatusChange(draggedId, status);
            setDraggedId(null);
        }
    };

    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const dates = Array.from({ length: 31 }, (_, i) => i + 1);

    if (loading) {
        return (
            <div className="flex h-[80vh] items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="w-12 h-12 text-[#25D366] animate-spin" />
                    <p className="text-sm font-black text-gray-400 uppercase tracking-widest">Loading Appointments...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-8 space-y-8 bg-[#f9fafb]">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-black text-gray-900 leading-none">Appointment & Scheduling</h2>
                    <p className="text-sm font-bold text-gray-400 mt-2">Manage appointments and automated WhatsApp reminders</p>
                </div>
                <div className="flex gap-3">
                    <Button variant="outline" className="border-gray-200" onClick={() => setIsStaffManagerOpen(true)}><Users size={18} /> Staff Manager</Button>

                </div>
            </div>

            {/* Control Bar */}
            <div className="flex items-center justify-between gap-4">
                <div className="flex gap-1 p-1 bg-gray-100 rounded-2xl w-fit">
                    <button
                        onClick={() => setView('list')}
                        className={cn(
                            "px-8 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all",
                            view === 'list' ? "bg-white text-gray-900 shadow-md shadow-gray-200/50" : "text-gray-400 hover:text-gray-600"
                        )}
                    >
                        List View
                    </button>
                    <button
                        onClick={() => setView('calendar')}
                        className={cn(
                            "px-8 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all",
                            view === 'calendar' ? "bg-white text-gray-900 shadow-md shadow-gray-200/50" : "text-gray-400 hover:text-gray-600"
                        )}
                    >
                        Calendar
                    </button>
                    <button
                        onClick={() => setView('kanban')}
                        className={cn(
                            "px-8 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all",
                            view === 'kanban' ? "bg-white text-gray-900 shadow-md shadow-gray-200/50" : "text-gray-400 hover:text-gray-600"
                        )}
                    >
                        Board View
                    </button>
                </div>

                <div className="flex items-center gap-4 flex-1 justify-end">
                    <div className="hidden lg:flex items-center gap-3 px-4 py-2 bg-white border border-gray-100 rounded-xl w-64 shadow-sm group focus-within:ring-4 focus-within:ring-[#25D366]/10 transition-all">
                        <Search size={16} className="text-gray-400" />
                        <input type="text" placeholder="Search appointments..." className="bg-transparent text-sm w-full outline-none" />
                    </div>
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-white border border-gray-100 rounded-xl shadow-sm">
                        <button className="p-1 hover:bg-gray-100 rounded-lg text-gray-400"><ChevronLeft size={16} /></button>
                        <span className="text-xs font-black uppercase tracking-widest text-gray-900 px-2 min-w-[120px] text-center">{currentMonthYear}</span>
                        <button className="p-1 hover:bg-gray-100 rounded-lg text-gray-400"><ChevronRight size={16} /></button>
                    </div>
                </div>
            </div>

            {view === 'list' && (
                <div className="space-y-6 animate-in fade-in duration-500">
                    <Card className="overflow-hidden border-gray-100">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-gray-50 border-b border-gray-100">
                                <tr>
                                    <th className="px-6 py-4 font-black text-gray-400 uppercase text-[10px] tracking-widest">Customer Details</th>
                                    <th className="px-6 py-4 font-black text-gray-400 uppercase text-[10px] tracking-widest">Service / Interest</th>
                                    <th className="px-6 py-4 font-black text-gray-400 uppercase text-[10px] tracking-widest">Date & Time</th>
                                    <th className="px-6 py-4 font-black text-gray-400 uppercase text-[10px] tracking-widest">Source / Campaign</th>
                                    <th className="px-6 py-4 font-black text-gray-400 uppercase text-[10px] tracking-widest">Assigned Staff</th>
                                    <th className="px-6 py-4 font-black text-gray-400 uppercase text-[10px] tracking-widest">Status</th>
                                    <th className="px-6 py-4 font-black text-gray-400 uppercase text-[10px] tracking-widest text-center">History / AI Notes</th>
                                    <th className="px-6 py-4 font-black text-gray-400 uppercase text-[10px] tracking-widest text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 bg-white">
                                {appointments.map(a => (
                                    <tr key={a.id} className="hover:bg-gray-50 transition-colors group cursor-pointer" onClick={() => setSelected(a)}>
                                        <td className="px-6 py-5">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-2xl bg-gray-100 flex items-center justify-center text-gray-400 group-hover:bg-[#25D366]/10 group-hover:text-[#25D366] transition-all"><User size={20} /></div>
                                                <span className="font-bold text-gray-900">{a.contact?.name || a.customerName || a.customer}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5 font-bold text-gray-700">{a.serviceInterest || a.serviceName || a.service}</td>
                                        <td className="px-6 py-5">
                                            <div className="flex items-center gap-2 text-xs font-bold text-gray-600">
                                                <Clock size={14} className="text-[#25D366]" /> {formatDate(a.startTime || a.scheduledTime || a.time)}
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            {a.campaign?.name || a.campaignName ? (
                                                <div className="flex items-center gap-2">
                                                    <Badge variant="info" className="bg-blue-50 text-blue-600 border-blue-100 flex items-center gap-1.5 py-1">
                                                        <Send size={10} /> {a.campaign?.name || a.campaignName}
                                                    </Badge>
                                                </div>
                                            ) : (
                                                <span className="text-xs font-bold text-gray-300 italic uppercase tracking-widest">Direct / Organic</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="flex items-center gap-2">
                                                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#25D366]/10 to-[#25D366]/5 flex items-center justify-center text-[10px] font-black text-[#25D366] border border-[#25D366]/20 shadow-sm">
                                                    {(a.staff?.name || a.staffName || 'U')[0]}
                                                </div>
                                                <span className="text-xs font-black text-gray-900">{a.staff?.name || a.staffName || 'Unassigned'}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <Badge variant={getStatusStyles(a.status).badge as any}>{a.status}</Badge>
                                        </td>
                                        <td className="px-6 py-5 border-l border-gray-50 bg-gray-50/10">
                                            <div className="max-w-[150px] mx-auto">
                                                <p className="text-[10px] font-bold text-gray-400 line-clamp-2 italic text-center" title={a.notes}>
                                                    {a.notes || <span className="text-gray-200 font-normal">No history Recorded</span>}
                                                </p>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5 text-right">
                                            <button className="p-2 text-gray-400 hover:text-gray-900 transition-all"><MoreVertical size={18} /></button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </Card>
                </div >
            )}

            {
                view === 'calendar' && (
                    <div className="grid grid-cols-7 gap-px bg-gray-100 border border-gray-100 rounded-3xl overflow-hidden animate-in zoom-in-95 duration-500 shadow-2xl">
                        {days.map(d => (
                            <div key={d} className="bg-white p-4 text-[10px] font-black uppercase text-gray-400 text-center tracking-widest border-b border-gray-100">{d}</div>
                        ))}
                        {dates.map(date => {
                            const dayAppointments = appointments.filter(a => {
                                const d = new Date(a.startTime || a.scheduledTime || a.time);
                                const today = new Date();
                                const tomorrow = new Date();
                                tomorrow.setDate(today.getDate() + 1);

                                if (date === today.getDate()) return d.getDate() === date;
                                if (date === tomorrow.getDate()) return d.getDate() === date;
                                return d.getDate() === date;
                            });

                            return (
                                <div key={date} className={cn(
                                    "bg-white h-40 p-4 transition-all hover:bg-gray-50 cursor-pointer relative group",
                                    date === 21 ? "bg-green-50/30" : ""
                                )}>
                                    <span className={cn(
                                        "text-sm font-black transition-colors",
                                        date === 21 ? "text-[#25D366]" : "text-gray-300 group-hover:text-gray-900"
                                    )}>{date}</span>

                                    <div className="mt-3 space-y-1.5 relative z-10">
                                        {dayAppointments.map(appt => (
                                            <div key={appt.id} className={cn(
                                                "p-2 text-white text-[9px] font-black uppercase tracking-tighter rounded-xl shadow-lg flex items-center justify-between",
                                                getStatusStyles(appt.status).bg,
                                                getStatusStyles(appt.status).shadow
                                            )}>
                                                <div className="flex flex-col w-full overflow-hidden">
                                                    <div className="flex items-center justify-between w-full">
                                                        <span className="truncate">{new Date(appt.startTime || appt.scheduledTime || appt.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })}</span>
                                                        {((appt.status || '').toUpperCase() === 'CONFIRMED' || (appt.status || '').toUpperCase() === 'SCHEDULED') && <CheckCircle2 size={10} />}
                                                    </div>
                                                    <span className="truncate opacity-80 mt-0.5">{appt.contact?.name || appt.customerName || appt.customer}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )
            }

            {
                view === 'kanban' && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pb-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                        {['SCHEDULED', 'CONFIRMED', 'COMPLETED'].map(status => (
                            <div
                                key={status}
                                className="flex flex-col gap-6"
                                onDragOver={onDragOver}
                                onDrop={() => onDrop(status)}
                            >
                                <div className="flex items-center justify-between px-2">
                                    <div className="flex items-center gap-3">
                                        <h3 className="text-xs font-black uppercase tracking-[0.2em] text-gray-900">{status}</h3>
                                        <Badge variant="neutral" className="bg-white border-gray-100 text-gray-400 rounded-lg h-5 px-1.5 min-w-[20px] justify-center">
                                            {appointments.filter(a => {
                                                const s = (a.status || '').toUpperCase();
                                                if (status === 'SCHEDULED') return s === 'SCHEDULED' || s === 'PENDING';
                                                return s === status;
                                            }).length}
                                        </Badge>
                                    </div>
                                    <button className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-400 transition-colors">
                                        <PlusCircle size={14} />
                                    </button>
                                </div>

                                <div className={cn(
                                    "flex flex-col gap-4 min-h-[500px] p-2 rounded-[2.5rem] bg-gray-50/50 border border-dashed border-gray-200/50 transition-colors",
                                    draggedId ? "bg-[#25D366]/5 border-[#25D366]/20" : ""
                                )}>
                                    {appointments.filter(a => {
                                        const s = (a.status || '').toUpperCase();
                                        if (status === 'SCHEDULED') return s === 'SCHEDULED' || s === 'PENDING';
                                        return s === status;
                                    }).map(appt => (
                                        <motion.div
                                            layout
                                            layoutId={appt.id}
                                            key={appt.id}
                                            draggable
                                            onDragStart={() => onDragStart(appt.id)}
                                            onClick={() => setSelected(appt)}
                                            className={cn(
                                                "bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl hover:shadow-gray-200/50 hover:-translate-y-1 transition-all cursor-pointer group relative",
                                                draggedId === appt.id ? "opacity-50 grayscale scale-95" : ""
                                            )}
                                        >
                                            <div className="flex justify-between items-start mb-4">
                                                <div onClick={(e) => e.stopPropagation()} className="relative group/select">
                                                    <select
                                                        value={(appt.status || '').toUpperCase()}
                                                        onChange={(e) => handleStatusChange(appt.id, e.target.value)}
                                                        className={cn(
                                                            "text-[9px] uppercase tracking-widest font-black px-3 py-1.5 rounded-full border bg-white cursor-pointer outline-none transition-all appearance-none text-center min-w-[100px] shadow-sm pr-6",
                                                            getStatusStyles(appt.status).text,
                                                            "border-gray-100 hover:border-gray-300"
                                                        )}
                                                    >
                                                        <option value="SCHEDULED">Scheduled</option>
                                                        <option value="CONFIRMED">Confirmed</option>
                                                        <option value="COMPLETED">Completed</option>
                                                    </select>
                                                    <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400 group-hover/select:text-gray-600">
                                                        <ChevronLeft size={10} className="-rotate-90" />
                                                    </div>
                                                </div>
                                                <button className="p-1 opacity-0 group-hover:opacity-100 transition-opacity text-gray-400 hover:text-gray-900">
                                                    <MoreVertical size={14} />
                                                </button>
                                            </div>

                                            <h4 className="font-bold text-gray-900 mb-1 group-hover:text-[#25D366] transition-colors">{appt.contact?.name || appt.customerName || appt.customer}</h4>
                                            <div className="flex flex-wrap gap-1.5 mb-4">
                                                <p className="text-xs text-gray-500 font-medium line-clamp-1">{appt.serviceInterest || appt.serviceName || appt.service}</p>
                                                {(appt.campaign?.name || appt.campaignName) && (
                                                    <Badge variant="info" className="text-[8px] px-1.5 py-0 shadow-none border-blue-50 bg-blue-50/50 text-blue-500">
                                                        {appt.campaign?.name || appt.campaignName}
                                                    </Badge>
                                                )}
                                            </div>

                                            <div className="pt-4 border-t border-gray-50 flex items-center justify-between">
                                                <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400">
                                                    <Clock size={12} className="text-[#25D366]" />
                                                    {formatDate(appt.startTime || appt.scheduledTime || appt.time)}
                                                </div>
                                                <div className="flex -space-x-2">
                                                    <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-gray-100 to-gray-200 border-2 border-white shadow-sm flex items-center justify-center text-[8px] font-bold text-gray-400">
                                                        {(appt.staff?.name || appt.staffName || 'U')[0]}
                                                    </div>
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                )
            }

            {/* Appointment Detail Side Drawer */}
            <AnimatePresence>
                {selected && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm z-[60]"
                            onClick={() => setSelected(null)}
                        />
                        <motion.div
                            initial={{ x: 600 }} animate={{ x: 0 }} exit={{ x: 600 }}
                            className="fixed top-0 right-0 h-full w-[500px] bg-white z-[70] shadow-2xl flex flex-col"
                        >
                            <header className="p-8 border-b border-gray-100 flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-gray-900 text-white rounded-2xl shadow-xl shadow-gray-200"><Calendar size={20} /></div>
                                    <div>
                                        <h3 className="text-xl font-black text-gray-900">Appointment Intel</h3>
                                        <p className="text-[10px] font-black text-[#25D366] uppercase mt-1 tracking-widest flex items-center gap-1.5"><Sparkles size={10} /> Priority Client</p>
                                    </div>
                                </div>
                                <button onClick={() => setSelected(null)} className="p-3 hover:bg-gray-50 rounded-full text-gray-400"><X size={24} /></button>
                            </header>

                            <div className="flex-1 overflow-y-auto p-12 space-y-12">
                                <section className="flex flex-col items-center">
                                    <div className="w-24 h-24 rounded-[2.5rem] bg-gray-100 flex items-center justify-center text-2xl font-black text-gray-300 shadow-xl border-4 border-white mb-6 uppercase">
                                        {(selected.contact?.name || selected.customerName || selected.customer || "U")[0]}
                                    </div>
                                    <h4 className="text-2xl font-black text-gray-900">{selected.contact?.name || selected.customerName || selected.customer}</h4>

                                    <div className="mt-4 flex flex-col items-center gap-2">
                                        <div className="flex items-center gap-2 text-sm font-bold text-gray-500">
                                            <Phone size={14} className="text-[#25D366]" />
                                            {selected.contact?.phoneNumber || selected.customerPhone || selected.phoneNumber || selected.phone || 'No phone number'}
                                        </div>
                                        {(selected.contact?.email || selected.email) && (
                                            <div className="flex items-center gap-2 text-xs font-medium text-gray-400">
                                                <Mail size={12} />
                                                {selected.contact?.email || selected.email}
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex gap-4 mt-8">
                                        <Button
                                            variant="outline"
                                            className="h-10 px-6 font-black uppercase text-[10px] tracking-widest border-gray-200 hover:border-[#25D366] hover:text-[#25D366] transition-all"
                                            onClick={() => {
                                                const phone = (selected.contact?.phoneNumber || selected.customerPhone || selected.phoneNumber || selected.phone || '').replace(/[^0-9]/g, '');
                                                const contactId = selected.contactId || selected.contact?.id;
                                                navigate(`/inbox?contactId=${contactId}&phone=${phone}`);
                                            }}
                                        >
                                            <MessageCircle size={16} /> WhatsApp
                                        </Button>
                                    </div>
                                </section>

                                <section className="p-8 bg-gray-50/50 rounded-[2.5rem] border border-gray-100 space-y-8">
                                    <div className="space-y-4">
                                        <h5 className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-2">Appointment Information</h5>
                                        <Card className="p-6 bg-white space-y-6">
                                            <div className="flex items-start gap-4">
                                                <div className="p-3 bg-blue-50 text-blue-500 rounded-2xl"><Sparkles size={18} /></div>
                                                <div>
                                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none">Service Requested</p>
                                                    <p className="text-sm font-black text-gray-900 mt-2">{selected.serviceInterest || selected.serviceName || selected.service}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-start gap-4">
                                                <div className="p-3 bg-[#25D366]/10 text-[#25D366] rounded-2xl"><Clock size={18} /></div>
                                                <div>
                                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none">Scheduled For</p>
                                                    <p className="text-sm font-black text-gray-900 mt-2">{formatDate(selected.startTime || selected.scheduledTime || selected.time)}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-start gap-4">
                                                <div className="p-3 bg-purple-50 text-purple-600 rounded-2xl"><MapPin size={18} /></div>
                                                <div>
                                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none">Location / Venue</p>
                                                    <p className="text-sm font-black text-gray-900 mt-2">Sunset Villa, Plot 42, CA</p>
                                                </div>
                                            </div>
                                        </Card>
                                    </div>
                                </section>

                                <section className="space-y-6">
                                    <h5 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] flex items-center gap-3">
                                        <Zap size={14} className="text-blue-500" /> Lead Attribution
                                    </h5>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="p-4 bg-blue-50/50 rounded-2xl border border-blue-100 flex flex-col gap-1">
                                            <span className="text-[9px] font-black text-blue-400 uppercase tracking-widest">Source Campaign</span>
                                            <span className="text-xs font-black text-blue-700 truncate">{selected.campaign?.name || selected.campaignName || 'Direct Organic'}</span>
                                        </div>
                                        <div className="p-4 bg-green-50/50 rounded-2xl border border-green-100 flex flex-col gap-1">
                                            <span className="text-[9px] font-black text-[#25D366] uppercase tracking-widest">Declared Interest</span>
                                            <span className="text-xs font-black text-green-700 truncate">{selected.serviceInterest || 'General Inquiry'}</span>
                                        </div>
                                    </div>
                                    <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 italic">
                                        <p className="text-[10px] leading-relaxed text-gray-500 font-bold">
                                            {selected.campaignId
                                                ? `This client was automatically attributed to the "${selected.campaign?.name || selected.campaignName}" campaign. The AI context is locked to this interest for future interactions.`
                                                : "This client entered the system organically. AI is using general knowledge base for responses."}
                                        </p>
                                    </div>
                                </section>

                                {selected.notes && (
                                    <section className="space-y-6">
                                        <h5 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] flex items-center gap-3">
                                            <MessageCircle size={14} className="text-amber-500" /> History & AI Notes
                                        </h5>
                                        <div className="p-6 bg-amber-50/30 rounded-3xl border border-amber-100/50 relative overflow-hidden">
                                            <div className="absolute top-0 right-0 p-2 opacity-10"><MessageCircle size={40} /></div>
                                            <p className="text-xs font-bold text-amber-900 leading-relaxed relative z-10">
                                                {selected.notes}
                                            </p>
                                        </div>
                                    </section>
                                )}

                                <section className="space-y-6">
                                    <h5 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] flex items-center gap-3">
                                        <PlusCircle size={14} /> Automation Rules
                                    </h5>
                                    <div className="space-y-3">
                                        <div className="p-4 border border-gray-100 rounded-[2rem] flex items-center justify-between group bg-white hover:bg-white shadow-sm transition-all">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 bg-green-50 text-[#25D366] rounded-xl"><Zap size={14} /></div>
                                                <span className="text-xs font-bold text-gray-700">24h Reminder Sent</span>
                                            </div>
                                            <CheckCircle2 size={16} className="text-[#25D366]" />
                                        </div>
                                        <div className="p-4 border border-[#25D366] bg-[#25D366]/5 rounded-[2rem] flex items-center justify-between group shadow-lg shadow-green-100/50">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 bg-[#25D366] text-white rounded-xl"><Zap size={14} /></div>
                                                <span className="text-xs font-black text-gray-900">Send "On My Way" update</span>
                                            </div>
                                            <ChevronRight size={16} className="text-gray-900" />
                                        </div>
                                    </div>
                                </section>
                            </div>

                            <footer className="p-8 border-t border-gray-100 bg-white sticky bottom-0 z-10 grid grid-cols-2 gap-4">
                                <Button variant="outline" className="h-12"><X size={16} /> Cancel Appt.</Button>
                                <Button className="h-12 bg-gray-900 hover:bg-black font-black uppercase text-[10px] tracking-widest">Reschedule Now</Button>
                            </footer>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>


            {/* Staff Manager Modal */}
            <AnimatePresence>
                {isStaffManagerOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm z-[60]"
                            onClick={() => setIsStaffManagerOpen(false)}
                        />
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg bg-white/80 backdrop-blur-xl rounded-[2.5rem] shadow-2xl z-[70] border border-white/20 overflow-hidden"
                        >
                            <header className="p-8 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-gray-900 to-gray-800 text-white">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-white/10 backdrop-blur-md rounded-2xl border border-white/10"><Users size={20} /></div>
                                    <div>
                                        <h3 className="text-xl font-black">Staff Intelligence</h3>
                                        <p className="text-[10px] font-bold text-[#25D366] uppercase tracking-widest mt-1">Manage Your Experts</p>
                                    </div>
                                </div>
                                <button onClick={() => setIsStaffManagerOpen(false)} className="p-3 hover:bg-white/10 rounded-full transition-all group">
                                    <X size={20} className="group-hover:rotate-90 transition-transform" />
                                </button>
                            </header>

                            <div className="px-8 pt-6">
                                <div className="flex p-1 bg-gray-100/30 rounded-2xl border border-gray-100 shadow-sm">
                                    <button
                                        onClick={() => setStaffTab('list')}
                                        className={`flex-1 py-3 px-4 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 ${staffTab === 'list'
                                            ? 'bg-white shadow-md text-gray-900 ring-1 ring-gray-100'
                                            : 'text-gray-400 hover:text-gray-600'
                                            }`}
                                    >
                                        <Users size={14} /> Team Directory
                                    </button>
                                    <button
                                        onClick={() => setStaffTab('create')}
                                        className={`flex-1 py-3 px-4 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 ${staffTab === 'create'
                                            ? 'bg-white shadow-md text-gray-900 ring-1 ring-gray-100'
                                            : 'text-gray-400 hover:text-gray-600'
                                            }`}
                                    >
                                        <PlusCircle size={14} /> Onboard Hero
                                    </button>
                                </div>
                            </div>

                            <div className="max-h-[60vh] overflow-y-auto mt-4">
                                <AnimatePresence mode="wait">
                                    {staffTab === 'list' ? (
                                        <motion.div
                                            key="list"
                                            initial={{ opacity: 0, scale: 0.98 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            exit={{ opacity: 0, scale: 0.98 }}
                                            className="p-8 pt-0 space-y-6"
                                        >
                                            <div className="flex items-center justify-between px-2">
                                                <h5 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Active Experts</h5>
                                                <span className="px-2 py-0.5 bg-[#25D366]/10 rounded-full text-[10px] font-black text-[#25D366]">{staff.length} Active</span>
                                            </div>
                                            <div className="grid gap-3">
                                                {staff.map(s => (
                                                    <div
                                                        key={s.id}
                                                        className="flex items-center justify-between p-4 bg-white/50 rounded-2xl border border-gray-100 group hover:border-[#25D366]/30 hover:shadow-xl hover:shadow-[#25D366]/5 transition-all"
                                                    >
                                                        <div className="flex items-center gap-4">
                                                            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-gray-50 to-gray-100 flex items-center justify-center text-gray-400 group-hover:from-[#25D366]/10 group-hover:to-[#25D366]/5 group-hover:text-[#25D366] transition-all font-black text-lg">
                                                                {(s.name || 'U')[0]}
                                                            </div>
                                                            <div>
                                                                <div className="flex items-center gap-2">
                                                                    <span className="text-sm font-black text-gray-900">{s.name}</span>
                                                                    <span className={`px-2 py-0.5 rounded-md text-[8px] font-black uppercase tracking-wider ${s.role === 'Admin' ? 'bg-purple-50 text-purple-500' :
                                                                        s.role === 'Sales Lead' ? 'bg-blue-50 text-blue-500' :
                                                                            'bg-green-50 text-[#25D366]'
                                                                        }`}>
                                                                        {s.role}
                                                                    </span>
                                                                </div>
                                                                <span className="text-[10px] text-gray-400 font-bold flex items-center gap-1.5 mt-1">
                                                                    <Phone size={10} className="text-[#25D366]" /> {s.phoneNumber}
                                                                </span>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all">
                                                            <button
                                                                onClick={() => {
                                                                    setEditingStaff(s);
                                                                    setStaffTab('create');
                                                                }}
                                                                className="p-2 text-gray-300 hover:text-[#25D366] hover:bg-[#25D366]/5 rounded-xl transition-all"
                                                                title="Edit Hero"
                                                            >
                                                                <Edit2 size={16} />
                                                            </button>
                                                            <button
                                                                onClick={async () => {
                                                                    if (confirm(`Remove ${s.name}?`)) {
                                                                        try {
                                                                            await staffApi.delete(s.id);
                                                                            setStaff(prev => prev.filter(item => item.id !== s.id));
                                                                            toast.success('Staff member removed');
                                                                        } catch (e) {
                                                                            toast.error('Failed to remove staff');
                                                                        }
                                                                    }
                                                                }}
                                                                className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                                                                title="Delete Hero"
                                                            >
                                                                    <Trash2 size={16} />
                                                            </button>
                                                        </div>
                                                    </div>
                                                ))}
                                                {staff.length === 0 && (
                                                    <div className="text-center py-12 border-2 border-dashed border-gray-100 rounded-3xl">
                                                        <p className="text-sm font-bold text-gray-400">Your directory is empty</p>
                                                        <Button variant="ghost" className="mt-2 text-[#25D366] hover:bg-[#25D366]/5 text-[10px] font-black uppercase tracking-widest" onClick={() => setStaffTab('create')}>Onboard Now</Button>
                                                    </div>
                                                )}
                                            </div>
                                        </motion.div>
                                    ) : (
                                        <motion.div
                                            key="create"
                                            initial={{ opacity: 0, scale: 0.98 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            exit={{ opacity: 0, scale: 0.98 }}
                                            className="p-8 pt-0 space-y-6"
                                        >
                                            <div className="p-8 bg-[#25D366]/5 rounded-[2.5rem] border border-dashed border-[#25D366]/20 relative overflow-hidden">
                                                <div className="absolute -top-4 -right-4 p-8 opacity-10 group-hover:scale-110 transition-transform"><PlusCircle size={120} /></div>
                                                <h5 className="text-[10px] font-black text-[#25D366] uppercase tracking-widest mb-1">
                                                    {editingStaff ? 'Edit Expert Profile' : 'New Expert Registration'}
                                                </h5>
                                                <p className="text-sm font-black text-gray-900 mb-8 leading-tight">
                                                    {editingStaff ? `Update details for ${editingStaff.name}.` : 'Fill in the details to onboard \n a new team member.'}
                                                </p>

                                                <form className="space-y-6" onSubmit={async (e) => {
                                                    e.preventDefault();
                                                    const formData = new FormData(e.currentTarget);
                                                    await handleAddStaff(
                                                        formData.get('staffName') as string,
                                                        formData.get('phoneNumber') as string,
                                                        formData.get('role') as string
                                                    );
                                                    setStaffTab('list');
                                                }}>
                                                    <div className="space-y-5">
                                                        <div className="space-y-1.5 flex flex-col items-start w-full">
                                                            <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest px-2">Hero Name</label>
                                                            <Input 
                                                                name="staffName" 
                                                                placeholder="e.g. Alex Rivera" 
                                                                required 
                                                                className="bg-white border-none shadow-sm h-14" 
                                                                defaultValue={editingStaff?.name || ''}
                                                                key={`name-${editingStaff?.id || 'new'}`}
                                                            />
                                                        </div>
                                                        <div className="grid grid-cols-1 gap-5">
                                                            <div className="space-y-1.5 flex flex-col items-start w-full">
                                                                <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest px-2">Phone Number</label>
                                                                <Input 
                                                                    name="phoneNumber" 
                                                                    placeholder="91..." 
                                                                    required 
                                                                    className="bg-white border-none shadow-sm h-14" 
                                                                    defaultValue={editingStaff?.phoneNumber || ''}
                                                                    key={`phone-${editingStaff?.id || 'new'}`}
                                                                />
                                                            </div>
                                                            <div className="space-y-1.5 flex flex-col items-start w-full">
                                                                <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest px-2">Designation</label>
                                                                <select 
                                                                    name="role" 
                                                                    className="w-full px-4 h-14 bg-white border-none shadow-sm rounded-xl text-sm font-bold outline-none ring-1 ring-gray-100 focus:ring-2 focus:ring-[#25D366] transition-all"
                                                                    defaultValue={editingStaff?.role || 'Agent'}
                                                                    key={`role-${editingStaff?.id || 'new'}`}
                                                                >
                                                                    <option value="Agent">Agent</option>
                                                                    <option value="Sales Lead">Sales Lead</option>
                                                                    <option value="Admin">Admin</option>
                                                                </select>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <Button type="submit" className="w-full h-14 bg-gray-900 border-none hover:bg-black shadow-xl mt-4 rounded-2xl flex items-center justify-center gap-3">
                                                        <Zap size={18} className="text-[#25D366]" /> {editingStaff ? 'Save Changes' : 'Complete Onboarding'}
                                                    </Button>
                                                </form>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>

                            <footer className="p-6 bg-white border-t border-gray-100">
                                <Button variant="outline" className="w-full h-12 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-gray-50 transition-colors" onClick={() => setIsStaffManagerOpen(false)}>
                                    Exit Staff Center
                                </Button>
                            </footer>

                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div >
    );
};

export default Appointments;
