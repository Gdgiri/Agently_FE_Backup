import {
    MessageSquare, Image as ImageIcon, FileText, Link,
    Zap, Activity, Database, Split, Clock, XCircle,
    ArrowRightCircle, CheckSquare, List, Circle,
    MousePointerClick, Video, Music
} from 'lucide-react';

export type NodeCategory = 'action' | 'interaction' | 'flow' | 'trigger';

export interface NodeSubtype {
    type: string;
    label: string;
    icon: any;
    category: NodeCategory;
    description: string;
    defaultData: any;
}

export const NODE_REGISTRY: Record<string, NodeSubtype> = {
    // TRIGGER
    'trigger': {
        type: 'trigger',
        label: 'Trigger',
        icon: Zap,
        category: 'trigger',
        description: 'Start your flow with an event',
        defaultData: { type: 'trigger', triggerMode: 'keyword', keyword: '' }
    },

    // ACTIONS (Consolidated & Specialized - all in 'action' now)
    'bot_simple': {
        type: 'bot_simple',
        label: 'Simple Bot Reply',
        icon: MessageSquare,
        category: 'action',
        description: 'Send a plain text message',
        defaultData: {
            type: 'action',
            actionType: 'text',
            messageText: '',
            label: 'Simple Reply',
            showHeader: false,
            showFooter: false,
            showButtons: false
        }
    },
    'bot_media': {
        type: 'bot_media',
        label: 'Media Bot Reply',
        icon: ImageIcon,
        category: 'action',
        description: 'Send Image, Video or Document',
        defaultData: {
            type: 'action',
            actionType: 'media',
            headerType: 'IMAGE',
            mediaUrl: '',
            caption: '',
            label: 'Media Reply',
            showHeader: true,
            showFooter: false,
            showButtons: false
        }
    },
    'bot_interactive': {
        type: 'bot_interactive',
        label: 'Interactive Bot Reply',
        icon: MousePointerClick,
        category: 'action',
        description: 'Buttons, CTA or List menus (All-in-one)',
        defaultData: {
            type: 'interaction',
            interactionType: 'BUTTONS',
            headerType: 'NONE',
            messageText: '',
            footerText: '',
            buttons: [{ id: '1', title: 'Option 1' }],
            sections: [{ title: 'Main Menu', rows: [{ id: '1', title: 'Option 1', description: '' }] }],
            ctaLabel: 'Visit Website',
            ctaUrl: '',
            selectionStyle: 'RADIO',
            indexStyle: 'NUMBER',
            label: 'Interactive Reply',
            showHeader: true,
            showFooter: true,
            showButtons: true
        }
    },
    'bot_template': {
        type: 'bot_template',
        label: 'Template Bot Reply',
        icon: Zap,
        category: 'action',
        description: 'Meta approved templates',
        defaultData: {
            type: 'action',
            actionType: 'template',
            templateName: '',
            languageCode: 'en',
            components: [],
            label: 'Template Reply'
        }
    },
    'action_email': {
        type: 'action_email',
        label: 'Email Reply',
        icon: FileText,
        category: 'action',
        description: 'Send an automated email response',
        defaultData: {
            type: 'action',
            actionType: 'email',
            subject: 'Re: {{last_subject}}',
            messageText: '',
            label: 'Email Reply'
        }
    },

    // UTILITY ACTIONS
    'action_webhook': {
        type: 'action_webhook',
        label: 'Webhook Call',
        icon: Database,
        category: 'action',
        description: 'Push data to an external API',
        defaultData: { type: 'action', actionType: 'webhook', url: '', method: 'POST' }
    },

    // FLOW CONTROL
    'flow_condition': {
        type: 'flow_condition',
        label: 'Condition',
        icon: Split,
        category: 'flow',
        description: 'Branch based on if/else logic',
        defaultData: { type: 'flow', flowType: 'condition', conditions: [] }
    },
    'flow_delay': {
        type: 'flow_delay',
        label: 'Delay',
        icon: Clock,
        category: 'flow',
        description: 'Pause for a set time',
        defaultData: { type: 'flow', flowType: 'delay', delaySeconds: 5 }
    },
    'flow_goto': {
        type: 'flow_goto',
        label: 'Go-To Node',
        icon: ArrowRightCircle,
        category: 'flow',
        description: 'Jump to another step',
        defaultData: { type: 'flow', flowType: 'goto', targetId: '' }
    }
};

export const CATEGORY_CONFIG = {
    'trigger': { color: 'green', hex: '#25D366', label: 'Trigger' },
    'action': { color: 'orange', hex: '#F59E0B', label: 'Action' },
    'interaction': { color: 'blue', hex: '#3B82F6', label: 'Interaction' },
    'flow': { color: 'purple', hex: '#8B5CF6', label: 'Flow' },
    'bot': { color: 'green', hex: '#10B981', label: 'Bot Reply' }
};
