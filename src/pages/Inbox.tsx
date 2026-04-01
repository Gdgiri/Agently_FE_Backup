import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
    Search,
    Plus,
    User,
    MoreVertical,
    CheckCircle2,
    Send,
    Smile,
    Paperclip,
    Layout,
    Phone,
    Mail,
    ShoppingBag,
    Calendar,
    ChevronRight,
    Loader2,
    Instagram,
    Facebook,
    ArrowDown,
    MessageCircle,
    CreditCard,
    Link,
    AlertCircle,
    ExternalLink,
    FileText,
    Database
} from 'lucide-react';
import { cn, Button, Badge } from '../components/ui';
import { motion, AnimatePresence } from 'framer-motion';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../store';
import {
    fetchConversationsAsync,
    fetchMessagesAsync,
    sendMessageAsync,
    setActiveConversation,
    markAsReadAsync,
    addMessage,
    updateContactAsync,
    addTagAsync,
    removeTagAsync
} from '../features/chatSlice';
import { fetchTagsAsync } from '../features/contactSlice';
import AIChatAssistant from '../components/ai/AIChatAssistant';
import { format } from 'date-fns';
import { socketClient } from '../lib/socket';
import { simulateInbound } from '../lib/debug';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import toast from 'react-hot-toast';

const Inbox: React.FC = () => {
    const [searchParams] = useSearchParams();
    const dispatch = useDispatch<AppDispatch>();
    const { conversations, activeConversationId, messages, typingStatus, loading } = useSelector((state: RootState) => state.chat);
    const [messageInput, setMessageInput] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [activeFilter, setActiveFilter] = useState('all');
    const [channelFilter, setChannelFilter] = useState<'all' | 'WHATSAPP' | 'INSTAGRAM' | 'FACEBOOK' | 'TELEGRAM' | 'EMAIL'>('all');
    const scrollRef = useRef<HTMLDivElement>(null);
    const [showScrollButton, setShowScrollButton] = useState(false);

    const [isEditingContact, setIsEditingContact] = useState(false);
    const [editFormData, setEditFormData] = useState({ name: '', email: '', company: '' });
    const [isTagPopoverOpen, setIsTagPopoverOpen] = useState(false);
    const { tags: allTags } = useSelector((state: RootState) => state.contacts);

    // Auto-scroll to bottom
    const scrollToBottom = (behavior: ScrollBehavior = 'smooth') => {
        if (scrollRef.current) {
            scrollRef.current.scrollTo({
                top: scrollRef.current.scrollHeight,
                behavior
            });
        }
    };

    // Load messages when conversation changes
    useEffect(() => {
        if (activeConversationId) {
            dispatch(fetchMessagesAsync(activeConversationId));
            dispatch(markAsReadAsync(activeConversationId));
            setIsEditingContact(false);
            setTimeout(() => scrollToBottom('auto'), 100);
        }
    }, [activeConversationId, dispatch]);

    const currentMessages = activeConversationId ? messages[activeConversationId] || [] : [];
    
    // Targeted scroll to orderId if present
    useEffect(() => {
        const orderId = searchParams.get('orderId');
        if (orderId && currentMessages.length > 0) {
            const shortId = orderId.slice(0, 8).toUpperCase();
            const targetMsg = currentMessages.find(m => m.text?.toUpperCase().includes(shortId));
            
            if (targetMsg) {
                // Delay slightly to ensure DOM is ready
                setTimeout(() => {
                    const el = document.getElementById(`msg-${targetMsg.id}`);
                    if (el) {
                        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                        // Highlight the message briefly
                        el.classList.add('ring-2', 'ring-[#25D366]', 'ring-offset-4');
                        setTimeout(() => el.classList.remove('ring-2', 'ring-[#25D366]', 'ring-offset-4'), 3000);
                    }
                }, 500);
            } else {
                scrollToBottom('smooth');
            }
        } else if (currentMessages.length > 0) {
            scrollToBottom('smooth');
        }
    }, [currentMessages.length, searchParams, activeConversationId]);

    const handleScroll = () => {
        if (scrollRef.current) {
            const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
            const isNearBottom = scrollHeight - scrollTop - clientHeight < 300;
            setShowScrollButton(!isNearBottom);
        }
    };

    useEffect(() => {
        dispatch(fetchConversationsAsync());
        dispatch(fetchTagsAsync());
    }, [dispatch]);

    useEffect(() => {
        if (!loading && conversations.length > 0) {
            const contactId = searchParams.get('contactId');
            const phone = searchParams.get('phone');
            if (contactId || phone) {
                const targetConv = conversations.find(c =>
                    (contactId && c.contact?.id === contactId) ||
                    (phone && (c.contact?.phone === phone || c.contact?.phoneNumber === phone))
                );
                if (targetConv) dispatch(setActiveConversation(targetConv.id));
            }
        }
    }, [loading, conversations, searchParams, dispatch]);

    const activeConv = conversations.find(c => c.id === activeConversationId);

    useEffect(() => {
        if (activeConv) {
            setEditFormData({
                name: activeConv.contact.name || '',
                email: activeConv.contact.email || '',
                company: activeConv.contact.company || ''
            });
        }
    }, [activeConv?.id]);

    const handleUpdateContact = async () => {
        if (!activeConv) return;
        try {
            await dispatch(updateContactAsync({ id: activeConv.contact.id, data: editFormData })).unwrap();
            setIsEditingContact(false);
            toast.success('Contact updated');
        } catch (err: any) {
            toast.error(err || 'Failed to update contact');
        }
    };

    const handleAddTag = async (tag: any) => {
        if (!activeConv) return;
        try {
            await dispatch(addTagAsync({ contactId: activeConv.contact.id, tagId: tag.id, tagName: tag.name })).unwrap();
            setIsTagPopoverOpen(false);
            toast.success('Tag added');
        } catch (err: any) {
            toast.error(err || 'Failed to add tag');
        }
    };

    const handleRemoveTag = async (tagName: string) => {
        if (!activeConv) return;
        const tag = allTags.find(t => t.name === tagName);
        if (!tag) return;
        try {
            await dispatch(removeTagAsync({ contactId: activeConv.contact.id, tagId: tag.id, tagName })).unwrap();
            toast.success('Tag removed');
        } catch (err: any) {
            toast.error(err || 'Failed to remove tag');
        }
    };

    const isAdvanceRequested = (text: string) => {
        const keywords = ['advance', 'payment', 'booking amount', 'token amount', 'upi', 'pay', 'confirm your booking'];
        return keywords.some(keyword => text.toLowerCase().includes(keyword.toLowerCase()));
    };

    const handleSendMessage = async () => {
        if (!messageInput.trim() || !activeConversationId) return;
        const content = messageInput;
        setMessageInput('');
        await dispatch(sendMessageAsync({ conversationId: activeConversationId, content }));
    };

    const filteredConversations = conversations.filter(c => {
        const matchesSearch = (c.contact.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
            (c.contact.phone || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
            (c.contact.instagramId || '').toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = activeFilter === 'all' || (activeFilter === 'unread' && c.unreadCount > 0) || (activeFilter === 'pending' && c.status === 'pending');
        const matchesChannel = channelFilter === 'all' || c.channel === channelFilter;
        return matchesSearch && matchesStatus && matchesChannel;
    });

    return (
        <div className="flex h-[calc(100vh-64px)] overflow-hidden bg-white">
            {/* 1. Conversation List Panel */}
            <aside className="w-96 border-r border-gray-100 flex flex-col bg-gray-50/30">
                <div className="p-6 space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-black text-gray-900">Inbox</h2>
                        <Button variant="ghost" className="p-2 rounded-full"><Plus size={20} /></Button>
                    </div>

                    <div className="flex items-center gap-3 px-4 py-2.5 bg-white border border-gray-100 rounded-2xl shadow-sm group focus-within:border-[#25D366] transition-all">
                        <Search size={18} className="text-gray-400 group-focus-within:text-[#25D366]" />
                        <input
                            type="text"
                            placeholder="Search chats..."
                            className="bg-transparent text-sm w-full outline-none"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>

                    <div className="flex gap-2 overflow-x-auto scrollbar-hide">
                        {['All', 'Unread', 'Pending'].map(f => (
                            <button
                                key={f}
                                onClick={() => setActiveFilter(f.toLowerCase())}
                                className={cn(
                                    "px-4 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all border shrink-0",
                                    activeFilter === f.toLowerCase() ? "bg-gray-900 text-white border-gray-900 shadow-lg" : "bg-white text-gray-500 border-gray-100 hover:border-gray-300"
                                )}
                            >
                                {f}
                            </button>
                        ))}
                    </div>

                    <div className="flex gap-2 overflow-x-auto scrollbar-hide pt-1">
                        {[
                            { id: 'all', label: 'All Channels', icon: null },
                            { id: 'WHATSAPP', label: 'WhatsApp', icon: <MessageCircle size={12} className="text-[#25D366]" /> },
                            { id: 'TELEGRAM', label: 'Telegram', icon: <Send size={12} className="text-[#0088cc]" /> },
                            { id: 'INSTAGRAM', label: 'Instagram', icon: <Instagram size={12} className="text-[#E4405F]" /> },
                            { id: 'FACEBOOK', label: 'Facebook', icon: <Facebook size={12} className="text-[#1877F2]" /> },
                            { id: 'EMAIL', label: 'Email', icon: <Mail size={12} className="text-orange-500" /> }
                        ].map(c => (
                            <button
                                key={c.id}
                                onClick={() => setChannelFilter(c.id as any)}
                                className={cn(
                                    "px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all border shrink-0 flex items-center gap-1.5",
                                    channelFilter === c.id ? "bg-gray-100 border-gray-200 text-gray-900" : "bg-white text-gray-400 border-gray-100 hover:border-gray-200"
                                )}
                            >
                                {c.icon}
                                {c.label}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto space-y-1 p-3">
                    {loading && conversations.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-10 text-gray-400">
                            <Loader2 className="animate-spin mb-2" />
                            <span className="text-xs font-bold uppercase tracking-widest">Syncing chats...</span>
                        </div>
                    )}
                    {filteredConversations.map(conv => (
                        <button
                            key={conv.id}
                            onClick={() => dispatch(setActiveConversation(conv.id))}
                            className={cn(
                                "w-full flex items-center gap-4 p-4 rounded-3xl transition-all duration-300 relative group",
                                activeConversationId === conv.id ? "bg-white shadow-xl shadow-gray-200/50 translate-x-1 ring-1 ring-gray-100" : "hover:bg-white/50"
                            )}
                        >
                            <div className="relative shrink-0">
                                <div className="w-12 h-12 rounded-2xl bg-gray-200 flex items-center justify-center text-gray-500 font-bold border-2 border-white overflow-hidden">
                                    {conv.contact.profilePicUrl ? (
                                        <img src={conv.contact.profilePicUrl} alt={conv.contact.name} className="w-full h-full object-cover" />
                                    ) : (
                                        conv.contact.name?.[0] || conv.contact.phone?.slice(-2) || conv.contact.instagramId?.slice(-2)
                                    )}
                                </div>
                                <div className={cn(
                                    "absolute -bottom-1 -right-1 w-5 h-5 rounded-full ring-4 ring-white shadow-sm flex items-center justify-center",
                                    conv.channel === 'INSTAGRAM' ? "bg-[#E4405F]" :
                                        conv.channel === 'FACEBOOK' ? "bg-[#1877F2]" :
                                            conv.channel === 'TELEGRAM' ? "bg-[#0088cc]" :
                                                conv.channel === 'EMAIL' ? "bg-orange-500" :
                                                    "bg-[#25D366]"
                                )}>
                                    {conv.channel === 'INSTAGRAM' ? <Instagram size={10} className="text-white" /> :
                                        conv.channel === 'FACEBOOK' ? <Facebook size={10} className="text-white" /> :
                                            conv.channel === 'TELEGRAM' ? <Send size={10} className="text-white" /> :
                                                conv.channel === 'EMAIL' ? <Mail size={10} className="text-white" /> :
                                                    <MessageCircle size={10} className="text-white" />}
                                </div>
                            </div>

                            <div className="flex-1 min-w-0 text-left">
                                <div className="flex items-center justify-between mb-1">
                                    <h4 className="font-bold text-gray-900 truncate">
                                        {conv.contact.name || (conv.channel === 'INSTAGRAM' ? conv.contact.instagramId : conv.contact.phone)}
                                    </h4>
                                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">
                                        {format(new Date(conv.updatedAt), 'HH:mm')}
                                    </span>
                                </div>
                                <p className={cn("text-xs truncate", conv.unreadCount > 0 ? "text-gray-900 font-bold" : "text-gray-500")}>
                                    {conv.lastMessage?.text || 'No messages yet'}
                                </p>
                            </div>

                            {conv.unreadCount > 0 && (
                                <div className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 bg-[#25D366] text-white text-[10px] font-black rounded-full flex items-center justify-center shadow-lg shadow-green-100">
                                    {conv.unreadCount}
                                </div>
                            )}
                        </button>
                    ))}
                </div>
            </aside>

            {/* 2. Chat Panel */}
            <main className="flex-1 flex flex-col bg-gray-50/20">
                {activeConv ? (
                    <>
                        <header className="h-16 px-6 border-b border-gray-100 bg-white flex items-center justify-between sticky top-0 z-10">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-2xl bg-gray-100 flex items-center justify-center text-gray-400 font-bold overflow-hidden">
                                    {activeConv.contact.profilePicUrl ? (
                                        <img src={activeConv.contact.profilePicUrl} alt={activeConv.contact.name} className="w-full h-full object-cover" />
                                    ) : (
                                        activeConv.contact.name?.[0] || (activeConv.channel === 'INSTAGRAM' ? <Instagram size={20} className="text-[#E4405F]" /> : <User size={20} />)
                                    )}
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-900 truncate max-w-[200px]">{activeConv.contact.name || (activeConv.channel === 'INSTAGRAM' ? `@${activeConv.contact.instagramId}` : activeConv.contact.phone)}</h3>
                                    <div className="text-[10px] font-bold uppercase tracking-widest flex items-center gap-1.5" style={{
                                        color: activeConv.channel === 'INSTAGRAM' ? '#E4405F' :
                                            activeConv.channel === 'FACEBOOK' ? '#1877F2' :
                                                activeConv.channel === 'TELEGRAM' ? '#0088cc' :
                                                    activeConv.channel === 'EMAIL' ? '#f97316' :
                                                        '#25D366'
                                    }}>
                                        <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{
                                            backgroundColor: activeConv.channel === 'INSTAGRAM' ? '#E4405F' :
                                                activeConv.channel === 'FACEBOOK' ? '#1877F2' :
                                                    activeConv.channel === 'TELEGRAM' ? '#0088cc' :
                                                        activeConv.channel === 'EMAIL' ? '#f97316' :
                                                            '#25D366'
                                        }} />
                                        {activeConv.channel} • {activeConv.status}
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <Button variant="outline" size="sm"><CheckCircle2 size={16} /> Resolve</Button>
                                <Button variant="ghost" size="sm" className="p-2"><MoreVertical size={20} /></Button>
                            </div>
                        </header>

                        <div
                            ref={scrollRef}
                            onScroll={handleScroll}
                            className="flex-1 overflow-y-auto p-8 space-y-6 relative scroll-smooth"
                        >
                            {currentMessages.map((msg, i) => {
                                const isOutbound = msg.direction === 'outbound';
                                return (
                                    <div 
                                        key={msg.id} 
                                        id={`msg-${msg.id}`}
                                        className={cn("flex gap-4 max-w-[80%] transition-all duration-1000 rounded-3xl", isOutbound ? "ml-auto flex-row-reverse" : "")}
                                    >
                                        {!isOutbound && (
                                            <div className="w-8 h-8 rounded-xl bg-gray-200 flex items-center justify-center text-xs font-bold text-gray-500 shrink-0">
                                                {activeConv.contact.name?.[0]}
                                            </div>
                                        )}
                                        <div className={cn("space-y-2", isOutbound ? "text-right" : "")}>
                                            <div className={cn(
                                                "p-4 rounded-3xl text-sm leading-relaxed shadow-sm",
                                                isOutbound
                                                    ? (activeConv.channel === 'FACEBOOK' ? "bg-[#1877F2] text-white rounded-tr-none shadow-blue-100" : "bg-[#25D366] text-white rounded-tr-none shadow-green-100")
                                                    : "bg-white text-gray-800 rounded-tl-none border border-gray-100"
                                            )}>
                                                {msg.mediaUrl && (
                                                    <div className="mb-2 max-w-sm overflow-hidden rounded-2xl">
                                                        {msg.type === 'video' ? (
                                                            <video src={msg.mediaUrl} controls className="w-full h-auto" />
                                                        ) : (
                                                            <img src={msg.mediaUrl} alt="Attachment" className="w-full h-auto object-cover hover:scale-105 transition-transform cursor-pointer" onClick={() => window.open(msg.mediaUrl, '_blank')} />
                                                        )}
                                                    </div>
                                                )}
                                                <div className="prose prose-sm max-w-none prose-p:leading-relaxed prose-p:my-0 break-words dark:prose-invert">
                                                    <ReactMarkdown
                                                        remarkPlugins={[remarkGfm]}
                                                        components={{
                                                            p: ({ children }) => <p className="m-0">{children}</p>,
                                                            a: ({ href, children }) => <a href={href} target="_blank" rel="noopener noreferrer" className="underline hover:opacity-80">{children}</a>
                                                        }}
                                                    >
                                                        {msg.text}
                                                    </ReactMarkdown>
                                                </div>
                                            </div>
                                            <div className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter flex items-center gap-2">
                                                {format(new Date(msg.timestamp), 'HH:mm')}
                                                {isOutbound && ` • ${msg.status}`}
                                                {isOutbound && (msg.aiIntents?.includes('payment_request') || isAdvanceRequested(msg.text)) && (
                                                    <Badge className="bg-amber-50 text-amber-600 border-amber-100 text-[8px] px-1.5 py-0.5 flex items-center gap-1">
                                                        <CreditCard size={8} /> Advance Requested
                                                    </Badge>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}

                            {activeConversationId && typingStatus[activeConversationId] && (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.9, y: 10 }}
                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                    className="flex gap-4 max-w-[80%]"
                                >
                                    <div className="w-8 h-8 rounded-xl bg-[#25D366]/10 flex items-center justify-center shrink-0">
                                        <div className="flex gap-1">
                                            {[0, 1, 2].map((i) => (
                                                <motion.div
                                                    key={i}
                                                    animate={{ opacity: [0.3, 1, 0.3] }}
                                                    transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
                                                    className="w-1 h-1 bg-[#25D366] rounded-full"
                                                />
                                            ))}
                                        </div>
                                    </div>
                                    <div className="bg-gray-50 text-gray-400 text-[10px] font-bold uppercase tracking-widest pt-3 italic">
                                        Bot is thinking...
                                    </div>
                                </motion.div>
                            )}

                            <AnimatePresence>
                                {showScrollButton && (
                                    <motion.button
                                        initial={{ opacity: 0, scale: 0.5, y: 20 }}
                                        animate={{ opacity: 1, scale: 1, y: 0 }}
                                        exit={{ opacity: 0, scale: 0.5, y: 20 }}
                                        onClick={() => scrollToBottom()}
                                        className="fixed bottom-32 right-96 z-50 bg-[#25D366] text-white p-3 rounded-full shadow-2xl hover:bg-[#128C7E] transition-colors border-2 border-white group"
                                    >
                                        <ArrowDown size={20} />
                                    </motion.button>
                                )}
                            </AnimatePresence>
                        </div>

                        <div className="p-6 bg-white border-t border-gray-100 space-y-4">
                            <div className="flex justify-start">
                                <AIChatAssistant
                                    lastMessage={activeConv.lastMessage?.text}
                                    onSuggestionAccepted={(text) => setMessageInput(text)}
                                />
                            </div>
                            <form
                                className="flex items-end gap-4"
                                onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }}
                            >
                                <div className="flex-1 bg-gray-50/50 border border-gray-100 rounded-[2rem] p-4 focus-within:ring-4 focus-within:ring-[#25D366]/10 focus-within:border-[#25D366] transition-all flex flex-col gap-4">
                                    <textarea
                                        placeholder="Type a message..."
                                        className="bg-transparent text-sm w-full outline-none resize-none min-h-[40px] px-2 pt-2"
                                        rows={2}
                                        value={messageInput}
                                        onChange={(e) => setMessageInput(e.target.value)}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter' && !e.shiftKey) {
                                                e.preventDefault();
                                                handleSendMessage();
                                            }
                                        }}
                                    />
                                    <div className="flex items-center justify-between border-t border-gray-100 pt-3 mt-1">
                                        <div className="flex items-center gap-2">
                                            <button type="button" className="p-2 hover:bg-white hover:shadow-sm rounded-xl text-gray-400 hover:text-[#25D366] transition-all"><Smile size={20} /></button>
                                            <button type="button" className="p-2 hover:bg-white hover:shadow-sm rounded-xl text-gray-400 hover:text-[#25D366] transition-all"><Paperclip size={20} /></button>
                                            <button type="button" className="p-2 hover:bg-white hover:shadow-sm rounded-xl text-gray-400 hover:text-[#25D366] transition-all"><Layout size={20} /></button>
                                        </div>
                                        <Button type="submit" className="rounded-2xl px-6"><Send size={18} /> Send</Button>
                                    </div>
                                </div>
                            </form>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-gray-400 bg-gray-50/10">
                        <div className="w-20 h-20 rounded-[2.5rem] bg-white shadow-xl flex items-center justify-center text-gray-200 mb-6 border border-gray-100">
                            <MessageCircle size={40} />
                        </div>
                        <h3 className="text-xl font-black text-gray-900">Select a Conversation</h3>
                        <p className="text-sm font-bold text-gray-400 mt-2">Pick a chat to start responding</p>
                    </div>
                )}
            </main>

            {/* 3. Contact Info Sidebar */}
            <aside className="w-80 border-l border-gray-100 flex flex-col bg-white overflow-y-auto">
                {activeConv ? (
                    <>
                        <div className="p-8 flex flex-col items-center">
                            <div className="relative mb-6">
                                <div className="w-24 h-24 rounded-[2rem] bg-gray-100 flex items-center justify-center text-2xl font-black text-gray-400 shadow-2xl border-4 border-white overflow-hidden">
                                    {activeConv.contact.profilePicUrl ? (
                                        <img src={activeConv.contact.profilePicUrl} alt={activeConv.contact.name} className="w-full h-full object-cover" />
                                    ) : (
                                        activeConv.contact.name?.[0] || (activeConv.channel === 'INSTAGRAM' ? <Instagram size={32} className="text-[#E4405F]" /> : <User size={32} />)
                                    )}
                                </div>
                                <div className={cn(
                                    "absolute -bottom-2 -right-2 bg-white p-2 rounded-2xl shadow-lg shadow-gray-200",
                                    activeConv.channel === 'INSTAGRAM' ? "text-[#E4405F]" :
                                        activeConv.channel === 'FACEBOOK' ? "text-[#1877F2]" :
                                            activeConv.channel === 'TELEGRAM' ? "text-[#0088cc]" :
                                                activeConv.channel === 'EMAIL' ? "text-orange-500" :
                                                    "text-[#25D366]"
                                )}>
                                    {activeConv.channel === 'INSTAGRAM' ? <Instagram size={16} /> :
                                        activeConv.channel === 'FACEBOOK' ? <Facebook size={16} /> :
                                            activeConv.channel === 'TELEGRAM' ? <Send size={16} /> :
                                                activeConv.channel === 'EMAIL' ? <Mail size={16} /> :
                                                    <MessageCircle size={16} />}
                                </div>
                            </div>
                            <h4 className="text-xl font-black text-gray-900 text-center truncate w-full px-2">{activeConv.contact.name || (activeConv.channel === 'INSTAGRAM' ? `@${activeConv.contact.instagramId}` : activeConv.contact.phone)}</h4>
                            <p className="text-sm font-bold text-gray-400 mt-1">{activeConv.contact.company || 'Unknown Company'}</p>
                        </div>

                        <div className="p-8 space-y-8 border-t border-gray-50">
                            <section className="space-y-4">
                                <h5 className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center justify-between">
                                    Contact Info
                                    {isEditingContact ? (
                                        <div className="flex gap-2">
                                            <button onClick={() => setIsEditingContact(false)} className="text-gray-400 hover:text-gray-600">Cancel</button>
                                            <button onClick={handleUpdateContact} className="text-[#25D366] hover:underline font-bold">Save</button>
                                        </div>
                                    ) : (
                                        <button onClick={() => setIsEditingContact(true)} className="text-[#25D366] hover:underline">Edit</button>
                                    )}
                                </h5>
                                {isEditingContact ? (
                                    <div className="space-y-4 pt-2">
                                        <div className="space-y-1">
                                            <label className="text-[10px] uppercase font-black text-gray-400">Name</label>
                                            <input
                                                className="w-full text-xs font-bold p-2 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-[#25D366] outline-none"
                                                value={editFormData.name}
                                                onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-[10px] uppercase font-black text-gray-400">Email</label>
                                            <input
                                                className="w-full text-xs font-bold p-2 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-[#25D366] outline-none"
                                                value={editFormData.email}
                                                onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-gray-50 rounded-xl text-gray-400">
                                                {activeConv.channel === 'INSTAGRAM' ? <Instagram size={14} /> :
                                                    activeConv.channel === 'FACEBOOK' ? <Facebook size={14} /> :
                                                        activeConv.channel === 'TELEGRAM' ? <Send size={14} /> :
                                                            activeConv.channel === 'EMAIL' ? <Mail size={14} /> :
                                                                <MessageCircle size={14} />}
                                            </div>
                                            <span className="text-xs font-bold text-gray-700">
                                                {activeConv.channel === 'INSTAGRAM' ? `@${activeConv.contact.instagramId}` : activeConv.contact.phone}
                                            </span>
                                        </div>
                                    </div>
                                )}
                            </section>

                            <section className="space-y-4">
                                <h5 className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center justify-between">
                                    Internal Tags
                                    <button onClick={() => setIsTagPopoverOpen(!isTagPopoverOpen)} className="p-1 hover:bg-gray-50 rounded-lg text-gray-400 hover:text-[#25D366]">
                                        <Plus size={14} />
                                    </button>
                                </h5>
                                <div className="flex flex-wrap gap-2">
                                    {(activeConv.tags || []).map((t: any, idx: number) => {
                                        const tagName = typeof t === 'string' ? t : (t.tag?.name || t.name || 'Tag');
                                        return (
                                            <span key={idx} className="px-3 py-1.5 bg-gray-50 text-[10px] font-black uppercase text-gray-500 rounded-xl border border-gray-100 flex items-center gap-2 group">
                                                {tagName}
                                                <button onClick={() => handleRemoveTag(tagName)} className="opacity-0 group-hover:opacity-100 text-red-500 transition-opacity">×</button>
                                            </span>
                                        );
                                    })}
                                </div>
                            </section>

                            <section className="space-y-4 pt-6 border-t border-gray-50">
                                <h5 className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                    <ShoppingBag size={12} /> Active Product Context
                                </h5>
                                {activeConv.matchedProduct ? (
                                    <div className="p-4 bg-blue-50/50 rounded-2xl border border-blue-100 space-y-3">
                                        <div className="flex items-start gap-3">
                                            <img 
                                                src={activeConv.matchedProduct.imageUrl || "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=200"} 
                                                alt="" 
                                                className="w-12 h-12 rounded-xl object-cover shrink-0"
                                            />
                                            <div className="min-w-0">
                                                <p className="text-xs font-black text-gray-900 truncate">{activeConv.matchedProduct.title}</p>
                                                <p className="text-[10px] font-bold text-blue-600 mt-0.5">{activeConv.matchedProduct.price}</p>
                                            </div>
                                        </div>
                                        {activeConv.matchedProduct.documents && activeConv.matchedProduct.documents.length > 0 && (
                                            <div className="space-y-1.5 pt-2 border-t border-blue-100">
                                                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Active Knowledge</p>
                                                {activeConv.matchedProduct.documents.map((doc: any) => (
                                                    <a 
                                                        key={doc.id}
                                                        href={doc.url || '#'} 
                                                        target="_blank" 
                                                        rel="noopener noreferrer"
                                                        className="flex items-center justify-between p-2 bg-white rounded-lg border border-blue-50 hover:border-blue-200 transition-all text-[10px] font-bold text-gray-600 group"
                                                    >
                                                        <span className="truncate flex items-center gap-2">
                                                            <FileText size={10} className="text-blue-500" />
                                                            {doc.name}
                                                        </span>
                                                        <ExternalLink size={10} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                                                    </a>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div className="p-6 bg-gray-50 rounded-2xl border border-dashed border-gray-200 text-center text-[10px] font-bold text-gray-400">
                                        No product matched in this conversation yet.
                                    </div>
                                )}
                            </section>
                        </div>
                    </>
                ) : (
                    <div className="p-8 text-center text-gray-400 text-xs font-bold">Select a contact to view details</div>
                )}
            </aside>
        </div>
    );
};

export default Inbox;
