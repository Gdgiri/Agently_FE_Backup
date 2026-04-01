import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Card, Button, Badge,
    Table, TableHeader, TableBody, TableRow, TableCell,
    Input
} from '../components/ui';
import {
    ArrowLeft, Send, Check, Zap, X, Trash2, Edit2,
    Search, Phone, Clock, AlertCircle, RefreshCcw,
    FileText, Users, Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppDispatch } from '../store';
import {
    fetchCampaignByIdAsync,
    deleteCampaignAsync,
    updateCampaignAsync
} from '../features/campaignSlice';
import { socketClient } from '../lib/socket';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

const CampaignDetail: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const dispatch = useAppDispatch();

    const [campaign, setCampaign] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    // Edit State
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editName, setEditName] = useState('');
    const [editParams, setEditParams] = useState<string[]>([]);
    const [isUpdating, setIsUpdating] = useState(false);

    const loadCampaign = async () => {
        if (!id) return;
        setLoading(true);
        try {
            const result = await dispatch(fetchCampaignByIdAsync(id)).unwrap();
            setCampaign(result);
            setEditName(result.name);
            setEditParams(result.templateParams || []);
        } catch (error: any) {
            toast.error(error || 'Failed to load campaign');
            navigate('/campaigns');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadCampaign();

        const socket = socketClient.socket;
        const handleUpdate = (data: any) => {
            if (data.campaignId === id) {
                console.log('[CampaignDetail] Live update received:', data);
                // We reload the whole thing to stay in sync with recipients
                loadCampaign();
            }
        };

        if (socket) {
            socket.on('campaign:updated', handleUpdate);
        }

        return () => {
            if (socket) socket.off('campaign:updated', handleUpdate);
        };
    }, [id]);

    const handleDelete = async () => {
        if (!window.confirm('Are you sure you want to delete this campaign? This action cannot be undone.')) return;

        try {
            await dispatch(deleteCampaignAsync(id!)).unwrap();
            toast.success('Campaign deleted');
            navigate('/campaigns');
        } catch (error: any) {
            toast.error(error || 'Failed to delete campaign');
        }
    };

    const handleUpdate = async () => {
        if (!editName.trim()) return toast.error('Name is required');
        setIsUpdating(true);
        try {
            await dispatch(updateCampaignAsync({
                id: id!,
                data: { name: editName, templateParams: editParams }
            })).unwrap();
            toast.success('Campaign updated');
            setIsEditModalOpen(false);
            loadCampaign();
        } catch (error: any) {
            toast.error(error || 'Failed to update campaign');
        } finally {
            setIsUpdating(false);
        }
    };

    if (loading && !campaign) {
        return (
            <div className="flex flex-col items-center justify-center h-screen space-y-4">
                <RefreshCcw className="animate-spin text-[#25D366]" size={32} />
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Fetching campaign data...</p>
            </div>
        );
    }

    if (!campaign) return null;

    const filteredRecipients = campaign.recipients?.filter((r: any) =>
        r.contact?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.contact?.phoneNumber.includes(searchTerm)
    ) || [];

    return (
        <div className="p-8 space-y-8 bg-[#f9fafb]">
            <div className="flex items-center gap-4">
                <Button variant="ghost" onClick={() => navigate('/campaigns')} className="rounded-xl border border-gray-100 bg-white shadow-sm h-10 w-10 p-0">
                    <ArrowLeft size={18} />
                </Button>
                <div>
                    <h1 className="text-2xl font-black text-gray-900 tracking-tight">{campaign.name}</h1>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">
                        Campaign ID: {campaign.id.substring(0, 8)} | Launched {format(new Date(campaign.createdAt), 'MMM dd, yyyy HH:mm')}
                    </p>
                </div>
                <div className="ml-auto flex gap-2">
                    {campaign.status !== 'RUNNING' && (
                        <Button variant="outline" onClick={() => setIsEditModalOpen(true)} className="rounded-xl border border-gray-100 bg-white shadow-sm h-10 px-4">
                            <Edit2 size={16} className="mr-2" /> Edit
                        </Button>
                    )}
                    <Button variant="ghost" onClick={handleDelete} className="rounded-xl border border-red-50 text-red-500 bg-white shadow-sm hover:bg-red-50 h-10 px-4">
                        <Trash2 size={16} className="mr-2" /> Delete
                    </Button>
                </div>
            </div>

            {/* Edit Modal */}
            <AnimatePresence>
                {isEditModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsEditModalOpen(false)}
                            className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="bg-white rounded-[32px] shadow-2xl w-full max-w-lg overflow-hidden relative z-10 p-8 border border-white/20"
                        >
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-xl font-black text-gray-900 tracking-tight flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-2xl bg-green-50 flex items-center justify-center text-[#25D366]">
                                        <Edit2 size={20} />
                                    </div>
                                    Edit Campaign
                                </h2>
                                <button onClick={() => setIsEditModalOpen(false)} className="text-gray-400 hover:text-gray-900 transition-colors">
                                    <X size={24} />
                                </button>
                            </div>

                            <div className="space-y-6">
                                <Input
                                    label="Campaign Name"
                                    placeholder="Enter new name"
                                    value={editName}
                                    onChange={(e) => setEditName(e.target.value)}
                                />

                                {campaign.templateParams && campaign.templateParams.length > 0 && (
                                    <div className="space-y-4">
                                        <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Template Variables</label>
                                        {editParams.map((param, index) => (
                                            <div key={index} className="flex gap-4 items-center group">
                                                <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-[10px] font-black text-gray-400 group-hover:bg-[#25D366] group-hover:text-white transition-colors">
                                                    #{index + 1}
                                                </div>
                                                <input
                                                    type="text"
                                                    className="flex-1 px-4 py-2 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:ring-2 focus:ring-[#25D366]/20 outline-none transition-all"
                                                    value={param}
                                                    onChange={(e) => {
                                                        const newParams = [...editParams];
                                                        newParams[index] = e.target.value;
                                                        setEditParams(newParams);
                                                    }}
                                                />
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div className="flex gap-4 mt-8">
                                <Button variant="outline" className="flex-1 h-12 rounded-2xl" onClick={() => setIsEditModalOpen(false)}>Cancel</Button>
                                <Button variant="primary" className="flex-1 h-12 rounded-2xl" onClick={handleUpdate} disabled={isUpdating}>
                                    {isUpdating ? <RefreshCcw className="animate-spin mr-2" size={16} /> : <Check className="mr-2" size={16} />}
                                    Save Changes
                                </Button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <Card className="p-6 relative overflow-hidden group font-black">
                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-110 transition-transform">
                        <Send size={60} />
                    </div>
                    <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Total Sent</h4>
                    <div className="text-3xl font-black text-gray-900">{campaign.totalSent}</div>
                </Card>

                <Card className="p-6 relative overflow-hidden group border-b-2 border-b-[#25D366]">
                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-110 transition-transform">
                        <Check size={60} />
                    </div>
                    <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Delivered</h4>
                    <div className="text-3xl font-black text-gray-900">{campaign.totalDelivered}</div>
                </Card>

                <Card className="p-6 relative overflow-hidden group border-b-2 border-b-[#34b7f1]">
                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-110 transition-transform">
                        <Zap size={60} />
                    </div>
                    <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Read Rate</h4>
                    <div className="text-3xl font-black text-gray-900">
                        {campaign.totalSent > 0 ? ((campaign.totalRead / campaign.totalSent) * 100).toFixed(1) : 0}%
                    </div>
                    <div className="text-[10px] font-bold text-blue-400 mt-2 uppercase">{campaign.totalRead} total reads</div>
                </Card>

                <Card className="p-6 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-110 transition-transform">
                        <X size={60} />
                    </div>
                    <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Failures</h4>
                    <div className="text-3xl font-black text-red-500">{campaign.totalFailed}</div>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left: Recipients List */}
                <div className="lg:col-span-2 space-y-6">
                    <Card className="p-6 rounded-3xl border-none shadow-sm">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="font-black text-gray-900 tracking-tight">Recipients Tracking</h3>
                            <div className="relative w-64">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                                <input
                                    type="text"
                                    placeholder="Search contacts..."
                                    className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-100 rounded-2xl text-sm focus:ring-2 focus:ring-[#25D366] outline-none"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow className="bg-gray-50 border-none">
                                        <TableCell className="text-[10px] font-black text-gray-400 uppercase tracking-widest text-left">Contact</TableCell>
                                        <TableCell className="text-[10px] font-black text-gray-400 uppercase tracking-widest text-left">Status</TableCell>
                                        <TableCell className="text-[10px] font-black text-gray-400 uppercase tracking-widest text-left">Engagement</TableCell>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredRecipients.map((recipient: any) => (
                                        <TableRow key={recipient.id} className="hover:bg-gray-50/50 border-b border-gray-100 transition-colors group">
                                            <TableCell className="py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-2xl bg-gray-100 flex items-center justify-center text-gray-600 font-bold group-hover:scale-105 transition-transform uppercase">
                                                        {recipient.contact?.name?.charAt(0) || 'U'}
                                                    </div>
                                                    <div>
                                                        <div className="font-black text-gray-900 text-sm">{recipient.contact?.name || 'Unknown Client'}</div>
                                                        <div className="text-xs text-gray-400 font-bold flex items-center gap-1">
                                                            <Phone size={10} /> {recipient.contact?.phoneNumber}
                                                        </div>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge
                                                    variant={
                                                        recipient.status === 'READ' ? 'info' :
                                                            recipient.status === 'DELIVERED' ? 'success' :
                                                                recipient.status === 'SENT' ? 'neutral' : 'error'
                                                    }
                                                >
                                                    {recipient.status}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <div className="space-y-1">
                                                    {recipient.sentAt && (
                                                        <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase">
                                                            <Clock size={10} /> Sent: {format(new Date(recipient.sentAt), 'HH:mm')}
                                                        </div>
                                                    )}
                                                    {recipient.readAt && (
                                                        <div className="flex items-center gap-2 text-[10px] font-black text-[#34b7f1] uppercase">
                                                            <Zap size={10} /> Read: {format(new Date(recipient.readAt), 'HH:mm')}
                                                        </div>
                                                    )}
                                                    {recipient.errorMessage && (
                                                        <div className="flex items-center gap-2 text-[10px] font-bold text-red-400 uppercase italic">
                                                            <AlertCircle size={10} /> {recipient.errorMessage}
                                                        </div>
                                                    )}
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                    {filteredRecipients.length === 0 && (
                                        <TableRow>
                                            <TableCell colSpan={3} className="text-center py-12 text-gray-400 font-bold italic">
                                                No recipients found matching your search.
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </Card>
                </div>

                {/* Right: Campaign Config & Template Preview */}
                <div className="space-y-6">
                    <Card className="p-6 rounded-3xl border-none shadow-sm flex flex-col gap-4">
                        <h3 className="font-black text-gray-900 tracking-tight flex items-center gap-2">
                            <FileText size={18} className="text-[#25D366]" /> Template Details
                        </h3>
                        <div className="space-y-4">
                            <div>
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">WABA Template ID</label>
                                <div className="mt-1 p-3 bg-gray-50 rounded-2xl font-mono text-xs break-all">{campaign.templateId}</div>
                            </div>

                            <div>
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Variable Components</label>
                                <div className="mt-2 space-y-2">
                                    {(campaign.templateParams as string[])?.map((p: string, i: number) => (
                                        <div key={i} className="flex items-center gap-2">
                                            <span className="w-5 h-5 flex items-center justify-center bg-gray-100 text-[10px] font-black rounded-lg">#{i + 1}</span>
                                            <span className="text-sm font-bold text-gray-700">{p}</span>
                                        </div>
                                    ))}
                                    {(!campaign.templateParams || campaign.templateParams.length === 0) && (
                                        <p className="text-xs text-gray-400 italic">No variables defined for this template.</p>
                                    )}
                                </div>
                            </div>

                            <div className="pt-4 mt-4 border-t border-gray-100">
                                <div className="text-xs font-bold text-gray-500 italic leading-relaxed bg-gray-50 p-4 rounded-2xl border-l-4 border-l-[#25D366]">
                                    "Your real-time metrics update automatically as Meta sends signals. If a status stays as 'SENT', it usually means the customer's phone is currently offline or they haven't received the bridge yet."
                                </div>
                            </div>
                        </div>
                    </Card>

                    <Card className="p-6 rounded-3xl border-none shadow-sm bg-gradient-to-br from-[#25D366] to-[#1ebe5d] text-white">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-inner">
                                <Users size={20} />
                            </div>
                            <h3 className="font-black tracking-tight">Broadcast Health</h3>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <div className="flex justify-between text-[10px] font-black uppercase mb-1">
                                    <span>Delivery Success</span>
                                    <span>{campaign.totalSent > 0 ? ((campaign.totalDelivered / campaign.totalSent) * 100).toFixed(0) : 0}%</span>
                                </div>
                                <div className="h-1.5 w-full bg-white/20 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-white"
                                        style={{ width: `${campaign.totalSent > 0 ? (campaign.totalDelivered / campaign.totalSent) * 100 : 0}%` }}
                                    />
                                </div>
                            </div>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default CampaignDetail;
