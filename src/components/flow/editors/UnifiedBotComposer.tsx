import React, { useState, useRef } from 'react';
import { NodeUpdateHandler } from './types';
import {
    MessageSquare, Image as ImageIcon, Video, FileText,
    MousePointerClick, List, Plus, Trash2, FlaskConical,
    Layout, Type, Info, Check, ChevronDown,
    Upload, Loader2, Link as LinkIcon, XCircle,
    Hash, Type as TypeIcon, Smile, Settings2,
    Search, Star, Heart, Bell, ShoppingCart,
    Gift, Phone, User, Home, MapPin
} from 'lucide-react';
import { mediaApi } from '../../../lib/api/mediaApi';
import toast from 'react-hot-toast';

interface UnifiedBotComposerProps {
    data: any;
    onUpdate: NodeUpdateHandler;
}

const AVAILABLE_ICONS = [
    { name: 'Star', icon: Star },
    { name: 'Heart', icon: Heart },
    { name: 'Bell', icon: Bell },
    { name: 'Cart', icon: ShoppingCart },
    { name: 'Gift', icon: Gift },
    { name: 'Phone', icon: Phone },
    { name: 'User', icon: User },
    { name: 'Home', icon: Home },
    { name: 'Map', icon: MapPin },
    { name: 'Info', icon: Info },
];

export const UnifiedBotComposer: React.FC<UnifiedBotComposerProps> = ({ data, onUpdate }) => {
    const variables = ['{first_name}', '{last_name}', '{full_name}', '{phone_number}'];
    const [isUploading, setIsUploading] = useState(false);
    const [showUrlInput, setShowUrlInput] = useState(false);
    const [activeIconPicker, setActiveIconPicker] = useState<{ sIdx: number, rIdx: number } | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Node type detection for adaptive UI
    const isSimple = data.type === 'action' && data.actionType === 'text' && !data.showButtons;
    const isMedia = data.type === 'action' && data.actionType === 'media';
    const isInteractive = data.type === 'interaction' || data.interactionType || data.showButtons;

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        const toastId = toast.loading(`Uploading ${file.name}...`);
        try {
            const result = await mediaApi.upload(file);
            if (result.data.success) {
                onUpdate('mediaUrl', result.data.data.url);
                toast.success('Uploaded successfully', { id: toastId });
            } else {
                toast.error('Upload failed', { id: toastId });
            }
        } catch (error) {
            console.error('Upload error:', error);
            toast.error('Server error during upload', { id: toastId });
        } finally {
            setIsUploading(false);
        }
    };

    const toggleSection = (section: string) => {
        const sectionKey = `show${section}`;
        const current = data[sectionKey];
        const updates: Record<string, any> = { [sectionKey]: !current };

        // Set default types when enabling
        if (!current) {
            if (section === 'Header' && !data.headerType) updates.headerType = 'TEXT';
            if (section === 'Buttons' && !data.interactionType) updates.interactionType = 'BUTTONS';
        }

        onUpdate(updates);
    };

    const interactionType = data.interactionType || 'BUTTONS';

    // List Editor Logic
    const sections = data.sections || [];
    const selectionStyle = data.selectionStyle || 'RADIO';
    const indexStyle = data.indexStyle || 'NUMBER';

    const handleAddSection = () => {
        if (sections.length >= 10) {
            toast.error('Maximum 10 sections allowed');
            return;
        }
        const newSections = [...sections, { title: 'New Section', rows: [{ id: Date.now().toString(), title: 'New Option', description: '' }] }];
        onUpdate('sections', newSections);
    };

    const handleUpdateRow = (sIdx: number, rIdx: number, field: string, value: any) => {
        const newSections = [...sections];
        newSections[sIdx].rows[rIdx] = { ...newSections[sIdx].rows[rIdx], [field]: value };
        onUpdate('sections', newSections);
    };

    const handleAddRow = (sIdx: number) => {
        const totalRows = sections.reduce((acc: number, s: any) => acc + s.rows.length, 0);
        if (totalRows >= 10) {
            toast.error('Total rows cannot exceed 10 (WhatsApp limit)');
            return;
        }
        const newSections = [...sections];
        newSections[sIdx].rows.push({ id: Date.now().toString(), title: 'New Option', description: '' });
        onUpdate('sections', newSections);
    };

    const handleRemoveRow = (sIdx: number, rIdx: number) => {
        const newSections = [...sections];
        newSections[sIdx].rows = newSections[sIdx].rows.filter((_: any, i: number) => i !== rIdx);
        onUpdate('sections', newSections);
    };

    const handleRemoveSection = (sIdx: number) => {
        const newSections = sections.filter((_: any, i: number) => i !== sIdx);
        onUpdate('sections', newSections);
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300 pb-20">
            {/* Step Name */}
            <div className="space-y-3">
                <label className="text-[11px] font-black uppercase text-gray-400 tracking-[0.15em] px-1">Step Name</label>
                <input
                    className="w-full px-6 py-4 bg-white border-2 border-gray-100 rounded-[1.8rem] text-sm font-bold focus:ring-8 focus:ring-green-500/5 focus:border-green-500 transition-all outline-none"
                    placeholder="e.g. Welcome Message"
                    value={data.label || ''}
                    onChange={(e) => onUpdate('label', e.target.value)}
                />
            </div>

            {/* Section Toggles (Only show for Interactive nodes) */}
            {isInteractive && !isSimple && !isMedia && (
                <div className="flex gap-2 p-1.5 bg-gray-50 rounded-[2rem] border border-gray-100 mb-8">
                    {['Header', 'Footer', 'Buttons'].map(section => (
                        <button
                            key={section}
                            onClick={() => toggleSection(section)}
                            className={`flex-1 py-3 rounded-[1.5rem] text-[10px] font-black uppercase transition-all flex items-center justify-center gap-2 ${data[`show${section}`]
                                ? 'bg-white text-green-600 shadow-sm border border-gray-100'
                                : 'text-gray-400 hover:text-gray-600'
                                }`}
                        >
                            {data[`show${section}`] ? <Check size={12} /> : <Plus size={12} />}
                            {section}
                        </button>
                    ))}
                </div>
            )}

            {/* 1. HEADER SECTION */}
            {(data.showHeader || isMedia) && (
                <div className="space-y-4 p-6 bg-gray-50/50 rounded-[2.5rem] border border-gray-100 animate-in zoom-in-95">
                    <div className="flex items-center justify-between mb-2 px-1">
                        <label className="text-[11px] font-black uppercase text-gray-400 tracking-[0.15em]">Header Content</label>
                        <select
                            className="bg-transparent text-[11px] font-black text-gray-600 outline-none cursor-pointer"
                            value={data.headerType || 'TEXT'}
                            onChange={(e) => onUpdate('headerType', e.target.value)}
                        >
                            <option value="TEXT">TEXT</option>
                            <option value="IMAGE">IMAGE</option>
                            <option value="VIDEO">VIDEO</option>
                            <option value="DOCUMENT">DOCUMENT</option>
                        </select>
                    </div>

                    {data.headerType === 'TEXT' ? (
                        <input
                            className="w-full px-6 py-4 bg-white border-2 border-gray-100 rounded-[1.5rem] text-sm font-bold outline-none"
                            placeholder="Header Title Text"
                            value={data.headerText || ''}
                            onChange={(e) => onUpdate('headerText', e.target.value)}
                        />
                    ) : (
                        <div className="space-y-4">
                            {showUrlInput && !data.mediaUrl ? (
                                <div className="space-y-3 p-4 bg-white border-2 border-gray-100 rounded-[2rem] relative group animate-in slide-in-from-top-2">
                                    <div className="flex items-center justify-between px-2">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Media Link</label>
                                        <button
                                            onClick={() => setShowUrlInput(false)}
                                            className="p-1 hover:bg-gray-50 rounded-lg text-gray-300 hover:text-red-500 transition-colors"
                                        >
                                            <XCircle size={14} />
                                        </button>
                                    </div>
                                    <input
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-[1.25rem] text-xs font-bold outline-none focus:bg-white focus:border-green-500 transition-all"
                                        placeholder={`Paste ${data.headerType} URL here...`}
                                        value={data.mediaUrl || ''}
                                        onChange={(e) => onUpdate('mediaUrl', e.target.value)}
                                    />
                                    <button
                                        onClick={() => setShowUrlInput(false)}
                                        className="text-[10px] font-black text-green-600 hover:underline px-2 flex items-center gap-1.5"
                                    >
                                        <Upload size={12} /> Switch to Upload
                                    </button>
                                </div>
                            ) : !data.mediaUrl ? (
                                <div
                                    onClick={() => fileInputRef.current?.click()}
                                    className="h-32 border-2 border-dashed border-gray-100 rounded-[2rem] flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-green-500 hover:bg-green-50/50 group transition-all relative"
                                >
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        className="hidden"
                                        onChange={handleFileUpload}
                                        accept={data.headerType === 'IMAGE' ? 'image/*' : data.headerType === 'VIDEO' ? 'video/*' : '*'}
                                    />
                                    {isUploading ? (
                                        <Loader2 className="animate-spin text-green-500" size={24} />
                                    ) : (
                                        <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-green-100 group-hover:text-green-600 transition-all shadow-sm">
                                            <Upload size={20} />
                                        </div>
                                    )}
                                    <div className="text-center px-4">
                                        <p className="text-xs font-black text-gray-800">Choose {data.headerType}</p>
                                        <p className="text-[10px] font-bold text-gray-400 mt-1 uppercase tracking-tighter">MAX SIZE 16MB • TAP TO UPLOAD</p>
                                    </div>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setShowUrlInput(true);
                                        }}
                                        className="absolute bottom-4 right-4 p-2 bg-white/80 backdrop-blur shadow-sm border border-gray-100 rounded-xl text-gray-400 hover:text-green-600 transition-all"
                                        title="Use URL instead"
                                    >
                                        <LinkIcon size={14} />
                                    </button>
                                </div>
                            ) : (
                                <div className="aspect-video bg-white rounded-[2rem] border-2 border-gray-100 flex items-center justify-center overflow-hidden shadow-sm relative group animate-in zoom-in-95 duration-300">
                                    {data.headerType === 'IMAGE' && <img src={data.mediaUrl} alt="Preview" className="w-full h-full object-cover" />}
                                    {data.headerType === 'VIDEO' && <video src={data.mediaUrl} className="w-full h-full object-cover" controls />}
                                    {data.headerType === 'DOCUMENT' && (
                                        <div className="flex flex-col items-center gap-3">
                                            <FileText size={48} className="text-green-500" />
                                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.15em]">Document Preview Not Supported</p>
                                        </div>
                                    )}
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                        <button
                                            onClick={() => onUpdate('mediaUrl', '')}
                                            className="p-3 bg-red-500 text-white rounded-2xl hover:bg-red-600 transition-colors shadow-lg shadow-red-500/30"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                        <button
                                            onClick={() => fileInputRef.current?.click()}
                                            className="p-3 bg-white text-gray-900 rounded-2xl hover:bg-gray-100 transition-colors shadow-lg shadow-black/10"
                                        >
                                            <Upload size={16} />
                                        </button>
                                    </div>
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        className="hidden"
                                        onChange={handleFileUpload}
                                        accept={data.headerType === 'IMAGE' ? 'image/*' : data.headerType === 'VIDEO' ? 'video/*' : '*'}
                                    />
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}

            {/* 2. BODY SECTION (Always Visible - Labeled as Body or Description) */}
            <div className="space-y-4">
                <label className="text-[11px] font-black uppercase text-gray-400 tracking-[0.15em] px-1">
                    {isSimple || isMedia ? 'Description / Body' : 'Message Body'}
                </label>
                <div className="relative group">
                    <textarea
                        className="w-full px-6 py-6 bg-white border-2 border-gray-100 rounded-[2.5rem] text-sm font-bold min-h-[140px] focus:ring-8 focus:ring-green-500/5 focus:border-green-500 transition-all outline-none resize-none leading-relaxed"
                        placeholder="Write your message here..."
                        value={data.messageText || ''}
                        onChange={(e) => onUpdate('messageText', e.target.value)}
                    />
                    <div className="absolute bottom-6 right-6 flex items-center gap-2">
                        <span className="text-[10px] font-bold text-gray-300">{(data.messageText || '').length}/1024</span>
                    </div>
                </div>

                {/* Variable Badges */}
                <div className="flex flex-wrap gap-1.5">
                    {variables.map(v => (
                        <button
                            key={v}
                            onClick={() => onUpdate('messageText', (data.messageText || '') + ' ' + v)}
                            className="px-3 py-1.5 bg-gray-50 text-gray-500 rounded-full text-[10px] font-bold border border-gray-100 hover:bg-gray-100 transition-colors"
                        >
                            {v}
                        </button>
                    ))}
                </div>
            </div>

            {/* 3. FOOTER SECTION */}
            {data.showFooter && isInteractive && (
                <div className="space-y-3 animate-in fade-in slide-in-from-top-2">
                    <label className="text-[11px] font-black uppercase text-gray-400 tracking-[0.15em] px-1">Footer Text</label>
                    <input
                        className="w-full px-6 py-4 bg-white border-2 border-gray-100 rounded-[1.8rem] text-sm font-bold outline-none"
                        placeholder="e.g. Push button below to continue"
                        value={data.footerText || ''}
                        onChange={(e) => onUpdate('footerText', e.target.value)}
                    />
                </div>
            )}

            {/* 4. BUTTONS / LIST SECTION */}
            {data.showButtons && isInteractive && (
                <div className="space-y-6 animate-in slide-in-from-bottom-2">
                    <div className="flex bg-gray-50 p-1.5 rounded-[2rem] gap-1">
                        {['BUTTONS', 'CTA', 'LIST'].map(bType => (
                            <button
                                key={bType}
                                onClick={() => onUpdate('interactionType', bType)}
                                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-[1.5rem] text-[10px] font-black uppercase transition-all ${interactionType === bType
                                    ? 'bg-white text-green-600 shadow-sm border border-gray-100'
                                    : 'text-gray-400 hover:text-gray-600'
                                    }`}
                            >
                                {bType === 'BUTTONS' ? <MousePointerClick size={14} /> : bType === 'CTA' ? <LinkIcon size={14} /> : <List size={14} />}
                                {bType === 'BUTTONS' ? 'Reply Buttons' : bType === 'CTA' ? 'CTA URL' : 'List Menu'}
                            </button>
                        ))}
                    </div>

                    {interactionType === 'BUTTONS' ? (
                        <div className="space-y-3">
                            {(data.buttons || []).map((btn: any, idx: number) => (
                                <div key={idx} className="space-y-2">
                                    <div className="group relative">
                                        <input
                                            className="w-full pl-6 pr-12 py-4 bg-white border-2 border-gray-100 rounded-[1.5rem] text-sm font-bold focus:border-green-500 transition-all outline-none"
                                            placeholder="Button Title"
                                            value={btn.title}
                                            onChange={(e) => {
                                                const newBtns = [...data.buttons];
                                                newBtns[idx] = { ...newBtns[idx], title: e.target.value };
                                                onUpdate('buttons', newBtns);
                                            }}
                                            maxLength={24}
                                        />
                                        <button
                                            onClick={() => onUpdate('buttons', data.buttons.filter((_: any, i: number) => i !== idx))}
                                            className="absolute right-4 top-1/2 -translate-y-1/2 p-2 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                    <div className="px-2">
                                        <div className="relative group">
                                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-green-500">
                                                <LinkIcon size={12} />
                                            </div>
                                            <input
                                                className="w-full pl-10 pr-4 py-2 bg-gray-50/50 border border-gray-100 rounded-xl text-[10px] font-bold focus:bg-white focus:border-green-200 transition-all outline-none"
                                                placeholder="Website URL (Optional)"
                                                value={btn.url || ''}
                                                onChange={(e) => {
                                                    const newBtns = [...data.buttons];
                                                    newBtns[idx] = { ...newBtns[idx], url: e.target.value };
                                                    onUpdate('buttons', newBtns);
                                                }}
                                            />
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {(data.buttons || []).length < 3 && (
                                <button
                                    onClick={() => onUpdate('buttons', [...(data.buttons || []), { id: Date.now().toString(), title: 'New Button' }])}
                                    className="w-full py-4 border-2 border-dashed border-gray-200 rounded-[1.5rem] text-[10px] font-black uppercase text-gray-400 hover:border-gray-300 hover:text-gray-600"
                                >
                                    + Add Button ({(data.buttons || []).length}/3)
                                </button>
                            )}

                            {/* Meta Limitation Notice */}
                            {data.buttons?.some((b: any) => b.url) && (
                                <div className="p-4 bg-amber-50 rounded-2xl border border-amber-100 space-y-1">
                                    <div className="flex items-center gap-2 text-amber-600">
                                        <FlaskConical size={12} />
                                        <span className="text-[9px] font-black uppercase tracking-wider">Meta Restriction</span>
                                    </div>
                                    <p className="text-[9px] font-bold text-amber-700/80 leading-tight">
                                        When a URL is set, Meta only supports **ONE** button.
                                    </p>
                                </div>
                            )}
                        </div>
                    ) : interactionType === 'CTA' ? (
                        <div className="space-y-4 p-6 bg-gray-50/50 rounded-[2rem] border border-gray-100 animate-in slide-in-from-top-2">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest px-1">Button Label</label>
                                <input
                                    className="w-full px-6 py-4 bg-white border-2 border-gray-100 rounded-[1.5rem] text-sm font-bold outline-none focus:border-green-500 transition-all"
                                    placeholder="e.g. Visit Shop"
                                    value={data.ctaLabel || ''}
                                    onChange={(e) => onUpdate('ctaLabel', e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest px-1">Website URL</label>
                                <div className="relative">
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300">
                                        <LinkIcon size={14} />
                                    </div>
                                    <input
                                        className="w-full pl-12 pr-6 py-4 bg-white border-2 border-gray-100 rounded-[1.5rem] text-sm font-bold outline-none focus:border-green-500 transition-all"
                                        placeholder="https://example.com"
                                        value={data.ctaUrl || ''}
                                        onChange={(e) => onUpdate('ctaUrl', e.target.value)}
                                    />
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {/* List Global Config */}
                            <div className="grid grid-cols-2 gap-3 p-4 bg-gray-50 rounded-[2rem] border border-gray-100">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-2">Selection</label>
                                    <div className="flex bg-white p-1 rounded-full border border-gray-100">
                                        {['RADIO', 'CHECKBOX'].map(s => (
                                            <button
                                                key={s}
                                                onClick={() => onUpdate('selectionStyle', s)}
                                                className={`flex-1 py-1.5 rounded-full text-[9px] font-black transition-all ${selectionStyle === s ? 'bg-green-500 text-white shadow-sm' : 'text-gray-400'}`}
                                            >
                                                {s}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-2">Index</label>
                                    <select
                                        className="w-full bg-white px-3 py-2 rounded-full border border-gray-100 text-[10px] font-black text-gray-600 outline-none"
                                        value={indexStyle}
                                        onChange={(e) => onUpdate('indexStyle', e.target.value)}
                                    >
                                        <option value="NONE">NONE</option>
                                        <option value="NUMBER">1, 2, 3</option>
                                        <option value="ALPHA">A, B, C</option>
                                        <option value="ICON">ICONS</option>
                                    </select>
                                </div>
                            </div>

                            {/* List Sections */}
                            <div className="space-y-6">
                                {sections.map((section: any, sIdx: number) => (
                                    <div key={sIdx} className="p-6 bg-gray-50/50 rounded-[2.5rem] border border-gray-100 space-y-4 animate-in zoom-in-95">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-white border border-gray-100 flex items-center justify-center text-[10px] font-black text-gray-400">
                                                {sIdx + 1}
                                            </div>
                                            <input
                                                className="flex-1 bg-transparent text-sm font-black text-gray-800 outline-none placeholder:text-gray-300"
                                                placeholder="Section Title"
                                                value={section.title}
                                                onChange={(e) => {
                                                    const newSections = [...sections];
                                                    newSections[sIdx].title = e.target.value;
                                                    onUpdate('sections', newSections);
                                                }}
                                                maxLength={24}
                                            />
                                            <button onClick={() => handleRemoveSection(sIdx)} className="text-gray-300 hover:text-red-500 transition-colors">
                                                <Trash2 size={16} />
                                            </button>
                                        </div>

                                        <div className="space-y-3">
                                            {section.rows.map((row: any, rIdx: number) => (
                                                <div key={row.id} className="relative group bg-white p-4 rounded-[1.5rem] border border-gray-100 shadow-sm hover:border-green-500 transition-all">
                                                    <div className="flex items-start gap-4">
                                                        <div className="mt-1 flex flex-col items-center gap-2">
                                                            {selectionStyle === 'RADIO' ? (
                                                                <div className="w-4 h-4 rounded-full border-2 border-gray-200 flex items-center justify-center">
                                                                    <div className="w-2 h-2 rounded-full bg-green-500 scale-0 group-hover:scale-100 transition-transform" />
                                                                </div>
                                                            ) : (
                                                                <div className="w-4 h-4 rounded border-2 border-gray-200 flex items-center justify-center">
                                                                    <Check size={10} className="text-green-500 scale-0 group-hover:scale-100 transition-transform" />
                                                                </div>
                                                            )}

                                                            {indexStyle === 'ICON' && (
                                                                <button
                                                                    onClick={() => setActiveIconPicker(activeIconPicker?.sIdx === sIdx && activeIconPicker?.rIdx === rIdx ? null : { sIdx, rIdx })}
                                                                    className="w-6 h-6 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center hover:bg-green-50 transition-colors"
                                                                >
                                                                    {(() => {
                                                                        const IconComp = AVAILABLE_ICONS.find(i => i.name === row.icon)?.icon || Smile;
                                                                        return <IconComp size={12} className="text-gray-400" />;
                                                                    })()}
                                                                </button>
                                                            )}
                                                        </div>

                                                        <div className="flex-1 space-y-1">
                                                            <div className="flex items-center gap-2">
                                                                {indexStyle === 'NUMBER' && <span className="text-[10px] font-black text-green-600">{rIdx + 1}.</span>}
                                                                {indexStyle === 'ALPHA' && <span className="text-[10px] font-black text-green-600">{String.fromCharCode(65 + rIdx)}.</span>}
                                                                <input
                                                                    className="w-full text-xs font-bold text-gray-800 outline-none placeholder:text-gray-300"
                                                                    placeholder="Option Title"
                                                                    value={row.title}
                                                                    onChange={(e) => handleUpdateRow(sIdx, rIdx, 'title', e.target.value)}
                                                                    maxLength={24}
                                                                />
                                                            </div>
                                                            <input
                                                                className="w-full text-[10px] font-bold text-gray-400 outline-none placeholder:text-gray-200"
                                                                placeholder="Optional description"
                                                                value={row.description}
                                                                onChange={(e) => handleUpdateRow(sIdx, rIdx, 'description', e.target.value)}
                                                                maxLength={72}
                                                            />
                                                        </div>

                                                        {/* Icon Picker Popover */}
                                                        {activeIconPicker?.sIdx === sIdx && activeIconPicker?.rIdx === rIdx && (
                                                            <div className="absolute right-12 top-0 z-50 bg-white border border-gray-200 rounded-[1.5rem] shadow-2xl p-3 grid grid-cols-4 gap-2 animate-in zoom-in-95">
                                                                {AVAILABLE_ICONS.map(i => (
                                                                    <button
                                                                        key={i.name}
                                                                        onClick={() => {
                                                                            handleUpdateRow(sIdx, rIdx, 'icon', i.name);
                                                                            setActiveIconPicker(null);
                                                                        }}
                                                                        className="p-2 hover:bg-gray-50 rounded-xl transition-colors text-gray-400 hover:text-green-600"
                                                                    >
                                                                        <i.icon size={16} />
                                                                    </button>
                                                                ))}
                                                            </div>
                                                        )}

                                                        <button
                                                            onClick={() => handleRemoveRow(sIdx, rIdx)}
                                                            className="text-gray-200 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all p-1"
                                                        >
                                                            <Trash2 size={12} />
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                            <button
                                                onClick={() => handleAddRow(sIdx)}
                                                className="w-full py-3 border-2 border-dashed border-gray-100 rounded-[1.5rem] text-[10px] font-black uppercase text-gray-400 hover:border-gray-200 hover:text-green-600 transition-all flex items-center justify-center gap-2"
                                            >
                                                <Plus size={12} /> Add Row
                                            </button>
                                        </div>
                                    </div>
                                ))}

                                <button
                                    onClick={handleAddSection}
                                    className="w-full py-5 bg-white border-2 border-gray-100 rounded-[2.5rem] text-[11px] font-black uppercase text-gray-500 hover:border-green-500 hover:text-green-600 transition-all shadow-sm flex items-center justify-center gap-2 group"
                                >
                                    <div className="w-6 h-6 rounded-full bg-gray-50 flex items-center justify-center group-hover:bg-green-50 transition-colors">
                                        <Plus size={14} />
                                    </div>
                                    Add New Section
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Validation Toggle */}
            <div className="flex items-center justify-between p-6 bg-white border-2 border-gray-100 rounded-[2rem] mt-4">
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
