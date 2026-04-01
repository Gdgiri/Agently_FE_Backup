import React from 'react';
import { MessageSquare, Zap, X, Trash2, Info } from 'lucide-react';
import { UnifiedBotComposer } from './editors/UnifiedBotComposer';
import { InputEditor } from './editors/InputEditor';
import { DelayEditor } from './editors/DelayEditor';
import { ListEditor } from './editors/ListEditor';
import { TemplateBotReplyEditor } from './editors/TemplateBotReplyEditor';
import { TriggerEditor } from './editors/TriggerEditor';
import { EmailReplyEditor } from './editors/EmailReplyEditor';

export interface NodeEditorRendererProps {
    node: any;
    onUpdate: (key: string, value: any) => void;
    onDelete: () => void;
    onClose: () => void;
}

export const NodeEditorRenderer: React.FC<NodeEditorRendererProps> = ({
    node,
    onUpdate,
    onDelete,
    onClose
}) => {
    if (!node) return null;

    const renderEditor = () => {
        const data = node.data || {};
        const type = data.type || node.type || '';
        const actionType = data.actionType || '';
        const interactionType = data.interactionType || '';

        // Unified Composer for all message-based nodes
        const isMessageNode =
            type.includes('bot') ||
            type === 'action' ||
            type === 'interaction' ||
            type.startsWith('action_') ||
            type.startsWith('interaction_');

        // Specialized exceptions
        if (type === 'bot_template' || actionType === 'template') {
            return <TemplateBotReplyEditor data={data} onUpdate={onUpdate} />;
        }
        if (type === 'action_email' || actionType === 'email') {
            return <EmailReplyEditor data={data} onUpdate={onUpdate} />;
        }
        if (type === 'trigger') {
            return <TriggerEditor data={data} onUpdate={onUpdate} />;
        }
        if (interactionType === 'input' || type.includes('input')) {
            return <InputEditor data={data} onUpdate={onUpdate} />;
        }
        if (type.includes('delay')) {
            return <DelayEditor data={data} onUpdate={onUpdate} />;
        }
        if (type.includes('list') && !isMessageNode) {
            return <ListEditor data={data} onUpdate={onUpdate} />;
        }

        // Default to Unified Composer for all message/action/interaction nodes
        if (isMessageNode) {
            return <UnifiedBotComposer data={data} onUpdate={onUpdate} />;
        }

        return (
            <div className="flex flex-col items-center justify-center py-12 text-center space-y-4 px-8">
                <div className="p-6 bg-gray-50 rounded-[2.5rem] text-gray-300">
                    <Zap size={48} />
                </div>
                <div>
                    <h2 className="text-lg font-black text-gray-900 leading-tight">Undefined Node Type</h2>
                    <p className="text-sm font-bold text-gray-500 mt-2 italic leading-relaxed">
                        This node type ("{type}") does not have a specialized editor yet.
                    </p>
                </div>
            </div>
        );
    };

    return (
        <div className="h-full flex flex-col bg-white overflow-hidden backdrop-blur-3xl shadow-2xl">
            {/* Header matching image */}
            <div className="px-8 py-6 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white/80 backdrop-blur-xl z-20">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-gray-900 rounded-2xl text-white shadow-lg shadow-gray-200">
                        {node.type?.includes('bot') || node.data?.type?.includes('bot') ? <MessageSquare size={20} /> : <Zap size={20} />}
                    </div>
                    <div>
                        <h2 className="text-[15px] font-black text-gray-900 tracking-tight">Add New Bot Reply</h2>
                        <div className="flex items-center gap-2 mt-0.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#25D366] animate-pulse" />
                            <p className="text-[10px] font-black uppercase tracking-[0.15em] text-gray-400">Node ID: {node.id}</p>
                        </div>
                    </div>
                </div>
                <button
                    onClick={onClose}
                    className="p-3 hover:bg-gray-50 rounded-[1.2rem] text-gray-400 hover:text-gray-900 transition-all active:scale-95"
                >
                    <X size={20} />
                </button>
            </div>

            {/* Content area */}
            <div className="flex-1 overflow-y-auto custom-scrollbar">
                <div className="p-8 pb-32">
                    {renderEditor()}
                </div>
            </div>

            {/* Premium Footer */}
            <div className="p-8 border-t border-gray-100 bg-gray-50/50 flex flex-col gap-4 absolute bottom-0 left-0 right-0 backdrop-blur-md">
                <div className="flex items-center gap-3">
                    <button
                        onClick={onClose}
                        className="flex-1 py-4 bg-[#25D366] text-white rounded-[1.5rem] text-sm font-black hover:bg-[#1fb355] shadow-lg shadow-[#25D366]/20 active:scale-[0.98] transition-all"
                    >
                        Submit
                    </button>
                    <button
                        onClick={onClose}
                        className="px-8 py-4 bg-gray-900 text-white rounded-[1.5rem] text-sm font-black hover:bg-black active:scale-[0.98] transition-all"
                    >
                        Close
                    </button>
                </div>
                <button
                    onClick={onDelete}
                    className="w-full py-2 text-[10px] font-black text-red-400 hover:text-red-500 hover:bg-red-50 rounded-[1.2rem] transition-all flex items-center justify-center gap-2"
                >
                    <Trash2 size={12} />
                    Delete this Node
                </button>
            </div>
        </div>
    );
};
