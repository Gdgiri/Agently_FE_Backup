import React from 'react';
import { NodeUpdateHandler } from './types';
import { Image as ImageIcon, Video, FileText, X, FlaskConical, Link } from 'lucide-react';

interface MediaBotReplyEditorProps {
    data: any;
    onUpdate: NodeUpdateHandler;
}

export const MediaBotReplyEditor: React.FC<MediaBotReplyEditorProps> = ({ data, onUpdate }) => {
    const headerTypes = [
        { id: 'none', label: 'None', icon: X },
        { id: 'image', label: 'Image', icon: ImageIcon },
        { id: 'video', label: 'Video', icon: Video },
        { id: 'document', label: 'Document', icon: FileText },
    ];

    const currentHeader = headerTypes.find(h => h.id === (data.headerType || 'image'));

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
            {/* Step Name */}
            <div className="space-y-3">
                <label className="text-[11px] font-black uppercase text-gray-400 tracking-[0.15em] flex items-center gap-2 px-1">
                    Name
                </label>
                <input
                    className="w-full px-6 py-4 bg-white border-2 border-gray-100 rounded-[1.8rem] text-sm font-bold focus:ring-8 focus:ring-green-500/5 focus:border-[#25D366] transition-all outline-none"
                    placeholder="e.g. Media Greeting"
                    value={data.label || ''}
                    onChange={(e) => onUpdate('label', e.target.value)}
                />
            </div>

            {/* Header Type Selector */}
            <div className="space-y-3">
                <label className="text-[11px] font-black uppercase text-gray-400 tracking-[0.15em] px-1">
                    Header Type
                </label>
                <div className="relative">
                    <select
                        className="w-full px-6 py-4 bg-white border-2 border-gray-100 rounded-[1.8rem] text-sm font-bold focus:ring-8 focus:ring-green-500/5 focus:border-[#25D366] transition-all outline-none appearance-none cursor-pointer"
                        value={data.headerType || 'image'}
                        onChange={(e) => onUpdate('headerType', e.target.value)}
                    >
                        {headerTypes.map(h => (
                            <option key={h.id} value={h.id}>{h.label}</option>
                        ))}
                    </select>
                    <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                        {currentHeader && <currentHeader.icon size={16} />}
                    </div>
                </div>
            </div>

            {/* Media Upload Area */}
            {data.headerType !== 'none' && (
                <div className="space-y-4">
                    <label className="text-[11px] font-black uppercase text-gray-400 tracking-[0.15em] px-1">
                        {data.headerType?.toUpperCase()} URL
                    </label>
                    <div className="p-8 bg-gray-50/50 border-2 border-dashed border-gray-200 rounded-[2.5rem] flex flex-col items-center justify-center gap-4 text-center group hover:border-[#25D366]/30 transition-all">
                        {data.mediaUrl ? (
                            <div className="relative w-full aspect-video rounded-2xl overflow-hidden border border-gray-100 bg-white">
                                {data.headerType === 'image' && <img src={data.mediaUrl} className="w-full h-full object-cover" alt="Preview" />}
                                {data.headerType === 'video' && <video src={data.mediaUrl} className="w-full h-full object-cover" />}
                                {data.headerType === 'document' && <div className="flex flex-col items-center justify-center h-full gap-2"><FileText size={48} className="text-gray-300" /><p className="text-[10px] font-bold text-gray-400">PDF Document Linked</p></div>}
                                <button
                                    onClick={() => onUpdate('mediaUrl', '')}
                                    className="absolute top-2 right-2 p-2 bg-black/50 text-white rounded-full hover:bg-black/70 transition-all"
                                >
                                    <X size={14} />
                                </button>
                            </div>
                        ) : (
                            <>
                                <div className="p-4 bg-white border border-gray-100 rounded-3xl text-gray-400 shadow-sm group-hover:scale-110 transition-all duration-500">
                                    <Link size={24} />
                                </div>
                                <div>
                                    <p className="text-xs font-black text-gray-800">No media linked</p>
                                    <p className="text-[10px] font-bold text-gray-400 mt-1">Paste a direct URL below</p>
                                </div>
                            </>
                        )}
                    </div>
                    <input
                        className="w-full px-6 py-4 bg-white border-2 border-gray-100 rounded-[1.8rem] text-sm font-bold focus:ring-8 focus:ring-green-500/5 focus:border-[#25D366] transition-all outline-none"
                        placeholder={`https://example.com/file.${data.headerType === 'video' ? 'mp4' : 'jpg'}`}
                        value={data.mediaUrl || ''}
                        onChange={(e) => onUpdate('mediaUrl', e.target.value)}
                    />
                </div>
            )}

            {/* Caption (Standard Textarea) */}
            <div className="space-y-4">
                <label className="text-[11px] font-black uppercase text-gray-400 tracking-[0.15em] px-1">
                    Caption (Optional)
                </label>
                <textarea
                    className="w-full px-6 py-5 bg-white border-2 border-gray-100 rounded-[2rem] text-sm font-bold min-h-[100px] focus:ring-8 focus:ring-green-500/5 focus:border-[#25D366] transition-all outline-none leading-relaxed resize-none"
                    placeholder="Add a caption to your media..."
                    value={data.caption || ''}
                    onChange={(e) => onUpdate('caption', e.target.value)}
                />
            </div>

            {/* Validation Toggle */}
            <div className="flex items-center justify-between p-6 bg-white border-2 border-gray-100 rounded-[2rem]">
                <div className="flex items-center gap-3">
                    <div className="p-3 bg-gray-50 rounded-2xl text-gray-400">
                        <FlaskConical size={18} />
                    </div>
                    <div>
                        <p className="text-xs font-black text-gray-800">Validate Bot Reply</p>
                        <p className="text-[10px] font-bold text-gray-400">Send a test message to your number</p>
                    </div>
                </div>
                <button
                    onClick={() => onUpdate('validate', !data.validate)}
                    className={`w-12 h-6 rounded-full transition-all relative ${data.validate ? 'bg-[#25D366]' : 'bg-gray-200'}`}
                >
                    <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${data.validate ? 'left-7' : 'left-1'}`} />
                </button>
            </div>
        </div>
    );
};
