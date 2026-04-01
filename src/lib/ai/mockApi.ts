
import { AIFlowResponse, AITemplateResponse, AIRuleResponse, AIChatAssistResponse } from './schemaValidators';

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const mockGenerateFlow = async (prompt: string): Promise<AIFlowResponse> => {
    await sleep(2000); // Simulate network delay

    // Return a structured response based on the prompt
    return {
        trigger: {
            type: "INBOUND_MESSAGE",
            config: { keyword: "HELP" }
        },
        nodes: [
            { id: 'n1', type: 'message', config: { text: "Hello! How can I help you today?" } },
            { id: 'n2', type: 'choice', config: { text: "What are you looking for?", options: ["Support", "Sales", "Other"] } },
            { id: 'n3', type: 'message', config: { text: "Connecting you to support..." } },
        ],
        edges: [
            { from: 'n1', to: 'n2' },
            { from: 'n2', to: 'n3', condition: "Support" },
        ]
    };
};

export const mockGenerateTemplate = async (prompt: string): Promise<AITemplateResponse> => {
    await sleep(1500);
    return {
        name: "ai_generated_template",
        category: "MARKETING",
        language: "en_US",
        header: { type: "TEXT", content: "Special Offer!" },
        body: "Hi {{name}}, thanks for your interest in our services. Use code {{code}} for 20% off your next order!",
        footer: "Valid until end of month",
        buttons: [
            { type: "URL", text: "Shop Now", value: "https://example.com" }
        ]
    };
};

export const mockGenerateRule = async (prompt: string): Promise<AIRuleResponse> => {
    await sleep(1000);
    return {
        trigger: "ORDER_CREATED",
        condition: {
            field: "order_value",
            operator: ">",
            value: 5000
        },
        actions: [
            { type: "ADD_TAG", value: "Premium" }
        ]
    };
};

export const mockChatAssist = async (message: string): Promise<AIChatAssistResponse> => {
    await sleep(800);
    return {
        suggestion: "I'd be happy to help you with that. Can you please provide your order number?"
    };
};
