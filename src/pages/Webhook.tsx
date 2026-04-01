
import React, { useState, useEffect } from 'react';
import { Card, SectionHeader, Button, Input, Badge } from '../components/shared';
import { MOCK_WEBHOOK_RECORDS } from '../constants';
import { WebhookRecord, WebhookConfig } from '../types';
import {
    Trash, Plus, Activity, Globe, ArrowDownLeft, ArrowUpRight, Copy, Terminal, Code, Lock, X, Loader2
} from 'lucide-react';
import { webhookApi } from '../lib/api/miscApi';
import toast from 'react-hot-toast';

const Webhook: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'monitor' | 'endpoints'>('monitor');
    const [selectedRecord, setSelectedRecord] = useState<WebhookRecord | null>(null);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [records, setRecords] = useState<WebhookRecord[]>(MOCK_WEBHOOK_RECORDS);
    const [endpoints, setEndpoints] = useState<WebhookConfig[]>([]);
    const [loading, setLoading] = useState(false);
    const [adding, setAdding] = useState(false);

    const [newEndpoint, setNewEndpoint] = useState<Partial<WebhookConfig>>({
        url: '',
        description: '',
        events: ['messages.received'],
        active: true
    });

    useEffect(() => {
        fetchEndpoints();
    }, []);

    const fetchEndpoints = async () => {
        setLoading(true);
        try {
            const { data } = await webhookApi.getAll();
            if (data.success) {
                setEndpoints(data.data);
            }
        } catch (error) {
            toast.error('Failed to load webhook endpoints');
        } finally {
            setLoading(false);
        }
    };

    const handleAddEndpoint = async () => {
        if (!newEndpoint.url) return toast.error('URL is required');

        setAdding(true);
        try {
            const { data } = await webhookApi.register({
                url: newEndpoint.url,
                eventTypes: newEndpoint.events || []
            });
            if (data.success) {
                toast.success('Webhook registered successfully');
                setIsAddModalOpen(false);
                setNewEndpoint({ url: '', description: '', events: ['messages.received'], active: true });
                fetchEndpoints();
            }
        } catch (error) {
            toast.error('Failed to register webhook');
        } finally {
            setAdding(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this webhook?')) return;

        try {
            const { data } = await webhookApi.delete(id);
            if (data.success) {
                toast.success('Webhook deleted');
                fetchEndpoints();
            }
        } catch (error) {
            toast.error('Failed to delete webhook');
        }
    };

    return (
        <div className="p-6 space-y-6">
            <SectionHeader
                title="Webhook & API"
                subtitle="Manage event delivery and monitor data exchange between Agently and your systems"
                action={
                    <div className="flex gap-2">
                        <Button variant="secondary" onClick={() => setRecords([])}><Trash size={16} /> Clear Logs</Button>
                        <Button onClick={() => setIsAddModalOpen(true)}><Plus size={16} /> Add Endpoint</Button>
                    </div>
                }
            />

            <div className="flex gap-1 p-1 bg-gray-100 rounded-xl w-fit">
                <button
                    onClick={() => setActiveTab('monitor')}
                    className={`flex items-center gap-2 px-6 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'monitor' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                >
                    <Activity size={16} /> Monitor Logs
                </button>
                <button
                    onClick={() => setActiveTab('endpoints')}
                    className={`flex items-center gap-2 px-6 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'endpoints' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                >
                    <Globe size={16} /> Endpoints
                </button>
            </div>

            {activeTab === 'monitor' ? (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in duration-300">
                    <Card className="lg:col-span-2 overflow-hidden flex flex-col h-[600px]">
                        <div className="overflow-y-auto flex-1 scrollbar-hide">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-gray-50 border-b border-gray-100 sticky top-0 z-10">
                                    <tr>
                                        <th className="px-6 py-4 font-bold text-gray-400 uppercase text-[10px] tracking-wider">Event</th>
                                        <th className="px-6 py-4 font-bold text-gray-400 uppercase text-[10px] tracking-wider">Status</th>
                                        <th className="px-6 py-4 font-bold text-gray-400 uppercase text-[10px] tracking-wider">Latency</th>
                                        <th className="px-6 py-4 font-bold text-gray-400 uppercase text-[10px] tracking-wider">Time</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 bg-white">
                                    {records.map(record => (
                                        <tr
                                            key={record.id}
                                            onClick={() => setSelectedRecord(record)}
                                            className={`cursor-pointer transition-colors ${selectedRecord?.id === record.id ? 'bg-[#25D366]/5' : 'hover:bg-gray-50'}`}
                                        >
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className={`p-1.5 rounded ${record.direction === 'Inbound' ? 'bg-blue-50 text-blue-500' : 'bg-purple-50 text-purple-500'}`}>
                                                        {record.direction === 'Inbound' ? <ArrowDownLeft size={14} /> : <ArrowUpRight size={14} />}
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-gray-900">{record.event}</p>
                                                        <p className="text-[10px] text-gray-400 font-mono">{record.id}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${record.status === 200 ? 'bg-green-50 text-green-600 border border-green-100' : 'bg-red-50 text-red-600 border border-red-100'}`}>
                                                    {record.status} {record.status === 200 ? 'OK' : 'Error'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-gray-500 font-mono text-xs">{record.latency}</td>
                                            <td className="px-6 py-4 text-gray-400 text-xs">{record.timestamp.split(' ')[1]}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </Card>

                    <Card className="bg-gray-900 text-green-400 flex flex-col h-[600px] shadow-2xl overflow-hidden border-none text-[10px]">
                        <div className="p-4 border-b border-gray-800 flex items-center justify-between bg-gray-950">
                            <div className="flex items-center gap-2">
                                <Terminal size={16} />
                                <span className="text-xs font-bold uppercase tracking-widest text-gray-400">Payload Inspector</span>
                            </div>
                            {selectedRecord && (
                                <button onClick={() => navigator.clipboard.writeText(selectedRecord.payload)} className="p-1 hover:text-white transition-colors"><Copy size={16} /></button>
                            )}
                        </div>
                        <div className="flex-1 p-4 font-mono overflow-auto scrollbar-hide leading-relaxed">
                            {selectedRecord ? (
                                <pre className="whitespace-pre-wrap">{selectedRecord.payload}</pre>
                            ) : (
                                <div className="h-full flex flex-col items-center justify-center text-gray-600 space-y-4">
                                    <Code size={48} className="opacity-10" />
                                    <p className="text-center italic">Select a record from the list to view its raw JSON payload.</p>
                                </div>
                            )}
                        </div>
                    </Card>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in duration-300">
                    {loading && endpoints.length === 0 && (
                        <div className="col-span-full py-20 flex flex-col items-center text-gray-400">
                            <Loader2 className="animate-spin mb-4" size={40} />
                            <p className="font-bold uppercase tracking-widest text-xs">Loading Endpoints...</p>
                        </div>
                    )}
                    {endpoints.map(cfg => (
                        <Card key={cfg.id} className="p-6 hover:shadow-md transition-shadow">
                            <div className="flex justify-between items-start mb-4">
                                <div className="flex items-center gap-3">
                                    <div className={`p-2 rounded-lg ${cfg.active ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
                                        <Globe size={20} />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-gray-900">{cfg.description || 'No description'}</h4>
                                        <p className="text-xs text-gray-500 truncate max-w-[200px]">{cfg.url}</p>
                                    </div>
                                </div>
                                <Badge variant={cfg.active ? 'success' : 'neutral'}>{cfg.active ? 'Active' : 'Disabled'}</Badge>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-2">Subscribed Events</label>
                                    <div className="flex flex-wrap gap-1.5">
                                        {(cfg.eventTypes || cfg.events || []).map(e => (
                                            <span key={e} className="px-2 py-0.5 bg-gray-50 text-gray-600 rounded text-[10px] border border-gray-100">{e}</span>
                                        ))}
                                    </div>
                                </div>

                                <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
                                    <div className="flex items-center gap-1.5 text-xs text-gray-400">
                                        <Lock size={12} /> {cfg.secret || '••••••••'}
                                    </div>
                                    <div className="flex gap-2">
                                        <button className="text-[11px] font-bold text-[#25D366] hover:underline">Edit</button>
                                        <button
                                            onClick={() => handleDelete(cfg.id)}
                                            className="text-[11px] font-bold text-red-500 hover:underline"
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </Card>
                    ))}

                    <button
                        onClick={() => setIsAddModalOpen(true)}
                        className="border-2 border-dashed border-gray-200 rounded-xl flex flex-col items-center justify-center p-8 hover:bg-gray-50 hover:border-[#25D366] transition-all group"
                    >
                        <div className="w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center text-gray-300 group-hover:bg-[#25D366]/10 group-hover:text-[#25D366] mb-3">
                            <Plus size={24} />
                        </div>
                        <p className="font-bold text-gray-400 group-hover:text-gray-600">Add New Endpoint</p>
                    </button>
                </div>
            )}

            {/* Add Webhook Modal */}
            {isAddModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setIsAddModalOpen(false)} />
                    <Card className="relative w-full max-w-md p-0 overflow-hidden shadow-2xl">
                        <div className="p-6 border-b flex justify-between items-center bg-gray-50">
                            <h3 className="text-lg font-bold">Register API/Webhook</h3>
                            <button onClick={() => setIsAddModalOpen(false)} className="p-1 hover:bg-white rounded-full"><X size={20} /></button>
                        </div>
                        <div className="p-6 space-y-4">
                            <Input label="Target URL" placeholder="https://your-domain.com/webhook" value={newEndpoint.url || ''} onChange={(e: any) => setNewEndpoint({ ...newEndpoint, url: e.target.value })} />
                            <Input label="Description" placeholder="e.g. Data Warehouse Sync" value={newEndpoint.description || ''} onChange={(e: any) => setNewEndpoint({ ...newEndpoint, description: e.target.value })} />

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">Events to subscribe</label>
                                <div className="grid grid-cols-2 gap-2">
                                    {['MESSAGE_RECEIVED', 'MESSAGE_SENT', 'ORDER_CREATED', 'TEMPLATE_STATUS_CHANGED'].map(event => (
                                        <label key={event} className="flex items-center gap-2 p-2 border rounded-lg text-[10px] font-bold cursor-pointer hover:bg-gray-50">
                                            <input
                                                type="checkbox"
                                                checked={newEndpoint.events?.includes(event)}
                                                onChange={(e) => {
                                                    const current = newEndpoint.events || [];
                                                    if (e.target.checked) setNewEndpoint({ ...newEndpoint, events: [...current, event] });
                                                    else setNewEndpoint({ ...newEndpoint, events: current.filter(ev => ev !== event) });
                                                }}
                                                className="accent-[#25D366]"
                                            />
                                            {event}
                                        </label>
                                    ))}
                                </div>
                            </div>
                        </div>
                        <div className="p-6 bg-gray-50 border-t flex gap-3">
                            <Button variant="secondary" className="flex-1" onClick={() => setIsAddModalOpen(false)}>Cancel</Button>
                            <Button className="flex-1" onClick={handleAddEndpoint} disabled={adding}>
                                {adding ? <Loader2 className="animate-spin" size={16} /> : 'Create Endpoint'}
                            </Button>
                        </div>
                    </Card>
                </div>
            )}
        </div>
    );
};

export default Webhook;
