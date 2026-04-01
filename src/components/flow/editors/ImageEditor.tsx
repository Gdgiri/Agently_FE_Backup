import React from 'react';
import { NodeUpdateHandler } from './types';
import { ImageIcon } from 'lucide-react';

interface ImageEditorProps {
    data: any;
    onUpdate: NodeUpdateHandler;
}

export const ImageEditor: React.FC<ImageEditorProps> = ({ data, onUpdate }) => {
    return (
        <div className="space-y-6">
            <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest block pl-1">
                    Image URL
                </label>
                <div className="relative">
                    <input
                        className="w-full px-5 py-4 bg-white border-2 border-gray-100 rounded-[1.5rem] text-sm font-bold focus:ring-4 focus:ring-[#25D366]/5 focus:border-[#25D366] transition-all outline-none"
                        placeholder="https://example.com/image.jpg"
                        value={data.mediaUrl || ''}
                        onChange={(e) => onUpdate('mediaUrl', e.target.value)}
                    />
                </div>
            </div>

            {data.mediaUrl && (
                <div className="aspect-video w-full rounded-[2rem] overflow-hidden border-2 border-dashed border-gray-100 bg-gray-50 flex items-center justify-center p-2">
                    <img
                        src={data.mediaUrl}
                        alt="Preview"
                        className="max-h-full max-w-full rounded-2xl object-contain shadow-lg"
                        onError={(e) => (e.currentTarget.src = 'https://placehold.co/600x400?text=Invalid+Image+URL')}
                    />
                </div>
            )}

            {!data.mediaUrl && (
                <div className="aspect-video w-full rounded-[2rem] overflow-hidden border-2 border-dashed border-gray-100 bg-gray-50 flex flex-col items-center justify-center gap-3">
                    <div className="p-4 bg-white rounded-2xl text-gray-400 shadow-sm">
                        <ImageIcon size={32} />
                    </div>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Preview Area</p>
                </div>
            )}

            <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest block pl-1">
                    Caption (Optional)
                </label>
                <textarea
                    className="w-full px-5 py-4 bg-white border-2 border-gray-100 rounded-[1.5rem] text-sm font-bold min-h-[100px] focus:ring-4 focus:ring-[#25D366]/5 focus:border-[#25D366] transition-all outline-none leading-relaxed resize-none"
                    placeholder="Enter image caption..."
                    value={data.caption || ''}
                    onChange={(e) => onUpdate('caption', e.target.value)}
                />
            </div>
        </div>
    );
};
