
import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { MENU_ITEMS } from '../../constants';
import { Menu, X, ChevronRight, User, Bell } from 'lucide-react';
import { Badge } from '../shared';

interface LayoutProps {
    children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
    const [sidebarOpen, setSidebarOpen] = React.useState(true);
    const location = useLocation();

    return (
        <div className="min-h-screen flex bg-[#f9fafb]">
            {/* Sidebar */}
            <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 transition-transform duration-300 lg:translate-x-0 lg:static ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                <div className="h-full flex flex-col">
                    <div className="p-6 flex items-center gap-3">
                        <div className="w-8 h-8 bg-[#25D366] rounded-lg flex items-center justify-center text-white font-bold italic shadow-sm">A</div>
                        <span className="text-xl font-black tracking-tighter text-gray-900">Agently</span>
                    </div>

                    <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto scrollbar-hide">
                        {MENU_ITEMS.map((item) => (
                            <NavLink
                                key={item.id}
                                to={item.path}
                                className={({ isActive }) => `
                  w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 
                  ${isActive ? 'bg-[#25D366]/10 text-[#25D366] shadow-sm font-bold' : 'text-gray-500 hover:bg-gray-50'}
                `}
                            >
                                {({ isActive }) => (
                                    <>
                                        <span className={isActive ? 'text-[#25D366]' : 'text-gray-400'}>{item.icon}</span>
                                        <span className="text-sm">{item.label}</span>
                                        {isActive && <div className="ml-auto w-1.5 h-1.5 bg-[#25D366] rounded-full" />}
                                    </>
                                )}
                            </NavLink>
                        ))}
                    </nav>

                    <div className="p-4 border-t border-gray-100">
                        <div className="p-3 bg-gray-50 rounded-xl flex items-center gap-3">
                            <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center text-gray-500 shadow-inner"><User size={20} /></div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-bold text-gray-900 truncate">Alex Rivera</p>
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Administrator</p>
                            </div>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-w-0">
                <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 sticky top-0 z-40 bg-white/80 backdrop-blur-md">
                    <div className="flex items-center gap-4">
                        <button onClick={() => setSidebarOpen(!sidebarOpen)} className="lg:hidden p-2 text-gray-500 hover:bg-gray-100 rounded-lg"><Menu size={20} /></button>
                        <div className="hidden sm:block">
                            <h1 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] flex items-center gap-2">
                                Real Estate Console <span className="h-1 w-1 bg-gray-300 rounded-full" /> <span className="text-gray-900">WhatsApp Admin</span>
                            </h1>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-gray-50 rounded-full border border-gray-100 shadow-inner">
                            <div className="w-2 h-2 bg-[#25D366] rounded-full animate-pulse shadow-[0_0_8px_rgba(37,211,102,0.5)]" />
                            <span className="text-[11px] font-bold text-gray-600">+1 (555) 012-3456</span>
                        </div>
                        <button className="relative p-2 text-gray-400 hover:text-gray-600 transition-colors">
                            <Bell size={20} />
                            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
                        </button>
                        <div className="h-8 w-px bg-gray-200" />
                        <Badge variant="success">Pro Plan</Badge>
                    </div>
                </header>

                <main className="flex-1 overflow-y-auto">
                    {children}
                </main>
            </div>
        </div>
    );
};

export default Layout;
