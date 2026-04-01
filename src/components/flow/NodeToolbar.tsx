import React from 'react';
import {
    Zap, Split, Activity, Smartphone,
    Plus, History as HistoryIcon, Layout, MousePointerClick
} from 'lucide-react';
import { Button, cn } from '../ui';

const NODE_TEMPLATES = [
    { id: 'trigger', type: 'trigger', label: 'Trigger', icon: Zap, color: 'green', description: 'Entry point of the flow' },
    { id: 'action', type: 'action', label: 'Action Node', icon: Activity, color: 'orange', description: 'Replies & Logic (Input, Select, Media)' },
    { id: 'flow', type: 'flow', label: 'Flow Control', icon: Split, color: 'purple', description: 'Delays & Orchestration' },
];

interface NodeToolbarProps {
    onDragStart: (event: React.DragEvent, nodeType: string, label: string, description: string, iconType: string) => void;
    onNewFlow: () => void;
    onHistory: () => void;
}

export const NodeToolbar: React.FC<NodeToolbarProps> = ({ onDragStart, onNewFlow, onHistory }) => {

    return (
        <div className="p-6 h-full flex flex-col">
            {/* Management Actions */}
            <div className="mb-8 space-y-3">
                <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4 px-1">Management</h4>
                <button
                    onClick={onNewFlow}
                    className="w-full flex items-center gap-3 p-4 bg-[#25D366] text-white rounded-2xl hover:bg-[#1fb355] shadow-lg shadow-[#25D366]/20 transition-all active:scale-[0.98] group"
                >
                    <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center">
                        <Plus size={18} />
                    </div>
                    <span className="text-xs font-black uppercase tracking-widest">Create New Flow</span>
                </button>
                <button
                    onClick={onHistory}
                    className="w-full flex items-center gap-3 p-4 bg-gray-900 text-white rounded-2xl hover:bg-black transition-all active:scale-[0.98]"
                >
                    <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center">
                        <HistoryIcon size={16} />
                    </div>
                    <span className="text-xs font-black uppercase tracking-widest">Workflows / Previous</span>
                </button>
            </div>

            <div className="h-px bg-gray-100 mb-8" />

            {/* Core Nodes */}
            <div className="flex-1 overflow-y-auto no-scrollbar">
                <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4 px-1">Core Nodes</h4>
                <div className="grid grid-cols-1 gap-3">
                    {NODE_TEMPLATES.map((node) => (
                        <div
                            key={node.id}
                            draggable
                            onDragStart={(e) => onDragStart(e, node.type, node.label, node.description, node.type)}
                            className="group flex items-center gap-4 p-4 bg-white border border-gray-100 rounded-2xl hover:border-[#25D366] hover:shadow-[0_8px_20px_rgba(0,0,0,0.04)] transition-all cursor-grab active:cursor-grabbing"
                        >
                            <div className={cn(
                                "w-10 h-10 rounded-xl flex items-center justify-center transition-colors shadow-sm",
                                node.color === 'amber' ? "bg-amber-50 group-hover:bg-amber-100 text-amber-500" :
                                    node.color === 'green' ? "bg-green-50 group-hover:bg-green-100 text-[#25D366]" :
                                        node.color === 'purple' ? "bg-purple-50 group-hover:bg-purple-100 text-purple-500" :
                                            node.color === 'blue' ? "bg-blue-50 group-hover:bg-blue-100 text-blue-500" :
                                                "bg-gray-50 group-hover:bg-gray-100 text-gray-500"
                            )}>
                                <node.icon size={18} />
                            </div>
                            <div className="flex-1">
                                <p className="text-sm font-bold text-gray-900 leading-none mb-1">{node.label}</p>
                                <p className="text-[10px] text-gray-400 font-medium uppercase tracking-tighter">Drag to canvas</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="mt-8 p-4 bg-blue-50/50 rounded-2xl border border-blue-100/50">
                <h5 className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                    Pro Tip <Zap size={10} className="fill-current" />
                </h5>
                <p className="text-[11px] text-blue-600 leading-relaxed font-medium">
                    Consolidated Action Nodes now support Input, List and Select builders.
                </p>
            </div>
        </div>
    );
};
