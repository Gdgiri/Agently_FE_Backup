
import React, { useState } from 'react';
import {
    Zap,
    Play,
    Plus,
    MoreVertical,
    ChevronRight,
    Clock,
    MessageSquare,
    ShoppingBag,
    Calendar,
    CheckCircle2,
    AlertCircle,
    Activity,
    Users,
    ArrowUpRight
} from 'lucide-react';
import { cn, Card, Button, Badge, SectionHeader } from '../components/ui';
import { motion, AnimatePresence } from 'framer-motion';

const MOCK_AUTOMATIONS = [
    {
        id: '1',
        name: 'Welcome Sequence',
        description: 'Sends a welcome message and catalog when a new user messages.',
        trigger: 'New Conversation',
        status: 'Active',
        executions: 1240,
        successRate: '99.2%',
        icon: <Users size={20} className="text-blue-500" />,
        type: 'growth'
    },
    {
        id: '2',
        name: 'Order Confirmation',
        description: 'Auto-sends order summary and tracking link after purchase.',
        trigger: 'Purchase Created',
        status: 'Active',
        executions: 856,
        successRate: '100%',
        icon: <ShoppingBag size={20} className="text-[#25D366]" />,
        type: 'utility'
    },
    {
        id: '3',
        name: 'Appointment Reminder',
        description: 'Sends a reminder 1 hour before scheduled property tours.',
        trigger: 'Scheduled Event',
        status: 'Active',
        executions: 312,
        successRate: '98.5%',
        icon: <Calendar size={20} className="text-purple-500" />,
        type: 'utility'
    },
    {
        id: '4',
        name: 'Abandoned Cart Follow-up',
        description: 'Reminds users about items in their cart after 2 hours.',
        trigger: 'Cart Abandoned',
        status: 'Paused',
        executions: 1105,
        successRate: '94.1%',
        icon: <Zap size={20} className="text-yellow-500" />,
        type: 'sales'
    }
];

const Automations: React.FC = () => {
    const [selectedTab, setSelectedTab] = useState('all');

    return (
        <div className="p-8 space-y-8 bg-[#f9fafb] min-h-full">
            <SectionHeader
                title="Automations"
                subtitle="Smart triggers and automated workflows to scale your operations"
                action={
                    <Button className="rounded-2xl shadow-lg shadow-green-100">
                        <Plus size={18} /> Create Workflow
                    </Button>
                }
            />

            {/* Metrics Overview */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <Card className="p-6 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-110 transition-transform">
                        <Zap size={60} className="text-gray-900" />
                    </div>
                    <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Active Workflows</h4>
                    <div className="text-3xl font-black text-gray-900">12</div>
                    <p className="text-[10px] font-bold text-[#25D366] mt-2 flex items-center gap-1">
                        <ArrowUpRight size={12} /> +2 this month
                    </p>
                </Card>

                <Card className="p-6 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-110 transition-transform">
                        <Activity size={60} className="text-gray-900" />
                    </div>
                    <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Executions (24h)</h4>
                    <div className="text-3xl font-black text-gray-900">4,124</div>
                    <p className="text-[10px] font-bold text-[#25D366] mt-2 flex items-center gap-1">
                        <ArrowUpRight size={12} /> 12% increase
                    </p>
                </Card>

                <Card className="p-6 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-110 transition-transform">
                        <CheckCircle2 size={60} className="text-gray-900" />
                    </div>
                    <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Avg. Success Rate</h4>
                    <div className="text-3xl font-black text-gray-900">98.2%</div>
                    <div className="w-full bg-gray-100 h-1.5 rounded-full mt-4 overflow-hidden">
                        <div className="bg-[#25D366] h-full" style={{ width: '98.2%' }} />
                    </div>
                </Card>

                <Card className="p-6 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-110 transition-transform">
                        <Clock size={60} className="text-gray-900" />
                    </div>
                    <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Time Saved</h4>
                    <div className="text-3xl font-black text-gray-900">142h</div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase mt-3 tracking-widest">Manual effort replaced</p>
                </Card>
            </div>

            {/* Filters */}
            <div className="flex items-center gap-3 overflow-x-auto scrollbar-hide pb-2">
                {['All', 'Active', 'Paused', 'Sales', 'Growth', 'Utility'].map(tab => (
                    <button
                        key={tab}
                        onClick={() => setSelectedTab(tab.toLowerCase())}
                        className={cn(
                            "px-6 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border shrink-0",
                            selectedTab === tab.toLowerCase()
                                ? "bg-gray-900 text-white border-gray-900 shadow-xl shadow-gray-200"
                                : "bg-white text-gray-400 border-gray-100 hover:border-gray-200 hover:text-gray-600"
                        )}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            {/* Automations Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {MOCK_AUTOMATIONS.map((automation, idx) => (
                    <motion.div
                        key={automation.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                    >
                        <Card className="p-0 overflow-hidden hover:shadow-2xl hover:shadow-gray-200 transition-all duration-300 group">
                            <div className="p-8">
                                <div className="flex items-start justify-between mb-6">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center shadow-sm group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300">
                                            {automation.icon}
                                        </div>
                                        <div>
                                            <h4 className="font-black text-gray-900 text-lg tracking-tight">{automation.name}</h4>
                                            <div className="flex items-center gap-2 mt-1">
                                                <Badge variant={automation.status === 'Active' ? 'success' : 'neutral'}>
                                                    {automation.status}
                                                </Badge>
                                                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">• Trigger: {automation.trigger}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <button className="p-2 text-gray-400 hover:bg-gray-50 rounded-xl transition-all">
                                        <MoreVertical size={20} />
                                    </button>
                                </div>

                                <p className="text-sm font-bold text-gray-500 leading-relaxed mb-8">
                                    {automation.description}
                                </p>

                                <div className="grid grid-cols-2 gap-4 pt-6 border-t border-gray-50">
                                    <div className="flex flex-col">
                                        <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1 text-left">Total Runs</span>
                                        <div className="flex items-center gap-2">
                                            <Play size={12} className="text-gray-900" />
                                            <span className="text-sm font-black text-gray-900">{automation.executions}</span>
                                        </div>
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1 text-left">Efficiency</span>
                                        <div className="flex items-center gap-2">
                                            <CheckCircle2 size={12} className="text-[#25D366]" />
                                            <span className="text-sm font-black text-gray-900">{automation.successRate}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="px-8 py-4 bg-gray-50/50 flex justify-between items-center group-hover:bg-gray-50 transition-colors">
                                <button className="text-[10px] font-black text-[#25D366] uppercase tracking-widest hover:underline flex items-center gap-1">
                                    View logs <ArrowUpRight size={12} />
                                </button>
                                <Button variant="ghost" size="sm" className="rounded-xl group-hover:bg-white group-hover:shadow-sm">
                                    Configure
                                </Button>
                            </div>
                        </Card>
                    </motion.div>
                ))}

                {/* Create New Card */}
                <motion.button
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="p-8 rounded-[2rem] border-2 border-dashed border-gray-100 flex flex-col items-center justify-center gap-4 hover:border-[#25D366] hover:bg-[#25D366]/5 transition-all group"
                >
                    <div className="w-16 h-16 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-[#25D366] group-hover:text-white transition-all shadow-sm">
                        <Plus size={32} />
                    </div>
                    <div className="text-center">
                        <p className="font-black text-gray-900">Create New Trigger</p>
                        <p className="text-[10px] font-bold text-gray-400 uppercase mt-1">Browse 40+ pre-built templates</p>
                    </div>
                </motion.button>
            </div>
        </div>
    );
};

export default Automations;
