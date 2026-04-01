
import React, { useState, useEffect } from 'react';
import {
    Settings2,
    Calendar,
    Users,
    Key,
    Shield,
    Bell,
    Webhook,
    Database,
    Phone,
    Plus,
    CheckCircle2,
    X,
    Copy,
    RefreshCcw,
    ShieldCheck,
    Smartphone,
    Layout,
    Globe,
    MoreVertical,
    MinusCircle,
    Hash,
    Save,
    Loader2,
    ShoppingBag,
    Link2,
    AlertTriangle,
    Code2,
    Zap,
    Instagram,
    Facebook,
    Send,
    Mail,
    CreditCard
} from 'lucide-react';
import { cn, Card, Button, Badge, Input } from '../components/ui';
import { tenantApi, webhookApi } from '../lib/api/miscApi';
import { botStudioApi } from '../lib/api';
import { webhookTokenApi } from '../lib/api/webhookTokenApi';
import { toast } from 'react-hot-toast';
import { Tenant } from '../types';

const Settings: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'waba' | 'instagram' | 'facebook' | 'telegram' | 'email' | 'staff' | 'api' | 'webhooks' | 'orders' | 'gemini' | 'finance'>('waba');
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [testing, setTesting] = useState(false);
    const [settings, setSettings] = useState<Partial<Tenant>>({
        name: '',
        wabaId: '',
        phoneNumberId: '',
        accessToken: '',
        verifyToken: '',
        instagramPageId: '',
        instagramBusinessId: '',
        instagramAccessToken: '',
        instagramVerifyToken: '',
        facebookPageId: '',
        facebookAccessToken: '',
        facebookVerifyToken: '',
        telegramBotToken: '',
        telegramBotUsername: '',
        country: 'US',
        currency: 'USD',
        catalogueIds: [],
        geminiApiKey: '',
        geminiModel: 'gemini-1.5-flash',
        emailAddress: '',
        emailImapHost: '',
        emailImapPort: 993,
        emailSmtpHost: '',
        emailSmtpPort: 587,
        emailUser: '',
        emailPassword: '',
        useAppointments: true,
        requiresBookingAdvance: false,
        bookingAdvanceAmount: 0,
        requiresOrderAdvance: false,
        orderAdvanceAmount: 0,
        paymentInstructions: '',
        razorpayEnabled: true,
        razorpayKeyId: '',
        razorpayKeySecret: '',
        stripeEnabled: false,
        stripeSecretKey: '',
        stripeWebhookSecret: ''
    });

    // Webhook Tab State
    const [endpoints, setEndpoints] = useState<any[]>([]);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [newEndpoint, setNewEndpoint] = useState({ url: '', eventTypes: ['MESSAGE_RECEIVED'] });
    const [fetchingWebhooks, setFetchingWebhooks] = useState(false);
    const [registering, setRegistering] = useState(false);

    // Order Webhook Tab State
    const [webhookToken, setWebhookToken] = useState<string>('');
    const [webhookUrl, setWebhookUrl] = useState<string>('');
    const [loadingToken, setLoadingToken] = useState(false);
    const [regenerating, setRegenerating] = useState(false);
    const [tokenVisible, setTokenVisible] = useState(false);

    // Developer API Keys State
    const [apiKeys, setApiKeys] = useState<any[]>([]);
    const [fetchingApiKeys, setFetchingApiKeys] = useState(false);
    const [generatingApiKey, setGeneratingApiKey] = useState(false);
    const [newKeyLabel, setNewKeyLabel] = useState("");

    const getWebhookBaseUrl = () => {
        if (window.location.origin.includes('localhost')) {
            return import.meta.env.VITE_API_URL?.replace('/api/v1', '') || window.location.origin;
        }
        return window.location.origin;
    };

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const { data } = await tenantApi.getSettings();
                if (data.success) {
                    setSettings(data.data);
                }
            } catch (error) {
                console.error('Failed to load settings');
                toast.error('Failed to load settings');
            } finally {
                setLoading(false);
            }
        };
        fetchSettings();
    }, []);

    const handleSave = async () => {
        setSaving(true);
        const toastId = toast.loading('Saving settings...');
        try {
            const payload = {
                name: settings.name,
                wabaId: settings.wabaId || null,
                phoneNumberId: settings.phoneNumberId || null,
                accessToken: settings.accessToken || null,
                verifyToken: settings.verifyToken || null,
                instagramPageId: settings.instagramPageId || null,
                instagramBusinessId: settings.instagramBusinessId || null,
                instagramAccessToken: settings.instagramAccessToken || null,
                instagramVerifyToken: settings.instagramVerifyToken || null,
                facebookPageId: settings.facebookPageId || null,
                facebookAccessToken: settings.facebookAccessToken || null,
                facebookVerifyToken: settings.facebookVerifyToken || null,
                telegramBotToken: settings.telegramBotToken || null,
                telegramBotUsername: settings.telegramBotUsername || null,
                country: settings.country,
                currency: settings.currency,
                catalogueIds: settings.catalogueIds || [],
                geminiApiKey: settings.geminiApiKey || null,
                geminiModel: settings.geminiModel || null,
                emailAddress: settings.emailAddress || null,
                emailImapHost: settings.emailImapHost || null,
                emailImapPort: settings.emailImapPort ? Number(settings.emailImapPort) : null,
                emailSmtpHost: settings.emailSmtpHost || null,
                emailSmtpPort: settings.emailSmtpPort ? Number(settings.emailSmtpPort) : null,
                emailUser: settings.emailUser || null,
                emailPassword: settings.emailPassword || null,
                useAppointments: settings.useAppointments,
                requiresBookingAdvance: settings.requiresBookingAdvance,
                bookingAdvanceAmount: settings.bookingAdvanceAmount ? Number(settings.bookingAdvanceAmount) : 0,
                requiresOrderAdvance: settings.requiresOrderAdvance,
                orderAdvanceAmount: settings.orderAdvanceAmount ? Number(settings.orderAdvanceAmount) : 0,
                paymentInstructions: settings.paymentInstructions || null,
                razorpayEnabled: settings.razorpayEnabled,
                razorpayKeyId: settings.razorpayKeyId || null,
                razorpayKeySecret: settings.razorpayKeySecret || null,
                stripeEnabled: settings.stripeEnabled,
                stripeSecretKey: settings.stripeSecretKey || null,
                stripeWebhookSecret: settings.stripeWebhookSecret || null
            };

            const { data } = await tenantApi.updateSettings(payload);
            if (data.success) {
                toast.success('Settings updated successfully', { id: toastId });
                setIsEditing(false);
            } else {
                toast.error('Failed to save settings.', { id: toastId });
            }
        } catch (error) {
            toast.error('An error occurred while saving settings.', { id: toastId });
        } finally {
            setSaving(false);
        }
    };

    const handleTestConnection = async () => {
        if (isEditing) {
            toast('Please save your changes before testing the connection.', { icon: '⚠️' });
            return;
        }
        setTesting(true);
        const toastId = toast.loading('Testing WhatsApp connection...');
        try {
            const { data } = await tenantApi.testConnection();
            if (data.success) {
                toast.success(data.message || 'Connection successful!', { id: toastId });
            } else {
                toast.error(data.message || 'Connection failed.', { id: toastId });
            }
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || error.message || 'Failed to connect';
            toast.error(`Connection failed: ${errorMessage}`, { id: toastId });
        } finally {
            setTesting(false);
        }
    };

    // Webhook Handlers
    const fetchWebhooks = async () => {
        setFetchingWebhooks(true);
        try {
            const { data } = await webhookApi.getAll();
            if (data.success) setEndpoints(data.data);
        } catch (error) {
            console.error('Failed to fetch webhooks', error);
        } finally {
            setFetchingWebhooks(false);
        }
    };

    const handleRegisterWebhook = async () => {
        if (!newEndpoint.url) return toast.error('URL is required');
        setRegistering(true);
        try {
            const { data } = await webhookApi.register(newEndpoint);
            if (data.success) {
                toast.success('Webhook registered');
                setIsAddModalOpen(false);
                setNewEndpoint({ url: '', eventTypes: ['MESSAGE_RECEIVED'] });
                fetchWebhooks();
            }
        } catch (error) {
            toast.error('Failed to register webhook');
        } finally {
            setRegistering(false);
        }
    };

    const handleDeleteWebhook = async (id: string) => {
        if (!confirm('Delete this webhook?')) return;
        try {
            await webhookApi.delete(id);
            toast.success('Webhook deleted');
            fetchWebhooks();
        } catch (error) {
            toast.error('Failed to delete webhook');
        }
    };

    useEffect(() => {
        if (activeTab === 'webhooks') fetchWebhooks();
        if (activeTab === 'orders') fetchWebhookToken();
        if (activeTab === 'api') fetchApiKeys();
    }, [activeTab]);

    const fetchApiKeys = async () => {
        setFetchingApiKeys(true);
        try {
            const { data } = await tenantApi.getApiKeys();
            if (data.success) setApiKeys(data.data);
        } catch (error) {
            console.error('Failed to fetch API keys', error);
        } finally {
            setFetchingApiKeys(false);
        }
    };

    const handleGenerateApiKey = async () => {
        const name = prompt("Enter a label for this API Key (e.g. 'Main Website')");
        if (name === null) return; // Cancelled

        setGeneratingApiKey(true);
        const toastId = toast.loading('Generating secure API key...');
        try {
            const { data } = await tenantApi.generateApiKey(name || undefined);
            if (data.success) {
                toast.success('API Key generated! Copy it now, it won\'t be shown again.', { id: toastId });
                fetchApiKeys();
            }
        } catch (error) {
            toast.error('Failed to generate API key', { id: toastId });
        } finally {
            setGeneratingApiKey(false);
        }
    };

    const handleRevokeApiKey = async (id: string) => {
        if (!confirm('⚠️ Revoking this key will immediately block all external websites using it. Continue?')) return;
        try {
            const { data } = await tenantApi.revokeApiKey(id);
            if (data.success) {
                toast.success('API Key revoked');
                fetchApiKeys();
            }
        } catch (error) {
            toast.error('Failed to revoke API key');
        }
    };

    const fetchWebhookToken = async () => {
        setLoadingToken(true);
        try {
            const { data } = await webhookTokenApi.getToken();
            if (data.success) {
                setWebhookToken(data.token);
                setWebhookUrl(data.webhookUrl);
            }
        } catch (error) {
            toast.error('Failed to load webhook token');
        } finally {
            setLoadingToken(false);
        }
    };

    const handleRegenerateToken = async () => {
        if (!confirm('⚠️ Regenerating will immediately invalidate your current webhook URL. All clients using the old URL will start receiving 401 errors.\n\nContinue?')) return;
        setRegenerating(true);
        const toastId = toast.loading('Regenerating webhook token...');
        try {
            const { data } = await webhookTokenApi.regenerate();
            if (data.success) {
                setWebhookToken(data.token);
                setWebhookUrl(data.webhookUrl);
                toast.success('New webhook URL generated! Update your client backends.', { id: toastId });
            }
        } catch (error) {
            toast.error('Failed to regenerate token', { id: toastId });
        } finally {
            setRegenerating(false);
        }
    };

    const copyToClipboard = (text: string, label: string) => {
        navigator.clipboard.writeText(text);
        toast.success(`${label} copied!`);
    };

    if (loading) {
        return (
            <div className="flex h-full items-center justify-center">
                <Loader2 className="animate-spin text-[#25D366]" size={40} />
            </div>
        );
    }

    return (
        <div className="p-8 space-y-8 h-full bg-[#f9fafb]">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-black text-gray-900 leading-none">Console Configuration</h2>
                    <p className="text-sm font-bold text-gray-400 mt-2">Manage your WABA infrastructure, staff permissions, and developer tools</p>
                </div>
                <Button onClick={handleSave} disabled={saving || !isEditing} className="bg-gray-900 text-white shadow-xl disabled:opacity-50">
                    {saving ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
                    Save Changes
                </Button>
            </div>

            <div className="flex gap-1 p-1 bg-gray-100 rounded-2xl w-fit">
                {[
                    { id: 'waba', label: 'Meta WABA', icon: Smartphone },
                    { id: 'instagram', label: 'Instagram', icon: Instagram },
                    { id: 'facebook', label: 'Facebook', icon: Facebook },
                    { id: 'telegram', label: 'Telegram', icon: Send },
                    { id: 'email', label: 'Email', icon: Mail },
                    { id: 'staff', label: 'Organization', icon: Users },
                    { id: 'api', label: 'API Keys', icon: Key },
                    { id: 'gemini', label: 'Gemini AI', icon: Zap },
                    { id: 'finance', label: 'Finance', icon: CreditCard },
                    /* 
                    { id: 'webhooks', label: 'Webhooks', icon: Webhook },
                    { id: 'orders', label: 'Order Webhook', icon: ShoppingBag },
                    */
                ].map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as any)}
                        className={cn(
                            "px-6 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2",
                            activeTab === tab.id ? "bg-white text-gray-900 shadow-lg shadow-gray-200/50" : "text-gray-400 hover:text-gray-600"
                        )}
                    >
                        <tab.icon size={14} /> {tab.label}
                    </button>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                <div className="lg:col-span-2 space-y-8">
                    {activeTab === 'waba' && (
                        <div className="space-y-8">
                            <Card className="p-8 space-y-8 bg-white border-gray-100">
                                <div className="flex items-center justify-between">
                                    <h4 className="text-lg font-black text-gray-900">Official WhatsApp Account</h4>
                                    <div className="flex items-center gap-3">
                                        <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-lg">
                                            <button onClick={() => setIsEditing(false)} className={cn("px-3 py-1.5 rounded-md text-[10px] font-black uppercase tracking-wider transition-all", !isEditing ? "bg-white shadow-sm text-gray-900" : "text-gray-400 hover:text-gray-600")}>View</button>
                                            <button onClick={() => setIsEditing(true)} className={cn("px-3 py-1.5 rounded-md text-[10px] font-black uppercase tracking-wider transition-all", isEditing ? "bg-white shadow-sm text-gray-900" : "text-gray-400 hover:text-gray-600")}>Edit</button>
                                        </div>
                                        <Badge variant="success">Active / Online</Badge>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="space-y-6">
                                        <Input label="WABA Account ID" value={settings.wabaId || ''} onChange={(e) => setSettings({ ...settings, wabaId: e.target.value })} disabled={!isEditing} />
                                        <Input label="Phone Number ID" value={settings.phoneNumberId || ''} onChange={(e) => setSettings({ ...settings, phoneNumberId: e.target.value })} disabled={!isEditing} />
                                    </div>
                                    <div className="space-y-6">
                                        <Input label="Access Token" type="password" value={settings.accessToken || ''} onChange={(e) => setSettings({ ...settings, accessToken: e.target.value })} disabled={!isEditing} />

                                        <div className="space-y-4">
                                            <div className="flex items-center justify-between">
                                                <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest block pl-1">Catalogue IDs</label>
                                                {isEditing && (
                                                    <button
                                                        onClick={() => setSettings({ ...settings, catalogueIds: [...(settings.catalogueIds || []), ''] })}
                                                        className="text-[#25D366] text-[10px] font-black uppercase hover:underline"
                                                    >
                                                        + Add Catalogue
                                                    </button>
                                                )}
                                            </div>
                                            {(settings.catalogueIds || []).length === 0 && !isEditing && (
                                                <p className="text-xs text-gray-400 italic pl-1">No catalogues configured</p>
                                            )}
                                            {(settings.catalogueIds || []).map((id, index) => (
                                                <div key={index} className="flex gap-2">
                                                    <Input
                                                        placeholder="Enter Catalogue ID"
                                                        value={id}
                                                        onChange={(e) => {
                                                            const newIds = [...(settings.catalogueIds || [])];
                                                            newIds[index] = e.target.value;
                                                            setSettings({ ...settings, catalogueIds: newIds });
                                                        }}
                                                        disabled={!isEditing}
                                                        className="flex-1"
                                                    />
                                                    {isEditing && (
                                                        <button
                                                            onClick={() => {
                                                                const newIds = (settings.catalogueIds || []).filter((_, i) => i !== index);
                                                                setSettings({ ...settings, catalogueIds: newIds });
                                                            }}
                                                            className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                                                        >
                                                            <MinusCircle size={20} />
                                                        </button>
                                                    )}
                                                </div>
                                            ))}
                                        </div>

                                        <Input label="Webhook Verify Token" value={settings.verifyToken || ''} onChange={(e) => setSettings({ ...settings, verifyToken: e.target.value })} disabled={!isEditing} />
                                    </div>
                                </div>

                                <div className="p-6 bg-blue-50/50 rounded-3xl border border-blue-100 space-y-4">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-blue-100 text-blue-600 rounded-xl"><Globe size={18} /></div>
                                        <div>
                                            <h5 className="text-xs font-black text-gray-900 uppercase tracking-wider">Meta Webhook Configuration</h5>
                                            <p className="text-[10px] font-bold text-gray-500">Copy these values into your Meta Developer Dashboard</p>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-1 gap-4">
                                        <div className="space-y-1.5">
                                            <div className="flex items-center justify-between px-1">
                                                <label className="text-[9px] font-black text-blue-600 uppercase tracking-widest">Callback URL</label>
                                                <span className="text-[8px] font-bold text-orange-500 uppercase tracking-tighter bg-orange-50 px-1.5 py-0.5 rounded">Must be public URL</span>
                                            </div>
                                            <div className="flex gap-2">
                                                <div className="flex-1 bg-white border border-blue-100 rounded-xl px-4 py-2.5 font-mono text-[11px] text-gray-600 truncate">
                                                    {getWebhookBaseUrl()}/api/v1/webhooks/whatsapp{settings.id ? `/${settings.id}` : ''}
                                                </div>
                                                <Button variant="outline" className="h-10 w-10 p-0 border-blue-100 text-blue-600" onClick={() => {
                                                    const url = `${getWebhookBaseUrl()}/api/v1/webhooks/whatsapp${settings.id ? `/${settings.id}` : ''}`;
                                                    navigator.clipboard.writeText(url);
                                                    toast.success('URL copied!');
                                                }}><Copy size={14} /></Button>
                                            </div>
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-[9px] font-black text-blue-600 uppercase tracking-widest px-1">Verify Token</label>
                                            <div className="flex gap-2">
                                                <div className="flex-1 bg-white border border-blue-100 rounded-xl px-4 py-2.5 font-mono text-[11px] text-gray-600 truncate">{settings.verifyToken || 'Not set'}</div>
                                                <Button variant="outline" className="h-10 w-10 p-0 border-blue-100 text-blue-600" onClick={() => { if (settings.verifyToken) { navigator.clipboard.writeText(settings.verifyToken); toast.success('Token copied!'); } }}><Copy size={14} /></Button>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <Button variant="outline" onClick={handleTestConnection} disabled={testing}>{testing ? <Loader2 className="animate-spin" size={16} /> : 'Test Connection'}</Button>
                            </Card>
                        </div>
                    )}

                    {activeTab === 'facebook' && (
                        <div className="space-y-8">
                            <Card className="p-8 space-y-8 bg-white border-gray-100">
                                <div className="flex items-center justify-between">
                                    <h4 className="text-lg font-black text-gray-900 border-l-4 border-blue-600 pl-4">Facebook Messenger Account</h4>
                                    <div className="flex items-center gap-3">
                                        <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-lg">
                                            <button onClick={() => setIsEditing(false)} className={cn("px-3 py-1.5 rounded-md text-[10px] font-black uppercase tracking-wider transition-all", !isEditing ? "bg-white shadow-sm text-gray-900" : "text-gray-400 hover:text-gray-600")}>View</button>
                                            <button onClick={() => setIsEditing(true)} className={cn("px-3 py-1.5 rounded-md text-[10px] font-black uppercase tracking-wider transition-all", isEditing ? "bg-white shadow-sm text-gray-900" : "text-gray-400 hover:text-gray-600")}>Edit</button>
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="space-y-6">
                                        <Input label="Facebook Page ID" value={settings.facebookPageId || ''} onChange={(e) => setSettings({ ...settings, facebookPageId: e.target.value })} disabled={!isEditing} placeholder="Facebook Page ID" />
                                        <Input label="Webhook Verify Token" value={settings.facebookVerifyToken || ''} onChange={(e) => setSettings({ ...settings, facebookVerifyToken: e.target.value })} disabled={!isEditing} placeholder="e.g. agently_secret_2024" />
                                    </div>
                                    <div className="space-y-6">
                                        <Input label="Facebook Access Token" type="password" value={settings.facebookAccessToken || ''} onChange={(e) => setSettings({ ...settings, facebookAccessToken: e.target.value })} disabled={!isEditing} />
                                    </div>
                                </div>

                                <div className="p-6 bg-blue-50/50 rounded-3xl border border-blue-100 space-y-4">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-blue-100 text-blue-600 rounded-xl"><Facebook size={18} /></div>
                                        <div>
                                            <h5 className="text-xs font-black text-gray-900 uppercase tracking-wider">Facebook Webhook Configuration</h5>
                                            <p className="text-[10px] font-bold text-gray-500">Enable 'messages' in your Meta App</p>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-1 gap-4">
                                        <div className="space-y-1.5">
                                            <label className="text-[9px] font-black text-blue-600 uppercase tracking-widest px-1">Callback URL</label>
                                            <div className="flex gap-2">
                                                <div className="flex-1 bg-white border border-blue-100 rounded-xl px-4 py-2.5 font-mono text-[11px] text-gray-600 truncate">
                                                    {getWebhookBaseUrl()}/api/v1/webhooks/facebook{settings.id ? `/${settings.id}` : ''}
                                                </div>
                                                <Button variant="outline" className="h-10 w-10 p-0 border-blue-100 text-blue-600" onClick={() => {
                                                    const url = `${getWebhookBaseUrl()}/api/v1/webhooks/facebook${settings.id ? `/${settings.id}` : ''}`;
                                                    navigator.clipboard.writeText(url);
                                                    toast.success('Facebook URL copied!');
                                                }}><Copy size={14} /></Button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </Card>
                        </div>
                    )}

                    {activeTab === 'instagram' && (
                        <div className="space-y-8">
                            <Card className="p-8 space-y-8 bg-white border-gray-100">
                                <div className="flex items-center justify-between">
                                    <h4 className="text-lg font-black text-gray-900 border-l-4 border-pink-500 pl-4">Instagram Professional Account</h4>
                                    <div className="flex items-center gap-3">
                                        <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-lg">
                                            <button onClick={() => setIsEditing(false)} className={cn("px-3 py-1.5 rounded-md text-[10px] font-black uppercase tracking-wider transition-all", !isEditing ? "bg-white shadow-sm text-gray-900" : "text-gray-400 hover:text-gray-600")}>View</button>
                                            <button onClick={() => setIsEditing(true)} className={cn("px-3 py-1.5 rounded-md text-[10px] font-black uppercase tracking-wider transition-all", isEditing ? "bg-white shadow-sm text-gray-900" : "text-gray-400 hover:text-gray-600")}>Edit</button>
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="space-y-6">
                                        <Input label="Facebook Page ID" value={settings.instagramPageId || ''} onChange={(e) => setSettings({ ...settings, instagramPageId: e.target.value })} disabled={!isEditing} placeholder="Facebook Page ID (Messaging Endpoint)" />
                                        <Input label="Instagram Business ID" value={settings.instagramBusinessId || ''} onChange={(e) => setSettings({ ...settings, instagramBusinessId: e.target.value })} disabled={!isEditing} placeholder="Instagram Business Account ID (Webhook Page ID)" />
                                        <Input label="Webhook Verify Token" value={settings.instagramVerifyToken || ''} onChange={(e) => setSettings({ ...settings, instagramVerifyToken: e.target.value })} disabled={!isEditing} />
                                    </div>
                                    <div className="space-y-6">
                                        <Input label="Instagram Access Token" type="password" value={settings.instagramAccessToken || ''} onChange={(e) => setSettings({ ...settings, instagramAccessToken: e.target.value })} disabled={!isEditing} />
                                    </div>
                                </div>

                                <div className="p-6 bg-pink-50/50 rounded-3xl border border-pink-100 space-y-4">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-pink-100 text-pink-600 rounded-xl"><Instagram size={18} /></div>
                                        <div>
                                            <h5 className="text-xs font-black text-gray-900 uppercase tracking-wider">Instagram Webhook Configuration</h5>
                                            <p className="text-[10px] font-bold text-gray-500">Enable 'instagram_manage_messages' in your Meta App</p>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-1 gap-4">
                                        <div className="space-y-1.5">
                                            <label className="text-[9px] font-black text-pink-600 uppercase tracking-widest px-1">Callback URL</label>
                                            <div className="flex gap-2">
                                                <div className="flex-1 bg-white border border-pink-100 rounded-xl px-4 py-2.5 font-mono text-[11px] text-gray-600 truncate">
                                                    {getWebhookBaseUrl()}/api/v1/webhooks/instagram{settings.id ? `/${settings.id}` : ''}
                                                </div>
                                                <Button variant="outline" className="h-10 w-10 p-0 border-pink-100 text-pink-600" onClick={() => {
                                                    const url = `${getWebhookBaseUrl()}/api/v1/webhooks/instagram${settings.id ? `/${settings.id}` : ''}`;
                                                    navigator.clipboard.writeText(url);
                                                    toast.success('Instagram URL copied!');
                                                }}><Copy size={14} /></Button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </Card>
                        </div>
                    )}

                    {activeTab === 'telegram' && (
                        <div className="space-y-8">
                            <Card className="p-8 space-y-8 bg-white border-gray-100">
                                <div className="flex items-center justify-between">
                                    <h4 className="text-lg font-black text-gray-900 border-l-4 border-blue-400 pl-4">Telegram Bot Integration</h4>
                                    <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-lg">
                                        <button onClick={() => setIsEditing(false)} className={cn("px-3 py-1.5 rounded-md text-[10px] font-black uppercase tracking-wider transition-all", !isEditing ? "bg-white shadow-sm text-gray-900" : "text-gray-400 hover:text-gray-600")}>View</button>
                                        <button onClick={() => setIsEditing(true)} className={cn("px-3 py-1.5 rounded-md text-[10px] font-black uppercase tracking-wider transition-all", isEditing ? "bg-white shadow-sm text-gray-900" : "text-gray-400 hover:text-gray-600")}>Edit</button>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="space-y-6">
                                        <Input
                                            label="Telegram Bot Token"
                                            value={settings.telegramBotToken || ''}
                                            onChange={(e) => setSettings({ ...settings, telegramBotToken: e.target.value })}
                                            disabled={!isEditing}
                                            placeholder="e.g. 123456789:ABCDefGhIJKLmN..."
                                            type="password"
                                        />
                                        <Input
                                            label="Bot Username (Optional)"
                                            value={settings.telegramBotUsername || ''}
                                            onChange={(e) => setSettings({ ...settings, telegramBotUsername: e.target.value })}
                                            disabled={!isEditing}
                                            placeholder="e.g. MyAmazingBot"
                                        />
                                    </div>
                                    <div className="space-y-4">
                                        <div className="p-6 bg-blue-50/50 rounded-3xl border border-blue-100">
                                            <h5 className="text-xs font-black text-gray-900 uppercase tracking-wider mb-2">How to get a token?</h5>
                                            <p className="text-[11px] font-medium text-gray-600 leading-relaxed">
                                                1. Open Telegram and search for <a href="https://t.me/botfather" target="_blank" rel="noopener noreferrer" className="text-blue-500 font-bold">@BotFather</a><br />
                                                2. Send <code>/newbot</code> and follow instructions<br />
                                                3. Copy the <b>HTTP API Token</b> and paste it here
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="p-6 bg-gray-900 rounded-3xl space-y-4">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-white/10 text-white rounded-xl"><Send size={18} /></div>
                                        <div>
                                            <h5 className="text-xs font-black text-white uppercase tracking-wider">Configure Telegram Webhook</h5>
                                            <p className="text-[10px] font-bold text-white/50">Follow these steps after saving your token</p>
                                        </div>
                                    </div>
                                    <div className="space-y-3">
                                        <p className="text-[10px] font-bold text-white/70 leading-relaxed">
                                            To receive messages, you must register this URL with Telegram. You can do this by visiting:
                                        </p>
                                        <div className="bg-black/30 rounded-xl p-3 font-mono text-[9px] text-blue-300 break-all border border-white/5">
                                            https://api.telegram.org/bot{settings.telegramBotToken || '<TOKEN>'}/setWebhook?url={getWebhookBaseUrl()}/api/v1/webhooks/telegram/{settings.id}
                                        </div>
                                        <Button
                                            variant="outline"
                                            className="w-full bg-white/5 border-white/10 text-white hover:bg-white/10 text-[10px] uppercase font-black"
                                            onClick={() => {
                                                const url = `https://api.telegram.org/bot${settings.telegramBotToken}/setWebhook?url=${getWebhookBaseUrl()}/api/v1/webhooks/telegram/${settings.id}`;
                                                copyToClipboard(url, 'Webhook URL');
                                            }}
                                            disabled={!settings.telegramBotToken}
                                        >
                                            Copy Webhook Registration URL
                                        </Button>
                                    </div>
                                </div>
                            </Card>
                        </div>
                    )}

                    {activeTab === 'email' && (
                        <div className="space-y-8">
                            <Card className="p-8 space-y-8 bg-white border-gray-100">
                                <div className="flex items-center justify-between">
                                    <h4 className="text-lg font-black text-gray-900 border-l-4 border-orange-500 pl-4">Custom Email Channel</h4>
                                    <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-lg">
                                        <button onClick={() => setIsEditing(false)} className={cn("px-3 py-1.5 rounded-md text-[10px] font-black uppercase tracking-wider transition-all", !isEditing ? "bg-white shadow-sm text-gray-900" : "text-gray-400 hover:text-gray-600")}>View</button>
                                        <button onClick={() => setIsEditing(true)} className={cn("px-3 py-1.5 rounded-md text-[10px] font-black uppercase tracking-wider transition-all", isEditing ? "bg-white shadow-sm text-gray-900" : "text-gray-400 hover:text-gray-600")}>Edit</button>
                                    </div>
                                </div>

                                <div className="p-6 bg-orange-50/50 rounded-[2rem] border border-orange-100 flex items-start gap-4">
                                    <div className="p-3 bg-orange-100 text-orange-600 rounded-2xl"><Mail size={20} /></div>
                                    <div>
                                        <p className="text-sm font-black text-gray-900">Professional Email Integration</p>
                                        <p className="text-xs font-bold text-gray-500 mt-1 leading-relaxed">
                                            Connect your business mailbox to handle customer inquiries directly from the CRM.
                                            We support Gmail, Outlook, and any custom IMAP/SMTP server.
                                        </p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    {/* SMTP Configuration */}
                                    <div className="space-y-6">
                                        <h5 className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Outbound (SMTP) Settings</h5>
                                        <Input
                                            label="Public Email Address"
                                            value={settings.emailAddress || ''}
                                            onChange={(e) => setSettings({ ...settings, emailAddress: e.target.value })}
                                            disabled={!isEditing}
                                            placeholder="support@yourcompany.com"
                                        />
                                        <Input
                                            label="SMTP Host"
                                            value={settings.emailSmtpHost || ''}
                                            onChange={(e) => setSettings({ ...settings, emailSmtpHost: e.target.value })}
                                            disabled={!isEditing}
                                            placeholder="smtp.gmail.com"
                                        />
                                        <Input
                                            label="SMTP Port"
                                            type="number"
                                            value={settings.emailSmtpPort || 587}
                                            onChange={(e) => setSettings({ ...settings, emailSmtpPort: parseInt(e.target.value) })}
                                            disabled={!isEditing}
                                            placeholder="587 or 465"
                                        />
                                    </div>

                                    {/* IMAP Configuration */}
                                    <div className="space-y-6">
                                        <h5 className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Inbound (IMAP) Settings</h5>
                                        <Input
                                            label="IMAP Host"
                                            value={settings.emailImapHost || ''}
                                            onChange={(e) => setSettings({ ...settings, emailImapHost: e.target.value })}
                                            disabled={!isEditing}
                                            placeholder="imap.gmail.com"
                                        />
                                        <Input
                                            label="IMAP Port"
                                            type="number"
                                            value={settings.emailImapPort || 993}
                                            onChange={(e) => setSettings({ ...settings, emailImapPort: parseInt(e.target.value) })}
                                            disabled={!isEditing}
                                            placeholder="993"
                                        />
                                        <div className="space-y-6 pt-4 border-t border-gray-100">
                                            <Input
                                                label="Username / Login"
                                                value={settings.emailUser || ''}
                                                onChange={(e) => setSettings({ ...settings, emailUser: e.target.value })}
                                                disabled={!isEditing}
                                                placeholder="yourname@gmail.com"
                                            />
                                            <Input
                                                label="App Password"
                                                type="password"
                                                value={settings.emailPassword || ''}
                                                onChange={(e) => setSettings({ ...settings, emailPassword: e.target.value })}
                                                disabled={!isEditing}
                                                placeholder="••••••••••••••••"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="p-6 bg-gray-50 rounded-3xl border border-gray-200 border-dashed">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="p-2 bg-white rounded-xl shadow-sm text-gray-400"><Send size={16} /></div>
                                        <h5 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Security Note</h5>
                                    </div>
                                    <p className="text-[11px] font-bold text-gray-500 leading-relaxed">
                                        For Gmail or Outlook, you **must** use an "App Password" rather than your regular account password.
                                        Ensure IMAP is enabled in your mailbox settings.
                                    </p>
                                </div>
                            </Card>
                        </div>
                    )}

                    {activeTab === 'staff' && (
                        <Card className="p-8 space-y-8">
                            <div className="flex items-center justify-between">
                                <h4 className="text-lg font-black text-gray-900">Manage Staff</h4>
                                <Button><Plus size={16} /> Invite Agent</Button>
                            </div>
                            <div className="space-y-4">
                                {[
                                    { name: 'Alex Rivera', role: 'Administrator', email: 'alex@agently.com', status: 'Online' },
                                    { name: 'Emma Stone', role: 'Support Agent', email: 'emma@agently.com', status: 'Offline' },
                                ].map(staff => (
                                    <div key={staff.email} className="p-4 border border-gray-100 rounded-[2rem] flex items-center justify-between hover:bg-gray-50 transition-all">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center text-gray-400 font-black uppercase">{staff.name.charAt(0)}</div>
                                            <div>
                                                <p className="text-sm font-black text-gray-900">{staff.name}</p>
                                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">{staff.email} • {staff.role}</p>
                                            </div>
                                        </div>
                                        <Badge variant={staff.status === 'Online' ? 'success' : 'neutral'}>{staff.status}</Badge>
                                    </div>
                                ))}
                            </div>
                        </Card>
                    )}

                    {activeTab === 'api' && (
                        <Card className="p-8 space-y-8">
                            <div className="flex items-center justify-between">
                                <h4 className="text-lg font-black text-gray-900">Developer API Keys</h4>
                                <Button
                                    onClick={handleGenerateApiKey}
                                    disabled={generatingApiKey}
                                    className="bg-[#25D366] text-white hover:bg-[#20bc5a]"
                                >
                                    {generatingApiKey ? <Loader2 className="animate-spin" size={16} /> : <Plus size={16} />}
                                    Generate New Key
                                </Button>
                            </div>

                            <div className="space-y-4">
                                {fetchingApiKeys ? (
                                    <div className="py-20 flex justify-center"><Loader2 className="animate-spin text-gray-300" size={40} /></div>
                                ) : apiKeys.length === 0 ? (
                                    <div className="p-12 text-center bg-gray-50 rounded-[2.5rem] border border-gray-100 border-dashed text-gray-400 font-bold">
                                        No API keys generated yet. Use keys to send templates from external websites.
                                    </div>
                                ) : (
                                    apiKeys.map(key => (
                                        <div key={key.id} className={cn(
                                            "p-6 border rounded-[2rem] transition-all space-y-4",
                                            key.status === 'REVOKED' ? "bg-gray-50 border-gray-100 opacity-60" : "bg-white border-gray-100 hover:shadow-xl hover:shadow-gray-100"
                                        )}>
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-4">
                                                    <div className={cn(
                                                        "p-3 rounded-2xl",
                                                        key.status === 'ACTIVE' ? "bg-green-50 text-[#25D366]" : "bg-gray-200 text-gray-400"
                                                    )}>
                                                        <Key size={20} />
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-black text-gray-900">{key.name || 'Unnamed Key'}</p>
                                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">
                                                            Created {new Date(key.createdAt).toLocaleDateString()}
                                                            {key.lastUsed && ` • Last used ${new Date(key.lastUsed).toLocaleDateString()}`}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Badge variant={key.status === 'ACTIVE' ? 'success' : 'neutral'}>
                                                        {key.status}
                                                    </Badge>
                                                    {key.status === 'ACTIVE' && (
                                                        <button
                                                            onClick={() => handleRevokeApiKey(key.id)}
                                                            className="p-2 text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                                                            title="Revoke Key"
                                                        >
                                                            <MinusCircle size={20} />
                                                        </button>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="bg-gray-900 rounded-xl p-3 flex items-center gap-3">
                                                <code className="font-mono text-xs text-white/70 flex-1 truncate">
                                                    {key.key}
                                                </code>
                                                <button
                                                    onClick={() => copyToClipboard(key.key, 'API Key')}
                                                    className="p-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors"
                                                >
                                                    <Copy size={14} />
                                                </button>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>

                            <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-2xl border border-blue-100">
                                <Zap size={18} className="text-blue-500 shrink-0" />
                                <div className="space-y-1">
                                    <p className="text-[10px] font-black text-blue-900 uppercase tracking-wider">Gateway Implementation</p>
                                    <p className="text-[10px] font-bold text-blue-700 leading-normal">
                                        Use these keys with the Public API Gateway: <br />
                                        <code className="bg-blue-100 px-1 rounded">POST /api/v1/public/send-template</code> <br />
                                        Pass them in the <code className="bg-blue-100 px-1 rounded">Authorization: Bearer</code> header.
                                    </p>
                                </div>
                            </div>
                        </Card>
                    )}

                    {activeTab === 'gemini' && (
                        <div className="space-y-8">
                            <Card className="p-8 space-y-8 bg-white border-gray-100">
                                <div className="flex items-center justify-between">
                                    <h4 className="text-lg font-black text-gray-900 border-l-4 border-blue-500 pl-4">Google Gemini AI Configuration</h4>
                                    <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-lg">
                                        <button onClick={() => setIsEditing(false)} className={cn("px-3 py-1.5 rounded-md text-[10px] font-black uppercase tracking-wider transition-all", !isEditing ? "bg-white shadow-sm text-gray-900" : "text-gray-400 hover:text-gray-600")}>View</button>
                                        <button onClick={() => setIsEditing(true)} className={cn("px-3 py-1.5 rounded-md text-[10px] font-black uppercase tracking-wider transition-all", isEditing ? "bg-white shadow-sm text-gray-900" : "text-gray-400 hover:text-gray-600")}>Edit</button>
                                    </div>
                                </div>

                                <div className="space-y-6">
                                    <div className="p-6 bg-blue-50/50 rounded-[2rem] border border-blue-100 flex items-start gap-4">
                                        <div className="p-3 bg-blue-100 text-blue-600 rounded-2xl"><Zap size={20} /></div>
                                        <div>
                                            <p className="text-sm font-black text-gray-900">Empower your Bot Studio with Gemini</p>
                                            <p className="text-xs font-bold text-gray-500 mt-1 leading-relaxed">
                                                By adding your Gemini API key, you enable advanced AI reasoning for your automated flows.
                                                This key will be used to process complex customer queries and generate intelligent responses.
                                            </p>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <Input
                                            label="Gemini API Key"
                                            type="password"
                                            value={settings.geminiApiKey || ''}
                                            onChange={(e) => setSettings({ ...settings, geminiApiKey: e.target.value })}
                                            disabled={!isEditing}
                                            placeholder="Paste your API key from Google AI Studio"
                                        />
                                        <Input
                                            label="Gemini Model Name"
                                            value={settings.geminiModel || ''}
                                            onChange={(e) => setSettings({ ...settings, geminiModel: e.target.value })}
                                            disabled={!isEditing}
                                            placeholder="e.g. gemini-1.5-flash or gemini-1.5-pro"
                                        />

                                        <div className="pt-6 border-t border-gray-100">
                                            <div className="flex items-center justify-between p-6 bg-gray-50 rounded-[2rem] border border-gray-100">
                                                <div className="flex items-center gap-4">
                                                    <div className="p-3 bg-gray-900 text-white rounded-2xl shadow-lg shadow-gray-200"><Calendar size={20} /></div>
                                                    <div>
                                                        <h5 className="text-sm font-black text-gray-900">Enable AI Appointments</h5>
                                                        <p className="text-[10px] font-bold text-gray-400">If disabled, the AI will never discuss or book appointments</p>
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={async () => {
                                                        if (!isEditing) return;
                                                        const newValue = !settings.useAppointments;
                                                        setSettings({ ...settings, useAppointments: newValue });
                                                        try {
                                                            await botStudioApi.updateSettings({ useAppointments: newValue });
                                                            toast.success(`AI Appointments ${newValue ? 'enabled' : 'disabled'}`);
                                                        } catch (error) {
                                                            toast.error('Failed to update AI settings');
                                                            setSettings({ ...settings, useAppointments: !newValue }); // Rollback
                                                        }
                                                    }}
                                                    disabled={!isEditing}
                                                    className={cn(
                                                        "w-12 h-6 rounded-full transition-all relative",
                                                        settings.useAppointments ? "bg-[#25D366]" : "bg-gray-200"
                                                    )}
                                                >
                                                    <div className={cn(
                                                        "absolute top-1 w-4 h-4 bg-white rounded-full transition-all",
                                                        settings.useAppointments ? "right-1" : "left-1"
                                                    )} />
                                                </button>
                                            </div>
                                        </div>
                                        <p className="text-[10px] font-bold text-gray-400 italic px-1">
                                            Don't have a key? Get one for free at <a href="https://aistudio.google.com/" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">Google AI Studio</a>.
                                        </p>
                                    </div>
                                </div>

                                <div className="p-6 bg-gray-50 rounded-3xl border border-gray-200 border-dashed">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="p-2 bg-white rounded-xl shadow-sm text-gray-400"><Code2 size={16} /></div>
                                        <h5 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Usage Security</h5>
                                    </div>
                                    <p className="text-[11px] font-bold text-gray-500 leading-relaxed">
                                        Your API key is stored securely in our database and is only accessible by the AI service.
                                        We never share your keys with third parties or use them for anything other than your bot's interactions.
                                    </p>
                                </div>
                            </Card>
                        </div>
                    )}

                    {activeTab === 'finance' && (
                        <div className="space-y-8">
                            <Card className="p-8 space-y-8 bg-white border-gray-100">
                                <div className="flex items-center justify-between">
                                    <h4 className="text-lg font-black text-gray-900 border-l-4 border-green-500 pl-4">Finance & Advance Payments</h4>
                                    <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-lg">
                                        <button onClick={() => setIsEditing(false)} className={cn("px-3 py-1.5 rounded-md text-[10px] font-black uppercase tracking-wider transition-all", !isEditing ? "bg-white shadow-sm text-gray-900" : "text-gray-400 hover:text-gray-600")}>View</button>
                                        <button onClick={() => setIsEditing(true)} className={cn("px-3 py-1.5 rounded-md text-[10px] font-black uppercase tracking-wider transition-all", isEditing ? "bg-white shadow-sm text-gray-900" : "text-gray-400 hover:text-gray-600")}>Edit</button>
                                    </div>
                                </div>

                                <div className="space-y-8">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {/* Booking Advance */}
                                        <div className={cn(
                                            "p-6 rounded-[2rem] border transition-all space-y-4",
                                            settings.requiresBookingAdvance ? "bg-green-50/30 border-green-100" : "bg-gray-50 border-gray-100"
                                        )}>
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <div className={cn(
                                                        "p-3 rounded-2xl shadow-sm",
                                                        settings.requiresBookingAdvance ? "bg-green-500 text-white" : "bg-white text-gray-400"
                                                    )}>
                                                        <Calendar size={20} />
                                                    </div>
                                                    <div>
                                                        <h5 className="text-sm font-black text-gray-900">Booking Advance</h5>
                                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tight">Requires payment for appointments</p>
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={() => isEditing && setSettings({ ...settings, requiresBookingAdvance: !settings.requiresBookingAdvance })}
                                                    disabled={!isEditing}
                                                    className={cn(
                                                        "w-12 h-6 rounded-full transition-all relative",
                                                        settings.requiresBookingAdvance ? "bg-[#25D366]" : "bg-gray-200"
                                                    )}
                                                >
                                                    <div className={cn(
                                                        "absolute top-1 w-4 h-4 bg-white rounded-full transition-all",
                                                        settings.requiresBookingAdvance ? "right-1" : "left-1"
                                                    )} />
                                                </button>
                                            </div>
                                            {settings.requiresBookingAdvance && (
                                                <div className="pt-2 animate-in fade-in slide-in-from-top-2">
                                                    <Input
                                                        label="Advance Amount"
                                                        type="number"
                                                        value={settings.bookingAdvanceAmount}
                                                        onChange={(e) => setSettings({ ...settings, bookingAdvanceAmount: Number(e.target.value) })}
                                                        disabled={!isEditing}
                                                        placeholder="e.g. 500"
                                                    />
                                                </div>
                                            )}
                                        </div>

                                        {/* Appointment Advance */}
                                        <div className={cn(
                                            "p-6 rounded-[2rem] border transition-all space-y-4",
                                            settings.requiresOrderAdvance ? "bg-[#2583ff]/5 border-[#2583ff]/10" : "bg-gray-50 border-gray-100"
                                        )}>
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <div className={cn(
                                                        "p-3 rounded-2xl shadow-sm",
                                                        settings.requiresOrderAdvance ? "bg-[#2583ff] text-white" : "bg-white text-gray-400"
                                                    )}>
                                                        <ShoppingBag size={20} />
                                                    </div>
                                                    <div>
                                                        <h5 className="text-sm font-black text-gray-900">Appointment Advance</h5>
                                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tight">Requires payment for direct appointments</p>
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={() => isEditing && setSettings({ ...settings, requiresOrderAdvance: !settings.requiresOrderAdvance })}
                                                    disabled={!isEditing}
                                                    className={cn(
                                                        "w-12 h-6 rounded-full transition-all relative",
                                                        settings.requiresOrderAdvance ? "bg-[#2583ff]" : "bg-gray-200"
                                                    )}
                                                >
                                                    <div className={cn(
                                                        "absolute top-1 w-4 h-4 bg-white rounded-full transition-all",
                                                        settings.requiresOrderAdvance ? "right-1" : "left-1"
                                                    )} />
                                                </button>
                                            </div>
                                            {settings.requiresOrderAdvance && (
                                                <div className="pt-2 animate-in fade-in slide-in-from-top-2">
                                                    <Input
                                                        label="Advance Amount"
                                                        type="number"
                                                        value={settings.orderAdvanceAmount}
                                                        onChange={(e) => setSettings({ ...settings, orderAdvanceAmount: Number(e.target.value) })}
                                                        disabled={!isEditing}
                                                        placeholder="e.g. 1000"
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest block pl-1">Payment Instructions</label>
                                        <textarea
                                            value={settings.paymentInstructions || ''}
                                            onChange={(e) => setSettings({ ...settings, paymentInstructions: e.target.value })}
                                            disabled={!isEditing}
                                            rows={4}
                                            className={cn(
                                                "w-full p-4 rounded-3xl border text-sm font-bold bg-gray-50/50 focus:ring-4 transition-all outline-none",
                                                isEditing ? "border-gray-200 focus:ring-green-500/10 focus:border-green-500" : "border-gray-100 bg-gray-50 text-gray-500 resize-none"
                                            )}
                                            placeholder="Provide UPI ID, Bank details, or payment links for the AI to share with customers..."
                                        />
                                        <p className="text-[10px] font-bold text-gray-400 italic px-1">
                                            These instructions will be sent by the AI when a customer agrees to pay an advance.
                                        </p>
                                    </div>

                                <div className="space-y-6 pt-6 border-t border-gray-100">
                                    <div className="flex items-center justify-between">
                                        <h4 className="text-md font-black text-gray-900 flex items-center gap-2">
                                            <CreditCard size={18} className="text-blue-500" /> Razorpay Configuration
                                        </h4>
                                        <div className="flex items-center gap-2">
                                            <span className="text-[10px] font-black uppercase text-gray-400">Enabled</span>
                                            <input 
                                                type="checkbox" 
                                                checked={settings.razorpayEnabled} 
                                                onChange={(e) => setSettings({ ...settings, razorpayEnabled: e.target.checked })}
                                                disabled={!isEditing}
                                                className="w-4 h-4 rounded border-gray-300 text-[#25D366] focus:ring-[#25D366]"
                                            />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <Input label="Razorpay Key ID" value={settings.razorpayKeyId || ''} onChange={(e) => setSettings({ ...settings, razorpayKeyId: e.target.value })} disabled={!isEditing} placeholder="rzp_test_..." />
                                        <Input label="Razorpay Key Secret" type="password" value={settings.razorpayKeySecret || ''} onChange={(e) => setSettings({ ...settings, razorpayKeySecret: e.target.value })} disabled={!isEditing} />
                                    </div>
                                    <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                                        <p className="text-[10px] font-bold text-gray-500 flex items-center gap-2">
                                            <Webhook size={12} /> Webhook URL: <code className="bg-white px-1.5 py-0.5 rounded border">{getWebhookBaseUrl()}/api/v1/payment/webhook</code>
                                        </p>
                                    </div>
                                </div>

                                <div className="space-y-6 pt-6 border-t border-gray-100">
                                    <div className="flex items-center justify-between">
                                        <h4 className="text-md font-black text-gray-900 flex items-center gap-2">
                                            <Zap size={18} className="text-orange-500" /> Stripe Configuration
                                        </h4>
                                        <div className="flex items-center gap-2">
                                            <span className="text-[10px] font-black uppercase text-gray-400">Enabled</span>
                                            <input 
                                                type="checkbox" 
                                                checked={settings.stripeEnabled} 
                                                onChange={(e) => setSettings({ ...settings, stripeEnabled: e.target.checked })}
                                                disabled={!isEditing}
                                                className="w-4 h-4 rounded border-gray-300 text-orange-500 focus:ring-orange-500"
                                            />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <Input label="Stripe Secret Key" type="password" value={settings.stripeSecretKey || ''} onChange={(e) => setSettings({ ...settings, stripeSecretKey: e.target.value })} disabled={!isEditing} placeholder="sk_test_..." />
                                        <Input label="Stripe Webhook Secret" type="password" value={settings.stripeWebhookSecret || ''} onChange={(e) => setSettings({ ...settings, stripeWebhookSecret: e.target.value })} disabled={!isEditing} placeholder="whsec_..." />
                                    </div>
                                    <div className="p-4 bg-orange-50 rounded-2xl border border-orange-100">
                                        <p className="text-[10px] font-bold text-orange-700 flex items-center gap-2">
                                            <Webhook size={12} /> Webhook URL: <code className="bg-white px-1.5 py-0.5 rounded border">{getWebhookBaseUrl()}/api/v1/payment/stripe/webhook/{settings.id}</code>
                                        </p>
                                    </div>
                                </div>

                                <div className="p-6 bg-gray-50 rounded-[2rem] border border-gray-100 flex items-start gap-4">
                                    <div className="p-3 bg-gray-900 text-white rounded-2xl shadow-lg shadow-gray-200"><ShieldCheck size={20} /></div>
                                    <div>
                                        <p className="text-sm font-black text-gray-900">Secure Payments & Trust</p>
                                        <p className="text-xs font-bold text-gray-500 mt-1 leading-relaxed">
                                            Choose your payment gateway wisely. Stripe is great for cards, while Razorpay is the leader for UPI and Netbanking in India.
                                            You can enable both to give your customers more choices.
                                        </p>
                                    </div>
                                </div>
                                </div>
                            </Card>
                        </div>
                    )}

                    {/* Webhooks Tab (Future Use)
                    {activeTab === 'webhooks' && (
                        <Card className="p-8 space-y-8">
                            <div className="flex items-center justify-between">
                                <h4 className="text-lg font-black text-gray-900">Outbound Webhooks</h4>
                                <Button onClick={() => setIsAddModalOpen(true)}><Plus size={16} /> Add Endpoint</Button>
                            </div>
                            {fetchingWebhooks ? (
                                <div className="py-20 flex justify-center"><Loader2 className="animate-spin text-gray-300" size={40} /></div>
                            ) : (
                                <div className="space-y-4">
                                    {endpoints.length === 0 ? (
                                        <div className="p-12 text-center bg-gray-50 rounded-[2.5rem] border border-gray-100 border-dashed text-gray-400 font-bold">No webhooks registered</div>
                                    ) : (
                                        endpoints.map(hook => (
                                            <div key={hook.id} className="p-6 border border-gray-100 rounded-[2rem] hover:bg-gray-50 transition-all space-y-4">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-3">
                                                        <div className="p-2 bg-blue-50 text-blue-500 rounded-xl"><Globe size={16} /></div>
                                                        <span className="text-sm font-black text-gray-900">{hook.url}</span>
                                                    </div>
                                                    <button onClick={() => handleDeleteWebhook(hook.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg"><X size={16} /></button>
                                                </div>
                                                <div className="flex gap-2">
                                                    {(hook.eventTypes || []).map((e: string) => <span key={e} className="px-2.5 py-1 bg-white border border-gray-100 text-[9px] font-black uppercase text-gray-400 rounded-lg">{e}</span>)}
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            )}
                        </Card>
                    )}
                    */}

                    {/* ── ORDER WEBHOOK TAB ───────────────────────────────── */}
                    {/* Order Webhook Tab (Future Use)
                    {activeTab === 'orders' && (
                        <div className="space-y-6">

                            <Card className="p-8 bg-white border-gray-100 space-y-6">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-gray-900 text-white rounded-2xl shadow-xl shadow-gray-300">
                                        <ShoppingBag size={22} />
                                    </div>
                                    <div>
                                        <h4 className="text-lg font-black text-gray-900">Order Webhook URL</h4>
                                        <p className="text-xs font-bold text-gray-400 mt-1">Give this URL to your client's backend — no headers or secrets needed</p>
                                    </div>
                                    <div className="ml-auto flex items-center gap-2">
                                        <div className="w-2 h-2 bg-[#25D366] rounded-full animate-pulse" />
                                        <span className="text-[10px] font-black text-[#25D366] uppercase tracking-widest">Live</span>
                                    </div>
                                </div>

                                {loadingToken ? (
                                    <div className="py-12 flex justify-center">
                                        <Loader2 className="animate-spin text-gray-300" size={36} />
                                    </div>
                                ) : (
                                    <>
                                        <div className="bg-gray-900 rounded-2xl overflow-hidden">
                                            <div className="px-4 py-2 bg-gray-800 flex items-center gap-2">
                                                <div className="w-2 h-2 rounded-full bg-red-400" />
                                                <div className="w-2 h-2 rounded-full bg-yellow-400" />
                                                <div className="w-2 h-2 rounded-full bg-green-400" />
                                                <span className="text-gray-400 text-[10px] font-mono ml-2">POST endpoint</span>
                                                <Badge variant="success" className="ml-auto text-[9px]">Active</Badge>
                                            </div>
                                            <div className="p-4 flex items-center gap-3">
                                                <Link2 size={14} className="text-[#25D366] shrink-0" />
                                                <p className="font-mono text-sm text-white/90 break-all flex-1 select-all">
                                                    {webhookUrl || '—'}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex gap-3">
                                            <Button
                                                className="flex-1 bg-[#25D366] hover:bg-[#20bc5a] text-white h-12 font-black"
                                                onClick={() => copyToClipboard(webhookUrl, 'Webhook URL')}
                                            >
                                                <Copy size={16} /> Copy Webhook URL
                                            </Button>
                                            <Button
                                                variant="outline"
                                                className="h-12 px-5 border-gray-200 text-gray-600"
                                                onClick={() => copyToClipboard(webhookToken, 'Token')}
                                            >
                                                <Key size={15} /> Copy Token
                                            </Button>
                                            <Button
                                                variant="outline"
                                                className="h-12 px-5 border-red-100 text-red-500 hover:bg-red-50"
                                                onClick={handleRegenerateToken}
                                                disabled={regenerating}
                                            >
                                                {regenerating
                                                    ? <Loader2 size={15} className="animate-spin" />
                                                    : <RefreshCcw size={15} />}
                                                Regenerate
                                            </Button>
                                        </div>

                                        <div
                                            className="flex items-center gap-3 px-4 py-3 bg-gray-50 rounded-xl border border-gray-100 cursor-pointer"
                                            onClick={() => setTokenVisible(v => !v)}
                                        >
                                            <Key size={13} className="text-gray-400 shrink-0" />
                                            <span className="font-mono text-xs text-gray-500 flex-1 truncate">
                                                {tokenVisible ? webhookToken : (webhookToken ? `${'•'.repeat(24)}${webhookToken.slice(-8)}` : '—')}
                                            </span>
                                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest shrink-0">
                                                {tokenVisible ? 'Hide' : 'Show'}
                                            </span>
                                        </div>
                                    </>
                                )}
                            </Card>

                            <div className="flex items-start gap-3 px-5 py-4 bg-amber-50 border border-amber-100 rounded-2xl">
                                <AlertTriangle size={16} className="text-amber-500 mt-0.5 shrink-0" />
                                <p className="text-xs font-bold text-amber-700">
                                    <span className="font-black">Regenerating invalidates your current URL immediately.</span>{' '}
                                    Any client backend still using the old URL will receive <code className="bg-amber-100 px-1 rounded">401 Unauthorized</code> errors. Update all clients before regenerating.
                                </p>
                            </div>

                            <Card className="p-8 bg-white border-gray-100 space-y-6">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-blue-50 text-blue-600 rounded-xl"><Code2 size={18} /></div>
                                    <h5 className="text-sm font-black text-gray-900 uppercase tracking-wider">Integration Guide</h5>
                                </div>

                                <div className="space-y-4">
                                    {[
                                        {
                                            step: '01',
                                            title: 'Copy the webhook URL above',
                                            desc: 'The URL already contains your unique token — no extra headers needed.',
                                        },
                                        {
                                            step: '02',
                                            title: 'POST order data to this URL',
                                            desc: 'Send a JSON body with your order fields. Both flat and nested structures are supported.',
                                        },
                                        {
                                            step: '03',
                                            title: 'Orders appear in the CRM',
                                            desc: 'Orders will show up instantly under the Orders page with customer name, amount, and raw payload.',
                                        },
                                    ].map(s => (
                                        <div key={s.step} className="flex items-start gap-4 p-4 rounded-2xl border border-gray-100 hover:bg-gray-50 transition-all">
                                            <div className="w-8 h-8 rounded-xl bg-gray-900 text-white text-[10px] font-black flex items-center justify-center shrink-0">{s.step}</div>
                                            <div>
                                                <p className="text-sm font-black text-gray-900">{s.title}</p>
                                                <p className="text-xs font-bold text-gray-400 mt-1">{s.desc}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div>
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Example Payload</p>
                                    <div className="bg-gray-900 rounded-2xl overflow-hidden">
                                        <div className="px-4 py-2 bg-gray-800 flex items-center gap-2">
                                            <div className="w-2 h-2 rounded-full bg-red-400" />
                                            <div className="w-2 h-2 rounded-full bg-yellow-400" />
                                            <div className="w-2 h-2 rounded-full bg-green-400" />
                                            <span className="text-gray-400 text-[10px] font-mono ml-2">example.json</span>
                                        </div>
                                        <pre className="p-4 text-xs text-green-400 font-mono leading-relaxed overflow-x-auto">{`{
  "event": "order.created",
  "data": {
    "displayOrderId": "ORD-42",
    "totalAmount": 299.99,
    "customer": {
      "firstName": "Arjun",
      "phone": "+919876543210"
    }
  }
}`}</pre>
                                    </div>
                                </div>
                            </Card>
                        </div>
                    )}
                    */}
                </div>

                <div className="space-y-6">
                    <Card className="p-8 space-y-6 bg-gradient-to-br from-gray-900 to-gray-800 border-none shadow-2xl">
                        <h4 className="text-white font-black text-lg">Resource Health</h4>
                        <div className="space-y-6 text-white/50 text-[10px] font-black uppercase">
                            <div className="space-y-2">
                                <div className="flex justify-between"><span>API Availability</span><span className="text-green-400">99.99%</span></div>
                                <div className="h-1.5 bg-white/10 rounded-full overflow-hidden"><div className="h-full bg-green-400 w-[99%]" /></div>
                            </div>
                        </div>
                    </Card>
                </div>
            </div >

            {isAddModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
                    <Card className="w-full max-w-md p-6 space-y-4">
                        <h3 className="text-lg font-bold">Add Webhook</h3>
                        <Input label="Target URL" placeholder="https://your-api.com/hook" value={newEndpoint.url} onChange={(e: any) => setNewEndpoint({ ...newEndpoint, url: e.target.value })} />
                        <div className="flex gap-2">
                            <Button className="flex-1" variant="outline" onClick={() => setIsAddModalOpen(false)}>Cancel</Button>
                            <Button className="flex-1" onClick={handleRegisterWebhook} disabled={registering}>{registering ? <Loader2 className="animate-spin" size={16} /> : 'Create'}</Button>
                        </div>
                    </Card>
                </div>
            )}
        </div >
    );
};

export default Settings;
