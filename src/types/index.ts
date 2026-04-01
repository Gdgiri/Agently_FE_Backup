
export type Section =
    | 'overview'
    | 'setup'
    | 'templates'
    | 'catalogue'
    | 'flow'
    | 'logs'
    | 'campaign'
    | 'contacts'
    | 'webhook'
    | 'settings'
    | 'inbox'
    | 'orders'
    | 'appointments';

// --- AUTH & TENANCY ---
export interface User {
    id: string;
    name: string;
    email: string;
    role: 'ADMIN' | 'MANAGER' | 'AGENT';
    tenantId?: string;
    avatar?: string;
}

export interface Tenant {
    id: string;
    name: string;
    logo?: string;
    plan: 'FREE' | 'GROWTH' | 'ENTERPRISE';
    status: 'ACTIVE' | 'SUSPENDED';
    wabaId?: string;
    phoneNumberId?: string;
    accessToken?: string;
    verifyToken?: string;
    instagramPageId?: string;
    instagramAccessToken?: string;
    instagramVerifyToken?: string;
    instagramBusinessId?: string;
    facebookPageId?: string;
    facebookAccessToken?: string;
    facebookVerifyToken?: string;
    telegramBotToken?: string;
    telegramBotUsername?: string;
    emailAddress?: string;
    emailImapHost?: string;
    emailImapPort?: number;
    emailSmtpHost?: string;
    emailSmtpPort?: number;
    emailUser?: string;
    emailPassword?: string;
    country: string;
    currency: string;
    catalogueIds?: string[] | any;
    geminiApiKey?: string;
    geminiModel?: string;
    useAppointments?: boolean;
    requiresBookingAdvance?: boolean;
    bookingAdvanceAmount?: number;
    requiresOrderAdvance?: boolean;
    orderAdvanceAmount?: number;
    paymentInstructions?: string;
    razorpayEnabled?: boolean;
    razorpayKeyId?: string;
    razorpayKeySecret?: string;
    stripeEnabled?: boolean;
    stripeSecretKey?: string;
    stripeWebhookSecret?: string;
}

// --- CHAT & MESSAGING ---
export type MessageType = 'text' | 'image' | 'video' | 'audio' | 'document' | 'template' | 'button' | 'list' | 'TEXT' | 'IMAGE' | 'VIDEO' | 'AUDIO' | 'DOCUMENT' | 'TEMPLATE' | 'BUTTON_REPLY' | 'INTERACTIVE_BUTTON' | 'INTERACTIVE_LIST';
export type MessageStatus = 'sending' | 'sent' | 'delivered' | 'read' | 'failed';

export interface Message {
    id: string;
    conversationId: string;
    text?: string;
    type: MessageType;
    direction: 'inbound' | 'outbound';
    status: MessageStatus;
    timestamp: string;
    senderName?: string;
    mediaUrl?: string;
    templateName?: string;
    interactiveData?: any; // For buttons, lists etc
    channel?: 'WHATSAPP' | 'INSTAGRAM' | 'FACEBOOK' | 'TELEGRAM' | 'EMAIL';
    aiIntents?: string[]; // New: For AI reasoning badges
}

export interface Conversation {
    id: string;
    contactId: string;
    contact: Contact;
    messages: Message[];
    lastMessage?: Message;
    unreadCount: number;
    assignedTo?: string; // User ID
    tags: string[];
    status: 'open' | 'pending' | 'resolved' | 'spam';
    channel: 'WHATSAPP' | 'INSTAGRAM' | 'FACEBOOK' | 'TELEGRAM' | 'EMAIL';
    updatedAt: string;
    matchedProduct?: Product; // New: For active product context
}

// --- CONTACTS ---
export interface Contact {
    id: string;
    phoneNumber: string;
    phone?: string; // Compatibility with backend transform
    name?: string;
    email?: string;
    company?: string;
    avatar?: string;
    profilePicUrl?: string;
    instagramId?: string;
    channel?: 'WHATSAPP' | 'INSTAGRAM' | 'FACEBOOK' | 'TELEGRAM' | 'EMAIL';
    sourceCampaign?: { name: string; key?: string };
    serviceInterest?: string;
    interestPrice?: string;
    leadStage?: string;
    assignedStaff?: { name: string; avatar?: string };
    tags: string[];
    customFields: Record<string, string>;
    createdAt: string;
}

export interface Tag {
    id: string;
    name: string;
    color: string;
    contactCount: number;
}

// --- TEMPLATES ---
export type TemplateStatus = 'DRAFT' | 'SUBMITTED' | 'APPROVED' | 'REJECTED';
export type TemplateCategory = 'MARKETING' | 'UTILITY' | 'AUTHENTICATION';

export interface Template {
    id: string;
    name: string;
    category: TemplateCategory;
    language: string;
    status: TemplateStatus;
    components: any[];
    lastUpdated: string;
    usageCount: number;
    variables?: string[];
}

// --- FLOW BUILDER ---
export interface Flow {
    id: string;
    name: string;
    description?: string;
    status: 'active' | 'draft' | 'inactive';
    trigger: string;
    nodes: any[]; // React Flow nodes
    edges: any[]; // React Flow edges
    version: number;
    updatedAt: string;
}

// --- ECOMMERCE & APPOINTMENTS ---
export interface Category {
    id: string;
    name: string;
    type?: string;
    tenantId: string;
    _count?: {
        products: number;
    }
}

export interface Order {
    id: string;
    orderNumber: string;
    contactId: string;
    contactName: string;
    total: number;
    currency: string;
    status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
    items: Array<{ id: string; name: string; quantity: number; price: number }>;
    createdAt: string;
}

export interface Product {
    id: string;
    title: string;
    price: string | number;
    description?: string;
    status: string;
    lastSyncedAt?: string;
    imageUrl?: string;
    category?: string;
    currency?: string;
    brand?: string;
    condition?: string;
    metaId?: string;
    link?: string;
    location?: string;
    agent?: string;
    categoryId?: string;
    categoryRef?: Category;
    metadata?: Record<string, any>;
    documents?: Array<{ id: string; name: string; size: string; createdAt: string }>;
}

export interface Appointment {
    id: string;
    contactId: string;
    contactName: string;
    staffId: string;
    staffName: string;
    serviceName: string;
    startTime: string;
    endTime: string;
    status: 'scheduled' | 'confirmed' | 'completed' | 'cancelled';
    notes?: string;
}

// --- ANALYTICS ---
export interface AnalyticsSnapshot {
    sent: number;
    delivered: number;
    read: number;
    replied: number;
    revenue: number;
    appointments: number;
}

export interface Campaign {
    id: string;
    name: string;
    templateId: string;
    status: string;
    scheduledAt?: string;
    completedAt?: string;
    totalSent: number;
    totalFailed: number;
    totalDelivered: number;
    totalRead: number;
    tenantId: string;
    templateParams?: string[];
    triggerKeywords?: string;
    serviceInterest?: string;
    createdAt: string;
    recipients?: CampaignRecipient[];
    _count?: {
        recipients: number;
    };
}

export interface CampaignRecipient {
    id: string;
    campaignId: string;
    contactId: string;
    contact?: Contact;
    status: string;
    sentAt?: string;
    deliveredAt?: string;
    readAt?: string;
    metaMessageId?: string;
    errorMessage?: string;
}

export interface WebhookRecord {
    id: string;
    timestamp: string;
    event: string;
    direction: string;
    status: number;
    latency: string;
    payload: string;
}

export interface WebhookConfig {
    id: string;
    url: string;
    description: string;
    events: string[];
    active: boolean;
    secret: string;
}

export interface CreditPackage {
    id: string;
    name: string;
    credits: number;
    price: number;
    popular?: boolean;
}

export interface CreditConsumption {
    id: string;
    date: string;
    description: string;
    type: string;
    amount: number;
}

// Backwards compatibility for Property if needed during refactor, but we prefer Product
export type Property = Product;
