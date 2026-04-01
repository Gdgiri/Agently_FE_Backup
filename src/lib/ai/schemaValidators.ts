
import { z } from 'zod';

// --- Flow Generator Schema ---
export const AIFlowResponseSchema = z.object({
    trigger: z.object({
        type: z.enum(["INBOUND_MESSAGE", "ORDER_CREATED", "APPOINTMENT_CREATED", "TAG_ADDED", "SCHEDULE"]),
        config: z.any().optional(),
    }),
    nodes: z.array(z.object({
        id: z.string(),
        type: z.string(),
        config: z.record(z.string(), z.any()),
    })),
    edges: z.array(z.object({
        from: z.string(),
        to: z.string(),
        condition: z.string().optional(),
    })),
});

export type AIFlowResponse = z.infer<typeof AIFlowResponseSchema>;

// --- Template Generator Schema ---
export const AITemplateResponseSchema = z.object({
    name: z.string(),
    category: z.enum(["MARKETING", "UTILITY", "AUTHENTICATION"]),
    language: z.string(),
    header: z.object({
        type: z.enum(["TEXT", "IMAGE", "VIDEO"]),
        content: z.string(),
    }).optional(),
    body: z.string(),
    footer: z.string().optional(),
    buttons: z.array(z.object({
        type: z.enum(["QUICK_REPLY", "URL", "PHONE"]),
        text: z.string(),
        value: z.string().optional(),
    })).optional(),
});

export type AITemplateResponse = z.infer<typeof AITemplateResponseSchema>;

// --- Rule Generator Schema ---
export const AIRuleResponseSchema = z.object({
    trigger: z.enum(["INBOUND_MESSAGE", "ORDER_CREATED", "APPOINTMENT_CREATED", "TAG_ADDED"]),
    condition: z.object({
        field: z.string(),
        operator: z.string(),
        value: z.any(),
    }).optional(),
    actions: z.array(z.object({
        type: z.string(),
        value: z.any(),
    })),
});

export type AIRuleResponse = z.infer<typeof AIRuleResponseSchema>;

// --- Chat Suggestion Schema ---
export const AIChatAssistResponseSchema = z.object({
    suggestion: z.string(),
});

export type AIChatAssistResponse = z.infer<typeof AIChatAssistResponseSchema>;
