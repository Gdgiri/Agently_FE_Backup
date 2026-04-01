
import React from 'react';
import {
    Search,
    Book,
    MessageSquare,
    Zap,
    LifeBuoy,
    ExternalLink,
    ChevronRight,
    ArrowUpRight,
    PlayCircle,
    FileText,
    HelpCircle,
    ArrowLeft
} from 'lucide-react';
import { cn, Card, Button, Badge, Input, SectionHeader } from '../components/ui';
import { motion } from 'framer-motion';

const Support: React.FC = () => {
    return (
        <div className="p-8 space-y-8 bg-[#f9fafb]">
            <SectionHeader
                title="Support & Knowledge Base"
                subtitle="Everything you need to master Agently and the WhatsApp Business API"
                action={
                    <Button className="h-12 px-8 rounded-2xl shadow-xl shadow-green-100 flex items-center gap-2">
                        <MessageSquare size={18} /> Open Live Chat
                    </Button>
                }
            />

            {/* Hero Search Section */}
            <Card className="p-16 bg-gray-900 border-none relative overflow-hidden group shadow-2xl">
                <div className="absolute inset-0 opacity-20 pointer-events-none">
                    <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-[#25D366] rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2" />
                    <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-blue-500 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/2" />
                </div>

                <div className="relative z-10 max-w-2xl mx-auto text-center space-y-8">
                    <div className="inline-flex p-3 bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 text-[#25D366] shadow-xl"><HelpCircle size={32} /></div>
                    <h3 className="text-4xl font-black text-white tracking-tighter">How can we help you today?</h3>
                    <div className="relative group">
                        <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#25D366] transition-colors" size={24} />
                        <input
                            type="text"
                            placeholder="Search for articles, guides, API documentation..."
                            className="w-full h-16 pl-16 pr-6 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl text-white placeholder:text-gray-500 outline-none focus:ring-4 focus:ring-[#25D366]/20 transition-all font-bold"
                        />
                    </div>
                    <div className="flex flex-wrap justify-center gap-3">
                        <span className="text-[10px] font-black uppercase text-white/40 tracking-widest">Popular:</span>
                        {['WABA Approval', 'Webhook Sync', 'Template Quality', 'AI Integration'].map(tag => (
                            <button key={tag} className="text-[10px] font-black uppercase text-white hover:text-[#25D366] transition-colors tracking-widest">{tag}</button>
                        ))}
                    </div>
                </div>
            </Card>

            {/* Category Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {[
                    { title: 'Getting Started', icon: <Zap size={24} />, count: 12, description: 'Learn the basics of setting up your organization and connecting WABA.' },
                    { title: 'API & Webhooks', icon: <ArrowUpRight size={24} />, count: 24, description: 'Programmatic documentation for developers and integration partners.' },
                    { title: 'Automation Flows', icon: <Zap size={24} />, count: 18, description: 'Advanced guides on building complex customer journeys and auto-responses.' },
                    { title: 'Catalogue & Orders', icon: <FileText size={24} />, count: 8, description: 'Managing properties, syncing inventory, and tracking order updates.' },
                    { title: 'Analytics Insights', icon: <ArrowUpRight size={24} />, count: 15, description: 'Deep dive into funnel intelligence, reach metrics, and ROI tracking.' },
                    { title: 'Billing & Account', icon: <Book size={24} />, count: 10, description: 'Manage subscriptions, staff permissions, and workspace settings.' },
                ].map((cat, i) => (
                    <Card key={i} className="p-8 hover:shadow-xl hover:shadow-gray-200 transition-all group cursor-pointer border-gray-100 flex flex-col justify-between">
                        <div className="space-y-4">
                            <div className="p-4 bg-gray-50 rounded-2xl text-gray-400 group-hover:bg-[#25D366] group-hover:text-white transition-all w-fit shadow-sm">{cat.icon}</div>
                            <h4 className="text-xl font-black text-gray-900 group-hover:text-[#25D366] transition-colors">{cat.title}</h4>
                            <p className="text-sm font-bold text-gray-500 leading-relaxed">{cat.description}</p>
                        </div>
                        <div className="pt-8 flex items-center justify-between border-t border-gray-50 mt-8">
                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{cat.count} Articles</span>
                            <ChevronRight size={18} className="text-gray-300 group-hover:text-gray-900 group-hover:translate-x-1 transition-all" />
                        </div>
                    </Card>
                ))}
            </div>

            {/* Featured Resources */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <Card className="p-10 bg-white border-gray-100 flex gap-8 items-center group cursor-pointer hover:border-blue-200 transition-all shadow-xl shadow-gray-100/50">
                    <div className="w-48 h-32 bg-gray-100 rounded-2xl flex items-center justify-center text-gray-300 relative overflow-hidden shrink-0 shadow-inner">
                        <PlayCircle size={48} className="relative z-10 group-hover:scale-110 group-hover:text-blue-500 transition-all" />
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-transparent" />
                    </div>
                    <div className="space-y-4">
                        <Badge variant="info">Video Tutorial</Badge>
                        <h4 className="text-xl font-black text-gray-900">Setting up your first campaign in 5 minutes</h4>
                        <p className="text-sm font-bold text-gray-500 leading-relaxed truncate-2-lines">Watch our comprehensive guide on how to launch a high-converting WhatsApp broadcast campaign.</p>
                    </div>
                </Card>

                <Card className="p-10 bg-white border-gray-100 flex gap-8 items-center group cursor-pointer hover:border-[#25D366] transition-all shadow-xl shadow-gray-100/50">
                    <div className="w-48 h-32 bg-gray-100 rounded-2xl flex items-center justify-center text-gray-300 relative overflow-hidden shrink-0 shadow-inner">
                        <FileText size={48} className="relative z-10 group-hover:scale-110 group-hover:text-[#25D366] transition-all" />
                        <div className="absolute inset-0 bg-gradient-to-br from-[#25D366]/10 to-transparent" />
                    </div>
                    <div className="space-y-4">
                        <Badge variant="success">Developer Doc</Badge>
                        <h4 className="text-xl font-black text-gray-900">Agently API Version 2.4 Reference</h4>
                        <p className="text-sm font-bold text-gray-500 leading-relaxed truncate-2-lines">Complete documentation for our rest endpoints, payload schemas, and response types.</p>
                    </div>
                </Card>
            </div>

            {/* Support Footer */}
            <div className="text-center py-12 space-y-6">
                <div className="w-16 h-16 bg-white border border-gray-100 rounded-[2rem] flex items-center justify-center mx-auto shadow-xl text-gray-400"><LifeBuoy size={32} /></div>
                <div>
                    <h4 className="text-2xl font-black text-gray-900">Still have questions?</h4>
                    <p className="text-sm font-bold text-gray-500 mt-2">Our enterprise support team is available 24/7 for tailored assistance.</p>
                </div>
                <div className="flex justify-center gap-4">
                    <Button variant="outline" className="h-12 px-8 rounded-2xl">Visit Developers Hub</Button>
                    <Button className="h-12 px-8 rounded-2xl bg-gray-900 hover:bg-black shadow-2xl shadow-gray-200">Contact Human Agent</Button>
                </div>
            </div>
        </div>
    );
};

export default Support;
