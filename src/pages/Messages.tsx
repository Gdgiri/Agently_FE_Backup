
import React, { useState, useRef, useEffect } from 'react';
import { Card, Button, Input, Badge } from '../components/shared';
import { MOCK_CONVERSATIONS, MOCK_CONTACTS } from '../constants';
import { Conversation, Message, Contact } from '../types';
import {
    Search, User, MoreVertical, X, Tag, Plus, CheckCheck, Send, Smile, Paperclip, FileText, AlertCircle
} from 'lucide-react';

const Messages: React.FC = () => {
    const [conversations, setConversations] = useState<Conversation[]>(MOCK_CONVERSATIONS);
    const [selectedId, setSelectedId] = useState<string>(MOCK_CONVERSATIONS[0].id);
    const [inputText, setInputText] = useState('');
    const [isCrmOpen, setIsCrmOpen] = useState(false);
    const chatEndRef = useRef<HTMLDivElement>(null);

    const [editedContact, setEditedContact] = useState<Contact>(MOCK_CONTACTS[0]);
    const [newTagName, setNewTagName] = useState('');

    const activeChat = conversations.find(c => c.id === selectedId) || conversations[0];

    useEffect(() => {
        if (activeChat.contact) {
            setEditedContact({ ...activeChat.contact });
        }
    }, [selectedId]);

    const scrollToBottom = () => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [activeChat.messages]);

    const handleSendMessage = () => {
        if (!inputText.trim()) return;
        const newMessage: Message = {
            id: Date.now().toString(),
            conversationId: selectedId,
            text: inputText,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            direction: 'outbound',
            status: 'sent',
            type: 'text'
        };
        setConversations(prev => prev.map(c => {
            if (c.id === selectedId) {
                return {
                    ...c,
                    messages: [...c.messages, newMessage],
                    lastMessage: inputText,
                    lastTimestamp: newMessage.timestamp
                };
            }
            return c;
        }));
        setInputText('');
    };

    const handleSaveContact = () => {
        setConversations(prev => prev.map(c => {
            if (c.id === selectedId) {
                return { ...c, contact: editedContact };
            }
            return c;
        }));
    };

    const removeTag = (tagToRemove: string) => {
        setEditedContact({ ...editedContact, tags: editedContact.tags.filter(t => t !== tagToRemove) });
    };

    const addTag = () => {
        if (newTagName && !editedContact.tags.includes(newTagName)) {
            setEditedContact({ ...editedContact, tags: [...editedContact.tags, newTagName] });
            setNewTagName('');
        }
    };

    const addCrmField = () => {
        setEditedContact({
            ...editedContact,
            crmFields: [...editedContact.crmFields, { key: '', value: '' }]
        });
    };

    return (
        <div className="h-[calc(100vh-64px)] flex overflow-hidden bg-white">
            <div className="w-80 md:w-96 border-r border-gray-200 flex flex-col shrink-0 bg-white">
                <div className="p-4 bg-gray-50 border-b border-gray-200">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#25D366]/20 focus:border-[#25D366] outline-none" placeholder="Search chats..." />
                    </div>
                </div>
                <div className="flex-1 overflow-y-auto scrollbar-hide">
                    {conversations.map(chat => (
                        <button
                            key={chat.id}
                            onClick={() => setSelectedId(chat.id)}
                            className={`w-full flex items-center gap-3 p-4 border-b border-gray-50 transition-colors ${selectedId === chat.id ? 'bg-[#25D366]/5' : 'hover:bg-gray-50'}`}
                        >
                            <div className="w-12 h-12 bg-gray-100 rounded-full flex-shrink-0 flex items-center justify-center text-gray-400 font-bold uppercase overflow-hidden">
                                {chat.contact?.name ? chat.contact.name.charAt(0) : <User size={20} />}
                            </div>
                            <div className="flex-1 min-w-0 text-left">
                                <div className="flex justify-between items-baseline mb-1">
                                    <h4 className="text-sm font-semibold text-gray-900 truncate">{chat.contact?.name || chat.phone}</h4>
                                    <span className="text-[10px] text-gray-400">{chat.lastTimestamp}</span>
                                </div>
                                <p className="text-xs text-gray-500 truncate">{chat.lastMessage}</p>
                            </div>
                            {chat.unreadCount > 0 && (
                                <div className="w-5 h-5 bg-[#25D366] rounded-full flex items-center justify-center text-[10px] text-white font-bold">
                                    {chat.unreadCount}
                                </div>
                            )}
                        </button>
                    ))}
                </div>
            </div>

            <div className="flex-1 flex flex-col bg-[#f0f2f5] min-w-0 relative">
                <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/cartographer.png')]" />

                <header className="h-16 bg-white border-b border-gray-200 px-4 flex items-center justify-between shrink-0 z-10">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-400 font-bold">
                            {activeChat.contact?.name ? activeChat.contact.name.charAt(0) : <User size={18} />}
                        </div>
                        <div>
                            <h3 className="text-sm font-bold text-gray-900">{activeChat.contact?.name || activeChat.phone}</h3>
                            <span className="text-[10px] text-gray-500 font-medium flex items-center gap-1"><div className="w-1.5 h-1.5 bg-[#25D366] rounded-full" /> Session Active (23h)</span>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <button onClick={() => setIsCrmOpen(!isCrmOpen)} className={`p-2 rounded-full transition-colors ${isCrmOpen ? 'text-[#25D366] bg-green-50' : 'text-gray-400 hover:bg-gray-100'}`}><User size={20} /></button>
                        <button className="p-2 text-gray-400 hover:text-gray-600"><MoreVertical size={20} /></button>
                    </div>
                </header>

                <div className="flex-1 overflow-y-auto p-6 space-y-4 scrollbar-hide z-10">
                    {activeChat.messages.map(msg => (
                        <div key={msg.id} className={`flex w-full ${msg.direction === 'outbound' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[75%] rounded-xl px-3 py-2 shadow-sm relative ${msg.direction === 'outbound' ? 'bg-[#dcf8c6] rounded-tr-none' : 'bg-white rounded-tl-none border border-gray-100'}`}>
                                {msg.type === 'template' && (
                                    <div className="flex items-center gap-1.5 mb-1 text-[10px] font-bold text-gray-400 uppercase tracking-wide">
                                        <FileText size={10} /> Template
                                    </div>
                                )}
                                <p className="text-sm text-gray-800">{msg.text}</p>
                                <div className="flex justify-end items-center gap-1 mt-1">
                                    <span className="text-[10px] text-gray-400">{msg.timestamp}</span>
                                    {msg.direction === 'outbound' && (
                                        <CheckCheck 
                                            size={14} 
                                            className={
                                                msg.status === 'read' ? 'text-blue-400' : 
                                                msg.status === 'failed' ? 'text-red-400' : 
                                                'text-gray-300'
                                            } 
                                        />
                                    )}
                                </div>
                                {msg.status === 'failed' && msg.failureReason && (
                                    <div className="mt-2 p-2 bg-red-50/50 rounded-lg border border-red-100 flex items-start gap-2 animate-in fade-in slide-in-from-top-1">
                                        <AlertCircle size={12} className="text-red-500 mt-0.5 shrink-0" />
                                        <p className="text-[10px] text-red-600 font-semibold leading-relaxed">
                                            {msg.failureReason}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                    <div ref={chatEndRef} />
                </div>

                <div className="p-4 bg-white border-t border-gray-200 shrink-0 z-10">
                    <div className="max-w-4xl mx-auto flex gap-3 items-center">
                        <button className="text-gray-400 hover:text-[#25D366]"><Smile size={22} /></button>
                        <button className="text-gray-400 hover:text-[#25D366]"><Paperclip size={22} /></button>
                        <input
                            value={inputText}
                            onChange={(e) => setInputText(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                            className="flex-1 px-4 py-2.5 bg-gray-50 border border-transparent rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-[#25D366]/10 focus:border-[#25D366] outline-none transition-all shadow-sm"
                            placeholder="Type a message..."
                        />
                        <button onClick={handleSendMessage} disabled={!inputText.trim()} className="p-3 bg-[#25D366] text-white rounded-xl shadow-md hover:bg-[#1ebe5d] active:scale-95 disabled:opacity-50 transition-all"><Send size={18} /></button>
                    </div>
                </div>
            </div>

            {isCrmOpen && (
                <aside className="w-80 border-l border-gray-200 bg-white flex flex-col shrink-0 animate-in slide-in-from-right duration-300">
                    <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                        <h4 className="font-bold text-sm text-gray-900 flex items-center gap-2"><User size={16} className="text-[#25D366]" /> Profile Details</h4>
                        <button onClick={() => setIsCrmOpen(false)} className="p-1 text-gray-400 hover:text-gray-600"><X size={18} /></button>
                    </div>
                    <div className="flex-1 overflow-y-auto p-5 space-y-6 scrollbar-hide">
                        <div className="space-y-4">
                            <Input label="Full Name" value={editedContact.name} onChange={(e: any) => setEditedContact({ ...editedContact, name: e.target.value })} />
                            <Input label="Email Address" value={editedContact.email} onChange={(e: any) => setEditedContact({ ...editedContact, email: e.target.value })} />
                            <Input label="Company Name" value={editedContact.company} onChange={(e: any) => setEditedContact({ ...editedContact, company: e.target.value })} />
                        </div>

                        <div className="space-y-3">
                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5"><Tag size={12} /> Tags</label>
                            <div className="flex flex-wrap gap-1.5">
                                {editedContact.tags.map(t => (
                                    <Badge key={t} variant="success">
                                        <span className="flex items-center gap-1.5">
                                            {t}
                                            <X size={10} className="cursor-pointer hover:text-red-500" onClick={() => removeTag(t)} />
                                        </span>
                                    </Badge>
                                ))}
                            </div>
                            <div className="flex gap-2">
                                <input
                                    className="flex-1 px-3 py-1.5 bg-gray-50 border border-gray-100 rounded-lg text-xs outline-none focus:ring-1 focus:ring-[#25D366]"
                                    placeholder="New tag..."
                                    value={newTagName}
                                    onChange={(e) => setNewTagName(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && addTag()}
                                />
                                <button onClick={addTag} className="p-1.5 text-gray-400 hover:text-[#25D366]"><Plus size={18} /></button>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">CRM Fields</label>
                                <button onClick={addCrmField} className="text-[10px] font-bold text-[#25D366] uppercase hover:underline">Add Field</button>
                            </div>
                            <div className="space-y-2">
                                {editedContact.crmFields.map((field, idx) => (
                                    <div key={idx} className="flex gap-2">
                                        <input
                                            className="w-1/3 px-2 py-1 bg-gray-50 border-b text-[11px] font-medium outline-none focus:border-[#25D366]"
                                            placeholder="Label"
                                            value={field.key}
                                            onChange={(e) => {
                                                const next = [...editedContact.crmFields];
                                                next[idx].key = e.target.value;
                                                setEditedContact({ ...editedContact, crmFields: next });
                                            }}
                                        />
                                        <input
                                            className="flex-1 px-2 py-1 bg-gray-50 border-b text-[11px] outline-none focus:border-[#25D366]"
                                            placeholder="Value"
                                            value={field.value}
                                            onChange={(e) => {
                                                const next = [...editedContact.crmFields];
                                                next[idx].value = e.target.value;
                                                setEditedContact({ ...editedContact, crmFields: next });
                                            }}
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                    <div className="p-4 border-t border-gray-100 bg-gray-50">
                        <Button className="w-full" onClick={handleSaveContact}>Update Lead</Button>
                    </div>
                </aside>
            )}
        </div>
    );
};

export default Messages;
