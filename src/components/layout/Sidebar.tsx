
import React from 'react';
import { NavLink } from 'react-router-dom';
import {
    LayoutDashboard,
    MessageSquare,
    Users,
    FileText,
    Workflow,
    ShoppingBag,
    Calendar,
    Zap,
    BarChart3,
    Settings2,
    Sparkles,
    Bot,
    Layout,
    Megaphone
} from 'lucide-react';
import { cn } from '../ui';

import { useAppSelector, RootState } from '../../store';

const Sidebar: React.FC = () => {
    const { conversations } = useAppSelector((state: RootState) => state.chat);
    const totalUnread = (conversations || []).reduce((acc, conv) => acc + (conv.unreadCount || 0), 0);

    const MENU_ITEMS = [
        {
            group: 'Core', items: [
                { id: 'dashboard', label: 'Overview', icon: LayoutDashboard, path: '/dashboard' },
                { id: 'inbox', label: 'Inbox', icon: MessageSquare, path: '/inbox', badge: totalUnread > 0 ? totalUnread.toString() : undefined },
            ]
        },
        {
            group: 'Manage', items: [
                { id: 'contacts', label: 'Contacts', icon: Users, path: '/contacts' },
                { id: 'lead-intelligence', label: 'Lead Intelligence', icon: Sparkles, path: '/lead-intelligence' },
                { id: 'broadcast', label: 'Broadcast', icon: Megaphone, path: '/broadcast' },
                { id: 'campaigns', label: 'Campaigns', icon: BarChart3, path: '/campaigns' },
                { id: 'bot-studio', label: 'Bot Studio', icon: Bot, path: '/chatbot' },
                { id: 'templates', label: 'Templates', icon: FileText, path: '/templates' },
                { id: 'flows', label: 'Flow Designer', icon: Workflow, path: '/flows' },
            ]
        },
        {
            group: 'Commerce', items: [
                { id: 'catalogue', label: 'Catalogue Sync', icon: ShoppingBag, path: '/catalogue' },
                { id: 'products', label: 'Product Listing', icon: Layout, path: '/products' },
                { id: 'orders', label: 'Orders', icon: ShoppingBag, path: '/orders' },
                { id: 'appointments', label: 'Appointments', icon: Calendar, path: '/appointments' },
                // { id: 'automations', label: 'Auto-Triggers', icon: Zap, path: '/automations' },
            ]
        },
        {
            group: 'System', items: [
                { id: 'analytics', label: 'Analytics', icon: BarChart3, path: '/analytics' },
                { id: 'settings', label: 'Settings', icon: Settings2, path: '/settings' },
            ]
        },
    ];

    return (
        <aside className="h-full w-72 bg-white border-r border-gray-100 flex flex-col">
            <div className="h-16 flex items-center px-6 border-b border-gray-100/50">
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-gradient-to-tr from-[#25D366] via-[#1ebe5d] to-purple-500 rounded-xl flex items-center justify-center shadow-[0_4px_12px_rgba(37,211,102,0.25)] text-white font-black italic">A</div>
                    <div className="flex flex-col">
                        <span className="text-xl font-black tracking-tighter text-gray-900 leading-none">Agently</span>
                        <span className="text-[10px] font-black bg-gradient-to-r from-[#25D366] to-purple-500 bg-clip-text text-transparent uppercase tracking-[0.2em] mt-1">Omni-Channel</span>
                    </div>
                </div>
            </div>

            <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-8 scrollbar-hide">
                {MENU_ITEMS.map((group) => (
                    <div key={group.group} className="space-y-1">
                        <h4 className="px-4 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4">{group.group}</h4>
                        {group.items.map((item) => (
                            <NavLink
                                key={item.id}
                                to={item.path}
                                className={({ isActive }) => cn(
                                    "group flex items-center justify-between px-4 py-3 rounded-2xl transition-all duration-300 relative overflow-hidden",
                                    isActive ? "bg-gray-900 text-white shadow-xl shadow-gray-200 translate-x-1" : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
                                )}
                            >
                                {({ isActive }) => (
                                    <>
                                        <div className="flex items-center gap-3.5 z-10">
                                            <item.icon size={20} className={cn("transition-colors", isActive ? "text-[#25D366]" : "text-gray-400 group-hover:text-gray-600")} />
                                            <span className="text-sm font-bold">{item.label}</span>
                                        </div>

                                        {item.badge && (
                                            <span className="bg-[#25D366] text-white text-[10px] font-black px-2 py-0.5 rounded-full shadow-lg shadow-green-100 z-10">
                                                {item.badge}
                                            </span>
                                        )}

                                        {/* Glass effect for active item */}
                                        <div className={cn(
                                            "absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000",
                                        )} />
                                    </>
                                )}
                            </NavLink>
                        ))}
                    </div>
                ))}
            </nav>

            {/* <div className="p-4">
                <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl p-5 relative overflow-hidden group shadow-2xl">
                    <div className="absolute -right-4 -bottom-4 opacity-10 group-hover:scale-110 transition-transform duration-500">
                        <Sparkles size={100} className="text-white" />
                    </div>
                    <div className="relative z-10">
                        <h5 className="text-white font-bold text-sm">Pro Features</h5>
                        <p className="text-[11px] text-gray-400 mt-1 leading-relaxed">Upgrade to unlock AI agents and automated flows.</p>
                        <button className="mt-4 w-full py-2 bg-[#25D366] text-white text-[11px] font-black uppercase tracking-wider rounded-xl shadow-lg shadow-green-900/20 hover:scale-[1.02] transition-transform">
                            Upgrade Now
                        </button>
                    </div>
                </div>
            </div> */}
        </aside>
    );
};

export default Sidebar;
