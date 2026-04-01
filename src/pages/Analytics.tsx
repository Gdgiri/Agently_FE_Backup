
import React from 'react';
import {
    BarChart, Bar,
    LineChart, Line,
    XAxis, YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart, Pie, Cell,
    AreaChart, Area
} from 'recharts';
import {
    TrendingUp,
    MessageSquare,
    CheckCircle2,
    Clock,
    Zap,
    ShoppingBag,
    Calendar,
    ArrowUpRight,
    ArrowDownRight,
    Filter,
    Download,
    Activity,
    Globe,
    Sparkles,
    ChevronRight,
    TrendingDown,
    Map
} from 'lucide-react';
import { cn, Card, Button, Badge, SectionHeader } from '../components/ui';

const ACTIVITY_DATA = [
    { name: 'Mon', sent: 4000, read: 2400, replied: 1200, converted: 400 },
    { name: 'Tue', sent: 3000, read: 1398, replied: 900, converted: 300 },
    { name: 'Wed', sent: 2000, read: 9800, replied: 4000, converted: 1200 },
    { name: 'Thu', sent: 2780, read: 3908, replied: 2000, converted: 700 },
    { name: 'Fri', sent: 1890, read: 4800, replied: 1500, converted: 500 },
    { name: 'Sat', sent: 2390, read: 3800, replied: 1000, converted: 200 },
    { name: 'Sun', sent: 3490, read: 4300, replied: 1200, converted: 450 },
];

const FUNNEL_DATA = [
    { name: 'Delivered', value: 100, color: '#f3f4f6' },
    { name: 'Read', value: 85, color: '#25D366' },
    { name: 'Replied', value: 42, color: '#3b82f6' },
    { name: 'Converted', value: 18, color: '#8b5cf6' },
];

const CAMPAIGN_STATS = [
    { name: 'Flash Sale Q1', reach: '42K', conv: '12.4%', roi: '4.2x' },
    { name: 'Nurture Sequence', reach: '12K', conv: '8.1%', roi: '2.8x' },
    { name: 'Re-engagement', reach: '8K', conv: '15.2%', roi: '5.1x' },
];

const CATEGORY_DATA = [
    { name: 'Marketing', value: 400, color: '#25D366' },
    { name: 'Utility', value: 300, color: '#3b82f6' },
    { name: 'Service', value: 300, color: '#f59e0b' },
    { name: 'Auth', value: 200, color: '#8b5cf6' },
];

import { motion } from 'framer-motion';

const StatCard: React.FC<{ label: string; value: string; trend: number; icon: React.ReactNode; color: string }> = ({ label, value, trend, icon, color }) => (
    <Card className="p-8 group hover:shadow-2xl transition-all relative overflow-hidden bg-white border-none shadow-xl shadow-gray-200/50">
        <div className={cn("absolute top-0 right-0 w-32 h-32 opacity-[0.03] group-hover:scale-125 transition-transform", color)}>
            {icon}
        </div>
        <div className="flex items-center justify-between mb-4 relative z-10">
            <div className={cn("p-4 rounded-2xl shadow-inner", color.replace('text-', 'bg-').replace('text-', 'text-'))}>
                {React.cloneElement(icon as any, { size: 24 })}
            </div>
            <div className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider border",
                trend > 0 ? "bg-green-50 text-green-600 border-green-100" : "bg-red-50 text-red-600 border-red-100"
            )}>
                {trend > 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                {Math.abs(trend)}%
            </div>
        </div>
        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest relative z-10">{label}</p>
        <h3 className="text-4xl font-black text-gray-900 mt-2 relative z-10">{value}</h3>
    </Card>
);

const Analytics: React.FC = () => {
    return (
        <div className="p-10 space-y-10 bg-[#f9fafb]">
            <SectionHeader
                title="Intelligence Engine"
                subtitle="Deeper insights into your WhatsApp engagement and conversion funnels"
                action={
                    <div className="flex gap-3">
                        <div className="px-6 py-2.5 bg-white border border-gray-100 rounded-2xl shadow-sm flex items-center gap-3">
                            <Calendar size={18} className="text-gray-400" />
                            <span className="text-[10px] font-black uppercase text-gray-700 tracking-widest">Last 30 Days</span>
                        </div>
                        <Button variant="outline" className="h-12 px-6 rounded-2xl bg-white"><Filter size={18} /> Deep Filters</Button>
                        <Button className="h-12 px-8 rounded-2xl shadow-xl shadow-green-100"><Download size={18} /> Export Intel</Button>
                    </div>
                }
            />

            {/* Top Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard label="Messages Sent" value="128.4K" trend={12.4} icon={<MessageSquare />} color="text-[#25D366]" />
                <StatCard label="Avg Response Time" value="4.2m" trend={-8.1} icon={<Clock />} color="text-blue-500" />
                <StatCard label="Flow Conversions" value="12,840" trend={24.2} icon={<Zap />} color="text-yellow-500" />
                <StatCard label="Attributed Sales" value="$42,850" trend={18.5} icon={<ShoppingBag />} color="text-purple-500" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Activity Over Time */}
                <Card className="lg:col-span-2 p-8 space-y-8 bg-white border-gray-100 shadow-xl shadow-gray-200/20">
                    <div className="flex items-center justify-between">
                        <div>
                            <h4 className="text-lg font-black text-gray-900">Engagement Overview</h4>
                            <p className="text-xs font-bold text-gray-400 mt-1 uppercase tracking-widest">Real-time message volume and interaction rates</p>
                        </div>
                        <div className="flex gap-4">
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 bg-[#25D366] rounded-full" />
                                <span className="text-[10px] font-black uppercase text-gray-400">Sent</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 bg-blue-500 rounded-full" />
                                <span className="text-[10px] font-black uppercase text-gray-400">Replied</span>
                            </div>
                        </div>
                    </div>

                    <div className="h-80 w-full font-mono">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={ACTIVITY_DATA}>
                                <defs>
                                    <linearGradient id="colorSent" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#25D366" stopOpacity={0.1} />
                                        <stop offset="95%" stopColor="#25D366" stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="colorReplied" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1} />
                                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} fontSize={10} fontWeight="900" />
                                <YAxis axisLine={false} tickLine={false} fontSize={10} fontWeight="900" />
                                <Tooltip
                                    contentStyle={{ border: 'none', borderRadius: '1.5rem', boxShadow: '0 20px 50px rgba(0,0,0,0.1)' }}
                                />
                                <Area type="monotone" dataKey="sent" stroke="#25D366" strokeWidth={3} fillOpacity={1} fill="url(#colorSent)" />
                                <Area type="monotone" dataKey="replied" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorReplied)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* Funnel Intelligence */}
                <Card className="p-8 space-y-8 bg-white border-none shadow-xl shadow-gray-200/50">
                    <div>
                        <h4 className="text-lg font-black text-gray-900">Funnel Intelligence</h4>
                        <p className="text-xs font-bold text-gray-400 mt-1 uppercase tracking-widest">Conversion drop-off analysis</p>
                    </div>

                    <div className="space-y-6">
                        {FUNNEL_DATA.map((step, i) => (
                            <div key={step.name} className="space-y-2">
                                <div className="flex justify-between items-end">
                                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{step.name}</span>
                                    <span className="text-xs font-black text-gray-900">{step.value}%</span>
                                </div>
                                <div className="h-3 w-full bg-gray-50 rounded-full overflow-hidden">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${step.value}%` }}
                                        transition={{ delay: i * 0.1, duration: 1 }}
                                        className="h-full rounded-full"
                                        style={{ backgroundColor: step.color }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="p-6 bg-gray-50 rounded-[2rem] border border-gray-100 italic text-[11px] text-gray-500 leading-relaxed">
                        "Your 'Replied' to 'Converted' rate is 12% above industry average for Real Estate." - <span className="text-[#25D366] font-black not-italic ml-1">AI INSIGHT</span>
                    </div>
                </Card>

                {/* Campaign Performance */}
                <Card className="lg:col-span-3 p-8 border-none shadow-xl shadow-gray-200/50">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h4 className="text-lg font-black text-gray-900">Campaign ROI Intel</h4>
                            <p className="text-xs font-bold text-gray-400 mt-1 uppercase tracking-widest">Performance breakdown by active campaign</p>
                        </div>
                        <Button variant="ghost" size="sm" className="text-[10px] font-black uppercase tracking-widest text-[#25D366]">View All Campaigns</Button>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="border-b border-gray-50">
                                    <th className="pb-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Campaign Name</th>
                                    <th className="pb-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Total Reach</th>
                                    <th className="pb-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Conv. Rate</th>
                                    <th className="pb-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">ROI</th>
                                    <th className="pb-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Trend</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {CAMPAIGN_STATS.map((camp, i) => (
                                    <tr key={camp.name} className="group hover:bg-gray-50/50 transition-colors">
                                        <td className="py-6">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-[#25D366] group-hover:text-white transition-all">
                                                    <Sparkles size={18} />
                                                </div>
                                                <span className="text-sm font-bold text-gray-900">{camp.name}</span>
                                            </div>
                                        </td>
                                        <td className="py-6 text-center text-sm font-black text-gray-500">{camp.reach}</td>
                                        <td className="py-6 text-center">
                                            <Badge variant="success" className="bg-green-50 text-[#25D366] border-green-100">{camp.conv}</Badge>
                                        </td>
                                        <td className="py-6 text-center text-sm font-black text-gray-900">{camp.roi}</td>
                                        <td className="py-6 text-right">
                                            <div className="h-8 w-24 ml-auto">
                                                <ResponsiveContainer width="100%" height="100%">
                                                    <LineChart data={[...Array(6)].map(() => ({ v: Math.random() * 10 }))}>
                                                        <Line type="monotone" dataKey="v" stroke={i % 2 === 0 ? "#25D366" : "#3b82f6"} strokeWidth={2} dot={false} />
                                                    </LineChart>
                                                </ResponsiveContainer>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </Card>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                <Card className="p-8 space-y-6 relative overflow-hidden group border-none bg-gradient-to-br from-gray-900 to-gray-800 shadow-2xl">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform"><Activity size={80} className="text-white" /></div>
                    <h4 className="text-white font-black text-lg">WABA Health Score</h4>
                    <div className="space-y-4">
                        <div className="flex justify-between text-[10px] font-black text-white/50 uppercase tracking-widest">
                            <span>Performance Rating</span>
                            <span className="text-green-400">Excellent</span>
                        </div>
                        <div className="h-3 w-full bg-white/10 rounded-full overflow-hidden p-1">
                            <motion.div initial={{ width: 0 }} animate={{ width: '94%' }} transition={{ duration: 1.5 }} className="h-full bg-gradient-to-r from-green-400 to-[#25D366] rounded-full shadow-[0_0_15px_rgba(37,211,102,0.5)]" />
                        </div>
                    </div>
                    <p className="text-xs text-gray-400 leading-relaxed font-bold">Your business account maintains a high quality rating with <span className="text-[#25D366]">0.02%</span> blocking rates.</p>
                </Card>

                <Card className="p-8 space-y-6 bg-white border-none shadow-xl shadow-gray-200/50">
                    <div className="flex items-center justify-between">
                        <h4 className="font-black text-gray-900">WABA Regional Reach</h4>
                        <Badge variant="info" className="bg-blue-50 text-blue-500 border-blue-100">Live Global</Badge>
                    </div>
                    <div className="flex items-center gap-8">
                        <div className="flex-1 space-y-6">
                            <div className="space-y-1">
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Top Active Region</p>
                                <p className="text-sm font-black text-gray-900 flex items-center gap-2"><Globe size={14} className="text-blue-500" /> Singapore (42%)</p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Territory Growth</p>
                                <p className="text-sm font-black text-[#25D366] flex items-center gap-1"><TrendingUp size={14} /> +184% MoM</p>
                            </div>
                        </div>
                        <div className="w-28 h-28 bg-gray-50 rounded-[2.5rem] flex items-center justify-center shadow-inner border border-gray-100 relative group">
                            <Globe size={48} className="text-gray-200 animate-spin-slow group-hover:text-blue-100 transition-colors" />
                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <Map size={48} className="text-blue-500/10" />
                            </div>
                        </div>
                    </div>
                </Card>

                <Card className="p-8 space-y-6 group cursor-pointer hover:bg-white hover:border-[#25D366]/20 hover:shadow-2xl transition-all border-dashed border-2 border-gray-200 items-center justify-center flex flex-col text-center bg-transparent">
                    <div className="w-16 h-16 bg-[#25D366]/10 text-[#25D366] rounded-2xl flex items-center justify-center mb-2 group-hover:rotate-12 group-hover:scale-110 transition-all shadow-sm"><Sparkles size={32} /></div>
                    <h4 className="font-black text-gray-900 uppercase tracking-widest text-xs">Unlock Predictive AI</h4>
                    <p className="text-[11px] text-gray-400 font-bold max-w-[200px] leading-relaxed">Predict customer churn and identify high-value leads automatically.</p>
                    <button className="mt-4 text-[10px] font-black uppercase text-[#25D366] hover:underline flex items-center gap-2 tracking-widest group-hover:gap-3 transition-all">Learn More <ChevronRight size={14} /></button>
                </Card>
            </div>
        </div>
    );
};

export default Analytics;
