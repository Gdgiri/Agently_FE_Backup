
import React, { useState, useEffect } from 'react';
import {
    Plus,
    X,
    ChevronDown,
    GripVertical,
    Trash2,
    Copy,
    Settings,
    Search,
    Eye,
    Code,
    Phone,
    Monitor,
    Smartphone,
    Layout,
    Type,
    CheckSquare,
    ChevronRight,
    MousePointer2,
    Calendar as CalendarIcon,
    ArrowLeft
} from 'lucide-react';
import { cn, Card, Button, Input, Badge } from '../components/ui';
import { motion, AnimatePresence, Reorder } from 'framer-motion';
import toast from 'react-hot-toast';

interface FlowComponent {
    id: string;
    type: 'header' | 'footer' | 'text' | 'text_input' | 'text_area' | 'checkbox' | 'radio' | 'dropdown' | 'date_picker' | 'button';
    label: string;
    placeholder?: string;
    required?: boolean;
    options?: { label: string; value: string }[];
    content?: string;
}

interface FlowScreen {
    id: string;
    title: string;
    components: FlowComponent[];
}

const WhatsAppFlowDesigner: React.FC = () => {
    const [screens, setScreens] = useState<FlowScreen[]>([
        {
            id: 'SCREEN_1',
            title: 'Welcome Screen',
            components: [
                { id: 'c1', type: 'header', label: 'Welcome to our service' },
                { id: 'c2', type: 'text', label: 'Please provide your details below.' },
                { id: 'c3', type: 'text_input', label: 'Full Name', placeholder: 'Enter your name', required: true },
                { id: 'c4', type: 'button', label: 'Continue' }
            ]
        }
    ]);

    const [selectedScreenId, setSelectedScreenId] = useState<string>('SCREEN_1');
    const [selectedComponentId, setSelectedComponentId] = useState<string | null>(null);
    const [isAddingComponent, setIsAddingComponent] = useState(false);
    const [viewMode, setViewMode] = useState<'preview' | 'json'>('preview');

    const selectedScreen = screens.find(s => s.id === selectedScreenId) || screens[0];

    // Helper to add a new screen
    const addScreen = () => {
        const id = `SCREEN_${screens.length + 1}`;
        const newScreen: FlowScreen = {
            id,
            title: `New Screen ${screens.length + 1}`,
            components: []
        };
        setScreens([...screens, newScreen]);
        setSelectedScreenId(id);
    };

    // Helper to add a component to current screen
    const addComponent = (type: FlowComponent['type']) => {
        const newComp: FlowComponent = {
            id: `c_${Date.now()}`,
            type,
            label: type.charAt(0).toUpperCase() + type.slice(1).replace('_', ' '),
            placeholder: type.includes('input') ? 'Enter text...' : undefined
        };

        setScreens(screens.map(s => {
            if (s.id === selectedScreenId) {
                return { ...s, components: [...s.components, newComp] };
            }
            return s;
        }));
        setIsAddingComponent(false);
    };

    // Helper to update component data
    const updateComponent = (compId: string, updates: Partial<FlowComponent>) => {
        setScreens(screens.map(s => {
            if (s.id === selectedScreenId) {
                return {
                    ...s,
                    components: s.components.map(c => c.id === compId ? { ...c, ...updates } : c)
                };
            }
            return s;
        }));
    };

    // Export JSON (Meta Format)
    const exportJSON = () => {
        const flowJSON = {
            version: "2.1",
            screens: screens.map(s => ({
                id: s.id,
                title: s.title,
                children: s.components.map(c => {
                    const base: any = { type: c.type, label: c.label };
                    if (c.placeholder) base.placeholder = c.placeholder;
                    if (c.required) base.required = true;
                    if (c.options) base.options = c.options;
                    return base;
                })
            }))
        };
        return JSON.stringify(flowJSON, null, 2);
    };

    return (
        <div className="h-screen flex flex-col bg-white overflow-hidden">
            {/* Header */}
            <header className="h-16 border-b border-gray-100 flex items-center justify-between px-6 shrink-0 bg-white z-20">
                <div className="flex items-center gap-4">
                    <button onClick={() => window.history.back()} className="p-2 hover:bg-gray-50 rounded-xl transition-all text-gray-400">
                        <ArrowLeft size={20} />
                    </button>
                    <div className="h-8 w-px bg-gray-100 mx-2" />
                    <div>
                        <h1 className="text-lg font-black text-gray-900 leading-none tracking-tight">Flow Designer</h1>
                        <p className="text-[10px] font-black text-[#25D366] uppercase tracking-[0.2em] mt-1.5 flex items-center gap-1.5">
                            <div className="w-1.5 h-1.5 bg-[#25D366] rounded-full animate-pulse" /> Meta Interactive Playground
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <div className="flex bg-gray-100 p-1 rounded-2xl mr-4">
                        <button
                            onClick={() => setViewMode('preview')}
                            className={cn("px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all", viewMode === 'preview' ? "bg-white text-gray-900 shadow-sm" : "text-gray-400")}
                        >
                            <Eye size={14} className="inline mr-2" /> Preview
                        </button>
                        <button
                            onClick={() => setViewMode('json')}
                            className={cn("px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all", viewMode === 'json' ? "bg-white text-gray-900 shadow-sm" : "text-gray-400")}
                        >
                            <Code size={14} className="inline mr-2" /> JSON
                        </button>
                    </div>
                    <Button
                        variant="secondary"
                        size="sm"
                        className="rounded-2xl gap-2 font-black"
                        onClick={() => {
                            navigator.clipboard.writeText(exportJSON());
                            toast.success("JSON copied to clipboard");
                        }}
                    >
                        <Copy size={16} /> Copy Flow JSON
                    </Button>
                    <Button size="sm" className="rounded-2xl gap-2">
                        <Settings size={16} /> <ChevronDown size={14} />
                    </Button>
                </div>
            </header>

            <div className="flex-1 flex overflow-hidden">
                {/* Left Panel: Screens & Components */}
                <aside className="w-[450px] border-r border-gray-100 flex flex-col bg-white overflow-y-auto">
                    <div className="p-8 space-y-10">
                        {/* Screens List Section */}
                        <section className="space-y-4">
                            <div className="flex items-center justify-between">
                                <h4 className="text-[11px] font-black text-gray-900 uppercase tracking-[0.2em]">Screens</h4>
                            </div>
                            <div className="space-y-2">
                                <Reorder.Group axis="y" values={screens} onReorder={setScreens} className="space-y-2">
                                    {screens.map(screen => (
                                        <Reorder.Item
                                            key={screen.id}
                                            value={screen}
                                            className={cn(
                                                "p-4 rounded-2xl border-2 transition-all flex items-center justify-between group",
                                                selectedScreenId === screen.id
                                                    ? "border-[#25D366] bg-green-50/20"
                                                    : "border-gray-50 hover:border-gray-100 bg-gray-50/30"
                                            )}
                                            onClick={() => setSelectedScreenId(screen.id)}
                                        >
                                            <div className="flex items-center gap-3">
                                                <GripVertical size={14} className="text-gray-300 cursor-grab" />
                                                <span className="text-xs font-bold text-gray-900">{screen.title}</span>
                                            </div>
                                            <button
                                                className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-red-500 transition-all"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    if (screens.length > 1) {
                                                        setScreens(screens.filter(s => s.id !== screen.id));
                                                        if (selectedScreenId === screen.id) setSelectedScreenId(screens[0].id);
                                                    }
                                                }}
                                            >
                                                <X size={16} />
                                            </button>
                                        </Reorder.Item>
                                    ))}
                                </Reorder.Group>
                                <button
                                    onClick={addScreen}
                                    className="w-full p-4 border-2 border-dashed border-gray-100 rounded-2xl text-[10px] font-black uppercase tracking-widest text-[#25D366] hover:bg-green-50 transition-all"
                                >
                                    + Add new
                                </button>
                            </div>
                        </section>

                        <div className="h-px bg-gray-100" />

                        {/* Edit Content Section */}
                        <section className="space-y-6">
                            <h4 className="text-[11px] font-black text-gray-900 uppercase tracking-[0.2em]">Edit content</h4>

                            {/* Screen Title Accordion-like structure */}
                            <div className="space-y-4">
                                <div className="p-6 bg-blue-50/30 rounded-3xl border border-blue-100">
                                    <div className="flex items-center justify-between mb-4">
                                        <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Screen title</span>
                                        <ChevronDown size={14} className="text-blue-400" />
                                    </div>
                                    <input
                                        className="w-full px-4 py-3 bg-white border border-blue-100 rounded-2xl text-sm font-bold focus:ring-4 focus:ring-blue-500/5 focus:border-blue-400 outline-none transition-all"
                                        value={selectedScreen.title}
                                        onChange={(e) => {
                                            setScreens(screens.map(s => s.id === selectedScreenId ? { ...s, title: e.target.value } : s));
                                        }}
                                    />
                                </div>

                                {/* Components List */}
                                <Reorder.Group axis="y" values={selectedScreen.components} onReorder={(comps) => setScreens(screens.map(s => s.id === selectedScreenId ? { ...s, components: comps } : s))} className="space-y-2">
                                    {selectedScreen.components.map((comp) => (
                                        <div key={comp.id} className="space-y-2 group">
                                            <div className={cn(
                                                "p-4 bg-white border border-gray-100 rounded-2xl flex items-center justify-between hover:border-gray-300 transition-all",
                                                selectedComponentId === comp.id ? "ring-2 ring-gray-900 shadow-lg" : ""
                                            )} onClick={() => setSelectedComponentId(selectedComponentId === comp.id ? null : comp.id)}>
                                                <div className="flex items-center gap-3">
                                                    <GripVertical size={14} className="text-gray-300" />
                                                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{comp.type.replace('_', ' ')}</span>
                                                    <span className="text-[10px] text-gray-300">•</span>
                                                    <span className="text-xs font-bold text-gray-900 truncate max-w-[150px]">{comp.label}</span>
                                                </div>
                                                <ChevronDown size={14} className={cn("text-gray-400 transition-transform", selectedComponentId === comp.id ? "rotate-180" : "")} />
                                            </div>

                                            <AnimatePresence>
                                                {selectedComponentId === comp.id && (
                                                    <motion.div
                                                        initial={{ height: 0, opacity: 0 }}
                                                        animate={{ height: 'auto', opacity: 1 }}
                                                        exit={{ height: 0, opacity: 0 }}
                                                        className="overflow-hidden"
                                                    >
                                                        <div className="p-6 bg-gray-50 rounded-[2rem] border border-gray-100 space-y-4">
                                                            <div className="space-y-1">
                                                                <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest pl-1">Label</label>
                                                                <input
                                                                    className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-bold outline-none"
                                                                    value={comp.label}
                                                                    onChange={(e) => updateComponent(comp.id, { label: e.target.value })}
                                                                />
                                                            </div>
                                                            {comp.placeholder !== undefined && (
                                                                <div className="space-y-1">
                                                                    <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest pl-1">Placeholder</label>
                                                                    <input
                                                                        className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-bold outline-none"
                                                                        value={comp.placeholder}
                                                                        onChange={(e) => updateComponent(comp.id, { placeholder: e.target.value })}
                                                                    />
                                                                </div>
                                                            )}
                                                            <div className="flex items-center gap-2 pt-2">
                                                                <button
                                                                    onClick={() => {
                                                                        setScreens(screens.map(s => s.id === selectedScreenId ? { ...s, components: s.components.filter(c => c.id !== comp.id) } : s));
                                                                        setSelectedComponentId(null);
                                                                    }}
                                                                    className="flex-1 py-2 rounded-xl bg-red-50 text-red-500 text-[10px] font-black uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all flex items-center justify-center gap-2"
                                                                >
                                                                    <Trash2 size={12} /> Remove
                                                                </button>
                                                                <button className="flex-1 py-2 rounded-xl bg-gray-900 text-white text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2">
                                                                    <Settings size={12} /> Options
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </div>
                                    ))}
                                </Reorder.Group>

                                <div className="relative">
                                    <button
                                        onClick={() => setIsAddingComponent(!isAddingComponent)}
                                        className="w-full flex items-center justify-between p-4 border border-gray-100 rounded-2xl hover:bg-gray-50 transition-all font-black text-[11px] text-gray-900 uppercase tracking-widest"
                                    >
                                        <div className="flex items-center gap-3">
                                            <Plus size={16} /> Add content
                                        </div>
                                        <ChevronDown size={14} className={cn("transition-transform", isAddingComponent ? "rotate-180" : "")} />
                                    </button>

                                    <AnimatePresence>
                                        {isAddingComponent && (
                                            <motion.div
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: 10 }}
                                                className="absolute w-full mt-2 bg-white rounded-3xl shadow-2xl border border-gray-100 p-2 z-30"
                                            >
                                                <div className="grid grid-cols-2 gap-1">
                                                    {[
                                                        { type: 'header', icon: <Layout size={14} /> },
                                                        { type: 'footer', icon: <Layout size={14} /> },
                                                        { type: 'text', icon: <Type size={14} /> },
                                                        { type: 'text_input', icon: <Type size={14} /> },
                                                        { type: 'text_area', icon: <Type size={14} /> },
                                                        { type: 'checkbox', icon: <CheckSquare size={14} /> },
                                                        { type: 'radio', icon: <CheckSquare size={14} /> },
                                                        { type: 'dropdown', icon: <Plus size={14} /> },
                                                        { type: 'date_picker', icon: <CalendarIcon size={14} /> },
                                                        { type: 'button', icon: <MousePointer2 size={14} /> },
                                                    ].map(item => (
                                                        <button
                                                            key={item.type}
                                                            onClick={() => addComponent(item.type as any)}
                                                            className="flex items-center gap-2.5 p-3 rounded-2xl hover:bg-gray-50 transition-all text-left group"
                                                        >
                                                            <div className="p-1.5 rounded-lg bg-gray-50 text-gray-400 group-hover:bg-[#25D366]/10 group-hover:text-[#25D366] transition-all">
                                                                {item.icon}
                                                            </div>
                                                            <span className="text-[10px] font-black text-gray-500 uppercase tracking-tighter group-hover:text-gray-900">{item.type.replace('_', ' ')}</span>
                                                        </button>
                                                    ))}
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            </div>
                        </section>
                    </div>
                </aside>

                {/* Right Panel: Preview */}
                <main className="flex-1 bg-gray-50 flex items-center justify-center p-12 relative overflow-hidden">
                    {/* Background Pattern */}
                    <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '20px 20px' }} />

                    <div className="relative w-full max-w-4xl h-full flex flex-col">
                        <div className="flex items-center justify-center gap-4 mb-8">
                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">Live Preview</span>
                            <div className="flex gap-2">
                                <button className="p-2 bg-white rounded-xl shadow-sm text-gray-900 border border-gray-100"><Smartphone size={16} /></button>
                                <button className="p-2 hover:bg-gray-100 rounded-xl text-gray-400 transition-all"><Monitor size={16} /></button>
                                <button className="p-2 hover:bg-gray-100 rounded-xl text-gray-400 transition-all"><Settings size={16} /></button>
                            </div>
                        </div>

                        <div className="flex-1 flex items-center justify-center relative">
                            {viewMode === 'preview' ? (
                                <div className="relative w-[340px] h-[700px] bg-gray-900 rounded-[3.5rem] p-4 shadow-[0_50px_100px_rgba(0,0,0,0.3)] border-[8px] border-gray-800">
                                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-gray-800 rounded-b-2xl z-20" />

                                    <div className="w-full h-full bg-white rounded-[2.5rem] overflow-hidden flex flex-col relative">
                                        {/* Status Bar */}
                                        <div className="h-6 w-full flex justify-between items-center px-6 pt-2">
                                            <span className="text-[10px] font-bold text-gray-400">9:41</span>
                                            <div className="flex gap-1.5 items-center">
                                                <div className="w-3 h-3 border border-gray-300 rounded-[2px]" />
                                                <div className="w-3 h-3 bg-gray-300 rounded-full" />
                                                <div className="w-3 h-3 bg-gray-300 rounded-full" />
                                            </div>
                                        </div>

                                        {/* WhatsApp Header Mockup */}
                                        <div className="p-6 border-b border-gray-50 flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <X size={20} className="text-gray-900" />
                                                <span className="font-bold text-gray-900 truncate max-w-[180px]">{selectedScreen.title}</span>
                                            </div>
                                            <MoreVertical size={20} className="text-gray-400" />
                                        </div>

                                        {/* Content Area */}
                                        <div className="flex-1 overflow-y-auto p-6 space-y-6">
                                            {selectedScreen.components.map(comp => {
                                                switch (comp.type) {
                                                    case 'header':
                                                        return <h2 key={comp.id} className="text-xl font-black text-gray-900 leading-tight">{comp.label}</h2>;
                                                    case 'text':
                                                        return <p key={comp.id} className="text-sm font-bold text-gray-500 leading-relaxed">{comp.label}</p>;
                                                    case 'text_input':
                                                        return (
                                                            <div key={comp.id} className="space-y-2">
                                                                <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest">{comp.label}</label>
                                                                <div className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-bold text-gray-400">
                                                                    {comp.placeholder}
                                                                </div>
                                                            </div>
                                                        );
                                                    case 'button':
                                                        return (
                                                            <div key={comp.id} className="pt-4">
                                                                <button className="w-full py-4 bg-gray-900 text-white rounded-2xl font-black text-sm shadow-xl shadow-gray-200">
                                                                    {comp.label}
                                                                </button>
                                                            </div>
                                                        );
                                                    default:
                                                        return <div key={comp.id} className="p-4 bg-gray-50 rounded-2xl text-[10px] font-black text-gray-400 uppercase text-center border-2 border-dashed border-gray-100">{comp.type.replace('_', ' ')}: {comp.label}</div>;
                                                }
                                            })}
                                        </div>

                                        {/* WhatsApp Managed Footer */}
                                        <div className="p-4 text-center border-t border-gray-50 bg-gray-50/30 shrink-0">
                                            <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest">
                                                Managed by the business. <span className="text-[#25D366]">Learn more</span>
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <Card className="w-full h-full max-h-[700px] overflow-hidden bg-gray-900 border-none shadow-2xl flex flex-col">
                                    <div className="p-4 border-b border-white/10 flex justify-between items-center shrink-0">
                                        <div className="flex items-center gap-2">
                                            <div className="w-3 h-3 bg-red-500 rounded-full" />
                                            <div className="w-3 h-3 bg-yellow-500 rounded-full" />
                                            <div className="w-3 h-3 bg-green-500 rounded-full" />
                                        </div>
                                        <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">flow_definition.json</span>
                                    </div>
                                    <div className="flex-1 overflow-y-auto p-8">
                                        <pre className="text-green-400 font-mono text-xs leading-relaxed">
                                            {exportJSON()}
                                        </pre>
                                    </div>
                                </Card>
                            )}
                        </div>

                        <div className="mt-8 flex justify-center items-center gap-3">
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                <Info size={14} className="text-gray-300" /> Rendering and interaction varies based on device platform.
                            </p>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};

// Simplified lucide replacements for missing ones in context
const MoreVertical = ({ size = 20, className = "" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <circle cx="12" cy="12" r="1" /><circle cx="12" cy="5" r="1" /><circle cx="12" cy="19" r="1" />
    </svg>
);

const Info = ({ size = 20, className = "" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <circle cx="12" cy="12" r="10" /><path d="M12 16v-4" /><path d="M12 8h.01" />
    </svg>
);

export default WhatsAppFlowDesigner;
