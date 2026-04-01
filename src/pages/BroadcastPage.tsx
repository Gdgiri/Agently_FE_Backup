import React, { useState, useEffect } from 'react';
import apiClient from '../lib/apiClient';
import { Megaphone, Send, Users, Image as ImageIcon, CheckCircle2, AlertCircle, Loader2, Upload, X, Instagram } from 'lucide-react';
import toast from 'react-hot-toast';
import { cn } from '../components/ui';
import { mediaApi } from '../lib/api/mediaApi';

interface Contact {
    id: string;
    name: string;
    phoneNumber: string;
    instagramId?: string;
}

const BroadcastPage: React.FC = () => {
    const [channel, setChannel] = useState<'WHATSAPP' | 'INSTAGRAM'>('WHATSAPP');
    const [title, setTitle] = useState('');
    const [message, setMessage] = useState('');
    const [mediaUrl, setMediaUrl] = useState('');
    const [publicId, setPublicId] = useState('');
    const [contacts, setContacts] = useState<Contact[]>([]);
    const [selectedContacts, setSelectedContacts] = useState<string[]>([]);
    const [isSending, setIsSending] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [isLoadingContacts, setIsLoadingContacts] = useState(true);
    const [result, setResult] = useState<{ title: string; totalRecipients: number; totalSent: number; totalFailed: number } | null>(null);

    useEffect(() => {
        fetchContacts();
    }, []);

    const fetchContacts = async () => {
        try {
            const response = await apiClient.get('/contacts');
            setContacts(response.data.data || []);
        } catch (error) {
            toast.error('Failed to load contacts');
        } finally {
            setIsLoadingContacts(false);
        }
    };

    // Filter contacts based on channel
    const filteredContacts = contacts.filter(c =>
        channel === 'WHATSAPP' ? !!c.phoneNumber : !!c.instagramId
    );

    const toggleContact = (id: string) => {
        setSelectedContacts(prev =>
            prev.includes(id)
                ? prev.filter(p => p !== id)
                : [...prev, id]
        );
    };

    const selectAll = () => {
        if (selectedContacts.length === filteredContacts.length) {
            setSelectedContacts([]);
        } else {
            setSelectedContacts(filteredContacts.map(c => channel === 'WHATSAPP' ? c.phoneNumber : c.instagramId!));
        }
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        try {
            const response = await mediaApi.upload(file);
            if (response.data.success) {
                setMediaUrl(response.data.data.url);
                setPublicId(response.data.data.publicId);
                toast.success('File uploaded successfully!');
            }
        } catch (error) {
            console.error('Upload error:', error);
            toast.error('Failed to upload file');
        } finally {
            setIsUploading(false);
        }
    };

    const removeMedia = async () => {
        if (publicId) {
            try {
                await mediaApi.delete(publicId);
                toast.success('File removed from Cloudinary');
            } catch (error) {
                console.error('Delete error:', error);
                toast.error('Failed to delete file from Cloudinary');
            }
        }
        setMediaUrl('');
        setPublicId('');
    };

    const handleSend = async () => {
        if (!title || !message || selectedContacts.length === 0) {
            toast.error('Please fill in all required fields and select at least one contact');
            return;
        }

        setIsSending(true);
        setResult(null);

        try {
            const response = await apiClient.post('/broadcast/send', {
                title,
                message,
                mediaUrl,
                recipients: selectedContacts,
                channel
            });

            setResult({ ...response.data, title });
            toast.success('Broadcast completed!');
            // Reset form
            setTitle('');
            setMessage('');
            setMediaUrl('');
            setPublicId('');
            setSelectedContacts([]);
        } catch (error: any) {
            toast.error(error.response?.data?.error || 'Failed to send broadcast');
        } finally {
            setIsSending(false);
        }
    };

    return (
        <div className="p-8 max-w-5xl mx-auto">
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                    <div className={cn(
                        "w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm transition-all duration-500",
                        channel === 'WHATSAPP' ? "bg-green-100 text-green-600" : "bg-pink-100 text-pink-600"
                    )}>
                        {channel === 'WHATSAPP' ? <Megaphone size={24} /> : <Instagram size={24} />}
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">{channel === 'WHATSAPP' ? 'WhatsApp' : 'Instagram'} Broadcast</h1>
                        <p className="text-gray-500 text-sm">Send a quick message to multiple contacts at once.</p>
                    </div>
                </div>

                <div className="flex bg-gray-100 p-1.5 rounded-2xl gap-1">
                    <button
                        onClick={() => { setChannel('WHATSAPP'); setSelectedContacts([]); }}
                        className={cn(
                            "px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2",
                            channel === 'WHATSAPP' ? "bg-white text-green-600 shadow-sm" : "text-gray-500 hover:text-gray-700"
                        )}
                    >
                        <Megaphone size={14} /> WhatsApp
                    </button>
                    <button
                        onClick={() => { setChannel('INSTAGRAM'); setSelectedContacts([]); }}
                        className={cn(
                            "px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2",
                            channel === 'INSTAGRAM' ? "bg-white text-pink-600 shadow-sm" : "text-gray-500 hover:text-gray-700"
                        )}
                    >
                        <Instagram size={14} /> Instagram
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Form Section */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden p-6 space-y-5">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Broadcast Title *</label>
                            <input
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="e.g., Summer Promotion"
                                className={cn(
                                    "w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 transition-all",
                                    channel === 'WHATSAPP' ? "focus:ring-green-500/20 focus:border-green-500" : "focus:ring-purple-500/20 focus:border-purple-500"
                                )}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Message Content *</label>
                            <textarea
                                rows={5}
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                placeholder="Type your message here..."
                                className={cn(
                                    "w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 transition-all resize-none",
                                    channel === 'WHATSAPP' ? "focus:ring-green-500/20 focus:border-green-500" : "focus:ring-purple-500/20 focus:border-purple-500"
                                )}
                            />
                        </div>

                        {channel === 'INSTAGRAM' && (
                            <div className="bg-pink-50 border border-pink-100 rounded-2xl p-4 flex items-start gap-3">
                                <AlertCircle className="text-pink-500 mt-0.5 shrink-0" size={18} />
                                <div>
                                    <p className="text-xs font-bold text-pink-900">Instagram 24-hour Window</p>
                                    <p className="text-[10px] text-pink-700 mt-1">You can only send messages to users who have interacted with your page in the last 24 hours.</p>
                                </div>
                            </div>
                        )}

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Media Attachment (Optional Image/Video)</label>

                            {!mediaUrl ? (
                                <div className="relative">
                                    <input
                                        type="file"
                                        accept="image/*,video/*"
                                        onChange={handleFileUpload}
                                        id="media-upload"
                                        className="hidden"
                                    />
                                    <label
                                        htmlFor="media-upload"
                                        className={cn(
                                            "w-full flex flex-col items-center justify-center p-6 border-2 border-dashed border-gray-200 rounded-2xl cursor-pointer hover:bg-gray-50 transition-all",
                                            isUploading && "opacity-50 cursor-not-allowed pointer-events-none"
                                        )}
                                    >
                                        {isUploading ? (
                                            <Loader2 className={cn("animate-spin mb-2", channel === 'WHATSAPP' ? "text-green-500" : "text-pink-500")} size={24} />
                                        ) : (
                                            <Upload className="text-gray-400 mb-2" size={24} />
                                        )}
                                        <span className="text-sm font-medium text-gray-900">
                                            {isUploading ? 'Uploading to Cloudinary...' : 'Click to upload image or video'}
                                        </span>
                                        <span className="text-xs text-gray-500 mt-1">PNG, JPG, MP4 up to 10MB</span>
                                    </label>
                                </div>
                            ) : (
                                <div className="relative rounded-2xl border border-gray-200 p-3 bg-gray-50 flex items-center justify-between gap-4">
                                    <div className="flex items-center gap-3 overflow-hidden">
                                        <div className="w-12 h-12 bg-white rounded-lg border border-gray-100 flex items-center justify-center flex-shrink-0">
                                            {mediaUrl.match(/\.(mp4|3gp|mov)$/i) ? (
                                                <ImageIcon className="text-blue-500" size={20} />
                                            ) : (
                                                <img src={mediaUrl} alt="Preview" className="w-full h-full object-cover rounded-lg" />
                                            )}
                                        </div>
                                        <div className="overflow-hidden">
                                            <p className="text-xs font-bold text-gray-900 truncate">{mediaUrl}</p>
                                            <p className={cn("text-[10px] font-bold uppercase tracking-wider", channel === 'WHATSAPP' ? "text-green-600" : "text-pink-600")}>Ready to send</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={removeMedia}
                                        className="p-2 hover:bg-gray-200 rounded-full transition-all text-gray-400 hover:text-red-500"
                                    >
                                        <X size={18} />
                                    </button>
                                </div>
                            )}
                        </div>

                        <button
                            onClick={handleSend}
                            disabled={isSending}
                            className={cn(
                                "w-full py-4 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg active:scale-95",
                                isSending
                                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                                    : channel === 'WHATSAPP'
                                        ? "bg-green-500 text-white hover:bg-green-600 shadow-green-500/20"
                                        : "bg-pink-600 text-white hover:bg-pink-700 shadow-pink-500/20"
                            )}
                        >
                            {isSending ? (
                                <>
                                    <Loader2 className="animate-spin" size={20} />
                                    Sending Broadcast...
                                </>
                            ) : (
                                <>
                                    <Send size={20} />
                                    Send Broadcast now
                                </>
                            )}
                        </button>
                    </div>

                    {result && (
                        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className={cn(
                                    "w-10 h-10 rounded-full flex items-center justify-center",
                                    channel === 'WHATSAPP' ? "bg-green-50 text-green-500" : "bg-pink-50 text-pink-500"
                                )}>
                                    <CheckCircle2 size={20} />
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-900">Broadcast Sent</h3>
                                    <p className="text-gray-500 text-xs">Final report for "{result.title}"</p>
                                </div>
                            </div>
                            <div className="flex gap-8">
                                <div className="text-center">
                                    <span className="block text-lg font-black text-gray-900">{result.totalSent}</span>
                                    <span className={cn("text-[10px] uppercase tracking-wider font-bold", channel === 'WHATSAPP' ? "text-green-600" : "text-pink-600")}>Sent</span>
                                </div>
                                <div className="text-center">
                                    <span className="block text-lg font-black text-gray-900">{result.totalFailed}</span>
                                    <span className="text-[10px] uppercase tracking-wider text-red-600 font-bold">Failed</span>
                                </div>
                                <div className="text-center">
                                    <span className="block text-lg font-black text-gray-900">{result.totalRecipients}</span>
                                    <span className="text-[10px] uppercase tracking-wider text-gray-400 font-bold">Total</span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Contact Selector */}
                <div className="bg-white rounded-3xl border border-gray-100 shadow-sm flex flex-col h-[600px]">
                    <div className="p-6 border-b border-gray-50 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Users size={18} className="text-gray-400" />
                            <h2 className="font-bold text-gray-900 text-sm">Select {channel === 'WHATSAPP' ? 'Numbers' : 'Users'}</h2>
                        </div>
                        <button
                            onClick={selectAll}
                            className={cn(
                                "text-xs font-bold transition-all",
                                channel === 'WHATSAPP' ? "text-green-600 hover:text-green-700" : "text-pink-600 hover:text-pink-700"
                            )}
                        >
                            {selectedContacts.length === filteredContacts.length ? 'Deselect All' : 'Select All'}
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 space-y-2">
                        {isLoadingContacts ? (
                            <div className="flex items-center justify-center h-full">
                                <Loader2 className="animate-spin text-gray-300" size={32} />
                            </div>
                        ) : filteredContacts.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-full text-center p-4">
                                <AlertCircle className="text-gray-200 mb-2" size={48} />
                                <p className="text-gray-400 text-sm">No {channel === 'WHATSAPP' ? 'WhatsApp' : 'Instagram'} contacts found.</p>
                            </div>
                        ) : (
                            filteredContacts.map(contact => {
                                const id = channel === 'WHATSAPP' ? contact.phoneNumber : contact.instagramId!;
                                return (
                                    <div
                                        key={contact.id}
                                        onClick={() => toggleContact(id)}
                                        className={cn(
                                            "p-3 rounded-2xl cursor-pointer border transition-all flex items-center justify-between group",
                                            selectedContacts.includes(id)
                                                ? channel === 'WHATSAPP' ? "bg-green-50 border-green-100" : "bg-pink-50 border-pink-100"
                                                : "bg-white border-transparent hover:border-gray-100"
                                        )}
                                    >
                                        <div>
                                            <h4 className="font-bold text-gray-900 text-sm">{contact.name || 'Unknown'}</h4>
                                            <p className="text-xs text-gray-500">{id}</p>
                                        </div>
                                        <div className={cn(
                                            "w-5 h-5 rounded-md border flex items-center justify-center transition-all",
                                            selectedContacts.includes(id)
                                                ? channel === 'WHATSAPP' ? "bg-green-500 border-green-500" : "bg-pink-600 border-pink-600"
                                                : "border-gray-200 group-hover:border-gray-300"
                                        )}>
                                            {selectedContacts.includes(id) && <CheckCircle2 size={14} className="text-white" />}
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>

                    <div className="p-4 bg-gray-50/50 border-t border-gray-50">
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest text-center">
                            {selectedContacts.length} Contacts Selected
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BroadcastPage;
