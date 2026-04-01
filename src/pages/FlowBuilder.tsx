import React, { useState, useCallback, useMemo, useEffect } from 'react';
import ReactFlow, {
    addEdge,
    Background,
    Controls,
    Connection,
    Edge,
    Node,
    Panel,
    ReactFlowProvider,
    useNodesState,
    useEdgesState,
    Handle,
    Position,
    MarkerType,
    ControlButton
} from 'reactflow';
import { useSearchParams, useParams } from 'react-router-dom';
import 'reactflow/dist/style.css';
import {
    ArrowLeft,
    Save,
    Play,
    Plus,
    Activity,
    Smartphone,
    X,
    MessageSquare,
    Zap,
    ChevronRight,
    Search,
    Trash2,
    CheckCircle,
    Copy,
    Share2,
    Monitor,
    MousePointer2,
    Maximize2,
    List,
    HelpCircle,
    ChevronDown,
    ShoppingBag,
    Tag as TagIcon,
    Split,
    Database,
    Clock,
    Sparkles as SparklesIcon,
    Settings,
    Info,
    History as HistoryIcon,
    Image as ImageIcon,
    Layout,
    Eye,
    FileText,
    MousePointerClick,
    Lock,
    Unlock
} from 'lucide-react';
import { cn, Button, Card } from '../components/ui';
import { motion, AnimatePresence } from 'framer-motion';
import AIGenerateFlowModal from '../components/ai/AIGenerateFlowModal';
import toast from 'react-hot-toast';
import apiClient from '../lib/apiClient';
import { socketClient } from '../lib/socket';
import { flowApi } from '../lib/api/flowApi';

// New Premium Components
import { FlowBuilderLayout } from '../components/flow/FlowBuilderLayout';
import { FlowNode } from '../components/flow/Nodes';
import { PremiumEdge } from '../components/flow/Edges';
import { NodeToolbar } from '../components/flow/NodeToolbar';
import { MultiChannelPreview } from '../components/flow/MultiChannelPreview';
import { NodeTypeSelector } from '../components/flow/NodeTypeSelector';
import { NodeEditorRenderer } from '../components/flow/NodeEditorRenderer';
import { NODE_REGISTRY, NodeCategory } from '../components/flow/nodeRegistry';
import { NewFlowModal } from '../components/flow/NewFlowModal';


// --- Custom React Flow Definitions ---
const NODE_TYPES = {
    custom: FlowNode,
};

const EDGE_TYPES = {
    premium: PremiumEdge,
};

const generateId = (prefix: string = 'node') => `${prefix}_${Math.random().toString(36).substr(2, 9)}_${Date.now()}`;

const createInitialNodes = (title: string, trigger: string, channel?: string): Node[] => [
    {
        id: generateId('trigger'),
        type: 'custom',
        data: {
            label: 'Trigger',
            description: `Entry: ${trigger}`,
            iconType: 'trigger',
            type: 'trigger',
            triggerMode: 'keyword',
            keyword: trigger
        },
        position: { x: 250, y: 0 }
    },
    {
        id: generateId('msg'),
        type: 'custom',
        data: channel === 'EMAIL' ? {
            type: 'action',
            actionType: 'email',
            label: 'First Email Reply',
            description: 'Configure your first email',
            subject: `Welcome to ${title}`,
            messageText: `Hi there,\n\nWelcome to ${title}!`,
        } : {
            type: 'action',
            actionType: 'text',
            label: 'First Reply',
            description: 'Configure your first message',
            messageText: `Welcome to ${title}!`,
            showHeader: false,
            showFooter: false,
            showButtons: false
        },
        position: { x: 250, y: 200 }
    },
];

const createInitialEdges = (nodes: Node[], color: string = '#25D366'): Edge[] => [
    {
        id: generateId('edge'),
        source: nodes[0].id,
        target: nodes[1].id,
        animated: true,
        type: 'premium',
        markerEnd: { type: MarkerType.ArrowClosed, color: color },
        style: { stroke: '#E5E7EB', strokeWidth: 3 }
    },
];

const FlowBuilder: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const [searchParams] = useSearchParams();
    const [nodes, setNodes, onNodesChange] = useNodesState([]);
    const [edges, setEdges, onEdgesChange] = useEdgesState([]);
    const nodeTypes = useMemo(() => NODE_TYPES, []);
    const edgeTypes = useMemo(() => EDGE_TYPES, []);
    const [selectedNode, setSelectedNode] = useState<Node | null>(null);
    const [isAIModalOpen, setIsAIModalOpen] = useState(false);
    const [isLogicModalOpen, setIsLogicModalOpen] = useState(false);
    const [editingConditions, setEditingConditions] = useState<any[]>([]);

    const [flowChannel, setFlowChannel] = useState<'WHATSAPP' | 'INSTAGRAM' | 'FACEBOOK' | 'TELEGRAM' | 'EMAIL'>(() => {
        const c = searchParams.get('channel')?.toUpperCase();
        return (c === 'INSTAGRAM' || c === 'WHATSAPP' || c === 'FACEBOOK' || c === 'TELEGRAM' || c === 'EMAIL') ? (c as any) : 'WHATSAPP';
    });

    const getChannelColor = (channel: string) => {
        switch (channel) {
            case 'WHATSAPP': return '#25D366';
            case 'INSTAGRAM': return '#E4405F';
            case 'FACEBOOK': return '#0084FF';
            case 'TELEGRAM': return '#0088CC';
            case 'EMAIL': return '#1a73e8';
            default: return '#25D366';
        }
    };

    const channelColor = useMemo(() => getChannelColor(flowChannel), [flowChannel]);

    // Update channel when search params change
    useEffect(() => {
        const c = searchParams.get('channel')?.toUpperCase();
        if (c === 'INSTAGRAM' || c === 'WHATSAPP' || c === 'FACEBOOK' || c === 'TELEGRAM' || c === 'EMAIL') {
            setFlowChannel(c as any);
        }
    }, [searchParams]);

    const [flowName, setFlowName] = useState(`New ${flowChannel === 'INSTAGRAM' ? 'Instagram' : flowChannel === 'FACEBOOK' ? 'Facebook' : flowChannel === 'TELEGRAM' ? 'Telegram' : flowChannel === 'EMAIL' ? 'Email' : 'WhatsApp'} Flow`);
    const [flowId, setFlowId] = useState<string | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [allFlows, setAllFlows] = useState<any[]>([]);
    const [isFlowListOpen, setIsFlowListOpen] = useState(false);
    const [isInitialLoading, setIsInitialLoading] = useState(false);

    // Initial load: Fetch flow by ID if in URL
    useEffect(() => {
        if (id) {
            const loadConfigById = async () => {
                setIsInitialLoading(true);
                try {
                    const res = await flowApi.getById(id);
                    const flow = res.data.data;
                    if (flow) {
                        handleLoadFlow(flow);
                    }
                } catch (error) {
                    console.error('Failed to load flow by ID:', error);
                    toast.error('Could not load flow data');
                } finally {
                    // Slight delay for smoother transition
                    setTimeout(() => setIsInitialLoading(false), 800);
                }
            };
            loadConfigById();
        }
    }, [id]);

    // Chat Simulator State
    const [chatHistory, setChatHistory] = useState<any[]>([]);
    const [currentSimNodeId, setCurrentSimNodeId] = useState<string | null>(null);

    const handleSimulatorMessage = (text: string) => {
        const newUserMsg = { role: 'user', text };
        setChatHistory(prev => [...prev, newUserMsg]);

        const textLower = text.toLowerCase().trim();

        // 1. Logic to find trigger
        const triggerNode = nodes.find(n =>
            n.data.type === 'trigger' &&
            n.data.keyword?.toLowerCase().trim() === textLower
        );

        if (triggerNode) {
            const firstEdge = edges.find(e => e.source === triggerNode.id);
            if (firstEdge) {
                const targetNode = nodes.find(n => n.id === firstEdge.target);
                if (targetNode) {
                    processSimNode(targetNode);
                    return;
                }
            }
        }

        // 2. Logic to check if current node has a button matching this text
        if (currentSimNodeId) {
            const currentNode = nodes.find(n => n.id === currentSimNodeId);
            if (currentNode && currentNode.data.buttons) {
                const matchingBtn = currentNode.data.buttons.find((b: any) => b.title.toLowerCase().trim() === textLower);
                if (matchingBtn) {
                    handleSimulatorButtonClick(currentSimNodeId, matchingBtn.id);
                    return;
                }
            }

            // 3. Fallback: Check if there's any outgoing edge from current node (generic transition)
            const edge = edges.find(e => e.source === currentSimNodeId && !e.sourceHandle);
            if (edge) {
                const targetNode = nodes.find(n => n.id === edge.target);
                if (targetNode) {
                    processSimNode(targetNode);
                    return;
                }
            }
        }

        // If no match, add "Help" style response
        setChatHistory(prev => [...prev, {
            role: 'bot',
            text: "I'm sorry, I don't understand that. Please try your starting keyword or click a button."
        }]);
    };

    const handleSimulatorButtonClick = (sourceNodeId: string, buttonId: string) => {
        const effectiveNodeId = sourceNodeId === 'current' ? currentSimNodeId : sourceNodeId;
        if (!effectiveNodeId) return;

        // 1. Try specific handle match
        let edge = edges.find(e =>
            e.source === effectiveNodeId &&
            (e.sourceHandle === `button-${buttonId}` ||
                e.sourceHandle === `button - ${buttonId} ` ||
                e.sourceHandle === buttonId)
        );

        // 2. Fallback: generic transition
        if (!edge) {
            const outgoing = edges.filter(e => e.source === effectiveNodeId);
            if (outgoing.length === 1) edge = outgoing[0];
            else if (!isNaN(Number(buttonId))) {
                edge = edges.find(e => e.source === effectiveNodeId && e.sourceHandle === `button-${buttonId}`);
            }
        }

        if (edge) {
            // Echo the button click as a user message
            const sourceNode = nodes.find(n => n.id === effectiveNodeId);
            const button = sourceNode?.data.buttons?.find((b: any, idx: number) => (b.id || idx.toString()) === buttonId);
            if (button) {
                setChatHistory(prev => [...prev, { role: 'user', text: button.title }]);
            }

            // Update chat history to mark this specific button as interacted
            setChatHistory(prev => prev.map(msg =>
                msg.nodeId === effectiveNodeId
                    ? {
                        ...msg,
                        interactedButtonIds: [...(msg.interactedButtonIds || []), buttonId]
                    }
                    : msg
            ));

            const targetNode = nodes.find(n => n.id === edge.target);
            if (targetNode) processSimNode(targetNode);
        }
    };

    const processSimNode = (node: Node) => {
        setCurrentSimNodeId(node.id);
        const botMsg = {
            role: 'bot',
            nodeId: node.id,
            type: node.data.actionType,
            text: node.data.messageText || node.data.caption || node.data.description,
            mediaUrl: node.data.mediaUrl,
            headerType: node.data.headerType,
            footerText: node.data.footerText,
            buttons: node.data.buttons,
            sections: node.data.sections,
            templateName: node.data.templateName
        };
        setChatHistory(prev => [...prev, botMsg]);
    };

    const [showWalkthrough, setShowWalkthrough] = useState(false);
    const [isActive, setIsActive] = useState(false);
    const [isTogglingStatus, setIsTogglingStatus] = useState(false);
    const [showPreview, setShowPreview] = useState(false);
    const [isNewFlowModalOpen, setIsNewFlowModalOpen] = useState(false);

    const handleToggleStatus = async () => {
        if (!flowId) {
            toast.error('Please save the flow first before activating it');
            return;
        }

        const previousStatus = isActive;
        const newStatus = !isActive;

        // Optimistic update: change UI immediately
        setIsTogglingStatus(true);
        setIsActive(newStatus);

        try {
            await flowApi.toggleEnabled(flowId, newStatus);
            toast.success(`Flow ${newStatus ? 'activated' : 'deactivated'} successfully`);
            fetchFlows();
        } catch (error) {
            console.error('Toggle status error:', error);
            // Revert on error
            setIsActive(previousStatus);
            toast.error('Failed to update flow status');
        } finally {
            setIsTogglingStatus(false);
        }
    };
    // Node Selection State
    const [isTypeSelectorOpen, setIsTypeSelectorOpen] = useState(false);
    const [pendingCategory, setPendingCategory] = useState<NodeCategory>('action');
    const [pendingPosition, setPendingPosition] = useState({ x: 0, y: 0 });

    React.useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                if (isTypeSelectorOpen) setIsTypeSelectorOpen(false);
                else if (isNewFlowModalOpen) setIsNewFlowModalOpen(false);
                else if (isFlowListOpen) setIsFlowListOpen(false);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isTypeSelectorOpen, isNewFlowModalOpen, isFlowListOpen]);

    useEffect(() => {
        fetchFlows();
        // Initialize with default if no flow loaded and no ID in URL
        if (nodes.length === 0 && !id) {
            handleCreateNewFlow(`New ${flowChannel === 'INSTAGRAM' ? 'Instagram' : flowChannel === 'FACEBOOK' ? 'Facebook' : flowChannel === 'TELEGRAM' ? 'Telegram' : flowChannel === 'EMAIL' ? 'Email' : 'WhatsApp'} Flow`, "START");
        }
    }, [flowChannel, id]);

    const fetchFlows = async () => {
        try {
            const res = await flowApi.getAll(flowChannel);
            setAllFlows(res.data.data);
        } catch (error) {
            console.error('Fetch flows error:', error);
        }
    };

    const handleCreateNewFlow = (title: string, trigger: string) => {
        const initialNodes = createInitialNodes(title, trigger, flowChannel);
        const initialEdges = createInitialEdges(initialNodes, channelColor);

        const nodesWithHandlers = initialNodes.map(n => ({
            ...n,
            data: {
                ...n.data,
                onDuplicate: () => handleDuplicateNode(n.id)
            }
        }));

        setNodes(nodesWithHandlers);
        setEdges(initialEdges);
        setFlowName(title);
        setFlowId(null);
        setIsActive(false);
        setIsNewFlowModalOpen(false);
        setSelectedNode(nodesWithHandlers[1]); // Focus on the first action
        toast.success(`Success! Initialized ${title}`);
    };

    const onConnect = useCallback((params: Connection) => {
        setEdges((eds) => {
            // Remove any existing edge from the same source and handle to enforce 1-to-1 connection
            // ALSO remove any existing edge from the same target handle to enforce 1-to-1 connection
            const filteredEdges = eds.filter(e => 
                !(e.source === params.source && e.sourceHandle === params.sourceHandle) &&
                !(e.target === params.target && e.targetHandle === params.targetHandle)
            );
            return addEdge({
                ...params,
                type: 'premium',
                animated: true,
                markerEnd: { type: MarkerType.ArrowClosed, color: channelColor },
                style: { stroke: '#E5E7EB', strokeWidth: 3 },
                data: { onAddNode: (edgeId: string) => handleAddNodeOnEdge(edgeId) }
            }, filteredEdges);
        });
    }, [setEdges, channelColor]);

    const handleAddNodeOnEdge = (edgeId: string) => {
        const edge = edges.find(e => e.id === edgeId);
        if (!edge) return;

        const sourceNode = nodes.find(n => n.id === edge.source);
        const targetNode = nodes.find(n => n.id === edge.target);
        if (!sourceNode || !targetNode) return;

        const midX = (sourceNode.position.x + targetNode.position.x) / 2;
        const midY = (sourceNode.position.y + targetNode.position.y) / 2;

        const newNodeId = generateId('msg');
        const newNode: Node = {
            id: newNodeId,
            type: 'custom',
            position: { x: midX, y: midY },
            data: {
                label: 'Bot Reply',
                type: 'action',
                actionType: 'text',
                description: 'New standard reply',
                messageText: 'Write your reply here...'
            }
        };

        setNodes(nds => [...nds, newNode]);
        setEdges(eds => {
            const remainingEdges = eds.filter(e => e.id !== edgeId);
            return [
                ...remainingEdges,
                {
                    id: generateId('edge'),
                    source: edge.source,
                    target: newNodeId,
                    type: 'premium',
                    animated: true,
                    markerEnd: { type: MarkerType.ArrowClosed, color: channelColor }
                },
                {
                    id: generateId('edge'),
                    source: newNodeId,
                    target: edge.target,
                    type: 'premium',
                    animated: true,
                    markerEnd: { type: MarkerType.ArrowClosed, color: '#25D366' }
                }
            ];
        });

        setSelectedNode(newNode);
    };

    const onDragStart = (event: React.DragEvent, nodeType: string, label: string, description: string, iconType: string) => {
        event.dataTransfer.setData('application/reactflow', JSON.stringify({ nodeType, label, description, iconType }));
        event.dataTransfer.effectAllowed = 'move';
    };

    const onDragOver = useCallback((event: React.DragEvent) => {
        event.preventDefault();
        event.dataTransfer.dropEffect = 'move';
    }, []);

    const onDrop = useCallback(
        (event: React.DragEvent) => {
            event.preventDefault();

            const dataStr = event.dataTransfer.getData('application/reactflow');
            if (!dataStr) return;

            try {
                const data = JSON.parse(dataStr);
                const { nodeType, label } = data;

                const reactFlowBounds = document.querySelector('.react-flow')?.getBoundingClientRect();
                if (!reactFlowBounds) return;

                const position = {
                    x: event.clientX - reactFlowBounds.left,
                    y: event.clientY - reactFlowBounds.top,
                };

                if (['action', 'trigger', 'flow'].includes(nodeType)) {
                    setPendingCategory(nodeType as NodeCategory);
                    setPendingPosition(position);
                    setIsTypeSelectorOpen(true);
                    return;
                }

                const newNode: Node = {
                    id: generateId(nodeType),
                    type: 'custom',
                    position,
                    data: {
                        label: label || (nodeType.charAt(0).toUpperCase() + nodeType.slice(1)),
                        type: nodeType,
                        description: 'Configure this step...'
                    },
                };

                setNodes((nds) => nds.concat(newNode));
            } catch (err) {
                console.error('Drop error:', err);
                toast.error('Failed to add node');
            }
        },
        [setNodes]
    );

    const handleSelectSubtype = (subtype: string) => {
        const config = NODE_REGISTRY[subtype];
        if (!config) return;

        const newNode: Node = {
            id: generateId(subtype),
            type: 'custom',
            position: pendingPosition,
            data: {
                ...config.defaultData,
                label: config.label,
                description: config.description,
                iconType: subtype
            },
        };

        setNodes((nds) => {
            const newNodeWithHandler: Node = {
                ...newNode,
                data: {
                    ...newNode.data,
                    onDuplicate: () => handleDuplicateNode(newNode.id)
                }
            };
            return nds.concat(newNodeWithHandler);
        });
        setSelectedNode(newNode);
        setIsTypeSelectorOpen(false);
        toast.success(`Added ${config.label}`);
    };

    const validateFlow = () => {
        if (!nodes.length) return { valid: false, msg: 'Canvas is empty' };
        const trigger = nodes.find(n => n.data.type === 'trigger');
        if (!trigger) return { valid: false, msg: 'No trigger node found' };
        return { valid: true };
    };

    const handleAIFlowGenerated = useCallback((newNodes: Node[], newEdges: Edge[]) => {
        const maxX = nodes.reduce((max, node) => Math.max(max, node.position.x), 0);
        const offsetNodes = newNodes.map((node, index) => ({
            ...node,
            id: generateId(`ai_${node.id}`),
            position: {
                x: (node.position?.x || (index * 280)) + maxX + 300,
                y: (node.position?.y || (index * 120))
            },
            data: {
                ...node.data,
                iconType: node.data.iconType || (node.data.type === 'trigger' ? 'trigger' : 'msg'),
                onDuplicate: () => handleDuplicateNode(node.id)
            }
        }));
        const idMap = new Map();
        newNodes.forEach((node, i) => idMap.set(node.id, offsetNodes[i].id));
        const mappedEdges = newEdges.map((edge, i) => ({
            ...edge,
            id: generateId('ai_edge'),
            source: idMap.get(edge.source) || edge.source,
            target: idMap.get(edge.target) || edge.target
        }));
        setNodes(prev => [...prev, ...offsetNodes]);
        setEdges(prev => [...prev, ...mappedEdges]);
        toast.success('AI flow architected successfully!');
    }, [nodes, setNodes, setEdges]);

    const handleLoadFlow = (flow: any) => {
        setFlowId(flow.id);
        setFlowName(flow.name);
        
        const nodesWithHandlers = (flow.nodes || []).map((n: any) => ({
            ...n,
            data: {
                ...n.data,
                onDuplicate: () => handleDuplicateNode(n.id)
            }
        }));
        
        setNodes(nodesWithHandlers);
        setEdges(flow.edges || []);
        setIsActive(flow.isEnabled);

        // Update the channel from the loaded flow data
        if (flow.channel) {
            const c = flow.channel.toUpperCase();
            if (['WHATSAPP', 'INSTAGRAM', 'FACEBOOK', 'TELEGRAM', 'EMAIL'].includes(c)) {
                setFlowChannel(c as any);
            }
        }

        setIsFlowListOpen(false);
        toast.success(`Loaded: ${flow.name}`);
    };

    const handleDuplicateNode = useCallback((nodeId: string) => {
        setNodes(currNodes => {
            const nodeToCopy = currNodes.find(n => n.id === nodeId);
            if (!nodeToCopy) {
                console.error('Node to copy not found:', nodeId);
                return currNodes;
            }

            const newNodeId = generateId(nodeToCopy.data.type || 'node');
            const newNode: Node = {
                ...nodeToCopy,
                id: newNodeId,
                position: {
                    x: nodeToCopy.position.x + 100, // Move it further away for visibility
                    y: nodeToCopy.position.y + 100,
                },
                selected: true,
                data: {
                    ...nodeToCopy.data,
                    // Re-bind the duplicate handler for the new node
                    onDuplicate: () => handleDuplicateNode(newNodeId)
                }
            };

            // Selection management
            setSelectedNode(newNode);
            const updatedNodes = currNodes.map(n => ({ ...n, selected: false }));
            
            console.log('Duplicated node:', newNodeId);
            return [...updatedNodes, newNode];
        });
        toast.success('Node duplicated');
    }, [setNodes, setSelectedNode]);

    const handleDeleteFlow = async (id: string) => {
        if (!confirm('Are you sure you want to delete this flow?')) return;
        try {
            await flowApi.delete(id);
            toast.success('Flow deleted');
            fetchFlows();
        } catch (error) {
            toast.error('Failed to delete flow');
        }
    };

    const handleDeleteNode = () => {
        if (selectedNode) {
            setNodes((nds) => nds.filter((node) => node.id !== selectedNode.id));
            setEdges((eds) => eds.filter((edge) => edge.source !== selectedNode.id && edge.target !== selectedNode.id));
            setSelectedNode(null);
            toast.success('Node deleted');
        }
    };

    const handleSave = async (forceActivate: boolean = false) => {
        if (!nodes.length) {
            toast.error('Cannot save an empty flow');
            return;
        }

        if (forceActivate) setIsActive(true);

        setIsSaving(true);
        const triggerNode = nodes.find(n => n.data.type === 'trigger');

        const flowData = {
            name: flowName,
            triggerType: triggerNode?.data.triggerMode === 'keyword' ? 'INBOUND_MESSAGE' : 'INBOUND_MESSAGE',
            isEnabled: forceActivate || isActive,
            channel: flowChannel, // Include channel in save payload
            nodes: nodes.map(n => ({ id: n.id, type: n.type, data: n.data, position: n.position })),
            edges: edges.map(e => {
                const edge: any = { id: e.id, source: e.source, target: e.target };
                if (e.sourceHandle) edge.sourceHandle = e.sourceHandle;
                return edge;
            })
        };

        try {
            if (flowId) {
                await flowApi.update(flowId, flowData);
                toast.success('Flow updated successfully');
            } else {
                const response = await flowApi.create(flowData);
                setFlowId(response.data.data.id);
                toast.success('Flow published successfully');
            }
            fetchFlows();
        } catch (error: any) {
            console.error('Save error:', error);
            const errorMsg = error.response?.data?.errors?.[0]?.message
                || error.response?.data?.error
                || 'Failed to save flow';
            toast.error(errorMsg);
        } finally {
            setIsSaving(false);
        }
    };

    const handleUpdateNodeConfig = (keyOrObject: string | Record<string, any>, value?: any) => {
        if (!selectedNode) return;

        const updates = typeof keyOrObject === 'string' ? { [keyOrObject]: value } : keyOrObject;

        setNodes((nds) =>
            nds.map((node) => {
                if (node.id === selectedNode.id) {
                    return { ...node, data: { ...node.data, ...updates } };
                }
                return node;
            })
        );

        setSelectedNode((prev: any) => {
            if (!prev) return null;
            return { ...prev, data: { ...prev.data, ...updates } };
        });
    };

    const [showSidebar, setShowSidebar] = useState(true);
    const [isLocked, setIsLocked] = useState(false);

    if (isInitialLoading) {
        return (
            <div className="h-screen w-full flex flex-col items-center justify-center bg-white">
                <div className="w-16 h-16 bg-gradient-to-tr from-[#25D366] via-[#1ebe5d] to-purple-500 rounded-[2rem] flex items-center justify-center text-white font-black italic animate-bounce shadow-2xl mb-8">A</div>
                <div className="flex flex-col items-center gap-3">
                    <h2 className="text-xl font-black text-gray-900 tracking-tight">Analyzing Flow Architect...</h2>
                    <div className="flex items-center gap-2">
                        <div className="w-1 h-1 bg-[#25D366] rounded-full animate-ping" />
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">Constructing Canvas Logic</p>
                    </div>
                </div>

                {/* Visual Progress Bar */}
                <div className="w-48 h-1 bg-gray-50 rounded-full mt-8 overflow-hidden">
                    <motion.div
                        initial={{ x: "-100%" }}
                        animate={{ x: "100%" }}
                        transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                        className="w-full h-full bg-[#25D366]"
                    />
                </div>
            </div>
        );
    }

    return (
        <div className="h-screen w-full flex flex-col overflow-hidden bg-white">
            <ReactFlowProvider>
                <FlowBuilderLayout
                    showSidebar={showSidebar}
                    header={
                        <div className="flex-1 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="flex items-center gap-1">
                                    <button onClick={() => window.history.back()} className="p-2 hover:bg-gray-50 rounded-xl text-gray-400 transition-colors">
                                        <ArrowLeft size={20} />
                                    </button>
                                    <button
                                        onClick={() => setShowSidebar(!showSidebar)}
                                        className={cn(
                                            "p-2 rounded-xl transition-all",
                                            showSidebar ? "text-[#25D366] bg-[#25D366]/5" : "text-gray-400 hover:bg-gray-50"
                                        )}
                                        title={showSidebar ? "Hide Sidebar" : "Show Sidebar"}
                                    >
                                        {showSidebar ? <X size={20} /> : <List size={20} />}
                                    </button>
                                </div>
                                <div className="h-8 w-px bg-gray-100 mx-2" />
                                <div className="flex flex-col">
                                    <input
                                        value={flowName}
                                        onChange={(e) => setFlowName(e.target.value)}
                                        className="text-sm font-black text-gray-900 bg-transparent border-none p-0 focus:ring-0 w-64"
                                        placeholder="Untitled Flow"
                                    />
                                    <div className="flex items-center gap-2 mt-0.5">
                                        <div className={cn("w-1.5 h-1.5 rounded-full")} style={{ backgroundColor: isActive ? channelColor : '#d1d5db', boxShadow: isActive ? `0 0 8px ${channelColor}` : 'none' }} />
                                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                                            {flowChannel} • {isActive ? 'Flow Active' : 'Draft Mode'}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <div className="flex items-center gap-2 bg-gray-50 p-1.5 rounded-2xl border border-gray-100">
                                    <div className="flex items-center gap-3 px-4 border-r border-gray-200">
                                        <div
                                            className={cn(
                                                "w-10 h-6 rounded-full transition-all relative cursor-pointer",
                                                isActive ? 'opacity-100' : 'bg-gray-300',
                                                (isTogglingStatus || !flowId) && "opacity-50 cursor-not-allowed pointer-events-none"
                                            )}
                                            style={{ backgroundColor: isActive ? channelColor : undefined }}
                                            onClick={handleToggleStatus}
                                        >
                                            <div className={cn(
                                                "absolute top-1 w-4 h-4 bg-white rounded-full transition-all",
                                                isActive ? "left-5" : "left-1",
                                                isTogglingStatus && "animate-pulse"
                                            )} />
                                        </div>
                                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                                            {isTogglingStatus ? 'Updating...' : 'Status'}
                                        </span>
                                    </div>
                                    <Button
                                        onClick={() => {
                                            const validation = validateFlow();
                                            if (validation.valid) handleSave(true);
                                            else toast.error(validation.msg!);
                                        }}
                                        disabled={isSaving}
                                        variant="ghost"
                                        className="rounded-xl text-xs font-black uppercase tracking-widest h-9 px-6 hover:bg-gray-100"
                                    >
                                        <Play size={14} className="mr-2" /> {isSaving ? 'Publishing...' : 'Publish Flow'}
                                    </Button>
                                    <Button
                                        onClick={() => handleSave(false)}
                                        disabled={isSaving}
                                        className="bg-gray-900 text-white rounded-xl text-xs font-black uppercase tracking-widest h-9 px-6 hover:bg-black shadow-lg"
                                    >
                                        <Save size={14} className="mr-2" /> Save Draft
                                    </Button>
                                </div>
                                <Button variant="ghost" onClick={() => setShowWalkthrough(true)} className="w-10 h-10 p-0 rounded-xl text-gray-400 hover:bg-gray-50">
                                    <HelpCircle size={20} />
                                </Button>
                            </div>
                        </div>
                    }
                    sidebar={
                        <NodeToolbar
                            onDragStart={onDragStart}
                            onNewFlow={() => setIsNewFlowModalOpen(true)}
                            onHistory={() => setIsFlowListOpen(true)}
                        />
                    }
                    drawer={
                        selectedNode ? (
                            <NodeEditorRenderer
                                node={selectedNode}
                                onUpdate={handleUpdateNodeConfig}
                                onDelete={handleDeleteNode}
                                onClose={() => setSelectedNode(null)}
                            />
                        ) : null
                    }
                    showDrawer={!!selectedNode}
                    onCloseDrawer={() => setSelectedNode(null)}
                    preview={
                        <MultiChannelPreview
                            channel={flowChannel}
                            messages={chatHistory.length > 0 ? chatHistory : (selectedNode ? [{
                                role: 'bot',
                                text: selectedNode.data.messageText || selectedNode.data.question,
                                mediaUrl: selectedNode.data.mediaUrl,
                                headerType: selectedNode.data.headerType,
                                footerText: selectedNode.data.footerText,
                                buttons: selectedNode.data.buttons,
                                sections: selectedNode.data.sections,
                                templateName: selectedNode.data.templateName,
                                interactionType: selectedNode.data.interactionType,
                                ctaLabel: selectedNode.data.ctaLabel,
                                ctaUrl: selectedNode.data.ctaUrl,
                                subject: selectedNode.data.subject
                            }] : [])}
                            onSendMessage={handleSimulatorMessage}
                            onButtonClick={handleSimulatorButtonClick}
                        />
                    }
                    showPreview={showPreview}
                    onTogglePreview={() => setShowPreview(!showPreview)}
                >
                    <ReactFlow
                        nodes={nodes}
                        edges={edges}
                        onNodesChange={onNodesChange}
                        onEdgesChange={onEdgesChange}
                        onConnect={onConnect}
                        onDrop={onDrop}
                        onDragOver={onDragOver}
                        nodeTypes={nodeTypes}
                        edgeTypes={edgeTypes}
                        onNodeClick={isLocked ? undefined : (e, node) => setSelectedNode(node)}
                        nodesDraggable={!isLocked}
                        nodesConnectable={!isLocked}
                        elementsSelectable={!isLocked}
                        panOnDrag={!isLocked}
                        zoomOnScroll={!isLocked}
                        zoomOnPinch={!isLocked}
                        panOnScroll={!isLocked}
                        fitView
                        className="bg-dot-pattern"
                    >
                        <Background color="#ccc" gap={20} />
                        <Controls className="bg-white border-gray-100 rounded-xl shadow-lg border-2 shadow-gray-200">
                            <ControlButton
                                onClick={() => setIsLocked(!isLocked)}
                                className={cn(
                                    "!border-none !rounded-none hover:bg-gray-50 transition-colors",
                                    isLocked ? "text-red-500 bg-red-50" : "text-gray-400"
                                )}
                                title={isLocked ? "Unlock Canvas" : "Lock Canvas"}
                            >
                                {isLocked ? <Lock size={14} /> : <Unlock size={14} />}
                            </ControlButton>
                        </Controls>
                    </ReactFlow>
                </FlowBuilderLayout>
            </ReactFlowProvider>

            <AIGenerateFlowModal
                isOpen={isAIModalOpen}
                onClose={() => setIsAIModalOpen(false)}
                onFlowGenerated={handleAIFlowGenerated}
            />

            <NodeTypeSelector
                isOpen={isTypeSelectorOpen}
                category={pendingCategory}
                onClose={() => setIsTypeSelectorOpen(false)}
                onSelect={handleSelectSubtype}
            />

            <NewFlowModal
                isOpen={isNewFlowModalOpen}
                onClose={() => setIsNewFlowModalOpen(false)}
                onCreate={handleCreateNewFlow}
            />

            {/* Previous Work Modal Overlay */}
            <AnimatePresence>
                {isFlowListOpen && (
                    <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-white rounded-[3rem] w-full max-w-4xl max-h-[80vh] overflow-hidden flex flex-col shadow-2xl"
                        >
                            <header className="p-8 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-gray-900 rounded-2xl text-white shadow-lg">
                                        <HistoryIcon size={24} />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-black text-gray-900 leading-tight">Flow Library</h3>
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">Manage and load your previous work</p>
                                    </div>
                                </div>
                                <button onClick={() => setIsFlowListOpen(false)} className="p-2 hover:bg-white rounded-xl text-gray-400 transition-colors">
                                    <X size={20} />
                                </button>
                            </header>
                            <div className="flex-1 overflow-y-auto p-8 grid grid-cols-2 gap-4">
                                {allFlows.length > 0 ? allFlows.map((flow) => (
                                    <div key={flow.id} className="group p-6 bg-white border border-gray-100 rounded-[2rem] hover:border-green-500 hover:shadow-xl transition-all cursor-pointer relative overflow-hidden" onClick={() => handleLoadFlow(flow)}>
                                        <div className="flex items-start justify-between relative z-10">
                                            <div>
                                                <h4 className="text-sm font-black text-gray-900 group-hover:text-green-600 transition-colors">{flow.name}</h4>
                                                <p className="text-[10px] font-bold text-gray-400 mt-1">Last edited: {flow.updatedAt ? new Date(flow.updatedAt).toLocaleDateString() : 'Just now'}</p>
                                            </div>
                                            <div className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${flow.isEnabled ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
                                                {flow.isEnabled ? 'Live' : 'Draft'}
                                            </div>
                                        </div>
                                        <div className="mt-4 flex items-center justify-between relative z-10">
                                            <div className="flex -space-x-2">
                                                {/* Visual indicator of complexity */}
                                                {[...Array(Math.min(5, Math.ceil((flow.nodes?.length || 0) / 2)))].map((_, i) => (
                                                    <div key={i} className="w-6 h-6 rounded-full border-2 border-white bg-gray-50 flex items-center justify-center">
                                                        <Activity size={10} className="text-gray-300" />
                                                    </div>
                                                ))}
                                            </div>
                                            <button
                                                onClick={(e) => { e.stopPropagation(); handleDeleteFlow(flow.id); }}
                                                className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    </div>
                                )) : (
                                    <div className="col-span-2 py-12 text-center">
                                        <p className="text-sm font-bold text-gray-400 italic">No flows created yet. Start by architecting your first bot logic!</p>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default FlowBuilder;
