import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Smartphone, Monitor } from 'lucide-react';
import { Button, cn } from '../ui';

interface FlowBuilderLayoutProps {
    children: React.ReactNode;
    header: React.ReactNode;
    sidebar: React.ReactNode;
    drawer?: React.ReactNode;
    preview?: React.ReactNode;
    showDrawer?: boolean;
    onCloseDrawer?: () => void;
    showPreview?: boolean;
    onTogglePreview?: () => void;
    showSidebar?: boolean;
    onToggleSidebar?: () => void;
}

export const FlowBuilderLayout: React.FC<FlowBuilderLayoutProps> = ({
    children,
    header,
    sidebar,
    drawer,
    preview,
    showDrawer,
    onCloseDrawer,
    showPreview,
    onTogglePreview,
    showSidebar = true,
}) => {
    return (
        <div className="h-screen flex flex-col bg-[#F9FAFB] overflow-hidden font-inter">
            {/* Top Header */}
            <header className="h-16 min-h-[64px] px-6 bg-white border-b border-gray-100 flex items-center justify-between z-30 shadow-sm">
                {header}
            </header>

            <div className="flex-1 flex overflow-hidden relative">
                {/* Left Sidebar */}
                <AnimatePresence mode="wait">
                    {showSidebar && (
                        <motion.aside
                            initial={{ x: -320, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            exit={{ x: -320, opacity: 0 }}
                            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                            className="w-80 min-w-[320px] border-r border-gray-100 bg-white flex flex-col z-20 shadow-[4px_0_24px_rgba(0,0,0,0.02)] overflow-hidden"
                        >
                            <div className="flex-1 overflow-y-auto custom-scrollbar">
                                {sidebar}
                            </div>
                        </motion.aside>
                    )}
                </AnimatePresence>

                {/* Center Canvas */}
                <main className="flex-1 relative overflow-hidden bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:24px_24px]">
                    {children}

                    {/* Floating Controls Overlay */}
                    <div className="absolute bottom-8 left-8 flex items-center gap-3 z-10">
                        <div className="bg-white p-2 rounded-2xl shadow-2xl border border-gray-100 flex items-center gap-1">
                            <Button variant="ghost" size="sm" className="w-10 h-10 p-0 rounded-xl"><Monitor size={18} /></Button>
                            <div className="w-px h-6 bg-gray-100 mx-1" />
                            <Button variant="ghost" size="sm" onClick={onTogglePreview} className={cn("w-10 h-10 p-0 rounded-xl", showPreview && "bg-[#25D366]/10 text-[#25D366]")}><Smartphone size={18} /></Button>
                        </div>
                    </div>
                </main>

                {/* Contextual Drawer */}
                <AnimatePresence>
                    {showDrawer && (
                        <motion.div
                            initial={{ x: '100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '100%' }}
                            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                            className="absolute right-0 top-0 bottom-0 w-[400px] bg-white border-l border-gray-100 z-40 shadow-[-20px_0_60px_rgba(0,0,0,0.05)]"
                        >
                            <div className="h-full flex flex-col">
                                <div className="px-6 py-4 border-b border-gray-50 flex items-center justify-between">
                                    <h3 className="font-black text-gray-900 uppercase text-[10px] tracking-widest">Node Properties</h3>
                                    <button onClick={onCloseDrawer} className="p-2 hover:bg-gray-50 rounded-xl transition-colors text-gray-400">
                                        <X size={20} />
                                    </button>
                                </div>
                                <div className="flex-1 overflow-y-auto p-0">
                                    {drawer}
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* WhatsApp Preview Sidebar/Overlay */}
                <AnimatePresence>
                    {showPreview && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="absolute right-8 top-8 bottom-8 w-[360px] z-30 pointer-events-none"
                        >
                            <div className="h-full pointer-events-auto">
                                {preview}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};
