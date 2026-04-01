import React from 'react';
import {
    MoreVertical, MessageSquare, Phone as PhoneIcon,
    ArrowLeft, Video, Send, Smile, Paperclip,
    ExternalLink, List, CheckCircle2, Instagram, Facebook, SendHorizontal, Mail, Inbox,
    Camera, Heart, Plus, Mic, Share, Trash2, Archive, Star, Search, Image as ImageIcon,
    ChevronRight, Bold, Italic, Link2, Type
} from 'lucide-react';
import { cn } from '../ui';

interface MultiChannelPreviewProps {
    channel: 'WHATSAPP' | 'INSTAGRAM' | 'FACEBOOK' | 'TELEGRAM' | 'EMAIL';
    messages: Array<{
        role: 'user' | 'bot';
        text?: string;
        type?: 'text' | 'media' | 'interactive' | 'template';
        headerType?: 'IMAGE' | 'VIDEO' | 'DOCUMENT' | 'NONE';
        mediaUrl?: string;
        footerText?: string;
        buttons?: Array<{ id: string; title: string; url?: string }>;
        sections?: Array<{ title: string; rows: Array<{ id: string; title: string; description?: string }> }>;
        templateName?: string;
        interactionType?: 'BUTTONS' | 'LIST' | 'CTA' | 'email';
        ctaLabel?: string;
        ctaUrl?: string;
        subject?: string;
        nodeId?: string;
        interactedButtonIds?: string[];
    }>;
    onSendMessage?: (text: string) => void;
    onButtonClick?: (nodeId: string, buttonId: string) => void;
}

export const MultiChannelPreview: React.FC<MultiChannelPreviewProps> = ({
    channel,
    messages,
    onSendMessage,
    onButtonClick
}) => {
    const [inputValue, setInputValue] = React.useState('');

    const handleSend = () => {
        if (inputValue.trim() && onSendMessage) {
            onSendMessage(inputValue);
            setInputValue('');
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleSend();
        }
    };

    // Channel specific configurations
    const config = {
        WHATSAPP: {
            headerBg: 'bg-[#128c7e]',
            headerText: 'text-white',
            bodyBg: 'bg-[#efeae2]',
            userBubble: 'bg-[#dcf8c6] text-[#111b21] rounded-tr-none shadow-sm',
            botBubble: 'bg-white text-[#111b21] rounded-tl-none shadow-sm',
            accent: '#128c7e',
            name: 'WhatsApp Business',
            showWallpaper: true,
            icon: <MessageSquare size={18} />,
        },
        INSTAGRAM: {
            headerBg: 'bg-white',
            headerText: 'text-black',
            bodyBg: 'bg-white',
            userBubble: 'bg-[#3797f0] text-white rounded-[1.5rem]',
            botBubble: 'bg-[#efefef] text-black rounded-[1.5rem]',
            accent: '#3897f0',
            name: 'Instagram Direct',
            showWallpaper: false,
            icon: <Instagram size={18} />,
        },
        FACEBOOK: {
            headerBg: 'bg-white',
            headerText: 'text-black',
            bodyBg: 'bg-white',
            userBubble: 'bg-[#0084FF] text-white rounded-[1.2rem]',
            botBubble: 'bg-[#e4e6eb] text-black rounded-[1.2rem]',
            accent: '#0084FF',
            name: 'Messenger',
            showWallpaper: false,
            icon: <Facebook size={18} />,
        },
        TELEGRAM: {
            headerBg: 'bg-[#507da0]',
            headerText: 'text-white',
            bodyBg: 'bg-[#7192b0]',
            userBubble: 'bg-[#effdde] text-black rounded-br-none shadow-sm',
            botBubble: 'bg-white text-black rounded-bl-none shadow-sm',
            accent: '#507da0',
            name: 'Telegram Bot',
            showWallpaper: false,
            icon: <SendHorizontal size={18} />,
        },
        EMAIL: {
            headerBg: 'bg-[#f6f8fc]',
            headerText: 'text-gray-900',
            bodyBg: 'bg-white',
            userBubble: 'bg-transparent',
            botBubble: 'bg-transparent',
            accent: '#1a73e8',
            name: 'Email Support',
            showWallpaper: false,
            icon: <Mail size={18} />,
        }
    }[channel];

    // --- EMAIL VIEW ---
    if (channel === 'EMAIL') {
        const lastMsg = messages.filter(m => m.role === 'bot').pop();
        return (
            <div className="h-full flex flex-col bg-gray-100 relative overflow-hidden shadow-2xl rounded-[3rem] border-[12px] border-gray-900 pointer-events-auto">
                {/* Notch */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-gray-900 rounded-b-3xl z-50 pointer-events-none" />

                {/* Gmail Style Header */}
                <div className="bg-[#f6f8fc] px-4 pt-10 pb-3 flex items-center justify-between border-b border-gray-200">
                    <div className="flex items-center gap-4">
                        <ArrowLeft size={20} className="text-gray-700" />
                        <h2 className="text-sm font-bold text-gray-900">Inbox</h2>
                    </div>
                    <div className="flex items-center gap-4 text-gray-600">
                        <Archive size={20} />
                        <Trash2 size={20} />
                        <Mail size={20} />
                        <MoreVertical size={20} />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar p-3">
                    <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-200">
                        <div className="flex justify-between items-start mb-6">
                            <h1 className="text-xl font-bold text-gray-900 leading-tight">
                                {lastMsg?.subject || 'Welcome to our service'}
                            </h1>
                            <Star size={20} className="text-gray-300 shrink-0 mt-1" />
                        </div>

                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-lg">
                                S
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-center">
                                    <p className="text-sm font-bold text-gray-900">Support Team <span className="text-xs font-normal text-gray-400 ml-1">support@business.com</span></p>
                                    <span className="text-[11px] text-gray-400 font-medium">12:30 PM</span>
                                </div>
                                <p className="text-[11px] text-gray-500 flex items-center gap-1 mt-0.5">to me <ChevronRight size={10} /></p>
                            </div>
                        </div>

                        <div className="prose prose-sm max-w-none text-gray-800 leading-relaxed font-normal min-h-[150px]">
                            {messages.map((msg, i) => (
                                <div key={i} className={cn("mb-6", msg.role === 'user' ? "text-gray-400 italic text-sm border-l-4 border-gray-100 pl-4 py-1" : "")}>
                                    {msg.text || (msg.type === 'template' ? `[Template: ${msg.templateName}]` : '')}

                                    {msg.buttons && msg.buttons.length > 0 && (
                                        <div className="mt-6 flex flex-wrap gap-2">
                                            {msg.buttons.map((btn, bi) => (
                                                <button
                                                    key={bi}
                                                    className="px-6 py-2.5 bg-[#1a73e8] text-white text-xs font-bold rounded-lg hover:shadow-md transition-all active:scale-95"
                                                    onClick={() => onButtonClick?.(msg.nodeId || 'current', btn.id || bi.toString())}
                                                >
                                                    {btn.title}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>

                        {/* Gmail Reply Box */}
                        <div className="mt-8 pt-6 border-t border-gray-100">
                            <div className="bg-gray-50 rounded-xl border border-gray-200 p-3">
                                <p className="text-xs text-gray-400 font-medium mb-3">Compose reply...</p>
                                <textarea
                                    value={inputValue}
                                    onChange={(e) => setInputValue(e.target.value)}
                                    className="w-full bg-transparent border-none focus:ring-0 text-sm text-gray-900 min-h-[80px] resize-none"
                                    placeholder="Write your message here"
                                />
                                <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                                    <div className="flex items-center gap-3 text-gray-500">
                                        <Type size={18} />
                                        <Paperclip size={18} />
                                        <Smile size={18} />
                                        <ImageIcon size={18} />
                                    </div>
                                    <button
                                        onClick={handleSend}
                                        disabled={!inputValue.trim()}
                                        className={cn(
                                            "flex items-center gap-2 px-5 py-2 rounded-full font-bold text-xs transition-all",
                                            inputValue.trim() ? "bg-[#1a73e8] text-white" : "bg-gray-200 text-gray-400 cursor-not-allowed"
                                        )}
                                    >
                                        Send <Send size={14} />
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-4 mt-8">
                            <button className="flex-1 py-2.5 border border-gray-300 rounded-lg flex items-center justify-center gap-2 text-xs font-bold text-gray-600 hover:bg-gray-50">
                                <Share size={16} className="scale-x-[-1]" /> Reply
                            </button>
                            <button className="flex-1 py-2.5 border border-gray-300 rounded-lg flex items-center justify-center gap-2 text-xs font-bold text-gray-600 hover:bg-gray-50">
                                <ExternalLink size={16} /> Forward
                            </button>
                        </div>
                    </div>
                </div>

                <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 w-32 h-1 bg-gray-400/20 rounded-full z-50 pointer-events-none" />
            </div>
        );
    }

    // --- CHAT VIEWS ---
    return (
        <div className={cn(
            "h-full flex flex-col relative overflow-hidden shadow-2xl rounded-[3rem] border-[12px] border-gray-900 shadow-black/20 ring-4 ring-gray-100 ring-offset-4 pointer-events-auto",
            config.bodyBg
        )}>
            {/* Notch */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-gray-900 rounded-b-3xl z-50 overflow-hidden pointer-events-none" />

            {/* Header */}
            <div className={cn(
                "px-4 pt-10 pb-3 flex items-center gap-3 shrink-0 relative z-20 transition-all",
                config.headerBg,
                channel === 'INSTAGRAM' || channel === 'FACEBOOK' ? 'border-b border-gray-100 bg-white/95 backdrop-blur-md' : 'shadow-md border-none'
            )}>
                <div className="flex items-center gap-1">
                    <ArrowLeft size={channel === 'INSTAGRAM' ? 24 : 18} className={config.headerText} />
                    {channel !== 'INSTAGRAM' && (
                        <div className="w-10 h-10 rounded-full bg-gray-200 flex-shrink-0 flex items-center justify-center overflow-hidden ml-1">
                            <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(config.name)}&background=random`} className="w-full h-full object-cover" alt="Bot" />
                        </div>
                    )}
                </div>

                <div className={cn("flex-1 min-w-0 pr-2", channel === 'INSTAGRAM' ? "text-center" : "")}>
                    {channel === 'INSTAGRAM' && (
                        <div className="inline-flex flex-col items-center">
                            <div className="w-8 h-8 rounded-full bg-gray-200 overflow-hidden mb-0.5 border border-black/5">
                                <img src={`https://ui-avatars.com/api/?name=IG&background=random`} className="w-full h-full object-cover" alt="Bot" />
                            </div>
                            <p className="font-bold text-[14px] leading-tight text-black tracking-tight">{config.name}</p>
                            <p className="text-[10px] text-gray-400 font-medium">Active now</p>
                        </div>
                    )}

                    {channel !== 'INSTAGRAM' && (
                        <>
                            <p className={cn("font-bold text-[15px] leading-tight truncate tracking-tight", config.headerText)}>{config.name}</p>
                            <p className={cn("text-[10px] font-medium flex items-center gap-1 mt-0.5 opacity-80", config.headerText)}>
                                <span className="w-2 h-2 bg-green-400 rounded-full border border-black/10" /> online
                            </p>
                        </>
                    )}
                </div>

                <div className={cn("flex items-center gap-4", config.headerText)}>
                    {channel === 'INSTAGRAM' ? (
                        <>
                            <PhoneIcon size={22} />
                            <Video size={24} />
                        </>
                    ) : (
                        <>
                            <Video size={20} />
                            <PhoneIcon size={18} />
                            <MoreVertical size={20} />
                        </>
                    )}
                </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 px-3 py-4 overflow-y-auto custom-scrollbar flex flex-col gap-3 relative">
                {config.showWallpaper && (
                    <div
                        className="absolute inset-0 opacity-[0.1] pointer-events-none grayscale invert"
                        style={{ backgroundImage: 'url("https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png")' }}
                    />
                )}

                <div className="self-center bg-black/5 bg-opacity-20 backdrop-blur-sm px-4 py-1 rounded-full text-[10px] font-bold text-gray-500 uppercase tracking-widest my-2 z-10 shadow-sm">
                    {channel === 'TELEGRAM' ? 'September 14' : 'Today'}
                </div>

                {messages.length === 0 ? (
                    <div className="flex-1 flex flex-col items-center justify-center opacity-40 px-10 text-center relative z-10">
                        <div className="w-16 h-16 bg-white/50 rounded-3xl flex items-center justify-center mb-4 shadow-inner rotate-3">
                            {config.icon}
                        </div>
                        <p className="text-[12px] font-bold text-gray-500 tracking-wider">Empty Chat Preview</p>
                    </div>
                ) : (
                    messages.map((msg, idx) => (
                        <div
                            key={idx}
                            className={cn(
                                "max-w-[85%] text-[14px] relative z-10 flex flex-col mb-1 group",
                                msg.role === 'user' ? "self-end" : "self-start",
                                msg.role === 'user' ? config.userBubble : config.botBubble,
                            )}
                        >
                            {/* Messenger Avatar */}
                            {channel === 'FACEBOOK' && msg.role === 'bot' && (
                                <div className="absolute -left-9 bottom-0 w-7 h-7 rounded-full bg-gray-200 overflow-hidden ring-2 ring-white">
                                    <img src="https://ui-avatars.com/api/?name=FB&background=random" className="w-full h-full object-cover" alt="FB" />
                                </div>
                            )}

                            {/* Media Header */}
                            {msg.mediaUrl && (
                                <div className="p-1 pb-0">
                                    <div className="relative rounded-[1rem] overflow-hidden aspect-square min-w-[200px] bg-gray-100">
                                        <img src={msg.mediaUrl} alt="Payload" className="w-full h-full object-cover" />
                                    </div>
                                </div>
                            )}

                            {/* Message Main Body */}
                            <div className="px-3 pt-2 pb-1 relative">
                                <p className="whitespace-pre-wrap leading-[1.5] tracking-tight font-medium py-1">
                                    {msg.text || (msg.type === 'template' ? `[Template: ${msg.templateName}]` : '')}
                                </p>

                                <div className="flex items-center justify-end gap-1 mt-0.5 opacity-60">
                                    <span className="text-[9px] font-bold tabular-nums">12:30</span>
                                    {msg.role === 'bot' && (channel === 'WHATSAPP' || channel === 'TELEGRAM') && (
                                        <div className="flex scale-[0.7] -mr-1">
                                            <span className={cn("text-[14px] font-bold", channel === 'WHATSAPP' ? "text-[#53bdeb]" : "text-gray-400")}>✓</span>
                                            <span className={cn("text-[14px] font-bold -ml-1", channel === 'WHATSAPP' ? "text-[#53bdeb]" : "text-gray-400")}>✓</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Interactive Buttons (Platform Specific Styling) */}
                            {msg.buttons && msg.buttons.length > 0 && (
                                <div className={cn(
                                    "px-2 pb-2 flex flex-col gap-1.5",
                                    channel === 'WHATSAPP' ? "border-t border-black/5 mt-1 pt-2 bg-gray-50/20" : "mt-1"
                                )}>
                                    {msg.buttons.map((btn, bIdx) => (
                                        <button
                                            key={bIdx}
                                            onClick={() => onButtonClick?.(msg.nodeId || 'current', btn.id || bIdx.toString())}
                                            className={cn(
                                                "py-2.5 px-4 text-[13px] font-bold text-center transition-all flex items-center justify-center gap-2 rounded-xl",
                                                channel === 'INSTAGRAM' || channel === 'FACEBOOK'
                                                    ? "bg-white ring-1 ring-gray-200 text-blue-600 hover:bg-gray-50 shadow-sm"
                                                    : channel === 'TELEGRAM'
                                                        ? "bg-black/5 hover:bg-black/10 text-blue-700"
                                                        : "text-[#128c7e] hover:bg-black/5"
                                            )}
                                        >
                                            {btn.url && <ExternalLink size={14} />}
                                            {btn.title}
                                        </button>
                                    ))}
                                </div>
                            )}

                            {/* WhatsApp Tail */}
                            {channel === 'WHATSAPP' && (
                                <div className={cn(
                                    "absolute top-0 w-[12px] h-[18px]",
                                    msg.role === 'user' ? "-right-[9px]" : "-left-[9px]"
                                )}>
                                    <svg viewBox="0 0 8 13" preserveAspectRatio="none" className={cn("w-full h-full", msg.role === 'user' ? "text-[#dcf8c6]" : "text-white")}>
                                        <path d={msg.role === 'user' ? "M0 0 L8 0 L8 13 C8 13 8 7 0 0" : "M8 0 L0 0 L0 13 C0 13 0 7 8 0"} fill="currentColor" />
                                    </svg>
                                </div>
                            )}

                            {/* Telegram Tail */}
                            {channel === 'TELEGRAM' && (
                                <div className={cn(
                                    "absolute bottom-0 w-[12px] h-[18px]",
                                    msg.role === 'user' ? "-right-[5px]" : "-left-[5px]"
                                )}>
                                    <svg viewBox="0 0 8 13" preserveAspectRatio="none" className={cn("w-full h-full", msg.role === 'user' ? "text-[#effdde]" : "text-white")}>
                                        <path d={msg.role === 'user' ? "M0 13 L8 13 L8 0 C8 0 8 6 0 13" : "M8 13 L0 13 L0 0 C0 0 0 6 8 13"} fill="currentColor" />
                                    </svg>
                                </div>
                            )}
                        </div>
                    ))
                )}
            </div>

            {/* --- Platform Specific Footers --- */}
            <div className={cn(
                "p-3 pb-8 shrink-0 z-20 flex items-center gap-2",
                channel === 'WHATSAPP' ? "bg-[#f0f2f5]" : "bg-white/80 backdrop-blur-lg border-t border-gray-100"
            )}>
                {/* Left Side Icons */}
                {channel === 'WHATSAPP' && <Smile size={24} className="text-gray-500 mx-1" />}
                {channel === 'FACEBOOK' && <Plus size={24} className="text-[#0084FF] mx-1" />}
                {channel === 'INSTAGRAM' && <Camera size={26} className="text-gray-800 mx-1" />}
                {channel === 'TELEGRAM' && <Paperclip size={24} className="text-gray-400 mx-1" />}

                {/* Input Area */}
                <div className={cn(
                    "flex-1 flex items-center px-4 py-2 transition-all",
                    channel === 'WHATSAPP' ? "bg-white rounded-full shadow-sm" :
                        channel === 'FACEBOOK' ? "bg-gray-100 rounded-2xl" :
                            channel === 'INSTAGRAM' ? "border border-gray-200 rounded-full" :
                                "bg-transparent" // Telegram is minimalistic
                )}>
                    <input
                        type="text"
                        placeholder={channel === 'TELEGRAM' ? 'Message' : 'Message...'}
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyDown={handleKeyDown}
                        className="w-full bg-transparent border-none focus:ring-0 text-[15px] text-gray-900 placeholder-gray-400 font-medium"
                    />

                    {/* Inner Action Icons */}
                    <div className="flex gap-2 text-gray-400">
                        {channel === 'WHATSAPP' && <Paperclip size={20} className="rotate-45" />}
                        {channel === 'FACEBOOK' && !inputValue.trim() && <Smile size={22} className="text-[#0084FF]" />}
                    </div>
                </div>

                {/* Right Side / Send Button */}
                <div className="flex items-center gap-3">
                    {channel === 'INSTAGRAM' && !inputValue.trim() && (
                        <>
                            <Mic size={24} className="text-gray-800" />
                            <ImageIcon size={24} className="text-gray-800" />
                            <Heart size={24} className="text-gray-800" />
                        </>
                    )}

                    {channel === 'FACEBOOK' && !inputValue.trim() && (
                        <>
                            <Mic size={24} className="text-[#0084FF]" />
                            <ImageIcon size={24} className="text-[#0084FF]" />
                        </>
                    )}

                    <button
                        onClick={handleSend}
                        className={cn(
                            "transition-all active:scale-90 flex items-center justify-center",
                            (channel === 'WHATSAPP' || channel === 'TELEGRAM')
                                ? "w-11 h-11 rounded-full text-white shadow-md relative"
                                : "px-1"
                        )}
                        style={{
                            backgroundColor: (channel === 'WHATSAPP' || channel === 'TELEGRAM') ? config.accent : 'transparent',
                            color: (channel === 'INSTAGRAM' || channel === 'FACEBOOK') ? config.accent : ''
                        }}
                    >
                        {(channel === 'WHATSAPP' || channel === 'TELEGRAM') ? (
                            inputValue.trim() ? <Send size={20} className="ml-0.5" /> : <Mic size={22} />
                        ) : (
                            inputValue.trim() ? <span className="font-bold text-[16px]">Send</span> : null
                        )}
                    </button>
                </div>
            </div>

            {/* Home Bar */}
            <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 w-32 h-1 bg-gray-400/20 rounded-full z-50 pointer-events-none" />
        </div>
    );
};
