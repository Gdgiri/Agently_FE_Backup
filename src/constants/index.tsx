
import React from 'react';
import {
    LayoutDashboard,
    Settings2,
    MessageSquare,
    FileText,
    ShoppingBag,
    History,
    BarChart3,
    Users,
    Webhook,
    Workflow
} from 'lucide-react';
import { Product, Conversation, Contact, Campaign, WebhookRecord, WebhookConfig, Flow, CreditPackage, CreditConsumption } from '../types';

export const COLORS = {
    whatsapp: '#25D366',
    primary: '#25D366',
    border: '#e5e7eb',
    bg: '#f9fafb',
};

export const MENU_ITEMS = [
    { id: 'overview', label: 'Overview', icon: <LayoutDashboard size={20} />, path: '/' },
    { id: 'setup', label: 'WhatsApp Setup', icon: <Settings2 size={20} />, path: '/setup' },
    { id: 'templates', label: 'Templates', icon: <FileText size={20} />, path: '/templates' },
    { id: 'flow', label: 'Flows', icon: <Workflow size={20} />, path: '/flows' },
    { id: 'catalogue', label: 'Catalogue Sync', icon: <ShoppingBag size={20} />, path: '/catalogue' },
    { id: 'logs', label: 'Message Logs', icon: <History size={20} />, path: '/messages' },
    { id: 'campaign', label: 'Campaigns', icon: <BarChart3 size={20} />, path: '/campaigns' },
    { id: 'contacts', label: 'Contacts', icon: <Users size={20} />, path: '/contacts' },
    { id: 'webhook', label: 'Webhook & API', icon: <Webhook size={20} />, path: '/webhook' },
    { id: 'lead-intelligence', label: 'Lead Intelligence', icon: <Workflow size={20} />, path: '/lead-intelligence' },
    { id: 'settings', label: 'Settings', icon: <MessageSquare size={20} />, path: '/settings' },
];

export const MOCK_FLOWS: Flow[] = [
    { id: 'f1', name: 'Lead Qualification Bot', trigger: 'Keyword: "Interested"', status: 'active', version: 1, updatedAt: new Date().toISOString(), nodes: [], edges: [] },
    { id: 'f2', name: 'Viewing Scheduler', trigger: 'Button Click', status: 'active', version: 1, updatedAt: new Date().toISOString(), nodes: [], edges: [] },
    { id: 'f3', name: 'Customer Support Routing', trigger: 'Default Fallback', status: 'inactive', version: 1, updatedAt: new Date().toISOString(), nodes: [], edges: [] },
    { id: 'f4', name: 'Nurture Sequence A', trigger: 'API Call', status: 'draft', version: 1, updatedAt: new Date().toISOString(), nodes: [], edges: [] },
];

export const MOCK_CREDIT_PACKAGES: CreditPackage[] = [
    { id: 'p1', name: 'Starter', credits: 1000, price: 15 },
    { id: 'p2', name: 'Growth', credits: 5000, price: 65, popular: true },
    { id: 'p3', name: 'Pro', credits: 25000, price: 300 },
];

export const MOCK_CREDIT_CONSUMPTION: CreditConsumption[] = [
    { id: 'c1', date: '2023-11-24 10:30', description: 'Winter Expo Campaign (Sent to 1,200)', type: 'Marketing', amount: 72.00 },
    { id: 'c2', date: '2023-11-24 11:15', description: 'User Registration OTPs', type: 'Utility', amount: 0.45 },
    { id: 'c3', date: '2023-11-23 09:00', description: 'Customer Support Inbound Sessions', type: 'Service', amount: 4.20 },
    { id: 'c4', date: '2023-11-22 14:00', description: 'New Listing Alert: Downtown Loft', type: 'Marketing', amount: 27.00 },
    { id: 'c5', date: '2023-11-21 16:45', description: 'Monthly Free Tier Allowance', type: 'Free', amount: 0.00 },
];

export const MOCK_WEBHOOK_RECORDS: WebhookRecord[] = [
    { id: 'wh1', timestamp: '2023-11-24 14:20:05', event: 'messages.received', direction: 'Inbound', status: 200, latency: '124ms', payload: '{\n  "object": "whatsapp_business_account",\n  "entry": [{\n    "id": "1092837465",\n    "changes": [{\n      "value": {\n        "messaging_product": "whatsapp",\n        "metadata": { "display_phone_number": "15550123456", "phone_number_id": "1029384756" },\n        "contacts": [{ "profile": { "name": "John Doe" }, "wa_id": "12345678901" }],\n        "messages": [{ "from": "12345678901", "id": "wamid.HBgLMTIzNDU2Nzg5MDE...", "timestamp": "1700832005", "text": { "body": "Hello!" }, "type": "text" }]\n      },\n      "field": "messages"\n    }]\n  }]\n}' },
    { id: 'wh2', timestamp: '2023-11-24 14:18:12', event: 'messages.sent', direction: 'Outbound', status: 200, latency: '340ms', payload: '{\n  "messaging_product": "whatsapp",\n  "to": "12345678901",\n  "type": "text",\n  "text": { "body": "Thank you for reaching out!" }\n}' },
];

export const MOCK_WEBHOOK_CONFIGS: WebhookConfig[] = [
    { id: 'cfg1', url: 'https://crm.agently.com/webhooks/whatsapp', description: 'Main CRM Integration', events: ['messages.received', 'messages.sent'], active: true, secret: 'whsec_29384756...' },
    { id: 'cfg2', url: 'https://analytics.internal.io/ingest', description: 'Internal Data Warehouse', events: ['messages.delivery', 'messages.read'], active: false, secret: 'whsec_10293847...' }
];

export const MOCK_CONTACTS: Contact[] = [
    {
        id: 'u1',
        phone: '+1 234 567 8901',
        name: 'John Doe',
        email: 'john.doe@example.com',
        company: 'Sunset Properties',
        tags: ['Hot Lead', 'Investor'],
        customFields: { 'Property Interest': 'Sunset Villa' },
        createdAt: new Date().toISOString()
    },
    {
        id: 'u2',
        phone: '+1 987 654 3210',
        name: 'Sarah Smith',
        email: 'sarah.smith@realestate.com',
        company: 'Sarah Sells',
        tags: ['Viewing Scheduled'],
        customFields: {},
        createdAt: new Date().toISOString()
    }
];

export const MOCK_CONVERSATIONS: Conversation[] = [
    {
        id: 'c1',
        contactId: 'u1',
        unreadCount: 1,
        contact: MOCK_CONTACTS[0],
        tags: ['Hot Lead'],
        status: 'open',
        updatedAt: new Date().toISOString(),
        messages: [
            { id: 'm1', conversationId: 'c1', text: 'Hello! Thank you for your interest in Sunset Villa.', timestamp: '10:30 AM', direction: 'outbound', status: 'read', type: 'template' },
            { id: 'm2', conversationId: 'c1', text: 'Yes, I would like to schedule a viewing.', timestamp: '10:45 AM', direction: 'inbound', status: 'read', type: 'text' },
        ]
    }
];


export const MOCK_PRODUCTS: Product[] = [
    { id: '1', title: 'Wireless Earbuds', price: '$89.00', status: 'Active', category: 'Electronics', lastSynced: '2 mins ago', imageUrl: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=800&auto=format&fit=crop' },
    { id: '2', title: 'Running Shoes', price: '$120.00', status: 'Active', category: 'Apparel', lastSynced: '1 hour ago', imageUrl: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&auto=format&fit=crop' },
    { id: '3', title: 'Organic Coffee Beans', price: '$18.50', status: 'Active', category: 'Food & Drink', lastSynced: '5 hours ago', imageUrl: 'https://images.unsplash.com/photo-1497935586351-b67a49e012bf?w=800&auto=format&fit=crop' },
];
