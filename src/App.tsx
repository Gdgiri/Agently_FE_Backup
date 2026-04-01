
import React, { Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/layout/Sidebar';
import Topbar from './components/layout/Topbar';
import { useAppSelector, RootState } from './store';
import { cn } from './components/ui';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X } from 'lucide-react';
import { Toaster } from 'react-hot-toast';
import AuthBootstrap from './components/AuthBootstrap';

// Lazy load pages for performance
const Overview = React.lazy(() => import('./pages/Overview'));
const Inbox = React.lazy(() => import('./pages/Inbox'));
const Contacts = React.lazy(() => import('./pages/Contacts'));
const Templates = React.lazy(() => import('./pages/Templates'));
const ChatBot = React.lazy(() => import('./pages/ChatBot'));
const FlowBuilder = React.lazy(() => import('./pages/FlowBuilder'));
const Flows = React.lazy(() => import('./pages/Flows'));
const Catalogue = React.lazy(() => import('./pages/Catalogue'));
const ProductListing = React.lazy(() => import('./pages/ProductListing'));
const Orders = React.lazy(() => import('./pages/Orders'));
const Appointments = React.lazy(() => import('./pages/Appointments'));
const Analytics = React.lazy(() => import('./pages/Analytics'));
const Campaigns = React.lazy(() => import('./pages/Campaigns'));
const CampaignDetail = React.lazy(() => import('./pages/CampaignDetail'));
const Automations = React.lazy(() => import('./pages/Automations'));
const Settings = React.lazy(() => import('./pages/Settings'));
const LeadIntelligence = React.lazy(() => import('./pages/LeadIntelligence'));
const Billing = React.lazy(() => import('./pages/Billing'));
const Support = React.lazy(() => import('./pages/Support'));
const Login = React.lazy(() => import('./pages/Login'));
const LandingPage = React.lazy(() => import('./pages/LandingPage'));
const WhatsAppFlowDesigner = React.lazy(() => import('./pages/WhatsAppFlowDesigner'));
const BroadcastPage = React.lazy(() => import('./pages/BroadcastPage'));

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);

    return (
        <div className="min-h-screen bg-[#f9fafb] flex flex-col lg:flex-row relative">
            {/* Mobile Header */}
            <div className="lg:hidden h-16 bg-white border-b border-gray-100 flex items-center justify-between px-6 sticky top-0 z-50">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-gradient-to-tr from-[#25D366] via-[#1ebe5d] to-purple-500 rounded-lg flex items-center justify-center text-white font-black italic shadow-lg">A</div>
                    <span className="font-black text-gray-900 tracking-tight">Agently</span>
                </div>
                <button
                    onClick={() => setIsSidebarOpen(true)}
                    className="p-2 text-gray-400"
                >
                    <Menu size={24} />
                </button>
            </div>

            {/* Mobile Sidebar - Only rendered when specifically toggled on small screens */}
            <div className={cn(
                "fixed inset-0 z-[100] lg:hidden transition-opacity duration-300",
                isSidebarOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
            )}>
                <div
                    className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm"
                    onClick={() => setIsSidebarOpen(false)}
                />
                <div className={cn(
                    "absolute inset-y-0 left-0 w-72 bg-white transition-transform duration-300 transform shadow-2xl",
                    isSidebarOpen ? "translate-x-0" : "-translate-x-full"
                )}>
                    <div className="h-full relative">
                        <Sidebar />
                        <button
                            onClick={() => setIsSidebarOpen(false)}
                            className="absolute top-4 -right-12 p-2 text-white bg-gray-900 rounded-xl"
                        >
                            <X size={24} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Desktop Sidebar */}
            <aside className="hidden lg:block w-72 bg-white border-r border-gray-100 shrink-0 h-screen sticky top-0 z-40">
                <Sidebar />
            </aside>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
                <Topbar />
                <main className="flex-1 overflow-y-auto scroll-smooth bg-[#f9fafb]">
                    <Suspense fallback={
                        <div className="p-8 space-y-8 animate-pulse">
                            <div className="h-8 bg-gray-100 rounded-lg w-48" />
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                {[1, 2, 3, 4].map(i => <div key={i} className="h-32 bg-gray-100 rounded-2xl" />)}
                            </div>
                            <div className="h-96 bg-gray-100 rounded-2xl" />
                        </div>
                    }>
                        {children}
                    </Suspense>
                </main>
            </div>
        </div>
    );
};

// Simplified Loading component
const FullPageLoading = () => (
    <div className="h-screen w-full flex flex-col items-center justify-center bg-white">
        <div className="w-12 h-12 bg-gradient-to-tr from-[#25D366] via-[#1ebe5d] to-purple-500 rounded-xl flex items-center justify-center text-white font-black italic animate-bounce shadow-2xl">A</div>
        <p className="mt-4 text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] animate-pulse">Initializing Ecosystem...</p>
    </div>
);

const App: React.FC = () => {
    const { isAuthenticated } = useAppSelector((state: RootState) => state.auth);

    return (
        <BrowserRouter>
            <AuthBootstrap>
                <Suspense fallback={<FullPageLoading />}>
                    <Toaster position="bottom-right" />
                    <Routes>
                        <Route path="/" element={<LandingPage />} />
                        <Route path="/auth" element={!isAuthenticated ? <Login /> : <Navigate to="/dashboard" />} />

                        <Route path="/dashboard" element={isAuthenticated ? <Layout><Overview /></Layout> : <Navigate to="/auth" />} />
                        <Route path="/inbox" element={isAuthenticated ? <Layout><Inbox /></Layout> : <Navigate to="/auth" />} />
                        <Route path="/contacts" element={isAuthenticated ? <Layout><Contacts /></Layout> : <Navigate to="/auth" />} />
                        <Route path="/campaigns" element={isAuthenticated ? <Layout><Campaigns /></Layout> : <Navigate to="/auth" />} />
                        <Route path="/campaigns/:id" element={isAuthenticated ? <Layout><CampaignDetail /></Layout> : <Navigate to="/auth" />} />
                        <Route path="/templates" element={isAuthenticated ? <Layout><Templates /></Layout> : <Navigate to="/auth" />} />
                        <Route path="/chatbot" element={isAuthenticated ? <Layout><ChatBot /></Layout> : <Navigate to="/auth" />} />
                        <Route path="/flows" element={isAuthenticated ? <Layout><Flows /></Layout> : <Navigate to="/auth" />} />
                        <Route path="/flow-builder" element={isAuthenticated ? <FlowBuilder /> : <Navigate to="/auth" />} />
                        <Route path="/flow-builder/:id" element={isAuthenticated ? <FlowBuilder /> : <Navigate to="/auth" />} />
                        <Route path="/catalogue" element={isAuthenticated ? <Layout><Catalogue /></Layout> : <Navigate to="/auth" />} />
                        <Route path="/products" element={isAuthenticated ? <Layout><ProductListing /></Layout> : <Navigate to="/auth" />} />
                        <Route path="/orders" element={isAuthenticated ? <Layout><Orders /></Layout> : <Navigate to="/auth" />} />
                        <Route path="/appointments" element={isAuthenticated ? <Layout><Appointments /></Layout> : <Navigate to="/auth" />} />
                        <Route path="/automations" element={isAuthenticated ? <Layout><Automations /></Layout> : <Navigate to="/auth" />} />
                        <Route path="/analytics" element={isAuthenticated ? <Layout><Analytics /></Layout> : <Navigate to="/auth" />} />
                        <Route path="/broadcast" element={isAuthenticated ? <Layout><BroadcastPage /></Layout> : <Navigate to="/auth" />} />
                        <Route path="/settings" element={isAuthenticated ? <Layout><Settings /></Layout> : <Navigate to="/auth" />} />
                        <Route path="/lead-intelligence" element={isAuthenticated ? <Layout><LeadIntelligence /></Layout> : <Navigate to="/auth" />} />
                        <Route path="/billing" element={isAuthenticated ? <Layout><Billing /></Layout> : <Navigate to="/auth" />} />
                        <Route path="/support" element={isAuthenticated ? <Layout><Support /></Layout> : <Navigate to="/auth" />} />
                        <Route path="/flows/designer" element={isAuthenticated ? <WhatsAppFlowDesigner /> : <Navigate to="/auth" />} />

                        <Route path="*" element={<Navigate to="/" />} />
                    </Routes>
                </Suspense>
            </AuthBootstrap>
        </BrowserRouter>
    );
};

export default App;
