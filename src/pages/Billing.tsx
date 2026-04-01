
import React from 'react';
import {
    CreditCard,
    CheckCircle2,
    Zap,
    History,
    Download,
    Plus,
    ArrowUpRight,
    Lock,
    ShieldCheck,
    Smartphone,
    MessageSquare,
    Users,
    Globe
} from 'lucide-react';
import { cn, Card, Button, Badge, SectionHeader } from '../components/ui';
import { motion } from 'framer-motion';

const Billing: React.FC = () => {
    return (
        <div className="p-8 space-y-8 bg-[#f9fafb]">
            <SectionHeader
                title="Plans & Subscription"
                subtitle="Manage your enterprise subscription, billing history, and usage quotas"
                action={
                    <Button className="h-12 px-8 rounded-2xl shadow-xl shadow-green-100">
                        <Plus size={18} /> Add Payment Method
                    </Button>
                }
            />

            {/* Current Plan Overview */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <Card className="lg:col-span-2 p-8 bg-gradient-to-br from-gray-900 to-gray-800 border-none relative overflow-hidden group shadow-2xl">
                    <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform duration-700">
                        <Zap size={200} className="text-white" />
                    </div>

                    <div className="relative z-10 flex flex-col h-full justify-between gap-12">
                        <div className="flex justify-between items-start">
                            <div>
                                <Badge variant="success" className="bg-[#25D366]/20 text-[#25D366] border-[#25D366]/30 mb-4 px-4 py-1.5">Active Plan</Badge>
                                <h3 className="text-4xl font-black text-white leading-none tracking-tighter">Enterprise Pro</h3>
                                <p className="text-gray-400 font-bold mt-4 max-w-sm">Scaling your business with unlimited WABA routing and AI-powered automation.</p>
                            </div>
                            <div className="text-right text-white">
                                <p className="text-[10px] font-black uppercase tracking-widest opacity-50 mb-1">Monthly Billing</p>
                                <p className="text-4xl font-black">$499.00</p>
                                <p className="text-[10px] font-black uppercase tracking-widest mt-2 text-[#25D366]">Next invoice: Nov 12, 2024</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            <div className="space-y-3">
                                <div className="flex justify-between text-[10px] font-black text-white/50 uppercase tracking-widest">
                                    <span>WABA Messages</span>
                                    <span className="text-white">84% Usage</span>
                                </div>
                                <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                                    <div className="h-full bg-[#25D366] w-[84%]" />
                                </div>
                                <p className="text-[10px] font-black text-white/30 uppercase tracking-widest">42k / 50k Messages</p>
                            </div>
                            <div className="space-y-3">
                                <div className="flex justify-between text-[10px] font-black text-white/50 uppercase tracking-widest">
                                    <span>AI API Credits</span>
                                    <span className="text-white">12% Usage</span>
                                </div>
                                <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                                    <div className="h-full bg-blue-400 w-[12%]" />
                                </div>
                                <p className="text-[10px] font-black text-white/30 uppercase tracking-widest">1.2k / 10k Credits</p>
                            </div>
                            <div className="space-y-3">
                                <div className="flex justify-between text-[10px] font-black text-white/50 uppercase tracking-widest">
                                    <span>Staff Seats</span>
                                    <span className="text-white">Full</span>
                                </div>
                                <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                                    <div className="h-full bg-orange-400 w-full" />
                                </div>
                                <p className="text-[10px] font-black text-white/30 uppercase tracking-widest">12 / 12 Members</p>
                            </div>
                        </div>
                    </div>
                </Card>

                <Card className="p-8 bg-white border-gray-100 flex flex-col justify-between">
                    <div className="space-y-6">
                        <div className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center text-gray-900 border border-gray-100"><CreditCard size={24} /></div>
                        <div>
                            <h4 className="text-lg font-black text-gray-900">Payment Information</h4>
                            <p className="text-xs font-bold text-gray-500 mt-1">Direct debit from enterprise account</p>
                        </div>
                        <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-7 bg-white rounded-md border border-gray-100 flex items-center justify-center font-black italic text-blue-600 text-[10px]">VISA</div>
                                <span className="text-sm font-black text-gray-900">•••• 4242</span>
                            </div>
                            <button className="text-[10px] font-black text-[#25D366] uppercase tracking-widest hover:underline">Edit</button>
                        </div>
                    </div>
                    <Button variant="outline" className="w-full mt-8">View Payment Methods</Button>
                </Card>
            </div>

            {/* Billing History */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                    <Card className="overflow-hidden border-gray-100">
                        <div className="p-6 border-b border-gray-50 flex items-center justify-between">
                            <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                <History size={14} /> Invoicing History
                            </h4>
                            <Button variant="ghost" size="sm" className="text-[10px] font-black uppercase tracking-widest text-[#25D366]">Download All</Button>
                        </div>
                        <table className="w-full text-left text-sm">
                            <thead className="bg-gray-50/50 border-b border-gray-50">
                                <tr>
                                    <th className="px-8 py-4 font-black text-gray-400 uppercase text-[10px] tracking-widest">Invoice ID</th>
                                    <th className="px-8 py-4 font-black text-gray-400 uppercase text-[10px] tracking-widest">Amount</th>
                                    <th className="px-8 py-4 font-black text-gray-400 uppercase text-[10px] tracking-widest">Date</th>
                                    <th className="px-8 py-4 font-black text-gray-400 uppercase text-[10px] tracking-widest">Status</th>
                                    <th className="px-8 py-4 text-right"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50 bg-white">
                                {[
                                    { id: 'INV-2024-0012', amount: '$499.00', date: 'Oct 12, 2024', status: 'Paid' },
                                    { id: 'INV-2024-0011', amount: '$499.00', date: 'Sep 12, 2024', status: 'Paid' },
                                    { id: 'INV-2024-0010', amount: '$124.50', date: 'Aug 24, 2024', status: 'Refunded' },
                                ].map(inv => (
                                    <tr key={inv.id} className="group hover:bg-gray-50/50 transition-colors">
                                        <td className="px-8 py-5 font-black text-gray-900">{inv.id}</td>
                                        <td className="px-8 py-5 font-bold text-gray-900">{inv.amount}</td>
                                        <td className="px-8 py-5 text-gray-500 font-bold">{inv.date}</td>
                                        <td className="px-8 py-5">
                                            <Badge variant={inv.status === 'Paid' ? 'success' : 'neutral'}>{inv.status}</Badge>
                                        </td>
                                        <td className="px-8 py-5 text-right">
                                            <button className="p-2 text-gray-400 hover:text-gray-900 hover:bg-white rounded-xl transition-all"><Download size={18} /></button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </Card>
                </div>

                <div className="space-y-6">
                    <Card className="p-8 space-y-6 bg-white border-gray-100">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center"><ShieldCheck size={24} /></div>
                            <h4 className="font-black text-gray-900">Enterprise Security</h4>
                        </div>
                        <p className="text-xs font-bold text-gray-500 leading-relaxed">Your data and payment information are protected by bank-level encryption and 3D Secure 2.0 protocols.</p>
                        <div className="flex gap-2 pt-4">
                            <div className="p-2 border border-gray-100 rounded-xl bg-gray-50 flex items-center justify-center"><Lock size={16} className="text-gray-400" /></div>
                            <div className="p-2 border border-gray-100 rounded-xl bg-gray-50 flex items-center justify-center"><Smartphone size={16} className="text-gray-400" /></div>
                            <div className="p-2 border border-gray-100 rounded-xl bg-gray-50 flex items-center justify-center"><Globe size={16} className="text-gray-400" /></div>
                        </div>
                    </Card>

                    <Card className="p-8 space-y-6 bg-green-50/30 border-[#25D366]/10 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-5"><Zap size={40} className="text-[#25D366]" /></div>
                        <h4 className="font-black text-gray-900">Need more power?</h4>
                        <p className="text-xs font-bold text-gray-500 leading-relaxed">Upgrade to our Unlimited Tier for dedicated WABA throughput and custom SLA agreements.</p>
                        <Button className="w-full bg-gray-900 hover:bg-black text-white rounded-xl">Contact Sales Team</Button>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default Billing;
