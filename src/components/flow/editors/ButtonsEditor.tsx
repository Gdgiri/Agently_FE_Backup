import React from 'react';
import { NodeUpdateHandler } from './types';
import { Plus, Trash2, GripVertical, MessageSquare } from 'lucide-react';

interface ButtonsEditorProps {
    data: any;
    onUpdate: NodeUpdateHandler;
}

export const ButtonsEditor: React.FC<ButtonsEditorProps> = ({ data, onUpdate }) => {
    const buttons = data.buttons || [];

    const handleAddButton = () => {
        if (buttons.length < 3) {
            const newButtons = [...buttons, { id: `btn_${Date.now()}`, label: 'New Button' }];
            onUpdate('buttons', newButtons);
        }
    };

    const handleRemoveButton = (index: number) => {
        const newButtons = buttons.filter((_: any, i: number) => i !== index);
        onUpdate('buttons', newButtons);
    };

    const handleUpdateButton = (index: number, label: string) => {
        const newButtons = [...buttons];
        newButtons[index] = { ...newButtons[index], label };
        onUpdate('buttons', newButtons);
    };

    return (
        <div className="space-y-6">
            <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest block pl-1">
                    Body Message
                </label>
                <textarea
                    className="w-full px-5 py-4 bg-white border-2 border-gray-100 rounded-[1.5rem] text-sm font-bold min-h-[120px] focus:ring-4 focus:ring-[#3B82F6]/5 focus:border-[#3B82F6] transition-all outline-none leading-relaxed resize-none"
                    placeholder="Enter message body..."
                    value={data.messageText || ''}
                    onChange={(e) => onUpdate('messageText', e.target.value)}
                />
            </div>

            <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest block pl-1">
                    Footer Text (Optional)
                </label>
                <input
                    className="w-full px-5 py-4 bg-white border-2 border-gray-100 rounded-[1.5rem] text-sm font-bold focus:ring-4 focus:ring-[#3B82F6]/5 focus:border-[#3B82F6] transition-all outline-none"
                    placeholder="Footer text..."
                    value={data.footerText || ''}
                    onChange={(e) => onUpdate('footerText', e.target.value)}
                />
            </div>

            <div className="space-y-4">
                <div className="flex items-center justify-between px-1">
                    <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest">
                        Buttons ({buttons.length}/3)
                    </label>
                </div>

                <div className="space-y-2">
                    {buttons.map((btn: any, index: number) => (
                        <div key={btn.id} className="group relative flex items-center gap-2 p-1 bg-gray-50 rounded-2xl border-2 border-transparent hover:border-gray-100 transition-all">
                            <div className="p-2 text-gray-300">
                                <GripVertical size={16} />
                            </div>
                            <input
                                className="flex-1 bg-transparent px-2 py-3 text-sm font-bold outline-none"
                                value={btn.label || ''}
                                onChange={(e) => handleUpdateButton(index, e.target.value)}
                                placeholder="Button Label"
                            />
                            <button
                                onClick={() => handleRemoveButton(index)}
                                className="p-3 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                            >
                                <Trash2 size={16} />
                            </button>
                        </div>
                    ))}

                    {buttons.length < 3 && (
                        <button
                            onClick={handleAddButton}
                            className="w-full py-4 bg-white border-2 border-dashed border-gray-200 rounded-[1.5rem] text-[10px] font-black uppercase text-gray-400 tracking-widest hover:border-blue-400 hover:text-blue-500 hover:bg-blue-50 transition-all flex items-center justify-center gap-2"
                        >
                            <Plus size={14} /> Add Button
                        </button>
                    )}
                </div>
            </div>

            <div className="p-6 bg-blue-50/30 border border-blue-100/50 rounded-[2rem] flex flex-col gap-3">
                <div className="flex items-center gap-2">
                    <MessageSquare size={14} className="text-blue-500" />
                    <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Button Logic</span>
                </div>
                <p className="text-[10px] text-blue-700 font-bold leading-relaxed">
                    Interactive buttons create branching paths in your flow. Each button added will create a new output handle on the node.
                </p>
            </div>
        </div>
    );
};
