
import React from 'react';
import {
    MessageSquare,
    CheckCircle2,
    Zap,
    ShoppingBag,
    ArrowUpRight,
    Sparkles,
    ChevronRight,
    Activity,
    Smartphone,
    ExternalLink,
    PlusCircle
} from 'lucide-react';
import { Card, Button, Badge } from '../components/ui';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { motion } from 'framer-motion';
import { useAppSelector, RootState } from '../store';
import { format } from 'date-fns';

const Overview: React.FC = () => {
    const { stats, loading } = useAppSelector((state: RootState) => state.dashboard);

    if (loading || !stats) {
        return (
            <div className="p-8 space-y-8 animate-pulse">
                <div className="h-8 bg-gray-100 rounded-lg w-48" />
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[1, 2, 3, 4].map(i => <div key={i} className="h-32 bg-gray-100 rounded-2xl" />)}
                </div>
                <div className="h-96 bg-gray-100 rounded-2xl" />
            </div>
        );
    }

    const { metrics, recentTransactions, activeBookings, chartData } = stats;

    return (
        <div className="p-8 space-y-8 bg-[#f9fafb]">
            {/* 1. Header with Welcome */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-black text-gray-900 leading-none">COMMAND CENTER (LIVE TEST)</h2>
                    <div className="text-sm font-bold text-gray-400 mt-3 flex items-center gap-2">
                        <span className="w-2 h-2 bg-[#25D366] rounded-full animate-pulse" />
                        Live: All systems operational across 4 regions
                    </div>
                </div>
                <div className="flex gap-4">
                    <Button variant="outline" className="border-gray-200 shadow-none"><ExternalLink size={16} /> Meta Dashboard</Button>
                    <Button className="shadow-2xl shadow-green-100"><PlusCircle size={18} /> Start Automation</Button>
                </div>
            </div>

            {/* 2. Key Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="p-8 space-y-4 hover:shadow-2xl transition-all group overflow-hidden relative">
                    <div className="absolute top-0 right-0 p-4 opacity-[0.03] group-hover:scale-125 transition-transform"><MessageSquare size={100} /></div>
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-3 bg-[#25D366]/10 text-[#25D366] rounded-2xl"><MessageSquare size={24} /></div>
                        <Badge variant="success">+{Math.floor(Math.random() * 20)}%</Badge>
                    </div>
                    <h3 className="text-3xl font-black text-gray-900 tracking-tight">{(metrics.totalMessages / 1000).toFixed(1)}K</h3>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">Total Messages Sent</p>
                </Card>
                <Card className="p-8 space-y-4 hover:shadow-2xl transition-all group overflow-hidden relative">
                    <div className="absolute top-0 right-0 p-4 opacity-[0.03] group-hover:scale-125 transition-transform"><CheckCircle2 size={100} /></div>
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-3 bg-blue-50 text-blue-500 rounded-2xl"><CheckCircle2 size={24} /></div>
                        <Badge variant="info">{metrics.deliveryRate}%</Badge>
                    </div>
                    <h3 className="text-3xl font-black text-gray-900 tracking-tight">{(metrics.totalMessages * parseFloat(metrics.deliveryRate) / 100000).toFixed(1)}K</h3>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">Delivery Success</p>
                </Card>
                <Card className="p-8 space-y-4 hover:shadow-2xl transition-all group overflow-hidden relative">
                    <div className="absolute top-0 right-0 p-4 opacity-[0.03] group-hover:scale-125 transition-transform"><Zap size={100} /></div>
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-3 bg-yellow-50 text-yellow-600 rounded-2xl"><Zap size={24} /></div>
                        <Badge variant="warning">+24%</Badge>
                    </div>
                    <h3 className="text-3xl font-black text-gray-900 tracking-tight">{metrics.flowExecutions.toLocaleString()}</h3>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">Flow Executions</p>
                </Card>
                <Card className="p-8 space-y-4 hover:shadow-2xl transition-all group overflow-hidden relative">
                    <div className="absolute top-0 right-0 p-4 opacity-[0.03] group-hover:scale-125 transition-transform"><ShoppingBag size={100} /></div>
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-3 bg-purple-50 text-purple-600 rounded-2xl"><ShoppingBag size={24} /></div>
                        <Badge variant="neutral">LIVE</Badge>
                    </div>
                    <h3 className="text-3xl font-black text-gray-900 tracking-tight">${metrics.revenue.toLocaleString()}</h3>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">Attributed Revenue</p>
                </Card>
            </div>

            {/* 3. Main Chart & Secondary Widgets */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                <Card className="lg:col-span-2 p-8 space-y-8 bg-white border-gray-100 shadow-xl shadow-gray-200/20">
                    <div className="flex items-center justify-between">
                        <div>
                            <h4 className="text-xl font-black text-gray-900 leading-none">Communication Flow</h4>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-2 px-1">Weekly interaction logs across all channels</p>
                        </div>
                        <div className="flex p-1 bg-gray-50 rounded-xl">
                            <button className="px-4 py-1.5 bg-white shadow-sm rounded-lg text-[10px] font-black uppercase tracking-wider text-gray-900">Weekly</button>
                            <button className="px-4 py-1.5 text-[10px] font-black uppercase tracking-wider text-gray-400 hover:text-gray-900 transition-colors">Monthly</button>
                        </div>
                    </div>

                    <div className="h-[340px] w-full font-mono">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={chartData && chartData.length > 0 ? chartData : [{ name: 'Mon', total: 0 }, { name: 'Sun', total: 0 }]}>
                                <defs>
                                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#25D366" stopOpacity={0.15} />
                                        <stop offset="95%" stopColor="#25D366" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} fontSize={10} fontWeight="900" />
                                <YAxis axisLine={false} tickLine={false} fontSize={10} fontWeight="900" />
                                <Tooltip
                                    contentStyle={{ border: 'none', borderRadius: '1.5rem', boxShadow: '0 20px 50px rgba(0,0,0,0.1)' }}
                                />
                                <Area type="monotone" dataKey="total" stroke="#25D366" strokeWidth={4} fillOpacity={1} fill="url(#colorValue)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </Card>

                <aside className="space-y-6">
                    <Card className="p-8 space-y-6 bg-gradient-to-br from-gray-900 to-gray-800 border-none shadow-2xl relative overflow-hidden group">
                        <div className="absolute -right-4 -bottom-4 opacity-10 group-hover:scale-110 transition-transform"><Smartphone size={120} className="text-white" /></div>
                        <h4 className="text-white font-black text-lg leading-tight">WABA Sync Health</h4>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center text-[10px] font-black text-white/40 uppercase tracking-widest">
                                <span>Meta Connection</span>
                                <span className="text-green-400">Stable</span>
                            </div>
                            <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                                <motion.div initial={{ width: 0 }} animate={{ width: '92%' }} className="h-full bg-green-400" />
                            </div>
                            <div className="flex justify-between items-center pt-4">
                                <div className="flex -space-x-2">
                                    {[1, 2, 3].map(i => <div key={i} className="w-8 h-8 rounded-full border-2 border-gray-900 bg-gray-100" />)}
                                </div>
                                <span className="text-[10px] font-black text-white/60 uppercase tracking-widest">4 Node Clusters</span>
                            </div>
                        </div>
                        <button className="w-full mt-4 py-3 bg-[#25D366] text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-xl hover:scale-[1.02] transition-transform">Advanced Intel</button>
                    </Card>

                    <Card className="p-8 space-y-6 border-gray-100">
                        <h4 className="font-black text-gray-900">Quick Actions</h4>
                        <div className="space-y-3">
                            <button className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl flex items-center justify-between group hover:border-[#25D366] transition-all">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-white rounded-xl shadow-inner text-gray-400 group-hover:text-[#25D366] transition-colors"><Zap size={14} /></div>
                                    <span className="text-xs font-bold text-gray-700">Deploy New Flow</span>
                                </div>
                                <ChevronRight size={14} className="text-gray-300 group-hover:text-gray-900" />
                            </button>
                            <button className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl flex items-center justify-between group hover:border-[#25D366] transition-all">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-white rounded-xl shadow-inner text-gray-400 group-hover:text-[#25D366] transition-colors"><MessageSquare size={14} /></div>
                                    <span className="text-xs font-bold text-gray-700">Send Template Bulk</span>
                                </div>
                                <ChevronRight size={14} className="text-gray-300 group-hover:text-gray-900" />
                            </button>
                        </div>
                    </Card>
                </aside>
            </div>

            {/* 4. Secondary Row: Activity + Top Performers */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                <Card className="p-8 space-y-8 bg-white border-gray-100 h-full">
                    <div className="flex items-center justify-between">
                        <h4 className="text-lg font-black text-gray-900">Recent Transactions</h4>
                        <button className="text-[10px] font-black uppercase tracking-widest text-[#25D366] hover:underline">View All</button>
                    </div>
                    <div className="space-y-6">
                        {recentTransactions.length > 0 ? recentTransactions.map((item, i) => (
                            <div key={i} className="flex items-center justify-between group cursor-pointer">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400 font-black uppercase group-hover:bg-gray-100 transition-colors">{(item.user || 'A').charAt(0)}</div>
                                    <div>
                                        <p className="text-sm font-black text-gray-900">{item.user}</p>
                                        <p className="text-[10px] font-bold text-gray-400 uppercase mt-0.5 tracking-widest">{item.item}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm font-black text-gray-900">{item.amount}</p>
                                    <p className="text-[10px] font-bold text-gray-400 mt-0.5 tracking-widest">{format(new Date(item.time), 'HH:mm')}</p>
                                </div>
                            </div>
                        )) : <p className="text-xs text-gray-400 text-center py-10">No recent transactions</p>}
                    </div>
                </Card>

                <Card className="p-8 space-y-8 bg-white border-gray-100 h-full">
                    <div className="flex items-center justify-between">
                        <h4 className="text-lg font-black text-gray-900">Active Bookings</h4>
                        <button className="text-[10px] font-black uppercase tracking-widest text-[#25D366] hover:underline">Calendar</button>
                    </div>
                    <div className="space-y-6">
                        {activeBookings.length > 0 ? activeBookings.map((staff, i) => (
                            <div key={i} className="flex items-center justify-between p-4 bg-gray-50/50 rounded-2xl border border-gray-100 hover:border-[#25D366] transition-all cursor-pointer">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-gray-200" />
                                    <div>
                                        <p className="text-xs font-black text-gray-900">{staff.user}</p>
                                        <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">{staff.role}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-1 text-[#25D366] font-black text-xs">
                                    <Sparkles size={10} /> {staff.rating}
                                </div>
                            </div>
                        )) : <p className="text-xs text-gray-400 text-center py-10">No active bookings</p>}
                    </div>
                </Card>

                <Card className="p-8 space-y-6 bg-[#25D366] border-none text-white relative overflow-hidden group shadow-2xl shadow-green-200">
                    <div className="absolute top-0 right-0 p-4 opacity-20 group-hover:scale-110 transition-transform"><Activity size={100} className="text-white" /></div>
                    <h4 className="text-2xl font-black leading-tight relative z-10">Scale your business with Agently.</h4>
                    <p className="text-sm font-bold text-white/80 leading-relaxed relative z-10">You're currently using 14.2% of your monthly message quota. Consider upgrading to the Enterprise tier for global load balancing.</p>
                    <div className="pt-4 relative z-10">
                        <button className="flex items-center gap-2 px-6 py-3 bg-white text-[#25D366] rounded-xl font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-black/10 hover:shadow-black/20 transition-all">
                            Upgrade Center <ArrowUpRight size={16} />
                        </button>
                    </div>
                </Card>
            </div>
        </div>
    );
};

export default Overview;
