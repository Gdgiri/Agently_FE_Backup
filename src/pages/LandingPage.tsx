
import React from 'react';
import { motion } from 'framer-motion';
import {
    ArrowRight,
    CheckCircle2,
    MessageSquare,
    Zap,
    Shield,
    Globe,
    Smartphone,
    Bot,
    Layers,
    Sparkles,
    BarChart,
    ChevronRight,
    PlayCircle,
    Users,
    Mail,
    PhoneCall,
    ShoppingBag,
    Home,
    Car,
    GraduationCap
} from 'lucide-react';
import { Button } from '../components/ui';
import { Link } from 'react-router-dom';

const LandingPage: React.FC = () => {
    const fadeIn = {
        initial: { opacity: 0, y: 20 },
        whileInView: { opacity: 1, y: 0 },
        viewport: { once: true },
        transition: { duration: 0.6 }
    };

    return (
        <div className="bg-white selection:bg-[#25D366] selection:text-white overflow-hidden font-sans">
            {/* Navigation */}
            <nav className="fixed top-0 left-0 right-0 z-[100] bg-white/80 backdrop-blur-md border-b border-gray-100 h-20 flex items-center px-8 lg:px-20 justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-tr from-[#25D366] via-[#1ebe5d] to-purple-500 rounded-xl flex items-center justify-center text-white font-black italic shadow-lg">A</div>
                    <div>
                        <h3 className="text-xl font-black text-gray-900 tracking-tighter">Agently</h3>
                        <p className="text-[8px] font-black bg-gradient-to-r from-[#25D366] to-purple-500 bg-clip-text text-transparent uppercase tracking-widest leading-none">Omnichannel Ecosystem</p>
                    </div>
                </div>

                <div className="hidden lg:flex items-center gap-10">
                    {['Product', 'Solutions', 'Features'].map(item => (
                        <a key={item} href={`#${item.toLowerCase()}`} className="text-xs font-black uppercase tracking-widest text-gray-500 hover:text-gray-900 transition-colors">{item}</a>
                    ))}
                </div>

                <div className="flex items-center gap-4">
                    <Link to="/auth">
                        <Button variant="ghost" className="text-xs font-black uppercase tracking-widest text-gray-500 hover:text-gray-900">Login</Button>
                    </Link>
                    <Link to="/auth?signup=true">
                        <Button className="bg-gray-900 text-white hover:bg-black rounded-xl px-6 h-11 text-xs font-black uppercase tracking-widest shadow-xl shadow-gray-200">Get Started</Button>
                    </Link>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="pt-48 pb-32 px-8 lg:px-20 relative overflow-hidden">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1400px] h-[700px] bg-[radial-gradient(circle_at_50%_0%,#25D366_0%,transparent_70%)] opacity-[0.1] pointer-events-none" />

                <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-20 items-center relative z-10">
                    <div className="space-y-10 text-left">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-gray-50 border border-gray-100 rounded-full text-[10px] font-black uppercase tracking-[0.2em] text-[#25D366] shadow-sm"
                        >
                            <Sparkles size={14} /> Official Meta Business Partner
                        </motion.div>

                        <motion.h1
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="text-7xl lg:text-8xl font-black text-gray-900 leading-[0.9] tracking-tighter"
                        >
                            The Smart Way <br />
                            To Scale On <br />
                            <span className="bg-gradient-to-r from-[#25D366] to-purple-500 bg-clip-text text-transparent">Social.</span>
                        </motion.h1>

                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="text-xl text-gray-500 font-bold max-w-xl leading-relaxed"
                        >
                            Stop managing chats. Start managing growth. Agently is the enterprise control layer for WhatsApp & Instagram APIs, trusted by high-velocity brands worldwide.
                        </motion.p>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className="flex flex-col sm:flex-row items-center gap-6 pt-6"
                        >
                            <Link to="/auth?signup=true">
                                <Button className="bg-gray-900 text-white hover:bg-black rounded-[2rem] px-12 h-16 text-lg font-black shadow-2xl shadow-gray-200">
                                    Start Your Trial <ArrowRight size={20} className="ml-2" />
                                </Button>
                            </Link>
                            <Button variant="ghost" className="h-16 px-10 rounded-[2rem] text-sm font-black uppercase tracking-widest text-gray-400 hover:text-gray-900 group">
                                <PlayCircle size={20} className="mr-2 group-hover:text-[#25D366] transition-colors" /> View Demo
                            </Button>
                        </motion.div>
                    </div>

                    <motion.div
                        initial={{ opacity: 0, x: 50, rotate: 5 }}
                        animate={{ opacity: 1, x: 0, rotate: 0 }}
                        transition={{ duration: 1, delay: 0.2 }}
                        className="relative"
                    >
                        <div className="relative z-10 rounded-[3rem] border-[12px] border-gray-900 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.3)] overflow-hidden scale-110">
                            <img
                                src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1000&h=800&fit=crop"
                                alt="Agently Interface"
                                className="w-full grayscale-[0.2]"
                            />
                            <div className="absolute inset-0 bg-gradient-to-tr from-gray-900/40 via-transparent to-transparent pointer-events-none" />
                        </div>
                        {/* Decorative floating elements */}
                        <div className="absolute -top-10 -right-10 w-40 h-40 bg-[#25D366]/20 blur-3xl rounded-full" />
                        <div className="absolute -bottom-20 -left-10 w-60 h-60 bg-blue-500/10 blur-3xl rounded-full" />
                    </motion.div>
                </div>
            </section>

            {/* Stats Section */}
            <section className="py-20 bg-gray-900 relative overflow-hidden">
                <div className="max-w-7xl mx-auto px-8 lg:px-20 grid grid-cols-2 lg:grid-cols-4 gap-12 text-center relative z-10">
                    {[
                        { label: 'Active Users', value: '2M+' },
                        { label: 'Messages Sent', value: '500M+' },
                        { label: 'Uptime SLA', value: '99.99%' },
                        { label: 'Global Reach', value: '190+' },
                    ].map((stat, i) => (
                        <div key={i} className="space-y-2">
                            <h3 className="text-4xl lg:text-5xl font-black text-white tracking-tighter">{stat.value}</h3>
                            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#25D366]">{stat.label}</p>
                        </div>
                    ))}
                </div>
                <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]" />
            </section>

            {/* Trust Logos */}
            <section className="py-16 border-b border-gray-50">
                <div className="px-8 lg:px-20 text-center space-y-12">
                    <p className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-300">Powering the world's most innovative teams</p>
                    <div className="flex flex-wrap justify-center items-center gap-12 lg:gap-32 opacity-20 grayscale contrast-125">
                        <h4 className="text-3xl font-black italic">SOCIETY.</h4>
                        <h4 className="text-3xl font-black tracking-tighter">HyperFlow</h4>
                        <h4 className="text-3xl font-black italic">MOMENTUM</h4>
                        <h4 className="text-4xl font-black tracking-tighter">NEXUS</h4>
                    </div>
                </div>
            </section>

            {/* Core Features Deep Dive */}
            <section id="product" className="py-32 px-8 lg:px-20 space-y-32">
                <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-20 items-center">
                    <motion.div {...fadeIn} className="space-y-8">
                        <div className="w-16 h-16 bg-[#25D366]/10 rounded-[1.5rem] flex items-center justify-center text-[#25D366] shadow-inner">
                            <Layers size={32} />
                        </div>
                        <h2 className="text-5xl font-black text-gray-900 leading-none tracking-tight">AI-First <br />Workflow Builder</h2>
                        <p className="text-lg text-gray-500 font-bold leading-relaxed">
                            Stop building static sequences. Agently uses Generative AI to distill your natural language requirements into complex, branching customer journeys.
                        </p>
                        <ul className="space-y-4">
                            {['Auto-detected user intent', 'Dynamic payload balancing', 'Real-time branching logic'].map(item => (
                                <li key={item} className="flex items-center gap-3 text-sm font-bold text-gray-700">
                                    <div className="w-5 h-5 bg-[#25D366] rounded-full flex items-center justify-center text-white"><CheckCircle2 size={12} /></div>
                                    {item}
                                </li>
                            ))}
                        </ul>
                    </motion.div>
                    <motion.div {...fadeIn} className="relative group">
                        <div className="rounded-[3rem] overflow-hidden shadow-2xl border border-gray-100 group-hover:scale-[1.02] transition-transform duration-500">
                            <img src="https://images.unsplash.com/photo-1551434678-e076c223a692?w=800&h=600&fit=crop" alt="Builder" />
                        </div>
                        <div className="absolute -bottom-10 -right-10 bg-white p-8 rounded-[2rem] shadow-2xl border border-gray-50 flex items-center gap-4 animate-bounce duration-[3s]">
                            <div className="w-12 h-12 bg-orange-500 rounded-xl flex items-center justify-center text-white"><Zap /></div>
                            <div>
                                <p className="text-[10px] font-black uppercase text-gray-400">Gen-AI Active</p>
                                <p className="text-sm font-black text-gray-900">Building Flow...</p>
                            </div>
                        </div>
                    </motion.div>
                </div>

                <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-20 items-center">
                    <motion.div {...fadeIn} className="lg:order-2 space-y-8 text-right flex flex-col items-end">
                        <div className="w-16 h-16 bg-blue-500/10 rounded-[1.5rem] flex items-center justify-center text-blue-500 shadow-inner">
                            <Bot size={32} />
                        </div>
                        <h2 className="text-5xl font-black text-gray-900 leading-none tracking-tight uppercase">Unified <br />Smart Inbox</h2>
                        <p className="text-lg text-gray-500 font-bold leading-relaxed text-right">
                            One screen to rule them all. Manage thousands of conversations with AI smart replies that handle 80% of routine inquiries automatically.
                        </p>
                        <ul className="space-y-4 flex flex-col items-end">
                            {['Multi-agent assignment', 'Internal private notes', 'Context-aware AI suggestions'].map(item => (
                                <li key={item} className="flex items-center gap-3 text-sm font-bold text-gray-700">
                                    {item}
                                    <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center text-white"><CheckCircle2 size={12} /></div>
                                </li>
                            ))}
                        </ul>
                    </motion.div>
                    <motion.div {...fadeIn} className="lg:order-1 relative group">
                        <div className="rounded-[3rem] overflow-hidden shadow-2xl border border-gray-100 group-hover:scale-[1.02] transition-transform duration-500 italic">
                            <img src="https://images.unsplash.com/photo-1553877522-43269d4ea984?w=800&h=600&fit=crop" alt="Inbox" />
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Solutions Section */}
            <section id="solutions" className="py-32 px-8 lg:px-20 bg-white">
                <div className="max-w-7xl mx-auto space-y-20">
                    <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-10">
                        <div className="max-w-2xl space-y-6">
                            <h2 className="text-6xl font-black text-gray-900 leading-none tracking-tight uppercase italic">Industry <br />Solutions.</h2>
                            <p className="text-xl text-gray-500 font-bold leading-relaxed">
                                Tailored WhatsApp architecture for every sector. Scale your operations with vertical-specific automation that understands your business.
                            </p>
                        </div>
                        <Link to="/auth?signup=true">
                            <Button className="h-16 px-10 bg-[#25D366] text-black font-black uppercase tracking-widest rounded-2xl shadow-xl hover:rotate-1 transition-all">
                                Get Custom Solution
                            </Button>
                        </Link>
                    </div>

                    <div className="grid lg:grid-cols-2 gap-8">
                        {[
                            {
                                title: 'E-commerce & Retail',
                                icon: <ShoppingBag className="text-pink-500" />,
                                image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&h=400&fit=crop',
                                features: ['Order confirmation & tracking', 'Abandoned cart recovery', 'In-chat catalog browsing']
                            },
                            {
                                title: 'Real Estate & Property',
                                icon: <Home className="text-blue-500" />,
                                image: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&h=400&fit=crop',
                                features: ['Lead qualification bots', 'Automated site visit booking', 'Fast property listings broadcast']
                            },
                            {
                                title: 'Automotive & Sales',
                                icon: <Car className="text-orange-500" />,
                                image: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=800&h=400&fit=crop',
                                features: ['Service appointment reminders', 'New model launch alerts', 'Quote request automation']
                            },
                            {
                                title: 'Education & Learning',
                                icon: <GraduationCap className="text-emerald-500" />,
                                image: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=800&h=400&fit=crop',
                                features: ['Admission inquiry handling', 'Course fee reminders', 'Assignment & results portal']
                            }
                        ].map((sol, i) => (
                            <motion.div
                                key={i}
                                {...fadeIn}
                                transition={{ delay: i * 0.1 }}
                                className="group bg-gray-50 rounded-[3rem] overflow-hidden border border-gray-100 hover:border-[#25D366]/30 transition-all hover:shadow-2xl hover:shadow-gray-200"
                            >
                                <div className="h-64 overflow-hidden relative">
                                    <img src={sol.image} className="w-full h-full object-cover grayscale group-hover:grayscale-0 group-hover:scale-110 transition-all duration-700" alt={sol.title} />
                                    <div className="absolute inset-0 bg-gradient-to-t from-gray-900/60 to-transparent" />
                                    <div className="absolute bottom-8 left-8 flex items-center gap-4">
                                        <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-lg">
                                            {React.cloneElement(sol.icon as any, { size: 24 })}
                                        </div>
                                        <h3 className="text-2xl font-black text-white uppercase tracking-tight">{sol.title}</h3>
                                    </div>
                                </div>
                                <div className="p-10 space-y-6">
                                    <p className="text-gray-500 font-bold">Standardize and scale your {sol.title.split(' ')[0]} operations with enterprise-grade Omnichannel hooks.</p>
                                    <div className="space-y-3">
                                        {sol.features.map(f => (
                                            <div key={f} className="flex items-center gap-2 text-sm font-bold text-gray-700">
                                                <div className="w-1.5 h-1.5 bg-gradient-to-r from-[#25D366] to-purple-500 rounded-full" /> {f}
                                            </div>
                                        ))}
                                    </div>
                                    <Button variant="ghost" className="p-0 group-hover:text-purple-500 font-black text-xs uppercase tracking-[0.2em]">Explore Solution <ChevronRight size={14} className="ml-1 group-hover:translate-x-1 transition-transform" /></Button>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Feature Grid Section */}
            <section id="features" className="py-32 bg-gray-50 px-8 lg:px-20">
                <div className="max-w-7xl mx-auto space-y-20">
                    <div className="text-center max-w-3xl mx-auto space-y-4">
                        <h2 className="text-5xl font-black text-gray-900 tracking-tight">Everything you need to <span className="bg-gradient-to-r from-[#25D366] to-purple-500 bg-clip-text text-transparent">Dominate</span>.</h2>
                        <p className="text-lg text-gray-500 font-bold">A comprehensive suite of tools designed for modern marketing and operations across WhatsApp & Instagram.</p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {[
                            { title: 'Campaign Analytics', desc: 'Real-time tracking of performance metrics across all social channels.', icon: <BarChart /> },
                            { title: 'Global Compliance', desc: 'Automatic Opt-out management and GDPR data processing built-in.', icon: <Shield /> },
                            { title: 'Bulk Messaging', desc: 'Schedule millions of messages with platform-aware rate-limiting.', icon: <Mail /> },
                            { title: 'CRM Integrations', desc: 'Sync with HubSpot, Salesforce, or Shopify with zero configuration.', icon: <Globe /> },
                            { title: 'Team Collaboration', desc: 'Granular permissions and role-based access for large organizations.', icon: <Users /> },
                            { title: 'Instant API Access', desc: 'Complete REST API and Webhooks for custom business logic.', icon: <Zap /> },
                        ].map((item, i) => (
                            <motion.div key={i} {...fadeIn} transition={{ delay: i * 0.1 }} className="p-10 bg-white rounded-[2.5rem] border border-gray-100 hover:shadow-2xl transition-all group">
                                <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-400 group-hover:text-purple-500 group-hover:bg-purple-50 transition-colors mb-8">
                                    {React.cloneElement(item.icon as any, { size: 28 })}
                                </div>
                                <h4 className="text-2xl font-black text-gray-900 tracking-tight mb-4">{item.title}</h4>
                                <p className="text-gray-500 font-bold leading-relaxed">{item.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* How It Works */}
            <section id="automation" className="py-32 px-8 lg:px-20">
                <div className="max-w-7xl mx-auto text-center space-y-20">
                    <h2 className="text-5xl font-black text-gray-900 tracking-tight">Three steps to <span className="bg-gradient-to-r from-[#25D366] to-purple-500 bg-clip-text text-transparent">Freedom</span>.</h2>

                    <div className="grid lg:grid-cols-3 gap-12 relative">
                        {/* Connecting Line */}
                        <div className="hidden lg:block absolute top-[60px] left-[15%] right-[15%] h-px bg-gray-100 z-0" />

                        {[
                            { step: '01', title: 'Connect API', desc: 'Bring your official WABA/Instagram API or apply in minutes.' },
                            { step: '02', title: 'Define Logic', desc: 'Use our AI builder to map out your customer journey in plain English.' },
                            { step: '03', title: 'Scale Profit', desc: 'Watch your automated agents handle support, sales, and marketing 24/7.' },
                        ].map((item, i) => (
                            <div key={i} className="space-y-8 relative z-10">
                                <div className="w-32 h-32 bg-white border-2 border-gray-100 rounded-full flex items-center justify-center mx-auto shadow-xl">
                                    <span className="text-5xl font-black bg-gradient-to-tr from-[#25D366] to-purple-500 bg-clip-text text-transparent italic">{item.step}</span>
                                </div>
                                <div className="space-y-4">
                                    <h4 className="text-2xl font-black text-gray-900">{item.title}</h4>
                                    <p className="text-gray-500 font-bold max-w-[280px] mx-auto">{item.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Testimonial Section */}
            <section className="py-32 bg-gray-900 relative overflow-hidden">
                <div className="max-w-5xl mx-auto px-8 lg:px-20 relative z-10 text-center space-y-12">
                    <div className="flex justify-center gap-1">
                        {[1, 2, 3, 4, 5].map(i => <Sparkles key={i} className="text-[#25D366]" size={20} />)}
                    </div>
                    <h3 className="text-3xl lg:text-5xl font-black text-white leading-tight italic tracking-tight">
                        "Agently reduced our support resolution time by 92%. We are now handling 10x the traffic with the same sized team."
                    </h3>
                    <div className="flex flex-col items-center gap-3">
                        <img src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop" className="w-16 h-16 rounded-full border-2 border-purple-500 grayscale-[0.5]" alt="CEO" />
                        <div>
                            <p className="text-white font-black text-lg">Marco De Luca</p>
                            <p className="text-[10px] font-black uppercase tracking-widest text-purple-500">CEO @ HyperFlow Commerce</p>
                        </div>
                    </div>
                </div>
                <div className="absolute top-0 right-0 p-20 opacity-5 pointer-events-none">
                    <MessageSquare size={600} className="text-white" />
                </div>
            </section>


            {/* FAQ Section */}
            <section className="py-32 px-8 lg:px-20 max-w-4xl mx-auto space-y-20">
                <h3 className="text-4xl font-black text-gray-900 text-center tracking-tight">Questions? We have <span className="bg-gradient-to-r from-[#25D366] to-purple-500 bg-clip-text text-transparent">Answers</span>.</h3>
                <div className="space-y-6">
                    {[
                        { q: "Is this the official Meta API?", a: "Yes, Agently integrates directly with the Meta WhatsApp & Instagram Business Platforms. We do not use unofficial scrapers or bridges." },
                        { q: "Do I need technical skills to build AI flows?", a: "Not at all. Our natural language distiller allows you to type what you want (e.g., 'If they ask about price, show the catalog') and we handle the logic." },
                        { q: "What is the message pricing?", a: "Agently charges a flat platform fee. Meta charges their standard conversation-based pricing which is passed through directly." },
                        { q: "Can I migrate existing numbers?", a: "Yes, we support the 'Migration' path for official numbers. If you have a number on WhatsApp Consumer/Business App, we help you port it to the API." }
                    ].map((faq, i) => (
                        <div key={i} className="p-8 bg-gray-50 rounded-[2rem] border border-gray-100 hover:bg-white hover:shadow-xl transition-all group">
                            <div className="flex items-center justify-between mb-4">
                                <h4 className="text-lg font-black text-gray-900 tracking-tight">{faq.q}</h4>
                                <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-400 group-hover:bg-purple-500 group-hover:text-white transition-colors">
                                    <ChevronRight size={18} />
                                </div>
                            </div>
                            <p className="text-gray-500 font-bold leading-relaxed">{faq.a}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* Final CTA */}
            <section className="py-32 px-8 lg:px-20 relative">
                <div className="max-w-7xl mx-auto p-16 lg:p-32 bg-gradient-to-br from-[#25D366] to-purple-500 rounded-[5rem] text-center space-y-12 relative overflow-hidden shadow-[0_50px_100px_-20px_rgba(37,211,102,0.4)]">
                    <div className="absolute top-0 left-0 p-20 opacity-10 rotate-12">
                        <Zap size={400} className="text-black" />
                    </div>
                    <h2 className="text-5xl lg:text-8xl font-black text-black leading-none tracking-[0.02em] uppercase relative z-10">
                        Stop Chatting. <br /> Start <span className="underline decoration-black/20">Scaling</span>.
                    </h2>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-6 relative z-10 pt-10">
                        <Link to="/auth?signup=true">
                            <Button className="bg-black text-white hover:scale-105 rounded-[2rem] px-16 h-24 text-2xl font-black shadow-2xl transition-transform">
                                CREATE YOUR CONSOLE
                            </Button>
                        </Link>
                        <Button variant="ghost" className="h-24 px-12 rounded-[2rem] text-sm font-black uppercase tracking-widest text-black/50 hover:text-black">
                            REQUEST ENTERPRISE QUOTE
                        </Button>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-32 px-8 lg:px-20 border-t border-gray-100 bg-white">
                <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-16 lg:gap-32">
                    <div className="lg:col-span-2 space-y-10">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-gray-900 text-white rounded-[1.2rem] flex items-center justify-center font-black italic shadow-2xl">A</div>
                            <h3 className="text-2xl font-black text-gray-900 tracking-tighter uppercase">Agently</h3>
                        </div>
                        <p className="text-lg font-bold text-gray-400 leading-relaxed max-w-sm">
                            Redefining business communication with the world's most advanced Omnichannel automation framework. Built for the era of AI.
                        </p>
                        <div className="flex gap-6">
                            {[Mail, PhoneCall, Globe].map((Icon, i) => (
                                <a key={i} href="#" className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center text-gray-400 hover:text-[#25D366] hover:bg-gray-100 transition-all"><Icon size={20} /></a>
                            ))}
                        </div>
                    </div>

                    {['Product', 'Automation', 'Company'].map(col => (
                        <div key={col} className="space-y-10">
                            <h4 className="text-xs font-black uppercase tracking-widest text-gray-900">{col}</h4>
                            <div className="flex flex-col gap-6">
                                {['Overview', 'Features', 'API', 'Docs'].map(link => (
                                    <a key={link} href="#" className="text-sm font-extrabold text-gray-400 hover:text-[#25D366] transition-colors">{link}</a>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
                <div className="max-w-7xl mx-auto pt-24 mt-24 flex flex-col md:flex-row justify-between items-center gap-10 border-t border-gray-50 text-[10px] font-black uppercase tracking-[0.3em] text-gray-300">
                    <span>© 2024 Agently Inc. All rights reserved. Meta Official Partner.</span>
                    <div className="flex gap-12">
                        <a href="#" className="hover:text-gray-900 transition-colors">Privacy Policy</a>
                        <a href="#" className="hover:text-gray-900 transition-colors">Terms of Service</a>
                        <a href="#" className="hover:text-gray-900 transition-colors">GDPR</a>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default LandingPage;
