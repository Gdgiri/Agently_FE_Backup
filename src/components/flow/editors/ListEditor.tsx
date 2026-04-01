import React from 'react';
import { NodeUpdateHandler } from './types';
import { Plus, Trash2, List as ListIcon } from 'lucide-react';

interface ListEditorProps {
    data: any;
    onUpdate: NodeUpdateHandler;
}

export const ListEditor: React.FC<ListEditorProps> = ({ data, onUpdate }) => {
    const sections = data.sections || [];

    const handleAddSection = () => {
        const newSections = [...sections, { title: 'New Section', rows: [{ title: 'Option 1', description: '' }] }];
        onUpdate('sections', newSections);
    };

    const handleRemoveSection = (sIndex: number) => {
        const newSections = sections.filter((_: any, i: number) => i !== sIndex);
        onUpdate('sections', newSections);
    };

    const handleAddRow = (sIndex: number) => {
        const newSections = [...sections];
        newSections[sIndex].rows.push({ title: 'New Option', description: '' });
        onUpdate('sections', newSections);
    };

    const handleUpdateRow = (sIndex: number, rIndex: number, field: string, value: string) => {
        const newSections = [...sections];
        newSections[sIndex].rows[rIndex] = { ...newSections[sIndex].rows[rIndex], [field]: value };
        onUpdate('sections', newSections);
    };

    return (
        <div className="space-y-6">
            <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest block pl-1">
                    List Header Title
                </label>
                <input
                    className="w-full px-5 py-4 bg-white border-2 border-gray-100 rounded-[1.5rem] text-sm font-bold focus:ring-4 focus:ring-[#3B82F6]/5 focus:border-[#3B82F6] transition-all outline-none"
                    placeholder="e.g. Main Menu"
                    value={data.title || ''}
                    onChange={(e) => onUpdate('title', e.target.value)}
                />
            </div>

            <div className="space-y-4">
                <div className="flex items-center justify-between px-1">
                    <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest">
                        Sections ({sections.length})
                    </label>
                    <button
                        onClick={handleAddSection}
                        className="p-2 text-blue-500 hover:bg-blue-50 rounded-xl transition-all"
                    >
                        <Plus size={16} />
                    </button>
                </div>

                <div className="space-y-6">
                    {sections.map((section: any, sIndex: number) => (
                        <div key={sIndex} className="p-6 bg-gray-50 rounded-[2.5rem] border border-gray-100 space-y-4">
                            <div className="flex items-center gap-2">
                                <input
                                    className="flex-1 bg-transparent text-xs font-black uppercase tracking-widest outline-none text-gray-900"
                                    value={section.title || ''}
                                    onChange={(e) => {
                                        const newSections = [...sections];
                                        newSections[sIndex].title = e.target.value;
                                        onUpdate('sections', newSections);
                                    }}
                                    placeholder="Section Title"
                                />
                                <button onClick={() => handleRemoveSection(sIndex)} className="text-gray-400 hover:text-red-500">
                                    <Trash2 size={14} />
                                </button>
                            </div>

                            <div className="space-y-2">
                                {section.rows.map((row: any, rIndex: number) => (
                                    <div key={rIndex} className="bg-white p-4 rounded-2xl border border-gray-100 space-y-2 group relative">
                                        <input
                                            className="w-full bg-transparent text-sm font-bold outline-none"
                                            value={row.title || ''}
                                            onChange={(e) => handleUpdateRow(sIndex, rIndex, 'title', e.target.value)}
                                            placeholder="Option Title"
                                        />
                                        <input
                                            className="w-full bg-transparent text-[10px] font-bold text-gray-400 outline-none"
                                            value={row.description || ''}
                                            onChange={(e) => handleUpdateRow(sIndex, rIndex, 'description', e.target.value)}
                                            placeholder="Description (optional)"
                                        />
                                    </div>
                                ))}
                                <button
                                    onClick={() => handleAddRow(sIndex)}
                                    className="w-full py-3 text-[10px] font-black uppercase text-blue-500 hover:bg-blue-50 rounded-xl transition-all"
                                >
                                    + Add Option
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="p-6 bg-blue-50/30 border border-blue-100/50 rounded-[2rem] flex flex-col gap-3">
                <div className="flex items-center gap-2">
                    <ListIcon size={14} className="text-blue-500" />
                    <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">List Menu Logic</span>
                </div>
                <p className="text-[10px] text-blue-700 font-bold leading-relaxed">
                    List messages allow up to 10 options across multiple sections. They are more professional for large menus.
                </p>
            </div>
        </div>
    );
};
