
import React, { useState, useEffect } from 'react';
import {
    Plus, Search, Filter, LayoutGrid, List, Edit2,
    MapPin, User, ChevronRight, X, Upload, Trash2,
    Home, Car, Building2, Smartphone, Loader2,
    Calendar, Maximize2, Camera, Database, Settings2, Check
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { SectionHeader, Card, Button, Input, Badge, cn } from '../components/ui';
import { productApi } from '../lib/api/productApi';
import { categoryApi } from '../lib/api/categoryApi';
import { staffApi } from '../lib/api/commerceApi';
import { botStudioApi } from '../lib/api/botStudioApi';
import { ragApi } from '../lib/api/miscApi';
import { mediaApi } from '../lib/api/mediaApi';
import { Product, Category } from '../types';
import toast from 'react-hot-toast';
import { PlusCircle } from 'lucide-react';

const ProductListing: React.FC = () => {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [staff, setStaff] = useState<any[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [isCreatingCategory, setIsCreatingCategory] = useState(false);
    const [newCategoryName, setNewCategoryName] = useState('');
    const [allCategories, setAllCategories] = useState<Category[]>([]);
    const [selectedFilterType, setSelectedFilterType] = useState<string>('all');
    const [selectedFilterSubCategory, setSelectedFilterSubCategory] = useState<string>('all');
    const [isFilterMenuOpen, setIsFilterMenuOpen] = useState(false);
    const [hoveredType, setHoveredType] = useState<string | null>(null);
    const [isManagingCategories, setIsManagingCategories] = useState(false);
    const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
    const [editingCategoryName, setEditingCategoryName] = useState('');
    const [productTypes, setProductTypes] = useState<string[]>([]);
    const [isManagingTypes, setIsManagingTypes] = useState(false);
    const [isCreatingType, setIsCreatingType] = useState(false);
    const [newTypeName, setNewTypeName] = useState('');
    const [editingTypeOldName, setEditingTypeOldName] = useState<string | null>(null);
    const [editingTypeNewName, setEditingTypeNewName] = useState('');

    interface ProductForm extends Partial<Product> {
        bedrooms?: number;
        bathrooms?: number;
        sqft?: number;
        yearBuilt?: number;
        mileage?: string;
        fuelType?: string;
        brand?: string;
        condition?: string;
        imageUrl?: string;
        categoryId?: string;
        documents?: any[];
    }

    // Modal state for fields
    const [formData, setFormData] = useState<ProductForm>({
        title: '',
        price: '',
        category: 'Apartment',
        location: '',
        status: 'Active',
        agent: '',
        description: '',
        bedrooms: 0,
        bathrooms: 0,
        sqft: 0,
        yearBuilt: new Date().getFullYear(),
        mileage: '',
        fuelType: '',
        brand: '',
        condition: 'new',
        imageUrl: '',
        categoryId: '',
        documents: []
    });

    const [pendingFiles, setPendingFiles] = useState<File[]>([]);
    const [allRagSources, setAllRagSources] = useState<any[]>([]);
    const [fetchingSources, setFetchingSources] = useState(false);

    useEffect(() => {
        fetchProducts();
        fetchStaff();
        fetchAllCategories();
    }, []);

    const fetchAllCategories = async () => {
        try {
            const { data } = await categoryApi.getAll();
            setAllCategories(data);

            // Also fetch unique types
            const { data: types } = await categoryApi.getTypes();
            setProductTypes(types);
        } catch (error) {
            console.error('Failed to fetch all categories', error);
        }
    };

    useEffect(() => {
        // Fetch categories whenever product type changes
        if (formData.category) {
            fetchCategories(formData.category);
        }
    }, [formData.category]);

    const fetchCategories = async (type: string) => {
        try {
            const { data } = await categoryApi.getAll(type);
            setCategories(data);
        } catch (error) {
            console.error('Failed to fetch categories', error);
        }
    };

    const handleDeleteCategory = async (id: string, name: string) => {
        if (!window.confirm(`Delete category "${name}"? Products using this category will be detached.`)) return;
        const toastId = toast.loading('Deleting category...');
        try {
            await categoryApi.delete(id);
            toast.success('Category deleted', { id: toastId });
            setCategories(prev => prev.filter(c => c.id !== id));
            setAllCategories(prev => prev.filter(c => c.id !== id));
            // Update form if this category was selected
            if (formData.categoryId === id) {
                setFormData(prev => ({ ...prev, categoryId: '' }));
            }
        } catch (error) {
            toast.error('Failed to delete category', { id: toastId });
        }
    };

    const handleUpdateCategory = async (id: string) => {
        if (!editingCategoryName.trim()) return;
        const toastId = toast.loading('Updating category...');
        try {
            const { data } = await categoryApi.update(id, { name: editingCategoryName, type: formData.category });
            toast.success('Category updated', { id: toastId });
            setCategories(prev => prev.map(c => c.id === id ? data : c));
            setAllCategories(prev => prev.map(c => c.id === id ? data : c));
            setEditingCategoryId(null);
            setEditingCategoryName('');
        } catch (error) {
            toast.error('Failed to update category', { id: toastId });
        }
    };

    const handleCreateType = async () => {
        if (!newTypeName.trim()) return;

        // No need to create a "General" category anymore. 
        // We just add the type to our local state.
        const typeExists = productTypes.includes(newTypeName);
        if (!typeExists) {
            setProductTypes(prev => [...prev, newTypeName].sort());
        }

        setFormData(prev => ({
            ...prev,
            category: newTypeName,
            categoryId: '' // Clear category since none exists for this type yet
        }));

        setIsCreatingType(false);
        setNewTypeName('');
        toast.success(`Type "${newTypeName}" added to the list.`);
    };

    const handleUpdateType = async (oldName: string) => {
        if (!editingTypeNewName.trim()) return;
        const toastId = toast.loading('Renaming type...');
        try {
            await categoryApi.updateType(oldName, editingTypeNewName);
            toast.success('Type renamed', { id: toastId });
            setProductTypes(prev => prev.map(t => t === oldName ? editingTypeNewName : t));
            if (formData.category === oldName) {
                setFormData(prev => ({ ...prev, category: editingTypeNewName }));
            }
            setEditingTypeOldName(null);
            setEditingTypeNewName('');
        } catch (error) {
            toast.error('Failed to rename type', { id: toastId });
        }
    };

    const handleDeleteType = async (name: string) => {
        if (!window.confirm(`Delete type "${name}"? ALL sub-categories will be deleted and products will be detached. This cannot be undone.`)) return;
        const toastId = toast.loading('Deleting type...');
        try {
            await categoryApi.deleteType(name);
            toast.success('Type deleted', { id: toastId });
            setProductTypes(prev => prev.filter(t => t !== name));
            setAllCategories(prev => prev.filter(c => c.type !== name));
            if (formData.category === name) {
                setFormData(prev => ({ ...prev, category: '', categoryId: '' }));
            }
        } catch (error) {
            toast.error('Failed to delete type', { id: toastId });
        }
    };

    const fetchStaff = async () => {
        try {
            const { data } = await staffApi.getAll();
            if (data.success) {
                setStaff(data.data || []);
            }
        } catch (error) {
            console.error('Failed to fetch staff', error);
        }
    };

    const fetchProducts = async () => {
        try {
            setLoading(true);
            const { data } = await productApi.getAll();
            if (data.success) {
                setProducts(data.data);
            }
        } catch (error) {
            toast.error('Failed to load products');
        } finally {
            setLoading(false);
        }
    };

    const fetchSources = async () => {
        setFetchingSources(true);
        try {
            const { data } = await botStudioApi.getKnowledgeSources();
            if (data.success) {
                setAllRagSources(data.data || []);
            }
        } catch (error) {
            console.error('Failed to fetch RAG sources', error);
        } finally {
            setFetchingSources(false);
        }
    };

    const handleOpenModal = (product?: Product) => {
        setPendingFiles([]); // Clear any pending uploads from previous tries
        fetchSources(); // Always fetch fresh sources when opening modal
        if (product) {
            setEditingProduct(product);
            // Explicitly set only the fields we need in the form, don't spread ...product
            setFormData({
                title: product.title || '',
                price: product.price?.toString() || '',
                category: product.category || 'Apartment',
                location: product.location || product.metadata?.location || '',
                status: product.status || 'Active',
                agent: product.agent || product.metadata?.agent || product.metadata?.agent_name || product.metadata?.metadata?.agent || '',
                description: product.description || product.metadata?.description || '',
                imageUrl: product.imageUrl || '',
                currency: product.currency || 'USD',
                // Unpack industry-specific fields from metadata (handling potential double-nesting)
                bedrooms: product.metadata?.bedrooms ?? product.metadata?.metadata?.bedrooms ?? 0,
                bathrooms: product.metadata?.bathrooms ?? product.metadata?.metadata?.bathrooms ?? 0,
                sqft: product.metadata?.sqft ?? product.metadata?.metadata?.sqft ?? 0,
                yearBuilt: product.metadata?.yearBuilt ?? product.metadata?.metadata?.yearBuilt ?? new Date().getFullYear(),
                mileage: product.metadata?.mileage ?? product.metadata?.metadata?.mileage ?? '',
                fuelType: product.metadata?.fuelType ?? product.metadata?.metadata?.fuelType ?? '',
                brand: (product.brand || product.metadata?.brand) ?? product.metadata?.metadata?.brand ?? '',
                condition: (product.condition || product.metadata?.condition) ?? product.metadata?.metadata?.condition ?? 'new',
                categoryId: product.categoryId || '',
                documents: product.documents || product.metadata?.documents || []
            });
        } else {
            setEditingProduct(null);
            setFormData({
                title: '',
                price: '',
                category: 'Apartment',
                location: '',
                status: 'Active',
                agent: '',
                description: '',
                imageUrl: '',
                currency: 'USD',
                bedrooms: 0,
                bathrooms: 0,
                sqft: 0,
                yearBuilt: new Date().getFullYear(),
                mileage: '',
                fuelType: '',
                brand: '',
                condition: 'new',
                categoryId: '',
                documents: []
            });
        }
        setIsModalOpen(true);
    };

    const handleSubmit = async () => {
        const toastId = toast.loading(editingProduct ? 'Updating listing...' : 'Creating listing...');
        try {
            const priceValue = typeof formData.price === 'string'
                ? parseFloat(formData.price.replace(/[^0-9.]/g, ''))
                : formData.price;

            if (formData.imageUrl?.startsWith('data:')) {
                toast.error('Image is too large. Please use a direct URL or a smaller file.', { id: toastId });
                return;
            }

            let finalDocuments = [...(formData.documents || [])];

            // 1. Process Pending Document Uploads First (for new listings)
            if (!editingProduct && pendingFiles.length > 0) {
                const uploadToastId = toast.loading(`Uploading ${pendingFiles.length} documents...`);
                try {
                    const uploadedResults = await Promise.all(pendingFiles.map(file => botStudioApi.uploadKnowledgeFile(file)));

                    const newDocs = uploadedResults.map((res, index) => {
                        const data = res.data?.data || res.data;
                        const source = data.source || data;
                        return {
                            id: source.id || data.id || `doc-${Date.now()}-${index}`,
                            name: pendingFiles[index].name,
                            size: (pendingFiles[index].size / (1024 * 1024)).toFixed(1) + ' MB',
                            createdAt: new Date().toISOString()
                        };
                    });

                    // Replace "pending-" placeholders with real document data
                    finalDocuments = [...finalDocuments.filter(d => !d.id.startsWith('pending-')), ...newDocs];
                    toast.success('Documents uploaded successfully', { id: uploadToastId });
                } catch (error) {
                    console.error('Pre-save upload error:', error);
                    toast.error('Some documents failed to upload. You can re-upload them in Edit mode.', { id: uploadToastId });
                }
            }

            // 2. Prepare Final Metadata & Payload
            const metadata: any = {
                agent: formData.agent,
                location: formData.location,
                description: formData.description,
                bedrooms: Number(formData.bedrooms) || 0,
                bathrooms: Number(formData.bathrooms) || 0,
                sqft: Number(formData.sqft) || 0,
                yearBuilt: Number(formData.yearBuilt) || new Date().getFullYear(),
                mileage: formData.mileage,
                fuelType: formData.fuelType,
                brand: formData.brand,
                condition: formData.condition,
                documents: finalDocuments
            };

            const payload: any = {
                title: formData.title,
                price: isNaN(priceValue as number) ? "0" : priceValue.toString(),
                description: formData.description,
                category: formData.category,
                imageUrl: formData.imageUrl,
                image_url: formData.imageUrl, // Backend compatibility
                currency: formData.currency || 'USD',
                status: formData.status,
                brand: formData.brand || '',
                condition: formData.condition || 'new',
                availability: 'in stock',
                agent: formData.agent,
                location: formData.location,
                categoryId: formData.categoryId || null,
                documents: finalDocuments,
                metadata: metadata
            };

            // 3. Save Product
            if (editingProduct) {
                await productApi.update(editingProduct.id, payload);
                toast.success('Listing updated successfully', { id: toastId });
            } else {
                await productApi.create(payload);
                toast.success('Listing created successfully', { id: toastId });
            }

            setIsModalOpen(false);
            setPendingFiles([]);
            fetchProducts();
        } catch (error) {
            toast.error('Failed to save listing', { id: toastId });
        }
    };

    const handleDelete = async (id: string, title: string) => {
        if (!window.confirm(`Are you sure you want to delete "${title}"? This action cannot be undone.`)) {
            return;
        }

        const toastId = toast.loading('Deleting listing...');
        try {
            await productApi.delete(id);
            toast.success('Listing deleted successfully', { id: toastId });
            fetchProducts();
        } catch (error) {
            console.error('Delete error:', error);
            toast.error('Failed to delete listing', { id: toastId });
        }
    };

    const handleLinkSource = async (sourceId: string, isLinked: boolean) => {
        if (!editingProduct) {
            toast.error('Save the product first before linking external sources.');
            return;
        }

        const toastId = toast.loading(isLinked ? 'Linking source...' : 'Unlinking source...');
        try {
            await ragApi.updateSource(sourceId, { productId: isLinked ? editingProduct.id : null });
            toast.success(isLinked ? 'Source linked' : 'Source unlinked', { id: toastId });
            fetchSources(); // Refresh to show updated links
        } catch (error) {
            toast.error('Failed to update source link', { id: toastId });
        }
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!editingProduct) {
            // Store file in pending queue for new listings
            setPendingFiles(prev => [...prev, file]);
            const newDoc = {
                id: `pending-${Date.now()}:::${file.name}`,
                name: file.name,
                size: (file.size / (1024 * 1024)).toFixed(1) + ' MB',
                createdAt: new Date().toISOString()
            };
            setFormData(prev => ({
                ...prev,
                documents: [...(prev.documents || []), newDoc]
            }));
            toast.success('File queued. It will be uploaded after you save the listing.');
            return;
        }

        const toastId = toast.loading('Uploading document...');
        try {
            const { data } = await botStudioApi.uploadKnowledgeFile(file, editingProduct?.id);
            // Some backends return the doc info in data.source, some in data.data, some in data directly
            const responseData = data.data || data;
            const sourceInfo = responseData.source || responseData;

            if (data.success || responseData.id || sourceInfo.id) {
                const newDoc = {
                    id: sourceInfo.id || responseData.id || `doc-${Date.now()}`,
                    name: file.name,
                    size: (file.size / (1024 * 1024)).toFixed(1) + ' MB',
                    createdAt: new Date().toISOString()
                };
                setFormData(prev => ({
                    ...prev,
                    documents: [...(prev.documents || []), newDoc]
                }));
                toast.success('Document uploaded successfully', { id: toastId });
            }
        } catch (error) {
            console.error('Upload error:', error);
            toast.error('Upload failed. Check console for details.', { id: toastId });
        }
    };

    const removeDoc = (id: string) => {
        if (id.startsWith('pending-')) {
            // Find the name from the ID (we encoded it)
            const parts = id.split(':::');
            if (parts.length > 1) {
                const fileName = parts[1];
                setPendingFiles(prev => prev.filter(f => f.name !== fileName));
            }
        }
        setFormData(prev => ({
            ...prev,
            documents: (prev.documents || []).filter(d => d.id !== id)
        }));
    };

    const getCategoryIcon = (cat?: string) => {
        switch (cat?.toLowerCase()) {
            case 'car': return <Car size={14} />;
            case 'house': return <Home size={14} />;
            case 'apartment': return <Building2 size={14} />;
            default: return <Building2 size={14} />;
        }
    };

    const filteredProducts = products.filter(p => {
        // Search filter
        const searchMatches = p.title.toLowerCase().includes(search.toLowerCase()) ||
            (p.category || '').toLowerCase().includes(search.toLowerCase()) ||
            (p.categoryRef?.name || '').toLowerCase().includes(search.toLowerCase()) ||
            (p.location || '').toLowerCase().includes(search.toLowerCase());

        if (!searchMatches) return false;

        // --- TYPE FILTER ---
        if (selectedFilterType !== 'all' && p.category !== selectedFilterType) {
            return false;
        }

        // --- SUB-CATEGORY FILTER ---
        if (selectedFilterSubCategory !== 'all' && p.categoryId !== selectedFilterSubCategory) {
            return false;
        }

        return true;
    });

    return (
        <div className="p-8 space-y-8 bg-[#f9fafb] min-h-full">
            <SectionHeader
                title="Product Listings"
                subtitle="Manage your properties and vehicles."
                action={
                    <Button onClick={() => handleOpenModal()} className="rounded-xl shadow-lg shadow-gray-200">
                        <Plus size={18} /> Add New Listing
                    </Button>
                }
            />

            <Card className="p-4 flex items-center gap-4 bg-white border-none shadow-sm overflow-visible">
                <div className="flex-1 relative group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#25D366] transition-colors" size={20} />
                    <input
                        type="text"
                        placeholder="Search listings..."
                        className="w-full pl-12 pr-4 py-3 bg-gray-50/50 border border-gray-100 rounded-2xl text-sm outline-none focus:ring-4 focus:ring-[#25D366]/5 focus:border-[#25D366] transition-all"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>

                <div className="relative">
                    <Button
                        variant="outline"
                        className={cn(
                            "px-4 py-2.5 rounded-2xl flex items-center gap-2 border-gray-100 bg-gray-50/50 hover:bg-white hover:border-[#25D366] transition-all group",
                            (selectedFilterType !== 'all' || selectedFilterSubCategory !== 'all') && "border-[#25D366] bg-[#25D366]/5"
                        )}
                        onClick={() => setIsFilterMenuOpen(!isFilterMenuOpen)}
                    >
                        <Filter size={16} className={cn(
                            "text-gray-400 group-hover:text-[#25D366]",
                            (selectedFilterType !== 'all' || selectedFilterSubCategory !== 'all') && "text-[#25D366]"
                        )} />
                        <span className="text-[10px] font-black uppercase tracking-widest text-gray-600">
                            {selectedFilterSubCategory !== 'all'
                                ? allCategories.find(c => c.id === selectedFilterSubCategory)?.name
                                : selectedFilterType !== 'all'
                                    ? selectedFilterType
                                    : 'Filter Categories'}
                        </span>
                    </Button>

                    <AnimatePresence>
                        {isFilterMenuOpen && (
                            <>
                                {/* Overlay to close on click outside */}
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="fixed inset-0 z-40 bg-transparent"
                                    onClick={() => {
                                        setIsFilterMenuOpen(false);
                                        setHoveredType(null);
                                    }}
                                />

                                <motion.div
                                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                    className="absolute right-0 mt-3 z-50 flex gap-1"
                                >
                                    {/* Main Menu (Types) */}
                                    <div className="w-56 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden py-2 p-1.5">
                                        <button
                                            className={cn(
                                                "w-full text-left px-4 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                                                selectedFilterType === 'all' ? "bg-[#25D366] text-white shadow-lg shadow-green-100" : "text-gray-500 hover:bg-gray-50"
                                            )}
                                            onClick={() => {
                                                setSelectedFilterType('all');
                                                setSelectedFilterSubCategory('all');
                                                setIsFilterMenuOpen(false);
                                            }}
                                            onMouseEnter={() => setHoveredType(null)}
                                        >
                                            All Types
                                        </button>
                                        <div className="h-px bg-gray-50 my-1.5 mx-2" />
                                        {productTypes.map(type => (
                                            <div
                                                key={type}
                                                className="relative"
                                                onMouseEnter={() => setHoveredType(type)}
                                            >
                                                <button
                                                    className={cn(
                                                        "w-full text-left px-4 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-between group",
                                                        selectedFilterType === type ? "bg-[#25D366] text-white" : "text-gray-500 hover:bg-gray-50"
                                                    )}
                                                    onClick={() => {
                                                        setSelectedFilterType(type);
                                                        setSelectedFilterSubCategory('all');
                                                        setIsFilterMenuOpen(false);
                                                    }}
                                                >
                                                    {type}
                                                    <ChevronRight size={12} className={cn(
                                                        "transition-transform",
                                                        hoveredType === type && "translate-x-1"
                                                    )} />
                                                </button>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Submenu (Categories) */}
                                    {hoveredType && (
                                        <motion.div
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            className="w-56 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden py-2 p-1.5"
                                        >
                                            <div className="px-4 py-2 border-b border-gray-50 mb-1.5">
                                                <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Subcategories</span>
                                            </div>
                                            <div className="max-h-64 overflow-y-auto custom-scrollbar">
                                                {allCategories
                                                    .filter(cat => cat.type === hoveredType)
                                                    .map(cat => (
                                                        <button
                                                            key={cat.id}
                                                            className={cn(
                                                                "w-full text-left px-4 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                                                                selectedFilterSubCategory === cat.id ? "bg-[#25D366] text-white shadow-lg shadow-green-100" : "text-gray-500 hover:bg-gray-50"
                                                            )}
                                                            onClick={() => {
                                                                setSelectedFilterSubCategory(cat.id);
                                                                setSelectedFilterType(hoveredType);
                                                                setIsFilterMenuOpen(false);
                                                            }}
                                                        >
                                                            {cat.name}
                                                        </button>
                                                    ))
                                                }
                                                {allCategories.filter(cat => cat.type === hoveredType).length === 0 && (
                                                    <p className="px-4 py-4 text-[10px] text-gray-400 font-bold uppercase italic">No Categories</p>
                                                )}
                                            </div>
                                        </motion.div>
                                    )}
                                </motion.div>
                            </>
                        )}
                    </AnimatePresence>
                </div>

                <div className="flex bg-gray-100 p-1 rounded-2xl">
                    <button
                        onClick={() => setViewMode('grid')}
                        className={cn("p-2 rounded-xl transition-all", viewMode === 'grid' ? "bg-white text-gray-900 shadow-sm" : "text-gray-400 hover:text-gray-600")}
                    >
                        <LayoutGrid size={20} />
                    </button>
                    <button
                        onClick={() => setViewMode('list')}
                        className={cn("p-2 rounded-xl transition-all", viewMode === 'list' ? "bg-white text-gray-900 shadow-sm" : "text-gray-400 hover:text-gray-600")}
                    >
                        <List size={20} />
                    </button>
                </div>
            </Card>

            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                    {[1, 2, 3, 4, 5].map(i => (
                        <div key={i} className="h-[340px] bg-white rounded-[2rem] animate-pulse border border-gray-100" />
                    ))}
                </div>
            ) : (
                <div className={cn(
                    "grid gap-6",
                    viewMode === 'grid' ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5" : "grid-cols-1"
                )}>
                    {filteredProducts.map(p => (
                        <motion.div
                            key={p.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            layout
                            className="group"
                        >
                            <Card className={cn(
                                "bg-white border-none shadow-xl shadow-gray-200/50 rounded-[2rem] overflow-hidden hover:shadow-2xl hover:shadow-gray-300/50 transition-all duration-500 flex",
                                viewMode === 'grid' ? "flex-col h-full" : "flex-col md:flex-row h-auto md:h-64"
                            )}>
                                {/* Image Container */}
                                <div className={cn(
                                    "relative overflow-hidden shrink-0",
                                    viewMode === 'grid' ? "aspect-[4/3] w-full" : "w-full md:w-80 h-48 md:h-full"
                                )}>
                                    <img
                                        src={p.imageUrl || "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&auto=format&fit=crop"}
                                        alt={p.title}
                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                    />
                                    <div className="absolute top-3 left-3 right-3 flex justify-between items-start">
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => handleOpenModal(p)}
                                                className="p-2.5 bg-white/90 backdrop-blur-md rounded-xl text-gray-900 shadow-xl opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300"
                                            >
                                                <Edit2 size={14} />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(p.id, p.title)}
                                                className="p-2.5 bg-red-500/90 backdrop-blur-md rounded-xl text-white shadow-xl opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 delay-75"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                        <Badge
                                            variant={p.status?.toLowerCase() === 'active' ? 'success' : 'warning'}
                                            className="bg-white/90 backdrop-blur-md border-none px-3 py-1 text-[10px]"
                                        >
                                            {p.status || 'Active'}
                                        </Badge>
                                    </div>
                                </div>

                                {/* Content Details */}
                                <div className={cn(
                                    "p-6 flex flex-col justify-between flex-1",
                                    viewMode === 'list' && "md:p-8"
                                )}>
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-[#FF4D4D]">
                                                {p.categoryRef ? `${p.category} • ${p.categoryRef.name}` : p.category}
                                            </div>
                                            {p.metadata && (
                                                <div className="flex items-center gap-3 text-[10px] font-bold text-gray-400">
                                                    {(p.metadata.bedrooms || p.metadata.metadata?.bedrooms) && (
                                                        <span className="flex items-center gap-1.5"><Home size={12} className="text-gray-300" /> {p.metadata.bedrooms || p.metadata.metadata.bedrooms}</span>
                                                    )}
                                                    {(p.metadata.bathrooms || p.metadata.metadata?.bathrooms) && (
                                                        <span className="flex items-center gap-1.5"><Home size={12} className="text-gray-300" /> {p.metadata.bathrooms || p.metadata.metadata.bathrooms}</span>
                                                    )}
                                                    {(p.metadata.sqft || p.metadata.metadata?.sqft) && (
                                                        <span className="flex items-center gap-1.5"><Maximize2 size={12} className="text-gray-300" /> {p.metadata.sqft || p.metadata.metadata.sqft}ft²</span>
                                                    )}
                                                </div>
                                            )}
                                        </div>

                                        <div>
                                            <h4 className={cn(
                                                "font-black text-gray-900 group-hover:text-[#25D366] transition-colors line-clamp-1",
                                                viewMode === 'grid' ? "text-base" : "text-2xl"
                                            )}>{p.title}</h4>
                                            <p className={cn(
                                                "font-black text-gray-900 mt-1",
                                                viewMode === 'grid' ? "text-lg" : "text-2xl"
                                            )}>
                                                {typeof p.price === 'number' ? `$ ${p.price.toLocaleString()}` : p.price}
                                            </p>
                                        </div>

                                        {viewMode === 'list' && p.description && (
                                            <p className="text-sm text-gray-500 font-medium line-clamp-2 mt-2 leading-relaxed max-w-2xl">
                                                {p.description}
                                            </p>
                                        )}
                                    </div>

                                    <div className={cn(
                                        "flex border-t border-gray-50 pt-4 items-center justify-between text-[11px] font-bold text-gray-400",
                                        viewMode === 'list' && "mt-auto"
                                    )}>
                                        <div className="flex gap-6">
                                            <div className="flex items-center gap-2.5">
                                                <div className="w-8 h-8 bg-gray-50 rounded-lg flex items-center justify-center">
                                                    <MapPin size={16} className="text-[#25D366]" />
                                                </div>
                                                <span className="truncate max-w-[150px]">{p.location || p.metadata?.location || 'Location...'}</span>
                                            </div>
                                            <div className="flex items-center gap-2.5">
                                                <div className="w-8 h-8 bg-gray-50 rounded-lg flex items-center justify-center">
                                                    <User size={16} className="text-[#25D366]" />
                                                </div>
                                                <span>{p.agent || p.metadata?.agent || p.metadata?.agent_name || 'Agent...'}</span>
                                            </div>
                                        </div>

                                        {viewMode === 'list' && (
                                            <Button variant="outline" onClick={() => handleOpenModal(p)} className="rounded-xl px-6">
                                                View Details
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            </Card>
                        </motion.div>
                    ))}
                </div>
            )}

            {/* Edit/Add Modal */}
            <AnimatePresence>
                {isModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-end">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm"
                            onClick={() => setIsModalOpen(false)}
                        />
                        <motion.div
                            initial={{ x: '100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '100%' }}
                            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                            className="relative w-full max-w-2xl h-full bg-white shadow-2xl flex flex-col overflow-hidden"
                        >
                            <div className="p-8 border-b border-gray-100 flex justify-between items-center bg-gray-50/50 sticky top-0 z-10">
                                <div>
                                    <h3 className="text-2xl font-black text-gray-900">{editingProduct ? 'Edit Listing' : 'New Listing'}</h3>
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">Configure your WhatsApp Catalogue item</p>
                                </div>
                                <button onClick={() => setIsModalOpen(false)} className="p-3 hover:bg-white rounded-2xl text-gray-400 hover:text-gray-900 transition-all shadow-sm ring-1 ring-gray-100"><X size={24} /></button>
                            </div>

                            <div className="flex-1 overflow-y-auto p-10 space-y-12 scrollbar-hide">
                                {/* Basic Info Section */}
                                <section className="space-y-6">
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className="w-1.5 h-6 bg-[#25D366] rounded-full" />
                                        <h5 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Basic Info & Image</h5>
                                    </div>

                                    <div className="flex gap-8 items-start">
                                        <div className="w-32 h-32 rounded-3xl bg-gray-50 border border-gray-100 overflow-hidden relative group shrink-0 shadow-sm hover:shadow-md transition-all">
                                            {formData.imageUrl ? (
                                                <img src={formData.imageUrl} alt="Preview" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                            ) : (
                                                <div className="w-full h-full flex flex-col items-center justify-center text-gray-300 gap-2">
                                                    <Camera size={24} />
                                                    <span className="text-[8px] font-black uppercase tracking-widest">No Image</span>
                                                </div>
                                            )}
                                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center">
                                                <label className="cursor-pointer p-2 bg-white rounded-xl shadow-lg hover:scale-110 transition-all text-gray-900">
                                                    <Upload size={16} />
                                                    <input
                                                        type="file"
                                                        className="hidden"
                                                        accept="image/*"
                                                        onChange={async (e) => {
                                                            const file = e.target.files?.[0];
                                                            if (!file) return;
                                                            const toastId = toast.loading('Uploading to Cloudinary...');
                                                            try {
                                                                const { data } = await mediaApi.upload(file);
                                                                if (data.success && data.data?.url) {
                                                                    setFormData({ ...formData, imageUrl: data.data.url });
                                                                    toast.success('Image uploaded successfully', { id: toastId });
                                                                }
                                                            } catch (err) {
                                                                toast.error('Cloudinary upload failed', { id: toastId });
                                                            }
                                                        }}
                                                    />
                                                </label>
                                            </div>
                                        </div>
                                        <div className="flex-1 space-y-4">
                                            <Input
                                                label="Listing Title"
                                                placeholder="e.g. Modern Downtown Apartment"
                                                value={formData.title}
                                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                            />
                                            <Input
                                                label="Image URL"
                                                placeholder="https://images.unsplash.com/..."
                                                value={formData.imageUrl}
                                                onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-6">
                                        <Input
                                            label="Price"
                                            placeholder="e.g. $4,500/mo"
                                            value={formData.price}
                                            onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                        />
                                        <div className="flex-1 space-y-1.5">
                                            <div className="flex items-center justify-between">
                                                <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Type</label>
                                                <div className="flex items-center gap-2">
                                                    {!isManagingTypes && !isCreatingType && (
                                                        <button
                                                            type="button"
                                                            onClick={() => setIsManagingTypes(true)}
                                                            className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-1 hover:text-gray-900"
                                                            title="Manage Types"
                                                        >
                                                            <Settings2 size={12} /> Manage
                                                        </button>
                                                    )}
                                                </div>
                                            </div>

                                            {isCreatingType ? (
                                                <div className="flex gap-2">
                                                    <input
                                                        type="text"
                                                        placeholder="New Type (e.g. Services)"
                                                        className="flex-1 px-4 py-2 bg-white border border-gray-100 rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#25D366]/20 focus:border-[#25D366] transition-all"
                                                        value={newTypeName}
                                                        onChange={(e) => setNewTypeName(e.target.value)}
                                                        autoFocus
                                                    />
                                                    <Button size="sm" onClick={handleCreateType}>Save</Button>
                                                    <Button variant="outline" size="sm" onClick={() => setIsCreatingType(false)}><X size={14} /></Button>
                                                </div>
                                            ) : isManagingTypes ? (
                                                <div className="bg-gray-50/50 rounded-2xl border border-gray-100 p-4 space-y-3">
                                                    <div className="flex items-center justify-between border-b border-gray-100 pb-2 mb-2">
                                                        <span className="text-[10px] font-black uppercase text-gray-400">Manage Product Types</span>
                                                        <div className="flex items-center gap-2">
                                                            <button type="button" onClick={() => setIsCreatingType(true)} className="text-[10px] font-black text-[#25D366] uppercase tracking-widest flex items-center gap-1 hover:opacity-70">
                                                                <PlusCircle size={12} /> Add New
                                                            </button>
                                                            <button type="button" onClick={() => setIsManagingTypes(false)} className="text-gray-400 hover:text-gray-900"><X size={14} /></button>
                                                        </div>
                                                    </div>
                                                    <div className="space-y-2 max-h-40 overflow-y-auto pr-2 custom-scrollbar">
                                                        {productTypes.map(type => (
                                                            <div key={type} className="flex items-center justify-between gap-3 p-2 bg-white rounded-xl border border-gray-50 group">
                                                                {editingTypeOldName === type ? (
                                                                    <div className="flex-1 flex gap-2">
                                                                        <input
                                                                            type="text"
                                                                            value={editingTypeNewName}
                                                                            onChange={(e) => setEditingTypeNewName(e.target.value)}
                                                                            className="flex-1 bg-gray-50 text-[11px] font-bold px-2 py-1 rounded-lg outline-none ring-1 ring-[#25D366] focus:ring-2"
                                                                            autoFocus
                                                                            onKeyDown={(e) => e.key === 'Enter' && handleUpdateType(type)}
                                                                        />
                                                                        <button type="button" onClick={() => handleUpdateType(type)} className="text-[#25D366]"><Check size={14} /></button>
                                                                        <button type="button" onClick={() => setEditingTypeOldName(null)} className="text-gray-400"><X size={14} /></button>
                                                                    </div>
                                                                ) : (
                                                                    <>
                                                                        <span className="text-[11px] font-black text-gray-700">{type}</span>
                                                                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all">
                                                                            <button
                                                                                type="button"
                                                                                onClick={() => {
                                                                                    setEditingTypeOldName(type);
                                                                                    setEditingTypeNewName(type);
                                                                                }}
                                                                                className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-gray-900"
                                                                            >
                                                                                <Edit2 size={12} />
                                                                            </button>
                                                                            <button
                                                                                type="button"
                                                                                onClick={() => handleDeleteType(type)}
                                                                                className="p-1.5 hover:bg-red-50 rounded-lg text-gray-400 hover:text-red-500"
                                                                            >
                                                                                <Trash2 size={12} />
                                                                            </button>
                                                                        </div>
                                                                    </>
                                                                )}
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            ) : (
                                                <select
                                                    className="w-full px-4 py-2.5 bg-gray-50/50 border border-gray-100 rounded-xl text-sm outline-none focus:ring-4 focus:ring-[#25D366]/10 focus:border-[#25D366] transition-all"
                                                    value={formData.category}
                                                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                                >
                                                    <option value="">Select Type</option>
                                                    {productTypes.map(type => (
                                                        <option key={type} value={type}>{type}</option>
                                                    ))}
                                                </select>
                                            )}
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-1 gap-6">
                                        <div className="space-y-1.5">
                                            <div className="flex items-center justify-between">
                                                <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Category (Sub-type)</label>
                                                <div className="flex items-center gap-2">
                                                    {!isCreatingCategory && !isManagingCategories && (
                                                        <>
                                                            <button
                                                                onClick={() => setIsManagingCategories(true)}
                                                                className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-1 hover:text-gray-900"
                                                                title="Manage Categories"
                                                            >
                                                                <Settings2 size={12} /> Manage
                                                            </button>
                                                            <button
                                                                onClick={() => setIsCreatingCategory(true)}
                                                                className="text-[10px] font-black text-[#25D366] uppercase tracking-widest flex items-center gap-1 hover:opacity-70"
                                                            >
                                                                <PlusCircle size={12} /> Add New
                                                            </button>
                                                        </>
                                                    )}
                                                </div>
                                            </div>

                                            {isCreatingCategory ? (
                                                <div className="flex gap-2">
                                                    <input
                                                        type="text"
                                                        placeholder="Name (e.g. Laptop)"
                                                        className="flex-1 px-4 py-2 bg-white border border-gray-100 rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#25D366]/20 focus:border-[#25D366] transition-all"
                                                        value={newCategoryName}
                                                        onChange={(e) => setNewCategoryName(e.target.value)}
                                                        autoFocus
                                                    />
                                                    <Button
                                                        size="sm"
                                                        onClick={async () => {
                                                            if (!newCategoryName.trim()) return;
                                                            const toastId = toast.loading('Creating category...');
                                                            try {
                                                                const { data } = await categoryApi.create({
                                                                    name: newCategoryName,
                                                                    type: formData.category
                                                                });
                                                                toast.success('Category created', { id: toastId });
                                                                setCategories(prev => [...prev, data]);
                                                                setAllCategories(prev => [...prev, data]);
                                                                setFormData(prev => ({ ...prev, categoryId: data.id }));
                                                                setIsCreatingCategory(false);
                                                                setNewCategoryName('');
                                                            } catch (err) {
                                                                toast.error('Failed to create category', { id: toastId });
                                                            }
                                                        }}
                                                    >
                                                        Save
                                                    </Button>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => {
                                                            setIsCreatingCategory(false);
                                                            setNewCategoryName('');
                                                        }}
                                                    >
                                                        <X size={14} />
                                                    </Button>
                                                </div>
                                            ) : isManagingCategories ? (
                                                <div className="bg-gray-50/50 rounded-2xl border border-gray-100 p-4 space-y-3">
                                                    <div className="flex items-center justify-between border-b border-gray-100 pb-2 mb-2">
                                                        <span className="text-[10px] font-black uppercase text-gray-400">Manage {formData.category} Sub-types</span>
                                                        <button onClick={() => setIsManagingCategories(false)} className="text-gray-400 hover:text-gray-900"><X size={14} /></button>
                                                    </div>
                                                    <div className="space-y-2 max-h-40 overflow-y-auto pr-2 custom-scrollbar">
                                                        {categories.length === 0 && <p className="text-center py-4 text-[10px] text-gray-400 font-bold uppercase italic">No sub-types found</p>}
                                                        {categories.map(cat => (
                                                            <div key={cat.id} className="flex items-center justify-between gap-3 p-2 bg-white rounded-xl border border-gray-50 group">
                                                                {editingCategoryId === cat.id ? (
                                                                    <div className="flex-1 flex gap-2">
                                                                        <input
                                                                            type="text"
                                                                            value={editingCategoryName}
                                                                            onChange={(e) => setEditingCategoryName(e.target.value)}
                                                                            className="flex-1 bg-gray-50 text-[11px] font-bold px-2 py-1 rounded-lg outline-none ring-1 ring-[#25D366] focus:ring-2"
                                                                            autoFocus
                                                                            onKeyDown={(e) => e.key === 'Enter' && handleUpdateCategory(cat.id)}
                                                                        />
                                                                        <button onClick={() => handleUpdateCategory(cat.id)} className="text-[#25D366]"><Check size={14} /></button>
                                                                        <button onClick={() => setEditingCategoryId(null)} className="text-gray-400"><X size={14} /></button>
                                                                    </div>
                                                                ) : (
                                                                    <>
                                                                        <span className="text-[11px] font-black text-gray-700">{cat.name}</span>
                                                                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all">
                                                                            <button
                                                                                onClick={() => {
                                                                                    setEditingCategoryId(cat.id);
                                                                                    setEditingCategoryName(cat.name);
                                                                                }}
                                                                                className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-gray-900"
                                                                            >
                                                                                <Edit2 size={12} />
                                                                            </button>
                                                                            <button
                                                                                onClick={() => handleDeleteCategory(cat.id, cat.name)}
                                                                                className="p-1.5 hover:bg-red-50 rounded-lg text-gray-400 hover:text-red-500"
                                                                            >
                                                                                <Trash2 size={12} />
                                                                            </button>
                                                                        </div>
                                                                    </>
                                                                )}
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            ) : (
                                                <select
                                                    className="w-full px-4 py-2.5 bg-gray-50/50 border border-gray-100 rounded-xl text-sm outline-none focus:ring-4 focus:ring-[#25D366]/10 focus:border-[#25D366] transition-all"
                                                    value={formData.categoryId}
                                                    onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                                                >
                                                    <option value="">No Sub-Category</option>
                                                    {categories.map(cat => (
                                                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                                                    ))}
                                                </select>
                                            )}
                                        </div>
                                    </div>
                                    <Input
                                        label="Location"
                                        placeholder="e.g. Downtown, NY"
                                        value={formData.location}
                                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                    />
                                    <div className="grid grid-cols-2 gap-6">
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Status</label>
                                            <select
                                                className="w-full px-4 py-2.5 bg-gray-50/50 border border-gray-100 rounded-xl text-sm outline-none focus:ring-4 focus:ring-[#25D366]/10 focus:border-[#25D366] transition-all"
                                                value={formData.status}
                                                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                            >
                                                <option>Active</option>
                                                <option>Pending</option>
                                                <option>Sold</option>
                                                <option>Inactive</option>
                                            </select>
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Agent / Specialist</label>
                                            <select
                                                className="w-full px-4 py-2.5 bg-gray-50/50 border border-gray-100 rounded-xl text-sm outline-none focus:ring-4 focus:ring-[#25D366]/10 focus:border-[#25D366] transition-all"
                                                value={formData.agent}
                                                onChange={(e) => setFormData({ ...formData, agent: e.target.value })}
                                            >
                                                <option value="">Select Agent...</option>
                                                {staff.map(s => (
                                                    <option key={s.id} value={s.name}>{s.name} ({s.role})</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                </section>

                                {/* Details Section */}
                                <section className="space-y-6">
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className="w-1.5 h-6 bg-purple-500 rounded-full" />
                                        <h5 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Details (Optional)</h5>
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Description</label>
                                        <textarea
                                            className="w-full px-4 py-3 bg-gray-50/50 border border-gray-100 rounded-xl text-sm outline-none focus:ring-4 focus:ring-[#25D366]/10 focus:border-[#25D366] transition-all min-h-[120px] resize-none"
                                            placeholder="Enter property details..."
                                            value={formData.description}
                                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        />
                                    </div>

                                    {/* Template: Vehicle (Car, Bike) */}
                                    {formData.category?.toLowerCase().includes('car') || formData.category?.toLowerCase().includes('bike') ? (
                                        <div className="grid grid-cols-2 gap-6">
                                            <Input
                                                label="Year Built"
                                                placeholder="e.g. 2023"
                                                type="number"
                                                value={formData.yearBuilt}
                                                onChange={(e) => setFormData({ ...formData, yearBuilt: parseInt(e.target.value) })}
                                            />
                                            <Input
                                                label="Mileage"
                                                placeholder="e.g. 25,000 km"
                                                value={formData.mileage}
                                                onChange={(e) => setFormData({ ...formData, mileage: e.target.value })}
                                            />
                                            <div className="space-y-1.5 col-span-2">
                                                <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Fuel Type</label>
                                                <select
                                                    className="w-full px-4 py-2.5 bg-gray-50/50 border border-gray-100 rounded-xl text-sm outline-none focus:ring-4 focus:ring-[#25D366]/10 focus:border-[#25D366] transition-all"
                                                    value={formData.fuelType}
                                                    onChange={(e) => setFormData({ ...formData, fuelType: e.target.value })}
                                                >
                                                    <option value="">Select...</option>
                                                    <option>Petrol</option>
                                                    <option>Diesel</option>
                                                    <option>Electric</option>
                                                    <option>Hybrid</option>
                                                </select>
                                            </div>
                                        </div>
                                    ) : formData.category?.toLowerCase().includes('apartment') || formData.category?.toLowerCase().includes('house') || formData.category?.toLowerCase().includes('commercial') ? (
                                        /* Template: Property */
                                        <div className="grid grid-cols-3 gap-6">
                                            <Input
                                                label="Bedrooms"
                                                type="number"
                                                value={formData.bedrooms}
                                                onChange={(e) => setFormData({ ...formData, bedrooms: parseInt(e.target.value) })}
                                            />
                                            <Input
                                                label="Bathrooms"
                                                type="number"
                                                value={formData.bathrooms}
                                                onChange={(e) => setFormData({ ...formData, bathrooms: parseInt(e.target.value) })}
                                            />
                                            <Input
                                                label="Square Feet"
                                                type="number"
                                                value={formData.sqft}
                                                onChange={(e) => setFormData({ ...formData, sqft: parseInt(e.target.value) })}
                                            />
                                        </div>
                                    ) : (
                                        /* Template: General Retail */
                                        <div className="grid grid-cols-2 gap-6">
                                            <Input
                                                label="Brand"
                                                placeholder="e.g. Apple, Sony"
                                                value={formData.brand}
                                                onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                                            />
                                            <div className="space-y-1.5">
                                                <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Condition</label>
                                                <select
                                                    className="w-full px-4 py-2.5 bg-gray-50/50 border border-gray-100 rounded-xl text-sm outline-none focus:ring-4 focus:ring-[#25D366]/10 focus:border-[#25D366] transition-all"
                                                    value={formData.condition}
                                                    onChange={(e) => setFormData({ ...formData, condition: e.target.value })}
                                                >
                                                    <option value="new">New</option>
                                                    <option value="refurbished">Refurbished</option>
                                                    <option value="used">Used</option>
                                                </select>
                                            </div>
                                        </div>
                                    )}
                                </section>

                                {/* Knowledge Base Section */}
                                <section className="space-y-6">
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center gap-3">
                                            <div className="w-1.5 h-6 bg-indigo-500 rounded-full" />
                                            <h5 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Manuals & Product Knowledge</h5>
                                        </div>
                                        <span className="text-[9px] font-black text-indigo-500 uppercase tracking-widest">Product-Specific RAG</span>
                                    </div>

                                    <p className="text-[11px] font-medium text-gray-400 leading-relaxed">
                                        Upload documents (PDF, DOCX, TXT) to train the AI assistant on this specific listing. The AI will use these documents to answer customer queries.
                                    </p>

                                    {/* Link Existing Sources */}
                                    <div className="space-y-4 pt-4 border-t border-gray-100">
                                        <div className="flex items-center justify-between">
                                            <h6 className="text-[10px] font-black text-gray-900 uppercase tracking-widest">Link Existing Sources</h6>
                                            {fetchingSources && <Loader2 size={12} className="animate-spin text-gray-400" />}
                                        </div>
                                        <div className="grid grid-cols-1 gap-2 max-h-48 overflow-y-auto pr-2 scrollbar-hide">
                                            {allRagSources.length === 0 && !fetchingSources && (
                                                <p className="text-[10px] text-gray-400 italic">No global RAG sources found. Upload them in Bot Studio first.</p>
                                            )}
                                            {allRagSources
                                                .filter(source => !source.productId || source.productId === editingProduct?.id)
                                                .map(source => {
                                                    const isLinked = source.productId === editingProduct?.id;
                                                    return (
                                                        <div key={source.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100 group">
                                                            <div className="flex items-center gap-3">
                                                                <div className={cn(
                                                                    "p-2 rounded-lg",
                                                                    isLinked ? "bg-[#25D366]/10 text-[#25D366]" : "bg-white text-gray-400"
                                                                )}>
                                                                    <Database size={14} />
                                                                </div>
                                                                <div>
                                                                    <p className="text-xs font-bold text-gray-700 truncate max-w-[200px]">{source.title || source.name}</p>
                                                                    <p className="text-[9px] font-bold text-gray-400 uppercase tracking-tighter">
                                                                        {source.productId ? 'Product Specific' : 'General Business'}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                            <button
                                                                onClick={(e) => {
                                                                    e.preventDefault();
                                                                    handleLinkSource(source.id, !isLinked);
                                                                }}
                                                                className={cn(
                                                                    "px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all border",
                                                                    isLinked
                                                                        ? "bg-[#25D366] text-white border-[#25D366] shadow-lg shadow-green-100"
                                                                        : "bg-white text-gray-400 border-gray-100 hover:border-gray-200"
                                                                )}
                                                            >
                                                                {isLinked ? 'Linked' : 'Link'}
                                                            </button>
                                                        </div>
                                                    );
                                                })}
                                            {allRagSources.filter(source => !source.productId || source.productId === editingProduct?.id).length === 0 && !fetchingSources && (
                                                <p className="text-[10px] text-gray-400 italic">No available RAG sources to link.</p>
                                            )}
                                        </div>
                                    </div>

                                    <div className="relative group pt-4">
                                        <input
                                            type="file"
                                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                            onChange={handleFileUpload}
                                        />
                                        <div className="p-12 border-2 border-dashed border-gray-100 rounded-3xl bg-gray-50/50 group-hover:border-[#25D366] group-hover:bg-[#25D366]/5 transition-all flex flex-col items-center gap-4">
                                            <div className="p-4 bg-white rounded-2xl shadow-sm text-[#25D366]"><Upload size={24} /></div>
                                            <div className="text-center">
                                                <p className="text-sm font-black text-gray-900">Click or drag files to upload</p>
                                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter mt-1">PDF, DOCX, TXT up to 10MB</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        {(formData.documents || []).map(doc => (
                                            <div key={doc.id} className="p-4 bg-gray-50 rounded-2xl border border-gray-100 flex items-center justify-between group">
                                                <div className="flex items-center gap-4">
                                                    <div className="p-2 bg-white rounded-lg text-gray-400"><Smartphone size={16} /></div>
                                                    <div>
                                                        <div className="flex items-center gap-2">
                                                            <p className="text-xs font-black text-gray-900">{doc.name}</p>
                                                            {doc.id.startsWith('pending-') && (
                                                                <Badge className="bg-amber-50 text-amber-600 text-[8px] border-amber-100">Pending</Badge>
                                                            )}
                                                        </div>
                                                        <p className="text-[10px] font-bold text-gray-400 uppercase">{doc.size}</p>
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={() => removeDoc(doc.id)}
                                                    className="p-2 text-gray-100 group-hover:text-red-400 hover:text-red-600 transition-all"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </section>
                            </div>

                            <div className="p-8 bg-gray-50 border-t border-gray-100 flex gap-4 sticky bottom-0 z-10">
                                <Button variant="ghost" className="flex-1 rounded-2xl h-14" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                                <Button className="flex-1 rounded-2xl h-14 shadow-xl shadow-green-100" onClick={handleSubmit}>
                                    {editingProduct ? 'Update Listing' : 'Create Listing'}
                                </Button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default ProductListing;
