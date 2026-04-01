
import React, { useState, useEffect } from 'react';
import {
    ShoppingBag,
    Search,
    Filter,
    ChevronRight,
    MoreVertical,
    Plus,
    Send,
    Clock,
    CheckCircle2,
    Package,
    CreditCard,
    User,
    X,
    PlusCircle,
    ExternalLink,
    MessageCircle,
    Hash,
    Loader2,
    InboxIcon,
    Code2,
    Trash2,
    Eye
} from 'lucide-react';
import { cn, Card, Button, Badge, Input } from '../components/ui';
import { motion, AnimatePresence } from 'framer-motion';
import { webhookOrderApi, WebhookOrder } from '../lib/api/webhookOrderApi';
import { orderApi, Order } from '../lib/api/orderApi';
import { toast } from 'react-hot-toast';

import { useAppSelector, RootState } from '../store';
import { socketClient } from '../lib/socket';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(iso: string): string {
    const d = new Date(iso);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
}

function formatCurrency(amount: number | string | null): string {
    if (amount == null) return '—';
    const num = typeof amount === 'string' ? parseFloat(amount) : amount;
    return `$${num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

const ORDER_STATUS_STYLES: Record<string, string> = {
    pending: 'bg-yellow-50 text-yellow-700 border border-yellow-200',
    confirmed: 'bg-blue-50 text-blue-700 border border-blue-200',
    processing: 'bg-purple-50 text-purple-700 border border-purple-200',
    shipped: 'bg-indigo-50 text-indigo-700 border border-indigo-200',
    delivered: 'bg-green-50 text-green-700 border border-green-200',
    completed: 'bg-green-50 text-green-700 border border-green-200',
    cancelled: 'bg-red-50 text-red-700 border border-red-200',
    refunded: 'bg-gray-50 text-gray-600 border border-gray-200',
};

const PAYMENT_STATUS_STYLES: Record<string, string> = {
    unpaid: 'bg-red-50 text-red-700 border border-red-200',
    pending: 'bg-yellow-50 text-yellow-700 border border-yellow-200',
    paid: 'bg-green-50 text-green-700 border border-green-200',
    failed: 'bg-red-50 text-red-700 border border-red-200',
    refunded: 'bg-gray-50 text-gray-600 border border-gray-200',
};

function OrderStatusBadge({ status, interactive = false, onClick }: { status: string | null; interactive?: boolean; onClick?: (e: React.MouseEvent) => void }) {
    if (!status) return <span className="text-gray-300 text-xs font-bold">—</span>;
    const cls = ORDER_STATUS_STYLES[status.toLowerCase()] ?? 'bg-gray-50 text-gray-600 border border-gray-200';
    return (
        <span 
            onClick={onClick}
            className={cn(
                "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all",
                cls,
                interactive && "cursor-pointer hover:shadow-sm hover:scale-105 active:scale-95"
            )}
        >
            {status}
            {interactive && <ChevronRight size={10} className="rotate-90 opacity-60" />}
        </span>
    );
}

function PaymentStatusBadge({ status }: { status: string | null }) {
    if (!status) return <span className="text-gray-300 text-xs font-bold">—</span>;
    const cls = PAYMENT_STATUS_STYLES[status.toLowerCase()] ?? 'bg-gray-50 text-gray-600 border border-gray-200';
    return (
        <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${cls}`}>
            {status}
        </span>
    );
}

// ─── Component ────────────────────────────────────────────────────────────────

const Orders: React.FC = () => {
    const { user } = useAppSelector((state: RootState) => state.auth);
    const [viewMode, setViewMode] = useState<'native' | 'webhook'>('native');
    const [webhookOrders, setWebhookOrders] = useState<WebhookOrder[]>([]);
    const [nativeOrders, setNativeOrders] = useState<Order[]>([]);
    const [selectedWebhookOrder, setSelectedWebhookOrder] = useState<WebhookOrder | null>(null);
    const [selectedNativeOrder, setSelectedNativeOrder] = useState<Order | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [search, setSearch] = useState('');
    const [openMenuId, setOpenMenuId] = useState<string | null>(null);

    const fetchNativeOrders = async () => {
        try {
            const res = await orderApi.getAll();
            setNativeOrders(res.data.data);
        } catch (err: any) {
            console.error('[Orders] Failed to refresh native orders:', err);
        }
    };

    // ── Fetch on mount ────────────────────────────────────────────────────────
    useEffect(() => {
        const fetchOrders = async () => {
            try {
                setLoading(true);
                setError(null);
                const [webhookRes, nativeRes] = await Promise.all([
                    webhookOrderApi.getAll(),
                    orderApi.getAll()
                ]);
                setWebhookOrders(webhookRes.data.data);
                setNativeOrders(nativeRes.data.data);
            } catch (err: any) {
                console.error('[Orders] Failed to load orders:', err?.message || err);
                setError('Failed to load orders. Please try again.');
            } finally {
                setLoading(false);
            }
        };

        fetchOrders();
    }, []);

    // ── Real-time listener ──────────────────────────────────────────────────
    useEffect(() => {
        if (!user?.tenantId) return;

        const socket = socketClient.connect(user.tenantId);
        if (socket) {
            socket.on('ORDER_CREATED', (data: any) => {
                console.log('[Orders] 🔔 New order detected via socket:', data);
                toast.success('New order received!');
                fetchNativeOrders();
            });
        }

        return () => {
            if (socket) {
                socket.off('ORDER_CREATED');
            }
        };
    }, [user?.tenantId]);

    const updateStatus = async (id: string, status: Order['status']) => {
        try {
            await orderApi.updateStatus(id, status);
            toast.success(`Order status updated to ${status}`);
            fetchNativeOrders();
            if (selectedNativeOrder?.id === id) {
                setSelectedNativeOrder({ ...selectedNativeOrder, status });
            }
        } catch (err: any) {
            toast.error('Failed to update status');
        }
    };

    const handleDeleteNativeOrder = async (id: string) => {
        if (!window.confirm('Are you sure you want to delete this order?')) return;
        try {
            await orderApi.delete(id);
            toast.success('Order deleted');
            fetchNativeOrders();
        } catch (err: any) {
            toast.error('Failed to delete order');
        }
    };

    // ── Filtered list ─────────────────────────────────────────────────────────
    const filteredWebhook = webhookOrders.filter(o => {
        if (!search.trim()) return true;
        const q = search.toLowerCase();
        return (
            o.orderId?.toLowerCase().includes(q) ||
            o.customerName?.toLowerCase().includes(q) ||
            o.clientId?.toLowerCase().includes(q) ||
            o.phone?.toLowerCase().includes(q)
        );
    });

    const filteredNative = nativeOrders.filter(o => {
        if (!search.trim()) return true;
        const q = search.toLowerCase();
        return (
            o.id.toLowerCase().includes(q) ||
            o.contact.name?.toLowerCase().includes(q) ||
            o.contact.phoneNumber?.toLowerCase().includes(q)
        );
    });

    // ── Stats (derived from real data) ────────────────────────────────────────
    const currentOrders = viewMode === 'native' ? nativeOrders : webhookOrders;
    const totalSales = currentOrders.reduce((sum, o) => {
        const amount = viewMode === 'native' 
            ? parseFloat((o as Order).totalAmount) 
            : ((o as WebhookOrder).total ?? 0);
        return sum + amount;
    }, 0);

    const pendingCount = currentOrders.filter(o => {
        const status = viewMode === 'native' ? (o as Order).status : (o as WebhookOrder).orderStatus;
        return status?.toLowerCase() === 'pending';
    }).length;

    const processingCount = currentOrders.filter(o => {
        const status = viewMode === 'native' ? (o as Order).status : (o as WebhookOrder).orderStatus;
        return ['processing', 'confirmed', 'shipped'].includes(status?.toLowerCase() ?? '');
    }).length;

    return (
        <div className="p-8 space-y-8 bg-[#f9fafb]">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-black text-gray-900 leading-none">Order Management</h2>
                    <p className="text-sm font-bold text-gray-400 mt-2">Track, update and send automated WhatsApp order updates</p>
                </div>
                <div className="flex gap-3 items-center">
                    <div className="flex bg-gray-100 p-1 rounded-xl border border-gray-200 mr-4">
                        <button 
                            onClick={() => setViewMode('native')}
                            className={cn(
                                "px-4 py-2 text-xs font-black uppercase tracking-widest rounded-lg transition-all",
                                viewMode === 'native' ? "bg-white text-gray-900 shadow-sm" : "text-gray-400 hover:text-gray-600"
                            )}
                        >
                            Native Orders
                        </button>
                        <button 
                            onClick={() => setViewMode('webhook')}
                            className={cn(
                                "px-4 py-2 text-xs font-black uppercase tracking-widest rounded-lg transition-all",
                                viewMode === 'webhook' ? "bg-white text-gray-900 shadow-sm" : "text-gray-400 hover:text-gray-600"
                            )}
                        >
                            Webhook Orders
                        </button>
                    </div>
                    <Button variant="outline" className="border-gray-200"><PlusCircle size={18} /> New Order</Button>
                </div>
            </div>

            {/* ── Stats Cards ─────────────────────────────────────────────── */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
                <Card className="p-6 bg-white border-gray-100 flex flex-col justify-between group">
                    <div className="flex items-center justify-between mb-2">
                        <div className="p-3 bg-yellow-50 text-yellow-500 rounded-2xl"><Package size={20} /></div>
                        <Badge variant="warning">Live</Badge>
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Pending Orders</p>
                        <h3 className="text-2xl font-black text-gray-900">{loading ? '...' : pendingCount}</h3>
                    </div>
                </Card>
                <Card className="p-6 bg-white border-gray-100 flex flex-col justify-between group">
                    <div className="flex items-center justify-between mb-2">
                        <div className="p-3 bg-blue-50 text-blue-500 rounded-2xl"><Clock size={20} /></div>
                        <Badge variant="info">Live</Badge>
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">In Progress</p>
                        <h3 className="text-2xl font-black text-gray-900">{loading ? '...' : processingCount}</h3>
                    </div>
                </Card>
                <Card className="p-6 bg-white border-gray-100 flex flex-col justify-between group">
                    <div className="flex items-center justify-between mb-2">
                        <div className="p-3 bg-green-50 text-[#25D366] rounded-2xl"><CheckCircle2 size={20} /></div>
                        <Badge variant="success">Live</Badge>
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Total Orders</p>
                        <h3 className="text-2xl font-black text-gray-900">{loading ? '...' : currentOrders.length.toLocaleString()}</h3>
                    </div>
                </Card>
                <Card className="p-8 bg-gray-900 border-none flex flex-col justify-between group shadow-2xl relative overflow-hidden">
                    <div className="absolute -top-4 -right-4 p-2 opacity-10 group-hover:scale-110 transition-transform"><ShoppingBag size={100} className="text-white" /></div>
                    <div className="flex items-center justify-between mb-2 relative z-10">
                        <div className="p-3 bg-[#25D366] text-white rounded-2xl shadow-lg shadow-green-500/20"><CreditCard size={20} /></div>
                    </div>
                    <div className="relative z-10">
                        <p className="text-[10px] font-black text-white/50 uppercase tracking-widest">Total Sales</p>
                        <h3 className="text-3xl font-black text-white mt-1">{loading ? '...' : formatCurrency(totalSales)}</h3>
                    </div>
                </Card>
            </div>

            {/* ── Search Bar ──────────────────────────────────────────────── */}
            <Card className="p-3 bg-white border-gray-100 flex items-center gap-4">
                <div className="flex-1 px-4 py-2 bg-gray-50/50 rounded-xl border border-gray-100 flex items-center gap-3">
                    <Search size={18} className="text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search orders, customers, IDs..."
                        className="bg-transparent text-sm w-full outline-none"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                    />
                </div>
                <Button variant="outline"><Filter size={18} /> Deep Filters</Button>
            </Card>

            {/* ── Orders Table ─────────────────────────────────────────────── */}
            <Card className="overflow-hidden border-gray-100">
                <table className="w-full text-sm text-left">
                    <thead className="bg-gray-50 border-b border-gray-100">
                        <tr>
                            <th className="px-6 py-4 font-black text-gray-400 uppercase text-[10px] tracking-widest">Order ID</th>
                            <th className="px-6 py-4 font-black text-gray-400 uppercase text-[10px] tracking-widest">Customer</th>
                            <th className="px-6 py-4 font-black text-gray-400 uppercase text-[10px] tracking-widest">Amount</th>
                            <th className="px-6 py-4 font-black text-gray-400 uppercase text-[10px] tracking-widest">Order Status</th>
                            <th className="px-6 py-4 font-black text-gray-400 uppercase text-[10px] tracking-widest">Agent</th>
                            <th className="px-6 py-4 font-black text-gray-400 uppercase text-[10px] tracking-widest">Payment</th>
                            <th className="px-6 py-4 font-black text-gray-400 uppercase text-[10px] tracking-widest">Updated</th>
                            <th className="px-6 py-4 font-black text-gray-400 uppercase text-[10px] tracking-widest text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 bg-white">

                        {/* Loading State */}
                        {loading && (
                            <tr>
                                <td colSpan={7} className="px-6 py-16 text-center">
                                    <div className="flex flex-col items-center gap-3 text-gray-400">
                                        <Loader2 size={28} className="animate-spin text-gray-300" />
                                        <p className="text-sm font-bold">Loading orders...</p>
                                    </div>
                                </td>
                            </tr>
                        )}

                        {/* Error State */}
                        {!loading && error && (
                            <tr>
                                <td colSpan={7} className="px-6 py-16 text-center">
                                    <p className="text-sm font-bold text-red-500">{error}</p>
                                </td>
                            </tr>
                        )}

                        {/* Empty State */}
                        {!loading && !error && (viewMode === 'native' ? filteredNative.length === 0 : filteredWebhook.length === 0) && (
                            <tr>
                                <td colSpan={7} className="px-6 py-20 text-center">
                                    <div className="flex flex-col items-center gap-3 text-gray-400">
                                        <InboxIcon size={36} className="text-gray-200" />
                                        <p className="text-sm font-black text-gray-400 uppercase tracking-widest">
                                            {search ? 'No orders match your search' : `No ${viewMode} orders yet`}
                                        </p>
                                        <p className="text-xs font-bold text-gray-300">
                                            {search ? 'Try a different keyword' : `Orders will appear here once ${viewMode === 'native' ? 'AI takes an order' : 'your webhook receives data'}`}
                                        </p>
                                    </div>
                                </td>
                            </tr>
                        )}

                        {/* Real Data Rows (Native) */}
                        {!loading && !error && viewMode === 'native' && filteredNative.map(o => (
                            <tr
                                key={o.id}
                                className="hover:bg-gray-50 transition-colors group cursor-pointer"
                                onClick={() => setSelectedNativeOrder(o)}
                            >
                                <td className="px-6 py-5">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-gray-100 rounded-lg group-hover:bg-gray-900 group-hover:text-white transition-all"><Hash size={14} /></div>
                                        <span className="font-bold text-gray-900">{o.id.slice(0, 8).toUpperCase()}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-5 font-bold text-gray-700">{o.contact.name || <span className="text-gray-400 italic">Unknown</span>}</td>
                                <td className="px-6 py-5">
                                    <span className="font-bold text-gray-900">{formatCurrency(o.totalAmount)}</span>
                                </td>
                                 <td className="px-6 py-5 relative">
                                    <div className="flex items-center">
                                        <OrderStatusBadge 
                                            status={o.status} 
                                            interactive 
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setOpenMenuId(openMenuId === o.id ? null : o.id);
                                            }}
                                        />
                                        
                                        <AnimatePresence>
                                            {openMenuId === o.id && (
                                                <>
                                                    <div 
                                                        className="fixed inset-0 z-10" 
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setOpenMenuId(null);
                                                        }}
                                                    />
                                                    <motion.div
                                                        initial={{ opacity: 0, scale: 0.95, y: -10 }}
                                                        animate={{ opacity: 1, scale: 1, y: 0 }}
                                                        exit={{ opacity: 0, scale: 0.95, y: -10 }}
                                                        className="absolute left-6 mt-12 w-48 bg-white rounded-2xl shadow-2xl border border-gray-100 z-20 overflow-hidden py-2"
                                                        onClick={(e) => e.stopPropagation()}
                                                    >
                                                        <p className="px-4 py-2 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-50 mb-1">Update Status</p>
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                updateStatus(o.id, 'PENDING');
                                                                setOpenMenuId(null);
                                                            }}
                                                            className="w-full px-4 py-2.5 text-left text-sm font-bold text-gray-700 hover:bg-yellow-50 hover:text-yellow-700 flex items-center gap-3 transition-colors"
                                                        >
                                                            <div className="w-1.5 h-1.5 rounded-full bg-yellow-400" />
                                                            Pending
                                                        </button>
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                updateStatus(o.id, 'COMPLETED');
                                                                setOpenMenuId(null);
                                                            }}
                                                            className="w-full px-4 py-2.5 text-left text-sm font-bold text-gray-700 hover:bg-green-50 hover:text-green-700 flex items-center gap-3 transition-colors"
                                                        >
                                                            <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                                                            Completed
                                                        </button>
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                updateStatus(o.id, 'CANCELLED');
                                                                setOpenMenuId(null);
                                                            }}
                                                            className="w-full px-4 py-2.5 text-left text-sm font-bold text-gray-700 hover:bg-red-50 hover:text-red-700 flex items-center gap-3 transition-colors"
                                                        >
                                                            <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
                                                            Cancelled
                                                        </button>
                                                    </motion.div>
                                                </>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                </td>
                                <td className="px-6 py-5">
                                    <div className="flex items-center gap-2">
                                        <Badge variant="neutral" className="bg-gray-50/50 border-gray-200 text-gray-600 font-black">
                                            {o.staff?.name || 'Unassigned'}
                                        </Badge>
                                    </div>
                                </td>
                                <td className="px-6 py-5">
                                    <PaymentStatusBadge status="pending" />
                                </td>
                                <td className="px-6 py-5 text-gray-500 font-bold text-xs">{formatDate(o.createdAt)}</td>
                                <td className="px-6 py-5">
                                    <div className="flex items-center justify-end gap-2">
                                        <button 
                                            onClick={(e) => { e.stopPropagation(); setSelectedNativeOrder(o); }}
                                            className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-all rounded-lg"
                                            title="View Details"
                                        >
                                            <Eye size={18} />
                                        </button>
                                        <button 
                                            onClick={(e) => { 
                                                e.stopPropagation(); 
                                                window.location.href = `/inbox?phone=${o.contact.phoneNumber}&orderId=${o.id}`;
                                            }}
                                            className="p-2 text-gray-400 hover:text-[#25D366] hover:bg-green-50 transition-all rounded-lg"
                                            title="Chat with Customer"
                                        >
                                            <MessageCircle size={18} />
                                        </button>
                                        <button 
                                            onClick={(e) => { e.stopPropagation(); handleDeleteNativeOrder(o.id); }}
                                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 transition-all rounded-lg"
                                            title="Delete Order"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}

                        {/* Real Data Rows (Webhook) */}
                        {!loading && !error && viewMode === 'webhook' && filteredWebhook.map(o => (
                            <tr
                                key={o.id}
                                className="hover:bg-gray-50 transition-colors group cursor-pointer"
                                onClick={() => setSelectedWebhookOrder(o)}
                            >
                                <td className="px-6 py-5">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-gray-100 rounded-lg group-hover:bg-gray-900 group-hover:text-white transition-all"><Hash size={14} /></div>
                                        <span className="font-bold text-gray-900">{o.orderId || <span className="text-gray-400 italic">—</span>}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-5 font-bold text-gray-700">{o.customerName || <span className="text-gray-400 italic">Unknown</span>}</td>
                                <td className="px-6 py-5">
                                    <span className="font-bold text-gray-900">{formatCurrency(o.total)}</span>
                                </td>
                                <td className="px-6 py-5">
                                    <OrderStatusBadge status={o.orderStatus} />
                                </td>
                                <td className="px-6 py-5">
                                    <PaymentStatusBadge status={o.paymentStatus} />
                                </td>
                                <td className="px-6 py-5 text-gray-500 font-bold text-xs">{formatDate(o.updatedAt)}</td>
                                <td className="px-6 py-5 text-right">
                                    <button className="p-2 text-gray-400 hover:text-gray-900 transition-all"><MoreVertical size={18} /></button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </Card>

            {/* ── Order Detail Side Drawer ──────────────────────────────────── */}
            <AnimatePresence>
                {(selectedWebhookOrder || selectedNativeOrder) && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm z-[60]"
                            onClick={() => { setSelectedWebhookOrder(null); setSelectedNativeOrder(null); }}
                        />
                        <motion.div
                            initial={{ x: 600 }} animate={{ x: 0 }} exit={{ x: 600 }}
                            className="fixed top-0 right-0 h-full w-[500px] bg-white z-[70] shadow-2xl flex flex-col"
                        >
                            <header className="p-8 border-b border-gray-100 flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-gray-900 text-white rounded-2xl shadow-xl shadow-gray-200"><ShoppingBag size={20} /></div>
                                    <div>
                                        <h3 className="text-xl font-black text-gray-900 uppercase">Order Details</h3>
                                        <p className="text-[10px] font-black text-[#25D366] uppercase mt-1 tracking-widest">
                                            {selectedNativeOrder ? selectedNativeOrder.id.slice(0, 12).toUpperCase() : (selectedWebhookOrder?.orderId || selectedWebhookOrder?.id.slice(0, 12).toUpperCase())}
                                        </p>
                                    </div>
                                </div>
                                <button onClick={() => { setSelectedWebhookOrder(null); setSelectedNativeOrder(null); }} className="p-3 hover:bg-gray-50 rounded-full text-gray-400"><X size={24} /></button>
                            </header>

                            <div className="flex-1 overflow-y-auto p-8 space-y-8">

                                {/* ── Customer Info ── */}
                                <section className="space-y-4">
                                    <div className="p-6 bg-gray-50/50 rounded-3xl border border-gray-100 flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-2xl bg-white shadow-sm flex items-center justify-center text-gray-400"><User size={24} /></div>
                                            <div>
                                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Customer</p>
                                                <p className="text-lg font-black text-gray-900 mt-0.5">
                                                    {selectedNativeOrder ? (selectedNativeOrder.contact.name || 'Unknown') : (selectedWebhookOrder?.customerName || 'Unknown')}
                                                </p>
                                                {(selectedNativeOrder?.contact.phoneNumber || selectedWebhookOrder?.phone) && (
                                                    <p className="text-xs font-bold text-gray-400 mt-0.5">
                                                        {selectedNativeOrder ? selectedNativeOrder.contact.phoneNumber : selectedWebhookOrder?.phone}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                        <Button variant="outline" size="sm" className="h-10 px-4"><MessageCircle size={16} /> Contact</Button>
                                    </div>
                                </section>

                                {/* ── Order Summary ── */}
                                <section className="space-y-4">
                                    <h5 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] flex items-center gap-3">
                                        <Package size={14} /> Order Summary
                                    </h5>
                                    <div className="space-y-3 text-sm font-bold">
                                        <div className="flex justify-between items-center py-3 border-b border-gray-100">
                                            <span className="text-gray-400 uppercase text-[10px] tracking-widest">Order ID</span>
                                            <span className="text-gray-900 font-black">
                                                {selectedNativeOrder ? selectedNativeOrder.id.slice(0, 8).toUpperCase() : (selectedWebhookOrder?.orderId || '—')}
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-center py-3 border-b border-gray-100">
                                            <span className="text-gray-400 uppercase text-[10px] tracking-widest">Order Status</span>
                                            <OrderStatusBadge status={selectedNativeOrder ? selectedNativeOrder.status : selectedWebhookOrder?.orderStatus ?? null} />
                                        </div>
                                        {selectedWebhookOrder && (
                                            <div className="flex justify-between items-center py-3 border-b border-gray-100">
                                                <span className="text-gray-400 uppercase text-[10px] tracking-widest">Payment Status</span>
                                                <PaymentStatusBadge status={selectedWebhookOrder.paymentStatus} />
                                            </div>
                                        )}
                                        {selectedWebhookOrder && (
                                            <div className="flex justify-between items-center py-3 border-b border-gray-100">
                                                <span className="text-gray-400 uppercase text-[10px] tracking-widest">Client ID</span>
                                                <Badge variant="info">{selectedWebhookOrder.clientId}</Badge>
                                            </div>
                                        )}
                                        {selectedWebhookOrder && (
                                            <div className="flex justify-between items-center py-3 border-b border-gray-100">
                                                <span className="text-gray-400 uppercase text-[10px] tracking-widest">Source</span>
                                                <span className="text-gray-700 capitalize">{selectedWebhookOrder.source}</span>
                                            </div>
                                        )}
                                        <div className="flex justify-between items-center py-3 border-b border-gray-100">
                                            <span className="text-gray-400 uppercase text-[10px] tracking-widest">Created At</span>
                                            <span className="text-gray-700 text-xs">
                                                {new Date(selectedNativeOrder ? selectedNativeOrder.createdAt : (selectedWebhookOrder?.createdAt ?? 0)).toLocaleString()}
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-center pt-3 text-lg">
                                            <span className="text-gray-900 font-black uppercase text-[10px] tracking-widest">Total Amount</span>
                                            <span className="text-gray-900 font-black text-xl">
                                                {formatCurrency(selectedNativeOrder ? selectedNativeOrder.totalAmount : (selectedWebhookOrder?.total ?? 0))}
                                            </span>
                                        </div>
                                    </div>
                                </section>

                                {/* ── Native Order Items ── */}
                                {selectedNativeOrder && selectedNativeOrder.items && selectedNativeOrder.items.length > 0 && (
                                    <section className="space-y-4">
                                        <h5 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] flex items-center gap-3">
                                            <ShoppingBag size={14} /> Items
                                        </h5>
                                        <div className="space-y-3">
                                            {selectedNativeOrder.items.map(item => (
                                                <div key={item.id} className="p-4 bg-gray-50 rounded-2xl flex justify-between items-center border border-gray-100">
                                                    <div>
                                                        <p className="font-black text-gray-900">{item.productName}</p>
                                                        <p className="text-xs font-bold text-gray-400">Qty: {item.quantity}</p>
                                                    </div>
                                                    <p className="font-black text-gray-900">{formatCurrency(item.price)}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </section>
                                )}

                                {/* ── Payment Details (Webhook Only) ── */}
                                {selectedWebhookOrder && (selectedWebhookOrder.paymentStatus || selectedWebhookOrder.paymentMethod || selectedWebhookOrder.paymentAmount || selectedWebhookOrder.paidAt) && (
                                    <section className="space-y-4">
                                        <h5 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] flex items-center gap-3">
                                            <CreditCard size={14} /> Payment Details
                                        </h5>
                                        <div className="p-5 bg-green-50/50 rounded-2xl border border-green-100 space-y-3 text-sm font-bold">
                                            {selectedWebhookOrder.paymentStatus && (
                                                <div className="flex justify-between items-center py-2 border-b border-green-100">
                                                    <span className="text-gray-400 uppercase text-[10px] tracking-widest">Payment Status</span>
                                                    <PaymentStatusBadge status={selectedWebhookOrder.paymentStatus} />
                                                </div>
                                            )}
                                            {selectedWebhookOrder.paymentMethod && (
                                                <div className="flex justify-between items-center py-2 border-b border-green-100">
                                                    <span className="text-gray-400 uppercase text-[10px] tracking-widest">Method</span>
                                                    <span className="text-gray-900 font-black">{selectedWebhookOrder.paymentMethod}</span>
                                                </div>
                                            )}
                                            {selectedWebhookOrder.paymentAmount != null && (
                                                <div className="flex justify-between items-center py-2 border-b border-green-100">
                                                    <span className="text-gray-400 uppercase text-[10px] tracking-widest">Amount Paid</span>
                                                    <span className="text-green-700 font-black">{formatCurrency(selectedWebhookOrder.paymentAmount)}</span>
                                                </div>
                                            )}
                                            {selectedWebhookOrder.paidAt && (
                                                <div className="flex justify-between items-center py-2">
                                                    <span className="text-gray-400 uppercase text-[10px] tracking-widest">Paid At</span>
                                                    <span className="text-gray-700 text-xs">{new Date(selectedWebhookOrder.paidAt).toLocaleString()}</span>
                                                </div>
                                            )}
                                        </div>
                                    </section>
                                )}

                                {/* ── Raw Payload (Webhook Only) ── */}
                                {selectedWebhookOrder && (
                                    <section className="space-y-4">
                                        <h5 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] flex items-center gap-3">
                                            <Code2 size={14} /> Raw Payload
                                        </h5>
                                        <div className="bg-gray-900 rounded-2xl overflow-hidden">
                                            <div className="px-4 py-2 bg-gray-800 flex items-center gap-2">
                                                <div className="w-2 h-2 rounded-full bg-red-400" />
                                                <div className="w-2 h-2 rounded-full bg-yellow-400" />
                                                <div className="w-2 h-2 rounded-full bg-green-400" />
                                                <span className="text-gray-400 text-[10px] font-mono ml-2">payload.json</span>
                                            </div>
                                            <pre className="p-4 text-xs text-green-400 font-mono overflow-x-auto max-h-64 leading-relaxed whitespace-pre-wrap break-all">
                                                {JSON.stringify(selectedWebhookOrder.rawPayload, null, 2)}
                                            </pre>
                                        </div>
                                    </section>
                                )}

                                {/* ── Automations ── */}
                                <section className="p-8 bg-blue-50/50 rounded-[2.5rem] border border-blue-100 space-y-6">
                                    <div className="flex items-center justify-between">
                                        <h5 className="text-[10px] font-black text-blue-600 uppercase tracking-widest flex items-center gap-2"><Send size={14} /> Automations</h5>
                                        <Button variant="outline" className="h-8 text-[10px] px-3 border-blue-200 bg-white text-blue-600">Configure Rule</Button>
                                    </div>
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-2 h-2 bg-[#25D366] rounded-full" />
                                            <p className="text-xs font-bold text-gray-600">WhatsApp update sent at 10:45 AM</p>
                                        </div>
                                        <div className="flex items-center gap-3 opacity-50">
                                            <div className="w-2 h-2 bg-gray-300 rounded-full" />
                                            <p className="text-xs font-bold text-gray-600">Post-purchase survey scheduled for Tuesday</p>
                                        </div>
                                    </div>
                                </section>
                            </div>

                            <footer className="p-8 border-t border-gray-100 bg-white sticky bottom-0 z-10 flex flex-col gap-4">
                                {selectedNativeOrder && selectedNativeOrder.status === 'PENDING' && (
                                    <div className="grid grid-cols-2 gap-4">
                                        <Button 
                                            variant="outline" 
                                            className="h-12 border-red-200 text-red-600 hover:bg-red-50"
                                            onClick={() => updateStatus(selectedNativeOrder.id, 'CANCELLED')}
                                        >
                                            Cancel Order
                                        </Button>
                                        <Button 
                                            className="h-12 bg-green-600 hover:bg-green-700"
                                            onClick={() => updateStatus(selectedNativeOrder.id, 'COMPLETED')}
                                        >
                                            Mark Completed
                                        </Button>
                                    </div>
                                )}
                                <div className="grid grid-cols-2 gap-4">
                                    <Button variant="outline" className="h-12"><ExternalLink size={16} /> Open in CRM</Button>
                                    <Button className="h-12 bg-[#25D366]"><MessageCircle size={18} /> Send Update Now</Button>
                                </div>
                            </footer>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Orders;
