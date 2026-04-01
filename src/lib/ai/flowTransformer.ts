
import { Node, Edge } from 'reactflow';
import { AIFlowResponse } from './schemaValidators';

export const transformAIToFlow = (aiResponse: AIFlowResponse) => {
    const nodes: Node[] = [];
    const edges: Edge[] = [];

    // Group nodes by levels for a simple layout if needed, 
    // but for now let's just use vertical spacing
    let currentY = 0;
    const NODE_WIDTH = 250;
    const NODE_HEIGHT = 100;
    const VERTICAL_SPACING = 150;
    const HORIZONTAL_SPACING = 300;

    // Track node positions to handle branching
    const nodeMap = new Map<string, { x: number, y: number }>();

    // Add Trigger Node
    const triggerId = 'ai-trigger';
    nodes.push({
        id: triggerId,
        type: 'custom',
        data: {
            label: 'TRIGGER',
            description: `Event: ${aiResponse.trigger.type}`,
            icon: '⚡',
            type: 'trigger'
        },
        position: { x: 0, y: 0 }
    });
    nodeMap.set(triggerId, { x: 0, y: 0 });

    // Add AI Nodes
    aiResponse.nodes.forEach((aiNode, index) => {
        const x = 0; // Default vertical layout
        const y = VERTICAL_SPACING * (index + 1);

        nodes.push({
            id: aiNode.id,
            type: 'custom',
            data: {
                label: aiNode.type.toUpperCase(),
                description: aiNode.config.text || aiNode.config.message || aiNode.type,
                icon: '⚡',
                aiConfig: aiNode.config
            },
            position: { x, y }
        });
        nodeMap.set(aiNode.id, { x, y });
    });

    // Add Edges
    // First edge from trigger to first node if exists
    if (aiResponse.nodes.length > 0) {
        edges.push({
            id: `edge-${triggerId}-${aiResponse.nodes[0].id}`,
            source: triggerId,
            target: aiResponse.nodes[0].id,
            animated: true,
            style: { stroke: '#25D366' }
        });
    }

    aiResponse.edges.forEach((aiEdge, index) => {
        edges.push({
            id: `ai-edge-${index}`,
            source: aiEdge.from,
            target: aiEdge.to,
            label: aiEdge.condition,
            animated: true,
            labelStyle: { fill: '#6b7280', fontWeight: 'bold', fontSize: '10px' },
            labelBgStyle: { fill: '#f9fafb', fillOpacity: 0.8 },
            labelBgPadding: [4, 2],
            labelBgBorderRadius: 4,
        });
    });

    // Basic layout adjustment: if multiple edges target same node, or a node has multiple outgoing
    // we could use a better algorithm, but this is a starting point.

    return { nodes, edges };
};
