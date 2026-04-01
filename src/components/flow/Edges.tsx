import React from 'react';
import { getBezierPath, EdgeProps, getSmoothStepPath } from 'reactflow';
import { Plus } from 'lucide-react';

export const PremiumEdge = ({
    id,
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
    style = {},
    markerEnd,
    data
}: EdgeProps) => {
    const [edgePath, labelX, labelY] = getBezierPath({
        sourceX,
        sourceY,
        sourcePosition,
        targetX,
        targetY,
        targetPosition,
    });

    return (
        <>
            <path
                id={id}
                style={{
                    ...style,
                    strokeWidth: 3,
                    stroke: '#E5E7EB',
                    transition: 'stroke 0.3s'
                }}
                className="react-flow__edge-path group-hover:stroke-[#25D366]"
                d={edgePath}
                markerEnd={markerEnd}
            />

            {/* Invisible wider path for better hover interaction */}
            <path
                d={edgePath}
                fill="none"
                strokeOpacity={0}
                strokeWidth={20}
                className="cursor-pointer"
                onMouseEnter={() => { }} // Could trigger path highlight
            />

            <foreignObject
                width={32}
                height={32}
                x={labelX - 16}
                y={labelY - 16}
                className="edgebutton-foreignobject"
                requiredExtensions="http://www.w3.org/1999/xhtml"
            >
                <div className="flex items-center justify-center w-full h-full">
                    <button
                        className="w-6 h-6 bg-white border border-gray-100 rounded-lg shadow-sm flex items-center justify-center text-gray-400 hover:text-[#25D366] hover:border-[#25D366] hover:scale-110 transition-all opacity-0 group-hover:opacity-100"
                        onClick={(event) => {
                            event.stopPropagation();
                            if (data?.onAddNode) data.onAddNode(id);
                        }}
                    >
                        <Plus size={14} />
                    </button>
                </div>
            </foreignObject>
        </>
    );
};
