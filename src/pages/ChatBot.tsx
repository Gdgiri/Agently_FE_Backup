
import React, { useState, useRef, useEffect } from 'react';
import {
    Bot,
    Sparkles,
    Activity,
    MessageCircle,
    Settings,
    Clock,
    Zap,
    ArrowUpRight,
    Search,
    Brain,
    Shield,
    Terminal,
    Save,
    RefreshCw,
    ToggleLeft,
    ToggleRight,
    Send,
    Loader2,
    CheckCircle2,
    AlertTriangle,
    XCircle,
    BarChart3,
    TrendingUp,
    Target,
    Plus,
    FileText,
    Trash2,
    CheckCircle,
    Upload,
    Package,
    Globe
} from 'lucide-react';
import { cn, Card, Button, Badge, Input, SectionHeader } from '../components/ui';
import { motion, AnimatePresence } from 'framer-motion';
import { aiApi, templateApi, botStudioApi, ragApi } from '../lib/api';
import type { KnowledgeSource } from '../lib/api/botStudioApi';
import toast from 'react-hot-toast';

interface ChatMessage {
    id: string;
    role: 'user' | 'assistant' | 'system';
    content: string;
    timestamp: Date;
    intentAnalysis?: IntentAnalysis | null;
    suggestedTemplate?: any | null;
}

interface IntentAnalysis {
    intents: string[];
    entities: { label: string; value: string }[];
    confidence: number;
    sentiment: string;
}

interface PersonaConfig {
    name: string;
    tone: string;
    basePrompt: string;
    geminiApiKey?: string;
    geminiModel?: string;
    useCatalog: boolean;
    useLeadRAG: boolean;
    useStudioKnowledge: boolean;
}

// Behavior configuration data
interface BehaviorConfig {
    maxResponseLength: number;
    responseDelay: number;
    handoffThreshold: number;
    greetingMessage: string;
    offlineMessage: string;
    enableAutoGreeting: boolean;
    enableSmartRouting: boolean;
    enableSentimentDetection: boolean;
}

interface CampaignOverride {
    id: string;
    name: string;
    triggerKeyword: string;
    specificPrompt: string;
}

interface KBDocument {
    id: string;
    name: string;
    size: string;
}

const ChatBot: React.FC = () => {
    const [botEnabled, setBotEnabled] = useState(false);
    const [activeTab, setActiveTab] = useState<'persona' | 'behavior' | 'performance' | 'knowledge'>('persona');
    const [knowledgeSources, setKnowledgeSources] = useState<KnowledgeSource[]>([]);
    const [isKnowledgeLoading, setIsKnowledgeLoading] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [showUploadModal, setShowUploadModal] = useState(false);
    const [uploadType, setUploadType] = useState<'text' | 'file'>('text');
    const [uploadData, setUploadData] = useState({ title: '', content: '' });
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [persona, setPersona] = useState<PersonaConfig>({
        name: 'Agently AI',
        tone: 'Professional & Helpful',
        basePrompt: "You are the AI assistant for Agently, a premium real estate SaaS. Your goal is to qualify leads by asking about their budget, location preference, and property type. Always be polite, concise, and professional. If you don't know an answer, offer to connect them with a human agent.",
        geminiApiKey: '',
        geminiModel: 'gemini-1.5-flash',
        useCatalog: true,
        useLeadRAG: true,
        useStudioKnowledge: true
    });
    const [savedPersona, setSavedPersona] = useState<PersonaConfig>({ ...persona });
    const [savedBotEnabled, setSavedBotEnabled] = useState(false);
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

    // Chat simulation state
    const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
    const [chatInput, setChatInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [templateEditNames, setTemplateEditNames] = useState<Record<string, string>>({});
    const chatEndRef = useRef<HTMLDivElement>(null);

    // Behavior config
    const [behavior, setBehavior] = useState<BehaviorConfig>({
        maxResponseLength: 150,
        responseDelay: 0,
        handoffThreshold: 3,
        greetingMessage: "Hi there! 👋 I'm Agently AI. How can I help you today?",
        offlineMessage: "We're currently offline. Leave a message and we'll get back to you!",
        enableAutoGreeting: true,
        enableSmartRouting: true,
        enableSentimentDetection: true,
    });

    // New states for redesign
    const [campaignOverrides, setCampaignOverrides] = useState<CampaignOverride[]>([]);
    // Knowledge Sources are already defined as knowledgeSources via botStudioApi

    // Stats (we'll track these from real usage)
    const [stats, setStats] = useState({
        totalRequests: 0,
        avgResponseTime: 0,
        successRate: 100,
    });

    // Track unsaved changes
    useEffect(() => {
        const changed = persona.name !== savedPersona.name ||
            persona.tone !== savedPersona.tone ||
            persona.basePrompt !== savedPersona.basePrompt ||
            persona.geminiApiKey !== savedPersona.geminiApiKey ||
            persona.geminiModel !== savedPersona.geminiModel ||
            persona.useCatalog !== savedPersona.useCatalog ||
            persona.useLeadRAG !== savedPersona.useLeadRAG ||
            persona.useStudioKnowledge !== savedPersona.useStudioKnowledge ||
            botEnabled !== savedBotEnabled;
        setHasUnsavedChanges(changed);
    }, [persona, savedPersona, botEnabled, savedBotEnabled]);

    // New helpers for redesign
    const handleAddOverride = () => {
        const newOverride: CampaignOverride = {
            id: `CAMP-${Date.now()}`,
            name: 'New Campaign',
            triggerKeyword: '',
            specificPrompt: ''
        };
        setCampaignOverrides([...campaignOverrides, newOverride]);
    };

    const handleUpdateOverride = (id: string, updates: Partial<CampaignOverride>) => {
        setCampaignOverrides(campaignOverrides.map(ov => ov.id === id ? { ...ov, ...updates } : ov));
    };

    const handleRemoveOverride = (id: string) => {
        setCampaignOverrides(campaignOverrides.filter(ov => ov.id !== id));
    };

    const handleRemoveDoc = async (id: string) => {
        if (!window.confirm('Are you sure you want to delete this knowledge source? This will also wipe all associated AI embeddings.')) {
            return;
        }
        const loading = toast.loading('Deleting knowledge source...');
        try {
            await ragApi.deleteSource(id);
            toast.success('Source deleted successfully', { id: loading });
            loadKnowledge();
        } catch (error) {
            console.error('Failed to delete source:', error);
            toast.error('Failed to delete source', { id: loading });
        }
    };

    // Load AI settings and Knowledge on mount
    const loadSettings = async () => {
        try {
            const response = await botStudioApi.getSettings();
            if (response.data.success) {
                const s = response.data.data;
                const loadedPersona = {
                    name: s.personaName || 'Agently AI',
                    tone: s.personaTone || 'Professional & Helpful',
                    basePrompt: s.personaPrompt || '',
                    geminiApiKey: s.geminiApiKey || import.meta.env.VITE_GEMINI_API_KEY || '',
                    geminiModel: s.geminiModel || 'gemini-1.5-flash',
                    useCatalog: s.useCatalog ?? true,
                    useLeadRAG: s.useLeadRAG ?? true,
                    useStudioKnowledge: s.useStudioKnowledge ?? true
                };
                setPersona(loadedPersona);
                setSavedPersona(loadedPersona);
                setBotEnabled(s.autoReplyEnabled);
                setSavedBotEnabled(s.autoReplyEnabled);
            }
        } catch (error) {
            console.error('Failed to load Bot Studio settings:', error);
            toast.error('Failed to load settings');
        }
    };

    const loadKnowledge = async () => {
        setIsKnowledgeLoading(true);
        try {
            const response = await botStudioApi.getKnowledgeSources();
            if (response.data.success) {
                setKnowledgeSources(response.data.data);
            }
        } catch (error) {
            console.error('Failed to load knowledge sources:', error);
        } finally {
            setIsKnowledgeLoading(false);
        }
    };

    useEffect(() => {
        loadSettings();
        loadKnowledge();
    }, []);

    // Auto scroll chat
    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [chatMessages]);

    const handleSavePersona = async () => {
        try {
            await botStudioApi.updateSettings({
                personaName: persona.name,
                personaTone: persona.tone,
                personaPrompt: persona.basePrompt,
                autoReplyEnabled: botEnabled,
                geminiApiKey: persona.geminiApiKey,
                geminiModel: persona.geminiModel,
                useCatalog: persona.useCatalog,
                useLeadRAG: persona.useLeadRAG,
                useStudioKnowledge: persona.useStudioKnowledge
            });
            setSavedPersona({ ...persona });
            setSavedBotEnabled(botEnabled);
            setHasUnsavedChanges(false);
            toast.success('AI Settings saved successfully!');
        } catch (error: any) {
            console.error('Failed to save AI settings:', error);
            toast.error(error?.response?.data?.message || 'Failed to save settings');
        }
    };

    const handleToggleBot = async () => {
        const newValue = !botEnabled;
        setBotEnabled(newValue);
        try {
            await botStudioApi.updateSettings({ autoReplyEnabled: newValue });
            setSavedBotEnabled(newValue);
            toast.success(`Bot status updated to ${newValue ? 'Active' : 'Offline'}`);
        } catch (error: any) {
            console.error('Failed to update bot status:', error);
            toast.error('Failed to save bot status change');
            setBotEnabled(!newValue); // Rollback
        }
    };

    const handleRevertPersona = () => {
        setPersona({ ...savedPersona });
        setBotEnabled(savedBotEnabled);
        toast('Persona reverted to saved version', { icon: '↩️' });
    };

    const handleSendMessage = async () => {
        if (!chatInput.trim() || isLoading) return;

        const userMessage: ChatMessage = {
            id: `user-${Date.now()}`,
            role: 'user',
            content: chatInput.trim(),
            timestamp: new Date(),
        };

        setChatMessages(prev => [...prev, userMessage]);
        const currentInput = chatInput.trim();
        setChatInput('');
        setIsLoading(true);
        setIsAnalyzing(true);

        const startTime = Date.now();

        try {
            // Run RAG query test and intent analysis in parallel
            const [personaResult, intentResult] = await Promise.allSettled([
                botStudioApi.testQuery(currentInput),
                aiApi.analyzeIntent(currentInput),
            ]);

            const responseTime = Date.now() - startTime;

            // Process intent analysis
            let intentData: IntentAnalysis | null = null;
            if (intentResult.status === 'fulfilled' && intentResult.value.data?.data?.analysis) {
                try {
                    const raw = intentResult.value.data.data.analysis;
                    intentData = typeof raw === 'string' ? JSON.parse(raw) : raw;
                } catch {
                    intentData = null;
                }
            }

            // Add intent analysis as a system message if available
            if (intentData) {
                const intentMessage: ChatMessage = {
                    id: `intent-${Date.now()}`,
                    role: 'system',
                    content: '',
                    timestamp: new Date(),
                    intentAnalysis: intentData,
                };
                setChatMessages(prev => [...prev, intentMessage]);
            }

            setIsAnalyzing(false);

            // Process AI response
            if (personaResult.status === 'fulfilled') {
                const reply = personaResult.value.data?.data?.reply || 'No response generated.';
                const aiMessage: ChatMessage = {
                    id: `ai-${Date.now()}`,
                    role: 'assistant',
                    content: reply,
                    timestamp: new Date(),
                };
                setChatMessages(prev => [...prev, aiMessage]);

                // Update stats
                setStats(prev => ({
                    totalRequests: prev.totalRequests + 1,
                    avgResponseTime: prev.totalRequests === 0
                        ? responseTime / 1000
                        : ((prev.avgResponseTime * prev.totalRequests) + responseTime / 1000) / (prev.totalRequests + 1),
                    successRate: ((prev.successRate * prev.totalRequests) + 100) / (prev.totalRequests + 1),
                }));

                // CHECK FOR TEMPLATE INTENT
                if (intentData?.intents?.includes('CREATE_TEMPLATE')) {
                    const templateLoadingMsg: ChatMessage = {
                        id: `template-loading-${Date.now()}`,
                        role: 'system',
                        content: 'Generating template suggestion...',
                        timestamp: new Date(),
                    };
                    setChatMessages(prev => [...prev, templateLoadingMsg]);

                    try {
                        const templateRes = await aiApi.generateTemplate(currentInput);
                        const suggestedTemplate = templateRes.data?.data?.template;

                        if (suggestedTemplate) {
                            const suggestionMsg: ChatMessage = {
                                id: `template-suggest-${Date.now()}`,
                                role: 'assistant',
                                content: `I've generated a template suggestion for you: **${suggestedTemplate.name}**.`,
                                timestamp: new Date(),
                                suggestedTemplate: suggestedTemplate
                            };
                            setTemplateEditNames(prev => ({
                                ...prev,
                                [suggestionMsg.id]: suggestedTemplate.name
                            }));
                            setChatMessages(prev => [...prev.filter(m => m.id !== templateLoadingMsg.id), suggestionMsg]);
                        }
                    } catch (err) {
                        console.error('Failed to generate template suggestion:', err);
                        setChatMessages(prev => [...prev.filter(m => m.id !== templateLoadingMsg.id)]);
                    }
                }
            } else {
                throw new Error('Persona test failed');
            }
        } catch (error: any) {
            console.error('Bot Studio error:', error);
            const errorMsg = error?.response?.data?.message || error?.message || 'Failed to generate response';
            const errorMessage: ChatMessage = {
                id: `error-${Date.now()}`,
                role: 'assistant',
                content: `⚠️ Error: ${errorMsg}`,
                timestamp: new Date(),
            };
            setChatMessages(prev => [...prev, errorMessage]);

            setStats(prev => ({
                ...prev,
                totalRequests: prev.totalRequests + 1,
                successRate: ((prev.successRate * (prev.totalRequests)) + 0) / (prev.totalRequests + 1),
            }));

            toast.error('AI response failed. Check your API key.');
        } finally {
            setIsLoading(false);
            setIsAnalyzing(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    const clearChat = () => {
        setChatMessages([]);
        setStats({ totalRequests: 0, avgResponseTime: 0, successRate: 100 });
        toast('Chat cleared', { icon: '🗑️' });
    };

    const handleCreateTemplate = async (messageId: string, suggestedTemplate: any) => {
        const customName = templateEditNames[messageId] || suggestedTemplate.name;
        const loading = toast.loading('Creating and submitting template...');
        try {
            // Map suggested template to API format
            const header = suggestedTemplate.header ? {
                type: suggestedTemplate.header.type,
                text: suggestedTemplate.header.type === 'TEXT' ? suggestedTemplate.header.content : undefined,
                url: suggestedTemplate.header.type !== 'TEXT' ? suggestedTemplate.header.content : undefined,
            } : undefined;

            await templateApi.create({
                name: customName,
                category: suggestedTemplate.category,
                language: suggestedTemplate.language || 'en_US',
                content: {
                    header,
                    body: { text: suggestedTemplate.body },
                    footer: suggestedTemplate.footer ? { text: suggestedTemplate.footer } : undefined,
                    buttons: suggestedTemplate.buttons?.map((btn: any) => ({
                        type: btn.type === 'PHONE' ? 'PHONE_NUMBER' : btn.type,
                        text: btn.text,
                        url: btn.type === 'URL' ? btn.value : undefined,
                        phone_number: (btn.type === 'PHONE' || btn.type === 'PHONE_NUMBER') ? btn.value : undefined
                    }))
                },
                autoSubmit: true
            });
            toast.success('Template created and sent to Meta for approval!', { id: loading });

            // Add a confirmation message to chat
            const confirmMsg: ChatMessage = {
                id: `confirm-${Date.now()}`,
                role: 'system',
                content: `✅ Template **${customName}** has been created and submitted.`,
                timestamp: new Date(),
            };
            setChatMessages(prev => [...prev.filter(m => m.id !== messageId), confirmMsg]);

            // Clean up edit state
            setTemplateEditNames(prev => {
                const New = { ...prev };
                delete New[messageId];
                return New;
            });
        } catch (error: any) {
            console.error('Template creation failed:', error);
            const data = error?.response?.data;
            let msg = 'Failed to create template';

            if (data?.data?.metaSubmission?.metaError) {
                msg = `Meta Refusal: ${data.data.metaSubmission.metaError}`;
            } else if (data?.error) {
                msg = data.error;
            } else if (data?.message) {
                msg = data.message;
            } else if (error.message) {
                msg = error.message;
            }

            if (msg.includes('Unique constraint') || msg.includes('already exists')) {
                toast.error('Name already exists! Please change the template name in the card above.', { id: loading, duration: 5000 });
            }
        }
    };

    const fileToBase64 = (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = (error) => reject(error);
        });
    };

    const handleDirectUpload = async (file: File) => {
        if (!['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain', 'text/csv'].includes(file.type) && !file.name.endsWith('.docx')) {
            toast.error('Invalid file type. Please use PDF, DOCX, TXT, or CSV.');
            return;
        }

        setIsUploading(true);
        const loading = toast.loading(`Uploading ${file.name}...`);
        try {
            // Try Method 1 first (Multipart FormData)
            await botStudioApi.uploadKnowledgeFile(file);
            toast.success('Document uploaded successfully!', { id: loading });
            loadKnowledge();
        } catch (err: any) {
            console.warn('Method 1 upload failed, trying Method 2 (Base64)...', err);
            try {
                // Try Method 2 (Base64) - This is more robust against header issues
                const base64Content = await fileToBase64(file);
                await botStudioApi.uploadKnowledgeBase64({
                    title: file.name,
                    file: base64Content
                });
                toast.success('Document uploaded successfully!', { id: loading });
                loadKnowledge();
            } catch (fallbackErr: any) {
                console.error('All upload methods failed:', fallbackErr);
                let advice = fallbackErr?.response?.data?.message || 'Failed to upload document';

                // Special handling for 413 Content Too Large
                if (fallbackErr?.response?.status === 413) {
                    advice = 'File is too large! Please use a smaller file (Max 10MB) or check your network limits.';
                }

                toast.error(advice, { id: loading, duration: 5000 });
            }
        } finally {
            setIsUploading(false);
        }
    };

    const handleUploadKnowledge = async () => {
        if (uploadType === 'text') {
            if (!uploadData.title || !uploadData.content) {
                toast.error('Please provide both a title and content');
                return;
            }

            setIsUploading(true);
            try {
                await botStudioApi.uploadKnowledge(uploadData);
                toast.success('Knowledge uploaded successfully! Indexing started.');
                setShowUploadModal(false);
                setUploadData({ title: '', content: '' });
                loadKnowledge();
            } catch (error) {
                console.error('Upload failed:', error);
                toast.error('Failed to upload knowledge');
            } finally {
                setIsUploading(false);
            }
        } else {
            if (!selectedFile) {
                toast.error('Please select a file to upload');
                return;
            }
            // Use the unified upload handler
            await handleDirectUpload(selectedFile);
            setShowUploadModal(false);
            setUploadData({ title: '', content: '' });
            setSelectedFile(null);
        }
    };

    return (
        <div className="p-8 space-y-8 bg-[#f9fafb] min-h-full">
            <SectionHeader
                title="Bot Studio"
                subtitle="Configure AI personalities and automated response logic"
                action={
                    <div className="flex items-center gap-4 bg-white p-2 rounded-2xl border border-gray-100 shadow-sm">
                        <span className={cn(
                            "text-[10px] font-black uppercase tracking-widest px-3",
                            botEnabled ? "text-[#25D366]" : "text-gray-400"
                        )}>
                            Bot Status: {botEnabled ? 'Active' : 'Offline'}
                        </span>
                        <button
                            onClick={handleToggleBot}
                            className="transition-all focus:outline-none"
                        >
                            {botEnabled ? (
                                <div className="w-12 h-6 bg-[#25D366] rounded-full relative p-1 shadow-inner shadow-green-900/10">
                                    <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full shadow-md" />
                                </div>
                            ) : (
                                <div className="w-12 h-6 bg-gray-200 rounded-full relative p-1 shadow-inner">
                                    <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full shadow-md" />
                                </div>
                            )}
                        </button>
                    </div>
                }
            />

            {/* Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <Card className="p-6 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-110 transition-transform">
                        <Brain size={60} className="text-gray-900" />
                    </div>
                    <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">AI Requests</h4>
                    <div className="text-3xl font-black text-gray-900">{stats.totalRequests}</div>
                    <p className="text-[10px] font-bold text-[#25D366] mt-2 flex items-center gap-1 uppercase tracking-widest">
                        <ArrowUpRight size={12} /> This session
                    </p>
                </Card>

                <Card className="p-6 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-110 transition-transform">
                        <Zap size={60} className="text-gray-900" />
                    </div>
                    <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Avg Response Time</h4>
                    <div className="text-3xl font-black text-gray-900">{stats.avgResponseTime.toFixed(1)}s</div>
                    <p className="text-[10px] font-bold text-blue-500 mt-2 uppercase tracking-widest">
                        Gemini AI powered
                    </p>
                </Card>

                <Card className="p-6 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-110 transition-transform">
                        <Shield size={60} className="text-gray-900" />
                    </div>
                    <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Success Rate</h4>
                    <div className="text-3xl font-black text-gray-900">{stats.successRate.toFixed(0)}%</div>
                    <p className="text-[10px] font-bold text-orange-500 mt-2 uppercase tracking-widest">
                        {stats.totalRequests === 0 ? 'No data yet' : 'Live tracking'}
                    </p>
                </Card>

                <Card className="p-6 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-110 transition-transform">
                        <Activity size={60} className="text-gray-900" />
                    </div>
                    <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Messages Tested</h4>
                    <div className="text-3xl font-black text-gray-900">{chatMessages.filter(m => m.role === 'user').length}</div>
                    <div className="h-1.5 w-full bg-gray-100 rounded-full mt-4 overflow-hidden">
                        <div className="h-full bg-[#25D366] transition-all duration-700" style={{ width: `${Math.min(chatMessages.filter(m => m.role === 'user').length * 10, 100)}%` }} />
                    </div>
                </Card>
            </div>

            {/* Main Studio Area */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                <div className="lg:col-span-2 space-y-8">
                    {/* Tab Navigation */}
                    <div className="flex gap-4 p-1.5 bg-white rounded-2xl border border-gray-100 w-fit shadow-sm">
                        {[
                            { id: 'persona', label: 'AI Persona', icon: Brain },
                            { id: 'knowledge', label: 'Knowledge Base', icon: FileText },
                            { id: 'behavior', label: 'Bot Behavior', icon: Settings },
                            { id: 'performance', label: 'Quality Insight', icon: Activity },
                        ].map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id as any)}
                                className={cn(
                                    "px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2",
                                    activeTab === tab.id
                                        ? "bg-gray-900 text-white shadow-xl shadow-gray-200"
                                        : "text-gray-400 hover:text-gray-600"
                                )}
                            >
                                <tab.icon size={14} /> {tab.label}
                            </button>
                        ))}
                    </div>

                    <Card className="p-10 space-y-8 border-none shadow-2xl shadow-gray-200/50">
                        {/* ── AI Persona Tab ── */}
                        {activeTab === 'persona' && (
                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="space-y-10"
                            >
                                {/* 🔗 Connection Settings */}
                                <div className="p-6 bg-blue-50/50 rounded-3xl border border-blue-100 space-y-6">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <Sparkles size={16} className="text-blue-600" />
                                            <h4 className="text-[10px] font-black uppercase text-blue-600 tracking-widest">Gemini API Connection</h4>
                                        </div>
                                        {hasUnsavedChanges && (
                                            <Button
                                                onClick={handleSavePersona}
                                                size="sm"
                                                className="h-8 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-[9px] font-black uppercase tracking-widest"
                                            >
                                                <Save size={12} className="mr-1.5" /> Save Connection
                                            </Button>
                                        )}
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Gemini API Key</label>
                                            <div className="relative">
                                                <Input
                                                    type="password"
                                                    placeholder="AIzaSy..."
                                                    value={persona.geminiApiKey}
                                                    onChange={(e) => setPersona({ ...persona, geminiApiKey: e.target.value })}
                                                    className="pr-10"
                                                />
                                                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                                    <Shield size={14} className="text-gray-300" />
                                                </div>
                                            </div>
                                            <p className="text-[9px] text-gray-400 font-bold">Stored securely in your database</p>
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Gemini Model</label>
                                            <select
                                                className="w-full px-4 py-2.5 bg-white border border-gray-100 rounded-xl text-sm outline-none focus:ring-4 focus:ring-[#25D366]/10 focus:border-[#25D366] transition-all"
                                                value={persona.geminiModel}
                                                onChange={(e) => setPersona({ ...persona, geminiModel: e.target.value })}
                                            >
                                                <option value="gemini-1.5-flash">Gemini 1.5 Flash (Recommended)</option>
                                                <option value="gemini-1.5-pro">Gemini 1.5 Pro (Precision)</option>
                                                <option value="gemini-2.0-flash">Gemini 2.0 Flash (Experimental)</option>
                                            </select>
                                            <p className="text-[9px] text-gray-400 font-bold">Flash is faster and has more free quota</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-8">
                                    <Input
                                        label="Bot Display Name"
                                        value={persona.name}
                                        onChange={(e) => setPersona({ ...persona, name: e.target.value })}
                                    />
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Chat Conversation Tone</label>
                                        <select
                                            className="w-full px-4 py-2.5 bg-gray-50/50 border border-gray-100 rounded-xl text-sm outline-none focus:ring-4 focus:ring-[#25D366]/10 focus:border-[#25D366] transition-all"
                                            value={persona.tone}
                                            onChange={(e) => setPersona({ ...persona, tone: e.target.value })}
                                        >
                                            <option>Professional & Helpful</option>
                                            <option>Friendly & Casual</option>
                                            <option>Sales Focused</option>
                                            <option>Concise & Informative</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <div className="flex justify-between items-end">
                                        <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Base Instructions (LLM Personality)</label>
                                        <span className="text-[9px] font-bold text-[#25D366] bg-green-50 px-2 py-0.5 rounded-lg border border-green-100">Powered by Gemini AI</span>
                                    </div>
                                    <div className="relative">
                                        <textarea
                                            className="w-full px-6 py-5 bg-gray-50/50 border border-gray-100 rounded-[2rem] text-sm font-bold text-gray-600 outline-none focus:ring-4 focus:ring-[#25D366]/10 focus:border-[#25D366] transition-all min-h-[200px] leading-relaxed shadow-inner"
                                            value={persona.basePrompt}
                                            onChange={(e) => setPersona({ ...persona, basePrompt: e.target.value })}
                                        />
                                        <div className="absolute bottom-4 right-4 text-[10px] font-black text-gray-300 uppercase tracking-widest">
                                            {(persona.basePrompt || "").length} / 2000 characters
                                        </div>
                                    </div>
                                </div>

                                {hasUnsavedChanges && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-center justify-between"
                                    >
                                        <div className="flex items-center gap-3">
                                            <AlertTriangle size={16} className="text-amber-500" />
                                            <span className="text-xs font-bold text-amber-700">You have unsaved changes. Save to apply them to the simulation.</span>
                                        </div>
                                        <Button
                                            onClick={handleSavePersona}
                                            variant="outline"
                                            className="h-8 border-amber-200 text-amber-700 hover:bg-amber-100 rounded-xl text-[9px] font-black uppercase tracking-widest"
                                        >
                                            Save Now
                                        </Button>
                                    </motion.div>
                                )}

                                <div className="p-6 bg-gray-900 rounded-[2.5rem] flex items-center justify-between shadow-2xl overflow-hidden relative group">
                                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform"><Terminal size={100} className="text-white" /></div>
                                    <div className="relative z-10">
                                        <h5 className="text-white font-black text-sm">Fine-Tune Knowledge Base</h5>
                                        <p className="text-[10px] text-gray-400 mt-1 uppercase tracking-widest leading-relaxed">Upload PDFs or provide URLs to train the bot on your inventory.</p>
                                    </div>
                                    <Button className="bg-white text-gray-900 hover:bg-gray-100 rounded-2xl relative z-10">Manage Data</Button>
                                </div>

                                <div className="pt-6 border-t border-gray-50 flex justify-end gap-3">
                                    <Button variant="ghost" onClick={handleRevertPersona}>Revert to Default</Button>
                                    <Button
                                        className={cn("px-10 rounded-2xl shadow-xl shadow-green-100", hasUnsavedChanges && "animate-pulse")}
                                        onClick={handleSavePersona}
                                    >
                                        <Save size={18} /> Save & Update Persona
                                    </Button>
                                </div>
                            </motion.div>
                        )}

                        {/* ── Knowledge Base Tab ── */}
                        {activeTab === 'knowledge' && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="space-y-8"
                            >
                                <div className="flex justify-between items-end">
                                    <div>
                                        <h3 className="text-xl font-black text-gray-900">Knowledge Base</h3>
                                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">Upload documents, PDFs, or text to train your AI.</p>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-xl border border-gray-100 shadow-sm">
                                            <div className="flex flex-col items-end mr-2">
                                                <span className="text-[9px] font-black uppercase text-gray-400 leading-none">Status</span>
                                                <span className={cn("text-[10px] font-bold mt-0.5", persona.useStudioKnowledge ? "text-green-500" : "text-gray-400")}>
                                                    {persona.useStudioKnowledge ? 'Brain Active' : 'Brain Inactive'}
                                                </span>
                                            </div>
                                            <button
                                                onClick={async () => {
                                                    const newValue = !persona.useStudioKnowledge;
                                                    const updatedPersona = { ...persona, useStudioKnowledge: newValue };
                                                    setPersona(updatedPersona);
                                                    try {
                                                        await botStudioApi.updateSettings({
                                                            useStudioKnowledge: newValue,
                                                            useCatalog: persona.useCatalog,
                                                            useLeadRAG: persona.useLeadRAG
                                                        });
                                                        toast.success(`Document knowledge ${newValue ? 'enabled' : 'disabled'}`);
                                                    } catch (err) {
                                                        toast.error('Failed to update knowledge status');
                                                        setPersona({ ...persona, useStudioKnowledge: !newValue });
                                                    }
                                                }}
                                                className="transition-all focus:outline-none"
                                            >
                                                {persona.useStudioKnowledge ? (
                                                    <div className="w-10 h-5 bg-[#25D366] rounded-full relative p-1">
                                                        <div className="absolute right-1 top-1 w-3 h-3 bg-white rounded-full shadow-sm" />
                                                    </div>
                                                ) : (
                                                    <div className="w-10 h-5 bg-gray-200 rounded-full relative p-1">
                                                        <div className="absolute left-1 top-1 w-3 h-3 bg-white rounded-full shadow-sm" />
                                                    </div>
                                                )}
                                            </button>
                                        </div>
                                        <Button
                                            onClick={() => setShowUploadModal(true)}
                                            className="bg-[#25D366] text-white rounded-xl shadow-xl shadow-green-100 hover:bg-[#1ebe5d]"
                                        >
                                            <Plus size={16} /> Add Documents
                                        </Button>
                                    </div>
                                </div>

                                {/* Main Upload Area (Functional Direct Upload) */}
                                <div
                                    className={cn(
                                        "border-2 border-dashed rounded-[2.5rem] bg-white p-12 text-center transition-all cursor-pointer group",
                                        isUploading ? "border-gray-100 bg-gray-50 opacity-50 cursor-not-allowed" : "border-gray-100 hover:border-[#25D366] hover:bg-green-50/10"
                                    )}
                                    onClick={() => !isUploading && document.getElementById('main-knowledge-file-input')?.click()}
                                    onDragOver={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        if (!isUploading) e.currentTarget.classList.add('border-[#25D366]', 'bg-green-50/10');
                                    }}
                                    onDragLeave={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        e.currentTarget.classList.remove('border-[#25D366]', 'bg-green-50/10');
                                    }}
                                    onDrop={async (e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        e.currentTarget.classList.remove('border-[#25D366]', 'bg-green-50/10');

                                        if (isUploading) return;

                                        const file = e.dataTransfer.files?.[0];
                                        if (file) handleDirectUpload(file);
                                    }}
                                >
                                    <div className="w-20 h-20 bg-gray-50 rounded-[2rem] flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                                        <Upload size={40} className="text-gray-300 group-hover:text-[#25D366]" />
                                    </div>
                                    <h4 className="text-lg font-black text-gray-900">Click to upload or drag and drop</h4>
                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-2">PDF, DOCX, TXT OR CSV (MAX. 10MB)</p>
                                </div>

                                <div>
                                    <h4 className="text-[10px] font-black uppercase text-gray-400 tracking-widest mb-4">Uploaded Documents</h4>

                                    {isKnowledgeLoading ? (
                                        <div className="flex flex-col items-center justify-center py-20 gap-3">
                                            <Loader2 size={40} className="text-gray-200 animate-spin" />
                                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Loading archives...</p>
                                        </div>
                                    ) : knowledgeSources.length === 0 ? (
                                        <div className="p-20 text-center bg-gray-50/30 rounded-[2.5rem] border border-gray-100 border-dashed">
                                            <p className="text-sm font-bold text-gray-400 italic">No documents indexed yet.</p>
                                        </div>
                                    ) : (
                                        <div className="space-y-3">
                                            {knowledgeSources.filter(s => !s.productId).map((source) => (
                                                <div key={source.id} className="p-5 bg-white rounded-2xl border border-gray-100 flex items-center justify-between hover:border-gray-200 transition-all group shadow-sm">
                                                    <div className="flex items-center gap-4">
                                                        <div className={cn(
                                                            "p-3 rounded-xl shrink-0 transition-colors",
                                                            source.type === 'FILE' ? "bg-blue-50 text-blue-500" : "bg-purple-50 text-purple-500"
                                                        )}>
                                                            <FileText size={24} />
                                                        </div>
                                                        <div>
                                                            <h6 className="text-sm font-black text-gray-900">{source.title}</h6>
                                                            <div className="flex items-center gap-3 mt-1">
                                                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tight">
                                                                    {source.totalChunks ? (source.totalChunks * 0.5).toFixed(1) + ' KB' : 'Processing...'}
                                                                </span>
                                                                <Badge className={cn(
                                                                    "text-[8px] font-black uppercase tracking-widest px-2 py-0.5",
                                                                    source.status === 'completed' ? "bg-green-50 text-green-600 border-green-100" :
                                                                        source.status === 'processing' ? "bg-blue-50 text-blue-600 border-blue-100 animate-pulse" :
                                                                            "bg-gray-50 text-gray-400 border-gray-100"
                                                                )}>
                                                                    {source.status}
                                                                </Badge>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <button
                                                        onClick={() => handleRemoveDoc(source.id)}
                                                        className="p-2 text-gray-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                                                        title="Delete Source"
                                                    >
                                                        <Trash2 size={18} />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                <div className="p-6 bg-[#25D366]/5 rounded-[2.5rem] border border-[#25D366]/10">
                                    <div className="flex items-start gap-3">
                                        <div className="p-2 bg-[#25D366] text-white rounded-lg"><Brain size={16} /></div>
                                        <div>
                                            <h6 className="text-[10px] font-black text-[#25D366] uppercase tracking-widest">Mastering RAG Intelligence</h6>
                                            <p className="text-[10px] font-bold text-gray-500 mt-1 leading-relaxed">
                                                When a customer asks a question, our AI real-time scans these files to find the perfect answer.
                                                Ensure your documents are clear and text-rich for best performance.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {/* ── Bot Behavior Tab ── */}
                        {activeTab === 'behavior' && (
                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="space-y-8"
                            >
                                <div className="grid grid-cols-2 gap-8">
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Max Response Length (words)</label>
                                        <input
                                            type="number"
                                            className="w-full px-4 py-2.5 bg-gray-50/50 border border-gray-100 rounded-xl text-sm outline-none focus:ring-4 focus:ring-[#25D366]/10 focus:border-[#25D366] transition-all"
                                            value={behavior.maxResponseLength}
                                            onChange={(e) => setBehavior({ ...behavior, maxResponseLength: parseInt(e.target.value) || 150 })}
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Handoff After N Failures</label>
                                        <input
                                            type="number"
                                            className="w-full px-4 py-2.5 bg-gray-50/50 border border-gray-100 rounded-xl text-sm outline-none focus:ring-4 focus:ring-[#25D366]/10 focus:border-[#25D366] transition-all"
                                            value={behavior.handoffThreshold}
                                            onChange={(e) => setBehavior({ ...behavior, handoffThreshold: parseInt(e.target.value) || 3 })}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Auto-Greeting Message</label>
                                    <textarea
                                        className="w-full px-4 py-3 bg-gray-50/50 border border-gray-100 rounded-xl text-sm outline-none focus:ring-4 focus:ring-[#25D366]/10 focus:border-[#25D366] transition-all min-h-[80px]"
                                        value={behavior.greetingMessage}
                                        onChange={(e) => setBehavior({ ...behavior, greetingMessage: e.target.value })}
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Offline Message</label>
                                    <textarea
                                        className="w-full px-4 py-3 bg-gray-50/50 border border-gray-100 rounded-xl text-sm outline-none focus:ring-4 focus:ring-[#25D366]/10 focus:border-[#25D366] transition-all min-h-[80px]"
                                        value={behavior.offlineMessage}
                                        onChange={(e) => setBehavior({ ...behavior, offlineMessage: e.target.value })}
                                    />
                                </div>

                                <div className="space-y-4">
                                    <div className="flex items-center gap-2">
                                        <Brain size={16} className="text-[#25D366]" />
                                        <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Brain Knowledge Sources</label>
                                    </div>
                                    {[
                                        { key: 'useCatalog' as const, label: 'Catalog Sync', desc: 'Allow AI to use your product catalog data to answer queries', icon: Package },
                                        { key: 'useLeadRAG' as const, label: 'Lead RAG (Websites)', desc: 'AI uses knowledge from websites synced in Lead Intelligence', icon: Globe },
                                        { key: 'useStudioKnowledge' as const, label: 'Studio Knowledge (Docs)', desc: 'AI uses documents and PDFs uploaded in Bot Studio', icon: FileText },
                                    ].map(toggle => (
                                        <div key={toggle.key} className="flex items-center justify-between p-4 bg-white rounded-xl border border-gray-100 shadow-sm hover:border-[#25D366]/30 transition-all">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 bg-gray-50 rounded-lg text-gray-400 group-hover:text-[#25D366]">
                                                    <toggle.icon size={18} />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-black text-gray-900">{toggle.label}</p>
                                                    <p className="text-[10px] font-bold text-gray-400 mt-0.5">{toggle.desc}</p>
                                                </div>
                                            </div>
                                            <button
                                                onClick={async () => {
                                                    const newValue = !persona[toggle.key];
                                                    const updatedPersona = { ...persona, [toggle.key]: newValue };
                                                    setPersona(updatedPersona);
                                                    try {
                                                        const loading = toast.loading(`Updating ${toggle.label}...`);
                                                        await botStudioApi.updateSettings({
                                                            [toggle.key]: newValue,
                                                            useCatalog: updatedPersona.useCatalog,
                                                            useLeadRAG: updatedPersona.useLeadRAG,
                                                            useStudioKnowledge: updatedPersona.useStudioKnowledge
                                                        });
                                                        toast.success(`${toggle.label} ${newValue ? 'enabled' : 'disabled'}`, { id: loading });
                                                    } catch (err) {
                                                        toast.error(`Failed to update ${toggle.label}`);
                                                        setPersona({ ...persona, [toggle.key]: !newValue });
                                                    }
                                                }}
                                                className="transition-all focus:outline-none"
                                            >
                                                {persona[toggle.key] ? (
                                                    <div className="w-12 h-6 bg-[#25D366] rounded-full relative p-1 shadow-inner shadow-green-900/10">
                                                        <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full shadow-md" />
                                                    </div>
                                                ) : (
                                                    <div className="w-12 h-6 bg-gray-200 rounded-full relative p-1 shadow-inner">
                                                        <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full shadow-md" />
                                                    </div>
                                                )}
                                            </button>
                                        </div>
                                    ))}
                                </div>

                                <div className="space-y-4">
                                    <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Feature Toggles</label>
                                    {[
                                        { key: 'enableAutoGreeting' as const, label: 'Auto-Greeting', desc: 'Send initial greeting when customer starts chat' },
                                        { key: 'enableSmartRouting' as const, label: 'Smart Routing', desc: 'Route complex queries to human agents automatically' },
                                        { key: 'enableSentimentDetection' as const, label: 'Sentiment Detection', desc: 'Detect negative sentiment and escalate if needed' },
                                    ].map(toggle => (
                                        <div key={toggle.key} className="flex items-center justify-between p-4 bg-gray-50/50 rounded-xl border border-gray-100">
                                            <div>
                                                <p className="text-sm font-bold text-gray-900">{toggle.label}</p>
                                                <p className="text-xs text-gray-400 mt-0.5">{toggle.desc}</p>
                                            </div>
                                            <button
                                                onClick={() => setBehavior({ ...behavior, [toggle.key]: !behavior[toggle.key] })}
                                                className="transition-all focus:outline-none"
                                            >
                                                {behavior[toggle.key] ? (
                                                    <div className="w-12 h-6 bg-[#25D366] rounded-full relative p-1 shadow-inner shadow-green-900/10">
                                                        <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full shadow-md" />
                                                    </div>
                                                ) : (
                                                    <div className="w-12 h-6 bg-gray-200 rounded-full relative p-1 shadow-inner">
                                                        <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full shadow-md" />
                                                    </div>
                                                )}
                                            </button>
                                        </div>
                                    ))}
                                </div>

                                <div className="pt-6 border-t border-gray-50 flex justify-end gap-3">
                                    <Button className="px-10 rounded-2xl shadow-xl shadow-green-100" onClick={handleSavePersona}>
                                        <Save size={18} /> Save Behavior
                                    </Button>
                                </div>
                            </motion.div>
                        )}

                        {/* ── Quality Insight Tab ── */}
                        {activeTab === 'performance' && (
                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="space-y-8"
                            >
                                <div className="grid grid-cols-3 gap-6">
                                    <div className="p-6 bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl border border-green-100">
                                        <div className="flex items-center gap-2 mb-3">
                                            <CheckCircle2 size={16} className="text-green-600" />
                                            <span className="text-[10px] font-black uppercase text-green-600 tracking-widest">Response Quality</span>
                                        </div>
                                        <div className="text-3xl font-black text-green-700">
                                            {stats.totalRequests === 0 ? '—' : `${stats.successRate.toFixed(0)}%`}
                                        </div>
                                        <p className="text-xs text-green-600/70 mt-1 font-bold">
                                            {stats.totalRequests === 0 ? 'Test the bot to see quality' : 'Based on successful responses'}
                                        </p>
                                    </div>

                                    <div className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl border border-blue-100">
                                        <div className="flex items-center gap-2 mb-3">
                                            <Zap size={16} className="text-blue-600" />
                                            <span className="text-[10px] font-black uppercase text-blue-600 tracking-widest">Speed</span>
                                        </div>
                                        <div className="text-3xl font-black text-blue-700">
                                            {stats.totalRequests === 0 ? '—' : `${stats.avgResponseTime.toFixed(1)}s`}
                                        </div>
                                        <p className="text-xs text-blue-600/70 mt-1 font-bold">Average response latency</p>
                                    </div>

                                    <div className="p-6 bg-gradient-to-br from-purple-50 to-violet-50 rounded-2xl border border-purple-100">
                                        <div className="flex items-center gap-2 mb-3">
                                            <Target size={16} className="text-purple-600" />
                                            <span className="text-[10px] font-black uppercase text-purple-600 tracking-widest">Intent Detection</span>
                                        </div>
                                        <div className="text-3xl font-black text-purple-700">
                                            {chatMessages.filter(m => m.intentAnalysis).length}
                                        </div>
                                        <p className="text-xs text-purple-600/70 mt-1 font-bold">Intents analyzed this session</p>
                                    </div>
                                </div>

                                {/* Session Log Table */}
                                <div className="space-y-4">
                                    <h4 className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Session Activity Log</h4>
                                    {chatMessages.filter(m => m.role === 'user').length === 0 ? (
                                        <div className="p-10 text-center bg-gray-50/50 rounded-2xl border border-gray-100">
                                            <Brain size={40} className="text-gray-200 mx-auto mb-3" />
                                            <p className="text-sm font-bold text-gray-400">No test conversations yet</p>
                                            <p className="text-xs text-gray-300 mt-1">Send a message in the simulation panel to start testing</p>
                                        </div>
                                    ) : (
                                        <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
                                            {chatMessages.filter(m => m.role === 'user').map((msg, i) => {
                                                const aiReply = chatMessages.find(m => m.role === 'assistant' && new Date(m.timestamp) > new Date(msg.timestamp));
                                                return (
                                                    <div key={msg.id} className="p-4 bg-gray-50/50 rounded-xl border border-gray-100 space-y-2">
                                                        <div className="flex items-center justify-between">
                                                            <span className="text-[10px] font-black text-gray-400 uppercase">Test #{i + 1}</span>
                                                            <span className="text-[10px] font-bold text-gray-300">{new Date(msg.timestamp).toLocaleTimeString()}</span>
                                                        </div>
                                                        <p className="text-xs font-bold text-gray-700"><span className="text-gray-400">User:</span> {msg.content}</p>
                                                        {aiReply && (
                                                            <p className="text-xs font-bold text-gray-500"><span className="text-[#25D366]">AI:</span> {aiReply.content.substring(0, 120)}...</p>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        )}
                    </Card>

                    {/* Permanent System Prompt & Persona Section */}
                    <Card className="p-8 border-none shadow-xl shadow-gray-200/50 space-y-8 rounded-[2rem]">
                        <div>
                            <h3 className="text-sm font-black text-gray-900 mb-1">System Prompt & Persona</h3>
                            <p className="text-[11px] font-bold text-gray-400">Define how your AI agent behaves and responds to customers.</p>
                        </div>

                        <div className="space-y-6">
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Agent Name</label>
                                <Input
                                    value={persona.name}
                                    onChange={(e) => setPersona({ ...persona, name: e.target.value })}
                                    placeholder="e.g. Alex - Sales Assistant"
                                    className="bg-gray-50/50 border-gray-100 rounded-xl"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest">System Prompt</label>
                                <textarea
                                    className="w-full px-5 py-4 bg-gray-50/50 border border-gray-100 rounded-2xl text-sm font-bold text-gray-600 outline-none focus:ring-4 focus:ring-[#25D366]/10 focus:border-[#25D366] transition-all min-h-[150px] leading-relaxed"
                                    value={persona.basePrompt}
                                    onChange={(e) => setPersona({ ...persona, basePrompt: e.target.value })}
                                    placeholder="You are Alex, a helpful and professional sales assistant..."
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Tone of Voice</label>
                                <select
                                    className="w-full px-4 py-3 bg-gray-50/50 border border-gray-100 rounded-xl text-sm font-bold text-gray-600 outline-none focus:ring-4 focus:ring-[#25D366]/10 focus:border-[#25D366] transition-all"
                                    value={persona.tone}
                                    onChange={(e) => setPersona({ ...persona, tone: e.target.value })}
                                >
                                    <option>Professional & Helpful</option>
                                    <option>Friendly & Casual</option>
                                    <option>Sales Focused</option>
                                    <option>Direct & Concise</option>
                                    <option>Enthusiastic & Persuasive</option>
                                </select>
                            </div>
                        </div>
                    </Card>

                    {/* Campaign Overrides */}
                    <Card className="p-8 border-none shadow-xl shadow-gray-200/50 space-y-6 rounded-[2rem]">
                        <div>
                            <h3 className="text-sm font-black text-gray-900 mb-1">Campaign Overrides</h3>
                            <p className="text-[11px] font-bold text-gray-400">Customize bot behavior for specific marketing campaigns.</p>
                        </div>

                        <div className="space-y-4">
                            {campaignOverrides.map((override) => (
                                <div key={override.id} className="p-6 bg-gray-50/30 rounded-2xl border border-gray-100 space-y-4 relative group">
                                    <button
                                        onClick={() => handleRemoveOverride(override.id)}
                                        className="absolute top-4 right-4 text-red-500 text-[10px] font-black uppercase opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        Remove
                                    </button>

                                    <div className="space-y-1.5">
                                        <label className="text-[8px] font-black uppercase text-gray-400 tracking-widest">Campaign Name</label>
                                        <div className="flex items-center gap-2">
                                            <Input
                                                value={override.name}
                                                onChange={(e) => handleUpdateOverride(override.id, { name: e.target.value })}
                                                placeholder="e.g. Jurong Condo Launch"
                                                className="bg-white border-gray-100 h-9 text-xs flex-1"
                                            />
                                            <span className="text-[8px] font-black text-gray-300 uppercase shrink-0">({override.id})</span>
                                        </div>
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="text-[8px] font-black uppercase text-gray-400 tracking-widest">Trigger Keyword</label>
                                        <Input
                                            value={override.triggerKeyword}
                                            onChange={(e) => handleUpdateOverride(override.id, { triggerKeyword: e.target.value })}
                                            placeholder="e.g. VIEW"
                                            className="bg-white border-gray-100 h-9 text-xs"
                                        />
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="text-[8px] font-black uppercase text-gray-400 tracking-widest">Campaign Specific Prompt</label>
                                        <textarea
                                            className="w-full px-4 py-3 bg-white border border-gray-100 rounded-xl text-xs font-bold text-gray-600 outline-none focus:ring-4 focus:ring-[#25D366]/10 focus:border-[#25D366] transition-all min-h-[80px]"
                                            value={override.specificPrompt}
                                            onChange={(e) => handleUpdateOverride(override.id, { specificPrompt: e.target.value })}
                                        />
                                    </div>
                                </div>
                            ))}

                            <button
                                onClick={handleAddOverride}
                                className="w-full py-4 border-2 border-dashed border-gray-200 rounded-2xl flex items-center justify-center gap-2 text-[10px] font-black uppercase text-gray-400 hover:bg-gray-50 hover:border-gray-300 transition-all"
                            >
                                <Plus size={14} /> Add Campaign Override
                            </button>
                        </div>
                    </Card>

                </div>

                {/* ── Right Panel: Bot Status & LIVE AI Simulation ── */}
                <div className="space-y-8 lg:sticky lg:top-8 pt-4">
                    {/* Bot Status Card */}
                    <Card className="p-8 border-none shadow-xl shadow-gray-200/50 space-y-8 rounded-[2rem]">
                        <div className="flex items-center justify-between">
                            <h3 className="text-sm font-black text-gray-900">Bot Status</h3>
                            <Badge className="bg-green-50 text-green-600 border-green-100 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border-none">Active</Badge>
                        </div>

                        <div className="space-y-5">
                            <div className="flex items-center justify-between text-xs font-bold text-gray-400 uppercase tracking-wide">
                                <span>Status</span>
                                <span className={cn("font-black", botEnabled ? "text-[#25D366]" : "text-gray-400")}>{botEnabled ? 'Active' : 'Offline'}</span>
                            </div>
                            <div className="flex items-center justify-between text-xs font-bold text-gray-400 uppercase tracking-wide">
                                <span>Training Mode</span>
                                <span className="text-gray-900 font-black">Live Context RAG</span>
                            </div>
                            <div className="flex items-center justify-between text-xs font-bold text-gray-400 uppercase tracking-wide">
                                <span>Knowledge Base Size</span>
                                <span className="text-gray-900 font-black">{knowledgeSources.length} Documents</span>
                            </div>
                        </div>

                        <Button variant="outline" className="w-full rounded-[1.5rem] border-gray-100 text-[10px] font-black uppercase tracking-widest h-14 gap-3 hover:bg-gray-50 transition-all border-2">
                            <Settings size={18} className="text-gray-400" /> Advanced Settings
                        </Button>
                    </Card>

                    {/* Test Sandbox Section */}
                    <div className="space-y-6">
                        <div className="flex items-center justify-between px-2">
                            <div className="flex items-center gap-2.5">
                                <MessageCircle size={18} className="text-gray-400" />
                                <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Test Sandbox</h4>
                            </div>
                            {chatMessages.length > 0 && (
                                <button
                                    onClick={clearChat}
                                    className="text-[10px] font-black text-gray-400 uppercase tracking-widest hover:text-red-500 transition-colors flex items-center gap-1"
                                >
                                    <RefreshCw size={10} /> Clear
                                </button>
                            )}
                        </div>

                        <Card className="p-0 bg-white border-none shadow-2xl shadow-gray-200 overflow-hidden rounded-[2.5rem] flex flex-col h-[600px]">
                            {/* Header */}
                            <div className="p-8 bg-gray-50/50 flex items-center gap-4 border-b border-gray-100 shrink-0">
                                <div className="w-12 h-12 rounded-2xl bg-gray-900 flex items-center justify-center text-[#25D366]"><Brain size={24} /></div>
                                <div className="flex-1">
                                    <p className="text-sm font-black text-gray-900">{persona.name}</p>
                                    <p className="text-[10px] font-bold text-gray-400 uppercase">{persona.tone} • Live simulation</p>
                                </div>
                                <div className={cn(
                                    "w-3 h-3 rounded-full",
                                    botEnabled ? "bg-[#25D366] animate-pulse" : "bg-gray-300"
                                )} />
                            </div>

                            {/* Chat Messages Area */}
                            <div className="flex-1 overflow-y-auto p-6 space-y-4">
                                {chatMessages.length === 0 && !isLoading && (
                                    <div className="h-full flex flex-col items-center justify-center text-center px-6">
                                        <div className="w-16 h-16 rounded-2xl bg-gray-50 flex items-center justify-center mb-4">
                                            <MessageCircle size={28} className="text-gray-200" />
                                        </div>
                                        <p className="text-sm font-bold text-gray-400 mb-1">Test Your AI Persona</p>
                                        <p className="text-[10px] text-gray-300 leading-relaxed max-w-[200px]">
                                            Send a message below to see how your bot responds with the current persona settings
                                        </p>
                                    </div>
                                )}

                                <AnimatePresence>
                                    {chatMessages.map((msg) => (
                                        <motion.div
                                            key={msg.id}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ duration: 0.3 }}
                                        >
                                            {/* Intent Analysis Block */}
                                            {msg.role === 'system' && msg.intentAnalysis && (
                                                <div className="p-4 bg-blue-50/50 rounded-2xl border border-blue-100 flex items-start gap-3 my-2">
                                                    <div className="p-1.5 bg-blue-500 rounded-lg text-white mt-0.5 shrink-0"><Sparkles size={12} /></div>
                                                    <div className="flex-1 space-y-2">
                                                        <p className="text-[10px] font-black text-blue-700 uppercase tracking-widest">Intent Detected</p>
                                                        <div className="flex flex-wrap gap-1.5">
                                                            {msg.intentAnalysis.entities?.map((entity, i) => (
                                                                <span key={i} className="text-[8px] font-black bg-white border border-blue-100 px-1.5 py-0.5 rounded uppercase">
                                                                    {entity.label}: {entity.value}
                                                                </span>
                                                            ))}
                                                            {msg.intentAnalysis.intents?.map((intent, i) => (
                                                                <span key={`intent-${i}`} className="text-[8px] font-black bg-blue-500 text-white px-1.5 py-0.5 rounded uppercase">
                                                                    {intent}
                                                                </span>
                                                            ))}
                                                        </div>
                                                        {msg.intentAnalysis.confidence && (
                                                            <div className="flex items-center gap-2 mt-1">
                                                                <div className="h-1 flex-1 bg-blue-100 rounded-full overflow-hidden">
                                                                    <div className="h-full bg-blue-500 transition-all" style={{ width: `${(msg.intentAnalysis.confidence * 100)}%` }} />
                                                                </div>
                                                                <span className="text-[9px] font-black text-blue-500">{(msg.intentAnalysis.confidence * 100).toFixed(0)}%</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            )}

                                            {/* User Message */}
                                            {msg.role === 'user' && (
                                                <div className="flex gap-3">
                                                    <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-gray-400 font-black text-[10px] shrink-0">U</div>
                                                    <div className="bg-gray-50 p-4 rounded-2xl rounded-tl-none text-xs font-bold text-gray-600 leading-relaxed shadow-sm flex-1">
                                                        {msg.content}
                                                    </div>
                                                </div>
                                            )}

                                            {/* AI Response */}
                                            {msg.role === 'assistant' && (
                                                <div className="flex flex-col gap-3">
                                                    <div className="flex gap-3 justify-end">
                                                        <div className="bg-gray-900 p-4 rounded-2xl rounded-tr-none text-xs font-bold text-white leading-relaxed shadow-xl flex-1 text-right">
                                                            {msg.content}
                                                        </div>
                                                        <div className="w-8 h-8 rounded-lg bg-[#25D366] flex items-center justify-center text-white font-black text-[10px] shrink-0">AI</div>
                                                    </div>

                                                    {/* Meta Template Suggestion Card */}
                                                    {msg.suggestedTemplate && (
                                                        <div className="mr-11 bg-white border-2 border-dashed border-gray-200 rounded-[2rem] p-6 space-y-4 shadow-sm">
                                                            <div className="flex items-center justify-between">
                                                                <div className="flex items-center gap-2">
                                                                    <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
                                                                        <Sparkles size={16} />
                                                                    </div>
                                                                    <div>
                                                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">AI Suggested Template</p>
                                                                        <input
                                                                            className="text-xs font-black text-gray-900 bg-gray-50 border-none p-1 rounded focus:ring-1 focus:ring-blue-500 w-full"
                                                                            value={templateEditNames[msg.id] || msg.suggestedTemplate.name}
                                                                            onChange={(e) => setTemplateEditNames(prev => ({
                                                                                ...prev,
                                                                                [msg.id]: e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '_')
                                                                            }))}
                                                                        />
                                                                    </div>
                                                                </div>
                                                                <Badge variant="neutral" className="text-[8px] font-black uppercase tracking-widest">
                                                                    {msg.suggestedTemplate.category}
                                                                </Badge>
                                                            </div>

                                                            <div className="bg-gray-50 rounded-2xl p-4 space-y-3">
                                                                {msg.suggestedTemplate.header && (
                                                                    <div className="pb-2 border-b border-gray-100">
                                                                        <p className="text-[8px] font-black text-gray-300 uppercase mb-1">Header ({msg.suggestedTemplate.header.type})</p>
                                                                        <p className="text-xs font-black text-gray-900">{msg.suggestedTemplate.header.content}</p>
                                                                    </div>
                                                                )}
                                                                <div>
                                                                    <p className="text-[8px] font-black text-gray-300 uppercase mb-1">Body Text</p>
                                                                    <p className="text-xs font-bold text-gray-700 leading-relaxed italic">"{msg.suggestedTemplate.body}"</p>
                                                                </div>
                                                                {msg.suggestedTemplate.buttons && msg.suggestedTemplate.buttons.length > 0 && (
                                                                    <div className="flex flex-wrap gap-2 pt-2">
                                                                        {msg.suggestedTemplate.buttons.map((btn: any, i: number) => (
                                                                            <div key={i} className="px-3 py-1 bg-white border border-gray-200 rounded-lg text-[9px] font-black text-gray-500 uppercase">
                                                                                {btn.text}
                                                                            </div>
                                                                        ))}
                                                                    </div>
                                                                )}
                                                            </div>

                                                            <div className="flex gap-2">
                                                                <Button
                                                                    onClick={() => handleCreateTemplate(msg.id, msg.suggestedTemplate)}
                                                                    className="flex-1 bg-gray-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest h-10"
                                                                >
                                                                    Accept & Submit to Meta
                                                                </Button>
                                                                <Button
                                                                    variant="outline"
                                                                    onClick={() => {
                                                                        setChatMessages(prev => prev.filter(m => m.id !== msg.id));
                                                                        toast('Suggestion dismissed', { icon: '👋' });
                                                                    }}
                                                                    className="rounded-xl text-[10px] font-black uppercase tracking-widest h-10"
                                                                >
                                                                    Dismiss
                                                                </Button>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </motion.div>
                                    ))}
                                </AnimatePresence>

                                {/* Loading State */}
                                {isLoading && (
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="space-y-3"
                                    >
                                        {isAnalyzing && (
                                            <div className="p-3 bg-blue-50/50 rounded-2xl border border-blue-100 flex items-center gap-2">
                                                <Loader2 size={12} className="text-blue-500 animate-spin" />
                                                <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Analyzing intent...</span>
                                            </div>
                                        )}
                                        <div className="flex gap-3 justify-end">
                                            <div className="bg-gray-900 p-4 rounded-2xl rounded-tr-none shadow-xl flex-1">
                                                <div className="flex items-center gap-2">
                                                    <Loader2 size={14} className="text-[#25D366] animate-spin" />
                                                    <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Generating response...</span>
                                                </div>
                                            </div>
                                            <div className="w-8 h-8 rounded-lg bg-[#25D366] flex items-center justify-center text-white font-black text-[10px] shrink-0 animate-pulse">AI</div>
                                        </div>
                                    </motion.div>
                                )}

                                <div ref={chatEndRef} />
                            </div>

                            {/* Chat Input Area */}
                            <div className="p-4 border-t border-gray-100 bg-gray-50/30 shrink-0">
                                <div className="flex items-center gap-2">
                                    <input
                                        type="text"
                                        value={chatInput}
                                        onChange={(e) => setChatInput(e.target.value)}
                                        onKeyDown={handleKeyDown}
                                        placeholder={botEnabled ? "Type a message to test..." : "Bot is offline"}
                                        disabled={!botEnabled || isLoading}
                                        className="flex-1 px-4 py-3 bg-white border border-gray-100 rounded-xl text-sm outline-none focus:ring-4 focus:ring-[#25D366]/10 focus:border-[#25D366] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                    />
                                    <button
                                        onClick={handleSendMessage}
                                        disabled={!chatInput.trim() || isLoading || !botEnabled}
                                        className={cn(
                                            "w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-all",
                                            chatInput.trim() && !isLoading && botEnabled
                                                ? "bg-[#25D366] text-white shadow-lg shadow-green-200 hover:bg-[#1ebe5d]"
                                                : "bg-gray-100 text-gray-300 cursor-not-allowed"
                                        )}
                                    >
                                        {isLoading ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                                    </button>
                                </div>
                            </div>
                        </Card>
                    </div>
                </div>

                {/* Upload Modal */}
                <AnimatePresence>
                    {showUploadModal && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                onClick={() => setShowUploadModal(false)}
                                className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm"
                            />
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                                className="relative w-full max-w-lg bg-white rounded-[2.5rem] shadow-2xl overflow-hidden"
                            >
                                <div className="p-8 border-b border-gray-100 bg-gray-50/50">
                                    <div className="flex items-center justify-between mb-6">
                                        <div>
                                            <h3 className="text-lg font-black text-gray-900">Add New Knowledge</h3>
                                            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">Source: {uploadType === 'text' ? 'Manual Entry' : 'File Upload'}</p>
                                        </div>
                                        <button onClick={() => setShowUploadModal(false)} className="w-10 h-10 rounded-xl hover:bg-white flex items-center justify-center text-gray-400 transition-colors">
                                            <XCircle size={24} />
                                        </button>
                                    </div>

                                    <div className="flex bg-white p-1 rounded-2xl border border-gray-200">
                                        <button
                                            onClick={() => setUploadType('text')}
                                            className={cn(
                                                "flex-1 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                                                uploadType === 'text' ? "bg-gray-900 text-white shadow-lg" : "text-gray-400 hover:text-gray-600"
                                            )}
                                        >
                                            <div className="flex items-center justify-center gap-2">
                                                <FileText size={14} /> Manual Text
                                            </div>
                                        </button>
                                        <button
                                            onClick={() => setUploadType('file')}
                                            className={cn(
                                                "flex-1 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                                                uploadType === 'file' ? "bg-gray-900 text-white shadow-lg" : "text-gray-400 hover:text-gray-600"
                                            )}
                                        >
                                            <div className="flex items-center justify-center gap-2">
                                                <Upload size={14} /> Upload File
                                            </div>
                                        </button>
                                    </div>
                                </div>

                                <div className="p-8 space-y-6">
                                    {uploadType === 'text' ? (
                                        <>
                                            <div className="space-y-1.5">
                                                <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Document Title</label>
                                                <Input
                                                    placeholder="e.g. Return Policy 2024"
                                                    value={uploadData.title}
                                                    onChange={(e) => setUploadData({ ...uploadData, title: e.target.value })}
                                                    className="bg-gray-50/50 border-gray-100 rounded-xl"
                                                />
                                            </div>
                                            <div className="space-y-1.5">
                                                <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Content Body (Text Only)</label>
                                                <textarea
                                                    className="w-full px-5 py-4 bg-gray-50/50 border border-gray-100 rounded-2xl text-sm font-bold text-gray-600 outline-none focus:ring-4 focus:ring-[#25D366]/10 focus:border-[#25D366] transition-all min-h-[200px] leading-relaxed"
                                                    placeholder="Paste your document content here..."
                                                    value={uploadData.content}
                                                    onChange={(e) => setUploadData({ ...uploadData, content: e.target.value })}
                                                />
                                                <p className="text-[9px] text-gray-400 font-bold text-right italic">Max 50,000 characters</p>
                                            </div>
                                        </>
                                    ) : (
                                        <div className="space-y-6">
                                            <div
                                                className={cn(
                                                    "border-2 border-dashed rounded-[2rem] p-12 text-center transition-all cursor-pointer",
                                                    selectedFile ? "border-green-400 bg-green-50/30" : "border-gray-200 bg-gray-50/30 hover:border-gray-300 hover:bg-gray-50"
                                                )}
                                                onClick={() => document.getElementById('knowledge-file-input')?.click()}
                                            >
                                                <input
                                                    id="knowledge-file-input"
                                                    type="file"
                                                    className="hidden"
                                                    accept=".pdf,.docx,.txt,.csv"
                                                    onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                                                />
                                                <div className={cn(
                                                    "w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 transition-all",
                                                    selectedFile ? "bg-green-100 text-green-600" : "bg-white text-gray-300 shadow-sm"
                                                )}>
                                                    <Upload size={32} />
                                                </div>
                                                {selectedFile ? (
                                                    <div>
                                                        <p className="text-sm font-black text-gray-900">{selectedFile.name}</p>
                                                        <p className="text-[10px] font-bold text-green-600 mt-1 uppercase tracking-widest">Selected ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)</p>
                                                    </div>
                                                ) : (
                                                    <div>
                                                        <p className="text-sm font-black text-gray-900">Click to Select File</p>
                                                        <p className="text-[10px] font-bold text-gray-400 mt-2 uppercase tracking-widest leading-relaxed">
                                                            Supports PDF, DOCX, TXT, CSV<br />Max size: 10MB
                                                        </p>
                                                    </div>
                                                )}
                                            </div>
                                            <div className="p-4 bg-blue-50/50 rounded-2xl border border-blue-100 flex items-start gap-3">
                                                <div className="p-1.5 bg-blue-500 text-white rounded-lg"><Zap size={12} /></div>
                                                <p className="text-[9px] font-bold text-blue-700 leading-relaxed uppercase tracking-tight">
                                                    Our AI will automatically scan your document, extract the text, and index it in the vector database for RAG responses.
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div className="p-8 bg-gray-50/50 border-t border-gray-100 flex gap-3">
                                    <Button
                                        variant="ghost"
                                        className="flex-1 rounded-xl"
                                        onClick={() => setShowUploadModal(false)}
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        className="flex-1 bg-gray-900 text-white rounded-xl shadow-xl shadow-gray-200"
                                        onClick={handleUploadKnowledge}
                                        disabled={isUploading}
                                    >
                                        {isUploading ? <Loader2 className="animate-spin" size={18} /> : <><Save size={18} /> Upload & Index</>}
                                    </Button>
                                </div>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>
                <input
                    id="main-knowledge-file-input"
                    type="file"
                    className="hidden"
                    accept=".pdf,.docx,.txt,.csv"
                    onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleDirectUpload(file);
                    }}
                />
            </div>
        </div>
    );
};

export default ChatBot;
