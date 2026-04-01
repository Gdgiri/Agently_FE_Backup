import React, { memo } from 'react';
import { Handle, Position } from 'reactflow';
import {
  MessageSquare, Zap, Clock, Split, Tag as TagIcon,
  Database, ShoppingBag, Activity, MousePointerClick,
  Image as ImageIcon, Video, FileText, CheckCircle2,
  PlayCircle, ExternalLink, ArrowRightCircle, List,
  Copy
} from 'lucide-react';
import { cn } from '../ui';

import { NODE_REGISTRY, CATEGORY_CONFIG } from './nodeRegistry';

export const NodeIcon = ({ type, size = 18 }: { type: string; size?: number }) => {
  const nodeConfig = NODE_REGISTRY[type];
  if (nodeConfig) {
    const Icon = nodeConfig.icon;
    return <Icon size={size} />;
  }

  switch (type) {
    case 'trigger': return <Zap size={size} className="text-[#25D366]" />;
    case 'action': return <Activity size={size} className="text-[#F59E0B]" />;
    case 'interaction': return <MousePointerClick size={size} className="text-[#3B82F6]" />;
    case 'flow': return <Split size={size} className="text-[#8B5CF6]" />;
    default: return <Activity size={size} />;
  }
};

export const FlowNode = memo(({ data, selected }: any) => {
  const isTrigger = data.type === 'trigger' || data.category === 'trigger';
  const category = (data.category as string) || (data.type as string) || 'action';
  const config = CATEGORY_CONFIG[category as keyof typeof CATEGORY_CONFIG] || CATEGORY_CONFIG.action;

  // Determine source handles - dynamic for buttons
  const hasButtons = data.showButtons && data.buttons && data.buttons.length > 0;
  const isInteractive = data.type === 'bot_interactive' || data.type?.startsWith('interaction_');

  return (
    <div className={cn(
      "group relative min-w-[260px] max-w-[320px] bg-white rounded-[2rem] transition-all duration-500",
      "shadow-[0_8px_30px_rgba(0,0,0,0.04),0_0_1px_rgba(0,0,0,0.1)]",
      selected ? "ring-4 ring-offset-8 scale-[1.05] shadow-[0_30px_60px_rgba(0,0,0,0.12)] z-50" : "hover:shadow-[0_15px_40px_rgba(0,0,0,0.08)]"
    )}
      style={{ ringColor: selected ? config.hex : 'transparent' } as any}
    >
      {/* Input Handle */}
      {!isTrigger && (
        <Handle
          type="target"
          position={Position.Top}
          className="!w-4 !h-4 !bg-white !border-4 !-top-2 transition-all group-hover:!scale-125 !shadow-md"
          style={{ borderColor: config.hex }}
        />
      )}

      {/* Premium Header */}
      <div className={cn(
        "px-5 py-4 rounded-t-[2rem] flex items-center gap-4 border-b border-gray-50 bg-gradient-to-br",
      )}
        style={{ from: `${config.hex} 15`, to: `${config.hex}05` } as any}
      >
        <div className={cn(
          "w-11 h-11 rounded-2xl flex items-center justify-center shadow-lg bg-white group-hover:rotate-6 transition-transform duration-300"
        )}
          style={{ color: config.hex }}
        >
          <NodeIcon type={data.iconType || data.type} size={22} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[10px] font-black uppercase tracking-widest leading-none mb-1.5 opacity-50" style={{ color: config.hex }}>
            {config.label}
          </p>
          <h3 className="text-[15px] font-black text-gray-900 truncate tracking-tight">
            {data.label}
          </h3>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (data.onDuplicate) data.onDuplicate();
            }}
            className={cn(
              "p-2 rounded-lg transition-all active:scale-95 shadow-lg",
              selected ? "bg-white text-gray-900 ring-2 ring-gray-100" : "bg-gray-50 text-gray-400 opacity-0 group-hover:opacity-100 border border-gray-100"
            )}
            title="Duplicate node"
          >
            <Copy size={16} strokeWidth={3} />
          </button>
          {selected && (
            <div className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: config.hex }} />
          )}
        </div>
      </div>

      {/* Premium Content */}
      <div className="p-5 space-y-4">
        {/* Media Preview (Premium Feature) */}
        {data.mediaUrl && (
          <div className="relative rounded-2xl overflow-hidden aspect-video bg-gray-100 border border-gray-100 group/media shadow-inner">
            {data.headerType === 'VIDEO' ? (
              <div className="w-full h-full flex items-center justify-center bg-gray-900">
                <PlayCircle className="text-white/50 w-10 h-10 group-hover/media:scale-110 transition-transform" />
              </div>
            ) : data.headerType === 'DOCUMENT' ? (
              <div className="w-full h-full flex flex-col items-center justify-center bg-blue-50">
                <FileText className="text-blue-400 w-10 h-10 mb-2" />
                <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest">Document</span>
              </div>
            ) : (
              <img src={data.mediaUrl} alt="Preview" className="w-full h-full object-cover group-hover/media:scale-110 transition-transform duration-700" title="Click to view full image" />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover/media:opacity-100 transition-opacity" />
          </div>
        )}

        {/* Question / Description */}
        {(data.messageText || data.question || data.description) && (
          <p className="text-[13px] text-gray-600 leading-relaxed font-bold italic line-clamp-3">
            {data.messageText || data.question || data.description}
          </p>
        )}

        {/* Variable Output Indicator (for Input nodes) */}
        {data.variable && (
          <div className="flex items-center gap-2 px-3 py-2 bg-purple-50 rounded-xl border border-purple-100">
            <Database size={12} className="text-purple-500" />
            <span className="text-[10px] font-black text-purple-600 uppercase tracking-widest">Store → `{data.variable} `</span>
          </div>
        )}

        {/* Dynamic Buttons (Source Handles) */}
        {hasButtons && (
          <div className="space-y-2 mt-4">
            <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest px-1">Interactions</p>
            {data.buttons.map((btn: any, idx: number) => (
              <div key={btn.id} className="relative">
                <div className="flex items-center justify-between p-3 bg-gray-50 border border-gray-100 rounded-xl group/btn hover:bg-white hover:border-[#25D366] transition-all">
                  <span className="text-[11px] font-black text-gray-800 group-hover/btn:text-[#25D366] transition-colors">{btn.title}</span>
                  <ArrowRightCircle size={14} className="text-gray-300 group-hover/btn:text-[#25D366] transition-transform group-hover/btn:translate-x-0.5" />
                </div>
                {/* Per-button Connector Handle */}
                <Handle
                  type="source"
                  position={Position.Right}
                  id={`button-${btn.id || idx.toString()}`}
                  className="!w-4 !h-4 !bg-white !border-4 !-right-2 transition-all hover:!scale-150 !shadow-md"
                  style={{ borderColor: '#25D366', top: '50%' }}
                />
              </div>
            ))}
          </div>
        )}

        {/* Standard List Menu Indicator */}
        {data.interactionType === 'LIST' && (
          <div className="flex items-center justify-between p-3 bg-blue-50 border border-blue-100 rounded-xl">
            <div className="flex items-center gap-2">
              <List size={14} className="text-blue-500" />
              <span className="text-[11px] font-black text-blue-600 uppercase tracking-widest">{data.sections?.length || 0} Sections</span>
            </div>
            <Handle
              type="source"
              position={Position.Right}
              id="list-menu"
              className="!w-4 !h-4 !bg-white !border-4 !-right-2 transition-all hover:!scale-150 !z-10 !shadow-md"
              style={{ borderColor: '#3B82F6' }}
            />
          </div>
        )}
      </div>

      {/* Default Output Handle (if no specialized handles) */}
      {!hasButtons && data.interactionType !== 'LIST' && (
        <Handle
          type="source"
          position={Position.Bottom}
          className="!w-4 !h-4 !bg-white !border-4 !-bottom-2 transition-all group-hover:!scale-150 !shadow-md"
          style={{ borderColor: config.hex }}
        />
      )}

      {/* Status Tooltip */}
      <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-all pointer-events-none">
        <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest bg-white px-2 py-0.5 rounded-full shadow-sm border border-gray-100">
          ID: {data.type}_{Math.random().toString(36).substr(2, 4)}
        </p>
      </div>
    </div>
  );
});

FlowNode.displayName = 'FlowNode';
