
import React, { useState } from 'react';
import { Card, SectionHeader, Badge, Button, cn, Input, PremiumLoading } from '../components/ui';
import { MOCK_PRODUCTS } from '../constants';
import { productApi } from '../lib/api/productApi';
import { catalogApi } from '../lib/api/catalogApi';
import { Product } from '../types';
import toast from 'react-hot-toast';
import {
    RefreshCw,
    ExternalLink,
    ShoppingBag,
    CheckCircle2,
    AlertCircle,
    Smartphone,
    ArrowUpRight,
    Search,
    Filter,
    MoreVertical,
    Plus,
    X,
    LayoutGrid,
    History,
    Check,
    Database,
    Settings2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import { botStudioApi } from '../lib/api/botStudioApi';

const Catalogue: React.FC = () => {
    const [isSyncing, setIsSyncing] = useState(false);
    const [useCatalog, setUseCatalog] = useState(true);

    React.useEffect(() => {
        const loadSettings = async () => {
            try {
                const { data } = await botStudioApi.getSettings();
                if (data.success) {
                    const settings = data.settings || data.data;
                    if (settings) {
                        setUseCatalog(settings.useCatalog ?? true);
                    }
                }
            } catch (error) {
                console.error('Failed to load bot settings', error);
            }
        };
        loadSettings();
    }, []);

    const handleToggleCatalog = async () => {
        const newValue = !useCatalog;
        setUseCatalog(newValue);
        try {
            await botStudioApi.updateSettings({ useCatalog: newValue });
            toast.success(`Catalog knowledge ${newValue ? 'enabled' : 'disabled'}`);
        } catch (error) {
            toast.error('Failed to update knowledge status');
            setUseCatalog(!newValue);
        }
    };
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [newItem, setNewItem] = useState({
        title: '',
        price: '',
        description: '',
        category: 'Electronics',
        imageUrl: '',
        link: '',
        brand: '',
        condition: 'new',
        availability: 'in stock',
        currency: 'INR'
    });

    const [products, setProducts] = useState<Product[]>([]);
    const [catalogs, setCatalogs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isCatalogModalOpen, setIsCatalogModalOpen] = useState(false);
    const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
    const [catalogModalTab, setCatalogModalTab] = useState<'create' | 'link'>('create');
    const [newCatalogName, setNewCatalogName] = useState('');
    const [newCatalogBusinessId, setNewCatalogBusinessId] = useState('');
    const [newCatalogMetaId, setNewCatalogMetaId] = useState('');
    const [settingsBusinessId, setSettingsBusinessId] = useState('');
    const [settingsCatalogToken, setSettingsCatalogToken] = useState('');
    const [hasCatalogToken, setHasCatalogToken] = useState(false);

    React.useEffect(() => {
        fetchData();
        fetchCatalogSettings();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        await Promise.all([fetchProducts(), fetchCatalogs()]);
        setLoading(false);
    };

    const totalItems = products.filter(p => !['apartment', 'house', 'car', 'commercial'].includes(p.category?.toLowerCase() || '')).length;

    // Calculate last sync time
    let lastSyncDate: Date | null = null;
    if (products.length > 0) {
        lastSyncDate = products.reduce((latest, p) => {
            const pDate = p.lastSyncedAt ? new Date(p.lastSyncedAt) : new Date(0);
            return pDate > latest ? pDate : latest;
        }, new Date(0));
    }

    // Helper for "time ago" format
    const timeAgo = (date: Date | string | null) => {
        if (!date) return 'Never';
        const d = typeof date === 'string' ? new Date(date) : date;
        if (d.getTime() === 0) return 'Never';

        const seconds = Math.floor((new Date().getTime() - d.getTime()) / 1000);
        if (seconds < 60) return 'Just now';
        const minutes = Math.floor(seconds / 60);
        if (minutes < 60) return `${minutes}m ago`;
        const hours = Math.floor(minutes / 60);
        if (hours < 24) return `${hours}h ago`;
        return `${Math.floor(hours / 24)}d ago`;
    };

    const fetchProducts = async () => {
        try {
            const { data } = await productApi.getAll();
            if (data.success) {
                setProducts(data.data);
            }
        } catch (error) {
            console.error('Failed to load products', error);
            toast.error('Failed to load products');
        } finally {
            setLoading(false);
        }
    };

    const fetchCatalogs = async () => {
        try {
            const { data } = await catalogApi.getAll();
            if (data.success) setCatalogs(data.data);
        } catch (error) {
            console.error('Failed to load catalogs', error);
        }
    };

    const fetchCatalogSettings = async () => {
        try {
            const { data } = await catalogApi.getSettings();
            if (data.success) {
                setSettingsBusinessId(data.settings.businessId || '');
                setHasCatalogToken(data.settings.hasCatalogToken);
            }
        } catch (error) {
            console.error('Failed to load catalog settings', error);
        }
    };

    const handleSaveSettings = async () => {
        if (!settingsCatalogToken.trim()) {
            toast.error('Please paste your Catalog Management Token');
            return;
        }
        const toastId = toast.loading('Saving & detecting Business ID...');
        try {
            const { data } = await catalogApi.saveSettings({
                catalogToken: settingsCatalogToken.trim()
            });
            if (data.businessId) {
                toast.success(`✅ Done! Business ID auto-detected: ${data.businessId}`, { id: toastId, duration: 6000 });
            } else {
                toast.success('Token saved! Business ID will be resolved on first catalog creation.', { id: toastId, duration: 5000 });
            }
            setIsSettingsModalOpen(false);
            setSettingsCatalogToken('');
            setHasCatalogToken(true);
            fetchCatalogSettings();
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to save settings', { id: toastId });
        }
    };

    /** Create catalog on Meta (uses catalogToken stored in settings) */
    const handleCreateOnMeta = async () => {
        if (!newCatalogName.trim()) {
            toast.error('Catalog name is required');
            return;
        }

        const toastId = toast.loading('Creating catalog on Meta...');
        try {
            const { data } = await catalogApi.create(
                newCatalogName.trim(),
                newCatalogBusinessId.trim() || undefined
            );
            if (data.success) {
                toast.success(`Catalog "${data.catalog?.name}" created on Meta! (ID: ${data.catalog?.metaId})`, { id: toastId, duration: 6000 });
                setIsCatalogModalOpen(false);
                setNewCatalogName('');
                setNewCatalogBusinessId('');
                fetchCatalogs();
            }
        } catch (error: any) {
            console.error('Create catalog failed', error);
            toast.error(error.response?.data?.message || 'Failed to create catalog', { id: toastId });
        }
    };

    /** Link an existing Meta catalog by pasting its ID */
    const handleLinkCatalog = async () => {
        if (!newCatalogName.trim()) {
            toast.error('Catalog name is required');
            return;
        }
        if (!newCatalogMetaId.trim()) {
            toast.error('Meta Catalog ID is required');
            return;
        }

        const toastId = toast.loading('Linking catalog...');
        try {
            const { data } = await catalogApi.link(newCatalogName.trim(), newCatalogMetaId.trim());
            if (data.success) {
                toast.success(`Catalog "${data.catalog?.name}" linked! (ID: ${data.catalog?.metaId})`, { id: toastId, duration: 5000 });
                setIsCatalogModalOpen(false);
                setNewCatalogName('');
                setNewCatalogMetaId('');
                fetchCatalogs();
            }
        } catch (error: any) {
            console.error('Link catalog failed', error);
            toast.error(error.response?.data?.message || 'Failed to link catalog', { id: toastId });
        }
    };


    const handleSync = async () => {
        setIsSyncing(true);
        const toastId = toast.loading('Syncing catalogue from WhatsApp...');
        try {
            // @ts-ignore
            const { data } = await productApi.syncCatalogue();
            if (data.success) {
                toast.success('Catalogue synced successfully', { id: toastId });
                fetchProducts();
            } else {
                toast.error('Sync failed', { id: toastId });
            }
        } catch (error) {
            console.error('Sync failed', error);
            toast.error('Sync failed', { id: toastId });
        } finally {
            setIsSyncing(false);
        }
    };

    const handleCreateProduct = async () => {
        if (!newItem.title || !newItem.price) {
            toast.error('Please fill required fields');
            return;
        }

        // Meta requires HTTPS image
        if (newItem.imageUrl && !newItem.imageUrl.startsWith('https://')) {
            toast.error('Meta requires public HTTPS image URL');
            return;
        }

        const toastId = toast.loading('Creating product...');
        try {
            const priceValue = parseFloat(newItem.price.toString().replace(/[^0-9.]/g, ''));

            const payload = {
                title: newItem.title,
                price: isNaN(priceValue) ? 0 : priceValue,
                description: newItem.description,
                category: newItem.category,
                imageUrl: newItem.imageUrl,
                link: newItem.link,
                brand: newItem.brand,
                condition: newItem.condition,
                availability: newItem.availability,
                currency: newItem.currency,
                status: 'ACTIVE'
            };

            const { data } = await productApi.create(payload);
            if (data.id) {
                if (data.synced) {
                    toast.success('Product created and synced to Meta', { id: toastId });
                } else {
                    toast.success(`Product created locally but Meta sync failed: ${data.metaError || 'Unknown error'}`, { id: toastId, duration: 5000 });
                }
                setIsAddModalOpen(false);
                setNewItem({
                    title: '',
                    price: '',
                    description: '',
                    category: 'Electronics',
                    imageUrl: '',
                    link: '',
                    brand: '',
                    condition: 'new',
                    availability: 'in stock',
                    currency: 'INR'
                });
                fetchProducts();
            } else {
                toast.error('Failed to create product', { id: toastId });
            }
        } catch (error: any) {
            console.error('Create product failed', error);
            toast.error(error.response?.data?.message || 'Failed to create product', { id: toastId });
        }
    };

    const handleDeleteProduct = async (id: string) => {
        if (!window.confirm('Are you sure you want to delete this product? This will also remove it from Meta Catalog.')) return;

        const toastId = toast.loading('Deleting product...');
        try {
            const { data } = await productApi.delete(id);
            if (data.success) {
                toast.success('Product deleted', { id: toastId });
                fetchProducts();
            } else {
                toast.error('Failed to delete product', { id: toastId });
            }
        } catch (error) {
            console.error('Delete failed', error);
            toast.error('Failed to delete product', { id: toastId });
        }
    };

    return (
        <div className="p-8 space-y-8 bg-[#f9fafb] min-h-full">
            <SectionHeader
                title="Catalogue Sync"
                subtitle="Manage and synchronize your property inventory with WhatsApp Business"
                action={
                    <div className="flex items-center gap-4">
                        {/* Brain Toggle for Catalog */}
                        <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-2xl border border-gray-100 shadow-sm animate-in fade-in slide-in-from-right-4 duration-300">
                            <div className="flex flex-col items-end mr-1">
                                <span className="text-[9px] font-black uppercase text-gray-400 leading-none">Status</span>
                                <span className={cn("text-[10px] font-bold mt-0.5", useCatalog ? "text-[#25D366]" : "text-gray-400")}>
                                    {useCatalog ? 'Catalog Knowledge Active' : 'Catalog Knowledge Inactive'}
                                </span>
                            </div>
                            <button
                                onClick={handleToggleCatalog}
                                className="transition-all focus:outline-none"
                            >
                                {useCatalog ? (
                                    <div className="w-10 h-5 bg-[#25D366] rounded-full relative p-1 shadow-inner shadow-green-900/20">
                                        <div className="absolute right-1 top-1 w-3 h-3 bg-white rounded-full shadow-md" />
                                    </div>
                                ) : (
                                    <div className="w-10 h-5 bg-gray-200 rounded-full relative p-1 shadow-inner">
                                        <div className="absolute left-1 top-1 w-3 h-3 bg-white rounded-full shadow-md" />
                                    </div>
                                )}
                            </button>
                        </div>

                        <div className="h-8 w-px bg-gray-100 mx-1" />

                        <div className="flex gap-3">
                            <Button
                                variant="outline"
                                onClick={() => window.location.href = '/products'}
                                className="rounded-2xl bg-white border-dashed border-gray-300 hover:border-[#25D366] hover:text-[#25D366]"
                            >
                                <LayoutGrid size={18} /> View Listing
                            </Button>
                            <Button
                                variant="outline"
                                onClick={() => setIsCatalogModalOpen(true)}
                                className="rounded-2xl bg-white border-dashed border-gray-300 hover:border-[#25D366] hover:text-[#25D366]"
                            >
                                <Database size={18} /> New Catalog
                            </Button>
                            <Button
                                variant="outline"
                                onClick={() => setIsAddModalOpen(true)}
                                className="rounded-2xl bg-white"
                            >
                                <Plus size={18} /> Add Item
                            </Button>
                            <Button
                                onClick={handleSync}
                                disabled={isSyncing}
                                className="rounded-2xl shadow-lg shadow-green-100 min-w-[160px]"
                            >
                                <RefreshCw size={18} className={cn(isSyncing && "animate-spin")} />
                                {isSyncing ? 'Syncing...' : 'Sync Catalogue'}
                            </Button>
                        </div>
                    </div>
                }
            />

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <Card className="p-6 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-110 transition-transform">
                        <ShoppingBag size={60} className="text-gray-900" />
                    </div>
                    <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Total Items</h4>
                    <div className="text-3xl font-black text-gray-900">{totalItems}</div>
                    <p className="text-[10px] font-bold text-[#25D366] mt-2 flex items-center gap-1">
                        All items approved by Meta
                    </p>
                </Card>

                <Card className="p-6 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-110 transition-transform">
                        <RefreshCw size={60} className="text-gray-900" />
                    </div>
                    <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Last Sync</h4>
                    <div className="text-3xl font-black text-gray-900">{timeAgo(lastSyncDate)}</div>
                    <p className="text-[10px] font-bold text-gray-400 mt-2 uppercase tracking-widest">
                        Automated sync enabled
                    </p>
                </Card>

                <Card className="p-6 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-110 transition-transform">
                        <CheckCircle2 size={60} className="text-gray-900" />
                    </div>
                    <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Sync Status</h4>
                    <div className="text-3xl font-black text-[#25D366]">Healthy</div>
                    <p className="text-[10px] font-bold text-[#25D366] mt-2 flex items-center gap-1 uppercase tracking-widest">
                        Connected to API
                    </p>
                </Card>

                <Card className="p-6 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-110 transition-transform">
                        <AlertCircle size={60} className="text-gray-900" />
                    </div>
                    <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Issues</h4>
                    <div className="text-3xl font-black text-gray-900">0</div>
                    <p className="text-[10px] font-bold text-gray-400 mt-2 uppercase tracking-widest">
                        No errors detected
                    </p>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Inventory Table */}
                <div className="lg:col-span-2 space-y-6">
                    <Card className="border-none shadow-xl shadow-gray-200/50 overflow-hidden">
                        <div className="p-6 border-b border-gray-50 flex items-center justify-between bg-white">
                            <h3 className="font-black text-gray-900 text-sm uppercase tracking-widest">Product Inventory</h3>
                            <div className="flex gap-2">
                                <Button variant="ghost" size="sm" className="p-2"><Filter size={18} /></Button>
                                <Button variant="ghost" size="sm" className="p-2"><Search size={18} /></Button>
                            </div>
                        </div>
                        <div className="overflow-x-auto relative">
                            <PremiumLoading
                                show={loading && products.length === 0}
                                status="Syncing Catalogue"
                                description="Fetching your latest products and inventory from Meta Business Manager..."
                            />
                            <table className="w-full text-left">
                                <thead className="bg-gray-50/50 border-b border-gray-50">
                                    <tr>
                                        <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Title</th>
                                        <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Price</th>
                                        <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Status</th>
                                        <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Last Sync</th>
                                        <th className="px-8 py-5 text-right"></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50 bg-white">
                                    {loading && products.length === 0 ? null : (
                                        products.filter(p => !['apartment', 'house', 'car', 'commercial'].includes(p.category?.toLowerCase() || '')).length === 0 ? (
                                            <tr><td colSpan={5} className="p-8 text-center text-gray-400">No products found. Add items to sync.</td></tr>
                                        ) : (
                                            products.filter(p => !['apartment', 'house', 'car', 'commercial'].includes(p.category?.toLowerCase() || '')).map(p => (
                                                <tr key={p.id} className="group hover:bg-gray-50/50 transition-colors">
                                                    <td className="px-8 py-5">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-[#25D366] group-hover:text-white transition-all overflow-hidden">
                                                                {p.imageUrl ? <img src={p.imageUrl} alt={p.title} className="w-full h-full object-cover" /> : <ShoppingBag size={18} />}
                                                            </div>
                                                            <span className="font-bold text-gray-900 text-sm">{p.title}</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-8 py-5">
                                                        <span className="text-sm font-black text-gray-900">{p.price}</span>
                                                    </td>
                                                    <td className="px-8 py-5">
                                                        <Badge variant={p.status?.toLowerCase() === 'active' ? 'success' : 'neutral'}>{p.status}</Badge>
                                                    </td>
                                                    <td className="px-8 py-5">
                                                        <span className="text-[10px] font-bold text-gray-400 uppercase">{timeAgo(p.lastSyncedAt)}</span>
                                                    </td>
                                                    <td className="px-8 py-5 text-right flex gap-2 justify-end">
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            className="p-2 opacity-0 group-hover:opacity-100 transition-opacity"
                                                            onClick={() => p.link && window.open(p.link, '_blank')}
                                                            title="View Link"
                                                        >
                                                            <ExternalLink size={16} />
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            className="p-2 opacity-0 group-hover:opacity-100 transition-opacity text-red-500 hover:text-red-600"
                                                            onClick={() => handleDeleteProduct(p.id)}
                                                            title="Delete Product"
                                                        >
                                                            <Plus size={16} className="rotate-45" />
                                                        </Button>
                                                    </td>
                                                </tr>
                                            ))
                                        )
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </Card>
                </div>

                {/* Mobile Preview Panel */}
                <div className="space-y-6">
                    {/* <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">WhatsApp Preview</h4>
                    <Card className="p-0 bg-white border-none shadow-2xl shadow-gray-200 overflow-hidden rounded-[3rem] ring-8 ring-gray-100">
                        <div className="h-6 w-full bg-white flex justify-center items-end pb-1">
                            <div className="w-20 h-4 bg-gray-100 rounded-full" />
                        </div>
                        <div className="p-10 bg-[#f0f2f5] min-h-[500px] space-y-4">
                            <div className="bg-white rounded-2xl shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <div className="aspect-square bg-gray-100 relative group overflow-hidden">
                                    <img
                                        src="https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&auto=format&fit=crop"
                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                        alt="Property"
                                    />
                                    <div className="absolute top-3 left-3 bg-gray-900/40 backdrop-blur-md text-white text-[10px] font-black px-2 py-1 rounded-lg uppercase tracking-widest">
                                        WhatsApp Catalog
                                    </div>
                                </div>
                                <div className="p-6 space-y-2">
                                    <h5 className="font-black text-gray-900 text-lg">Wireless Noise-Canceling Earbuds</h5>
                                    <p className="text-[#25D366] font-black text-xl">$89.00</p>
                                    <p className="text-xs text-gray-500 font-bold leading-relaxed">
                                        Experience immersive sound with these premium wireless earbuds. 24h battery life.
                                    </p>
                                    <button className="w-full py-4 mt-4 bg-[#25D366] text-white rounded-2xl font-black text-sm shadow-xl shadow-green-100 flex items-center justify-center gap-2 hover:bg-[#1ebe5d] transition-all">
                                        Message Business
                                    </button>
                                    <button className="w-full py-4 bg-gray-50 text-gray-900 rounded-2xl font-black text-sm flex items-center justify-center gap-2 hover:bg-gray-100 transition-all">
                                        Add to Cart
                                    </button>
                                </div>
                            </div>
                        </div>
                    </Card> */}

                    {/* Catalogs Section */}
                    <Card className="p-6 bg-white border-none shadow-xl shadow-gray-200/50">
                        <div className="flex items-center justify-between mb-4">
                            <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Active Catalogs</h4>
                            <Settings2 size={14} className="text-gray-400" />
                        </div>
                        <div className="space-y-3">
                            {catalogs.length === 0 ? (
                                <p className="text-xs text-gray-400 font-bold py-2">No catalogs found. Create one to get started.</p>
                            ) : (
                                catalogs.map((cat, idx) => (
                                    <div key={cat.id || idx} className="flex items-center justify-between p-3 rounded-xl bg-gray-50 border border-gray-100 group hover:border-[#25D366] transition-all">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-gray-900 shadow-sm">
                                                <Database size={14} />
                                            </div>
                                            <div>
                                                <p className="text-sm font-black text-gray-900">{cat.name}</p>
                                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">ID: {cat.metaId}</p>
                                            </div>
                                        </div>
                                        {cat.isDefault && <Badge variant="success" className="h-5 text-[8px]">Active</Badge>}
                                    </div>
                                ))
                            )}
                        </div>
                    </Card>
                </div>
            </div >

            {/* Add Property Modal */}
            <AnimatePresence>
                {
                    isAddModalOpen && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm"
                                onClick={() => setIsAddModalOpen(false)}
                            />
                            <motion.div
                                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                                animate={{ scale: 1, opacity: 1, y: 0 }}
                                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                                className="relative w-full max-w-xl bg-white rounded-[2.5rem] overflow-hidden shadow-2xl"
                            >
                                <div className="p-8 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                                    <div>
                                        <h3 className="text-xl font-black text-gray-900">Add New Item</h3>
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">Populate your WhatsApp Catalogue</p>
                                    </div>
                                    <button onClick={() => setIsAddModalOpen(false)} className="p-3 hover:bg-white rounded-2xl text-gray-400 hover:text-gray-900 transition-all shadow-sm ring-1 ring-gray-100"><X size={20} /></button>
                                </div>

                                <div className="p-10 space-y-8">
                                    <Input
                                        label="Item Title"
                                        placeholder="e.g. Wireless Earbuds"
                                        value={newItem.title}
                                        onChange={(e) => setNewItem({ ...newItem, title: e.target.value })}
                                    />

                                    <div className="grid grid-cols-2 gap-4">
                                        <Input
                                            label="Price (USD)"
                                            placeholder="e.g. 1,200,000"
                                            value={newItem.price}
                                            onChange={(e) => setNewItem({ ...newItem, price: e.target.value })}
                                        />
                                        <div className="space-y-1.5 flex flex-col items-start w-full">
                                            <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Category</label>
                                            <select
                                                className="w-full px-4 py-2.5 bg-gray-50/50 border border-gray-100 rounded-xl text-sm outline-none focus:ring-4 focus:ring-[#25D366]/10 focus:border-[#25D366] transition-all"
                                                value={newItem.category}
                                                onChange={(e) => setNewItem({ ...newItem, category: e.target.value })}
                                            >
                                                <option>Electronics</option>
                                                <option>Apparel</option>
                                                <option>Home & Garden</option>
                                                <option>Food & Drink</option>
                                                <option>Services</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1.5 flex flex-col items-start w-full">
                                            <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Condition</label>
                                            <select
                                                className="w-full px-4 py-2.5 bg-gray-50/50 border border-gray-100 rounded-xl text-sm outline-none focus:ring-4 focus:ring-[#25D366]/10 focus:border-[#25D366] transition-all"
                                                value={newItem.condition}
                                                onChange={(e) => setNewItem({ ...newItem, condition: e.target.value })}
                                            >
                                                <option value="new">New</option>
                                                <option value="refurbished">Refurbished</option>
                                                <option value="used">Used</option>
                                            </select>
                                        </div>
                                        <div className="space-y-1.5 flex flex-col items-start w-full">
                                            <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Availability</label>
                                            <select
                                                className="w-full px-4 py-2.5 bg-gray-50/50 border border-gray-100 rounded-xl text-sm outline-none focus:ring-4 focus:ring-[#25D366]/10 focus:border-[#25D366] transition-all"
                                                value={newItem.availability}
                                                onChange={(e) => setNewItem({ ...newItem, availability: e.target.value })}
                                            >
                                                <option value="in stock">In Stock</option>
                                                <option value="out of stock">Out of Stock</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <Input
                                            label="Brand (Optional)"
                                            placeholder="e.g. Sony"
                                            value={newItem.brand}
                                            onChange={(e) => setNewItem({ ...newItem, brand: e.target.value })}
                                        />
                                        <Input
                                            label="External Link"
                                            placeholder="https://yourstore.com/p/..."
                                            value={newItem.link}
                                            onChange={(e) => setNewItem({ ...newItem, link: e.target.value })}
                                        />
                                    </div>

                                    <div className="space-y-1.5 flex flex-col items-start w-full">
                                        <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Image URL (Meta requires HTTPS)</label>
                                        <Input
                                            placeholder="https://images.unsplash.com/..."
                                            value={newItem.imageUrl}
                                            onChange={(e) => setNewItem({ ...newItem, imageUrl: e.target.value })}
                                            className="w-full"
                                        />
                                        {newItem.imageUrl && (
                                            <div className="mt-2 w-20 h-20 rounded-xl overflow-hidden border border-gray-100 shadow-sm bg-gray-50">
                                                <img src={newItem.imageUrl} alt="Preview" className="w-full h-full object-cover" onError={(e) => (e.currentTarget.src = 'https://via.placeholder.com/150')} />
                                            </div>
                                        )}
                                    </div>

                                    <div className="space-y-1.5 flex flex-col items-start w-full">
                                        <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Description</label>
                                        <textarea
                                            className="w-full px-4 py-3 bg-gray-50/50 border border-gray-100 rounded-xl text-sm outline-none focus:ring-4 focus:ring-[#25D366]/10 focus:border-[#25D366] transition-all min-h-[100px]"
                                            placeholder="Enter item details for the WhatsApp description..."
                                            value={newItem.description}
                                            onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div className="p-8 bg-gray-50 border-t border-gray-100 flex gap-4">
                                    <Button variant="ghost" className="flex-1" onClick={() => setIsAddModalOpen(false)}>Cancel</Button>
                                    <Button className="flex-1 rounded-2xl shadow-xl shadow-green-100" onClick={handleCreateProduct}>
                                        Create & Sync
                                    </Button>
                                </div>
                            </motion.div>
                        </div>
                    )
                }
            </AnimatePresence >

            {/* Catalog Modal: Create on Meta OR Link Existing */}
            <AnimatePresence>
                {
                    isCatalogModalOpen && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                                className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm" onClick={() => setIsCatalogModalOpen(false)} />
                            <motion.div initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }}
                                className="relative w-full max-w-md bg-white rounded-[2rem] overflow-hidden shadow-2xl">

                                {/* Header */}
                                <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                                    <div>
                                        <h3 className="text-lg font-black text-gray-900">Add Catalog</h3>
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">Connect to Meta Commerce Manager</p>
                                    </div>
                                    <button onClick={() => setIsCatalogModalOpen(false)} className="p-2 hover:bg-white rounded-xl text-gray-400 hover:text-gray-900 transition-all shadow-sm ring-1 ring-gray-100"><X size={18} /></button>
                                </div>

                                {/* Tabs */}
                                <div className="px-6 pt-5 flex gap-2">
                                    <button
                                        onClick={() => setCatalogModalTab('create')}
                                        className={`flex-1 py-2.5 rounded-xl text-[12px] font-black transition-all ${catalogModalTab === 'create' ? 'bg-[#25D366] text-white shadow-lg shadow-green-200' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}
                                    >
                                        ✨ Create on Meta
                                    </button>
                                    <button
                                        onClick={() => setCatalogModalTab('link')}
                                        className={`flex-1 py-2.5 rounded-xl text-[12px] font-black transition-all ${catalogModalTab === 'link' ? 'bg-gray-900 text-white shadow-lg' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}
                                    >
                                        🔗 Link Existing
                                    </button>
                                </div>

                                {/* Tab: Create on Meta */}
                                {catalogModalTab === 'create' && (
                                    <div className="p-6 space-y-4">
                                        {!hasCatalogToken && (
                                            <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 flex gap-3">
                                                <AlertCircle className="text-amber-500 shrink-0 mt-0.5" size={16} />
                                                <div>
                                                    <p className="text-[11px] font-bold text-amber-800">Catalog Token Required</p>
                                                    <p className="text-[10px] text-amber-700 mt-0.5">You need to set up your Catalog Management Token first.</p>
                                                    <button onClick={() => { setIsCatalogModalOpen(false); setIsSettingsModalOpen(true); }}
                                                        className="mt-2 text-[11px] font-black text-amber-800 underline">
                                                        → Open Catalog Settings
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                        {hasCatalogToken && (
                                            <div className="p-3 bg-green-50 rounded-xl border border-green-100 flex gap-2 items-center">
                                                <CheckCircle2 className="text-green-500 shrink-0" size={14} />
                                                <p className="text-[11px] font-bold text-green-700">Catalog token configured ✓</p>
                                            </div>
                                        )}
                                        <Input
                                            label="Catalog Name"
                                            placeholder="e.g. Summer Collection 2025"
                                            value={newCatalogName}
                                            onChange={(e) => setNewCatalogName(e.target.value)}
                                        />
                                        <div className="h-px bg-gray-100" />
                                        <div className="flex gap-3">
                                            <Button variant="ghost" className="flex-1" onClick={() => { setIsCatalogModalOpen(false); setNewCatalogName(''); }}>Cancel</Button>
                                            <Button className="flex-1 rounded-2xl shadow-xl shadow-green-100" onClick={handleCreateOnMeta} disabled={!hasCatalogToken}>
                                                Create on Meta
                                            </Button>
                                        </div>
                                    </div>
                                )}

                                {/* Tab: Link Existing */}
                                {catalogModalTab === 'link' && (
                                    <div className="p-6 space-y-4">
                                        <div className="space-y-2">
                                            {[
                                                { step: '1', text: 'Go to', link: { label: 'business.facebook.com/commerce', url: 'https://business.facebook.com/commerce' } },
                                                { step: '2', text: 'Click your Catalog → Settings tab' },
                                                { step: '3', text: 'Copy the Catalog ID shown at the top' },
                                            ].map(({ step, text, link }) => (
                                                <div key={step} className="flex items-start gap-3">
                                                    <span className="shrink-0 w-6 h-6 rounded-full bg-gray-100 text-gray-700 text-[11px] font-black flex items-center justify-center">{step}</span>
                                                    <p className="text-[12px] text-gray-700 font-semibold pt-0.5">
                                                        {text}{' '}
                                                        {link && (
                                                            <a href={link.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline inline-flex items-center gap-0.5">
                                                                {link.label} <ExternalLink size={10} />
                                                            </a>
                                                        )}
                                                    </p>
                                                </div>
                                            ))}
                                        </div>
                                        <div className="h-px bg-gray-100" />
                                        <Input label="Meta Catalog ID" placeholder="e.g. 308196302866723" value={newCatalogMetaId} onChange={(e) => setNewCatalogMetaId(e.target.value)} />
                                        <Input label="Display Name (for this CRM)" placeholder="e.g. My Store Products" value={newCatalogName} onChange={(e) => setNewCatalogName(e.target.value)} />
                                        <div className="flex gap-3">
                                            <Button variant="ghost" className="flex-1" onClick={() => { setIsCatalogModalOpen(false); setNewCatalogName(''); setNewCatalogMetaId(''); }}>Cancel</Button>
                                            <Button className="flex-1 rounded-2xl shadow-xl" onClick={handleLinkCatalog}>Link Catalog</Button>
                                        </div>
                                    </div>
                                )}
                            </motion.div>
                        </div>
                    )
                }
            </AnimatePresence >

            {/* Catalog Settings Modal */}
            <AnimatePresence>
                {
                    isSettingsModalOpen && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                                className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm" onClick={() => setIsSettingsModalOpen(false)} />
                            <motion.div initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }}
                                className="relative w-full max-w-md bg-white rounded-[2rem] overflow-hidden shadow-2xl">

                                <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                                    <div>
                                        <h3 className="text-lg font-black text-gray-900">Catalog Setup</h3>
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">One-time setup — takes 2 minutes</p>
                                    </div>
                                    <button onClick={() => setIsSettingsModalOpen(false)} className="p-2 hover:bg-white rounded-xl text-gray-400 hover:text-gray-900 transition-all shadow-sm ring-1 ring-gray-100"><X size={18} /></button>
                                </div>

                                <div className="p-6 space-y-5">
                                    {/* Step-by-step instructions */}
                                    <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100 space-y-3">
                                        <p className="text-[11px] font-black text-blue-800 uppercase tracking-wide">How to get a token that can create catalogs:</p>
                                        <ol className="space-y-2">
                                            {[
                                                { n: 1, t: 'Go to', link: { label: 'developers.facebook.com/tools/explorer', url: 'https://developers.facebook.com/tools/explorer' } },
                                                { n: 2, t: 'Select your App (e.g. Blackstone) → User Token' },
                                                { n: 3, t: 'In Permissions → Add: business_management' },
                                                { n: 4, t: 'Click "Generate Access Token" → Copy it' },
                                                { n: 5, t: 'Paste it below → click Save' },
                                            ].map(({ n, t, link }) => (
                                                <li key={n} className="flex gap-2 items-start">
                                                    <span className="shrink-0 w-5 h-5 rounded-full bg-blue-200 text-blue-800 text-[10px] font-black flex items-center justify-center">{n}</span>
                                                    <span className="text-[11px] text-blue-700 font-semibold">
                                                        {t}{' '}
                                                        {link && <a href={link.url} target="_blank" rel="noopener noreferrer" className="underline inline-flex items-center gap-0.5">{link.label} <ExternalLink size={9} /></a>}
                                                    </span>
                                                </li>
                                            ))}
                                        </ol>
                                    </div>

                                    {/* Token input */}
                                    <div className="space-y-2">
                                        <Input
                                            label="Paste Token Here"
                                            placeholder="EAABsbCS4abc..."
                                            value={settingsCatalogToken}
                                            onChange={(e) => setSettingsCatalogToken(e.target.value)}
                                        />
                                        <p className="text-[10px] text-gray-400 font-semibold ml-1">
                                            ✨ Business Manager ID will be detected automatically — no need to enter it manually.
                                        </p>
                                    </div>

                                    {hasCatalogToken && (
                                        <div className="flex items-center gap-2 p-3 bg-green-50 rounded-xl border border-green-100">
                                            <CheckCircle2 size={14} className="text-green-500" />
                                            <span className="text-[11px] font-bold text-green-700">Token already configured ✓ — paste a new one to update</span>
                                        </div>
                                    )}
                                </div>

                                <div className="p-6 bg-gray-50 border-t border-gray-100 flex gap-3">
                                    <Button variant="ghost" className="flex-1" onClick={() => setIsSettingsModalOpen(false)}>Cancel</Button>
                                    <Button className="flex-1 rounded-2xl shadow-xl shadow-green-100" onClick={handleSaveSettings}>
                                        Save & Connect
                                    </Button>
                                </div>
                            </motion.div>
                        </div>
                    )
                }
            </AnimatePresence >
        </div >
    );
};

export default Catalogue;
