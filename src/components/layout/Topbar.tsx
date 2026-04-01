
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { RootState, useAppSelector } from '../../store';
import { setTenant } from '../../features/tenantSlice';
import { logout } from '../../features/authSlice';
import { useNavigate } from 'react-router-dom';
import {
    Bell,
    BellOff,
    Search,
    ChevronDown,
    Building2,
    Check,
    User as UserIcon,
    Settings,
    LogOut
} from 'lucide-react';
import { cn } from '../ui';
import { motion, AnimatePresence } from 'framer-motion';

import { toggleSound } from '../../features/settingsSlice';

const Topbar: React.FC = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { soundEnabled } = useAppSelector((state: RootState) => state.settings);
    const { currentTenant, tenants } = useAppSelector((state: RootState) => state.tenant);
    const { user, isAuthenticated } = useAppSelector((state: RootState) => state.auth);

    const [showTenantMenu, setShowTenantMenu] = useState(false);
    const [showProfileMenu, setShowProfileMenu] = useState(false);

    return (
        <header className="h-16 bg-white/80 backdrop-blur-md border-b border-gray-100 flex items-center justify-between px-6 sticky top-0 z-50">
            <div className="flex items-center gap-6">
                {/* Tenant Switcher */}
                <div className="relative">
                    <button
                        onClick={() => setShowTenantMenu(!showTenantMenu)}
                        className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-gray-50 transition-all border border-transparent hover:border-gray-200 group"
                    >
                        <div className="w-8 h-8 rounded-lg bg-gray-900 flex items-center justify-center text-white shadow-lg">
                            <Building2 size={18} />
                        </div>
                        <div className="text-left hidden sm:block">
                            <p className="text-xs font-black text-gray-900 leading-none">{currentTenant?.name}</p>
                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">Workspace Manager</p>
                        </div>
                        <ChevronDown size={14} className={cn("text-gray-400 transition-transform", showTenantMenu && "rotate-180")} />
                    </button>

                    <AnimatePresence>
                        {showTenantMenu && (
                            <>
                                <div className="fixed inset-0 z-10 pointer-events-auto" onClick={() => setShowTenantMenu(false)} />
                                <motion.div
                                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                    animate={{ opacity: 1, y: 5, scale: 1 }}
                                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                    className="absolute left-0 mt-2 w-64 bg-white border border-gray-100 rounded-2xl shadow-2xl z-20 overflow-hidden"
                                >
                                    <div className="p-3 border-b border-gray-50 bg-gray-50/50">
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Switch Workspace</p>
                                    </div>
                                    <div className="p-2 space-y-1">
                                        {tenants.map(t => (
                                            <button
                                                key={t.id}
                                                onClick={() => {
                                                    dispatch(setTenant(t));
                                                    setShowTenantMenu(false);
                                                }}
                                                className={cn(
                                                    "w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-all",
                                                    currentTenant?.id === t.id ? "bg-gray-900 text-white shadow-xl" : "hover:bg-gray-50 text-gray-700"
                                                )}
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className={cn("w-2 h-2 rounded-full", currentTenant?.id === t.id ? "bg-[#25D366]" : "bg-gray-300")} />
                                                    <span className="text-sm font-bold">{t.name}</span>
                                                </div>
                                                {currentTenant?.id === t.id && <Check size={14} className="text-[#25D366]" />}
                                            </button>
                                        ))}
                                    </div>
                                    <div className="p-2 border-t border-gray-50">
                                        <button className="w-full text-center py-2 text-xs font-black text-[#25D366] hover:underline">+ Create New workspace</button>
                                    </div>
                                </motion.div>
                            </>
                        )}
                    </AnimatePresence>
                </div>

                {/* Global Search */}
                <div className="hidden lg:flex items-center gap-3 px-4 py-2 bg-gray-50/50 border border-gray-100 rounded-xl w-80 group focus-within:ring-4 focus-within:ring-[#25D366]/10 focus-within:border-[#25D366] transition-all">
                    <Search size={16} className="text-gray-400 group-focus-within:text-[#25D366]" />
                    <input
                        type="text"
                        placeholder="Search conversations, contacts..."
                        className="bg-transparent text-sm outline-none w-full"
                    />
                </div>
            </div>

            <div className="flex items-center gap-2">
                <button
                    onClick={() => dispatch(toggleSound())}
                    className={cn(
                        "p-2.5 rounded-xl transition-all relative group",
                        soundEnabled ? "text-[#25D366] bg-green-50" : "text-gray-400 hover:text-gray-900 hover:bg-gray-50"
                    )}
                    title={soundEnabled ? "Disable notification sounds" : "Enable notification sounds"}
                >
                    {soundEnabled ? <Bell size={20} /> : <BellOff size={20} />}
                    {soundEnabled && <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white animate-pulse" />}
                </button>

                <div className="w-px h-6 bg-gray-100 mx-2" />

                {/* User Profile */}
                <div className="relative">
                    <button
                        onClick={() => setShowProfileMenu(!showProfileMenu)}
                        className="flex items-center gap-2 p-1 pl-1.5 border border-gray-100 rounded-2xl hover:bg-gray-50 transition-all"
                    >
                        <div className="text-right hidden sm:block">
                            <p className="text-xs font-black text-gray-900 leading-none">{user?.name}</p>
                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">Pro Account</p>
                        </div>
                        <img
                            src={user?.avatar}
                            alt="Avatar"
                            className="w-8 h-8 rounded-xl shadow-sm border border-white"
                        />
                    </button>

                    <AnimatePresence>
                        {showProfileMenu && (
                            <>
                                <div className="fixed inset-0 z-10 pointer-events-auto" onClick={() => setShowProfileMenu(false)} />
                                <motion.div
                                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                    animate={{ opacity: 1, y: 5, scale: 1 }}
                                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                    className="absolute right-0 mt-2 w-56 bg-white border border-gray-100 rounded-2xl shadow-2xl z-20 overflow-hidden"
                                >
                                    <div className="p-2 space-y-1">
                                        <Link to="/settings" onClick={() => setShowProfileMenu(false)} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-gray-50 text-gray-700 transition-all font-bold text-sm">
                                            <UserIcon size={16} className="text-gray-400" /> Account Settings
                                        </Link>
                                        <Link to="/billing" onClick={() => setShowProfileMenu(false)} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-gray-50 text-gray-700 transition-all font-bold text-sm">
                                            <Settings size={16} className="text-gray-400" /> Plan & Billing
                                        </Link>
                                        <Link to="/support" onClick={() => setShowProfileMenu(false)} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-gray-50 text-gray-700 transition-all font-bold text-sm">
                                            <LogOut size={16} className="text-gray-400 rotate-180" /> Help & Support
                                        </Link>
                                        <div className="h-px bg-gray-50 mx-2 my-1" />
                                        <button
                                            onClick={() => {
                                                dispatch(logout());
                                                navigate('/');
                                            }}
                                            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-red-50 text-red-600 transition-all font-bold text-sm"
                                        >
                                            <LogOut size={16} /> Sign Out
                                        </button>
                                    </div>
                                </motion.div>
                            </>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </header>
    );
};

export default Topbar;
